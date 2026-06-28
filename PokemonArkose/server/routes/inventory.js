const express = require('express')
const router = express.Router()
const Inventory = require('../models/Inventory')
const Item = require('../models/Item')

router.get('/', async (req, res) => {
    const inventory = await Inventory.find()
    res.json(inventory)
})

router.get('/items', async (req, res) => {
    const items = await Item.find()
    res.json(items)
})

router.post('/', async (req, res) => {
    const { itemName, quantity } = req.body
    const existing = await Inventory.findOne({ itemName })
    if (existing) {
        existing.quantity += quantity
        await existing.save()
        res.json(existing)
    } else {
        const newItem = new Inventory({ itemName, quantity })
        await newItem.save()
        res.json(newItem)
    }
})

router.patch('/:itemName', async (req, res) => {
    const item = await Inventory.findOneAndUpdate(
        { itemName: req.params.itemName },
        { $inc: { quantity: req.body.quantity } },
        { new: true }
    )
    res.json(item)
})

module.exports = router