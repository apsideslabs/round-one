import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const pad = (n: number) => String(n).padStart(2, '0')

export const pct = (value: number, max: number) => (max === 0 ? 0 : Math.round((value / max) * 100))

export function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length
