import { databases, storage, ID, Query, config } from '../lib/appwriteClient'

// File reference field (configurable via env to match your Appwrite attribute)
// Default: 'policyFileId' but you can set VITE_POLICY_FILE_FIELD to override
export const FILE_FIELD = import.meta.env.VITE_POLICY_FILE_FIELD || 'policyFileId'

// Known schema field names matching Appwrite collection
const ALLOWED_FIELDS = new Set([
  'Registration_Number',
  'Contact',
  'Customer_name',
  'LOPV',
  'Reference',
  'Remark',
  FILE_FIELD,
])

// Helper to build payload with STRICT whitelist (always on)
function buildPayload(raw) {
  const filtered = {}
  for (const [k, v] of Object.entries(raw || {})) {
    if (ALLOWED_FIELDS.has(k)) filtered[k] = typeof v === 'string' ? v : String(v ?? '')
  }
  return filtered
}

// Ensure required attributes are present and valid BEFORE network call
function ensureRequired(payload) {
  const required = ['Registration_Number', 'Customer_name', 'Contact']
  const missing = required.filter((k) => !payload[k] || String(payload[k]).trim().length === 0)
  if (missing.length) {
    const msg = `Missing required fields: ${missing.join(', ')}`
    throw new Error(msg)
  }
}

// Utilities
const PAGE_SIZE = 10

export function formatDateTime(iso) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch (e) {
    return iso
  }
}

export function getFileViewUrl(bucketId, fileId) {
  // Returns a URL that can be used to view the file in a new tab
  // Note: Storage.getFileView uses the SDK but building URL avoids extra calls
  const base = config.endpoint.replace(/\/$/, '')
  return `${base}/storage/buckets/${bucketId}/files/${fileId}/view?project=${config.projectId}`
}

export function getFileDownloadUrl(bucketId, fileId) {
  const base = config.endpoint.replace(/\/$/, '')
  return `${base}/storage/buckets/${bucketId}/files/${fileId}/download?project=${config.projectId}`
}

// Robustly read a file id from a policy document, handling legacy typos
export function getDocFileId(doc) {
  if (!doc) return null
  return (
    doc[FILE_FIELD] ??
    doc.policyFileId ??
    // Handle legacy typo 'policyFileld'
    doc.policyFileld ??
    null
  )
}

export async function getPolicies({ search = '', filter = '', limit = PAGE_SIZE, offset = 0 } = {}) {
  // Base queries
  const base = [Query.limit(limit), Query.offset(offset), Query.orderDesc('$createdAt')]
  if (filter) base.push(Query.equal('LOPV', filter))

  // Attempt server-side fulltext search first
  if (search) {
    try {
      const q = [...base, Query.search('Registration_Number', search)]
      const res = await databases.listDocuments(config.databaseId, config.collectionId, q)
      return { documents: res.documents, total: res.total, serverSearch: true }
    } catch (err) {
      // Fallback if fulltext index is missing or search not supported
      if (import.meta.env.VITE_DEBUG_POLICY === 'true') {
        console.warn('[getPolicies] search fallback due to:', err?.message)
      }
    }
  }

  // Fallback: fetch page without search, then filter locally across common fields
  const res = await databases.listDocuments(config.databaseId, config.collectionId, base)
  let documents = res.documents
  if (search) {
    const s = search.toLowerCase()
    documents = documents.filter((d) =>
      [d.Registration_Number, d.Customer_name, d.Contact, d.Reference, d.Remark]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s))
    )
  }
  return { documents, total: res.total, serverSearch: false }
}

export async function uploadPolicyPdf(file, registrationNumber) {
  if (!file) return null
  // Validate type and size (<= 500 KB)
  if (file.type !== 'application/pdf') {
    throw new Error('Invalid file type. Only PDF is allowed')
  }
  const MAX_BYTES = 500 * 1024
  if (file.size > MAX_BYTES) {
    throw new Error('File too large. Max 500 KB')
  }
  if (!config.POLICY_BUCKET_ID || String(config.POLICY_BUCKET_ID).trim().length === 0) {
    throw new Error('Missing POLICY_BUCKET_ID. Set VITE_POLICY_BUCKET_ID in your .env')
  }
  // Rename file using registration number (sanitized) if available
  try {
    const reg = (registrationNumber || '').toString().trim()
    if (reg) {
      let base = reg.toUpperCase().replace(/[^A-Z0-9]+/g, '_')
      base = base.replace(/^_+|_+$/g, '').slice(0, 50) || 'POLICY'
      const newName = base + '.pdf'
      if (file.name !== newName) {
        file = new File([file], newName, { type: file.type })
      }
    }
  } catch (e) {
    // Non-fatal: keep original name if rename fails
    if (import.meta.env.VITE_DEBUG_POLICY === 'true') {
      console.warn('[uploadPolicyPdf] rename skipped:', e?.message)
    }
  }
  const created = await storage.createFile(config.POLICY_BUCKET_ID, ID.unique(), file)
  return created.$id
}

export async function createPolicy(data, files = {}) {
  const payload = buildPayload(data)
  // Defensive: ensure any stray typo is removed
  if ('policyFileld' in payload) delete payload.policyFileld
  // Validate required fields align with Appwrite schema
  ensureRequired(payload)
  let uploadError = null
  if (files.policyFile) {
    try {
      if (!config.POLICY_BUCKET_ID || String(config.POLICY_BUCKET_ID).trim().length === 0) {
        throw new Error('Missing POLICY_BUCKET_ID. Set VITE_POLICY_BUCKET_ID in your .env')
      }
      payload[FILE_FIELD] = await uploadPolicyPdf(files.policyFile, payload.Registration_Number)
    } catch (e) {
      uploadError = e
      delete payload[FILE_FIELD]
    }
  }
  if (import.meta.env.VITE_DEBUG_POLICY === 'true') {
    console.log('[createPolicy] raw data keys:', Object.keys(data || {}))
    console.log('[createPolicy] payload:', payload)
  }
  try {
    const doc = await databases.createDocument(config.databaseId, config.collectionId, ID.unique(), payload)
    return { doc, uploadError, suppressedFileLink: false }
  } catch (e) {
    // If backend rejects an unknown file id attribute, retry without it (handles both 'policyFileId' and 'policyFileld')
    const msg = String(e?.message || '')
    const isUnknownAttr = /Unknown attribute/i.test(msg)
    const mentionsPolicyFile = /policyFileI[d|l]d/i.test(msg) || /policyFile/i.test(msg)
    if (isUnknownAttr && mentionsPolicyFile && (FILE_FIELD in payload || 'policyFileld' in payload)) {
      delete payload[FILE_FIELD]
      delete payload.policyFileld
      try {
        const doc = await databases.createDocument(config.databaseId, config.collectionId, ID.unique(), payload)
        if (import.meta.env.VITE_DEBUG_POLICY === 'true') {
          console.warn('[createPolicy] Retried without file id due to unknown attribute. Stored document without link to file.')
        }
        return { doc, uploadError, suppressedFileLink: true }
      } catch (e2) {
        console.error('[createPolicy] Retry failed:', { message: e2?.message, code: e2?.code, response: e2?.response })
        throw e2
      }
    }
    // Log full error details to aid diagnosis
    console.error('[createPolicy] Appwrite error:', { message: e?.message, code: e?.code, response: e?.response })
    throw e
  }
}

export async function updatePolicy(id, data, files = {}) {
  const payload = buildPayload(data)
  if ('policyFileld' in payload) delete payload.policyFileld
  ensureRequired(payload)
  let uploadError = null
  if (files.policyFile) {
    try {
      if (!config.POLICY_BUCKET_ID || String(config.POLICY_BUCKET_ID).trim().length === 0) {
        throw new Error('Missing POLICY_BUCKET_ID. Set VITE_POLICY_BUCKET_ID in your .env')
      }
      payload[FILE_FIELD] = await uploadPolicyPdf(files.policyFile, payload.Registration_Number)
    } catch (e) {
      uploadError = e
      delete payload[FILE_FIELD]
    }
  }
  if (import.meta.env.VITE_DEBUG_POLICY === 'true') {
    console.log('[updatePolicy] raw data keys:', Object.keys(data || {}))
    console.log('[updatePolicy] payload:', payload)
  }
  try {
    const doc = await databases.updateDocument(config.databaseId, config.collectionId, id, payload)
    if (files.currentPolicyFileId && payload[FILE_FIELD]) {
      try { await storage.deleteFile(config.POLICY_BUCKET_ID, files.currentPolicyFileId) } catch {}
    }
    return { doc, uploadError, suppressedFileLink: false }
  } catch (e) {
    const msg = String(e?.message || '')
    const isUnknownAttr = /Unknown attribute/i.test(msg)
    const mentionsPolicyFile = /policyFileI[d|l]d/i.test(msg) || /policyFile/i.test(msg)
    if (isUnknownAttr && mentionsPolicyFile && (FILE_FIELD in payload || 'policyFileld' in payload)) {
      delete payload[FILE_FIELD]
      delete payload.policyFileld
      const doc = await databases.updateDocument(config.databaseId, config.collectionId, id, payload)
      return { doc, uploadError, suppressedFileLink: true }
    }
    console.error('[updatePolicy] Appwrite error:', { message: e?.message, code: e?.code, response: e?.response })
    throw e
  }
}

export async function deletePolicy(id, fileMeta = {}) {
  const fileId = fileMeta[FILE_FIELD] || fileMeta.policyFileId || fileMeta.policyFileld
  if (fileId && config.POLICY_BUCKET_ID) {
    try { await storage.deleteFile(config.POLICY_BUCKET_ID, fileId) } catch {}
  }
  await databases.deleteDocument(config.databaseId, config.collectionId, id)
}

// Read helpers
export async function getPolicyById(id) {
  return await databases.getDocument(config.databaseId, config.collectionId, id)
}

export async function findPoliciesByRegistration(registrationNumber) {
  const q = [
    Query.equal('Registration_Number', registrationNumber),
    Query.limit(10),
    Query.orderDesc('$createdAt'),
  ]
  const res = await databases.listDocuments(config.databaseId, config.collectionId, q)
  return res.documents
}
