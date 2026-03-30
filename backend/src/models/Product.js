// ── Product Model ───────────────────────────────
const mongoose = require('mongoose');

const specSchema = new mongoose.Schema(
  {
    icon:  { type: String, default: '' },
    label: { type: String, default: '' },
    value: { type: String, default: '' },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String, required: true, trim: true, maxlength: 200,
    },
    slug: {
      type: String, unique: true, lowercase: true, trim: true, index: true,
    },
    category: {
      type: String, required: true,
      enum: ['Sarees', 'Suits', 'Lehengas', 'Accessories'],
    },
    price:         { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0, default: null },
    description:   { type: String, maxlength: 2000, default: '' },
    image:         { type: String, default: '' },           // Cloudinary URL
    cloudinaryPublicId: { type: String, default: '' },     // For deletion
    badge:  { type: String, default: '' },
    specs:  { type: [specSchema], default: [] },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate slug from name (Mongoose 7+ async hook style)
productSchema.pre('save', async function () {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

module.exports = mongoose.model('Product', productSchema);