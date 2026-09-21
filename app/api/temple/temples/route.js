import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Temple from '@/models/Temple';
import { verifyToken } from '@/lib/templeAuth';

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  // Filter params
  const city    = searchParams.get('city');
  const state   = searchParams.get('state');
  const deity   = searchParams.get('deity');
  const tag     = searchParams.get('tag');       // blessingTag
  const search  = searchParams.get('search');
  const status  = searchParams.get('status');

  await connectDB();

  const query = {};

  if (city   && city   !== 'All') query.city      = { $regex: city,   $options: 'i' };
  if (state  && state  !== 'All') query.state     = { $regex: state,  $options: 'i' };
  if (deity  && deity  !== 'All') query.mainDeity = { $regex: deity,  $options: 'i' };
  if (tag    && tag    !== 'All') query.blessingTags = { $in: [new RegExp(tag, 'i')] };
  if (status && status !== 'All') query.status    = status;

  if (search) {
    const re = new RegExp(search, 'i');
    query.$or = [
      { name:        re },
      { mainDeity:   re },
      { city:        re },
      { state:       re },
      { subLocation: re },
    ];
  }

  const temples = await Temple.find(query).sort({ createdAt: -1 });
  return NextResponse.json(temples);
}

export async function POST(req) {
  const token = req.cookies.get('admin-token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    verifyToken(token);
  } catch {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  const body = await req.json();
  await connectDB();
  const temple = await Temple.create(body);
  return NextResponse.json(temple, { status: 201 });
}
