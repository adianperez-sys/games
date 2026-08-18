// --- Element References ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const currentScoreEl = document.getElementById("currentScore");
const highScoreEl = document.getElementById("highScore");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlaySubtitle = document.getElementById("overlaySubtitle");

// --- Game Configuration Parameters ---
const gridSize = 20; // Size of each tile in pixels
const tileCount = canvas.width / gridSize; // Number of tiles across (20x20)

// --- Game State Variables ---
let snake = [];
let dx = 0;
let dy = 0;
let food = { x: 0, y: 0 };
let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;
let gameSpeed = 120; // Starting delay in milliseconds (lower = faster)
let isPaused = false;
let isRunning = false;
let gameLoopTimeout = null;

highScoreEl.innerText = highScore;

// Initialize or reset game values
function initGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 }
  ];
  dx = 0;
  dy = -1; // Default moving Up
  score = 0;
  gameSpeed = 120;
  currentScoreEl.innerText = score;
  spawnFood();
}

// Main execution step
function tick() {
  if (!isRunning || isPaused) return;

  update();
  draw();

  // Schedule next frame with current speed
  gameLoopTimeout = setTimeout(tick, gameSpeed);
}

function update() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // 1. Check Wall Collisions
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    handleGameOver();
    return;
  }

  // 2. Check Self Collisions
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      handleGameOver();
      return;
    }
  }

  snake.unshift(head);

  // 3. Check Food Collision
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    currentScoreEl.innerText = score;

    // Update High Score if beaten
    if (score > highScore) {
      highScore = score;
      highScoreEl.innerText = highScore;
      localStorage.setItem("snakeHighScore", highScore);
    }

    // Dynamic Speed Scaling: Speed up every 50 points
    if (score % 50 === 0 && gameSpeed > 50) {
      gameSpeed -= 10;
    }

    spawnFood();
  } else {
    snake.pop(); // Remove tail segment if no food eaten
  }
}

function draw() {
  // Clear screen
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Food
  ctx.fillStyle = "#FF5722";
  ctx.fillRect(food.x * gridSize + 1, food.y * gridSize + 1, gridSize - 2, gridSize - 2);

  // Draw Snake (Head is darker green)
  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? "#2E7D32" : "#4CAF50";
    ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2);
  });
}

function spawnFood() {
  // Generate random coordinates until food is not on top of snake body
  let validPosition = false;
  while (!validPosition) {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    validPosition = !snake.some(part => part.x === food.x && part.y === food.y);
  }
}

function handleGameOver() {
  isRunning = false;
  clearTimeout(gameLoopTimeout);
  overlayTitle.innerText = "Game Over!";
  overlaySubtitle.innerText = `Final Score: ${score}. Press Space to Play Again`;
  overlay.classList.remove("hidden");
}

// --- Keyboard Event Handling ---
window.addEventListener("keydown", e => {
  const key = e.key.toLowerCase();

  // Handle Pause / Start Toggle
  if (e.code === "Space" || key === "p") {
    if (!isRunning) {
      initGame();
      isRunning = true;
      overlay.classList.add("hidden");
      tick();
    } else {
      isPaused = !isPaused;
      if (isPaused) {
        overlayTitle.innerText = "Paused";
        overlaySubtitle.innerText = "Press Space or P to Resume";
        overlay.classList.remove("hidden");
      } else {
        overlay.classList.add("hidden");
        tick();
      }
    }
    return;
  }

  // Directional Controls (WASD & Arrows) with reverse-prevention check
  if ((key === "arrowup" || key === "w") && dy !== 1) {
    dx = 0; dy = -1;
  } else if ((key === "arrowdown" || key === "s") && dy !== -1) {
    dx = 0; dy = 1;
  } else if ((key === "arrowleft" || key === "a") && dx !== 1) {
    dx = -1; dy = 0;
  } else if ((key === "arrowright" || key === "d") && dx !== -1) {
    dx = 1; dy = 0;
  }
});
