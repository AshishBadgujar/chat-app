const chatForm = document.getElementById('chat-form');
const chatMessage = document.querySelector('.chat-messages');
const roomName1 = document.querySelector('.brand-logo');
const roomName2 = document.getElementById('room-name');
const userList = document.querySelector('.userList')

document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems);
});
// get data from url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

const socket = io('/');

// join room
socket.emit('join-room', { username, room });

socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    //scroll down
    chatMessage.scrollTop = chatMessage.scrollHeight;
})

// get user and room 
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// message submit 
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = e.target.elements.msg.value
    console.log(msg)
    socket.emit('chatMessage', msg);

    //clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();

})

// output msg to dom 
function outputMessage(message) {
    const div = document.createElement('div')
    if (message.username === '') {
        div.classList.add('center1');
        div.innerHTML = `<p>${message.text}</p>`
        document.querySelector('.chat-messages').appendChild(div)
    } else {
        div.classList.add('message');
        if (message.username === username) {
            div.classList.add('right');
            div.innerHTML = `<p class="text">${message.text}</p><p class="meta"><span class="right">${message.time}</span></p>`
        } else {
            div.classList.add('left');
            div.innerHTML = `<p class="meta">${message.username}-<span>${message.time}</span></p><p class="text">${message.text}</p>`
        }
        document.querySelector('.chat-messages').appendChild(div)
    }
}

// add room name to dom 
function outputRoomName(room) {
    roomName1.innerText = room;
    roomName2.innerText = room;
}

function outputUsers(users) {
    userList.innerHTML = `
    ${users.map(user => `<li><a>${user.username}</a></li>`).join('')}
    `
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) {
        window.location = '../index.html';
    } else {
    }
});