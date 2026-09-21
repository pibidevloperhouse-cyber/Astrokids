import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Temple from '@/models/Temple';

export async function GET() {
  await connectDB();
  const cities = await Temple.distinct('city');
  const sorted = cities.filter(Boolean).sort((a, b) => a.localeCompare(b));
  return NextResponse.json(sorted);
}
