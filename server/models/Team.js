const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  pokemon: String,
  id: Number,
  niveau: Number,
  moves: [String],
  capturedAt: { type: Date, default: Date.now },
  currentHP: { type: Number, default: null },
  xp: { type: Number, default: 0 }
});

module.exports = mongoose.model('Team', teamSchema);