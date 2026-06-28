const express = require('express')
const router = express.Router()
const Save = require('../models/Save')

router.get('/', async (req, res) => {
    const save = await Save.findOne()
    res.json(save ?? null)
})

router.post('/', async (req, res) => {
    await Save.deleteMany({})
    const save = new Save(req.body)
    await save.save()
    res.json(save)
})

module.exports = router