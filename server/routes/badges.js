const express = require('express')
const router = express.Router()
const Badge = require('../models/Badge')

router.get('/', async (req, res) => {
    console.log("badge reçu:", req.body)
    const badges = await Badge.find()
    res.json(badges)
})

router.post('/', async (req, res) => {
    console.log("badge reçu:", req.body)
    const existing = await Badge.findOne({ badgeId: req.body.badgeId })
    if (existing) return res.json(existing)
    const badge = new Badge({ badgeId: req.body.badgeId })
    await badge.save()
    res.json(badge)
})

module.exports = router