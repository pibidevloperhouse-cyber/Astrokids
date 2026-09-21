"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function TempleCard({ temple }) {
    // Fallback image if the array is empty or missing
    const imageUrl = temple.images && temple.images.length > 0
        ? temple.images[0]
        : "/images/temple.png";

    // Helper function to format the name (e.g., "kudal alagar" -> "Kudal Alagar")
    const formatName = (name) => {
        if (!name) return "Unknown Temple";
        return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <Link href={`/temples/${temple._id}`} className="block group relative w-full max-w-sm">
            <motion.div
                className="w-full h-full rounded-2xl overflow-hidden bg-zinc-900/80 backdrop-blur-sm border border-white/10 shadow-xl cursor-pointer"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8, borderColor: "rgba(245, 166, 35, 0.4)" }}
            >
                {/* === IMAGE SECTION === */}
                <div className="relative h-56 overflow-hidden">
                    <motion.img
                        src={imageUrl}
                        alt={temple.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                    {/* Gradient Overlay for text readability at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />

                    {/* Floating Deity Badge (Top Left) */}
                    <div className="absolute top-4 left-4 max-w-[65%] px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/20">
                        <div className="text-[11px] sm:text-xs font-cinzel font-medium text-yellow-300 uppercase tracking-wider leading-snug">
                            {temple.mainDeity}
                        </div>
                    </div>

                    {/* Floating Status Badge (Top Right) */}
                    {temple.status === "Active" && (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 backdrop-blur-md border border-green-400/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                            <span className="text-xs font-medium text-green-300">Open</span>
                        </div>
                    )}

                    {/* Temple Name & Location (Bottom of Image) */}
                    <div className="absolute bottom-0 left-0 p-5 w-full">
                        <h3 className="text-2xl font-cinzel font-bold text-white drop-shadow-lg leading-tight">
                            {formatName(temple.name)}
                        </h3>
                        <div className="flex items-center gap-1 mt-1 text-gray-300">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm font-light tracking-wide capitalize">
                                {temple.subLocation}, {temple.city}
                            </span>
                        </div>
                    </div>
                </div>

                {/* === CONTENT SECTION === */}
                <div className="p-5 flex flex-col gap-4 bg-gray-800">

                    {/* Short Description */}
                    <p className="text-sm text-gray-400 font-light leading-relaxed line-clamp-2">
                        {temple.shortDescription}
                    </p>

                    {/* Blessing Tags */}
                    <div className="flex flex-wrap gap-2">
                        {temple.blessingTags && temple.blessingTags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-md bg-white/5 border border-white/10 text-gray-300"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Services & CTA */}
                    <div className="mt-2 pt-4 border-t border-white/10 flex items-center justify-between">

                        {/* Available Services Icons */}
                        <div className="flex items-center gap-3">
                            {temple.services?.virtualDarshan && (
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10" title="Virtual Darshan">
                                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </div>
                            )}
                            {temple.services?.pujaBooking && (
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10" title="Puja Booking">
                                    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14v6m-3-3h6M6 5l3-3m0 0l3 3M9 2v16" /></svg>
                                </div>
                            )}
                            {temple.services?.vrView && (
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10" title="VR View Available">
                                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h8a2 2 0 002-2v-4a2 2 0 00-2-2H8m0 0V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4" /></svg>
                                </div>
                            )}
                        </div>

                        {/* CTA Button (Matches your hero CTA styling) */}
                        <motion.button
                            className="flex items-center gap-1 px-4 py-2 rounded-full text-white text-xs font-cinzel font-bold tracking-wider shadow-lg transition-all"
                            style={{ background: "linear-gradient(135deg, #f5a623, #ff8c00)" }}
                            whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(245,166,35,.5)" }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Explore <span>&gt;</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
