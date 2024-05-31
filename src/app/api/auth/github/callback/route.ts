import { github } from '@/lib/auth/providers/github'
import { lucia } from '@/lib/auth/lucia'
import { cookies } from 'next/headers'
import { OAuth2RequestError } from 'arctic'
import { generateIdFromEntropySize } from 'lucia'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const storedState = cookies().get('github_oauth_state')?.value ?? null
  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
    })
  }

  try {
    const tokens = await github.validateAuthorizationCode(code)
    const githubUserResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    })

    const githubUser = z
      .object({
        login: z.string(),
        id: z.number(),
      })
      .parse(await githubUserResponse.json())

    const existingUser = await prisma.user.findFirst({ where: { github_id: githubUser.id } })

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      cookies().set('github_oauth_state', '', { maxAge: 0 })
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

      return new Response(null, { status: 302, headers: { Location: '/' } })
    }

    const userId = generateIdFromEntropySize(10) // 16 characters long

    await prisma.user.create({
      data: {
        id: userId,
        github_id: githubUser.id,
        username: githubUser.login,
      },
    })

    const session = await lucia.createSession(userId, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies().set('github_oauth_state', '', { maxAge: 0 })
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

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
