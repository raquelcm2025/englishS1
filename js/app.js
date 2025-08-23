/* ========== Helpers/DOM ========== */
const $ = (s) => document.querySelector(s);

// DOM
const btnA1        = $('#go-a1');
const btnA2        = $('#go-a2');
const levelArea    = $('#level-area');
const resultsPanel = $('#results-panel');
const listEl       = $('#list');
const statsEl      = $('#stats');
const searchEl     = $('#search');   // opcional
const topicEl      = $('#topic');    // opcional (dentro del panel)
const clearBtn     = $('#clear');    // opcional
const topicHero    = document.getElementById('topic-hero'); // <-- ¡ARRIBA!

// Normalizador para búsquedas/temas
const norm = (s) => (s ?? '')
  .toString()
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .toLowerCase()
  .trim();

/* ========== Estado ========== */
let PHRASES = [];
let currentLevel = ''; // 'A1' | 'A2'

/* ========== Data ========== */
async function ensureData() {
  if (PHRASES.length) return;
  try {
    const res = await fetch('./data/phrases.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    PHRASES = await res.json();
    buildTopics(); // llena el select del panel (si lo usas)
  } catch (err) {
    console.error('Error cargando phrases.json:', err);
    if (statsEl) statsEl.textContent = 'No se pudo cargar data/phrases.json';
  }
}

// Panel (todos los temas)
function buildTopics() {
  if (!topicEl) return;
  const topics = [...new Set(PHRASES.map(p => p.topic))].sort();
  topicEl.innerHTML = `<option value="">Todos los temas</option>` +
    topics.map(t => `<option value="${t}">${t}</option>`).join('');
}

// Hero (temas filtrados por nivel)
function buildTopicsForLevel(level){
  if (!topicHero) return;
  const topics = [...new Set(PHRASES.filter(p => p.level === level).map(p => p.topic))].sort();
  topicHero.innerHTML =
    `<option value="">Selecciona una categoría…</option>` +
    topics.map(t => `<option value="${t}">${t}</option>`).join('');
  topicHero.disabled = topics.length === 0;
  topicHero.value = "";
}

/* ========== TTS ========== */
function speakEN(text) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  const v = speechSynthesis.getVoices();
  u.voice = v.find(x => x.lang.toLowerCase().startsWith('en'))
          || v.find(x => x.lang.toLowerCase().startsWith('en-us'))
          || null;
  u.rate = 0.98;
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}
function speakES(text) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  const v = speechSynthesis.getVoices();
  u.voice = v.find(x => x.lang.toLowerCase().startsWith('es-'))
          || v.find(x => x.lang.toLowerCase().startsWith('es'))
          || null;
  u.rate = 1.0;
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}

/* ========== Tarjeta & Render ========== */
function card(p) {
  return `
    <li class="card" data-id="${p.id}">
      <span class="badge">${p.level} • ${p.topic}</span>
      <div class="phrase">${p.en}</div>
      <div class="trans">${p.es}</div>
      <div class="actions">
        <button class="listen-en" type="button">🔊 Listen</button>
        <button class="listen-es" type="button">🎧 Escuchar</button>
      </div>
    </li>`;
}

function render(){
  if (!currentLevel){
    if (statsEl) statsEl.textContent = '';
    if (listEl)  listEl.innerHTML = '';
    return;
  }

  const q = norm(searchEl?.value);
  // prioridad: selector del hero; si está vacío, usa el del panel
  const chosenTopic = norm(topicHero?.value) || norm(topicEl?.value);

  let rows = PHRASES.filter(p=>{
    if (p.level !== currentLevel) return false;
    if (chosenTopic && norm(p.topic) !== chosenTopic) return false;
    if (!q) return true;
    return [p.en, p.es, p.topic].some(s => norm(s).includes(q));
  });

  const limited = rows.slice(0, 12);
  if (statsEl) statsEl.textContent =
    `${limited.length}/12 frases (máx. 12)` + (chosenTopic ? ` — ${topicHero?.value || topicEl?.value}` : '');
  if (listEl) listEl.innerHTML = limited.map(card).join('');
}

/* ========== Listeners ========== */
// Cards (tts)
listEl?.addEventListener('click', (e) => {
  const li = e.target.closest('li.card'); if (!li) return;
  const id = Number(li.dataset.id);
  const p  = PHRASES.find(x => x.id === id); if (!p) return;
  if (e.target.classList.contains('listen-en')) speakEN(p.en);
  if (e.target.classList.contains('listen-es')) speakES(p.es);
});

// Filtros panel
if (searchEl) ['input','change'].forEach(ev => searchEl.addEventListener(ev, render));
topicEl?.addEventListener('change', render);
clearBtn?.addEventListener('click', () => {
  if (searchEl) searchEl.value = '';
  if (topicEl)  topicEl.value  = '';
  render();
});

// Nivel
function syncHeroBtns() {
  btnA1?.classList.remove('active');
  btnA2?.classList.remove('active');
  if (currentLevel === 'A1') btnA1?.classList.add('active');
  if (currentLevel === 'A2') btnA2?.classList.add('active');
}

async function setLevel(lvl){
  await ensureData();
  currentLevel = lvl;

  resultsPanel?.classList.remove('is-hidden'); // muestra panel
  buildTopicsForLevel(lvl);                     // llena categorías del hero
  levelArea?.classList.add('overlay');         // cards sobre la imagen

  syncHeroBtns();
  render();
  levelArea?.scrollIntoView({ behavior:'smooth', block:'start' });
}

btnA1?.addEventListener('click', () => setLevel('A1'));
btnA2?.addEventListener('click', () => setLevel('A2'));

topicHero?.addEventListener('change', () => {
  if (!currentLevel) return;
  levelArea?.classList.add('overlay');
  render();
});

/* ========== Rotador palabra ========== */
const words = ['básico', 'desde cero', 'paso a paso', 'con Susan'];
const rot = $('#rotating-word');
let idx = 0;
function rotateWord() {
  if (!rot) return;
  idx = (idx + 1) % words.length;
  rot.style.opacity = '0';
  setTimeout(() => { rot.textContent = words[idx]; rot.style.opacity = '1'; }, 180);
}
setInterval(rotateWord, 2200);

/* ========== Partículas fondo (única) ========== */
(function () {
  function start() {
    const api = window.tsParticles;
    if (!api?.load) return; // librería aún no lista

    const isMobile = matchMedia('(max-width:540px)').matches;

    api.load({
      id: 'bgparticles',
      options: {
        fpsLimit: 60,
        fullScreen: { enable: false },
        background: { color: 'transparent' },
        detectRetina: true,
        particles: {
          number: { value: isMobile ? 24 : 40, density: { enable: true, area: 900 } },
          color: { value: ['#b26bff', '#6ee7ff'] },
          opacity: { value: 0.25 },
          size: { value: { min: 1, max: 3 } },
          move: { enable: true, speed: 0.6, direction: 'none', outModes: 'out' },
          links: { enable: true, color: '#bda9ff', distance: 120, opacity: 0.15, width: 1 }
        },
        interactivity: {
          events: { onHover: { enable: true, mode: 'repulse' }, resize: true },
          modes: { repulse: { distance: 80, duration: 0.2 } }
        }
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

/* ========== Init (TTS ready) ========== */
window.addEventListener('load', () => {
  if ('speechSynthesis' in window) {
    try { speechSynthesis.onvoiceschanged = () => {}; } catch {}
  }
});

