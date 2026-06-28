require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Encounter = require('./models/Encounter');
const Item = require('./models/Item');

const data = [
  {
    zone: "route1_herbe",
    pokemons: [
      { pokemon: "Pidgey", id: 16, niveauMin: 2, niveauMax: 4, chance: 40 },
      { pokemon: "Caterpie", id: 10, niveauMin: 3, niveauMax: 5, chance: 35 },
      { pokemon: "Bidoof", id: 399, niveauMin: 2, niveauMax: 5, chance: 25 }
    ]
  },
  {
    zone: "route2_herbe",
    pokemons: [
      { pokemon: "Pikachu", id: 25, niveauMin: 3, niveauMax: 6, chance: 20 },
      { pokemon: "Pidgey", id: 21, niveauMin: 3, niveauMax: 5, chance: 35 },
      { pokemon: "Bidoof", id: 402, niveauMin: 2, niveauMax: 5, chance: 30 },
      { pokemon: "Meowth", id: 52, niveauMin: 2, niveauMax: 5, chance: 15 }
    ]
  }
];

const itemData = [
    { name: "Potion",       type: "heal",     healAmount: 20},
    { name: "Super Potion", type: "heal",     healAmount: 50},
    { name: "Rappel",       type: "revive",   healAmount: 0 },
    { name: "Pokéball",     type: "pokeball", healAmount: 0 },
    { name: "Super Ball",   type: "pokeball", healAmount: 0 },
    { name: "Super Bonbon", type: "candy", healAmount: 0,   }
]

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await Encounter.deleteMany({});
    await Encounter.insertMany(data);

    await Item.deleteMany({});
    await Item.insertMany(itemData);
    console.log('Données importées !');
    mongoose.disconnect();
  })
  .catch(err => console.error(err));