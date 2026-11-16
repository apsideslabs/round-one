import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Explanation } from '@/components/Explanation'

describe('explanation panel', () => {
  const props = {
    ok: false,
    points: 10,
    why: 'Three of the four are prime.',
    options: ['17', '23', '29', '35'],
    answerIndex: 3,
    chosenIndex: 0,
    steps: ['Test each number for factors.', '35 = 5 × 7, so it is composite.'],
    wrong: {
      0: '17 is prime — only 1 × 17.',
      1: '23 is prime.',
      2: '29 is prime.'
    },
    nextLabel: 'Next',
    onNext: () => {}
  }

  it('shows the verdict, the working and every option', () => {
    render(<Explanation {...props} />)
    expect(screen.getByText('Not quite')).toBeInTheDocument()
    expect(screen.getByText('The working')).toBeInTheDocument()
    expect(screen.getByText('Test each number for factors.')).toBeInTheDocument()
    expect(screen.getByText('Option by option')).toBeInTheDocument()
    expect(screen.getByText('answer')).toBeInTheDocument()
    expect(screen.getByText('you chose')).toBeInTheDocument()
    expect(screen.getByText('23 is prime.')).toBeInTheDocument()
  })

  it('still renders when a question has no breakdown', () => {
    render(<Explanation {...props} steps={undefined} wrong={undefined} />)
    expect(screen.getByText('Not quite')).toBeInTheDocument()
    expect(screen.queryByText('The working')).not.toBeInTheDocument()
  })
})
