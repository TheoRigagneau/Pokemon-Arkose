const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

router.post('/register', async (req, res) => {
    const { pseudo, email, password } = req.body
    
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ error: 'Email déjà utilisé' })
    
    const hashed = await bcrypt.hash(password, 10)
    
    const user = new User({ pseudo, email, password: hashed })
    await user.save()
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    
    res.json({ token, pseudo: user.pseudo })
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body
    
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ error: 'Email introuvable' })
    
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).json({ error: 'Mot de passe incorrect' })
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    
    res.json({ token, pseudo: user.pseudo })
})

const crypto = require('crypto')
const nodemailer = require('nodemailer')

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body
    
    const user = await User.findOne({ email })
    if (!user) return res.json({ message: 'Si cet email existe, un lien vous sera envoyé.' })
    
    const token = crypto.randomBytes(32).toString('hex')
    user.resetToken = token
    user.resetTokenExpiry = Date.now() + 3600000 // 1 heure
    await user.save()
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    })
    try {
    await transporter.sendMail({
        from: '"Pokemon Arkose" <noreply@pokemon-arkose.com>',
        to: email,
        subject: 'Réinitialisation de mot de passe',
        html: `<p>Clique sur ce lien pour réinitialiser ton mot de passe :</p>
               <a href="http://localhost:3000/reset-password?token=${token}">Réinitialiser</a>
               <p>Ce lien expire dans 1 heure.</p>`
    })
        
        res.json({ message: 'Email envoyé !' })
    } catch (err) {
        console.error('Erreur envoi email:', err)
        res.status(500).json({ error: 'Erreur envoi email' })
    }
})

router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body
    
    const user = await User.findOne({ 
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
    })
    
    if (!user) return res.status(400).json({ error: 'Token invalide ou expiré' })
    
    user.password = await bcrypt.hash(password, 10)
    user.resetToken = null
    user.resetTokenExpiry = null
    await user.save()
    
    res.json({ message: 'Mot de passe mis à jour !' })
})

module.exports = router