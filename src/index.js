const path = require('path')
const http = require('http')
const express = require('express')
const socketIo = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { 
    addUser, 
    removeUser, 
    getUser, 
    getUsersInRoom 
} = require('./utils/users')

const filter = new Filter();

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')
// console.log(__dirname, publicDirPath);

app.use(express.static(publicDirPath))

io.on('connect', (socket) => {
    // console.log('New web socket connection')


    socket.on('join', (options, cb) => {
        const {user, error} = addUser({ id: socket.id, ...options})
        if (error) {
            return cb(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        cb()
    })

    socket.on('sendMessage', (msg, cb) => {

        if (filter.isProfane(msg)) {
            return cb('Profanity is not allowed')
        }

        const user = getUser(socket.id)

        io.to(user.room).emit('message', generateMessage(msg, user.username))
        cb()
    })

    socket.on('sendLocation', (locationData, cb) => {
        const user = getUser(socket.id)
        io.emit('locationMessage', generateLocationMessage(user.username, locationData))

        cb('Location shared ')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
            
            io.emit('message', generateMessage(`${user.username} has left`))
        }      
    })
})



server.listen(port, () => {
    console.log(`Server running on ${port} port`);
})
