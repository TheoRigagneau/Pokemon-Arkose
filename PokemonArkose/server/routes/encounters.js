const express = require('express');
const router = express.Router();
const Encounter = require('../models/Encounter');

router.get('/:zone', async (req, res) => {
  const encounter = await Encounter.findOne({ zone: req.params.zone });
  if (!encounter) return res.status(404).json({ error: 'Zone introuvable' });
  res.json(encounter.pokemons);
});

module.exports = router;    