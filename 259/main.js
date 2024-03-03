let canvas = document.querySelector('.canvas');
let g = canvas.getContext('2d');

let audio = new Audio('slow_1.ogg');
audio.loop = true;

var snowballImg = new Image();
snowballImg.src = "snowball.png";
var shovelImg = new Image();
shovelImg.src = "shovel.png";
var tireImg = new Image();
tireImg.src = "tire.png";
var groundImg = new Image();
groundImg.src = "ground.png";
var backgroundImg = new Image();
backgroundImg.src = "background.png";
var playerImgRight = new Image();
playerImgRight.src = "player_right.png";
var playerImgLeft = new Image();
playerImgLeft.src = "player_left.png";

width = 700;
height = 500;

var currentTime;
var deltaTime;
var startTime;
var ground;
var player;
var score;
var shovel;
var tire;
var snowBall;
var offsetX;
var leftDown;
var rightDown;
var drops;

state = 'start';

setInterval(onTimerTick, 5)

function onTimerTick() {
    switch (state) {
        case 'start':
            start();
            break;
        case 'game':
            game();
            break;
        case 'end':
            end();
            break;
    }
}

function start() {
    g.drawImage(backgroundImg, 0, 0);

    g.fillStyle = "#FFF"
    g.font = "bold 48px serif";
    g.fillText("There is too much snow!!", 90, 200);
    g.fillText('Press "Space" to start', 110, 300);
}

function end() {
    g.drawImage(backgroundImg, 0, 0);

    g.fillStyle = "#FFF"
    g.font = "bold 48px serif";
    g.fillText("You died with a score of " + score, 90, 200);
    g.fillText('Press "Space" to try again', 90, 300);
}

function game() {
    deltaTime = new Date().getTime() - currentTime.getTime();
    currentTime = new Date();

    // Update
    updatePlayer();
    updateTire();

    if (snowBall.active) {
        snowBall.x += 0.7;
    }
    
    ground.snowHeight += 0.01;

    // Background
    g.drawImage(backgroundImg, 0, 0);

    // Shovel
    g.drawImage(shovelImg, shovel.x - offsetX, shovel.y);

    // Player
    let scale = (20 - 40 * (((player.x - offsetX) % 100) / 100)) / 100;
    scale = 1 - Math.abs(scale);
    g.scale(1, scale);
    if (player.xVelocity < 0) {
        g.drawImage(playerImgLeft, player.x - offsetX, player.y / scale + (player.height - player.height * scale));
    } else {
        g.drawImage(playerImgRight, player.x - offsetX, player.y / scale + (player.height - player.height * scale));
    }
    g.scale(1, 1 / scale);

    // Tire
    if (tire.active) {
        drawImageWithAngle(tireImg, tire.x - offsetX, tire.y, (tire.x * 0.01) % (Math.PI * 2));
    }

    // Snow ball
    if (snowBall.active) {
        drawImageWithAngle(snowballImg, snowBall.x - offsetX, snowBall.y, (snowBall.x * 0.01) % (Math.PI * 2));
    }

    // Snow
    g.fillStyle = "#FFF";
    g.fillRect(ground.x, ground.y - ground.snowHeight, ground.width, ground.snowHeight);

    snow();

    // Ground
    g.drawImage(groundImg, ground.x, ground.y);

    g.font = 'bold 32px serif';
    g.fillText('score: ' + score, 10, 40)
}

function startGame() {
    audio.play();

    currentTime = new Date();
    deltaTime = 0;
    startTime = new Date();

    ground = {
        x: 0,
        y: height - 100,
        width: width,
        height: 100,
        snowHeight: 0
    }

    player = {
        x: 0,
        y: ground.y - 50,
        width: 50,
        height: 50,
        xVelocity: 0,
        yVelocity: 0,
        slowTimer: 0,
        grounded: false
    }

    shovel = {
        x: 400,
        y: 200,
        width: 50,
        height: 50
    }

    tire = {
        x: 0,
        y: ground.y - 50,
        height: 50,
        width: 50,
        active: false,
        spawnTimer: 0
    }

    snowBall = {
        x: -300,
        y: ground.y - 200,
        width: 200,
        height: 200,
        active: false
    }

    drops = [];

    offsetX = 0;

    leftDown = false;
    rightDown = false;

    score = 0;

    state = 'game';
}

function startKeyDown(key) {
    if (key == ' ') {
        startGame();
    }
}

function gameKeyDown(key) {
    switch (key) {
        case 'a':
            leftDown = true;
            break;
        case 'd':
            rightDown = true;
            snowBall.active = true;
            break;
        case ' ':
            if (player.grounded) {
                player.yVelocity = -5;
            }
            break;
    }
}

document.addEventListener('keydown', function(event) {
    if (event.repeat) {
        return;
    }
    switch (state) {
        case 'start':
            startKeyDown(event.key);
            break;
        case 'game':
            gameKeyDown(event.key);
            break;
        case 'end':
            startKeyDown(event.key);
            break;
    }
});

document.addEventListener('keyup', function(event) {
    switch (event.key) {
        case 'a':
            leftDown = false;
            break;
        case 'd':
            rightDown = false;
            break;
    }
});

function intersects(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 <= (x2 + w2) && x2 <= (x1 + w1) && y1 <= (y2 + h2) && y2 <= (y1 + h1);
}

function updatePlayer() {
    if (player.slowTimer > 0) {
        player.slowTimer -= deltaTime;
    }

    let snowBreak = 1 - (ground.snowHeight / 40);
    if (snowBreak < 0.3 || player.slowTimer > 0) {
        snowBreak = 0.3;
    }

    player.yVelocity += 0.1;
    if (player.yVelocity > 3) {
        player.yVelocity = 3;
    }
    if (leftDown) {
        player.xVelocity -= (0.1 * snowBreak);
        if (player.xVelocity < -1 * snowBreak) {
            player.xVelocity = -1 * snowBreak;
        }
    } else if (rightDown) {
        player.xVelocity += (0.1 * snowBreak);
        if (player.xVelocity > 1 * snowBreak) {
            player.xVelocity = 1 * snowBreak;
        }
    } else if (Math.abs(player.xVelocity) > 0.1) {
        if (player.xVelocity < 0) {
            player.xVelocity += 0.1;
        } else {
            player.xVelocity -= 0.1;
        }
    } else {
        player.xVelocity = 0;
    }

    player.x += player.xVelocity;
    player.y += player.yVelocity;

    if (player.x - offsetX > width) {
        offsetX += width;
        score++;
        tire.spawnTimer = Math.random() * 5000;
    } else if (player.x + player.width - offsetX < 0) {
        offsetX -= width;
        score--;
    }

    // Collission
    player.grounded = false;
    if (player.y + player.height > ground.y) {
        player.y = ground.y - player.height - 1;
        player.grounded = true;
    }
    if (intersects(player.x, player.y, player.width, player.height, shovel.x, shovel.y, shovel.width, shovel.height)) {
        ground.snowHeight = 0;
        shovel.x += 1200;
    }
    if (intersects(player.x, player.y, player.width, player.height, snowBall.x + 50, snowBall.y + 50, snowBall.width - 100, snowBall.height - 100)) {
        state = 'end';
    }
}

function updateTire() {
    if (tire.active) {
        tire.x -= 2;

        if (intersects(player.x, player.y, player.width, player.height, tire.x, tire.y, tire.width, tire.height)) {
            player.slowTimer = 3000;
        }

        if (tire.x + tire.width < offsetX) {
            tire.active = false;
        }
    } else if (tire.spawnTimer > 0) {
        tire.spawnTimer -= deltaTime;
        if (tire.spawnTimer <= 0) {
            spawnTire();
        }
    }
}

function spawnTire() {
    tire.active = true;
    tire.x = offsetX + width;
    tire.spawnTimer = 0;
}

function drawImageWithAngle(image, imgX, imgY, angleInRadians) {
    var x = imgX + image.width / 2;
    var y = imgY + image.height / 2;
    
    g.translate(x, y);
    g.rotate(angleInRadians);
    g.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);
    g.rotate(-angleInRadians);
    g.translate(-x, -y);
}

function snow() {
    let randAngle = Math.random() / (10 - 5) - (0.5 / (10 - 5));
    let drop = {angle: Math.PI / 2 + randAngle, speed: 0.5, x: Math.random() * width, y: 0 };
    drops.push(drop);

    g.globalAlpha = 0.5;
    g.fillStyle = '#FFF';
    for (let i = 0; i < drops.length; i++) {
        let length = drops[i].speed * (deltaTime / 4)
        let x = Math.cos(drops[i].angle) * length
        let y = Math.sin(drops[i].angle) * length
        drops[i].y += y
        drops[i].x += x

        g.fillRect(drops[i].x, drops[i].y, 3, 3);
        if (drops[i].y > canvas.height) {
            drops.splice(i, 1)
        }
    }
    g.globalAlpha = 1.0;
}