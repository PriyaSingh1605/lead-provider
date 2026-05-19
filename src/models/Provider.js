import mongoose from 'mongoose';

const ProviderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    company: { type: String },
    services: [{ type: String }], // e.g. ['plumbing', 'electrical']
    isPriority: { type: Boolean, default: false }, // Always-assigned providers
    isActive: { type: Boolean, default: true },
    leadCount: { type: Number, default: 0 }, // Used for fair round-robin
    avatar: { type: String }, // initials or URL
  },
  { timestamps: true }
);

export default mongoose.models.Provider || mongoose.model('Provider', ProviderSchema);
