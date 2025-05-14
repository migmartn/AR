let bouncing = false;
let positionY = 0.5;
let direction = 1;
let pato, ball;
let sound;

const moveSpeed = 0.15;
const pushStrength = 0.7;

let patoPosition = { x: 0, y: 0.5, z: 0 };
let targetPosition = { x: 0, y: 0.5, z: 0 };
let patoRotationY = 0;
let targetRotationY = 0;
let patoTiltX = 0;
let targetTiltX = 0;

let ballPosition = { x: 0.3, y: 0.1, z: 0.3 };
let ballVelocity = { x: 0, z: 0 };

window.onload = function () {
  pato = document.getElementById("animated-pato");
  ball = document.getElementById("ball");
  sound = document.getElementById("duck-sound");
  animateMovement();
};

function toggleBounce() {
  bouncing = !bouncing;
  if (bouncing) {
    function animateBounce() {
      if (!bouncing) return;
      positionY += 0.02 * direction;
      if (positionY >= 1 || positionY <= 0.5) {
        direction *= -1;
      }
      updatePatoTransform();
      requestAnimationFrame(animateBounce);
    }
    animateBounce();
  }
}

function playDuckSound() {
  sound.currentTime = 0;
  sound.play().catch(console.error);
}

function zoomIn() {
  const camera = document.querySelector("[camera]");
  let pos = camera.getAttribute("position");
  camera.setAttribute("position", { x: pos.x, y: pos.y, z: pos.z - 0.1 });
}

function zoomOut() {
  const camera = document.querySelector("[camera]");
  let pos = camera.getAttribute("position");
  camera.setAttribute("position", { x: pos.x, y: pos.y, z: pos.z + 0.1 });
}

document.addEventListener('keydown', (e) => {
  if (e.key === "ArrowUp") movePato('up');
  if (e.key === "ArrowDown") movePato('down');
  if (e.key === "ArrowLeft") movePato('left');
  if (e.key === "ArrowRight") movePato('right');
});

function movePato(direction) {
  const step = 0.3;
  switch (direction) {
    case "up":
      targetPosition.z -= step;
      targetRotationY = 0;
      break;
    case "down":
      targetPosition.z += step;
      targetRotationY = 180;
      break;
    case "left":
      targetPosition.x -= step;
      targetRotationY = 90;
      break;
    case "right":
      targetPosition.x += step;
      targetRotationY = -90;
      break;
  }

  if (navigator.vibrate) navigator.vibrate(50);
  targetTiltX = -10;
  setTimeout(() => { targetTiltX = 0; }, 300);
}

function animateMovement() {
  // Movimiento del pato
  patoPosition.x += (targetPosition.x - patoPosition.x) * moveSpeed;
  patoPosition.z += (targetPosition.z - patoPosition.z) * moveSpeed;

  let deltaRotation = (targetRotationY - patoRotationY + 540) % 360 - 180;
  patoRotationY += deltaRotation * 0.1;
  patoTiltX += (targetTiltX - patoTiltX) * 0.1;

  // Detectar colisión con pelota
  const dx = ballPosition.x - patoPosition.x;
  const dz = ballPosition.z - patoPosition.z;
  const distance = Math.sqrt(dx * dx + dz * dz);
  if (distance < 0.3) {
    ballVelocity.x += dx * pushStrength;
    ballVelocity.z += dz * pushStrength;
    ball.setAttribute("color", "#00FF00");
  } else {
    ball.setAttribute("color", "#FF0000");
  }

  // Movimiento de la pelota con rebote
  ballPosition.x += ballVelocity.x;
  ballPosition.z += ballVelocity.z;

  // Rebote contra los límites virtuales
  const limit = 1; // 1 metro en cada dirección
  if (ballPosition.x > limit || ballPosition.x < -limit) {
    ballVelocity.x *= -0.7;
    ballPosition.x = Math.max(Math.min(ballPosition.x, limit), -limit);
  }
  if (ballPosition.z > limit || ballPosition.z < -limit) {
    ballVelocity.z *= -0.7;
    ballPosition.z = Math.max(Math.min(ballPosition.z, limit), -limit);
  }

  // Fricción
  ballVelocity.x *= 0.95;
  ballVelocity.z *= 0.95;

  updatePatoTransform();
  updateBallTransform();
  requestAnimationFrame(animateMovement);
}

function updatePatoTransform() {
  const y = bouncing ? positionY : patoPosition.y;
  pato.setAttribute("position", `${patoPosition.x} ${y} ${patoPosition.z}`);
  pato.setAttribute("rotation", `${patoTiltX} ${patoRotationY} 0`);
}

function updateBallTransform() {
  ball.setAttribute("position", `${ballPosition.x} ${ballPosition.y} ${ballPosition.z}`);
}
