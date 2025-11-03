const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// === Joueur ===
class Player {
  constructor() {
    this.width = 30;
    this.height = 30;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - this.height - 10;
    this.speed = 4;
    this.baseSpeed = 4;
    this.boostSpeed = 7;
    this.color = "#0ff";
    this.isDashing = false;
    this.dashCooldown = false;
  }

  move() {
    if (keys["ArrowLeft"] || keys["a"]) this.x -= this.speed;
    if (keys["ArrowRight"] || keys["d"]) this.x += this.speed;
    this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
  }

  dash() {
    if (keys[" "] && !this.dashCooldown) {
      this.isDashing = true;
      this.color = "#fff";
      this.x += 100 * (keys["ArrowRight"] || keys["d"] ? 1 : -1);
      this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
      this.dashCooldown = true;
      setTimeout(() => this.isDashing = false, 200);
      setTimeout(() => {
        this.color = "#0ff";
        this.dashCooldown = false;
      }, 1500);
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x, this.y + this.height);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.closePath();
    ctx.fill();
  }
}

// === Obstacle ===
class Obstacle {
  constructor() {
    this.size = 30;
    this.x = Math.random() * (canvas.width - this.size);
    this.y = -this.size;
    this.speed = 2;
    this.color = "red";
    this.markedForDeletion = false;
  }

  update() {
    this.y += this.speed;
    if (this.y > canvas.height) {
      this.markedForDeletion = true;
      energyFields.push(new EnergyField(this.x + this.size / 2, canvas.height - 40));
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

// === Champ d'énergie ===
class EnergyField {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 10;
    this.color = "lime";
    this.createdAt = Date.now();
    this.collected = false;
  }

  update() {
    if (Date.now() - this.createdAt > 1000) this.collected = true;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

// === Collision ===
function isColliding(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.width > b.x &&
    a.y < b.y + b.size &&
    a.y + a.height > b.y
  );
}

function isTouchingEnergy(player, field) {
  return (
    player.x < field.x + field.width &&
    player.x + player.width > field.x &&
    player.y < field.y + field.height &&
    player.y + player.height > field.y
  );
}

// === Jeu ===
const player = new Player();
let obstacles = [];
let energyFields = [];
let score = 0;
let gameOver = false;

function spawnObstacles() {
  if (!gameOver) {
    obstacles.push(new Obstacle());
    setTimeout(spawnObstacles, 3000);
  }
}

spawnObstacles();

function update() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.move();
  player.dash();
  player.draw();

  obstacles.forEach(ob => {
    ob.update();
    ob.draw();
    if (isColliding(player, ob) && !player.isDashing) {
      gameOver = true;
      alert("Game Over! Score: " + score);
    }
  });

  obstacles = obstacles.filter(ob => !ob.markedForDeletion);

  energyFields.forEach(field => {
    field.update();
    field.draw();
    if (isTouchingEnergy(player, field) && !field.collected) {
      player.speed = player.boostSpeed;
      field.collected = true;
      setTimeout(() => player.speed = player.baseSpeed, 500);
    }
  });

  energyFields = energyFields.filter(field => !field.collected);

  score++;
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);

  requestAnimationFrame(update);
}

update();
