const mongoose = require('mongoose')

const trainerSchema = new mongoose.Schema({
    pnjId: Number,
    defeated: { type: Boolean, default: false }
})

module.exports = mongoose.model('Trainer', trainerSchema)