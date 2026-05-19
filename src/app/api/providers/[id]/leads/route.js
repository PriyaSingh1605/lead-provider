import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import Provider from '@/models/Provider';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const provider = await Provider.findById(id);
    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    const leads = await Lead.find({ assignedProviders: id })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ provider, leads });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
