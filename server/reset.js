const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    await mongoose.connection.collection('teams').deleteMany({})
    console.log('Collection teams vidée !')
    process.exit()
})