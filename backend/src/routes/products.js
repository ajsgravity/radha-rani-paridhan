// ── Product Routes ──────────────────────────────
const { Router } = require('express');
const { z } = require('zod');
const { requireAuth, validate } = require('../middleware/security');
const { upload } = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const Product = require('../models/Product');

const router = Router();

// ── Validation Schema ───────────────────────────
const productSchema = z.object({
  name:          z.string().min(1).max(200).trim(),
  category:      z.enum(['Sarees', 'Suits', 'Lehengas', 'Accessories']),
  price:         z.coerce.number().positive().max(1_000_000),
  originalPrice: z.coerce.number().positive().max(1_000_000).optional().nullable(),
  description:   z.string().max(2000).optional().default(''),
  image:         z.string().max(1000).optional().default(''),
  cloudinaryPublicId: z.string().max(500).optional().default(''),
  badge:         z.string().max(50).optional().default(''),
  slug:          z.string().max(200).optional(),
  status:        z.coerce.boolean().optional().default(true),
  specs:         z.array(z.object({
    icon:  z.string().optional().default(''),
    label: z.string().optional().default(''),
    value: z.string().optional().default(''),
  })).optional().default([]),
});

// ── POST /api/products/upload — image upload ────
// Must be before /:idOrSlug to avoid route conflict
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }
  res.json({
    url:       req.file.path,
    publicId:  req.file.filename,
  });
});

// ── GET /api/products ───────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status !== undefined) filter.status = status === 'true';
    else filter.status = true; // public: only active by default

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ data: products });
  } catch (err) { next(err); }
});

// ── GET /api/products/all  (admin — all including drafts) ──
router.get('/all', requireAuth, async (_req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ data: products });
  } catch (err) { next(err); }
});

// ── GET /api/products/:idOrSlug ─────────────────
router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const product = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
      ? await Product.findById(idOrSlug)
      : await Product.findOne({ slug: idOrSlug, status: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: product });
  } catch (err) { next(err); }
});

// ── POST /api/products  (admin only) ───────────
router.post('/', requireAuth, validate(productSchema), async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ data: product });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Product slug already exists' });
    next(err);
  }
});

// ── PUT /api/products/:id  (admin only) ────────
router.put('/:id', requireAuth, validate(productSchema.partial()), async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: product });
  } catch (err) { next(err); }
});

// ── DELETE /api/products/:id  (admin only) ─────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    // Delete image from Cloudinary if present
    if (product.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(product.cloudinaryPublicId).catch(console.error);
    }
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;