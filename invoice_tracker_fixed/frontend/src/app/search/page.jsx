'use client'
import { useState } from 'react'
import { searchInvoices } from '@/lib/api'
import { Card, Table, Badge, Button, PageHeader, Alert } from '@/components/UI'
import { Search } from 'lucide-react'
import toast from 'react-hot-toast'

const COLS = [
  { key:'vendor',         label:'Vendor Name' },
  { key:'invoice_number', label:'Invoice No' },
  { key:'date',           label:'Date' },
  { key:'amount',         label:'Amount', render: v => v ? `₹ ${v}` : '—' },
  { key:'tds',            label:'TDS' },
  { key:'status',         label:'Status', render: v => <Badge label={v || 'Pending'} type={v ? 'success' : 'warning'} /> },
]

export default function SearchPage() {
  const [q,       setQ]       = useState('')
  const [field,   setField]   = useState('vendor')
  const [results, setResults] = useState([])
  const [searched,setSearched]= useState(false)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!q.trim()) return toast.error('Enter a search keyword')
    setLoading(true)
    try {
      const { data } = await searchInvoices(q, field)
      setResults(data.results || [])
      setSearched(true)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl">
      <PageHeader title="Search Invoices" subtitle="Find invoices by vendor, invoice number, date or amount" />

      <Card>
        <form onSubmit={handleSearch} className="flex gap-3">
          <select value={field} onChange={e => setField(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
            <option value="vendor">Vendor Name</option>
            <option value="invoice">Invoice Number</option>
            <option value="date">Date</option>
            <option value="amount">Amount</option>
          </select>
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <Button type="submit" loading={loading}>Search</Button>
        </form>
      </Card>

      {searched && (
        <div className="mt-4">
          <Card title={`Results (${results.length})`}>
            <Table cols={COLS} rows={results} />
          </Card>
        </div>
      )}
    </div>
  )
}
