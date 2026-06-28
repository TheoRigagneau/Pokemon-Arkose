const express = require('express')
const router = express.Router()
const Starter = require('../models/Starter')

router.get('/', async (req, res) => {
    const starter = await Starter.findOne()
    res.json(starter ?? { chosen: false })
})

router.post('/', async (req, res) => {
    await Starter.deleteMany({})
    const starter = new Starter({ chosen: true })
    await starter.save()
    res.json(starter)
})

module.exports = router