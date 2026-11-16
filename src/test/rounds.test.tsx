import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Dial } from '@/components/Dial'
import { RadarProfile } from '@/components/RadarProfile'
import { tracks } from '@/data/tracks'
import type { Scores } from '@/store/progress'

const scores = { logic: 80, verbal: 50, memory: 60, riddles: 40, panel: 30, morality: 70 } as Scores

describe('round geometry', () => {
  it('draws one dial arc per round, spread around the full circle', () => {
    const { container } = render(<Dial scores={scores} readiness={43} />)
    const arcs = container.querySelectorAll('circle[stroke-dasharray]')
    expect(arcs).toHaveLength(tracks.length)

    const angles = [...arcs].map((a) => Number((a.getAttribute('transform') ?? '').match(/rotate\(([-\d.]+)/)?.[1]))
    expect(new Set(angles).size).toBe(tracks.length)
    // arcs must be evenly spaced for however many rounds exist
    expect(angles[1] - angles[0]).toBeCloseTo(360 / tracks.length, 5)
  })

  it('lists every round under the dial', () => {
    render(<Dial scores={scores} readiness={43} />)
    for (const t of tracks) expect(screen.getAllByText(t.short).length).toBeGreaterThan(0)
  })

  it('labels every axis of the radar', () => {
    const { container } = render(<RadarProfile scores={scores} />)
    const labels = [...container.querySelectorAll('text')].map((t) => t.textContent)
    expect(labels).toHaveLength(tracks.length)
    expect(labels).toContain('MORALITY')
    expect(labels.every((l) => l && l !== 'undefined')).toBe(true)
  })

  it('keeps every round on the map', () => {
    render(
      <MemoryRouter>
        <Dial scores={scores} readiness={43} />
      </MemoryRouter>
    )
    expect(tracks.length).toBeGreaterThanOrEqual(5)
    expect(tracks.map((t) => t.no)).toEqual(tracks.map((_, i) => String(i + 1).padStart(2, '0')))
  })
})
