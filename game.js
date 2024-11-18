// Obtém o elemento canvas do DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Função para ajustar o tamanho do canvas dinamicamente
function resizeCanvas() {
    const deviceWidth = window.innerWidth;

    if (deviceWidth <= 768) {
        canvas.width = window.innerWidth * 1.0;
        canvas.height = window.innerHeight * 0.7;
    } else if (deviceWidth > 768 && deviceWidth <= 1024) {
        canvas.width = window.innerWidth * 0.95;
        canvas.height = window.innerHeight * 0.75;
    } else {
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.85;
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Objeto representando o carro do jogador
const car = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    width: 50,
    height: 80,
    speed: 5,
};

// Variáveis globais
let obstacles = [];
let score = 0;
let gameSpeed = 2;
let gameOver = false;
let roadOffset = 0;

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

const controls = {
    left: false,
    right: false,
    up: false,
    down: false,
};

// Eventos para dispositivos desktop (teclado)
if (!isTouchDevice) {
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') controls.left = true;
        if (e.key === 'ArrowRight') controls.right = true;
        if (e.key === 'ArrowUp') controls.up = true;
        if (e.key === 'ArrowDown') controls.down = true;
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') controls.left = false;
        if (e.key === 'ArrowRight') controls.right = false;
        if (e.key === 'ArrowUp') controls.up = false;
        if (e.key === 'ArrowDown') controls.down = false;
    });
}

// Eventos para dispositivos móveis (toque)
if (isTouchDevice) {
    let touchStartX = 0;
    let touchStartY = 0;

    // Evento para início do toque
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Previna o comportamento padrão do navegador
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    });

    // Evento para movimento do toque
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault(); // Previna o comportamento padrão do navegador
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        const sensitivity = 15; // Ajuste de sensibilidade

        controls.left = deltaX < -sensitivity;
        controls.right = deltaX > sensitivity;
        controls.up = deltaY < -sensitivity;
        controls.down = deltaY > sensitivity;

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    });

    // Evento para fim do toque
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault(); // Previna o comportamento padrão do navegador
        controls.left = false;
        controls.right = false;
        controls.up = false;
        controls.down = false;
    });
}

// Funções do jogo
function moveCar() {
    if (controls.left) car.x = Math.max(0, car.x - car.speed);
    if (controls.right) car.x = Math.min(canvas.width - car.width, car.x + car.speed);
    if (controls.up) car.y = Math.max(0, car.y - car.speed);
    if (controls.down) car.y = Math.min(canvas.height - car.height, car.y + car.speed);
}

function drawRoad() {
    ctx.fillStyle = '#444444';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#FFFFFF';
    ctx.setLineDash([20, 20]);
    ctx.lineWidth = 2;

    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(canvas.width * (i + 1) / 4, (roadOffset % 40) - 40);
        ctx.lineTo(canvas.width * (i + 1) / 4, canvas.height);
        ctx.stroke();
    }
    roadOffset += gameSpeed;
}

function drawCar() {
    ctx.fillStyle = '#FF5733';
    ctx.fillRect(car.x, car.y, car.width, car.height);

    ctx.fillStyle = '#C70039';
    ctx.fillRect(car.x + 5, car.y + 10, car.width - 10, car.height / 2);

    ctx.fillStyle = '#2980B9';
    ctx.fillRect(car.x + 10, car.y + 15, car.width - 20, car.height / 4);

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(car.x + 10, car.y + car.height - 5, 5, 0, Math.PI * 2);
    ctx.arc(car.x + car.width - 10, car.y + car.height - 5, 5, 0, Math.PI * 2);
    ctx.fill();
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = '#FFA500'; // Laranja
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function moveObstacles() {
    obstacles.forEach(obstacle => (obstacle.y += gameSpeed));
    obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height);

    if (Math.random() < 0.02) {
        obstacles.push({ x: Math.random() * (canvas.width - 50), y: -50, width: 50, height: 50 });
    }
}

function checkCollision() {
    return obstacles.some(obstacle =>
        car.x < obstacle.x + obstacle.width &&
        car.x + car.width > obstacle.x &&
        car.y < obstacle.y + obstacle.height &&
        car.y + car.height > obstacle.y
    );
}

function updateScore() {
    score++;
    if (score % 100 === 0) gameSpeed += 0.5;
}

function drawScore() {
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 30px Arial';
    ctx.fillText(`Pontuação: ${score}`, 20, 50);
}

function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 30px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 70, canvas.height / 2);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRoad();
    moveCar();
    moveObstacles();
    drawCar();
    drawObstacles();
    drawScore();

    if (checkCollision()) {
        gameOver = true;
    } else {
        updateScore();
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
