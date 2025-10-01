import React from 'react'
import { cn } from '../../lib/utils'

export function Table({ className, ...props }) {
  return <table className={cn('w-full text-sm text-left', className)} {...props} />
}
export function THead({ className, ...props }) {
  return <thead className={cn('text-xs uppercase text-gray-500', className)} {...props} />
}
export function TR({ className, ...props }) {
  return <tr className={cn('border-b last:border-0', className)} {...props} />
}
export function TH({ className, ...props }) {
  return <th className={cn('px-3 py-2 font-medium', className)} {...props} />
}
export function TD({ className, ...props }) {
  return <td className={cn('px-3 py-2', className)} {...props} />
}


