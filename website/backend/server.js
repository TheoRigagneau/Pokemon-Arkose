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

const authRouter = require('./routes/auth')
console.log("Route auth chargée")
app.use('/api/auth', authRouter)
app.listen(4000, () => console.log('Serveur lancé sur le port 4000'));