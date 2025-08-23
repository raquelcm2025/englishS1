/* =========================================================
   Susan English Club – App JS (adaptado a phrases.json)
   ========================================================= */

/* ---------- Helpers ---------- */
const $ = (s) => document.querySelector(s);

/* ---------- DOM ---------- */
const btnA1        = $('#go-a1');
const btnA2        = $('#go-a2');

const levelArea    = $('#level-area');
const resultsPanel = $('#results-panel');   // overlay
const listEl       = $('#list');
const statsEl      = $('#stats');

// Filtros opcionales (si no existen, no pasa nada)
const searchEl     = $('#search');
const topicEl      = $('#topic');
const clearBtn     = $('#clear');

/* ---------- Estado ---------- */
let PHRASES = [];
let currentLevel = '';   // 'A1' | 'A2'

/* ---------- Data ---------- */
async function ensureData() {
  if (PHRASES.length) return;  // ya cargado

  try {
    const res = await fetch('./data/phrases.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    PHRASES = await res.json();
    buildTopics();
  } catch (err) {
    console.error('Error cargando phrases.json:', err);
    if (statsEl) statsEl.textContent = 'No se pudo cargar data/phrases.json';
  }
}

function buildTopics() {
  if (!topicEl) return;
  const topics = [...new Set(PHRASES.map(p => p.topic))].sort();
  topicEl.innerHTML = `<option value="">Todos los temas</option>` +
    topics.map(t => `<option value="${t}">${t}</option>`).join('');
}

/* ---------- TTS ---------- */
function speakEN(text) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  const v = speechSynthesis.getVoices();
  u.voice = v.find(x => x.lang.toLowerCase().startsWith('en-us'))
          || v.find(x => x.lang.toLowerCase().startsWith('en'))
          || null;
  u.rate = 0.98;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}
function speakES(text) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  const v = speechSynthesis.getVoices();
  u.voice = v.find(x => x.lang.toLowerCase().startsWith('es-'))
          || v.find(x => x.lang.toLowerCase().startsWith('es'))
          || null;
  u.rate = 1.0;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

/* ---------- Tarjeta ---------- */
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

/* ---------- Render ---------- */
function render() {
  if (!currentLevel) {
    if (statsEl) statsEl.textContent = '';
    if (listEl) listEl.innerHTML = '';
    return;
  }

  const q     = (searchEl?.value || '').toLowerCase().trim();
  const topic = (topicEl?.value || '').trim();

  let rows = PHRASES.filter(p => {
    if (p.level !== currentLevel) return false;
    if (topic && p.topic !== topic) return false;
    if (!q) return true;
    return [p.en, p.es, p.topic].some(s => s.toLowerCase().includes(q));
  });

  const limited = rows.slice(0, 12);   // hasta 12 frases
  if (statsEl) statsEl.textContent = `${limited.length}/12 frases (máx. 12)`;
  if (listEl)  listEl.innerHTML = limited.map(card).join('');
}

/* ---------- Clicks en tarjetas ---------- */
listEl?.addEventListener('click', (e) => {
  const li = e.target.closest('li.card'); if (!li) return;
  const id = Number(li.dataset.id);
  const p  = PHRASES.find(x => x.id === id); if (!p) return;

  if (e.target.classList.contains('listen-en')) speakEN(p.en);
  if (e.target.classList.contains('listen-es')) speakES(p.es);
});

/* ---------- Filtros ---------- */
if (searchEl) ['input','change'].forEach(ev => searchEl.addEventListener(ev, render));
if (topicEl)  topicEl.addEventListener('change', render);
if (clearBtn) clearBtn.addEventListener('click', () => {
  if (searchEl) searchEl.value = '';
  if (topicEl)  topicEl.value  = '';
  render();
});

/* ---------- Nivel ---------- */
function syncHeroBtns() {
  btnA1?.classList.remove('active');
  btnA2?.classList.remove('active');
  if (currentLevel === 'A1') btnA1?.classList.add('active');
  if (currentLevel === 'A2') btnA2?.classList.add('active');
}

async function setLevel(lvl) {
  await ensureData();
  currentLevel = lvl;

  resultsPanel?.classList.remove('is-hidden');

  syncHeroBtns();
  render();

   document.getElementById('level-area')
    ?.scrollIntoView({behavior:'smooth', block:'start'});
}

btnA1?.addEventListener('click', () => setLevel('A1'));
btnA2?.addEventListener('click', () => setLevel('A2'));

/* ---------- Hero: palabra rotativa ---------- */
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

/* ---------- Partículas ---------- */
(async () => {
  const engine = window.tsParticles;
  if (!engine) return;

  const isMobile = matchMedia('(max-width:540px)').matches;

  await engine.load({
    id: 'tsparticles',
    options: {
      fpsLimit: 60,
      fullScreen: { enable: false },
      background: { color: 'transparent' },
      particles: {
        number: { value: isMobile ? 14 : 24, density: { enable: true, area: 800 } },
        color: { value: ['#b26bff', '#6ee7ff'] },
        opacity: { value: 0.25 },
        size: { value: { min: 1, max: 3 } },
        move: { enable: true, speed: 0.6, direction: 'none', outModes: 'out' },
        links: { enable: true, color: '#bda9ff', distance: 120, opacity: 0.15, width: 1 }
      },
      detectRetina: true,
      interactivity: {
        events: { onHover: { enable: true, mode: 'repulse' }, resize: true },
        modes: { repulse: { distance: 80, duration: 0.2 } }
      }
    }
  });
})();

/* ---------- Init ---------- */
window.addEventListener('load', () => {
  if ('speechSynthesis' in window) {
    try { speechSynthesis.onvoiceschanged = () => {}; } catch {}
  }
});
