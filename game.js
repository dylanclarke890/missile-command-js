function new2dCanvas(id, width, height) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  return [canvas, ctx];
}

function drawText(text, font, fillStyle, x, y, maxWidth = undefined) {
  if (font) ctx.font = font;
  if (fillStyle) ctx.fillStyle = fillStyle;
  ctx.fillText(text, x, y, maxWidth);
}

function randUpTo(num, floor = false) {
  const res = Math.random() * num;
  return floor ? Math.floor(res) : res;
}

function isCircleRectColliding(circle, rect) {
  const distX = Math.abs(circle.x - rect.x - rect.w / 2);
  const distY = Math.abs(circle.y - rect.y - rect.h / 2);
  if (distX > rect.w / 2 + circle.r) return false;
  if (distY > rect.h / 2 + circle.r) return false;
  if (distX <= rect.w / 2) return true;
  if (distY <= rect.h / 2) return true;
  const dx = distX - rect.w / 2;
  const dy = distY - rect.h / 2;
  return dx * dx + dy * dy <= circle.r * circle.r;
}

function isRectRectColliding(first, second) {
  if (!first || !second) return false;
  if (
    !(
      first.x > second.x + second.w ||
      first.x + first.w < second.x ||
      first.y > second.y + second.h ||
      first.y + first.h < second.y
    )
  ) {
    return true;
  }
  return false;
}

const [canvas, ctx] = new2dCanvas("play-area", 800, 500);
let canvasPosition = canvas.getBoundingClientRect();

const mouse = {
  x: 0,
  y: 0,
  w: 0.1,
  h: 0.1,
};

const setMousePosition = (e) => {
  mouse.x = e.x - canvasPosition.left;
  mouse.y = e.y - canvasPosition.top;
};

canvas.addEventListener("mousemove", setMousePosition);

window.addEventListener("resize", () => {
  canvasPosition = canvas.getBoundingClientRect();
});

canvas.addEventListener("click", (e) => {
  setMousePosition(e);
  for (let i = 0; i < state.cannons.length; i++) {
    const cannon = state.cannons[i];
    state.missiles.push(
      new Missile(cannon.x + cannon.w / 2, cannon.y, { x: mouse.x, y: mouse.y })
    );
  }
});

class Cannon {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = cannon.w;
    this.h = cannon.h;
  }

  update() {}

  draw() {
    ctx.fillStyle = "blue";
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

class Missile {
  constructor(x, y, target) {
    this.x = x;
    this.y = y;
    this.w = 10;
    this.h = 30;
    this.target = target;
    this.destroy = false;

    const distance = {
      x: target.x - x,
      y: target.y - y,
    };
    const angle = Math.atan2(distance.y, distance.x);
    const speed = settings.levels[currentRun.level].missileSpeed;
    this.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    };
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    if (
      this.x < 0 ||
      this.x + this.w > canvas.width ||
      this.y < 0 ||
      this.y + this.h > canvas.height
    )
      this.destroy = true;
  }

  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.w, this.h);
    // ctx.fillRect(this.target.x, this.target.y, 5, 5);
    drawText("x", "20px Arial", "pink", this.target.x, this.target.y);
  }
}

const cannon = { w: 20, h: 20 };
const cannonIncline = { x: 15, y: 40 };
const hillW = 60;
const endsOffset = 30;
const gapsBetweenCannons =
  (canvas.width - (2 * endsOffset + 6 * cannonIncline.x + 3 * hillW)) / 2;
const cannonLocations = [];
cannonLocations[0] = endsOffset + cannonIncline.x + hillW / 2 - cannon.w / 2;
const cannonGap = hillW + gapsBetweenCannons + cannonIncline.x * 2;
cannonLocations[1] = cannonLocations[0] + cannonGap;
cannonLocations[2] = cannonLocations[1] + cannonGap;

const currentRun = {
  level: 0,
  score: 0,
};
let currentLevel = 0;
const state = {
  cannons: [
    new Cannon(cannonLocations[0], canvas.height - 90),
    new Cannon(cannonLocations[1], canvas.height - 90),
    new Cannon(cannonLocations[2], canvas.height - 90),
  ],
  missiles: [],
};

const settings = {
  levels: [{ missileSpeed: 10 }],
};

function handleGameAreaSetup() {
  const { height } = canvas;
  ctx.strokeStyle = "limegreen";
  ctx.lineWidth = 2.5;

  const current = {
    y: height - 30,
    x: 0,
  };

  const connectPoint = () => ctx.lineTo(current.x, current.y);
  const strokeCannonHill = () => {
    current.x += cannonIncline.x;
    current.y -= cannonIncline.y;
    connectPoint();
    current.x += hillW;
    connectPoint();
    current.x += cannonIncline.x;
    current.y += cannonIncline.y;
    connectPoint();
  };
  ctx.beginPath();
  ctx.moveTo(current.x, current.y);
  current.x += endsOffset;
  connectPoint();
  strokeCannonHill();
  current.x += gapsBetweenCannons;
  connectPoint();
  strokeCannonHill();
  current.x += gapsBetweenCannons;
  connectPoint();
  strokeCannonHill();
  current.x += endsOffset;
  connectPoint();
  ctx.stroke();
  ctx.closePath();
}

function handleCannons() {
  for (let i = 0; i < state.cannons.length; i++) {
    state.cannons[i].update();
    state.cannons[i].draw();
  }
}

function handleMissiles() {
  for (let i = 0; i < state.missiles.length; i++) {
    state.missiles[i].update();
    state.missiles[i].draw();
  }
}

function handleObjectCleanup() {
  state.missiles = state.missiles.filter((missile) => !missile.destroy);
}

(function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  handleGameAreaSetup();
  handleCannons();
  handleMissiles();
  handleObjectCleanup();
  requestAnimationFrame(animate);
})();