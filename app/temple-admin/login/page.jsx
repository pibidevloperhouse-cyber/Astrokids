// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';

// export default function AdminLogin() {
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     try {
//       const res = await fetch('/api/temple/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         // redirect to dashboard
//         window.location.href = '/admin/dashboard';
//       } else {
//         setError(data?.message || 'Login failed');
//       }
//     } catch (err) {
//       setError('Network error');
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-white">
//       <div className="w-full max-w-md p-8 rounded shadow">
//         <div className="mb-6 text-center">
//           <div className="text-2xl font-bold text-[#FF6B00]">DevBhoomi</div>
//           <div className="text-sm text-gray-500">Admin Panel</div>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1 text-black">Email</label>
//             <input
//               type="email"
//               required
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full border px-3 py-2 rounded text-black"
//               placeholder="admin@example.com"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1 text-black">Password</label>
//             <input
//               type="password"
//               required
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full border px-3 py-2 rounded text-black"
//               placeholder="••••••••"
//             />
//           </div>

//           {error && <div className="text-sm text-red-600">{error}</div>}

//           <div className="flex items-center justify-between">
//             <button
//               type="submit"
//               disabled={loading}
//               className="bg-[#1E2A3A] text-white px-4 py-2 rounded disabled:opacity-60"
//             >
//               {loading ? 'Logging in…' : 'Login'}
//             </button>
//             {/* <button
//               type="button"
//               onClick={() => {
//                 setEmail('admin@devbhoomi.test');
//                 setPassword('password123');
//               }}
//               className="text-sm text-gray-500"
//             >
//               Fill demo
//             </button> */}
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }



// naga code 



'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import '../globals.css'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError('Please enter email and password')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/temple/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      router.push('/temple-admin/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">

      {/* LEFT SIDE — Temple Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-black">

        <div
          className="
          circle-animation
          absolute
          w-[600px]
          h-[600px]
          rounded-full
          bg-gradient-to-br
          from-orange-600
          via-orange-400
          to-orange-200
          z-0
        "
        />

        <img
          src="/images/temples/temple.png"
          alt="Temple"
          className="relative z-10 w-full h-full object-cover"
        />
      </div>

      {/* RIGHT SIDE — Login Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-8">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8 space-y-6">

          {/* Logo */}
          <div className="flex flex-col items-center space-y-3">
            <img
              src="/images/temples/templeLogo.png"
              alt="DevBhoomi Logo"
              className="w-16 h-16 object-contain"
            />
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800">Welcome Back</h1>
              <p className="text-gray-400 text-sm mt-0.5">Login to continue your journey</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-500 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                placeholder="admin@devbhoomi.test"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition pr-10"
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 text-xs"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-orange-400 hover:bg-orange-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Logging in...
              </span>
            ) : 'Login'}
          </button>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400">
            DevBhoomi Admin Panel © 2026
          </p>
        </div>
      </div>
    </div>
  )
}


