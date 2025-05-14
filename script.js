let bouncing = false; 
let positionY = 0.5;
let direction = 1;
let pato;
let sound;

// Zoom variables
let zoomLevel = 1;
const zoomStep = 0.1;

// Movimiento e inclinación variables
let patoPosition = { x: 0, y: 0.5, z: 0 };
let targetPosition = { x: 0, y: 0.5, z: 0 };
let patoRotationY = 0;
let targetRotationY = 0;
let patoTiltX = 0;
let targetTiltX = 0;
const moveSpeed = 0.05;
const rotateSpeed = 0.1;
const tiltSpeed = 0.1;
let resetTiltTimeout = null;

window.onload = function() {
  pato = document.getElementById("animated-pato");
  sound = document.getElementById("duck-sound");
  animateMovement();

  const pelota = document.getElementById("pelota");
  if (pelota) pelota.setAttribute('pushable-pelota', '');
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
  sound.play().catch((error) => {
    console.error("Error al reproducir sonido:", error);
  });
}

function zoomIn() {
  zoomLevel += zoomStep;
  const camera = document.querySelector("[camera]");
  camera.setAttribute("position", `0 1.6 ${zoomLevel}`);
}

function zoomOut() {
  zoomLevel = Math.max(zoomLevel - zoomStep, 0.5);
  const camera = document.querySelector("[camera]");
  camera.setAttribute("position", `0 1.6 ${zoomLevel}`);
}

// Movimiento con teclado
document.addEventListener('keydown', (event) => {
  if (event.key === "ArrowUp") movePato('up');
  if (event.key === "ArrowDown") movePato('down');
  if (event.key === "ArrowLeft") movePato('left');
  if (event.key === "ArrowRight") movePato('right');
});

// Movimiento con botones o teclado
function movePato(direction) {
  const step = 0.2;
  let moved = false;

  switch (direction) {
    case "up":
      targetPosition.z -= step;
      targetRotationY = 0;
      moved = true;
      break;
    case "down":
      targetPosition.z += step;
      targetRotationY = 180;
      moved = true;
      break;
    case "left":
      targetPosition.x -= step;
      targetRotationY = 90;
      moved = true;
      break;
    case "right":
      targetPosition.x += step;
      targetRotationY = -90;
      moved = true;
      break;
  }

  if (moved) {
    if (navigator.vibrate) navigator.vibrate(50);
    targetTiltX = -10;
    clearTimeout(resetTiltTimeout);
    resetTiltTimeout = setTimeout(() => {
      targetTiltX = 0;
    }, 300);
  }
}

// Animación continua
function animateMovement() {
  patoPosition.x += (targetPosition.x - patoPosition.x) * moveSpeed;
  patoPosition.z += (targetPosition.z - patoPosition.z) * moveSpeed;

  let deltaRotation = (targetRotationY - patoRotationY + 540) % 360 - 180;
  patoRotationY += deltaRotation * rotateSpeed;

  patoTiltX += (targetTiltX - patoTiltX) * tiltSpeed;

  updatePatoTransform();
  requestAnimationFrame(animateMovement);
}

// Actualiza posición, rotación e inclinación
function updatePatoTransform() {
  let currentY = bouncing ? positionY : patoPosition.y;
  pato.setAttribute("position", `${patoPosition.x} ${currentY} ${patoPosition.z}`);
  pato.setAttribute("rotation", `${patoTiltX} ${patoRotationY} 0`);
}

// Componente pelota empujable
AFRAME.registerComponent('pushable-pelota', {
  init: function () {
    this.bounceSound = document.getElementById("bounce-sound");
    this.lastHitTime = 0;
  },
  tick: function (time) {
    if (!pato || !this.el) return;

    const patoPos = pato.object3D.position;
    const pelotaPos = this.el.object3D.position;

    const dx = pelotaPos.x - patoPos.x;
    const dz = pelotaPos.z - patoPos.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < 0.3) {
      // Sonido
      if (time - this.lastHitTime > 300) {
        if (this.bounceSound) {
          this.bounceSound.currentTime = 0;
          this.bounceSound.play().catch(() => {});
        }
        this.lastHitTime = time;
      }

      // Empuje
      this.el.object3D.position.x += dx * 0.5;
      this.el.object3D.position.z += dz * 0.5;

      // Cambio de color
      const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      this.el.setAttribute('color', randomColor);

      // Rebote
      if (this.el.object3D.position.y <= 0.5) {
        this.el.object3D.position.y += 0.2;
      }
    } else {
      // Caída
      if (this.el.object3D.position.y > 0.5) {
        this.el.object3D.position.y -= 0.02;
      }
    }
  }
});
