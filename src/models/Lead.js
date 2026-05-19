import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema(
  {
    // Customer info
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true },
    customerPhone: { type: String },
    address: { type: String },

    // Service details
    serviceCategory: { type: String, required: true },
    description: { type: String, required: true },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency'],
      default: 'medium',
    },
    budget: { type: String },

    // Distribution
    assignedProviders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Provider' }],

    // Status
    status: {
      type: String,
      enum: ['new', 'contacted', 'in_progress', 'closed', 'cancelled'],
      default: 'new',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
