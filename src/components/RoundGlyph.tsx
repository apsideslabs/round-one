import type { TrackId } from '@/data/tracks'

/**
 * A small animated motif per round, drawn in SVG and moved by CSS.
 * No sprite sheets, no images — just shapes and keyframes.
 */
export function RoundGlyph({ id, colour, size = 44 }: { id: TrackId; colour: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 44 44', 'aria-hidden': true as const }

  switch (id) {
    case 'logic':
      return (
        <svg {...common}>
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={8 + i * 11}
              width="7"
              rx="1.5"
              fill={colour}
              className="glyph-bar"
              style={{ animationDelay: `${i * 0.18}s` }}
              y={30}
              height={14}
            />
          ))}
        </svg>
      )
    case 'verbal':
      return (
        <svg {...common}>
          <rect x="9" y="12" width="26" height="20" rx="3" fill="none" stroke={colour} strokeWidth="2.4" className="glyph-flip" style={{ transformOrigin: '22px 22px' }} />
          <path d="M16 26l6-12 6 12M18.6 22h6.8" fill="none" stroke={colour} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      )
    case 'memory':
      return (
        <svg {...common}>
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={10 + i * 3}
              y={10 + i * 5}
              width="22"
              height="14"
              rx="2.5"
              fill="none"
              stroke={colour}
              strokeWidth="2.2"
              className="glyph-stack"
              style={{ animationDelay: `${i * 0.22}s` }}
            />
          ))}
        </svg>
      )
    case 'riddles':
      return (
        <svg {...common}>
          <path d="M16 17a6 6 0 116 6v4" fill="none" stroke={colour} strokeWidth="2.6" strokeLinecap="round" className="glyph-pulse" style={{ transformOrigin: '22px 20px' }} />
          <circle cx="22" cy="34" r="2.2" fill={colour} />
        </svg>
      )
    case 'panel':
      return (
        <svg {...common}>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={13 + i * 9} cy="22" r="4.2" fill={colour} className="glyph-bob" style={{ animationDelay: `${i * 0.16}s` }} />
          ))}
        </svg>
      )
    case 'morality':
      return (
        <svg {...common}>
          <g className="glyph-tilt" style={{ transformOrigin: '22px 18px' }}>
            <rect x="8" y="16" width="28" height="2.6" rx="1.3" fill={colour} />
            <circle cx="10" cy="24" r="3.4" fill="none" stroke={colour} strokeWidth="2" />
            <circle cx="34" cy="24" r="3.4" fill="none" stroke={colour} strokeWidth="2" />
          </g>
          <path d="M22 18v16M16 34h12" stroke={colour} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      )
  }
}
