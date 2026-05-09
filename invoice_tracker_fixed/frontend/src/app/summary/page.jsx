'use client'
import { useState } from 'react'
import { getMonthlySummary } from '@/lib/api'
import { Card, StatCard, Table, Button, PageHeader, Spinner } from '@/components/UI'
import toast from 'react-hot-toast'

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']

const PENDING_COLS = [
  { key:'vendor',  label:'Vendor' },
  { key:'invoice', label:'Invoice No' },
  { key:'amount',  label:'Amount', render: v => v ? `₹ ${v}` : '—' },
]

export default function SummaryPage() {
  const [month,   setMonth]   = useState('January')
  const [year,    setYear]    = useState(new Date().getFullYear().toString())
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(false)

  const years = Array.from({length:5}, (_,i) => (new Date().getFullYear() - i).toString())

  const handleFetch = async () => {
    setLoading(true)
    try {
      const { data: d } = await getMonthlySummary(month, year)
      setData(d)
      if (!d.total_invoices) toast('No invoices found for this period', { icon: 'ℹ️' })
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <PageHeader title="Monthly Summary" subtitle="View totals, TDS and pending payments for any month" />

      <Card>
        <div className="flex gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Month</label>
            <select value={month} onChange={e => setMonth(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Year</label>
            <select value={year} onChange={e => setYear(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
              {years.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <Button onClick={handleFetch} loading={loading}>Generate Report</Button>
        </div>
      </Card>

      {loading && (
        <div className="flex justify-center mt-10"><Spinner size="lg" /></div>
      )}

      {data && !loading && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Total Invoices"   value={data.total_invoices}         color="blue" />
            <StatCard label="Total Amount"     value={`₹ ${data.total_amount}`}    color="green" />
            <StatCard label="Total TDS"        value={`₹ ${data.total_tds}`}       color="orange" />
            <StatCard label="Pending Payments" value={data.pending_count || 0}     color="red" />
          </div>

          {data.pending?.length > 0 && (
            <Card title={`Pending Payments (${data.pending.length})`}>
              <Table cols={PENDING_COLS} rows={data.pending} />
            </Card>
          )}

          {data.total_invoices === 0 && (
            <Card>
              <div className="text-center py-8 text-slate-400 text-sm">
                No invoices found for {month} {year}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
