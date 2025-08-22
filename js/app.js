// ========= utilidades =========
const $ = (s) => document.querySelector(s);
const listEl  = $('#list');
const levelEl = $('#level');
const topicEl = $('#topic');
const searchEl= $('#search');
const statsEl = $('#stats');
const clearBtn= $('#clear');

const FAV_KEY = 'phrases_favs_v1';
const favs = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'));

let PHRASES = [];

async function loadData() {
  try {
    const res = await fetch('./data/phrases.json');
    PHRASES = await res.json();
    render();
  } catch (e) {
    statsEl.textContent = 'No se pudo cargar data/phrases.json';
    console.error(e);
  }
}

// ========= TTS (lectura en voz alta) =========
function speak(text) {
  if (!('speechSynthesis' in window)) {
    alert('Tu navegador no soporta lectura en voz alta.');
    return;
  }
  const u = new SpeechSynthesisUtterance(text);
  // intenta voz en inglés
  const voices = speechSynthesis.getVoices();
  const en = voices.find(v => v.lang.toLowerCase().startsWith('en'));
  if (en) u.voice = en;
  u.rate = 0.95;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// ========= Tarjeta =========
function cardTemplate(p) {
  const isFav = favs.has(p.id);
  return `
    <li class="card" data-id="${p.id}">
      <div class="row">
        <span class="badge">${p.level} • ${p.topic}</span>
      </div>
      <div class="phrase">${p.en}</div>
      <div class="trans">${p.es}</div>
      ${p.slow ? `<details><summary>Versión lenta</summary><div class="trans">${p.slow}</div></details>` : ''}
      <div class="actions">
        <button class="speak" aria-label="Escuchar">🔊 Escuchar</button>
        <button class="fav ${isFav ? 'active' : ''}" aria-label="Favorito">★ Favorito</button>
        <button class="copy" aria-label="Copiar">📋 Copiar</button>
      </div>
    </li>
  `;
}

// ========= Render =========
function render() {
  const q = (searchEl.value || '').toLowerCase().trim();
  const level = levelEl.value;
  const topic = topicEl.value;

  let rows = PHRASES.filter(p => {
    if (level && p.level !== level) return false;
    if (topic && p.topic !== topic) return false;
    if (!q) return true;
    return [p.en, p.es, p.topic].some(s => s.toLowerCase().includes(q));
  });

  statsEl.textContent = `${rows.length} frases encontradas`;
  listEl.innerHTML = rows.map(cardTemplate).join('');
}

// ========= Eventos UI =========
function handleListClick(e) {
  const li = e.target.closest('li.card');
  if (!li) return;
  const id = Number(li.dataset.id);
  const p = PHRASES.find(x => x.id === id);
  if (!p) return;

  if (e.target.classList.contains('speak')) {
    speak(p.en);
  }

  if (e.target.classList.contains('fav')) {
    if (favs.has(id)) favs.delete(id); else favs.add(id);
    localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
    render();
  }

  if (e.target.classList.contains('copy')) {
    navigator.clipboard.writeText(`${p.en} — ${p.es}`);
    e.target.textContent = '✅ Copiado';
    setTimeout(() => (e.target.textContent = '📋 Copiar'), 900);
  }
}

['input','change'].forEach(ev => {
  searchEl.addEventListener(ev, render);
  levelEl.addEventListener(ev, render);
  topicEl.addEventListener(ev, render);
});
clearBtn?.addEventListener('click', ()=>{
  searchEl.value = '';
  levelEl.value  = '';
  topicEl.value  = '';
  render();
});
listEl.addEventListener('click', handleListClick);

// ======== inicio ========
window.addEventListener('load', () => {
  if ('speechSynthesis' in window) {
    // algunas voces cargan asíncronamente
    window.speechSynthesis.onvoiceschanged = () => {};
  }
  loadData();
});
