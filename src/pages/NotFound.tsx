import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <span className="chip">404</span>
      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight">This page is not in the deck.</h1>
      <p className="mt-2 text-sm font-medium text-ink-2">The round you asked for does not exist — go back and pick one.</p>
      <Link to="/" className="btn-pop mt-6 inline-flex">
        Back to home
      </Link>
    </div>
  )
}
