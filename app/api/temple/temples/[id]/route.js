import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Temple from '@/models/Temple';
import { verifyToken } from '@/lib/templeAuth';

async function getTempleId(context) {
  const params = await Promise.resolve(context?.params);
  return params?.id;
}

export async function GET(req, context) {
  const id = await getTempleId(context);

  await connectDB();
  const temple = await Temple.findById(id);

  if (!temple) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(temple);
}

export async function PUT(req, context) {
  const token = req.cookies.get('admin-token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    verifyToken(token);
  } catch {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  const id = await getTempleId(context);
  const data = await req.json();

  await connectDB();
  const updated = await Temple.findByIdAndUpdate(id, data, { new: true });

  if (!updated) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(req, context) {
  const token = req.cookies.get('admin-token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    verifyToken(token);
  } catch {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  const id = await getTempleId(context);

  await connectDB();
  const deleted = await Temple.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}