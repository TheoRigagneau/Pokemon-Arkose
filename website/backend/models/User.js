const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    pseudo: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date }
})

module.exports = mongoose.model('User', UserSchema)