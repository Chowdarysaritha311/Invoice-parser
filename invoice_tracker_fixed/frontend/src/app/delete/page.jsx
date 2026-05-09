'use client'
import { useState } from 'react'
import { getAllInvoices, deleteInvoice } from '@/lib/api'
import { Card, Table, Button, Modal, PageHeader, Badge, Alert } from '@/components/UI'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const COLS = [
  { key:'vendor',         label:'Vendor Name' },
  { key:'invoice_number', label:'Invoice No' },
  { key:'date',           label:'Date' },
  { key:'amount',         label:'Amount', render: v => v ? `₹ ${v}` : '—' },
  { key:'tds',            label:'TDS' },
  { key:'status',         label:'Status', render: v => <Badge label={v || 'Pending'} type={v ? 'success' : 'warning'} /> },
]

export default function DeletePage() {
  const [invoices, setInvoices] = useState([])
  const [loaded,   setLoaded]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [modal,    setModal]    = useState(false)
  const [selected, setSelected] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [confirm,  setConfirm]  = useState('')

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

  const openDelete = (inv) => {
    setSelected(inv)
    setConfirm('')
    setModal(true)
  }

  const handleDelete = async () => {
    if (confirm !== 'DELETE') return toast.error('Type DELETE to confirm')
    setDeleting(true)
    try {
      await deleteInvoice(selected.row)
      toast.success('Invoice deleted')
      setModal(false)
      loadInvoices()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-5xl">
      <PageHeader title="Delete Invoice" subtitle="Permanently remove an invoice from the system" />

      <Alert type="warning" message="Deletion is permanent and cannot be undone. Please verify before deleting." />

      <div className="mt-4">
        {!loaded ? (
          <Card>
            <div className="text-center py-6">
              <Button onClick={loadInvoices} loading={loading} size="lg">Load All Invoices</Button>
            </div>
          </Card>
        ) : (
          <Card title={`All Invoices (${invoices.length})`}
            action={<Button variant="secondary" size="sm" onClick={loadInvoices} loading={loading}>Refresh</Button>}>
            <Table cols={COLS} rows={invoices} onDelete={openDelete} />
          </Card>
        )}
      </div>

      <Modal open={modal} title="Confirm Deletion" onClose={() => setModal(false)}>
        {selected && (
          <div className="space-y-4">
            <Alert type="error" message="This action cannot be undone." />
            <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm space-y-1">
              <p><span className="font-medium">Vendor:</span> {selected.vendor}</p>
              <p><span className="font-medium">Invoice:</span> {selected.invoice_number}</p>
              <p><span className="font-medium">Date:</span> {selected.date}</p>
              <p><span className="font-medium">Amount:</span> ₹ {selected.amount}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm
              </label>
              <input value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none" />
            </div>
            <div className="flex gap-3">
              <Button variant="danger" onClick={handleDelete} loading={deleting}
                disabled={confirm !== 'DELETE'}>
                <Trash2 size={14} /> Delete Invoice
              </Button>
              <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
