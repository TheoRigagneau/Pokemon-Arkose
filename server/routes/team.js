const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

router.get('/', async (req, res) => {
    const team = await Team.find();
    res.json(team);
});

router.post('/', async (req, res) => {
    console.log("body reçu:", req.body)
    const { pokemon, id, niveau, moves} = req.body;
    const newPokemon = new Team({ pokemon, id, niveau, moves });
    await newPokemon.save();
    res.json(newPokemon);
});

router.patch('/:id', async (req, res) => {
    const pokemon = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(pokemon)
})

module.exports = router;