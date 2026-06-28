const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connecté à MongoDB !'))
  .catch(err => console.error('Erreur:', err));

const encountersRouter = require('./routes/encounters');
app.use('/api/encounters', encountersRouter);

const teamRouter = require('./routes/team');
app.use('/api/team', teamRouter);

const inventoryRoutes = require('./routes/inventory')
app.use('/api/inventory', inventoryRoutes)

const itemRoutes = require('./routes/items')
app.use('/api/items', itemRoutes)

const badgesRouter = require('./routes/badges')
app.use('/api/badges', badgesRouter)

const trainerRoutes = require('./routes/trainers')
app.use('/api/trainers', trainerRoutes)

const starterRoutes = require('./routes/starter')
app.use('/api/starter', starterRoutes)

const pokedexRoutes = require('./routes/pokedex')
app.use('/api/pokedex', pokedexRoutes)

const walletRoutes = require('./routes/wallet')
app.use('/api/wallet', walletRoutes)

const saveRoutes = require('./routes/save')
app.use('/api/save', saveRoutes)

const pcRoutes = require('./routes/pc')
app.use('/api/pc', pcRoutes)

app.listen(3000, () => console.log('Serveur lancé sur le port 3000'));