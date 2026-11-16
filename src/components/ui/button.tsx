import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const button = cva('btn-pop', {
  variants: {
    variant: {
      solid: '',
      accent: 'bg-c1 text-white',
      light: 'bg-card text-ink',
      ghost: 'bg-transparent text-ink border-line shadow-none hover:shadow-none'
    },
    size: {
      md: '',
      sm: 'px-3.5 py-2 text-xs rounded-lg'
    }
  },
  defaultVariants: { variant: 'solid', size: 'md' }
})

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(button({ variant, size }), className)} {...props} />
}
