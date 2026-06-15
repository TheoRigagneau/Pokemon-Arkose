const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    await mongoose.connection.collection('teams').deleteMany({})
    await mongoose.connection.collection('starters').deleteMany({})
    await mongoose.connection.collection('saves').deleteMany({})
    await mongoose.connection.collection('pcs').deleteMany({})
    await mongoose.connection.collection('trainers').deleteMany({})
    await mongoose.connection.collection('pokedexes').deleteMany({})
    await mongoose.connection.collection('inventories').deleteMany({})
    console.log('Reset complet !')
    process.exit()
})