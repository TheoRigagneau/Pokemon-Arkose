const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

const Team = require('./models/Team');
const Badge = require('./models/Badge');
const PC = require('./models/PC');
const Pokedex = require('./models/Pokedex')
const Wallet = require('./models/Wallet')
const Inventory = require('./models/Inventory')

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    await Team.deleteMany({})
    await Badge.deleteMany({})
    await PC.deleteMany({})

    const calcHP = (base, niveau) => Math.floor((2 * base * niveau) / 100) + niveau + 10

    await Team.insertMany([
        { pokemon: "Luxray",     id: 405, niveau: 50, moves: ["discharge", "crunch", "play-rough", "fire-fang"],           xp: 0, currentHP: calcHP(80,  50), maxHP: calcHP(80,  50) },
        { pokemon: "Shaymin",    id: 492, niveau: 42, moves: ["energy-ball", "air-cutter", "zen-headbutt", "earth-power"],  xp: 0, currentHP: calcHP(100, 42), maxHP: calcHP(100, 42) },
        { pokemon: "Torterra",   id: 389, niveau: 45, moves: ["earthquake", "wood-hammer", "stone-edge", "crunch"],         xp: 0, currentHP: calcHP(95,  45), maxHP: calcHP(95,  45) },
        { pokemon: "Étouraptor", id: 398, niveau: 44, moves: ["brave-bird", "close-combat", "u-turn", "roost"],             xp: 0, currentHP: calcHP(83,  44), maxHP: calcHP(83,  44) },
        { pokemon: "Darkrai",    id: 491, niveau: 47, moves: ["dark-void", "dark-pulse", "nasty-plot", "shadow-ball"],      xp: 0, currentHP: calcHP(70,  47), maxHP: calcHP(70,  47) },
    ])

    await Inventory.deleteMany({})
    await Inventory.insertMany([
        { itemName: "Potion",       quantity: 10 },
        { itemName: "Super Potion", quantity: 5  },
        { itemName: "Rappel",       quantity: 3  },
        { itemName: "Pokéball",     quantity: 15 },
        { itemName: "Super Ball",   quantity: 8  },
        { itemName: "Super Bonbon", quantity: 20 },
    ])

    await Badge.insertMany([
        { badgeId: 1 }
    ])

    await PC.insertMany([
        { pokemon: "Palkia",   id: 484, niveau: 55, moves: ["spacial-rend", "hydro-pump", "aura-sphere", "thunder"],       currentHP: calcHP(90, 55), maxHP: calcHP(90, 55), xp: 0 },
        { pokemon: "Pikachu",  id: 25,  niveau: 30, moves: ["thunderbolt", "quick-attack", "iron-tail", "volt-tackle"],    currentHP: calcHP(35, 30), maxHP: calcHP(35, 30), xp: 0 },
        { pokemon: "Lucario",  id: 448, niveau: 40, moves: ["aura-sphere", "close-combat", "extreme-speed", "iron-tail"],  currentHP: calcHP(70, 40), maxHP: calcHP(70, 40), xp: 0 },
        { pokemon: "Giratina", id: 487, niveau: 52, moves: ["shadow-force", "dragon-claw", "aura-sphere", "ancient-power"],currentHP: calcHP(150,52), maxHP: calcHP(150,52), xp: 0 },
        { pokemon: "Mew",      id: 151, niveau: 38, moves: ["psychic", "flamethrower", "ice-beam", "thunderbolt"],         currentHP: calcHP(100,38), maxHP: calcHP(100,38), xp: 0 },
        { pokemon: "Mewtwo",   id: 150, niveau: 60, moves: ["psystrike", "aura-sphere", "ice-beam", "flamethrower"],       currentHP: calcHP(106,60), maxHP: calcHP(106,60), xp: 0 },
    ])

    await Pokedex.insertMany([
        { pokemonId: 403, pokemon: "Shinx" },
        { pokemonId: 404, pokemon: "Luxio" },
        { pokemonId: 405, pokemon: "Luxray" },
        { pokemonId: 492, pokemon: "Shaymin" },
        { pokemonId: 387, pokemon: "Turtwig" },
        { pokemonId: 388, pokemon: "Grotle" },
        { pokemonId: 389, pokemon: "Torterra" },
        { pokemonId: 396, pokemon: "Starly" },
        { pokemonId: 397, pokemon: "Staravia" },
        { pokemonId: 398, pokemon: "Staraptor" },
        { pokemonId: 491, pokemon: "Darkrai" },
        { pokemonId: 484, pokemon: "Palkia" },
        { pokemonId: 25,  pokemon: "Pikachu" },
        { pokemonId: 448, pokemon: "Lucario" },
        { pokemonId: 487, pokemon: "Giratina" },
        { pokemonId: 151, pokemon: "Mew" },
        { pokemonId: 150, pokemon: "Mewtwo" },
    ])

    await Wallet.deleteMany({})
    await Wallet.create({ amount: 22000 })

    console.log('Team, badge et PC seedés !')
    process.exit()
})