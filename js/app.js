const $ = s => document.querySelector(s);
const listEl  = $('#list');
const levelEl = $('#level');
const topicEl = $('#topic');
const searchEl= $('#search');
const statsEl = $('#stats');
const clearBtn= $('#clear');

const goA1 = $('#go-a1');
const goA2 = $('#go-a2');

const FAV_KEY = 'phrases_favs_v1';
const favs = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'));
let PHRASES = [];

async function loadData(){
  const res = await fetch('./data/phrases.json');
  PHRASES = await res.json();
  render();
}

function speak(text){
  if (!('speechSynthesis' in window)) return alert('Tu navegador no soporta TTS.');
  const u = new SpeechSynthesisUtterance(text);
  const en = speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('en'));
  if (en) u.voice = en;
  u.rate = 0.95;
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}

function card(p){
  const isFav = favs.has(p.id);
  return `
  <li class="card" data-id="${p.id}">
    <span class="badge">${p.level} • ${p.topic}</span>
    <div class="phrase">${p.en}</div>
    <div class="trans">${p.es}</div>
    ${p.slow ? `<details><summary>Versión lenta</summary><div class="trans">${p.slow}</div></details>` : ''}
    <div class="actions">
      <button class="speak">🔊 Escuchar</button>
      <button class="fav ${isFav ? 'active':''}">★ Favorito</button>
      <button class="copy">📋 Copiar</button>
    </div>
  </li>`;
}

function render(){
  const q = (searchEl.value||'').toLowerCase().trim();
  const level = levelEl.value;
  const topic = topicEl.value;

  let rows = PHRASES.filter(p=>{
    if (level && p.level!==level) return false;
    if (topic && p.topic!==topic) return false;
    if (!q) return true;
    return [p.en,p.es,p.topic].some(s=>s.toLowerCase().includes(q));
  });

  // si hay un nivel seleccionado, limita a 10 frases
  const limited = level ? rows.slice(0,10) : rows;
  statsEl.textContent = `${limited.length}${level?'/10 ': ' '}frases encontradas${level?' (mostrando 10 máx.)':''}`;
  listEl.innerHTML = limited.map(card).join('');
}

function handleListClick(e){
  const li = e.target.closest('li.card'); if(!li) return;
  const id = Number(li.dataset.id);
  const p = PHRASES.find(x=>x.id===id); if(!p) return;

  if (e.target.classList.contains('speak')) speak(p.en);
  if (e.target.classList.contains('fav')){
    favs.has(id) ? favs.delete(id) : favs.add(id);
    localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
    render();
  }
  if (e.target.classList.contains('copy')){
    navigator.clipboard.writeText(`${p.en} — ${p.es}`);
    e.target.textContent='✅ Copiado'; setTimeout(()=>e.target.textContent='📋 Copiar',900);
  }
}

['input','change'].forEach(ev=>{
  searchEl.addEventListener(ev, render);
  levelEl.addEventListener(ev, render);
  topicEl.addEventListener(ev, render);
});
clearBtn.addEventListener('click', ()=>{
  searchEl.value=''; levelEl.value=''; topicEl.value='';
  render();
});
listEl.addEventListener('click', handleListClick);

// botones del banner
goA1?.addEventListener('click', ()=>{ levelEl.value='A1'; window.scrollTo({top:document.body.scrollHeight*0.18,behavior:'smooth'}); render(); });
goA2?.addEventListener('click', ()=>{ levelEl.value='A2'; window.scrollTo({top:document.body.scrollHeight*0.18,behavior:'smooth'}); render(); });

window.addEventListener('load', ()=>{ if('speechSynthesis' in window) speechSynthesis.onvoiceschanged=()=>{}; loadData(); });
