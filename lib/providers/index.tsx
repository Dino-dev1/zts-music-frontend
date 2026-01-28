'use client'

import { Provider as JotaiProvider } from 'jotai'
import { Toaster } from 'react-hot-toast'
import type { ReactNode } from 'react'
import { QueryProvider } from './query-provider'
import { NuqsProvider } from './nuqs-provider'
import { AuthProvider } from './auth-provider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <JotaiProvider>
      <QueryProvider>
        <NuqsProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="bottom-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1c1c1f',
                  color: '#fafafa',
                  border: '1px solid #242428',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '14px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#1c1c1f',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#f43f5e',
                    secondary: '#1c1c1f',
                  },
                },
              }}
            />
          </AuthProvider>
        </NuqsProvider>
      </QueryProvider>
    </JotaiProvider>
  )
}

export { useAuth } from './auth-provider'
