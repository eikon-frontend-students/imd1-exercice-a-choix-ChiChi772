const board = document.getElementById("board");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("reset");

let currentPlayer = "X";
let grid = Array(9).fill(null);

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner() {
  for (const combo of winningCombinations) {
    const [a, b, c] = combo;
    if (grid[a] && grid[a] === grid[b] && grid[a] === grid[c]) {
      return grid[a];
    }
  }
  if (!grid.includes(null)) return "Egalité";
  return null;
}

function handleClick(e) {
  const index = e.target.dataset.index;
  if (grid[index] || checkWinner() || currentPlayer === "O") return;

  grid[index] = currentPlayer;
  e.target.textContent = currentPlayer;
  e.target.classList.add("taken");

  const winner = checkWinner();
  if (winner) {
    statusText.textContent =
      winner === "Egalité" ? "Match nul !" : `Joueur ${winner} a gagné !`;
    return;
  }

  currentPlayer = "O";
  statusText.textContent = `À ${currentPlayer} de jouer`;

  setTimeout(aiMove, 500);
}

function aiMove() {
  if (checkWinner()) return;

  const emptyCells = grid
    .map((val, idx) => (val === null ? idx : null))
    .filter((val) => val !== null);
  const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];

  grid[randomIndex] = currentPlayer;
  const cell = board.querySelector(`[data-index='${randomIndex}']`);
  cell.textContent = currentPlayer;
  cell.classList.add("taken");

  const winner = checkWinner();
  if (winner) {
    statusText.textContent =
      winner === "Egalité" ? "Match nul !" : `Joueur ${winner} a gagné !`;
  } else {
    currentPlayer = "X";
    statusText.textContent = `À ${currentPlayer} de jouer`;
  }
}

function resetGame() {
  grid = Array(9).fill(null);
  currentPlayer = "X";
  statusText.textContent = "Joueur X commence";
  board.querySelectorAll(".cell").forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("taken");
  });
}

function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;
    cell.addEventListener("click", handleClick);
    board.appendChild(cell);
  }
}

resetBtn.addEventListener("click", resetGame);

createBoard();

const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

let stars = [];
let shootingStars = [];
let mouse = { x: 0, y: 0 };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  stars = [];
  for (let i = 0; i < 120; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.3 + 0.05,
      vx: 0,
      vy: 0,
    });
  }
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function createShootingStar() {
  const angle = Math.PI / 3 + (Math.random() * 0.3 - 0.15);
  const speed = Math.random() * 6 + 8;
  const length = Math.random() * 120 + 80;

  shootingStars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height * 0.4,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    length,
    life: 1,
    fade: 0.015,
  });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stars.forEach((s) => {
    const dx = s.x - mouse.x;
    const dy = s.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 150) {
      const force = (150 - dist) / 150;
      const angle = Math.atan2(dy, dx);
      s.vx += Math.cos(angle) * force * 0.1;
      s.vy += Math.sin(angle) * force * 0.1;
    }

    s.vx *= 0.95;
    s.vy *= 0.95;
    s.x += s.vx;
    s.y += s.vy + s.speed;

    if (s.y > canvas.height) s.y = 0;
    if (s.x > canvas.width) s.x = 0;
    if (s.x < 0) s.x = canvas.width;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.globalAlpha = 0.7;
    ctx.fill();
  });

  shootingStars.forEach((s, i) => {
    const tailX = s.x - (s.vx * s.length) / 10;
    const tailY = s.y - (s.vy * s.length) / 10;
    const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
    grad.addColorStop(0, `rgba(255,255,255,${s.life})`);
    grad.addColorStop(1, "rgba(255,255,255,0)");

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();

    s.x += s.vx;
    s.y += s.vy;
    s.life -= s.fade;

    if (s.life <= 0) shootingStars.splice(i, 1);
  });

  ctx.globalAlpha = 1;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

setInterval(() => {
  if (Math.random() < 0.8) createShootingStar();
}, Math.random() * 5000 + 2000);
