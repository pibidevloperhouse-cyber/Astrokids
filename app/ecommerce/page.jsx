// "use client";

// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import { Search, Moon, Sun } from "lucide-react";

// const ZODIAC_SIGNS = [
//   "All Signs",
//   "Aries",
//   "Taurus",
//   "Gemini",
//   "Cancer",
//   "Leo",
//   "Virgo",
//   "Libra",
//   "Scorpio",
//   "Sagittarius",
//   "Capricorn",
//   "Aquarius",
//   "Pisces",
// ];

// function useMockFetch() {
//   const [data, setData] = useState(null);
//   useEffect(() => {
//     setTimeout(() => {
//       setData([
//         {
//           id: "p_1",
//           title: "AstroKids Moon Lamp",
//           price: 1299,
//           stock: 12,
//           sign: "Cancer",
//           nakshatras: "Rohini",
//           image:
//             "https://images.unsplash.com/photo-1601987077674-efd9c1d2f2b5?auto=format&fit=crop&w=400&q=80",
//           description: "A glowing lunar lamp for dreamy nights.",
//         },
//         {
//           id: "p_2",
//           title: "Zodiac Storybook — Aries Edition",
//           price: 499,
//           stock: 50,
//           sign: "Aries",
//           nakshatras: "Ashwini",
//           image:
//             "https://images.unsplash.com/photo-1601987077674-efd9c1d2f2b5?auto=format&fit=crop&w=400&q=80",
//           description: "An adventurous tale for young rams.",
//         },
//         {
//           id: "p_3",
//           title: "Starry Night Projector",
//           price: 1999,
//           stock: 8,
//           sign: "Pisces",
//           nakshatras: "Revati",
//           image:
//             "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9b?auto=format&fit=crop&w=400&q=80",
//           description: "Project a cosmic sky in your room.",
//         },
//       ]);
//     }, 400);
//   }, []);
//   return data;
// }

// export default function ShopPage() {
//   const products = useMockFetch();
//   const [search, setSearch] = useState("");
//   const [sign, setSign] = useState("All Signs");
//   const [theme, setTheme] = useState("light");

//   const filtered = products?.filter((p) => {
//     const s = p.title.toLowerCase().includes(search.toLowerCase());
//     const t = p.description.toLowerCase().includes(search.toLowerCase());
//     const f = sign === "All Signs" || p.sign === sign;
//     return (s || t) && f;
//   });

//   return (
//     <div
//       className={`min-h-screen relative transition-colors duration-500 ${
//         theme === "dark"
//           ? "bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-900 text-gray-100"
//           : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-gray-900"
//       }`}
//     >
//       <div className="absolute inset-0 -z-10 overflow-hidden">
//         <div className="absolute top-0 left-1/2 w-[120vw] h-[120vw] bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
//       </div>

//       <header
//         className={`sticky top-0 z-10 w-full backdrop-blur-xl border-b ${
//           theme === "dark"
//             ? "border-indigo-900/60 bg-gray-900/60"
//             : "border-indigo-100 bg-white/60"
//         }`}
//       >
//         <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
//           <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
//             AstroKids Cosmos Store
//           </h1>
//           <button
//             onClick={() => setTheme(theme === "light" ? "dark" : "light")}
//             className={`p-2 rounded-full transition ${
//               theme === "dark"
//                 ? "hover:bg-indigo-800/40 text-yellow-400"
//                 : "hover:bg-indigo-100 text-indigo-600"
//             }`}
//           >
//             {theme === "dark" ? (
//               <Sun className="w-5 h-5" />
//             ) : (
//               <Moon className="w-5 h-5" />
//             )}
//           </button>
//         </div>
//       </header>

//       <section className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 px-6 py-6 items-center justify-between">
//         <div className="relative w-full md:w-2/3">
//           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//           <input
//             type="text"
//             placeholder="Search for cosmic treasures..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className={`w-full pl-12 pr-4 py-3 rounded-2xl border ${
//               theme === "dark"
//                 ? "bg-gray-800 border-gray-700 focus:border-indigo-500"
//                 : "bg-white border-indigo-100 focus:border-indigo-400"
//             } outline-none transition-all`}
//           />
//         </div>
//         <select
//           value={sign}
//           onChange={(e) => setSign(e.target.value)}
//           className={`w-full md:w-1/3 py-3 px-4 rounded-2xl border ${
//             theme === "dark"
//               ? "bg-gray-800 border-gray-700 text-gray-100"
//               : "bg-white border-indigo-100 text-gray-900"
//           } focus:ring-2 focus:ring-indigo-400 transition`}
//         >
//           {ZODIAC_SIGNS.map((z) => (
//             <option key={z}>{z}</option>
//           ))}
//         </select>
//       </section>

//       <main className="max-w-7xl mx-auto px-6 pb-16">
//         {!filtered ? (
//           <div className="flex justify-center items-center h-64 text-lg animate-pulse">
//             Loading cosmic wonders...
//           </div>
//         ) : filtered.length === 0 ? (
//           <div className="flex justify-center items-center h-64 text-lg">
//             No items found for this constellation 🌠
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//             {filtered.map((p) => (
//               <div
//                 key={p.id}
//                 className={`relative group rounded-3xl overflow-hidden shadow-lg backdrop-blur-md border ${
//                   theme === "dark"
//                     ? "bg-gray-800/50 border-gray-700 hover:border-indigo-500/50"
//                     : "bg-white/70 border-indigo-100 hover:border-indigo-300"
//                 } transition-all duration-300 hover:shadow-indigo-500/30`}
//               >
//                 <div className="relative w-full aspect-square">
//                   <Image
//                     src={p.image}
//                     alt={p.title}
//                     fill
//                     className="object-cover group-hover:scale-105 transition-transform duration-500"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-indigo-900/40 transition-all" />
//                 </div>
//                 <div className="p-5 space-y-2">
//                   <h2 className="font-semibold text-xl">{p.title}</h2>
//                   <p className="text-sm opacity-80 line-clamp-2">
//                     {p.description}
//                   </p>
//                   <div className="flex flex-wrap gap-2 text-sm">
//                     <span
//                       className={`px-2 py-1 rounded-full ${
//                         theme === "dark"
//                           ? "bg-indigo-900 text-indigo-300"
//                           : "bg-indigo-100 text-indigo-600"
//                       }`}
//                     >
//                       {p.sign}
//                     </span>
//                     {p.nakshatras.map((n) => (
//                       <span
//                         key={n}
//                         className={`px-2 py-1 rounded-full ${
//                           theme === "dark"
//                             ? "bg-purple-900 text-purple-200"
//                             : "bg-purple-100 text-purple-600"
//                         }`}
//                       >
//                         {n}
//                       </span>
//                     ))}
//                   </div>
//                   <div className="flex justify-between items-center mt-3">
//                     <span
//                       className={`font-bold text-lg ${
//                         theme === "dark" ? "text-indigo-300" : "text-indigo-700"
//                       }`}
//                     >
//                       ₹{p.price}
//                     </span>
//                     <span
//                       className={`text-sm ${
//                         p.stock > 0
//                           ? theme === "dark"
//                             ? "text-green-400"
//                             : "text-green-700"
//                           : "text-red-500"
//                       }`}
//                     >
//                       {p.stock > 0 ? `${p.stock} in stock` : "Sold out"}
//                     </span>
//                   </div>
//                   <button
//                     disabled={p.stock === 0}
//                     className={`w-full mt-4 py-3 rounded-2xl font-medium transition-all ${
//                       p.stock === 0
//                         ? "bg-gray-400 cursor-not-allowed"
//                         : theme === "dark"
//                         ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
//                         : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md"
//                     }`}
//                   >
//                     {p.stock > 0 ? "Add to Cart" : "Sold Out"}
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </main>

//       <footer
//         className={`text-center py-6 text-sm ${
//           theme === "dark"
//             ? "bg-gray-900/70 border-t border-gray-800"
//             : "bg-white/60 border-t border-indigo-100"
//         }`}
//       >
//         © 2025 AstroKids — Discover the Universe ✨
//       </footer>
//     </div>
//   );
// }
