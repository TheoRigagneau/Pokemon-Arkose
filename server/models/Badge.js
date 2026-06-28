const mongoose = require('mongoose')
const badgeSchema = new mongoose.Schema({
    badgeId: Number
})
module.exports = mongoose.model('Badge', badgeSchema)