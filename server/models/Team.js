const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  pokemon: String,
  id: Number,
  niveau: Number,
  moves: [String],
  capturedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', teamSchema);