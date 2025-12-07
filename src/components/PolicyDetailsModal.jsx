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
  // Avoid setting anchor hrefs to prevent speculative browser prefetching.
  // Compute URLs on demand when user clicks.
  const makeViewUrl = () => (canFile ? getFileViewUrl(policyBucketId, fileId) : null)
  const makeDownloadUrl = () => (canFile ? getFileDownloadUrl(policyBucketId, fileId) : null)

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
  <div className="absolute inset-y-0 right-0 w-full max-w-[16rem] md:max-w-[18rem] lg:max-w-[20rem] bg-white dark:bg-brand-card shadow-2xl overflow-y-auto transition-all duration-300 animate-theme rounded-l-xl">
        <div className={`h-1 w-full bg-gradient-to-r ${accent.grad} bg-lg-gradient animate-gradient`} />
  <div className="p-2 md:p-2">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-brand-text transition-colors">Policy Details</h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-brand-hover border border-gray-200 dark:border-brand-border text-gray-700 dark:text-brand-text">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16.5 4.5 19.5 7.5M18 6l-4.5 4.5M8.25 7.5h7.5M8.25 12h3.75M8.25 16.5h7.5"/></svg>
              {policy?.Registration_Number}
            </span>
          </div>
          <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={onClose} aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-gray-700 dark:text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="space-y-1">
          {row('Registration Number', policy.Registration_Number)}
          {row('Customer Name', policy.Customer_name)}
          {row('Contact', policy.Contact)}
          <div className="grid grid-cols-3 gap-2 py-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">LOPV</div>
            <div className="col-span-2"><LopvBadge value={policy.LOPV} /></div>
          </div>
          {row('Reference', policy.Reference)}
          {row('Remark', policy.Remark)}
          {row('Created', policy.$createdAt ? new Date(policy.$createdAt).toLocaleDateString() : '')}
          {policy.$updatedAt ? row('Updated', new Date(policy.$updatedAt).toLocaleDateString()) : null}
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-brand-text">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2zm3 4h7M7 8h2m0 4h7M7 12h2m0 4h7M7 16h2"/></svg>
              Policy PDF
            </span>
            {!policyBucketId && (
              <span className="text-xs text-red-600">Missing POLICY_BUCKET_ID</span>
            )}
          </div>
          {canFile ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const url = makeViewUrl()
                  if (url) window.open(url, '_blank', 'noopener,noreferrer')
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >Open</button>
              <button
                type="button"
                onClick={() => {
                  const url = makeDownloadUrl()
                  if (url) window.open(url, '_blank', 'noopener,noreferrer')
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >Download</button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard?.writeText(policy?.Registration_Number || '')
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                  } catch {}
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-brand-border hover:bg-gray-100 dark:hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-gray-300"
              >{copied ? 'Copied' : 'Copy RC'}</button>
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
