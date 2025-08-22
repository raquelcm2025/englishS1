const btn = document.getElementById('toggle-theme');
if (btn) {
  const KEY = 'theme_pref_v1';
  let dark = localStorage.getItem(KEY) ?? '1';

  function apply(){
    const r = document.documentElement;
    if (dark === '1') {
      r.style.setProperty('--bg',    '#0f0f12');
      r.style.setProperty('--fg',    '#f3f6f9');
      r.style.setProperty('--muted', '#aab3c0');
      r.style.setProperty('--card',  '#16181d');
      r.style.setProperty('--accent','#ff2d75');
    } else {
      r.style.setProperty('--bg',    '#ffffff');
      r.style.setProperty('--fg',    '#0b1320');
      r.style.setProperty('--muted', '#556070');
      r.style.setProperty('--card',  '#f7f8fb');
      r.style.setProperty('--accent','#ff2d75');
    }
  }

  btn.addEventListener('click', ()=>{
    dark = dark === '1' ? '0' : '1';
    localStorage.setItem(KEY, dark);
    apply();
  });

  apply();
}
