'use client'
import { useState, useRef } from 'react'
import { batchUpload } from '@/lib/api'
import { Card, Badge, Button, PageHeader, Spinner, Alert } from '@/components/UI'
import { Upload, CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BatchUpload() {
  const [files,     setFiles]     = useState([])
  const [result,    setResult]    = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress,  setProgress]  = useState('')
  const inputRef = useRef()

  const handleFiles = (fileList) => {
    const pdfs = Array.from(fileList).filter(f => f.name.toLowerCase().endsWith('.pdf'))
    setFiles(pdfs); setResult(null)
  }

  const handleBatch = async () => {
    if (!files.length) return toast.error('Please select PDF files')
    setUploading(true); setProgress('Uploading files...')
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      setProgress(`Processing ${files.length} invoices with AI... This may take several minutes.`)
      const { data } = await batchUpload(fd)
      setResult(data)
      toast.success(`Done! ${data.saved?.length} saved, ${data.skipped?.length} skipped`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setUploading(false); setProgress('')
    }
  }

  return (
    <div className="max-w-4xl">
      <PageHeader title="Batch Upload" subtitle="Process multiple invoices automatically — no human input needed" />

      <Card title="Upload Multiple PDFs">
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
          className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
          <input ref={inputRef} type="file" accept=".pdf" multiple className="hidden"
            onChange={e => handleFiles(e.target.files)} />
          <Upload size={32} className="mx-auto mb-3 text-slate-400" />
          {files.length > 0
            ? <p className="text-sm font-medium text-blue-600">{files.length} PDF(s) selected</p>
            : <><p className="text-sm font-medium text-slate-600">Select multiple PDFs</p>
               <p className="text-xs text-slate-400 mt-1">Hold Ctrl to select multiple files</p></>}
        </div>

        {files.length > 0 && (
          <div className="mt-4">
            <div className="max-h-40 overflow-y-auto space-y-1 mb-4">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600 px-3 py-1.5 bg-slate-50 rounded-lg">
                  <FileText size={14} className="text-slate-400" />
                  {f.name}
                </div>
              ))}
            </div>
            <Button onClick={handleBatch} loading={uploading} size="lg">
              {uploading ? 'Processing...' : `Process ${files.length} Invoice(s)`}
            </Button>
          </div>
        )}

        {uploading && (
          <div className="mt-4 flex items-center gap-3 text-sm text-blue-600 bg-blue-50 px-4 py-3 rounded-lg">
            <Spinner size="sm" /> {progress}
          </div>
        )}
      </Card>

      {/* Results */}
      {result && (
        <div className="mt-6 space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label:'Total',      val: result.total,              color:'bg-slate-100 text-slate-700' },
              { label:'Saved',      val: result.saved?.length,      color:'bg-green-100 text-green-700' },
              { label:'Skipped',    val: result.skipped?.length,    color:'bg-yellow-100 text-yellow-700' },
              { label:'Duplicates', val: result.duplicates?.length, color:'bg-red-100 text-red-700' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
                <p className="text-2xl font-bold">{s.val || 0}</p>
                <p className="text-xs font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Saved list */}
          {result.saved?.length > 0 && (
            <Card title={`Saved (${result.saved.length})`}>
              <div className="space-y-2">
                {result.saved.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                    <CheckCircle size={15} className="text-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{s.file}</p>
                      <p className="text-xs text-slate-400">{s.vendor} · {s.invoice}</p>
                    </div>
                    <Badge label={s.tds?.includes('REVIEW') ? 'Medium' : s.tds === 'No TDS' ? 'High' : 'High'} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Skipped list */}
          {result.skipped?.length > 0 && (
            <Card title={`Skipped (${result.skipped.length})`}>
              <div className="space-y-2">
                {result.skipped.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                    <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{s.file}</p>
                      <p className="text-xs text-red-500">{s.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Duplicates */}
          {result.duplicates?.length > 0 && (
            <Card title={`Duplicates (${result.duplicates.length})`}>
              <div className="space-y-2">
                {result.duplicates.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                    <AlertTriangle size={15} className="text-yellow-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{d.file}</p>
                      <p className="text-xs text-slate-400">{d.vendor} · {d.invoice}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
