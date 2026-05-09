'use client'
import { useEffect, useState } from 'react'
import { checkHealth, getAllInvoices } from '@/lib/api'
import { StatCard, Card, Badge, PageHeader, Spinner } from '@/components/UI'
import { CheckCircle, XCircle, FileText, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const [health,   setHealth]   = useState(null)
  const [stats,    setStats]    = useState(null)
  const [recent,   setRecent]   = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([checkHealth(), getAllInvoices()]).then(([h, inv]) => {
      setHealth(h.data)
      const invoices = inv.data.invoices || []
      const total    = invoices.reduce((s, i) => s + parseFloat(i.amount || 0), 0)
      const pending  = invoices.filter(i => !i.status || i.status === '').length
      setStats({ count: invoices.length, total: total.toFixed(2), pending })
      setRecent(invoices.slice(-5).reverse())
    }).catch(() => setHealth({ lm_studio: false, tds_api: false }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Invoice processing overview" />

      {/* System Status */}
      <div className="flex gap-3 mb-6">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border
          ${health?.lm_studio ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {health?.lm_studio ? <CheckCircle size={14} /> : <XCircle size={14} />}
          LM Studio {health?.lm_studio ? 'Connected' : 'Offline'}
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border
          ${health?.tds_api ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {health?.tds_api ? <CheckCircle size={14} /> : <XCircle size={14} />}
          TDS API {health?.tds_api ? 'Connected' : 'Offline'}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Invoices"   value={stats?.count  || 0} color="blue" />
        <StatCard label="Total Amount"     value={`₹ ${stats?.total || 0}`} color="green" />
        <StatCard label="Pending Payment"  value={stats?.pending || 0} color="orange" />
      </div>

      {/* Recent invoices */}
      <Card title="Recent Invoices">
        {recent.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <FileText size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No invoices yet. Upload your first invoice.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Vendor','Invoice No','Date','Amount','TDS','Status'].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-slate-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((inv, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-3 py-2.5 font-medium text-slate-700">{inv.vendor || '—'}</td>
                  <td className="px-3 py-2.5 text-slate-500">{inv.invoice_number || '—'}</td>
                  <td className="px-3 py-2.5 text-slate-500">{inv.date || '—'}</td>
                  <td className="px-3 py-2.5 text-slate-700">₹ {inv.amount || '—'}</td>
                  <td className="px-3 py-2.5">
                    <Badge label={inv.tds?.includes('REVIEW') ? 'warning' : inv.tds === 'No TDS' ? 'success' : 'default'}
                      type={inv.tds?.includes('REVIEW') ? 'warning' : 'default'} />
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge label={inv.status || 'Pending'} type={inv.status ? 'success' : 'warning'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
