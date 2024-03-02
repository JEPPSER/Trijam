let canvas = document.querySelector('.canvas');
let g = canvas.getContext('2d');

let currentTime = new Date();
let startTime = new Date();

setInterval(onTimerTick, 5)

function onTimerTick() {
    currentTime = new Date();

    g.fillStyle = "#DDD";
    g.fillRect(0, 0, canvas.width, canvas.height);

    g.fillStyle = '#F00';
    g.fillRect(currentTime.getTime() % canvas.width, 100, 40, 60);
}

document.addEventListener('keydown', function(event) {
    if (event.repeat) {
        return;
    }
    switch (event.key) {
        case 'a':
            console.log('left');
            break;
        case 'd':
            console.log('right');
            break;
        case ' ':
            console.log('jump');
            break;
    }
});