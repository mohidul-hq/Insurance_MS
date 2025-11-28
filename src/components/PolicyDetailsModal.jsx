import { useState } from 'react'
import { getFileViewUrl, getFileDownloadUrl, getDocFileId, formatDateTime } from '../services/policies'
import LopvBadge from './LopvBadge'
import { getLopvStyle } from '../utils/lopv'

export default function PolicyDetailsModal({ open, onClose, policy, policyBucketId }) {
  if (!open || !policy) return null
  const accent = getLopvStyle(policy.LOPV)
  const [copied, setCopied] = useState(false)

  const row = (label, value) => (
    <div className="grid grid-cols-3 gap-2 py-2">
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      <div className="col-span-2 text-sm text-gray-800 dark:text-brand-text break-words">{value || '-'}</div>
    </div>
  )

  const fileId = getDocFileId(policy)
  const canFile = Boolean(fileId && policyBucketId)
  const viewUrl = canFile ? getFileViewUrl(policyBucketId, fileId) : null
  const downloadUrl = canFile ? getFileDownloadUrl(policyBucketId, fileId) : null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
  <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white dark:bg-brand-card shadow-xl overflow-y-auto transition-colors animate-theme">
        <div className={`h-1 w-full bg-gradient-to-r ${accent.grad} bg-lg-gradient animate-gradient`} />
        <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-brand-text transition-colors">Policy Details</h3>
          <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={onClose} aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-gray-700 dark:text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div>
          {row('Registration Number', policy.Registration_Number)}
          {row('Customer Name', policy.Customer_name)}
          {row('Contact', policy.Contact)}
          <div className="grid grid-cols-3 gap-2 py-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">LOPV</div>
            <div className="col-span-2"><LopvBadge value={policy.LOPV} /></div>
          </div>
          {row('Reference', policy.Reference)}
          {row('Remark', policy.Remark)}
          {row('Created', policy.$createdAt && formatDateTime(policy.$createdAt))}
          {policy.$updatedAt ? row('Updated', formatDateTime(policy.$updatedAt)) : null}
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-brand-text">Policy PDF</span>
            {!policyBucketId && (
              <span className="text-xs text-red-600">Missing POLICY_BUCKET_ID</span>
            )}
          </div>
          {canFile ? (
            <div className="flex flex-wrap items-center gap-2">
              <a href={viewUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-500">Open</a>
              <a href={downloadUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-500">Download</a>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard?.writeText(fileId)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                  } catch {}
                }}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-brand-border hover:bg-gray-100 dark:hover:bg-brand-hover"
              >{copied ? 'Copied' : 'Copy ID'}</button>
              <div className="text-xs text-gray-600 dark:text-brand-muted break-all">{fileId}</div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-brand-muted">Not uploaded</div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
