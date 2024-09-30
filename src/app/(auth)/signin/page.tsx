import { Card } from '@/app/card'
import { validateRequest } from '@/lib/auth/api'
import { redirect } from 'next/navigation'
import { githubLoginAction } from './actions'
import { GithubSigninButton } from './github-signin-button'

export default async function Page() {
  const { user } = await validateRequest()
  if (user) redirect('/')

  return (
    <div className="grid min-h-screen w-full place-items-center py-20">
      <div className="w-full max-w-md">
        <h1 className="mb-4 text-center text-3xl font-semibold text-gray-800">Trellix Next</h1>
        <Card>
          <div>
            <p className="text-gray-600">
              Trellix Next is a project heavily inspired by{' '}
              <a href="https://twitter.com/ryanflorence/status/1765179463497892117" className="underline hover:text-black">
                Ryan Florence's tweet
              </a>{' '}
              about building a optimistic kanban board. My goal is recreate the core functionality displayed in the{' '}
              <a href="https://trellix.fly.dev/" className="underline hover:text-black">
                original Trellix demo built in remix
              </a>{' '}
              using next with it's new server actions, server components and the useOptimistic api.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <form action={githubLoginAction}>
              <GithubSigninButton />
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
