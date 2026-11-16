import { useState } from 'react'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  trackName: string
  colour: string
  score: number
  max: number
  correct: number
  total: number
}

/** Draws the result as a PNG in the app's own palette and downloads it. */
export function ShareCard({ trackName, colour, score, max, correct, total }: Props) {
  const [busy, setBusy] = useState(false)
  const pct = Math.round((score / max) * 100)

  const draw = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 900
    canvas.height = 1200
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#fffcf5'
    ctx.fillRect(0, 0, 900, 1200)

    // ink header
    ctx.fillStyle = '#12151a'
    ctx.fillRect(0, 0, 900, 340)
    ctx.fillStyle = colour
    ctx.fillRect(0, 336, 900, 14)

    ctx.fillStyle = '#ffffff'
    ctx.font = '800 62px "Bricolage Grotesque", sans-serif'
    ctx.fillText('Round', 64, 120)
    ctx.fillStyle = '#ff4b26'
    ctx.fillText('One', 250, 120)
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = '600 26px Manrope, sans-serif'
    ctx.fillText('interview trainer', 64, 168)

    ctx.fillStyle = '#f5b01b'
    ctx.font = '800 40px "Bricolage Grotesque", sans-serif'
    ctx.fillText(trackName, 64, 268)

    // score
    ctx.fillStyle = '#12151a'
    ctx.font = '800 220px "Bricolage Grotesque", sans-serif'
    ctx.fillText(`${pct}%`, 64, 620)
    ctx.fillStyle = '#6b727d'
    ctx.font = '600 28px Manrope, sans-serif'
    ctx.fillText(`${correct} of ${total} correct · ${score} points`, 64, 672)

    // bar
    const barY = 740
    ctx.fillStyle = '#e8e5dc'
    ctx.fillRect(64, barY, 772, 34)
    ctx.fillStyle = colour
    ctx.fillRect(64, barY, (772 * score) / max, 34)
    ctx.strokeStyle = '#12151a'
    ctx.lineWidth = 4
    ctx.strokeRect(64, barY, 772, 34)

    // footer
    ctx.fillStyle = '#6b727d'
    ctx.font = '700 24px "JetBrains Mono", monospace'
    ctx.fillText('ROUND ONE · SIX ROUNDS · SEVEN GAMES', 64, 1100)

    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `round-one-${pct}.png`
    a.click()
  }

  return (
    <Button
      variant="light"
      className="flex-1"
      onClick={() => {
        setBusy(true)
        try {
          draw()
        } finally {
          setBusy(false)
        }
      }}
    >
      <Share2 className="h-4 w-4" /> {busy ? 'Saved' : 'Share'}
    </Button>
  )
}
