// ---------- elementos ----------
const $ = s => document.querySelector(s);
const listEl  = $('#list');
const levelEl = $('#level');
const topicEl = $('#topic');
const searchEl= $('#search');
const statsEl = $('#stats');
const clearBtn= $('#clear');

const btnA1 = document.getElementById('go-a1');
const btnA2 = document.getElementById('go-a2');

let PHRASES = [];

// ---------- data ----------
async function loadData(){
  try{
    const res = await fetch('./data/phrases.json');
    PHRASES = await res.json();
    render();
    syncHeroBtns();
  }catch(e){
    statsEl.textContent = 'No se pudo cargar data/phrases.json';
    console.error(e);
  }
}

// ---------- TTS ----------
function speak(text, slow=false){
  if (!('speechSynthesis' in window)) return alert('Tu navegador no soporta audio.');
  const u = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  const enGB = voices.find(v=>v.lang.toLowerCase().startsWith('en-gb'));
  const enUS = voices.find(v=>v.lang.toLowerCase().startsWith('en-us'));
  u.voice = enGB || enUS || voices.find(v=>v.lang.toLowerCase().startsWith('en')) || null;
  u.rate = slow ? 0.75 : 0.95;
  u.pitch = 1.0;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// ---------- tarjeta ----------
function card(p){
  return `
  <li class="card" data-id="${p.id}">
    <span class="badge">${p.level} • ${p.topic}</span>
    <div class="phrase">${p.en}</div>
    <div class="trans">${p.es}</div>
    ${p.slow ? `<details><summary>Versión lenta (texto)</summary><div class="trans">${p.slow}</div></details>` : ''}
    <div class="actions">
      <button class="speak">🔊 Escuchar</button>
      <button class="speak-slow">🐢 Escuchar lento</button>
    </div>
  </li>`;
}

// ---------- render ----------
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

  // si hay nivel, muestra máx 12
  const limited = level ? rows.slice(0,12) : rows;
  statsEl.textContent = `${limited.length}${level?'/12 ': ' '}frases encontradas${level?' (mostrando 12 máx.)':''}`;
  listEl.innerHTML = limited.map(card).join('');
}

// ---------- eventos ----------
listEl.addEventListener('click', (e)=>{
  const li = e.target.closest('li.card'); if(!li) return;
  const id = Number(li.dataset.id);
  const p = PHRASES.find(x=>x.id===id); if(!p) return;

  if (e.target.classList.contains('speak'))      speak(p.en, false);
  if (e.target.classList.contains('speak-slow')) speak(p.en, true);
});

['input','change'].forEach(ev=>{
  searchEl.addEventListener(ev, render);
  levelEl.addEventListener(ev,  ()=>{ render(); syncHeroBtns(); });
  topicEl.addEventListener(ev,  render);
});
clearBtn.addEventListener('click', ()=>{
  searchEl.value=''; levelEl.value=''; topicEl.value='';
  render(); syncHeroBtns();
});

// ---------- botones del hero ----------
function syncHeroBtns(){
  btnA1?.classList.remove('active');
  btnA2?.classList.remove('active');
  if (levelEl.value==='A1') btnA1?.classList.add('active');
  if (levelEl.value==='A2') btnA2?.classList.add('active');
}
function setLevel(lvl){
  levelEl.value = lvl;
  render(); syncHeroBtns();
  const contentTop = document.querySelector('.header')?.offsetTop || 0;
  window.scrollTo({ top: contentTop, behavior: 'smooth' });
}
btnA1?.addEventListener('click', ()=> setLevel('A1'));
btnA2?.addEventListener('click', ()=> setLevel('A2'));

// ---------- inicio ----------
window.addEventListener('load', ()=>{
  if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = ()=>{};
  loadData();
});
