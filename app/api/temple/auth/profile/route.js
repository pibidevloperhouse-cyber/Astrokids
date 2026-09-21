import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import TempleAdmin from '@/models/TempleAdmin'
import { verifyToken } from '@/lib/templeAuth'

// Helper to get admin from request cookie
async function getAdminFromRequest(request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(/admin-token=([^;]+)/)
  if (!match) throw new Error('Unauthorized')

  const payload = verifyToken(match[1])
  await connectDB()
  const admin = await TempleAdmin.findById(payload.id).select('name email')
  if (!admin) throw new Error('Admin not found')
  return admin
}

// GET /api/auth/profile — fetch current admin profile
export async function GET(request) {
  try {
    const admin = await getAdminFromRequest(request)
    return NextResponse.json({ admin: { name: admin.name, email: admin.email } })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 401 })
  }
}

// PUT /api/auth/profile — update admin name
export async function PUT(request) {
  try {
    const admin = await getAdminFromRequest(request)
    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    admin.name = name.trim()
    await admin.save()

    return NextResponse.json({
      message: 'Profile updated successfully',
      admin: { name: admin.name, email: admin.email }
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 401 })
  }
}
