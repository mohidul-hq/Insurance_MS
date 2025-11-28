import { useEffect, useMemo, useState } from 'react'
import { config } from '../lib/appwriteClient'
import { getPolicies, formatDateTime } from '../services/policies'

export default function Dashboard({ onOpenList, onOpenCreate, onOpenLookup }) {
  const [stats, setStats] = useState({ total: 0, latest: null })
  const [loading, setLoading] = useState(true)
  const bucketId = useMemo(() => config.POLICY_BUCKET_ID, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        // Fetch minimal page to get total and latest document
        const res = await getPolicies({ limit: 1, offset: 0 })
        const latest = res.documents?.[0] || null
        if (mounted) setStats({ total: res.total || 0, latest })
      } catch (e) {
        if (mounted) setStats({ total: 0, latest: null })
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <div className="relative rounded-xl shadow">
      <div className="absolute inset-x-0 -top-0.5 h-1 rounded-t-xl bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-500 bg-lg-gradient animate-gradient" />
      <div className="card rounded-xl p-6 animate-theme">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 transition-colors">Dashboard</h2>
          <div className="flex gap-2">
            <button onClick={onOpenList} className="px-3 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-brand-hover">View Policies</button>
            <button onClick={onOpenCreate} className="px-3 py-2 bg-brand-emerald text-white rounded-lg hover:brightness-110">Add Policy</button>
            <button onClick={onOpenLookup} className="px-3 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-brand-hover">Find Policy</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-brand-hover border border-gray-200 dark:border-brand-border">
            <div className="text-sm text-gray-500 dark:text-brand-muted">Total Policies</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-brand-text mt-1">{loading ? '—' : stats.total}</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-brand-hover border border-gray-200 dark:border-brand-border">
            <div className="text-sm text-gray-500 dark:text-brand-muted">Latest Policy</div>
            {loading ? (
              <div className="text-sm text-gray-700 dark:text-brand-text mt-1">Loading…</div>
            ) : stats.latest ? (
              <div className="mt-1 space-y-0.5 text-sm">
                <div className="text-gray-800 dark:text-brand-text font-medium">{stats.latest.Registration_Number}</div>
                <div className="text-gray-600 dark:text-brand-muted">{formatDateTime(stats.latest.$createdAt)}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-700 dark:text-brand-text mt-1">No data</div>
            )}
          </div>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-brand-hover border border-gray-200 dark:border-brand-border">
            <div className="text-sm text-gray-500 dark:text-brand-muted">Policy PDF Storage</div>
            {bucketId ? (
              <div className="mt-2 space-y-1 text-sm text-gray-700 dark:text-brand-text">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300">PDF only</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 ring-1 ring-amber-300">Max 500KB</span>
                </div>
                <div className="text-xs text-gray-600 dark:text-brand-muted">Use "Find Policy" to open or replace PDFs quickly.</div>
                <div className="mt-2 flex gap-2">
                  <button onClick={onOpenLookup} className="px-3 py-1.5 text-xs rounded border border-gray-300 dark:border-brand-border hover:bg-gray-100 dark:hover:bg-brand-hover">Find Policy</button>
                  <button onClick={onOpenList} className="px-3 py-1.5 text-xs rounded border border-gray-300 dark:border-brand-border hover:bg-gray-100 dark:hover:bg-brand-hover">View All</button>
                </div>
              </div>
            ) : (
              <div className="mt-1 text-sm text-red-600">Missing POLICY_BUCKET_ID</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
