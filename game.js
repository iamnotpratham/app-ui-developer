const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 14;
const PLAYER_X = 20;
const AI_X = canvas.width - PLAYER_X - PADDLE_WIDTH;
const PADDLE_SPEED = 7;
const AI_SPEED = 4;
const BALL_SPEED = 7;

// Initial state
let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let ballX = canvas.width / 2 - BALL_SIZE / 2;
let ballY = canvas.height / 2 - BALL_SIZE / 2;
let ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
let ballVelY = BALL_SPEED * (Math.random() * 2 - 1);

// Mouse control
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  // Mouse Y position relative to canvas
  const mouseY = e.clientY - rect.top;
  playerY = mouseY - PADDLE_HEIGHT / 2;
  // Clamp the paddle
  if (playerY < 0) playerY = 0;
  if (playerY + PADDLE_HEIGHT > canvas.height) playerY = canvas.height - PADDLE_HEIGHT;
});

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawBall(x, y, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
}

function resetBall() {
  ballX = canvas.width / 2 - BALL_SIZE / 2;
  ballY = canvas.height / 2 - BALL_SIZE / 2;
  ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
  ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
}

function aiMove() {
  const aiCenter = aiY + PADDLE_HEIGHT / 2;
  if (aiCenter < ballY + BALL_SIZE / 2 - 10) {
    aiY += AI_SPEED;
  } else if (aiCenter > ballY + BALL_SIZE / 2 + 10) {
    aiY -= AI_SPEED;
  }
  // Clamp
  if (aiY < 0) aiY = 0;
  if (aiY + PADDLE_HEIGHT > canvas.height) aiY = canvas.height - PADDLE_HEIGHT;
}

function collision(x, y, w, h, bx, by, bs) {
  // AABB collision
  return (
    x < bx + bs &&
    x + w > bx &&
    y < by + bs &&
    y + h > by
  );
}

function update() {
  // Move ball
  ballX += ballVelX;
  ballY += ballVelY;

  // Ball collision with top/bottom walls
  if (ballY <= 0 || ballY + BALL_SIZE >= canvas.height) {
    ballVelY = -ballVelY;
    ballY = Math.max(0, Math.min(ballY, canvas.height - BALL_SIZE));
  }

  // Ball collision with player paddle
  if (collision(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, ballX, ballY, BALL_SIZE)) {
    ballVelX = Math.abs(ballVelX);
    // Add a bit of vertical randomness
    ballVelY = ((ballY + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2)) * 0.25 + (Math.random() - 0.5) * 2;
  }

  // Ball collision with AI paddle
  if (collision(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, ballX, ballY, BALL_SIZE)) {
    ballVelX = -Math.abs(ballVelX);
    ballVelY = ((ballY + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2)) * 0.25 + (Math.random() - 0.5) * 2;
  }

  // Ball out of bounds (left or right)
  if (ballX < 0 || ballX + BALL_SIZE > canvas.width) {
    resetBall();
  }

  aiMove();
}

function draw() {
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw middle line
  ctx.strokeStyle = "#666";
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw paddles and ball
  drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, "#fff");
  drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, "#fff");
  drawBall(ballX, ballY, BALL_SIZE, "#fff");
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();