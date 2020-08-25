const socket = io();

const permission = Notification.requestPermission().then(function (permission) {
    if (permission === "granted") {
        return true;
    }
});

//index btns
const lectorBtn = document.getElementById('lector');
const relatorBtn = document.getElementById('relator');

//lector elements
const eventosDiv = document.getElementById('eventos');
const feedDiv = document.getElementById('feed');

//relator elements
const createEventBtn = document.getElementById('createEvent');
const form = document.getElementById('form');
const commentInput = document.getElementById('input');
const submitBtn = document.getElementById('submit');
const msgTypeRadioGroup = document.getElementsByName('msgType');

//index events
if (window.location.pathname == '/') {
    //redireccionar a lector
    lectorBtn.addEventListener('click', (e) => {
        window.location.replace("/lector");
    });

    //redireccionar a relator
    relatorBtn.addEventListener('click', (e) => {
        window.location.replace("/relator");
    });
}

//lector events
socket.on('refrescarEventos', (eventos) => {
    if (window.location.pathname == '/lector') {
        eventosDiv.innerHTML = "";
        //renderizar un <p> por cada evento recibido asignandole la funcion de joniear su respectiva room al hacer click
        eventos.forEach(ev => {
            const p = document.createElement('p');
            p.textContent = ev;
            p.addEventListener('click', (e) => {
                socket.emit('joinRoom', ev);
            });
            eventosDiv.appendChild(p);
        });
    }
});

socket.on('message', message => {
    feedDiv.innerHTML += message + '<br>';
    if(permission) new Notification(message);
});

//relator events
let nombreEvento;

if (window.location.pathname == '/relator') {
    form.style.display = "none";
    createEventBtn.addEventListener('click', (e) => {
        //solicitar nombre evento y emitir el evento    
        nombreEvento = prompt('Nombre del evento: ');
        if (nombreEvento) {
            socket.emit('nuevoEvento', nombreEvento);
            createEventBtn.style.display = "none";
            form.style.display = "block";
        }
    });

    submitBtn.addEventListener('click', (e) => {
        const msgType = Array.from(msgTypeRadioGroup).find(radio => radio.checked);
        const message = `<b>${msgType.value}</b> ${commentInput.value}`;
        commentInput.value = "";
        socket.emit('relatorMessage', { message: message, room: nombreEvento });
    });
}