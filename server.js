const path = require('path');
const http = require('http');
// const https = require('https');
const express = require('express');
const socketio = require('socket.io');
const formateMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')

const app = express();
// const server = https.createServer(app);
const server = http.createServer(app);
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', (req, res) => {
//     res.sendFile(__dirname, '/public/index.html')
// })

const botName = '';

io.on('connection', socket => {
    socket.on('join-room', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room)
        // welcome current user 
        socket.emit('message', formateMessage(botName, 'welcome to chat room'));

        // broadcast when user joined 
        socket.broadcast.to(user.room).emit('message', formateMessage(botName, `${user.username} has joined the chat`));
        //send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    });

    // listen for chat message
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formateMessage(user.username, msg));
    });

    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        if (user) {
            io.to(user.room).emit('message', formateMessage(botName, `${user.username} has left the chat`));
            //send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    });
})

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
})