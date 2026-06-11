const express = require('express')
const router = express.Router()
const Wallet = require('../models/Wallet')

router.get('/', async (req, res) => {
    let wallet = await Wallet.findOne()
    if (!wallet) {
        wallet = new Wallet({ amount: 2000 })
        await wallet.save()
    }
    res.json(wallet)
})

router.patch('/', async (req, res) => {
    let wallet = await Wallet.findOne()
    if (!wallet) {
        wallet = new Wallet({ amount: 2000 })
    }
    wallet.amount += req.body.amount
    await wallet.save()
    res.json(wallet)
})

module.exports = router