import { lucia } from '@/lib/auth/lucia'
import { github } from '@/lib/auth/providers/github'
import { prisma } from '@/lib/db/prisma'
import { OAuth2RequestError } from 'arctic'
import { generateIdFromEntropySize } from 'lucia'
import { cookies } from 'next/headers'
import { z } from 'zod'

export async function GET(request: Request): Promise<Response> {
  const cookieStore = await cookies()

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const storedState = cookieStore.get('github_oauth_state')?.value ?? null
  cookieStore.set('github_oauth_state', '', { maxAge: 0 })

  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
    })
  }

  try {
    const tokens = await github.validateAuthorizationCode(code)
    const githubUserResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    })

    const githubUser = z
      .object({
        login: z.string(),
        id: z.number(),
      })
      .parse(await githubUserResponse.json())

    const existingUser = await prisma.user.findFirst({ where: { githubId: githubUser.id } })

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

      return new Response(null, { status: 302, headers: { Location: '/' } })
    }

    const userId = generateIdFromEntropySize(10) // 16 characters long

    await prisma.user.create({
      data: {
        id: userId,
        githubId: githubUser.id,
        username: githubUser.login,
      },
    })

    const session = await lucia.createSession(userId, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    return new Response(null, { status: 302, headers: { Location: '/' } })
  } catch (e) {
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      return new Response(null, { status: 400 }) // invalid code
    }

    console.error(e)
    return new Response(null, { status: 500 })
  }
}
