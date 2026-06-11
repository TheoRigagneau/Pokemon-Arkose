const mongoose = require('mongoose')
const pokedexSchema = new mongoose.Schema({
    pokemonId: Number,
    pokemon: String,
})
module.exports = mongoose.model('Pokedex', pokedexSchema)