import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import { distributeLeadToProviders } from '@/lib/distributor';
import broker from '@/lib/sseBroker';

// POST /api/leads — Customer submits a service enquiry
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      address,
      serviceCategory,
      description,
      urgency,
      budget,
    } = body;

    // Validation
    if (!customerName || !customerEmail || !serviceCategory || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: customerName, customerEmail, serviceCategory, description' },
        { status: 400 }
      );
    }

    // Run distribution engine
    const assignedProviders = await distributeLeadToProviders(serviceCategory);

    // Create the lead
    const lead = await Lead.create({
      customerName,
      customerEmail,
      customerPhone,
      address,
      serviceCategory,
      description,
      urgency: urgency || 'medium',
      budget,
      assignedProviders: assignedProviders.map((p) => p._id),
    });

    // Populate provider info for SSE payload
    const populatedLead = await lead.populate('assignedProviders', 'name email company');

    // Push real-time notification to each assigned provider
    const providerIds = assignedProviders.map((p) => String(p._id));
    broker.broadcast(providerIds, {
      type: 'NEW_LEAD',
      lead: {
        _id: populatedLead._id,
        customerName: populatedLead.customerName,
        serviceCategory: populatedLead.serviceCategory,
        description: populatedLead.description,
        urgency: populatedLead.urgency,
        budget: populatedLead.budget,
        address: populatedLead.address,
        status: populatedLead.status,
        createdAt: populatedLead.createdAt,
      },
    });

    return NextResponse.json(
      {
        success: true,
        lead: populatedLead,
        assignedCount: assignedProviders.length,
        message: `Lead created and distributed to ${assignedProviders.length} provider(s).`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/leads]', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

// GET /api/leads — List all leads (admin view)
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      Lead.find()
        .populate('assignedProviders', 'name email company isPriority')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Lead.countDocuments(),
    ]);

    return NextResponse.json({ leads, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[GET /api/leads]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
