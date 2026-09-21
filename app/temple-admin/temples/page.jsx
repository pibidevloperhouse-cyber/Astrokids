'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Search, MapPin, Building2 } from 'lucide-react'

export default function TemplesPage() {
  const [temples, setTemples] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [cities, setCities] = useState([])
  const [deleteModal, setDeleteModal] = useState({ open: false, temple: null })
  const [deleting, setDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const PER_PAGE = 6

  // Fetch distinct cities from MongoDB
  useEffect(() => {
    fetch('/api/temple/temples/cities')
      .then(r => r.json())
      .then(data => setCities(Array.isArray(data) ? data : []))
      .catch(() => setCities([]))
  }, [])

  const fetchTemples = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (cityFilter) params.append('city', cityFilter)
      const res = await fetch(`/api/temple/temples?${params}`)
      const data = await res.json()
      setTemples(data.temples || data || [])
    } catch {
      setTemples([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTemples() }, [search, cityFilter])

  // Pagination
  const totalPages = Math.ceil(temples.length / PER_PAGE)
  const paginated = temples.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const handleDelete = async () => {
    if (!deleteModal.temple) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/temple/temples/${deleteModal.temple._id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setTemples(prev => prev.filter(t => t._id !== deleteModal.temple._id))
        setDeleteModal({ open: false, temple: null })
      }
    } catch {
      // handle error
    } finally {
      setDeleting(false)
    }
  }

  const StatusBadge = ({ status }) => {
    const isActive = status === 'Active'
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
          isActive
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-500'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
        {status || 'Unknown'}
      </span>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Temples</h1>
          <p className="text-sm text-gray-500 mt-1">{temples.length} temples found</p>
        </div>
        <Link
          href="/temple-admin/temples/add"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add New Temple</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-black"
            placeholder="Search temples..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-black min-w-0 sm:min-w-36"
          value={cityFilter}
          onChange={e => { setCityFilter(e.target.value); setPage(1) }}
        >
          <option value="">All Cities</option>
          {cities.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* ─── Desktop Table (hidden on mobile) ─── */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hidden md:block">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Building2 size={32} className="mb-2 opacity-40" />
            <p className="text-sm">No temples found</p>
            <Link href="/temple-admin/temples/add" className="text-orange-500 text-sm mt-2 hover:underline">
              + Add your first temple
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-xs text-gray-400 uppercase">
                  <th className="text-left px-6 py-3 font-medium">Temple</th>
                  <th className="text-left px-4 py-3 font-medium">City</th>
                  <th className="text-left px-4 py-3 font-medium">Deity</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(temple => (
                  <tr key={temple._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {temple.images?.[0] ? (
                            <img
                              src={temple.images[0]}
                              className="w-10 h-10 object-cover"
                              alt={temple.name}
                            />
                          ) : (
                            <Building2 size={16} className="text-orange-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{temple.name}</p>
                          {temple.subLocation && (
                            <p className="text-xs text-gray-400 truncate">{temple.subLocation}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin size={12} className="flex-shrink-0" />
                        <span className="truncate">{temple.city}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-500 max-w-[120px] truncate">{temple.mainDeity}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={temple.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/temple-admin/temples/${temple._id}/edit`}
                          className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => setDeleteModal({ open: true, temple })}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Mobile Cards (shown only on mobile) ─── */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center h-48 text-gray-400">
            <Building2 size={32} className="mb-2 opacity-40" />
            <p className="text-sm">No temples found</p>
            <Link href="/temple-admin/temples/add" className="text-orange-500 text-sm mt-2 hover:underline">
              + Add your first temple
            </Link>
          </div>
        ) : (
          paginated.map(temple => (
            <div key={temple._id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start gap-3">
                {/* Image */}
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {temple.images?.[0] ? (
                    <img
                      src={temple.images[0]}
                      className="w-12 h-12 object-cover"
                      alt={temple.name}
                    />
                  ) : (
                    <Building2 size={18} className="text-orange-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{temple.name}</p>
                      {temple.subLocation && (
                        <p className="text-xs text-gray-400 truncate">{temple.subLocation}</p>
                      )}
                    </div>
                    <StatusBadge status={temple.status} />
                  </div>

                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {temple.city && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={11} />
                        {temple.city}
                      </span>
                    )}
                    {temple.mainDeity && (
                      <span className="text-xs text-gray-400">
                        🙏 {temple.mainDeity}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <Link
                  href={`/temple-admin/temples/${temple._id}/edit`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors font-medium"
                >
                  <Pencil size={14} />
                  Edit
                </Link>
                <button
                  onClick={() => setDeleteModal({ open: true, temple })}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500 flex-wrap gap-3">
          <span className="text-xs sm:text-sm">
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, temples.length)} of {temples.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  page === p
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >{p}</button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >›</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Delete Temple</h3>
                <p className="text-xs text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-800">
                {deleteModal.temple?.name}
              </span>
              ? This will permanently remove all temple data.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteModal({ open: false, temple: null })}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
