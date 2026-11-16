import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Chip({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('chip', className)} {...props} />
}
