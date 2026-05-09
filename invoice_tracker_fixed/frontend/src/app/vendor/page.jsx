'use client'
import { useState } from 'react'
import { getVendorHistory } from '@/lib/api'
import { Card, StatCard, Table, Button, Input, PageHeader, Badge } from '@/components/UI'
import toast from 'react-hot-toast'

const COLS = [
  { key:'invoice_number', label:'Invoice No' },
  { key:'date',           label:'Date' },
  { key:'amount',         label:'Amount', render: v => v ? `₹ ${v}` : '—' },
  { key:'tds',            label:'TDS' },
  { key:'status',         label:'Status', render: v => <Badge label={v || 'Pending'} type={v ? 'success' : 'warning'} /> },
]

export default function VendorPage() {
  const [vendor,  setVendor]  = useState('')
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!vendor.trim()) return toast.error('Enter a vendor name')
    setLoading(true)
    try {
      const { data: d } = await getVendorHistory(vendor)
      setData(d)
      if (!d.invoices?.length) toast('No invoices found for this vendor', { icon: 'ℹ️' })
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <PageHeader title="Vendor History" subtitle="View all past invoices and total amount paid for any vendor" />

      <Card>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1">
            <Input value={vendor} onChange={e => setVendor(e.target.value)}
              placeholder="Enter vendor name (e.g. The Printz Shop)" />
          </div>
          <Button type="submit" loading={loading}>Search</Button>
        </form>
      </Card>

      {data && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Total Invoices" value={data.invoices?.length || 0} color="blue" />
            <StatCard label="Total Paid"     value={`₹ ${data.total || 0}`}    color="green" />
          </div>

          <Card title={`Invoices — ${data.vendor}`}>
            <Table cols={COLS} rows={data.invoices} />
          </Card>
        </div>
      )}
    </div>
  )
}
