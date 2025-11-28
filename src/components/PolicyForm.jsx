import { useEffect, useMemo, useState } from 'react'
import FileUpload from './FileUpload'
import LopvBadge from './LopvBadge'
import { getLopvStyle } from '../utils/lopv'
import { createPolicy, updatePolicy } from '../services/policies'
import { useToast } from './Toast'

// LOPV stands for Last Original Policy Value

export default function PolicyForm({ initial, onCancel, onSaved }) {
  const { push } = useToast()
  const isEdit = Boolean(initial?.$id)

  const [form, setForm] = useState({
    Registration_Number: '',
    Contact: '',
    Customer_name: '',
     LOPV: '', // amount as string
    Reference: '',
    Remark: '',
  })

  const [policyFile, setPolicyFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initial) {
      setForm({
        Registration_Number: initial.Registration_Number || '',
        Contact: initial.Contact || '',
        Customer_name: initial.Customer_name || '',
         LOPV: initial.LOPV || '',
        Reference: initial.Reference || '',
        Remark: initial.Remark || '',
      })
    }
  }, [initial])

  const validate = useMemo(() => ({
    Registration_Number: (v) => v ? '' : 'Registration Number is required',
    Contact: (v) => {
      if (!v) return 'Contact is required'
      const digits = String(v).replace(/\D/g, '')
      if (digits.length < 10 || digits.length > 15) return 'Contact must be 10-15 digits'
      return ''
    },
  }), [])

  const runValidation = () => {
    const errs = {}
    for (const k of Object.keys(validate)) {
      const msg = validate[k](form[k])
      if (msg) errs[k] = msg
    }
     // Optional: enforce numeric LOPV if provided
     if (form.LOPV) {
       const valid = /^\d+(?:\.\d{1,2})?$/.test(form.LOPV)
       if (!valid) errs.LOPV = 'Enter a valid amount (numbers, optional decimals)'
       if (String(form.LOPV).length > 10) errs.LOPV = 'Amount too long (max 10 chars)'
     }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (validate[name]) setErrors((er) => ({ ...er, [name]: validate[name](value) }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!runValidation()) return
    setLoading(true)
    try {
      if (isEdit) {
        const { doc, uploadError, suppressedFileLink } = await updatePolicy(initial.$id, form, { policyFile })
        push('Policy updated successfully')
        if (uploadError) {
          const msg = (uploadError && uploadError.message) ? String(uploadError.message) : 'Policy updated, but PDF upload failed'
          push(msg.includes('Unauthorized') || msg.includes('authorized') ? 'PDF upload failed: not authorized (check Appwrite Storage permissions)' : `Warning: ${msg}`, { type: 'error' })
        }
        if (suppressedFileLink) {
          const field = import.meta.env.VITE_POLICY_FILE_FIELD || 'policyFileId'
          push(`File uploaded but ${field} not saved (add attribute "${field}" to collection then re-upload)`, { type: 'error' })
        }
      } else {
        const { doc, uploadError, suppressedFileLink } = await createPolicy(form, { policyFile })
        push('Policy created successfully')
        if (uploadError) {
          const msg = (uploadError && uploadError.message) ? String(uploadError.message) : 'Policy created, but PDF upload failed'
          push(msg.includes('Unauthorized') || msg.includes('authorized') ? 'PDF upload failed: not authorized (check Appwrite Storage permissions)' : `Warning: ${msg}`, { type: 'error' })
        }
        if (suppressedFileLink) {
          const field = import.meta.env.VITE_POLICY_FILE_FIELD || 'policyFileId'
          push(`File uploaded but ${field} not saved (add attribute "${field}" to collection then re-upload)`, { type: 'error' })
        }
      }
      onSaved?.()
    } catch (err) {
      console.error('Policy save failed:', err)
      const msg = (err && err.message) ? String(err.message) : 'Failed to save policy'
      push(msg.includes('Unauthorized') || msg.includes('authorized') ? 'Not authorized to save policy (check Appwrite auth/permissions)' : msg, { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const accent = getLopvStyle(form.LOPV)

  return (
    <div className="max-w-3xl mx-auto">
      <div className={`relative rounded-xl shadow ${form.LOPV ? 'animate-glow' : ''}`}
           style={{ boxShadow: form.LOPV ? undefined : undefined }}>
        {form.LOPV && (
          <div className={`absolute inset-x-0 -top-0.5 h-1 rounded-t-xl bg-gradient-to-r ${accent.grad} bg-lg-gradient animate-gradient`} />
        )}
        <div className="card rounded-xl p-6 animate-pop">
  <h2 className="text-lg font-semibold text-gray-800 dark:text-brand-text transition-colors mb-4">{isEdit ? 'Edit Policy' : 'Add New Policy'}</h2>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-brand-muted">Registration Number *</label>
            <input name="Registration_Number" value={form.Registration_Number} onChange={onChange} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="AN01L8744" />
            {errors.Registration_Number && <p className="text-sm text-red-600 mt-1">{errors.Registration_Number}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-brand-muted">Contact *</label>
            <input name="Contact" value={form.Contact} onChange={onChange} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Phone number" />
            {errors.Contact && <p className="text-sm text-red-600 mt-1">{errors.Contact}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-brand-muted">Customer Name</label>
            <input name="Customer_name" value={form.Customer_name} onChange={onChange} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Customer name" />
          </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-brand-muted">LOPV Amount (Last Original Policy Value)</label>
             <input
               name="LOPV"
               value={form.LOPV}
               onChange={onChange}
               inputMode="decimal"
               placeholder="e.g., 45000"
               className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
             />
             {errors.LOPV && <p className="text-sm text-red-600 mt-1">{errors.LOPV}</p>}
             <div className="mt-2"><LopvBadge value={form.LOPV} /></div>
           </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-brand-muted">Reference</label>
            <input name="Reference" value={form.Reference} onChange={onChange} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Reference" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-brand-muted">Remark</label>
            <textarea name="Remark" rows={3} value={form.Remark} onChange={onChange} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Remarks" />
          </div>

          <div className="md:col-span-2">
            <FileUpload label="Policy PDF" type="pdf" value={policyFile} onChange={setPolicyFile} helperText={(initial && (initial.policyFileId || initial.policyFileld)) ? 'Existing file present. Upload to replace.' : undefined} />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 dark:border-brand-border rounded-lg hover:bg-gray-100 dark:hover:bg-brand-hover transition-colors">Cancel</button>
            <button disabled={loading} className="px-4 py-2 bg-brand-emerald hover:brightness-110 text-white rounded-lg disabled:opacity-50 transition-colors">{loading ? 'Saving...' : (isEdit ? 'Update Policy' : 'Create Policy')}</button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
