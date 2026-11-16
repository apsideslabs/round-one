import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

export function Progress({ value, className, barClassName }: { value: number; className?: string; barClassName?: string }) {
  return (
    <ProgressPrimitive.Root
      value={value}
      className={cn('h-2.5 w-full overflow-hidden rounded-full border-2 border-ink bg-[#f2f0e8]', className)}
    >
      <ProgressPrimitive.Indicator
        className={cn('h-full bg-ink transition-[width] duration-500', barClassName)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </ProgressPrimitive.Root>
  )
}
