// LOPV as Last Original Policy Value (amount)
// Map amount ranges to colorful styles

function parseAmount(value) {
  if (value == null) return 0
  const n = Number(String(value).replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

export function formatAmount(value) {
  const n = parseAmount(value)
  try {
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n)
  } catch {
    return String(n)
  }
}

export function getLopvStyle(value) {
  const amt = parseAmount(value)
  if (amt <= 25000) {
    return { bg: 'bg-emerald-100', text: 'text-emerald-800', ring: 'ring-emerald-300', grad: 'from-emerald-500 via-green-400 to-lime-500', shadow: 'shadow-emerald-200' }
  }
  if (amt <= 75000) {
    return { bg: 'bg-amber-100', text: 'text-amber-800', ring: 'ring-amber-300', grad: 'from-amber-500 via-orange-400 to-yellow-500', shadow: 'shadow-amber-200' }
  }
  return { bg: 'bg-rose-100', text: 'text-rose-800', ring: 'ring-rose-300', grad: 'from-rose-500 via-pink-400 to-fuchsia-500', shadow: 'shadow-rose-200' }
}
