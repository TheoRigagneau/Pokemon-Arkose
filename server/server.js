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

app.listen(3000, () => console.log('Serveur lancé sur le port 3000'));