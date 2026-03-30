// ── Contact Model ───────────────────────────────
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, maxlength: 100 },
  lastName:  { type: String, required: true, trim: true, maxlength: 100 },
  email:     { type: String, required: true, trim: true, lowercase: true, maxlength: 255 },
  phone:     { type: String, trim: true, maxlength: 20, default: '' },
  subject:   { type: String, required: true, trim: true, maxlength: 200 },
  message:   { type: String, required: true, trim: true, maxlength: 5000 },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Contact', contactSchema);
