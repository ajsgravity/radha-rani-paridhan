// ── Order Routes ────────────────────────────────
const { Router } = require('express');
const { z } = require('zod');
const { requireAuth, validate } = require('../middleware/security');
const Order = require('../models/Order');

const router = Router();

const orderSchema = z.object({
  items: z.array(z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    price: z.number().positive(),
    qty: z.number().int().positive(),
    image: z.string().optional(),
  })).min(1, 'At least one item is required'),
  customer: z.object({
    name: z.string().min(1).max(200).trim(),
    email: z.string().email().max(255),
    phone: z.string().max(20).optional(),
  }),
  shipping: z.object({
    address1: z.string().min(1).max(500).trim(),
    address2: z.string().max(500).optional(),
    city: z.string().min(1).max(100).trim(),
    state: z.string().min(1).max(100).trim(),
    pinCode: z.string().min(1).max(10).trim(),
    country: z.string().default('India'),
  }),
  total: z.number().positive(),
  paymentMethod: z.string().default('cod'),
});

// POST /api/orders — place a new order
router.post('/', validate(orderSchema), async (req, res, next) => {
  try {
    const order = await Order.create(req.body);
    console.log('🛒 New order placed:', order._id);
    res.status(201).json({ data: order });
  } catch (err) { next(err); }
});

// GET /api/orders — list all orders (admin)
router.get('/', requireAuth, async (_req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ data: orders });
  } catch (err) { next(err); }
});

// GET /api/orders/:id — get single order
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ data: order });
  } catch (err) { next(err); }
});

// PUT /api/orders/:id — update order status (admin)
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ data: order });
  } catch (err) { next(err); }
});

module.exports = router;
