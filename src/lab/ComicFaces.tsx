/** Hand-drawn-ish SVG characters: ink outlines, flat fills, halftone shading. */
export type Mood = 'neutral' | 'smile' | 'frown' | 'bored' | 'impressed'

export function Halftone({ id }: { id: string }) {
  return (
    <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
      <circle cx="1.6" cy="1.6" r="1.1" fill="#12151a" opacity="0.35" />
    </pattern>
  )
}

function Eyes({ mood, x, y }: { mood: Mood; x: number; y: number }) {
  if (mood === 'bored') {
    return (
      <g stroke="#12151a" strokeWidth="2.4" strokeLinecap="round">
        <line x1={x - 12} y1={y} x2={x - 2} y2={y} />
        <line x1={x + 6} y1={y} x2={x + 16} y2={y} />
      </g>
    )
  }
  if (mood === 'impressed') {
    return (
      <g stroke="#12151a" strokeWidth="2.2">
        <circle cx={x - 7} cy={y} r="4.6" fill="#12151a" />
        <circle cx={x + 11} cy={y} r="4.6" fill="#12151a" />
        <path d={`M ${x - 14} ${y - 9} q 7 -5 14 -1`} fill="none" strokeLinecap="round" />
        <path d={`M ${x + 4} ${y - 10} q 7 -4 14 1`} fill="none" strokeLinecap="round" />
      </g>
    )
  }
  return (
    <g stroke="#12151a" strokeWidth="2.2">
      <circle cx={x - 7} cy={y} r="3.6" fill="#12151a" />
      <circle cx={x + 11} cy={y} r="3.6" fill="#12151a" />
    </g>
  )
}

function Mouth({ mood, x, y }: { mood: Mood; x: number; y: number }) {
  const paths: Record<Mood, string> = {
    neutral: `M ${x - 8} ${y} q 8 3 16 0`,
    smile: `M ${x - 10} ${y - 2} q 10 9 20 0`,
    frown: `M ${x - 9} ${y + 4} q 9 -8 18 0`,
    bored: `M ${x - 7} ${y + 2} q 7 -1 14 0`,
    impressed: `M ${x - 9} ${y - 1} q 9 11 18 0`
  }
  return <path d={paths[mood]} fill="none" stroke="#12151a" strokeWidth="2.4" strokeLinecap="round" />
}

export interface PersonProps {
  x: number
  y: number
  scale?: number
  skin: string
  hair: string
  shirt: string
  mood: Mood
  hairStyle?: 'short' | 'bun' | 'curly' | 'bald'
  glasses?: boolean
}

export function Person({ x, y, scale = 1, skin, hair, shirt, mood, hairStyle = 'short', glasses }: PersonProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* shoulders */}
      <path d="M -46 120 q 46 -46 92 0 l 0 40 l -92 0 Z" fill={shirt} stroke="#12151a" strokeWidth="3.5" />
      {/* neck */}
      <rect x="-11" y="78" width="22" height="24" fill={skin} stroke="#12151a" strokeWidth="3" />
      {/* head */}
      <ellipse cx="0" cy="46" rx="40" ry="44" fill={skin} stroke="#12151a" strokeWidth="3.5" />
      {/* hair */}
      {hairStyle === 'short' && <path d="M -40 34 q 6 -36 40 -36 q 34 0 40 36 q -14 -16 -40 -16 q -26 0 -40 16 Z" fill={hair} stroke="#12151a" strokeWidth="3" />}
      {hairStyle === 'bun' && (
        <g fill={hair} stroke="#12151a" strokeWidth="3">
          <path d="M -40 32 q 4 -34 40 -34 q 36 0 40 34 q -16 -14 -40 -14 q -24 0 -40 14 Z" />
          <circle cx="0" cy="-6" r="14" />
        </g>
      )}
      {hairStyle === 'curly' && (
        <g fill={hair} stroke="#12151a" strokeWidth="3">
          {[-30, -15, 0, 15, 30].map((dx) => (
            <circle key={dx} cx={dx} cy={2 + Math.abs(dx) * 0.12} r="13" />
          ))}
        </g>
      )}
      {hairStyle === 'bald' && <path d="M -38 30 q 10 -22 38 -22 q 28 0 38 22" fill="none" stroke={hair} strokeWidth="5" />}

      <Eyes mood={mood} x={0} y={44} />
      <Mouth mood={mood} x={0} y={66} />

      {glasses && (
        <g fill="none" stroke="#12151a" strokeWidth="2.6">
          <rect x="-24" y="34" width="20" height="16" rx="4" />
          <rect x="4" y="34" width="20" height="16" rx="4" />
          <line x1="-4" y1="42" x2="4" y2="42" />
        </g>
      )}
    </g>
  )
}

export function Thought({ x, y, children }: { x: number; y: number; children: string }) {
  const w = Math.max(96, children.length * 7.2 + 40)
  return (
    <g>
      <circle cx={x - 26} cy={y + 18} r="4" fill="#fffcf5" stroke="#12151a" strokeWidth="2" />
      <circle cx={x - 16} cy={y + 10} r="6" fill="#fffcf5" stroke="#12151a" strokeWidth="2" />
      <path
        d={`M ${x - w / 2} ${y - 20} q ${w / 2} -24 ${w} 0 q 14 24 -14 32 q ${-w / 2 + 12} 10 ${-w + 28} 0 q -26 -8 -14 -32 Z`}
        fill="#fffcf5"
        stroke="#12151a"
        strokeWidth="2.6"
        strokeDasharray="5 4"
      />
      <text x={x + 2} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#12151a" fontFamily="JetBrains Mono, monospace">
        {children}
      </text>
    </g>
  )
}

export function Bubble({ x, y, children, tail = 'left' }: { x: number; y: number; children: string; tail?: 'left' | 'right' }) {
  const w = Math.max(120, children.length * 7.4 + 34)
  const h = 40
  return (
    <g>
      <path
        d={`M ${x} ${y} h ${w} a 12 12 0 0 1 12 12 v ${h - 24} a 12 12 0 0 1 -12 12 h ${-w + 26} l -20 16 l 4 -16 h ${-10} a 12 12 0 0 1 -12 -12 v ${-(h - 24)} a 12 12 0 0 1 12 -12 Z`}
        fill="#fffcf5"
        stroke="#12151a"
        strokeWidth="3"
        transform={tail === 'right' ? `translate(${-w} 0)` : undefined}
      />
      <text x={x + 18} y={y + 26} fontSize="13" fontWeight="700" fill="#12151a" fontFamily="Manrope, sans-serif">
        {children}
      </text>
    </g>
  )
}
