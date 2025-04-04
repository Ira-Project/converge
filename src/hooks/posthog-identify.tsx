// src/hooks/posthog-identify.tsx
'use client'

import { useEffect, Suspense } from "react"

import posthog from 'posthog-js'

function PostHogUserIdentify({ id, email, name, role }: { id: string, email: string, name: string, role: string }) {
  useEffect(() => {
    if(!posthog.get_distinct_id() || posthog.get_distinct_id() !== id) {
      posthog.identify(id, {
        email,
        name,
        role,
      })
    }
  }, [])

  return (
    null
  )
}


// Wrap PostHogPageView in Suspense to avoid the useSearchParams usage above
// from de-opting the whole app into client-side rendering
// See: https://nextjs.org/docs/messages/deopted-into-client-rendering
export function SuspendedPostHogUserIdentify({ id, email, name, role }: { id: string, email: string, name: string, role: string }) {
  return (
    <Suspense fallback={null}>
      <PostHogUserIdentify id={id} email={email} name={name} role={role} />
    </Suspense>
  )
}