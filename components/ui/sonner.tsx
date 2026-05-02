'use client'

import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'var(--surface)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          color: 'var(--text-primary)',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
