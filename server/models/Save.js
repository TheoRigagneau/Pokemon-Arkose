const mongoose = require('mongoose')
const saveSchema = new mongoose.Schema({
    x: Number,
    y: Number,
    map: String,
    direction: Number,
    volume: { type: Number, default: 0.5 }
})
module.exports = mongoose.model('Save', saveSchema)