'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'toast',
          description: 'toast-description',
          actionButton: 'toast-action',
          cancelButton: 'toast-cancel',
        },
      }}
    />
  )
}
