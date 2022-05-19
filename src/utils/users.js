const fs = require('fs')

let users = [];
const getUsersfromfile = () => {
    const allusers = [];
    const filedata = fs.readFileSync('./src/users.txt',{encoding:'utf8', flag:'r'});
    var lines = filedata.toString().split('\n');
    for (let i = 0;i<lines.length-1;i++){
        allusers.push(JSON.parse(lines[i]));
    }
    users = allusers;
}
getUsersfromfile();
const addUser = ({ id, username, room}) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    const user = { id, username, room }
    users.push(user)
    fs.appendFile('./src/users.txt',JSON.stringify(user) + '\n',(err,data) => {})
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    const user = users[index];
    users.splice(index, 1);
    if (index !== -1) {
        return {user : user ? user : '',len : users.length};
    } 
    
}

const getUser = (id) => {
    getUsersfromfile();
    console.log(id);
    console.log(users);
    const user = users.find((user) => user.id === id);
    console.log(user);
    return user;
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}