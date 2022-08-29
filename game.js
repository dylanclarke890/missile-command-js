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

canvas.addEventListener("mousemove", (e) => {
  mouse.x = e.x - canvasPosition.left;
  mouse.y = e.y - canvasPosition.top;
});

window.addEventListener("resize", () => {
  canvasPosition = canvas.getBoundingClientRect();
});

canvas.addEventListener("click", () => {});

function handleGameArea() {
  const { height } = canvas;
  ctx.strokeStyle = "limegreen";
  ctx.lineWidth = 2.5;

  const current = {
    y: height - 30,
    x: 0,
  };
  const incline = { x: 15, y: 40 };
  const main = 60;
  const ends = 30;
  const gaps = (canvas.width - (2 * ends + 6 * incline.x + 3 * main)) / 2;

  const connect = () => ctx.lineTo(current.x, current.y);
  const strokeHill = () => {
    current.x += incline.x;
    current.y -= incline.y;
    connect();
    current.x += main;
    connect();
    current.x += incline.x;
    current.y += incline.y;
    connect();
  };
  ctx.beginPath();
  ctx.moveTo(current.x, current.y);
  current.x += ends;
  connect();
  strokeHill();
  current.x += gaps;
  connect();
  strokeHill();
  current.x += gaps;
  connect();
  strokeHill();
  current.x += ends;
  connect();
  ctx.stroke();
  ctx.closePath();
}

(function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  handleGameArea();
  requestAnimationFrame(animate);
})();