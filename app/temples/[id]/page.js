'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Clock, Building2, ArrowLeft, Star } from 'lucide-react'
import TempleCard from '@/components/TempleCard'
import TempleMap from '@/components/TempleMap'

export default function TempleDetailPage() {
    const { id } = useParams()
    const [temple, setTemple] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeImage, setActiveImage] = useState(0)
    const [similarTemples, setSimilarTemples] = useState([])

    useEffect(() => {
        fetch(`/api/temple/temples/${id}`)
            .then(r => r.json())
            .then(data => {
                const fetchedTemple = data.temple || data
                setTemple(fetchedTemple)

                // Fetch similar temples by state
                if (fetchedTemple?.state) {
                    fetch(`/api/temple/temples?state=${encodeURIComponent(fetchedTemple.state)}`)
                        .then(r => r.json())
                        .then(list => {
                            const others = list.filter(t => t._id !== id).slice(0, 2)
                            setSimilarTemples(others)
                        })
                        .catch(() => { })
                }

                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [id])

    // Auto-slideshow
    useEffect(() => {
        if (!temple?.images?.length || temple.images.length <= 1) return
        const timer = setInterval(() => {
            setActiveImage(prev => (prev + 1) % temple.images.length)
        }, 4000)
        return () => clearInterval(timer)
    }, [temple])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!temple) {
        return (
            <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center gap-4">
                <Building2 size={48} className="text-orange-200" />
                <p className="text-gray-500">Temple not found</p>
                <Link href="/temples" className="text-orange-500 hover:underline text-sm">
                    ← Back to Temples
                </Link>
            </div>
        )
    }

    const formatTime = (time) => {
        if (!time) return 'N/A'
        const [h, m] = time.split(':')
        const hour = parseInt(h)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const h12 = hour % 12 || 12
        return `${h12}:${m} ${ampm}`
    }

    // ── Reusable sidebar blocks ──────────────────────────────
    const ServicesBlock = () => (
        (temple.services?.virtualDarshan || temple.services?.pujaBooking || temple.services?.vrView) ? (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <h2 className="text-lg font-bold text-white mb-5 relative z-10 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-orange-500 rounded-full" />
                    Temple Services
                </h2>
                <div className="grid grid-cols-1 gap-4 relative z-10">
                    {temple.services?.virtualDarshan && (
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/15 transition-all">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center text-xl shrink-0">🙏</div>
                                <div>
                                    <p className="text-sm font-bold text-white mb-0.5">Virtual Chadhava</p>
                                    {temple.services?.virtualChadhavaPrice && (
                                        <p className="text-xs text-gray-300">From <span className="text-orange-400 font-bold">₹{temple.services.virtualChadhavaPrice}</span></p>
                                    )}
                                </div>
                            </div>
                            <Link href={`/temples/${id}/booking?service=Virtual%20Chadhava&templeName=${encodeURIComponent(temple.name)}`} className="w-full py-2 bg-orange-500 text-white text-[13px] rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-[0_0_15px_rgba(249,115,22,0.3)] block text-center">
                                Book Now
                            </Link>
                        </div>
                    )}
                    {temple.services?.pujaBooking && (
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/15 transition-all">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center text-xl shrink-0">🔔</div>
                                <div>
                                    <p className="text-sm font-bold text-white mb-0.5">Puja Booking</p>
                                    <p className="text-xs text-gray-300">Personalised visit</p>
                                </div>
                            </div>
                            <Link href={`/temples/${id}/booking?service=Puja%20Booking&templeName=${encodeURIComponent(temple.name)}`} className="w-full py-2 bg-white text-gray-900 text-[13px] rounded-xl font-bold hover:bg-gray-100 transition-colors block text-center">
                                Submit Details
                            </Link>
                        </div>
                    )}
                    {temple.services?.vrView && (
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/15 transition-all">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center text-xl shrink-0">🥽</div>
                                <div>
                                    <p className="text-sm font-bold text-white mb-0.5">VR Experience</p>
                                    <p className="text-xs text-gray-300">Immersive view</p>
                                </div>
                            </div>
                            <Link href={`/temples/${id}/booking?service=VR%20Experience&templeName=${encodeURIComponent(temple.name)}`} className="w-full py-2 bg-blue-500 text-white text-[13px] rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)] block text-center">
                                View Now
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        ) : null
    )

    const TimingsBlock = () => (
        temple.timings ? (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <Clock size={20} className="text-orange-500" />
                    Temple Timings
                </h2>
                <div className="space-y-5">
                    {(temple.timings.temple?.morningOpen || temple.timings.temple?.eveningClose) && (
                        <div>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Temple Opening Hours</p>
                            <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-3.5 border border-gray-100">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Morning</p>
                                    <p className="text-sm font-bold text-gray-800">{formatTime(temple.timings.temple.morningOpen)}</p>
                                </div>
                                <div className="w-px h-8 bg-gray-200" />
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Evening Close</p>
                                    <p className="text-sm font-bold text-gray-800">{formatTime(temple.timings.temple.eveningClose)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {temple.timings.puja?.morningFrom && (
                        <div>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Daily Puja</p>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between bg-orange-50/50 rounded-xl p-3 border border-orange-100/50">
                                    <span className="text-sm font-medium text-gray-600">Morning</span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {formatTime(temple.timings.puja.morningFrom)} - {formatTime(temple.timings.puja.morningTo)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between bg-orange-50/50 rounded-xl p-3 border border-orange-100/50">
                                    <span className="text-sm font-medium text-gray-600">Evening</span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {formatTime(temple.timings.puja.eveningFrom)} - {formatTime(temple.timings.puja.eveningTo)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                    {temple.timings.aarti?.morningFrom && (
                        <div>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Aarti Schedule</p>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between bg-rose-50/50 rounded-xl p-3 border border-rose-100/50">
                                    <span className="text-sm font-medium text-gray-600">Morning</span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {formatTime(temple.timings.aarti.morningFrom)} - {formatTime(temple.timings.aarti.morningTo)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between bg-rose-50/50 rounded-xl p-3 border border-rose-100/50">
                                    <span className="text-sm font-medium text-gray-600">Evening</span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {formatTime(temple.timings.aarti.eveningFrom)} - {formatTime(temple.timings.aarti.eveningTo)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        ) : null
    )
    // ────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[#FFF8F0]">
            <div className="min-w-full space-y-6">

                {/* ── Hero Section ── */}
                <div className="max-w-7xl mx-auto pt-4 pb-8 w-full">
                    {/* TOP NAVIGATION */}
                    <div className="px-5 mb-6">
                        <Link
                            href="/temples"
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 text-sm font-medium transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back to Temples
                        </Link>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 px-5">

                        {/* LEFT: TEMPLE INFO */}
                        <div className="flex-1 flex flex-col justify-center py-4">
                            <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-orange-100 text-orange-600 border border-orange-200 w-fit">
                                🔔 {temple.mainDeity || 'SHAKTI - SHIVA'}
                            </div>

                            <h1 className="font-sans font-black text-gray-900 leading-tight mb-5 tracking-tight"
                                style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)' }}
                            >
                                {temple.name || 'Meenakshi Amman Temple'}
                            </h1>

                            <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-[16px] text-gray-600 mb-8 font-medium">
                                <MapPin size={18} className="text-rose-500 flex-shrink-0" />
                                <span>{temple.subLocation || temple.city || 'Madurai'}, {temple.state || 'Tamil Nadu'}</span>
                                <span className="text-gray-300 mx-1 hidden sm:inline">|</span>
                                <span className="flex items-center gap-1.5"><span className="text-[14px]">🔔</span> {temple.mainDeity || 'Shakti - Shiva'}</span>
                            </div>

                            {/* Blessing Tags */}
                            <div className="flex flex-wrap gap-3 mb-6">
                                {(temple.blessingTags?.length > 0 ? temple.blessingTags : ['Divine Blessings', 'Dosha Relief', 'Happy Household']).map(tag => (
                                    <span
                                        key={tag}
                                        className="text-[14px] font-semibold rounded-full px-5 py-2 bg-white border border-gray-200 text-gray-700 shadow-sm"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Short Description */}
                            {temple.shortDescription && (
                                <p className="text-gray-600 leading-relaxed text-[15px] max-w-xl">
                                    {temple.shortDescription}
                                </p>
                            )}
                        </div>

                        {/* RIGHT: IMAGE GALLERY */}
                        <div className="flex-1 w-full lg:max-w-[55%] relative mt-4 lg:mt-0">
                            <div className="relative w-full aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-lg flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-rose-50/30" />
                                {temple.images?.length > 0 ? (
                                    temple.images.map((img, i) => (
                                        <img
                                            key={i}
                                            src={img}
                                            alt={`${temple.name} image`}
                                            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-700 p-2 sm:p-4"
                                            style={{ opacity: activeImage === i ? 1 : 0 }}
                                        />
                                    ))
                                ) : (
                                    <img
                                        src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=2070&auto=format&fit=crop"
                                        alt="Professional Temple Image"
                                        className="absolute inset-0 w-full h-full object-contain p-2 sm:p-4"
                                    />
                                )}
                            </div>

                            {/* Thumbnails */}
                            {temple.images?.length > 1 && (
                                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-2 p-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100">
                                    {temple.images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImage(i)}
                                            className="relative overflow-hidden transition-all duration-300 rounded-xl bg-gray-100"
                                            style={{
                                                width: '56px',
                                                height: '40px',
                                                border: activeImage === i ? '2px solid #f97316' : '2px solid transparent',
                                                opacity: activeImage === i ? 1 : 0.6,
                                                transform: activeImage === i ? 'scale(1.05)' : 'scale(1)',
                                            }}
                                        >
                                            <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* ── LOWER SECTION ── */}
                <div className="max-w-7xl mx-auto px-5 pb-16 w-full">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                        {/* LEFT COLUMN: Main Content */}
                        <div className="flex-1 space-y-8">

                            {/* About the Temple */}
                            {temple.longDescription && (
                                <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-orange-500 rounded-full" />
                                        About the Temple
                                    </h2>
                                    <p className="text-gray-600 leading-relaxed text-[15px]">
                                        {temple.longDescription}
                                    </p>
                                </div>
                            )}

                            {/* Temple History */}
                            {temple.history && (
                                <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-rose-500 rounded-full" />
                                        History & Significance
                                    </h2>
                                    <p className="text-gray-600 leading-relaxed text-[15px] whitespace-pre-line">
                                        {temple.history}
                                    </p>
                                </div>
                            )}

                            {/* ── Services + Timings: Mobile/Tablet only (shown here, after History) ── */}
                            <div className="lg:hidden space-y-6">
                                <ServicesBlock />
                                <TimingsBlock />
                            </div>

                            {/* Benefits */}
                            {temple.benefits?.length > 0 && (
                                <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
                                        Spiritual Benefits
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {temple.benefits.map((benefit, i) => (
                                            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-gradient-to-br from-amber-50/50 to-orange-50/50 border border-amber-100/50 hover:shadow-md transition-shadow">
                                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 text-amber-500">
                                                    <Star size={18} className="fill-amber-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[15px] font-bold text-gray-800 mb-1">{benefit.title}</p>
                                                    <p className="text-[13px] text-gray-500 leading-relaxed">{benefit.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Temple Location */}
                            {temple.coordinates?.lat && temple.coordinates?.lng && (
                                <div className="bg-white rounded-2xl shadow-sm p-5">
                                    <h2 className="text-base font-bold text-gray-800 mb-4">
                                        <MapPin size={16} className="inline mr-2 text-orange-500" />
                                        Temple Location
                                    </h2>
                                    <TempleMap
                                        lat={parseFloat(temple.coordinates.lat)}
                                        lng={parseFloat(temple.coordinates.lng)}
                                        name={temple.name}
                                    />
                                    <p className="text-xs text-gray-400 mt-2 text-center">
                                        📍 {temple.coordinates.lat}, {temple.coordinates.lng}
                                    </p>
                                </div>
                            )}

                            {/* Similar Temples */}
                            {similarTemples.length > 0 && (
                                <div className="mt-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-purple-500 rounded-full" />
                                        Similar Temples to Explore
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center">
                                        {similarTemples.map((st) => (
                                            <TempleCard key={st._id} temple={st} />
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* RIGHT COLUMN: Sidebar — Desktop only */}
                        <div className="hidden lg:flex w-full lg:w-[380px] shrink-0 flex-col gap-6">
                            <div className="sticky top-6 space-y-6">
                                <ServicesBlock />
                                <TimingsBlock />
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="text-center py-8 border-t border-orange-200/50 bg-white/30 backdrop-blur-sm">
                    <Link href="/temples"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full text-orange-600 text-sm font-bold hover:bg-orange-50 hover:shadow-md transition-all border border-orange-100">
                        <ArrowLeft size={16} />
                        Explore More Temples
                    </Link>
                    <p className="text-xs text-gray-400 mt-4 font-medium tracking-wide">DEVBHOOMI © 2026</p>
                </div>
            </div>
        </div>
    )
}