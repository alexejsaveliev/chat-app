const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('#message-form input')
const $messageFormButton = document.querySelector('#message-form button')
const $sendLocationButton = document.querySelector('#sendLocation')
const $messages = document.querySelector('#messages')


//Templates
const $messageTemplate = document.querySelector('#messageTemplate').innerHTML
const $locationTemplate = document.querySelector('#locationTemplate').innerHTML
const $sidebarTemplate = document.querySelector("#sidebarTemplate").innerHTML

//Options 
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    //get new message
    const $newMessage = $messages.lastElementChild

    //get hight newMessage element
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const contentHeight = $messages.scrollHeight

    //how far have I scroll 
    const scrollOffset = $messages.scrollTop + visibleHeight

    if ( contentHeight - newMessageHeight <= scrollOffset ) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
   
    const message = e.target.elements.message.value

    $messageFormButton.setAttribute('disabled', 'disabled')

    socket.emit('sendMessage', message, (err) => {
        
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

       if ( err ) {
           return console.log(err)
       }

    //    console.log('Message delivered')
    })
    message.textContent = ''
})

$sendLocationButton.addEventListener('click', (e) => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not support by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude
        }, (msg) => {
            console.log(msg)
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.on('locationMessage', (msg) => {
    const html = Mustache.render($locationTemplate, {
        username: msg.username,
        link: msg.locationLink,
        createdAt: moment(msg.createdAt).format('H:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)

    autoscroll()
})

socket.on('message', (msg) => {
    const html = Mustache.render($messageTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('H:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)

    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})