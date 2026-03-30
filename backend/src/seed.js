// ── Seed Script ─────────────────────────────────
// Run: node src/seed.js OR npm run seed
// Populates the database with initial products

// Fix for ISP DNS blocking MongoDB SRV records
require('dns').setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const { env } = require('./config/env');
const Product = require('./models/Product');

const seedProducts = [
  {
    name: 'Banarasi Silk Saree',
    slug: 'banarasi-silk-saree',
    category: 'Sarees',
    price: 12999,
    originalPrice: 18999,
    description: 'A masterpiece from the looms of Varanasi. This pure Banarasi silk saree features an intricate gold zari border with traditional motifs passed down through generations. Perfect for weddings, pujas, and special occasions.',
    image: '/images/silk-saree.png',
    badge: '✦ New',
    specs: [
      { icon: '🧶', label: 'Fabric', value: 'Pure Banarasi Silk' },
      { icon: '✨', label: 'Work', value: 'Gold Zari Weaving' },
      { icon: '🎨', label: 'Color', value: 'Royal Maroon & Gold' },
      { icon: '📏', label: 'Length', value: '6.3 meters with blouse piece' },
      { icon: '🧼', label: 'Care', value: 'Dry clean only' },
      { icon: '🎪', label: 'Occasion', value: 'Wedding · Festive · Pooja' },
    ],
    status: true,
  },
  {
    name: 'Emerald Anarkali Suit',
    slug: 'emerald-anarkali-suit',
    category: 'Suits',
    price: 8499,
    originalPrice: 12999,
    description: 'This stunning floor-length anarkali in emerald green georgette features delicate gold thread embroidery across the bodice and hemline. Comes with a matching dupatta and churidar.',
    image: '/images/anarkali-suit.png',
    badge: '✦ Bestseller',
    specs: [
      { icon: '🧶', label: 'Fabric', value: 'Georgette with Net Dupatta' },
      { icon: '✨', label: 'Work', value: 'Gold Thread Embroidery' },
      { icon: '🎨', label: 'Color', value: 'Emerald Green & Gold' },
      { icon: '📏', label: 'Set', value: 'Kurta + Churidar + Dupatta' },
      { icon: '🧼', label: 'Care', value: 'Dry clean recommended' },
      { icon: '🎪', label: 'Occasion', value: 'Party · Sangeet · Reception' },
    ],
    status: true,
  },
  {
    name: 'Royal Bridal Lehenga',
    slug: 'royal-bridal-lehenga',
    category: 'Lehengas',
    price: 45999,
    originalPrice: 65000,
    description: 'A showstopper bridal lehenga in deep burgundy with heavy gold threadwork, mirror embellishments, and sequin detailing. Includes a matching embroidered blouse and heavy dupatta with border.',
    image: '/images/bridal-lehenga.png',
    badge: '✦ Festive',
    specs: [
      { icon: '🧶', label: 'Fabric', value: 'Velvet & Raw Silk' },
      { icon: '✨', label: 'Work', value: 'Zardozi, Mirror, Sequin' },
      { icon: '🎨', label: 'Color', value: 'Burgundy Red & Gold' },
      { icon: '📏', label: 'Set', value: 'Lehenga + Blouse + Dupatta' },
      { icon: '🧼', label: 'Care', value: 'Professional dry clean only' },
      { icon: '🎪', label: 'Occasion', value: 'Wedding · Engagement · Bridal' },
    ],
    status: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`⏭️  Database already has ${count} products. Skipping seed.`);
      console.log('   (To re-seed, drop the collection first: db.products.drop())');
    } else {
      await Product.insertMany(seedProducts);
      console.log(`🌱 Seeded ${seedProducts.length} products successfully!`);
    }

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
