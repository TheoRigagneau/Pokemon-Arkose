require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');

const data = [
    { itemName: "Potion",       quantity: 5  },
    { itemName: "Super Potion", quantity: 3  },
    { itemName: "Rappel",       quantity: 2  },
    { itemName: "Pokéball",     quantity: 10 },
    { itemName: "Super Ball",   quantity: 5  },
    { itemName: "Super Bonbon", quantity: 50  }
]

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        await Inventory.deleteMany({})
        await Inventory.insertMany(data)
        console.log('Inventaire initialisé !')
        mongoose.disconnect()
    })
    .catch(err => console.error(err))