'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Building2, MapPin, PlusCircle, TrendingUp } from 'lucide-react'

const StatusBadge = ({ status }) => {
  const isActive = status === 'Active'
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
        isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
      {status || 'Unknown'}
    </span>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/temple/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const activeCount = data?.templeStatus?.Active || 0
  const inactiveCount = data?.templeStatus?.Inactive || 0
  const totalForPercent = activeCount + inactiveCount
  const activePercent = totalForPercent > 0 ? Math.round((activeCount / totalForPercent) * 100) : 0

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, Super Admin</p>
        </div>
        <Link
          href="/temple-admin/temples/add"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
        >
          <PlusCircle size={16} />
          <span className="hidden sm:inline">Add Temple</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Temples"
          value={data?.totalTemples || 0}
          sub="+3 this month"
          icon={<Building2 size={22} className="text-white" />}
          iconBg="bg-gray-700"
        />
        <StatCard
          title="Cities Covered"
          value={data?.citiesCovered || 0}
          sub={`Across multiple states`}
          icon={<MapPin size={22} className="text-white" />}
          iconBg="bg-orange-400"
        />
        <StatCard
          title="Recently Added"
          value={data?.recentlyAdded || 0}
          sub="In last 30 days"
          icon={<TrendingUp size={22} className="text-white" />}
          iconBg="bg-green-500"
        />
      </div>

      {/* Chart + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Temples per City</h2>
          <p className="text-xs text-gray-400 mb-4">Distribution across locations</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.templesPerCity || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="city" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Temple Status */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Temple Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{activeCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                <span className="text-sm text-gray-600">Inactive</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{inactiveCount}</span>
            </div>
            {/* Progress bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${activePercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">{activePercent}% temples are active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Added Temples */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Recently Added Temples</h2>
            <p className="text-xs text-gray-400">Last 5 temples added to the system</p>
          </div>
          <Link href="/temple-admin/temples" className="text-orange-500 text-xs font-medium hover:underline">
            View all →
          </Link>
        </div>

        {data?.recentTemples?.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No temples added yet</p>
        ) : (
          <>
            {/* ── Desktop Table (md and above) ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                    <th className="text-left pb-3 font-medium">Temple Name</th>
                    <th className="text-left pb-3 font-medium">City</th>
                    <th className="text-left pb-3 font-medium">Deity</th>
                    <th className="text-left pb-3 font-medium">Date Added</th>
                    <th className="text-left pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.recentTemples?.map((temple) => (
                    <tr key={temple._id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                            {temple.images?.[0] ? (
                              <img src={temple.images[0]} className="w-8 h-8 rounded-lg object-cover" alt={temple.name} />
                            ) : (
                              <Building2 size={14} className="text-orange-500" />
                            )}
                          </div>
                          <span className="font-medium text-gray-700 truncate max-w-[160px]">{temple.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="flex-shrink-0" />
                          {temple.city}
                        </div>
                      </td>
                      <td className="py-3 text-gray-500 max-w-[120px] truncate">{temple.mainDeity}</td>
                      <td className="py-3 text-gray-400 whitespace-nowrap">
                        {new Date(temple.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={temple.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards (below md) ── */}
            <div className="md:hidden space-y-3">
              {data?.recentTemples?.map((temple) => (
                <div key={temple._id} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                  {/* Image */}
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {temple.images?.[0] ? (
                      <img src={temple.images[0]} className="w-10 h-10 rounded-lg object-cover" alt={temple.name} />
                    ) : (
                      <Building2 size={15} className="text-orange-500" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-gray-800 text-sm truncate">{temple.name}</p>
                      <StatusBadge status={temple.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {temple.city && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={10} />
                          {temple.city}
                        </span>
                      )}
                      {temple.mainDeity && (
                        <span className="text-xs text-gray-400">🙏 {temple.mainDeity}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(temple.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, sub, icon, iconBg }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  )
}
