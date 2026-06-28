const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
    name: String,
    type: String,
    healAmount: { type: Number, default: 0 },
    description: String
})

module.exports = mongoose.model('Item', itemSchema)