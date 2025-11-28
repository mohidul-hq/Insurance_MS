import { useMemo, useState } from 'react'
import { config } from '../lib/appwriteClient'
import { findPoliciesByRegistration, getFileViewUrl, getFileDownloadUrl, getDocFileId } from '../services/policies'
import { updatePolicy } from '../services/policies'
import FileUpload from './FileUpload'
import { useToast } from './Toast'

export default function PolicyLookup() {
  const [reg, setReg] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [policy, setPolicy] = useState(null)
  const [replaceFile, setReplaceFile] = useState(null)
  const { push } = useToast()

  const bucketId = useMemo(() => config.POLICY_BUCKET_ID, [])

  const onSearch = async (e) => {
    e.preventDefault()
    setError('')
  setPolicy(null)
  setReplaceFile(null)
    const value = reg.trim()
    if (!value) { setError('Enter a registration number'); return }
    try {
      setLoading(true)
      const docs = await findPoliciesByRegistration(value)
      if (!docs.length) {
        setError('No matching policy found')
      } else {
        // Prefer the most recent (already ordered desc by createdAt)
        setPolicy(docs[0])
      }
    } catch (err) {
      console.error(err)
      setError('Failed to read policy. Check network and permissions.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card rounded-xl shadow animate-theme">
      <div className="p-4 border-b border-gray-200 dark:border-brand-border">
  <h2 className="text-lg font-semibold text-gray-800 dark:text-brand-text transition-colors">Find Policy PDF</h2>
  <p className="text-sm text-gray-600 dark:text-brand-muted">Search by Registration Number to view and manage its PDF.</p>
      </div>

      <form onSubmit={onSearch} className="p-4 flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-brand-muted">Registration Number</label>
          <input value={reg} onChange={(e) => setReg(e.target.value)} placeholder="AN01L8744" className="mt-1 w-full rounded-lg border border-gray-300 dark:border-brand-border bg-white dark:bg-brand-card text-gray-800 dark:text-brand-text px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button disabled={loading} className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-brand-hover disabled:opacity-50 transition-colors">{loading ? 'Searching...' : 'Search'}</button>
      </form>

      {error && (
        <div className="px-4 pb-4"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">{error}</div></div>
      )}

      {policy && (
        <div className="p-4 space-y-4">
          <div className="text-sm text-gray-700 dark:text-gray-300 flex flex-col gap-1">
            <div><span className="font-medium">Registration:</span> {policy.Registration_Number}</div>
            <div><span className="font-medium">Customer:</span> {policy.Customer_name || '-'}</div>
            <div><span className="font-medium">Contact:</span> {policy.Contact}</div>
            {/* Removed noisy debug JSON; replaced with compact ID + timestamps chunk */}
            <div className="mt-2 text-xs text-gray-600 dark:text-brand-muted flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-card/40 border border-brand-border">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16.5 4.5 19.5 7.5M18 6l-4.5 4.5M8.25 7.5h7.5M8.25 12h3.75M8.25 16.5h7.5"/></svg>
                ID: {policy.$id}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-card/40 border border-brand-border">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6l4 2"/></svg>
                Created: {policy.$createdAt && new Date(policy.$createdAt).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="border rounded-lg p-3 bg-gray-50 dark:bg-brand-hover">
            <h3 className="text-sm font-semibold mb-2 text-gray-800 dark:text-brand-text">Current Policy PDF</h3>
            {getDocFileId(policy) && bucketId ? (
              <div className="space-y-2">
                <div className="flex gap-3">
                  <a href={getFileViewUrl(bucketId, getDocFileId(policy))} target="_blank" className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-500">Open</a>
                  <a href={getFileDownloadUrl(bucketId, getDocFileId(policy))} target="_blank" className="px-3 py-1 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-500">Download</a>
                </div>
                <div className="text-xs text-gray-600 dark:text-brand-muted">File ID: {getDocFileId(policy)}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-600 dark:text-brand-muted">No PDF uploaded for this policy.</div>
            )}
          </div>
          <div className="border rounded-lg p-3 bg-gray-50 dark:bg-brand-hover">
            <h3 className="text-sm font-semibold mb-2 text-gray-800 dark:text-brand-text">Replace PDF</h3>
            <FileUpload label="New Policy PDF" type="pdf" value={replaceFile} onChange={setReplaceFile} />
            <div className="mt-2 flex gap-2">
              <button
                disabled={!replaceFile || loading}
                onClick={async () => {
                  if (!replaceFile || !policy) return
                  try {
                    setLoading(true)
                    const { suppressedFileLink, uploadError } = await updatePolicy(policy.$id, {
                      Registration_Number: policy.Registration_Number,
                      Customer_name: policy.Customer_name,
                      Contact: policy.Contact,
                      LOPV: policy.LOPV,
                      Reference: policy.Reference,
                      Remark: policy.Remark,
                    }, { policyFile: replaceFile, currentPolicyFileId: getDocFileId(policy) })
                    if (uploadError) {
                      push('Upload failed: ' + uploadError.message, { type: 'error' })
                    } else if (suppressedFileLink) {
                      push('File stored but link attribute missing in schema (add policyFileId attribute).', { type: 'error' })
                    } else {
                      push('Policy PDF replaced successfully')
                    }
                    // Refresh policy to reflect new file id
                    const refreshed = await findPoliciesByRegistration(policy.Registration_Number)
                    if (refreshed.length) setPolicy(refreshed[0])
                    setReplaceFile(null)
                  } catch (err) {
                    console.error(err)
                    push('Failed to replace PDF', { type: 'error' })
                  } finally {
                    setLoading(false)
                  }
                }}
                className="px-4 py-2 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
              >{loading ? 'Saving...' : 'Upload & Replace'}</button>
              <button
                disabled={!replaceFile || loading}
                onClick={() => setReplaceFile(null)}
                className="px-4 py-2 text-sm rounded border border-gray-300 dark:border-brand-border hover:bg-gray-100 dark:hover:bg-brand-hover disabled:opacity-50"
              >Clear</button>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-brand-muted">The file will be renamed to the registration number automatically.</p>
          </div>
        </div>
      )}
    </div>
  )
}
