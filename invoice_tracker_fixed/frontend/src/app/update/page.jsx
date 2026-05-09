'use client'
import { useState } from 'react'
import { getAllInvoices, updateInvoice } from '@/lib/api'
import { Card, Table, Button, Modal, Input, PageHeader, Badge } from '@/components/UI'
import toast from 'react-hot-toast'

const EDITABLE_FIELDS = [
  { key:'vendor_name',    label:'Vendor Name' },
  { key:'invoice_number', label:'Invoice Number' },
  { key:'invoice_date',   label:'Invoice Date' },
  { key:'due_date',       label:'Due Date' },
  { key:'amount',         label:'Amount' },
  { key:'tds',            label:'TDS' },
  { key:'payment_status', label:'Payment Status' },
  { key:'paid_from',      label:'Paid From' },
  { key:'payment_date',   label:'Payment Date' },
  { key:'base_amount',    label:'Base Amount' },
  { key:'cgst',           label:'CGST' },
  { key:'sgst',           label:'SGST' },
  { key:'igst',           label:'IGST' },
  { key:'tds_done',       label:'TDS Done' },
  { key:'comments',       label:'Comments' },
]

const COLS = [
  { key:'vendor',         label:'Vendor Name' },
  { key:'invoice_number', label:'Invoice No' },
  { key:'date',           label:'Date' },
  { key:'amount',         label:'Amount', render: v => v ? `₹ ${v}` : '—' },
  { key:'tds',            label:'TDS' },
  { key:'status',         label:'Status', render: v => <Badge label={v || 'Pending'} type={v ? 'success' : 'warning'} /> },
]

export default function UpdatePage() {
  const [invoices, setInvoices] = useState([])
  const [loaded,   setLoaded]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [modal,    setModal]    = useState(false)
  const [selected, setSelected] = useState(null)
  const [field,    setField]    = useState('')
  const [value,    setValue]    = useState('')
  const [saving,   setSaving]   = useState(false)

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const { data } = await getAllInvoices()
      setInvoices(data.invoices || [])
      setLoaded(true)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const openEdit = (inv) => {
    setSelected(inv)
    setField(EDITABLE_FIELDS[0].key)
    setValue('')
    setModal(true)
  }

  const handleUpdate = async () => {
    if (!field || !value.trim()) return toast.error('Select field and enter value')
    setSaving(true)
    try {
      await updateInvoice({ row: selected.row, field, value })
      toast.success('Updated successfully')
      setModal(false)
      loadInvoices()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl">
      <PageHeader title="Update Invoice" subtitle="Edit any field in a saved invoice" />

      {!loaded ? (
        <Card>
          <div className="text-center py-6">
            <Button onClick={loadInvoices} loading={loading} size="lg">Load All Invoices</Button>
          </div>
        </Card>
      ) : (
        <Card title={`All Invoices (${invoices.length})`}
          action={<Button variant="secondary" size="sm" onClick={loadInvoices} loading={loading}>Refresh</Button>}>
          <Table cols={COLS} rows={invoices} onEdit={openEdit} />
        </Card>
      )}

      <Modal open={modal} title="Edit Invoice Field" onClose={() => setModal(false)}>
        {selected && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm">
              <p className="font-medium text-slate-700">{selected.vendor}</p>
              <p className="text-slate-500">{selected.invoice_number} · {selected.date}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Field to Update</label>
              <select value={field} onChange={e => setField(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                {EDITABLE_FIELDS.map(f => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>
            </div>
            <Input label="New Value" value={value} onChange={e => setValue(e.target.value)}
              placeholder="Enter new value" />
            <div className="flex gap-3">
              <Button onClick={handleUpdate} loading={saving}>Save Changes</Button>
              <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
