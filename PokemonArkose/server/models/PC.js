const mongoose = require('mongoose')
const pcSchema = new mongoose.Schema({
    pokemon: String,
    id: Number,
    niveau: Number,
    moves: [String],
    currentHP: { type: Number, default: null },
    maxHP: { type: Number, default: null },
    xp: { type: Number, default: 0 }
})
module.exports = mongoose.model('PC', pcSchema)