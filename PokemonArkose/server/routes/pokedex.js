const express = require('express')
const router = express.Router()
const Pokedex = require('../models/Pokedex')

router.get('/', async (req, res) => {
    const seen = await Pokedex.find().sort({ pokemonId: 1 })
    res.json(seen)
})

router.post('/', async (req, res) => {
    const { pokemonId, pokemon } = req.body
    const existing = await Pokedex.findOne({ pokemonId })
    if (existing) return res.json(existing)
    const entry = new Pokedex({ pokemonId, pokemon })
    await entry.save()
    res.json(entry)
})

module.exports = router