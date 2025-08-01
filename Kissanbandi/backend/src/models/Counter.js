const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence: { type: Number, default: 0 }
});

module.exports = mongoose.models.Counter || mongoose.model('Counter', counterSchema);
