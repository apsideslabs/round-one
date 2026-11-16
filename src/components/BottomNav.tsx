import { NavLink } from 'react-router-dom'
import { BarChart3, Gamepad2, Home, LayoutGrid, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/logic', label: 'Logic', icon: BarChart3 },
  { to: '/arcade', label: 'Arcade', icon: Gamepad2 },
  { to: '/panel', label: 'Panel', icon: Users },
  { to: '/menu', label: 'Menu', icon: LayoutGrid }
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-card px-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5 md:hidden">
      <ul className="grid grid-cols-5 gap-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-ink-3',
                  isActive && 'bg-c1-soft text-ink [&_svg]:stroke-c1'
                )
              }
            >
              <Icon className="h-5 w-5" strokeWidth={2.2} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
