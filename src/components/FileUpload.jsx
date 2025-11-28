import { useRef, useState } from 'react'

const KB = 1024

export default function FileUpload({
  label,
  maxKb = 500,
  value, // File | null
  onChange,
  helperText,
}) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const accept = '.pdf'

  const validate = (file) => {
    if (!file) return ''
    if (file.type !== 'application/pdf') return `Invalid file type. Allowed: ${accept}`
    if (file.size > maxKb * KB) return `File too large. Max ${maxKb}KB.`
    return ''
  }

  const onSelectOne = (file) => {
    const v = validate(file)
    setError(v)
    if (!v) onChange?.(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) onSelectOne(file)
  }

  const openPicker = () => inputRef.current?.click()

  const clear = () => {
    setError('')
    onChange?.(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-brand-muted mb-1">{label}</label>}
      <div
        className="border-2 border-dashed rounded-lg p-4 bg-gray-50 dark:bg-brand-card hover:bg-gray-100 dark:hover:bg-brand-hover border-gray-200 dark:border-brand-border transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        {!value ? (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-brand-muted">
              <p className="font-medium">Drag & drop or click to upload</p>
              <p className="text-xs">Allowed: {accept} • Max {maxKb}KB</p>
              {helperText && <p className="text-xs text-gray-500 dark:text-brand-muted mt-1">{helperText}</p>}
            </div>
            <button type="button" onClick={openPicker} className="px-3 py-2 bg-brand-emerald hover:brightness-110 text-white rounded-md">Browse file</button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 grid place-content-center rounded bg-white dark:bg-brand-card border border-gray-200 dark:border-brand-border"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-600 dark:text-brand-muted"><path d="M19.5 14.25v3.75A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75V5.25A2.25 2.25 0 016.75 3h5.25m4.5 0H12v6h6V6.75a3.75 3.75 0 00-3.75-3.75z"/></svg></div>
              <div>
                <div className="text-sm font-medium text-gray-800 dark:text-brand-text">{value.name}</div>
                <div className="text-xs text-gray-500 dark:text-brand-muted">{Math.round(value.size / KB)} KB</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={openPicker} className="px-2.5 py-1.5 border border-gray-200 dark:border-brand-border rounded-md hover:bg-gray-100 dark:hover:bg-brand-hover transition-colors">Change</button>
              <button type="button" onClick={clear} className="px-2.5 py-1.5 border border-gray-200 dark:border-brand-border rounded-md hover:bg-gray-100 dark:hover:bg-brand-hover transition-colors">Remove</button>
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            onSelectOne(files[0])
          }}
        />
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  )
}
