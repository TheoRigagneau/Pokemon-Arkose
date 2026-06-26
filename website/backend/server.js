const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http')
const { Server } = require('socket.io')
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
const server = http.createServer(app)
const io = new Server(server, {
    cors: { origin: "http://localhost:3001" }
})

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connecté à MongoDB !'))
  .catch(err => console.error('Erreur:', err));

const authRouter = require('./routes/auth')
app.use('/api/auth', authRouter)

const Message = require('./models/Message')

io.on('connection', (socket) => {
    console.log('Utilisateur connecté:', socket.id)

    socket.on('joinChannel', (channelId) => {
        socket.join(channelId)
    })

    socket.on('sendMessage', async (data) => {
        const message = new Message({
            content: data.content,
            author: data.author,
            channelId: data.channelId
        })
        await message.save()
        io.to(data.channelId).emit('newMessage', {
            ...data,
            _id: message._id,
            createdAt: message.createdAt
        })
    })

    socket.on('disconnect', () => {
        console.log('Utilisateur déconnecté:', socket.id)
    })

    socket.on('deleteMessage', (data) => {
        io.to(data.channelId).emit('messageDeleted', data.messageId)
    })
})

const channelsRouter = require('./routes/channels')
app.use('/api/channels', channelsRouter)


server.listen(4000, () => console.log('Serveur lancé sur le port 4000'));