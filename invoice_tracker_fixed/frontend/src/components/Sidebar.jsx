'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Upload, Search, Edit, Trash2, BarChart2, Users, Download, Activity } from 'lucide-react'

const nav = [
  { href: '/',          label: 'Dashboard',        icon: Activity },
  { href: '/add',       label: 'Add Invoice',       icon: FileText },
  { href: '/batch',     label: 'Batch Upload',      icon: Upload },
  { href: '/search',    label: 'Search',            icon: Search },
  { href: '/update',    label: 'Update Invoice',    icon: Edit },
  { href: '/summary',   label: 'Monthly Summary',   icon: BarChart2 },
  { href: '/vendor',    label: 'Vendor History',    icon: Users },
  { href: '/delete',    label: 'Delete Invoice',    icon: Trash2 },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="px-6 py-5 border-b border-slate-700">
        <h1 className="text-lg font-bold text-white">Invoice Tracker</h1>
        <p className="text-xs text-slate-400 mt-0.5">MakerInMe Technologies</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="px-4 py-4 border-t border-slate-700">
        <button onClick={() => window.open('http://localhost:8000/invoice/download')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors w-full px-3 py-2 rounded-lg hover:bg-slate-800">
          <Download size={15} /> Download Excel
        </button>
      </div>
    </aside>
  )
}
