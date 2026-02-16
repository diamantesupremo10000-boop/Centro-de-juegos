const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Estado del juego
let isGameOver = false;

// Entidades
const player = {
    x: canvas.width * 0.25,
    y: canvas.height * 0.6,
    size: 40,
    hp: 100,
    color: '#00d2ff',
    baseColor: '#00d2ff',
    state: 'idle',
    stateTimer: 0
};

const enemy = {
    x: canvas.width * 0.75,
    y: canvas.height * 0.6,
    size: 70,
    hp: 100,
    color: '#ff3366',
    baseColor: '#ff3366',
    state: 'idle',
    stateTimer: 0,
    attackCooldown: 100
};

// Interfaz
const playerHpFill = document.getElementById('player-hp-fill');
const enemyHpFill = document.getElementById('enemy-hp-fill');
const feedbackText = document.getElementById('feedback-text');

function showFeedback(text, color) {
    feedbackText.innerText = text;
    feedbackText.style.color = color;
    feedbackText.style.opacity = 1;
    setTimeout(() => { feedbackText.style.opacity = 0; }, 600);
}

function updateHpBars() {
    playerHpFill.style.width = Math.max(0, player.hp) + '%';
    enemyHpFill.style.width = Math.max(0, enemy.hp) + '%';
}

// Funciones de Control (compatibles con PC y Móvil)
function handleDodge(e) {
    e.preventDefault();
    if (isGameOver) return resetGame();
    if (player.state === 'idle') {
        player.state = 'dodging';
        player.stateTimer = 35; // Ventana de invulnerabilidad (frames)
        player.color = '#334455'; 
    }
}

function handleAttack(e) {
    e.preventDefault();
    if (isGameOver) return resetGame();
    if (player.state === 'idle') {
        player.state = 'attacking';
        player.stateTimer = 15;
        
        // Lógica de PARRY (Contraataque perfecto)
        if (enemy.state === 'telegraph') {
            showFeedback('¡PARRY PERFECTO!', '#ffd700');
            enemy.hp -= 20; // Daño crítico
            enemy.state = 'idle';
            enemy.attackCooldown = 150; // Aturdimiento
            player.color = '#ffffff';
        } else {
            // Ataque normal
            enemy.hp -= 3;
            player.color = '#00ffaa';
        }
        updateHpBars();
    }
}

// Asignar eventos (Touch para móvil, Mousedown para ratón en PC)
document.getElementById('zone-dodge').addEventListener('touchstart', handleDodge, {passive: false});
document.getElementById('zone-dodge').addEventListener('mousedown', handleDodge);
document.getElementById('zone-attack').addEventListener('touchstart', handleAttack, {passive: false});
document.getElementById('zone-attack').addEventListener('mousedown', handleAttack);

function resetGame() {
    player.hp = 100;
    enemy.hp = 100;
    player.state = 'idle';
    enemy.state = 'idle';
    enemy.attackCooldown = 100;
    isGameOver = false;
    updateHpBars();
    requestAnimationFrame(gameLoop);
}

// Motor Gráfico y Lógico
function gameLoop() {
    if (isGameOver) return;

    // --- LÓGICA JUGADOR ---
    if (player.state !== 'idle') {
        player.stateTimer--;
        if (player.stateTimer <= 0) {
            player.state = 'idle';
            player.color = player.baseColor;
        }
    }

    // --- LÓGICA ENEMIGO ---
    enemy.attackCooldown--;
    
    // Preparar ataque (Aviso amarillo)
    if (enemy.attackCooldown <= 0 && enemy.state === 'idle') {
        enemy.state = 'telegraph';
        enemy.stateTimer = 40; // Tiempo de reacción para el jugador
        enemy.color = '#ffd700';
    }

    // Ejecutar ataque
    if (enemy.state === 'telegraph') {
        enemy.stateTimer--;
        if (enemy.stateTimer <= 0) {
            enemy.state = 'attacking';
            enemy.stateTimer = 20;
            enemy.color = '#ff0000'; // Color de daño
            
            // Verificar si el jugador fue impactado
            if (player.state !== 'dodging') {
                player.hp -= 15;
                showFeedback('¡IMPACTO!', '#ff0000');
                updateHpBars();
            } else {
                showFeedback('ESQUIVADO', '#00d2ff');
            }
        }
    }

    // Recuperación del enemigo
    if (enemy.state === 'attacking') {
        enemy.stateTimer--;
        if (enemy.stateTimer <= 0) {
            enemy.state = 'idle';
            enemy.color = enemy.baseColor;
            enemy.attackCooldown = 60 + Math.random() * 80;
        }
    }

    // --- CONDICIONES DE VICTORIA/DERROTA ---
    if (player.hp <= 0) {
        showFeedback('DERROTA - Toca para reiniciar', '#ff3366');
        isGameOver = true;
    } else if (enemy.hp <= 0) {
        showFeedback('¡VICTORIA! - Toca para reiniciar', '#00ffaa');
        isGameOver = true;
    }

    // --- DIBUJAR EN PANTALLA ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar Enemigo
    ctx.fillStyle = enemy.color;
    let ex = enemy.x;
    if (enemy.state === 'telegraph') ex += (Math.random() - 0.5) * 10; // Temblor de aviso
    if (enemy.state === 'attacking') ex -= 40; // Abalanzarse
    ctx.fillRect(ex - enemy.size/2, enemy.y - enemy.size/2, enemy.size, enemy.size);

    // Dibujar Jugador
    ctx.fillStyle = player.color;
    let px = player.x;
    if (player.state === 'attacking') px += 30; // Animación de ataque
    if (player.state === 'dodging') px -= 30; // Animación de esquive
    ctx.fillRect(px - player.size/2, player.y - player.size/2, player.size, player.size);

    // Siguiente Frame
    requestAnimationFrame(gameLoop);
}

// Iniciar
updateHpBars();
requestAnimationFrame(gameLoop);
