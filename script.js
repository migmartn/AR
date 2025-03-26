let bouncing = false;
let positionY = 0.5;
let direction = 1;
let pato = document.getElementById("animated-pato");
let sound = document.getElementById("duck-sound");
let camera = document.getElementById("camera");

// Variables para el zoom
let zoomLevel = 1;
const zoomStep = 0.1; // Define cuánto aumentará o disminuirá el zoom

function toggleBounce() {
  bouncing = !bouncing;
  if (bouncing) {
    function animate() {
      if (!bouncing) return;
      positionY += 0.02 * direction;
      if (positionY >= 1 || positionY <= 0.5) {
        direction *= -1;
      }
      pato.setAttribute("position", `0 ${positionY} 0`);
      requestAnimationFrame(animate);
    }
    animate();
  }
}

function playDuckSound() {
  sound.currentTime = 0; // Reiniciar el sonido
  sound.play().then(() => {
    console.log("Sonido reproducido con éxito");
  }).catch((error) => {
    console.error("Error al reproducir sonido:", error);
  });
}

function zoomIn() {
  zoomLevel += zoomStep;
  camera.setAttribute("position", `0 1.6 ${zoomLevel}`);
}

function zoomOut() {
  zoomLevel = Math.max(zoomLevel - zoomStep, 0.5); // No dejar que el zoom sea menor a 0.5
  camera.setAttribute("position", `0 1.6 ${zoomLevel}`);
}
