import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import TempleAdmin from '@/models/TempleAdmin'
import { verifyToken } from '@/lib/templeAuth'
import bcrypt from 'bcrypt'

export async function POST(request) {
  try {
    await verifyToken(request)
    await connectDB()

    const { currentPassword, newPassword } = await request.json()

    const admin = await TempleAdmin.findOne({})
    if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 })

    const isValid = await bcrypt.compare(currentPassword, admin.password)
    if (!isValid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })

    admin.password = await bcrypt.hash(newPassword, 10)
    await admin.save()

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
