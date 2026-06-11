const express = require('express')
const router = express.Router()
const Trainer = require('../models/Trainer')

router.get('/:pnjId', async (req, res) => {
    const trainer = await Trainer.findOne({ pnjId: req.params.pnjId })
    res.json(trainer ?? { defeated: false })
})

router.patch('/:pnjId', async (req, res) => {
    const trainer = await Trainer.findOneAndUpdate(
        { pnjId: req.params.pnjId },
        { defeated: true },
        { new: true, upsert: true }
    )
    res.json(trainer)
})

module.exports = router