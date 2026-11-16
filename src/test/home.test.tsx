import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from '@/pages/Home'

describe('home screen', () => {
  it('lists all four rounds', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )
    expect(screen.getByText('Logic & aptitude')).toBeInTheDocument()
    expect(screen.getByText('Memory & recall')).toBeInTheDocument()
    expect(screen.getByText('Riddles & traps')).toBeInTheDocument()
    expect(screen.getByText('The panel')).toBeInTheDocument()
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
