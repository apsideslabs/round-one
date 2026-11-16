import type { Cell, Shape } from '@/lib/matrix'

function pathFor(shape: Shape, size: number) {
  const s = size
  switch (shape) {
    case 'circle':
      return <circle cx={0} cy={0} r={s / 2} />
    case 'square':
      return <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={3} />
    case 'triangle':
      return <polygon points={`0,${-s / 2} ${s / 2},${s / 2} ${-s / 2},${s / 2}`} />
    case 'diamond':
      return <polygon points={`0,${-s / 2} ${s / 2},0 0,${s / 2} ${-s / 2},0`} />
    case 'hex':
      return (
        <polygon
          points={`${s / 2},0 ${s / 4},${-s / 2} ${-s / 4},${-s / 2} ${-s / 2},0 ${-s / 4},${s / 2} ${s / 4},${s / 2}`}
        />
      )
  }
}

/** One matrix cell: `count` copies of a shape, rotated, filled or hollow. */
export function MatrixCell({ cell, size = 96 }: { cell: Cell; size?: number }) {
  const glyph = size * 0.3
  const gap = glyph * 1.25
  const slots: Array<[number, number]> = [
    [0, 0],
    [-gap / 1.6, -gap / 2],
    [gap / 1.6, gap / 2]
  ]
  const offsets = cell.count === 1 ? [slots[0]] : cell.count === 2 ? [slots[1], slots[2]] : slots

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {offsets.map(([dx, dy], i) => (
        <g
          key={i}
          transform={`translate(${size / 2 + dx} ${size / 2 + dy}) rotate(${cell.rotation})`}
          fill={cell.filled ? '#12151a' : 'none'}
          stroke={cell.filled ? 'none' : '#12151a'}
          strokeWidth={cell.filled ? 0 : Math.max(2, glyph * 0.12)}
        >
          {pathFor(cell.shape, glyph)}
        </g>
      ))}
    </svg>
  )
}
