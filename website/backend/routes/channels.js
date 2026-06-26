const express = require('express')
const router = express.Router()
const Channel = require('../models/Channel')
const Message = require('../models/Message')

router.get('/', async (req, res) => {
    const channels = await Channel.find().sort({ createdAt: -1 })
    res.json(channels)
})

router.post('/', async (req, res) => {
    const { name, description, createdBy } = req.body
    const channel = new Channel({ name, description, createdBy })
    await channel.save()
    res.json(channel)
})

router.delete('/:id', async (req, res) => {
    const { pseudo } = req.body
    const channel = await Channel.findById(req.params.id)
    if (!channel) return res.status(404).json({ error: 'Channel introuvable' })
    if (channel.createdBy !== pseudo) return res.status(403).json({ error: 'Non autorisé' })
    await Channel.findByIdAndDelete(req.params.id)
    await Message.deleteMany({ channelId: req.params.id })
    res.json({ message: 'Channel supprimé' })
})

router.delete('/:channelId/messages/:messageId', async (req, res) => {
    const { pseudo } = req.body
    const message = await Message.findById(req.params.messageId)
    if (!message) return res.status(404).json({ error: 'Message introuvable' })
    if (message.author !== pseudo) return res.status(403).json({ error: 'Non autorisé' })
    await Message.findByIdAndDelete(req.params.messageId)
    res.json({ message: 'Message supprimé' })
})

router.get('/:id/messages', async (req, res) => {
    const messages = await Message.find({ channelId: req.params.id }).sort({ createdAt: 1 })
    res.json(messages)
})

module.exports = router