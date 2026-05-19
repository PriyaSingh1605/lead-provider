import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Provider from '@/models/Provider';

// GET /api/providers — List all providers
export async function GET() {
  try {
    await connectDB();
    const providers = await Provider.find().sort({ isPriority: -1, name: 1 });
    return NextResponse.json({ providers });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/providers — Create a provider
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const provider = await Provider.create(body);
    return NextResponse.json({ provider }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
