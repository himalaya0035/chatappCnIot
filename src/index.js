const path = require('path')
const http = require('http')
const fs = require('fs')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback();
    })

    socket.on('checkRoomExistense',(options,callback) => {
        const password = options.password ? options.password : '';
        const type = password ? 'private' : 'public';
        const room = options.room;
        const allrooms = [];
        const filedata = fs.readFileSync('./src/rooms.txt',{encoding:'utf8', flag:'r'});
        var lines = filedata.toString().split('\n');
        for (let i = 0;i<lines.length-1;i++){
            allrooms.push(JSON.parse(lines[i]));
        }
        const found = allrooms.find(r => r.room === room);
        if (found){
            if (found.password.length > 0 && password.length > 0){
                if (found.password !== password){
                    callback('passwordErr')
                }else{
                    callback('proceed');
                }
            }else if (found.password.length > 0 && password.length === 0){
                callback('roomexists');
            }else if (found.password.length === 0 && password.length > 0){
                callback('roomexists');
            }else if (found.password.length === 0 && password.length === 0){
                callback('proceed');
            }
        }else{
            const data = {
                "room":room,
                "password":password,
                "type":type
            }
            fs.appendFile('./src/rooms.txt',JSON.stringify(data) + '\r\n', (err,data) => {
                callback('proceed');
            })
        }
    })

    socket.on('sendMessage', (message, callback) => {
        let user = getUser(socket.id)
        if (user === undefined){
            user = {
                room : '',
            }
        }
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        let result = {
            user:'',
            len:'',
        }
        result = removeUser(socket.id);
        if (result === undefined){
            result = {
                user:'',
                len:'',
            }
        }
        const user = result.user ? result.user : '';
        const len = result.len;
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        if (len === 0){
            const allrooms = [];
            const filedata = fs.readFileSync('./src/rooms.txt',{encoding:'utf8', flag:'r'});
            var lines = filedata.toString().split('\n');
            for (let i = 0;i<lines.length-1;i++){
                allrooms.push(JSON.parse(lines[i]));
            }
            const index = allrooms.findIndex(r => r.room === user.room);
            if (index){
                allrooms.splice(index, 1);
                let writethisstring = '';
                for (let i = 0;i<allrooms.length;i++){
                    writethisstring += JSON.stringify(allrooms[i]) + '\n';
                }
                fs.writeFile('./src/rooms.txt',writethisstring,(err,data) => {})
            }
           
        }
    })



})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})