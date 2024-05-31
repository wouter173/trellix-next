import { validateRequest } from '@/lib/auth/api'
import { githubLoginAction } from './actions'
import { redirect } from 'next/navigation'

export default async function Page() {
  const { user } = await validateRequest()
  if (user) redirect('/')

  return (
    <div>
      <h1>Sign in</h1>
      <form action={githubLoginAction}>
        <button>Sign in with GitHub</button>
      </form>
    </div>
  )
}
