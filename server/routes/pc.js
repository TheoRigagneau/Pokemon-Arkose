const express = require('express')
const router = express.Router()
const PC = require('../models/PC')

router.get('/', async (req, res) => {
    const pc = await PC.find()
    res.json(pc)
})

router.post('/', async (req, res) => {
    const poke = new PC(req.body)
    await poke.save()
    res.json(poke)
})

router.delete('/', async (req, res) => {
    await PC.deleteMany({})
    res.json({ ok: true })
})

module.exports = router