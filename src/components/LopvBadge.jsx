import { getLopvStyle, formatAmount } from '../utils/lopv'

export default function LopvBadge({ value, animated = true, prefix = '' }) {
  const s = getLopvStyle(value)
  // Ensure consistent alignment in table cells: compact width, tabular figures
  const cls = `${s.bg} ${s.text} inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${s.ring} ${animated ? 'transition transform' : ''}`
  const amountLabel = `${prefix}${formatAmount(value)}`
  return (
    <span className={cls} title={amountLabel} style={{ minWidth: '3.75rem', fontVariantNumeric: 'tabular-nums' }}>
      <span className={`w-1.5 h-1.5 rounded-full ${animated ? 'animate-pulse' : ''} ${s.text.replace('text', 'bg')}`} />
      {amountLabel}
    </span>
  )
}
