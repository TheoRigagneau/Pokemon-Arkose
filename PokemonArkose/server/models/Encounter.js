const mongoose = require('mongoose');

const pokemonEncounterSchema = new mongoose.Schema({
  pokemon: String,
  id: Number,
  niveauMin: Number,
  niveauMax: Number,
  chance: Number
});

const encounterSchema = new mongoose.Schema({
  zone: String,
  pokemons: [pokemonEncounterSchema]
});

module.exports = mongoose.model('Encounter', encounterSchema);