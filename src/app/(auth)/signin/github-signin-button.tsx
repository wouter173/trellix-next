'use client'
import { SpinnerButton } from '@/components/button'
import { useFormStatus } from 'react-dom'

export const GithubSigninButton = () => {
  const { pending } = useFormStatus()

  return (
    <SpinnerButton disabled={pending} pending={pending}>
      Sign in with GitHub
    </SpinnerButton>
  )
}
