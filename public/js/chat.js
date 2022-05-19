const socket = io()
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room, password } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.emit('checkRoomExistense',{room, password},(data) => {
    console.log(data);
    if (data === 'proceed'){
        socket.emit('join', { username, room, password }, (error) => {
            if (error) {
                alert(error)
                location.href = '/'
            }
        })
    }else if (data === 'passwordErr'){
        alert('Incorrect Password !, try again');
        window.history.back();
        return;
    }else if (data === 'roomexists'){
        alert(`room with name ${room} is unavailable at this moment!`);
        window.location.href = '/';
        return;
    }
})


localStorage.setItem('usernameChatApp',username);
document.getElementsByClassName('room-title2')[0].innerText = room;



const autoscroll = () => {
    const $newMessage = $messages.lastElementChild
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

document.getElementById('exitRoom').onclick = () => {
    window.location.replace('/');
}


const passwordValid = true;

socket.on('passwordValidation',(message) => {
    if (message === 'incorrect'){
        alert('Incorrect Password !, try again');
        window.history.back();
    }else{
        socket.emit('join', { username, room, password }, (error) => {
            if (error) {
                alert(error)
                location.href = '/'
            }
        })
    }
})

socket.on('roomexists',(message,type) => {
    if (message === 'roomexists'){
        alert(`${type} room of the same name already exist and is reserved at this time period`);
        window.history.back();
    }
})


socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')  
        })
    })
})

   
    

