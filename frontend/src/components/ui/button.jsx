import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-9 px-4',
        lg: 'h-10 px-5',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
)

export const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
})
Button.displayName = 'Button'


