// ── Order Model ─────────────────────────────────
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  slug:  { type: String, required: true },
  price: { type: Number, required: true },
  qty:   { type: Number, required: true, min: 1 },
  image: { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  items: { type: [orderItemSchema], required: true, validate: v => v.length > 0 },
  customer: {
    name:  { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
  },
  shipping: {
    address1: { type: String, required: true, trim: true },
    address2: { type: String, trim: true, default: '' },
    city:     { type: String, required: true, trim: true },
    state:    { type: String, required: true, trim: true },
    pinCode:  { type: String, required: true, trim: true },
    country:  { type: String, default: 'India' },
  },
  total:  { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  paymentMethod: { type: String, default: 'cod' },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
