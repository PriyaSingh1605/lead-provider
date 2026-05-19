/**
 * Seed script — populates the DB with sample providers.
 * Run with: npm run seed
 *
 * Providers seeded:
 *  - 3 Priority providers (always get leads in their category)
 *  - 5 Regular providers (get leads via round-robin)
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prowider';

const ProviderSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  company: String,
  services: [String],
  isPriority: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  leadCount: { type: Number, default: 0 },
}, { timestamps: true });

const Provider = mongoose.models.Provider || mongoose.model('Provider', ProviderSchema);

const providers = [
  // === PRIORITY PROVIDERS ===
  {
    name: 'Rajesh Kumar',
    email: 'rajesh@eliteplumbing.in',
    phone: '+91 98100 11111',
    company: 'Elite Plumbing Co.',
    services: ['Plumbing', 'HVAC / Air Conditioning'],
    isPriority: true,
    isActive: true,
    leadCount: 0,
  },
  {
    name: 'Sunita Mehta',
    email: 'sunita@sparkelec.in',
    phone: '+91 98100 22222',
    company: 'Spark Electrical Solutions',
    services: ['Electrical', 'Security Systems', 'Solar Installation'],
    isPriority: true,
    isActive: true,
    leadCount: 0,
  },
  {
    name: 'Anil Sharma',
    email: 'anil@masterclean.in',
    phone: '+91 98100 33333',
    company: 'Master Clean Services',
    services: ['Cleaning', 'Pest Control'],
    isPriority: true,
    isActive: true,
    leadCount: 0,
  },

  // === REGULAR PROVIDERS (Round-Robin) ===
  {
    name: 'Priya Nair',
    email: 'priya@nairbuilders.in',
    phone: '+91 98100 44444',
    company: 'Nair Builders',
    services: ['Carpentry', 'Roofing', 'Painting'],
    isPriority: false,
    isActive: true,
    leadCount: 0,
  },
  {
    name: 'Mohammed Siddiqui',
    email: 'siddiqui@greenscapes.in',
    phone: '+91 98100 55555',
    company: 'Greenscapes India',
    services: ['Landscaping', 'Pest Control'],
    isPriority: false,
    isActive: true,
    leadCount: 0,
  },
  {
    name: 'Kavitha Reddy',
    email: 'kavitha@designstudio.in',
    phone: '+91 98100 66666',
    company: 'Kavitha Design Studio',
    services: ['Interior Design', 'Painting', 'Carpentry'],
    isPriority: false,
    isActive: true,
    leadCount: 0,
  },
  {
    name: 'Vikram Singh',
    email: 'vikram@techsolar.in',
    phone: '+91 98100 77777',
    company: 'TechSolar Systems',
    services: ['Solar Installation', 'Electrical', 'Security Systems'],
    isPriority: false,
    isActive: true,
    leadCount: 0,
  },
  {
    name: 'Deepa Krishnan',
    email: 'deepa@deepaclean.in',
    phone: '+91 98100 88888',
    company: 'Deepa Home Services',
    services: ['Cleaning', 'Plumbing', 'Carpentry'],
    isPriority: false,
    isActive: true,
    leadCount: 0,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB:', MONGODB_URI);

    // Clear existing providers
    await Provider.deleteMany({});
    console.log('🗑️  Cleared existing providers.');

    // Insert fresh providers
    const inserted = await Provider.insertMany(providers);
    console.log(`🌱 Seeded ${inserted.length} providers:\n`);

    const priority = inserted.filter((p) => p.isPriority);
    const regular = inserted.filter((p) => !p.isPriority);

    console.log('⭐ PRIORITY PROVIDERS (always receive leads):');
    priority.forEach((p) => console.log(`   ${p.name} — ${p.services.join(', ')}`));

    console.log('\n🔄 REGULAR PROVIDERS (round-robin):');
    regular.forEach((p) => console.log(`   ${p.name} — ${p.services.join(', ')}`));

    console.log('\n✅ Seed complete! You can now start the dev server: npm run dev');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
