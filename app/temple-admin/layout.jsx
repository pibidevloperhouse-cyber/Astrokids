'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Building2,
  Settings,
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/temple-admin/dashboard', icon: LayoutDashboard },
  { label: 'Temples', href: '/temple-admin/temples', icon: Building2 },
  { label: 'Settings', href: '/temple-admin/settings', icon: Settings },
]

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [admin, setAdmin] = useState({ name: 'Super Admin', email: 'admin@devbhoomi.in' })

  const isLoginPage = pathname === '/temple-admin/login'

  const handleLogout = async () => {
    await fetch('/api/temple/auth/logout', { method: 'POST' })
    router.push('/temple-admin/login')
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-56 bg-[#1E2A3A] flex flex-col
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">DevBhoomi</p>
            <p className="text-gray-400 text-xs">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-gray-500 text-xs font-semibold uppercase px-2 mb-3">Main Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'}
                `}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Admin Info + Logout */}
        <div className="border-t border-white/10 p-3 space-y-2">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">SA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{admin.name}</p>
              <p className="text-gray-400 text-xs truncate">{admin.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all text-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            className="lg:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
            <span>Admin</span>
            <span>›</span>
            <span className="text-gray-800 font-medium capitalize">
              {pathname.split('/')[2] || 'Dashboard'}
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">SA</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
