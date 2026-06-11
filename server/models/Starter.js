const mongoose = require('mongoose')
const starterSchema = new mongoose.Schema({
    chosen: { type: Boolean, default: false }
})
module.exports = mongoose.model('Starter', starterSchema)