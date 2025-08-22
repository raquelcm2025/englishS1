// Rotar palabra del título
const words = ['básico', 'desde cero', 'paso a paso', 'con audio'];
const rot = document.getElementById('rotating-word');
let idx = 0;
function rotateWord(){
  idx = (idx + 1) % words.length;
  if (!rot) return;
  rot.style.opacity = '0';
  setTimeout(()=>{
    rot.textContent = words[idx];
    rot.style.opacity = '1';
  }, 180);
}
setInterval(rotateWord, 2200);

// Partículas livianas en el hero
(async () => {
  const engine = window.tsParticles;
  if (!engine) return;
  await engine.load({
    id: "tsparticles",
    options: {
      fpsLimit: 60,
      fullScreen: { enable: false },
      background: { color: "transparent" },
      particles: {
        number: { value: 24, density: { enable: true, area: 800 } },
        color: { value: ["#b26bff", "#6ee7ff"] },
        opacity: { value: 0.25 },
        size: { value: { min: 1, max: 3 } },
        move: { enable: true, speed: 0.6, direction: "none", outModes: "out" },
        links: { enable: true, color: "#bda9ff", distance: 120, opacity: 0.15, width: 1 }
      },
      detectRetina: true,
      interactivity: {
        events: { onHover: { enable: true, mode: "repulse" }, resize: true },
        modes: { repulse: { distance: 80, duration: 0.2 } }
      }
    }
  });
})();
