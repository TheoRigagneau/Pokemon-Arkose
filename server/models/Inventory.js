const mongoose = require('mongoose')

const inventorySchema = new mongoose.Schema({
    itemName: String,
    quantity: { type: Number, default: 0 }
})

module.exports = mongoose.model('Inventory', inventorySchema)