/** Illustrated cast: ink outlines, flat fills, halftone shading, real expressions. */
export type Mood = 'neutral' | 'smile' | 'frown' | 'bored' | 'impressed' | 'sceptical'

export function Defs() {
  return (
    <defs>
      <pattern id="halftone" width="7" height="7" patternUnits="userSpaceOnUse">
        <circle cx="1.8" cy="1.8" r="1.15" fill="#12151a" opacity="0.30" />
      </pattern>
      <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
        <line x1="0" y1="0" x2="0" y2="6" stroke="#12151a" strokeWidth="1.1" opacity="0.35" />
      </pattern>
      <pattern id="wood" width="18" height="8" patternUnits="userSpaceOnUse">
        <path d="M0 4 q 4.5 -3 9 0 q 4.5 3 9 0" fill="none" stroke="#8a6b14" strokeWidth="1" opacity="0.5" />
      </pattern>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f4f1e6" />
        <stop offset="100%" stopColor="#e4dfd0" />
      </linearGradient>
      <linearGradient id="light" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fff8d8" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#fff8d8" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="vignette" cx="50%" cy="45%" r="72%">
        <stop offset="55%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#12151a" stopOpacity="0.22" />
      </radialGradient>
      <filter id="soft">
        <feGaussianBlur stdDeviation="2.4" />
      </filter>
    </defs>
  )
}

function Brows({ mood, y }: { mood: Mood; y: number }) {
  const paths: Record<Mood, [string, string]> = {
    neutral: [`M -20 ${y} q 8 -3 16 0`, `M 4 ${y} q 8 -3 16 0`],
    smile: [`M -20 ${y - 1} q 8 -5 16 -1`, `M 4 ${y - 1} q 8 -4 16 1`],
    frown: [`M -20 ${y + 3} q 8 -7 16 -2`, `M 4 ${y + 1} q 8 -5 16 2`],
    bored: [`M -20 ${y + 1} q 8 1 16 1`, `M 4 ${y + 1} q 8 0 16 1`],
    impressed: [`M -21 ${y - 4} q 9 -6 17 -1`, `M 3 ${y - 5} q 9 -5 17 1`],
    sceptical: [`M -20 ${y + 2} q 8 -6 16 -1`, `M 4 ${y + 4} q 8 -2 16 0`]
  }
  return (
    <g stroke="#12151a" strokeWidth="2.6" strokeLinecap="round" fill="none">
      <path d={paths[mood][0]} />
      <path d={paths[mood][1]} />
    </g>
  )
}

function Eyes({ mood, lookX = 0 }: { mood: Mood; lookX?: number }) {
  if (mood === 'bored') {
    return (
      <g stroke="#12151a" strokeWidth="2.8" strokeLinecap="round">
        <path d="M -20 44 q 7 4 14 0" fill="none" />
        <path d="M 6 44 q 7 4 14 0" fill="none" />
      </g>
    )
  }
  const r = mood === 'impressed' ? 5.4 : 4.4
  return (
    <g>
      <ellipse cx={-13} cy={44} rx={7} ry={mood === 'impressed' ? 6.4 : 5.2} fill="#fffcf5" stroke="#12151a" strokeWidth="2" />
      <ellipse cx={13} cy={44} rx={7} ry={mood === 'impressed' ? 6.4 : 5.2} fill="#fffcf5" stroke="#12151a" strokeWidth="2" />
      <circle cx={-13 + lookX} cy={44} r={r} fill="#12151a" />
      <circle cx={13 + lookX} cy={44} r={r} fill="#12151a" />
      <circle cx={-13 + lookX - 1.4} cy={42.4} r="1.4" fill="#fffcf5" />
      <circle cx={13 + lookX - 1.4} cy={42.4} r="1.4" fill="#fffcf5" />
    </g>
  )
}

function Mouth({ mood }: { mood: Mood }) {
  const d: Record<Mood, string> = {
    neutral: 'M -8 66 q 8 3 16 0',
    smile: 'M -10 64 q 10 10 20 0',
    frown: 'M -9 70 q 9 -8 18 0',
    bored: 'M -7 67 q 7 -1 14 0',
    impressed: 'M -10 63 q 10 13 20 0',
    sceptical: 'M -9 67 q 5 4 9 -1 q 4 -4 9 1'
  }
  return <path d={d[mood]} fill="none" stroke="#12151a" strokeWidth="2.6" strokeLinecap="round" />
}

export interface PersonProps {
  x: number
  y: number
  scale?: number
  skin: string
  skinShade?: string
  hair: string
  shirt: string
  collar?: string
  mood: Mood
  hairStyle?: 'short' | 'bun' | 'curly' | 'bald'
  glasses?: boolean
  beard?: boolean
  lookX?: number
  sweat?: boolean
}

export function Person({
  x, y, scale = 1, skin, skinShade, hair, shirt, collar = '#fffcf5',
  mood, hairStyle = 'short', glasses, beard, lookX = 0, sweat
}: PersonProps) {
  const shade = skinShade ?? skin
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* torso + collar */}
      <path d="M -52 124 q 52 -52 104 0 l 0 46 l -104 0 Z" fill={shirt} stroke="#12151a" strokeWidth="3.6" />
      <path d="M -18 100 l 18 18 l 18 -18 l 6 6 l -24 24 l -24 -24 Z" fill={collar} stroke="#12151a" strokeWidth="2.4" />
      <path d="M -52 124 q 52 -52 104 0" fill="none" stroke="rgba(18,21,26,0.25)" strokeWidth="2" />
      {/* neck */}
      <rect x="-12" y="76" width="24" height="28" fill={shade} stroke="#12151a" strokeWidth="3" />
      {/* head */}
      <ellipse cx="0" cy="46" rx="41" ry="45" fill={skin} stroke="#12151a" strokeWidth="3.6" />
      {/* cheek shading */}
      <path d="M 24 52 q 14 8 6 22 q -10 6 -14 -6 Z" fill={shade} opacity="0.55" />
      {/* ears */}
      <ellipse cx="-41" cy="48" rx="7" ry="10" fill={shade} stroke="#12151a" strokeWidth="2.6" />
      <ellipse cx="41" cy="48" rx="7" ry="10" fill={shade} stroke="#12151a" strokeWidth="2.6" />
      {/* hair */}
      {hairStyle === 'short' && (
        <path d="M -41 34 q 6 -38 41 -38 q 35 0 41 38 q -15 -18 -41 -18 q -26 0 -41 18 Z" fill={hair} stroke="#12151a" strokeWidth="3" />
      )}
      {hairStyle === 'bun' && (
        <g fill={hair} stroke="#12151a" strokeWidth="3">
          <path d="M -41 32 q 4 -36 41 -36 q 37 0 41 36 q -17 -16 -41 -16 q -24 0 -41 16 Z" />
          <circle cx="0" cy="-8" r="15" />
        </g>
      )}
      {hairStyle === 'curly' && (
        <g fill={hair} stroke="#12151a" strokeWidth="2.8">
          {[-31, -16, 0, 16, 31].map((dx, i) => (
            <circle key={dx} cx={dx} cy={2 + (i % 2) * 4} r="13" />
          ))}
        </g>
      )}
      {hairStyle === 'bald' && <path d="M -38 30 q 10 -24 38 -24 q 28 0 38 24" fill="none" stroke={hair} strokeWidth="5" />}

      <Brows mood={mood} y={30} />
      <Eyes mood={mood} lookX={lookX} />
      <Mouth mood={mood} />
      {/* nose */}
      <path d="M 0 52 q 3 6 -2 8" fill="none" stroke="rgba(18,21,26,0.45)" strokeWidth="2" strokeLinecap="round" />

      {beard && (
        <path d="M -30 56 q 8 30 30 30 q 22 0 30 -30 q -12 16 -30 16 q -18 0 -30 -16 Z" fill={hair} stroke="#12151a" strokeWidth="2.4" opacity="0.95" />
      )}

      {glasses && (
        <g fill="rgba(255,255,255,0.22)" stroke="#12151a" strokeWidth="2.8">
          <rect x="-26" y="34" width="22" height="18" rx="5" />
          <rect x="4" y="34" width="22" height="18" rx="5" />
          <line x1="-4" y1="43" x2="4" y2="43" />
          <line x1="-26" y1="41" x2="-41" y2="46" />
          <line x1="26" y1="41" x2="41" y2="46" />
        </g>
      )}

      {sweat && (
        <path d="M 34 22 q 6 10 0 14 q -6 -4 0 -14 Z" fill="#8fc7e8" stroke="#12151a" strokeWidth="1.8" />
      )}
    </g>
  )
}

export function Bubble({ x, y, text, tail = 'down' }: { x: number; y: number; text: string; tail?: 'down' | 'left' }) {
  const w = Math.max(150, text.length * 7.9 + 44)
  const h = 46
  return (
    <g>
      <rect x={x - w / 2} y={y} width={w} height={h} rx={14} fill="#fffcf5" stroke="#12151a" strokeWidth="3.2" />
      {tail === 'down' ? (
        <path d={`M ${x - 12} ${y + h} l 12 20 l 12 -20 Z`} fill="#fffcf5" stroke="#12151a" strokeWidth="3.2" />
      ) : (
        <path d={`M ${x - w / 2} ${y + h - 12} l -20 14 l 20 -2 Z`} fill="#fffcf5" stroke="#12151a" strokeWidth="3.2" />
      )}
      <text x={x} y={y + 29} textAnchor="middle" fontSize="14.5" fontWeight="800" fill="#12151a" fontFamily="Manrope, sans-serif">
        {text}
      </text>
    </g>
  )
}

export function Thought({ x, y, text }: { x: number; y: number; text: string }) {
  const w = Math.max(110, text.length * 7.3 + 42)
  return (
    <g>
      <circle cx={x - w / 2 + 8} cy={y + 34} r="4" fill="#fffcf5" stroke="#12151a" strokeWidth="2" />
      <circle cx={x - w / 2 + 18} cy={y + 26} r="6.5" fill="#fffcf5" stroke="#12151a" strokeWidth="2" />
      <path
        d={`M ${x - w / 2} ${y} q ${w / 2} -26 ${w} 0 q 16 26 -16 34 q ${-w / 2 + 14} 10 ${-w + 32} 0 q -28 -8 -16 -34 Z`}
        fill="#fffcf5"
        stroke="#12151a"
        strokeWidth="2.8"
        strokeDasharray="6 5"
      />
      <text x={x} y={y + 14} textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#12151a" fontFamily="JetBrains Mono, monospace">
        {text}
      </text>
    </g>
  )
}
