// ── Contact Routes (MongoDB) ────────────────────
const { Router } = require('express');
const { z } = require('zod');
const { validate } = require('../middleware/security');
const Contact = require('../models/Contact');

const router = Router();

const contactSchema = z.object({
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional(),
  subject: z.string().max(200).trim(),
  message: z.string().min(10).max(5000).trim(),
});

// POST /api/contact
router.post('/', validate(contactSchema), async (req, res, next) => {
  try {
    const submission = await Contact.create(req.body);
    console.log('📩 New contact saved:', submission._id);
    res.status(201).json({ message: "Thank you! We'll be in touch." });
  } catch (err) { next(err); }
});

// GET /api/contact  (admin — list all submissions)
router.get('/', async (_req, res, next) => {
  try {
    const submissions = await Contact.find().sort({ createdAt: -1 });
    res.json({ data: submissions });
  } catch (err) { next(err); }
});

module.exports = router;
