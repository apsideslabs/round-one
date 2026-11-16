import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from '@/pages/Home'

describe('home screen', () => {
  it('lists every round', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )
    // a round can appear twice: once as the next action, once in the list
    for (const name of ['Logic & aptitude', 'Verbal & English', 'Memory & recall', 'Riddles & traps', 'The panel', 'Moral development']) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0)
    }
  })

  it('leads with a single next action and a plan', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )
    expect(screen.getByText(/Start here|Continue/)).toBeInTheDocument()
    expect(screen.getByText('Today’s plan')).toBeInTheDocument()
  })

  it('shows a readiness dial', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )
    expect(screen.getByLabelText(/readiness/i)).toBeInTheDocument()
  })
})
