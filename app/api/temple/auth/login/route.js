import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import TempleAdmin from '@/models/TempleAdmin'
import { signToken, makeAuthCookie } from '@/lib/templeAuth';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: 'Missing email or password' }, { status: 400 });
    }

    await connectDB();

    const admin = await TempleAdmin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const match = await admin.comparePassword(password);
    if (!match) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ id: admin._id, email: admin.email });
    const cookie = makeAuthCookie(token);

    return NextResponse.json({ ok: true, admin: { name: admin.name, email: admin.email } }, {
      status: 200,
      headers: { 'Set-Cookie': cookie }
    });
  } catch (err) {
    console.error('Login error', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
