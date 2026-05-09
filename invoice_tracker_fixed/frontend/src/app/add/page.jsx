'use client'
import { useState, useRef } from 'react'
import { extractInvoice, saveInvoice } from '@/lib/api'
import { Card, Badge, Alert, Button, Input, PageHeader, Spinner } from '@/components/UI'
import toast from 'react-hot-toast'
import { Upload, FileText, Zap, Clock } from 'lucide-react'

const FIELDS = [
  { key:'unique_id',      label:'Unique ID' },
  { key:'doc_type',       label:'Document Type' },
  { key:'vendor_name',    label:'Vendor Name' },
  { key:'vendor_gstin',   label:'Vendor GSTIN' },
  { key:'invoice_number', label:'Invoice Number' },
  { key:'invoice_date',   label:'Invoice Date' },
  { key:'due_date',       label:'Due Date' },
  { key:'buyer_name',     label:'Buyer Name' },
  { key:'buyer_gstin',    label:'Buyer GSTIN' },
  { key:'hsn_code',       label:'HSN Code' },
  { key:'service_desc',   label:'Service / Product' },
  { key:'base_amount',    label:'Base Amount' },
  { key:'cgst',           label:'CGST' },
  { key:'sgst',           label:'SGST' },
  { key:'igst',           label:'IGST' },
  { key:'total_amount',   label:'Total Amount' },
  { key:'tds',            label:'TDS' },
  { key:'week',           label:'Week' },
  { key:'project_name',   label:'Project Name' },
  { key:'owner',          label:'Owner' },
  { key:'payment_status', label:'Payment Status' },
  { key:'paid_from',      label:'Paid From' },
  { key:'payment_date',   label:'Payment Date' },
  { key:'tds_done',       label:'TDS Done' },
  { key:'comments',       label:'Comments' },
]

// Progress messages shown while waiting
const PROGRESS_STEPS = [
  { t: 0,   msg: 'Reading PDF...' },
  { t: 2,   msg: 'Extracting text...' },
  { t: 5,   msg: 'Identifying fields...' },
  { t: 10,  msg: 'Checking TDS rules...' },
  { t: 20,  msg: 'AI analysis in progress...' },
  { t: 40,  msg: 'Almost done...' },
]

function useProgressMessage(active) {
  const [step, setStep] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef(null)
  const startRef = useRef(null)

  const start = () => {
    setStep(0); setElapsed(0)
    startRef.current = Date.now()
    timerRef.current = setInterval(() => {
      const sec = Math.floor((Date.now() - startRef.current) / 1000)
      setElapsed(sec)
      const idx = [...PROGRESS_STEPS].reverse().findIndex(s => sec >= s.t)
      if (idx >= 0) setStep(PROGRESS_STEPS.length - 1 - idx)
    }, 500)
  }

  const stop = () => {
    clearInterval(timerRef.current)
  }

  return { start, stop, msg: PROGRESS_STEPS[step]?.msg, elapsed }
}

export default function AddInvoice() {
  const [file,       setFile]       = useState(null)
  const [result,     setResult]     = useState(null)
  const [form,       setForm]       = useState({})
  const [extracting, setExtracting] = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)
  const inputRef = useRef()
  const progress = useProgressMessage(extracting)

  const handleFile = (f) => { setFile(f); setResult(null); setSaved(false) }

  const handleExtract = async () => {
    if (!file) return toast.error('Please select a PDF file')
    setExtracting(true)
    progress.start()
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await extractInvoice(fd)
      setResult(data)
      const ext = data.extracted || {}
      setForm({
        unique_id:      '',
        doc_type:       ext.document_type       || '',
        vendor_name:    ext.vendor_name         || '',
        vendor_gstin:   ext.vendor_gstin        || '',
        invoice_number: ext.invoice_number      || '',
        invoice_date:   ext.invoice_date        || '',
        due_date:       ext.due_date            || '',
        buyer_name:     ext.buyer_name          || '',
        buyer_gstin:    ext.buyer_gstin         || '',
        hsn_code:       ext.hsn_code            || '',
        service_desc:   ext.service_description || '',
        base_amount:    ext.base_amount         || '',
        cgst:           ext.cgst                || '',
        sgst:           ext.sgst                || '',
        igst:           ext.igst                || '',
        total_amount:   ext.total_with_gst      || '',
        tds:            data.tds_value          || '',
        comments:       '',
      })
      const sec = data.elapsed_sec || progress.elapsed
      toast.success(`Extracted in ${sec}s!`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      progress.stop()
      setExtracting(false)
    }
  }

  const handleSave = async () => {
    if (!form.vendor_name) return toast.error('Vendor name is required')
    setSaving(true)
    try {
      await saveInvoice(form)
      toast.success('Invoice saved successfully!')
      setSaved(true)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <PageHeader title="Add Invoice" subtitle="Upload a PDF — fast regex extraction, AI only when needed" />

      <Card title="Upload Invoice PDF">
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
          className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
          <input ref={inputRef} type="file" accept=".pdf" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
          <Upload size={32} className="mx-auto mb-3 text-slate-400" />
          {file
            ? <p className="text-sm font-medium text-blue-600">{file.name}</p>
            : <><p className="text-sm font-medium text-slate-600">Drag & drop or click to upload</p>
               <p className="text-xs text-slate-400 mt-1">PDF files only</p></>}
        </div>

        {/* Speed hint */}
        <div className="mt-3 flex gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Zap size={12} className="text-green-500" /> Digital PDF: ~1–3s (regex)</span>
          <span className="flex items-center gap-1"><Clock size={12} className="text-blue-400" /> Scanned PDF: ~30–60s (AI vision)</span>
        </div>

        {file && !saved && (
          <div className="mt-4">
            <Button onClick={handleExtract} loading={extracting}>
              {extracting ? progress.msg : 'Extract Invoice'}
            </Button>
          </div>
        )}

        {/* Live progress bar */}
        {extracting && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>{progress.msg}</span>
              <span>{progress.elapsed}s elapsed</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}
      </Card>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Confidence:</span>
              <Badge label={result.confidence} />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Method:</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                ${result.pdf_type === 'digital'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                {result.pdf_type === 'digital' ? <><Zap size={11} /> Fast (Text)</> : <><Clock size={11} /> AI Vision (Scanned)</>}
              </span>
            </div>
            {result.elapsed_sec && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock size={11} /> {result.elapsed_sec}s
              </span>
            )}
            {result.missing?.length > 0 && (
              <Alert type="warning" message={`Fields need review: ${result.missing.join(', ')}`} />
            )}
            {result.is_duplicate && (
              <Alert type="error" message="Warning: This invoice already exists in the system" />
            )}
            {result.due_alert && (
              <Alert type="warning" message={`Due Date: ${result.due_alert}`} />
            )}
          </div>

          <Card title="TDS Decision">
            <div className="flex items-start gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">{result.tds_value || 'Not determined'}</p>
                <p className="text-xs text-slate-500 mt-1">{result.tds_reason}</p>
              </div>
              <Badge label={result.tds_conf === 'high' ? 'High' : result.tds_conf === 'medium' ? 'Medium' : 'Low'} />
            </div>
          </Card>

          <Card title="Review & Confirm">
            <div className="grid grid-cols-2 gap-4">
              {FIELDS.map(({ key, label }) => (
                <Input key={key} label={label} value={form[key] || ''}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              {saved
                ? <Alert type="success" message="Invoice saved successfully!" />
                : <Button onClick={handleSave} loading={saving} size="lg">Save Invoice</Button>}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
