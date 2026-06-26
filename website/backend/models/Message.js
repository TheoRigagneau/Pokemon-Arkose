const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: String, required: true },
    channelId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Message', MessageSchema)