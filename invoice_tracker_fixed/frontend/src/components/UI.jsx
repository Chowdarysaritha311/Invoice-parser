'use client'
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react'

export function Badge({ label, type = 'default' }) {
  const styles = {
    High:    'bg-green-100 text-green-700 border border-green-200',
    Medium:  'bg-yellow-100 text-yellow-700 border border-yellow-200',
    Low:     'bg-red-100 text-red-700 border border-red-200',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error:   'bg-red-100 text-red-700',
    default: 'bg-slate-100 text-slate-600',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[label] || styles[type] || styles.default}`}>
      {label}
    </span>
  )
}

export function Card({ title, children, action }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}

export function StatCard({ label, value, sub, color = 'blue' }) {
  const colors = { blue:'border-blue-500 bg-blue-50', green:'border-green-500 bg-green-50',
                   orange:'border-orange-500 bg-orange-50', red:'border-red-500 bg-red-50' }
  return (
    <div className={`rounded-xl border-l-4 p-5 ${colors[color]}`}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

export function Spinner({ size = 'md' }) {
  const s = { sm:'w-4 h-4', md:'w-6 h-6', lg:'w-10 h-10' }
  return <div className={`${s[size]} border-2 border-blue-600 border-t-transparent rounded-full animate-spin`} />
}

export function Alert({ type = 'info', message, onClose }) {
  if (!message) return null
  const styles = {
    error:   { wrap:'bg-red-50 border border-red-200 text-red-800',   icon: <AlertTriangle size={16} className="text-red-500" /> },
    success: { wrap:'bg-green-50 border border-green-200 text-green-800', icon: <CheckCircle size={16} className="text-green-500" /> },
    warning: { wrap:'bg-yellow-50 border border-yellow-200 text-yellow-800', icon: <AlertTriangle size={16} className="text-yellow-500" /> },
    info:    { wrap:'bg-blue-50 border border-blue-200 text-blue-800', icon: <Info size={16} className="text-blue-500" /> },
  }
  const s = styles[type]
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-lg text-sm ${s.wrap}`}>
      {s.icon}
      <span className="flex-1">{message}</span>
      {onClose && <button onClick={onClose}><X size={14} /></button>}
    </div>
  )
}

export function Table({ cols, rows, onEdit, onDelete }) {
  if (!rows?.length) return (
    <div className="text-center py-12 text-slate-400 text-sm">No records found</div>
  )
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {cols.map(c => (
              <th key={c.key} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                {c.label}
              </th>
            ))}
            {(onEdit || onDelete) && <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              {cols.map(c => (
                <td key={c.key} className="px-4 py-3 text-slate-700 whitespace-nowrap">
                  {c.render ? c.render(row[c.key], row) : (row[c.key] || '—')}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {onEdit   && <button onClick={() => onEdit(row)}   className="text-blue-600 hover:underline text-xs">Edit</button>}
                    {onDelete && <button onClick={() => onDelete(row)} className="text-red-500 hover:underline text-xs">Delete</button>}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Modal({ open, title, children, onClose }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function Input({ label, error, ...props }) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>}
      <input className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${error ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'}`} {...props} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export function Button({ children, variant = 'primary', loading, size = 'md', ...props }) {
  const variants = {
    primary:  'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    secondary:'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger:   'bg-red-600 text-white hover:bg-red-700',
    ghost:    'text-slate-600 hover:bg-slate-100',
  }
  const sizes = { sm:'px-3 py-1.5 text-xs', md:'px-4 py-2 text-sm', lg:'px-6 py-3 text-base' }
  return (
    <button disabled={loading} {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors
        ${variants[variant]} ${sizes[size]} disabled:cursor-not-allowed`}>
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}

export function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-bold text-slate-800">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  )
}
