'use client'

import { useRouter } from 'next/navigation'

export default function DashboardNav() {
  const router = useRouter()

  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        marginBottom: 20,
        flexWrap: 'wrap',
      }}
    >
      <button
        onClick={() =>
          router.push('/dashboard')
        }
      >
        Leads
      </button>

      <button
        onClick={() =>
          router.push('/dashboard/pipeline')
        }
      >
        Pipeline
      </button>

      <button
        onClick={() =>
          router.push('/dashboard/analytics')
        }
      >
        Analytics
      </button>

      <button
        onClick={() =>
          router.push('/dashboard/ai-usage')
        }
      >
        AI Usage
      </button>

      <button
        onClick={() =>
            router.push('/dashboard/inbox')
        }
      >
        Inbox
      </button>

      <button
        onClick={() =>
          router.push('/dashboard/templates')
        }
      >
        Templates
      </button>
    </div>
  )
}