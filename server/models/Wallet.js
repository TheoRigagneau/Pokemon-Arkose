const mongoose = require('mongoose')
const walletSchema = new mongoose.Schema({
    amount: { type: Number, default: 2000 }
})
module.exports = mongoose.model('Wallet', walletSchema)