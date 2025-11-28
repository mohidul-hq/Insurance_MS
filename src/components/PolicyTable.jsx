import { useEffect, useMemo, useState } from 'react'
import { deletePolicy, formatDateTime, getPolicies } from '../services/policies'
import LopvBadge from './LopvBadge'
import { useToast } from './Toast'

export default function PolicyTable({ onView, onEdit }) {
  const { push } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)
  const limit = 10

  const load = async ({ reset = false, offsetOverride } = {}) => {
    try {
      setLoading(true)
      const nextOffset = reset ? 0 : (offsetOverride ?? offset)
      const res = await getPolicies({ search, limit, offset: nextOffset })
      setTotal(res.total)
      if (reset) {
        setItems(res.documents)
        setOffset(0)
      } else {
        setItems((arr) => [...arr, ...res.documents])
        setOffset(nextOffset)
      }
    } catch (e) {
      console.error(e)
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => load({ reset: true, offsetOverride: 0 }), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const onDelete = async (item) => {
    const ok = confirm('Are you sure you want to delete this policy? This action cannot be undone.')
    if (!ok) return
    try {
      await deletePolicy(item.$id, { policyFileId: item.policyFileId })
      push('Policy deleted successfully')
      setItems((arr) => arr.filter((x) => x.$id !== item.$id))
    } catch (e) {
      console.error(e)
      push('Failed to delete policy', { type: 'error' })
    }
  }

  const hasMore = useMemo(() => items.length < total, [items.length, total])

  return (
    <div className="card rounded-xl shadow animate-theme">
      <div className="p-4 border-b border-gray-200 dark:border-brand-border flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="text-lg font-semibold text-gray-800 dark:text-brand-text transition-colors">All Policies</div>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-lg border border-gray-300 dark:border-brand-border bg-white dark:bg-brand-card text-gray-800 dark:text-brand-text placeholder-gray-400 dark:placeholder-brand-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search registration, name, contact..."
            title="Uses server search on Registration Number when available, otherwise filters current page"
          />
        </div>
      </div>

      {error && (
        <div className="p-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">{error} <button className="underline ml-2" onClick={() => load({ reset: true })}>Retry</button></div>
        </div>
      )}

      <div className="overflow-x-auto themed-scrollbar">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-brand-border table-surface">
          <thead className="bg-gray-50 dark:bg-brand-hover text-xs uppercase text-gray-500 dark:text-brand-muted">
            <tr>
              <th className="px-4 py-2 text-left">Registration Number</th>
              <th className="px-4 py-2 text-left">Customer Name</th>
              <th className="px-4 py-2 text-left">Contact</th>
              <th className="px-4 py-2 text-left">LOPV</th>
              <th className="px-4 py-2 text-left">Reference</th>
              <th className="px-4 py-2 text-left">Remark</th>
              <th className="px-4 py-2 text-left">Created</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-brand-border">
            {items.map((it) => (
              <tr key={it.$id} className="hover:bg-gray-50 dark:hover:bg-brand-hover transition-colors">
                <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-800 dark:text-gray-200">{it.Registration_Number}</td>
                <td className="px-4 py-2">{it.Customer_name || '-'}</td>
                <td className="px-4 py-2">{it.Contact}</td>
                <td className="px-4 py-2 text-right"><LopvBadge value={it.LOPV} /></td>
                <td className="px-4 py-2">{it.Reference || '-'}</td>
                <td className="px-4 py-2 max-w-[16rem] truncate text-gray-700 dark:text-brand-muted" title={it.Remark || ''}>{it.Remark || '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap">{formatDateTime(it.$createdAt)}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button className="px-2 py-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" onClick={() => onView(it)}>View</button>
                    <button className="px-2 py-1 text-brand-text hover:bg-gray-100 dark:hover:bg-brand-hover rounded transition-colors" onClick={() => onEdit(it)}>Edit</button>
                    <button className="px-2 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" onClick={() => onDelete(it)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 flex items-center justify-between">
  <div className="text-sm text-gray-600 dark:text-brand-muted">Showing {items.length} of {total}</div>
        {hasMore && (
          <button
            disabled={loading}
            onClick={() => {
              const next = offset + limit
              load({ offsetOverride: next })
            }}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-brand-hover disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading...' : 'Load more'}
          </button>
        )}
      </div>

      {loading && items.length === 0 && (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading policies...</div>
      )}
    </div>
  )
}
