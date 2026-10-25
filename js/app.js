/* PintaKids — interface: telas, navegação, recompensas */
(function () {
  const { THEMES, TOOLS, FILLS, COLOR_PACKS, METALLIC, FREE_COLOR_COST, STICKER_PACKS, levelOf, ACHIEVEMENTS, ACHIEVEMENT_BONUS } = CATALOG;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const P = () => Store.profile;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------------- ícones da interface ----------------
  const I = (d, extra = '') => `<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
  const IC = {
    back: I('<path d="M15 5l-7 7 7 7"/>'),
    undo: I('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'),
    redo: I('<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>'),
    hint: I('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>'),
    magic: I('<path d="M4 20L15 9"/><path d="M15 9l2-2"/><path d="M18 2v3M18 9v3M14.5 5.5h-3M24 5.5h-3" stroke-width="2"/><path d="M8 3v2M7 4h2M20 15v2M19 16h2" stroke-width="2"/>'),
    trash: I('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
    zoom: I('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M7.5 10.5h6"/>'),
    check: I('<path d="M4 12.5l5 5L20 6.5"/>', 'stroke-width="3.4"'),
    heart: I('<path d="M12 20s-7-4.4-9-9C1.8 7.6 4 4 7.5 4c2 0 3.5 1.2 4.5 2.6C13 5.2 14.5 4 16.5 4 20 4 22.2 7.6 21 11c-2 4.6-9 9-9 9z"/>'),
    lock: I('<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    gear: I('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'),
    download: I('<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>'),
    share: I('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/>'),
    brush: I('<path d="M18 3l3 3-9 9-3-3z"/><path d="M9 12c-3 0-5 2-5 5 0 1.5-1 3-2 3 5 1 9-1 9-5"/>'),
    plus: I('<path d="M12 5v14M5 12h14"/>', 'stroke-width="3.2"'),
    close: I('<path d="M6 6l12 12M18 6L6 18"/>', 'stroke-width="3"'),
    star: '<svg viewBox="0 0 24 24" class="ic"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" fill="currentColor"/></svg>',
  };
  let mascotN = 0;
  const MASCOT_SRC = `<svg viewBox="0 0 120 140" class="mascot-svg"><defs><linearGradient id="mg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A88BFF"/><stop offset="1" stop-color="#6A3DF0"/></linearGradient></defs>
    <path d="M60 6 C60 6 104 58 104 88 A44 44 0 0 1 16 88 C16 58 60 6 60 6 Z" fill="url(#mg)" stroke="#3b2f52" stroke-width="4" stroke-linejoin="round"/>
    <ellipse cx="40" cy="64" rx="7" ry="15" fill="#fff" opacity=".35" transform="rotate(25 40 64)"/>
    <g class="m-eyes"><ellipse cx="46" cy="86" rx="9" ry="11" fill="#fff" stroke="#3b2f52" stroke-width="3"/><circle cx="48" cy="88" r="5" fill="#3b2f52"/><circle cx="50" cy="85.5" r="1.8" fill="#fff"/>
    <ellipse cx="74" cy="86" rx="9" ry="11" fill="#fff" stroke="#3b2f52" stroke-width="3"/><circle cx="76" cy="88" r="5" fill="#3b2f52"/><circle cx="78" cy="85.5" r="1.8" fill="#fff"/></g>
    <ellipse cx="34" cy="103" rx="7" ry="4.5" fill="#FF8FAB" opacity=".8"/><ellipse cx="86" cy="103" rx="7" ry="4.5" fill="#FF8FAB" opacity=".8"/>
    <path d="M48 104 Q60 117 72 104" fill="none" stroke="#3b2f52" stroke-width="4" stroke-linecap="round"/></svg>`;
  // cada cópia do mascote precisa do próprio id de degradê (um degradê dentro de tela escondida não pinta)
  const mascot = () => { const id = 'mg' + ++mascotN; return MASCOT_SRC.replace('id="mg"', `id="${id}"`).replace('url(#mg)', `url(#${id})`); };

  // ---------------- regras de desbloqueio ----------------
  const pts = () => P().totalEarned;
  const open = (cost) => P().settings.unlockAll || pts() >= cost;
  const toolOpen = (id) => { const t = TOOLS.find((x) => x.id === id); return t && open(t.cost); };
  const colorList = () => COLOR_PACKS.flatMap((p) => p.colors);
  const colorName = (hex) => { const c = colorList().find((x) => x.hex.toLowerCase() === hex.toLowerCase()); return c ? c.name : 'Cor especial'; };
  const drawingById = (id) => DRAWINGS.find((d) => d.id === id);

  function unlockables() {
    const L = [];
    TOOLS.filter((t) => t.cost > 0).forEach((t) => L.push({ key: 'tool:' + t.id, kind: 'Lápis mágico', name: t.name, cost: t.cost, icon: t.icon }));
    FILLS.filter((f) => f.cost > 0).forEach((f) => L.push({ key: 'fill:' + f.id, kind: 'Balde', name: 'Balde ' + f.name, cost: f.cost, icon: CATALOG.ICONS.balde, fill: f.id }));
    COLOR_PACKS.filter((p) => p.cost > 0).forEach((p) => L.push({ key: 'colors:' + p.id, kind: 'Cores', name: 'Cores ' + p.name, cost: p.cost, colors: p.colors }));
    L.push({ key: 'colors:livre', kind: 'Cores', name: 'Cor livre (todas!)', cost: FREE_COLOR_COST, rainbow: true });
    STICKER_PACKS.filter((p) => p.cost > 0).forEach((p) => L.push({ key: 'stk:' + p.id, kind: 'Carimbos', name: 'Carimbos ' + p.name, cost: p.cost, emoji: p.items.slice(0, 4).join('') }));
    DRAWINGS.filter((d) => d.cost > 0).forEach((d) => L.push({ key: 'draw:' + d.id, kind: 'Desenho', name: d.title, cost: d.cost, drawing: d }));
    return L.sort((a, b) => a.cost - b.cost);
  }
  const nextUnlock = () => unlockables().find((u) => u.cost > pts());

  // ---------------- utilidades de UI ----------------
  function toast(msg, ms = 2200) {
    const t = h(`<div class="toast">${msg}</div>`);
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, ms);
  }
  function modal(content, { cls = '', onClose, dismiss = true } = {}) {
    const m = h(`<div class="modal ${cls}"><div class="modal-card"></div></div>`);
    const card = $('.modal-card', m);
    typeof content === 'string' ? (card.innerHTML = content) : card.appendChild(content);
    const close = () => { m.classList.remove('show'); setTimeout(() => m.remove(), 250); onClose && onClose(); };
    if (dismiss) m.addEventListener('pointerdown', (e) => { if (e.target === m) close(); });
    document.body.appendChild(m);
    requestAnimationFrame(() => m.classList.add('show'));
    m.close = close;
    return m;
  }
  function sheet(title, body, { onClose, headerExtra = '' } = {}) {
    const m = modal(`<div class="sheet-head"><h2>${title}</h2>${headerExtra}<button class="icon-btn close">${IC.close}</button></div><div class="sheet-body"></div>`, { cls: 'sheet', onClose });
    $('.sheet-body', m).appendChild(body);
    $('.close', m).onclick = () => { SFX.tap(); m.close(); };
    return m;
  }
  function confirmBox(text, yes = 'Sim', no = 'Não') {
    return new Promise((res) => {
      const m = modal(`<div class="confirm"><div class="mascot small">${mascot()}</div><p>${text}</p><div class="row"><button class="btn ghost no">${no}</button><button class="btn red yes">${yes}</button></div></div>`, { onClose: () => res(false) });
      $('.no', m).onclick = () => { m.close(); };
      $('.yes', m).onclick = () => { res(true); m.onclick = null; m.classList.remove('show'); setTimeout(() => m.remove(), 250); };
    });
  }
  function starsHTML(n, max = 5) { let s = ''; for (let i = 0; i < max; i++) s += `<span class="st ${i < n ? 'on' : ''}">${IC.star}</span>`; return s; }
  function swatchStyle(hex) {
    if (METALLIC.has(hex)) return `background:linear-gradient(135deg,${ColorUtil.shade(hex, 0.45)} 0%,${hex} 45%,${ColorUtil.shade(hex, -0.35)} 100%)`;
    return `background:${hex}`;
  }

  // ---------------- confete ----------------
  const conf = { parts: [], raf: 0 };
  function confetti(n = 140) {
    const cv = $('#confetti'), ctx = cv.getContext('2d');
    cv.width = innerWidth; cv.height = innerHeight;
    const cols = ['#FF5C8A', '#FFC93C', '#2EC4B6', '#3A86FF', '#8E5CF7', '#FF8C42', '#6FD08C'];
    for (let i = 0; i < n; i++) conf.parts.push({
      x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 16 - 4, r: Math.random() * 360, vr: (Math.random() - 0.5) * 20,
      w: 6 + Math.random() * 8, h: 4 + Math.random() * 6, c: cols[i % cols.length], life: 160 + Math.random() * 60,
    });
    if (conf.raf) return;
    const tick = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      conf.parts = conf.parts.filter((p) => p.life-- > 0 && p.y < cv.height + 40);
      conf.parts.forEach((p) => {
        p.vy += 0.38; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.r * Math.PI) / 180); ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      if (conf.parts.length) conf.raf = requestAnimationFrame(tick); else { conf.raf = 0; ctx.clearRect(0, 0, cv.width, cv.height); }
    };
    conf.raf = requestAnimationFrame(tick);
  }

  // ---------------- cabeçalho de perfil ----------------
  function profileChip() {
    const lv = levelOf(pts());
    const pct = Math.min(100, ((pts() - lv.from) / (lv.to - lv.from)) * 100);
    return `<div class="pchip"><div class="lv-badge">${lv.level}</div><div class="pchip-txt"><b>${esc(P().name || 'Artista')}</b><span>${lv.name}</span>
      <div class="lvbar"><i style="width:${pct}%"></i></div></div><div class="pts">${IC.star}<b>${pts()}</b></div></div>`;
  }

  const screen = () => $('#screen');
  function show(html, cls) {
    $('#paintScreen').classList.add('hidden');
    const s = screen(); s.className = 'screen ' + (cls || ''); s.classList.remove('hidden');
    s.innerHTML = html; s.scrollTop = 0;
    return s;
  }

  // ================= TELAS =================
  const GREETS = ['Vamos pintar algo lindo hoje?', 'Que cor você vai usar primeiro?', 'Cada pintura vale estrelas!', 'Pinte com capricho e ganhe prêmios!', 'Que tal um dinossauro colorido?', 'Desenhe o que quiser!'];
  function home() {
    const nu = nextUnlock();
    const s = show(`
      <div class="home">
        <div class="home-top">${profileChip()}<button class="icon-btn gear" data-go="#/pais" aria-label="Área dos pais">${IC.gear}</button></div>
        <div class="hero">
          <div class="mascot bob">${mascot()}</div>
          <div class="bubble">Oi${P().name ? ', <b>' + esc(P().name) + '</b>' : ''}! ${GREETS[Math.floor(Math.random() * GREETS.length)]}</div>
        </div>
        <div class="logo"><span style="--c:#FF5C8A">P</span><span style="--c:#FF8C42">i</span><span style="--c:#FFC93C">n</span><span style="--c:#6FD08C">t</span><span style="--c:#2EC4B6">a</span><span style="--c:#3A86FF">K</span><span style="--c:#8E5CF7">i</span><span style="--c:#FF5C8A">d</span><span style="--c:#FF8C42">s</span></div>
        <div class="home-btns">
          <button class="hbtn big purple" data-go="#/temas"><span class="em">🎨</span><b>Pintar desenhos</b><small>${DRAWINGS.length} desenhos em 7 temas</small></button>
          <button class="hbtn teal" data-go="#/pintar/livre"><span class="em">✏️</span><b>Desenho livre</b><small>papel em branco</small></button>
          <button class="hbtn orange" data-go="#/galeria"><span class="em">🖼️</span><b>Minha galeria</b><small>suas obras</small></button>
          <button class="hbtn pink" data-go="#/premios"><span class="em">🏆</span><b>Prêmios</b><small>${nu ? 'próximo: ' + esc(nu.name) : 'tudo liberado!'}</small></button>
        </div>
      </div>`, 'bg-home');
    bindGo(s);
  }

  function themesScreen() {
    const s = show(`
      <div class="page">
        <div class="topbar"><button class="icon-btn" data-go="#/">${IC.back}</button><h1>Escolha um tema</h1>${profileChip()}</div>
        <div class="theme-grid">${THEMES.map((t) => {
          const list = DRAWINGS.filter((d) => d.theme === t.id);
          const un = list.filter((d) => open(d.cost)).length;
          const done = list.filter((d) => P().best[d.id]).length;
          return `<button class="theme-card" data-go="#/tema/${t.id}" style="--a:${t.color};--b:${t.color2}">
            <span class="t-emoji">${t.emoji}</span><b>${t.name}</b>
            <small>${t.custom ? 'fotos e imagens suas' : `${done}/${list.length} pintados · ${un < list.length ? '🔒 ' + (list.length - un) : 'tudo aberto'}`}</small></button>`;
        }).join('')}</div>
      </div>`, 'bg-soft');
    bindGo(s);
  }

  async function themeScreen(id) {
    const t = THEMES.find((x) => x.id === id); if (!t) return go('#/temas');
    const drafts = await Store.all('drafts').catch(() => []);
    const draftMap = Object.fromEntries(drafts.map((d) => [d.drawingId, d]));
    let cards = '';
    if (t.custom) {
      const customs = await Store.all('custom').catch(() => []);
      cards = `<button class="d-card add" id="addCustom"><div class="d-thumb">${IC.plus}</div><b>Adicionar desenho</b><small>foto ou imagem de colorir</small></button>` +
        customs.sort((a, b) => b.created - a.created).map((c) => {
          const dr = draftMap['c-' + c.id];
          return `<button class="d-card" data-go="#/pintar/c-${c.id}"><div class="d-thumb"><img src="${dr ? dr.thumb : c.image}"></div><b>${esc(c.title)}</b><div class="d-stars">${starsHTML(P().best['c-' + c.id] ? P().best['c-' + c.id].stars : 0)}</div></button>`;
        }).join('');
    } else {
      cards = DRAWINGS.filter((d) => d.theme === id).map((d) => {
        const ok = open(d.cost);
        const dr = draftMap[d.id];
        const best = P().best[d.id];
        return `<button class="d-card ${ok ? '' : 'locked'}" ${ok ? `data-go="#/pintar/${d.id}"` : `data-locked="${d.cost}"`}>
          <div class="d-thumb"><img src="${dr ? dr.thumb : svgToDataURL(d.svg)}" loading="lazy">${ok ? '' : `<div class="lock">${IC.lock}<span>${IC.star}${d.cost}</span></div>`}${dr && ok ? '<i class="draft-tag">continuar</i>' : ''}</div>
          <b>${d.title}</b><div class="d-stars">${starsHTML(best ? best.stars : 0)}</div></button>`;
      }).join('');
    }
    const s = show(`
      <div class="page">
        <div class="topbar" style="--a:${t.color}"><button class="icon-btn" data-go="#/temas">${IC.back}</button><h1><span class="h-em">${t.emoji}</span>${t.name}</h1>${profileChip()}</div>
        <div class="d-grid">${cards}</div>
      </div>`, 'bg-soft');
    bindGo(s);
    $$('[data-locked]', s).forEach((b) => (b.onclick = () => {
      SFX.error();
      const faltam = +b.dataset.locked - pts();
      toast(`🔒 Faltam <b>${faltam}</b> estrelinhas para abrir este desenho. Continue pintando!`);
      b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
    }));
    const add = $('#addCustom', s); if (add) add.onclick = () => importImage(() => themeScreen('meus'));
  }

  // ---------- importar imagem/foto como desenho de colorir ----------
  function importImage(done) {
    const inp = h('<input type="file" accept="image/*" style="display:none">');
    document.body.appendChild(inp);
    inp.onchange = async () => {
      const file = inp.files[0]; inp.remove(); if (!file) return;
      const url = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(file); });
      const img = await new Promise((r, j) => { const i = new Image(); i.onload = () => r(i); i.onerror = j; i.src = url; });
      const k = Math.min(1, 1200 / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
      const id = Date.now();
      await Store.put('custom', { id, title: (file.name || 'Meu desenho').replace(/\.[^.]+$/, '').slice(0, 28), image: c.toDataURL('image/jpeg', 0.9), created: id });
      SFX.unlock(); toast('Desenho adicionado em <b>Meus Desenhos</b>!');
      done && done();
    };
    inp.click();
  }

  // ================= TELA DE PINTURA =================
  let painter = null;
  const PS = { id: null, drawing: null, artId: null, autosaveT: 0, colors: new Set(), tools: new Set(), stamps: 0, favMode: false };

  function buildPaintScreen() {
    const el = $('#paintScreen');
    el.innerHTML = `
      <header class="ptop">
        <button class="icon-btn back" title="Voltar">${IC.back}</button>
        <div class="ptitle"><b></b><span class="ppts">${IC.star}<i></i></span></div>
        <div class="pactions">
          <button class="icon-btn act-undo" title="Desfazer">${IC.undo}</button>
          <button class="icon-btn act-redo" title="Refazer">${IC.redo}</button>
          <button class="icon-btn act-zoom hidden" title="Ver desenho inteiro">${IC.zoom}</button>
          <button class="icon-btn act-hint" title="Onde falta pintar?">${IC.hint}</button>
          <button class="icon-btn act-magic" title="Pintura mágica: não sai da linha">${IC.magic}<em>mágica</em></button>
          <button class="icon-btn act-trash" title="Começar de novo">${IC.trash}</button>
          <button class="btn green act-done">${IC.check}<span>Terminei!</span></button>
        </div>
      </header>
      <aside class="tools"><div class="tool-list"></div><button class="tool more-tools" title="Todos os lápis">${IC.plus}<span>mais</span></button></aside>
      <main class="board"><div class="canvas-host"></div><div class="zoom-tip">Use dois dedos para dar zoom</div></main>
      <div class="opts"></div>
      <aside class="colors"><div class="color-list"></div><button class="swatch more-colors" title="Mais cores"><span></span></button></aside>`;
    painter = new Painter($('.canvas-host', el));
    painter.onChange = ({ canUndo, canRedo }) => {
      $('.act-undo', el).disabled = !canUndo; $('.act-redo', el).disabled = !canRedo;
      scheduleAutosave();
    };
    painter.onStroke = (info) => {
      if (info.color) PS.colors.add(info.color.toLowerCase());
      PS.tools.add(info.tool);
      PS.stamps += info.stamps || 0;
    };
    painter.onView = (z) => $('.act-zoom', el).classList.toggle('hidden', !z);
    let meterT = 0;
    painter.onPressure = (p) => {
      const m = $('.pmeter i', el); if (!m) return;
      m.style.height = Math.round(15 + p * 85) + '%';
      clearTimeout(meterT); meterT = setTimeout(() => (m.style.height = '15%'), 500);
    };
    $('.back', el).onclick = () => { SFX.tap(); history.length > 1 ? history.back() : go('#/'); };
    $('.act-undo', el).onclick = () => { if (painter.undo()) SFX.undo(); };
    $('.act-redo', el).onclick = () => { if (painter.redo()) SFX.undo(); };
    $('.act-zoom', el).onclick = () => { SFX.tap(); painter.resetView(); };
    $('.act-hint', el).onclick = () => {
      if (!painter.hasLines) { toast('No desenho livre não tem dica: solte a imaginação!'); return; }
      const { cov } = painter.coverage();
      const n = painter.showHints(Score.MIN_AREA, cov);
      if (n) { SFX.magic(); toast(`Os pedacinhos piscando ainda estão em branco (${n})`); }
      else { SFX.star(4); toast('Você já pintou todas as partes! 🎉'); }
    };
    $('.act-magic', el).onclick = () => {
      painter.magic = !painter.magic;
      $('.act-magic', el).classList.toggle('on', painter.magic);
      SFX.magic();
      toast(painter.magic ? '✨ Pintura mágica LIGADA: a tinta não sai da linha!' : 'Pintura mágica desligada: pinte livremente');
    };
    $('.act-trash', el).onclick = async () => {
      SFX.tap();
      if (await confirmBox('Apagar toda a pintura e começar de novo?', 'Apagar', 'Não')) { painter.clearAll(); SFX.erase(); }
    };
    $('.act-done', el).onclick = finishPainting;
    $('.more-tools', el).onclick = openToolsSheet;
    $('.more-colors', el).onclick = openColorsSheet;
  }

  async function openPaint(id) {
    if (!painter) buildPaintScreen();
    const el = $('#paintScreen');
    $('#screen').classList.add('hidden');
    el.classList.remove('hidden');
    const s = P().settings;
    painter.sensitivity = s.sensitivity; painter.useSpeed = s.useSpeed; painter.touchCal = P().touchCal;
    painter.fit();

    let drawing, opts = {};
    if (id === 'livre') { drawing = { id: 'livre-' + Date.now(), title: 'Desenho livre', theme: 'livre', free: true }; }
    else if (id.startsWith('livre-')) { drawing = { id, title: 'Desenho livre', theme: 'livre', free: true }; }
    else if (id.startsWith('c-')) {
      const c = await Store.get('custom', +id.slice(2));
      if (!c) return go('#/tema/meus');
      drawing = { id, title: c.title, theme: 'meus' }; opts = { imageURL: c.image, photo: true };
    } else {
      drawing = drawingById(id);
      if (!drawing) return go('#/temas');
      if (!open(drawing.cost)) { toast('Este desenho ainda está trancado 🔒'); return go('#/tema/' + drawing.theme); }
      opts = { svg: drawing.svg };
    }
    PS.id = drawing.id; PS.drawing = drawing; PS.artId = null;
    PS.colors = new Set(); PS.tools = new Set(); PS.stamps = 0;
    $('.ptitle b', el).textContent = drawing.title;
    $('.ptitle i', el).textContent = pts();

    const draft = await Store.get('drafts', drawing.id).catch(() => null);
    if (PS.pendingArt) { // "continuar pintando" vindo da galeria
      opts.paintURL = URL.createObjectURL(PS.pendingArt.paint); PS.artId = PS.pendingArt.id; PS.pendingArt = null;
    } else if (draft && draft.paint) { opts.paintURL = URL.createObjectURL(draft.paint); PS.artId = draft.artId || null; }

    el.classList.add('loading');
    await painter.load(opts);
    el.classList.remove('loading');
    $('.act-hint', el).classList.toggle('hidden', !!drawing.free);
    $('.act-magic', el).classList.toggle('hidden', !!drawing.free);
    painter.magic = false; $('.act-magic', el).classList.remove('on');

    const last = P().last;
    painter.tool = toolOpen(last.tool) ? last.tool : 'giz';
    painter.color = last.color; painter.sizeIdx = last.size; painter.fillStyle = last.fill; painter.sticker = last.sticker;
    renderTools(); renderColors(); renderOpts();
    const tip = $('.zoom-tip', el); tip.classList.add('show'); setTimeout(() => tip.classList.remove('show'), 2600);
  }

  function renderTools() {
    const list = $('#paintScreen .tool-list');
    const fav = P().favorites.tools.filter((id) => toolOpen(id));
    if (!fav.includes(painter.tool)) fav.push(painter.tool);
    list.innerHTML = fav.map((id) => {
      const t = TOOLS.find((x) => x.id === id);
      return `<button class="tool ${id === painter.tool ? 'sel' : ''}" data-tool="${id}" style="color:${painter.color}"><span class="ti">${t.icon}</span><span>${t.name}</span></button>`;
    }).join('');
    $$('.tool', list).forEach((b) => (b.onclick = () => selectTool(b.dataset.tool)));
  }
  function selectTool(id) {
    painter.tool = id; P().last.tool = id; Store.save();
    SFX.select();
    renderTools(); renderOpts();
    const t = TOOLS.find((x) => x.id === id);
    if (t) SFX.say(t.name);
  }
  function renderColors() {
    const list = $('#paintScreen .color-list');
    const fav = P().favorites.colors.slice();
    if (!fav.some((c) => c.toLowerCase() === painter.color.toLowerCase())) fav.unshift(painter.color);
    list.innerHTML = fav.map((c) => `<button class="swatch ${c.toLowerCase() === painter.color.toLowerCase() ? 'sel' : ''} ${c.toUpperCase() === '#FFFFFF' ? 'white' : ''}" data-c="${c}" style="${swatchStyle(c)}" title="${esc(colorName(c))}"></button>`).join('');
    $$('.swatch', list).forEach((b) => (b.onclick = () => selectColor(b.dataset.c)));
  }
  let sayT = 0;
  function selectColor(hex) {
    painter.color = hex; P().last.color = hex; Store.save();
    SFX.pop();
    renderColors();
    $$('#paintScreen .tool').forEach((b) => (b.style.color = hex));
    $$('#paintScreen .size-dot i').forEach((d) => (d.style.background = hex));
    clearTimeout(sayT); sayT = setTimeout(() => SFX.say(colorName(hex)), 120);
  }
  function renderOpts() {
    const box = $('#paintScreen .opts');
    const t = TOOLS.find((x) => x.id === painter.tool);
    let html = '';
    if (t.sizes) {
      html += `<div class="og"><span class="ol">Tamanho</span>${t.sizes.map((s, i) => `<button class="size-dot ${i === painter.sizeIdx ? 'sel' : ''}" data-s="${i}"><i style="width:${8 + i * 7}px;height:${8 + i * 7}px;background:${painter.color}"></i></button>`).join('')}</div>`;
      if (painter.tool !== 'carimbos') html += `<div class="og pm-wrap" title="Força do toque: aperte mais ou vá devagar para um traço mais grosso"><span class="ol">Força</span><div class="pmeter"><i></i></div></div>`;
    }
    if (painter.tool === 'balde') {
      html += `<div class="og"><span class="ol">Balde</span>${FILLS.map((f) => {
        const ok = open(f.cost);
        return `<button class="chip ${f.id === painter.fillStyle ? 'sel' : ''} ${ok ? '' : 'locked'}" data-f="${f.id}" data-cost="${f.cost}"><i class="fprev f-${f.id}" style="--c:${painter.color}"></i>${f.name}${ok ? '' : `<em>${IC.lock}${f.cost}</em>`}</button>`;
      }).join('')}</div>`;
    }
    if (painter.tool === 'carimbos') {
      html += `<div class="og stickers">${STICKER_PACKS.map((p) => open(p.cost)
        ? p.items.map((s) => `<button class="stk ${s === painter.sticker ? 'sel' : ''}" data-k="${s}">${s}</button>`).join('')
        : `<button class="stk locked" data-cost="${p.cost}" title="${p.name}">${IC.lock}<em>${p.cost}</em></button>`).join('')}</div>`;
    }
    if (painter.tool === 'arcoiris') html += '<div class="og"><span class="ol">O arco-íris escolhe as cores sozinho! 🌈</span></div>';
    if (painter.tool === 'borracha') html += '<div class="og"><span class="ol">A borracha não apaga as linhas do desenho</span></div>';
    box.innerHTML = html;
    $$('.size-dot', box).forEach((b) => (b.onclick = () => { painter.sizeIdx = +b.dataset.s; P().last.size = painter.sizeIdx; Store.save(); SFX.tap(); renderOpts(); }));
    $$('.chip', box).forEach((b) => (b.onclick = () => {
      if (b.classList.contains('locked')) { SFX.error(); toast(`🔒 Faltam ${b.dataset.cost - pts()} estrelinhas`); return; }
      painter.fillStyle = b.dataset.f; P().last.fill = b.dataset.f; Store.save(); SFX.select(); renderOpts();
    }));
    $$('.stk', box).forEach((b) => (b.onclick = () => {
      if (b.classList.contains('locked')) { SFX.error(); toast(`🔒 Faltam ${b.dataset.cost - pts()} estrelinhas para estes carimbos`); return; }
      painter.sticker = b.dataset.k; P().last.sticker = b.dataset.k; Store.save(); SFX.stamp(); renderOpts();
    }));
  }

  function favToggle(kind, id) {
    const arr = P().favorites[kind];
    const i = arr.findIndex((x) => x.toLowerCase() === id.toLowerCase());
    if (i >= 0) { if (arr.length <= 2) { toast('Deixe pelo menos 2 favoritos'); return; } arr.splice(i, 1); }
    else { if (arr.length >= (kind === 'colors' ? 18 : 10)) { toast('Os favoritos estão cheios: tire um antes'); return; } arr.push(id); }
    Store.save(); SFX.select();
  }
  function favHeader(onToggle) {
    return `<button class="chip favmode ${PS.favMode ? 'sel' : ''}">${IC.heart}<span>${PS.favMode ? 'Toque para marcar favoritos' : 'Escolher favoritos'}</span></button>`;
  }

  function openToolsSheet() {
    SFX.tap();
    const body = h('<div class="tools-sheet"></div>');
    const draw = () => {
      body.innerHTML = TOOLS.map((t) => {
        const ok = open(t.cost); const fav = P().favorites.tools.includes(t.id);
        return `<button class="tool big ${ok ? '' : 'locked'} ${t.id === painter.tool ? 'sel' : ''}" data-tool="${t.id}" style="color:${painter.color}">
          <span class="ti">${t.icon}</span><span>${t.name}</span>${ok ? (fav ? `<i class="fav">${IC.heart}</i>` : '') : `<em class="lockc">${IC.lock}${t.cost}</em>`}</button>`;
      }).join('');
      $$('.tool', body).forEach((b) => (b.onclick = () => {
        const id = b.dataset.tool;
        if (b.classList.contains('locked')) { SFX.error(); toast(`🔒 Faltam ${TOOLS.find((t) => t.id === id).cost - pts()} estrelinhas`); return; }
        if (PS.favMode) { favToggle('tools', id); draw(); renderTools(); return; }
        selectTool(id); m.close();
      }));
    };
    const m = sheet('Lápis e pincéis', body, { headerExtra: favHeader(), onClose: () => { PS.favMode = false; } });
    $('.favmode', m).onclick = (e) => { PS.favMode = !PS.favMode; e.currentTarget.classList.toggle('sel', PS.favMode); $('span', e.currentTarget).textContent = PS.favMode ? 'Toque para marcar favoritos' : 'Escolher favoritos'; SFX.tap(); };
    draw();
  }

  function openColorsSheet() {
    SFX.tap();
    const body = h('<div class="colors-sheet"></div>');
    const draw = () => {
      let html = COLOR_PACKS.map((p) => {
        const ok = open(p.cost);
        return `<div class="pack ${ok ? '' : 'locked'}"><div class="pack-h"><b>${p.name}</b>${ok ? '' : `<span class="lockc">${IC.lock} faltam ${p.cost - pts()} ${IC.star}</span>`}</div>
          <div class="pack-s">${p.colors.map((c) => {
            const fav = P().favorites.colors.some((x) => x.toLowerCase() === c.hex.toLowerCase());
            return `<button class="swatch ${c.hex.toLowerCase() === painter.color.toLowerCase() ? 'sel' : ''} ${c.hex === '#FFFFFF' ? 'white' : ''}" data-c="${c.hex}" style="${swatchStyle(c.hex)}" title="${esc(c.name)}" ${ok ? '' : 'disabled'}>${fav ? `<i class="fav">${IC.heart}</i>` : ''}</button>`;
          }).join('')}</div></div>`;
      }).join('');
      const freeOk = open(FREE_COLOR_COST);
      html += `<div class="pack ${freeOk ? '' : 'locked'}"><div class="pack-h"><b>Cor livre</b>${freeOk ? '<span>escolha qualquer cor do mundo!</span>' : `<span class="lockc">${IC.lock} faltam ${FREE_COLOR_COST - pts()} ${IC.star}</span>`}</div>
        <div class="pack-s"><label class="swatch rainbow ${freeOk ? '' : 'disabled'}"><input type="color" value="${painter.color}" ${freeOk ? '' : 'disabled'}></label></div></div>`;
      body.innerHTML = html;
      $$('.swatch[data-c]', body).forEach((b) => (b.onclick = () => {
        if (b.disabled) return;
        if (PS.favMode) { favToggle('colors', b.dataset.c); draw(); renderColors(); return; }
        selectColor(b.dataset.c); m.close();
      }));
      const inp = $('input[type=color]', body);
      if (inp) inp.onchange = () => {
        if (PS.favMode) { favToggle('colors', inp.value.toUpperCase()); draw(); renderColors(); return; }
        selectColor(inp.value.toUpperCase()); m.close();
      };
    };
    const m = sheet('Todas as cores', body, { headerExtra: favHeader(), onClose: () => { PS.favMode = false; } });
    $('.favmode', m).onclick = (e) => { PS.favMode = !PS.favMode; e.currentTarget.classList.toggle('sel', PS.favMode); $('span', e.currentTarget).textContent = PS.favMode ? 'Toque para marcar favoritos' : 'Escolher favoritos'; SFX.tap(); };
    draw();
  }

  // ---------- rascunho automático ----------
  function scheduleAutosave() {
    clearTimeout(PS.autosaveT);
    PS.autosaveT = setTimeout(saveDraft, 2500);
  }
  async function saveDraft() {
    clearTimeout(PS.autosaveT);
    if (!painter || !PS.id || !painter.dirty) return;
    const paint = await new Promise((r) => painter.cvPaint.toBlob(r, 'image/png'));
    await Store.put('drafts', { drawingId: PS.id, paint, thumb: painter.thumbDataURL(300), artId: PS.artId, updated: Date.now() }).catch(() => {});
    painter.dirty = false;
  }

  // ---------- TERMINEI! avaliação e recompensa ----------
  async function finishPainting() {
    const r = Score.evaluate(painter);
    if (r.score < 3 && !painter.undoStack.length) { SFX.error(); toast('Pinte um pouquinho primeiro! 🖍️'); return; }
    const before = pts();
    const prev = P().best[PS.id];
    const gained = Math.max(0, r.points - (prev ? prev.points : 0));
    P().totalEarned += gained;
    if (!prev || r.score > prev.score) P().best[PS.id] = { score: r.score, stars: r.stars, points: Math.max(r.points, prev ? prev.points : 0) };

    // estatísticas
    const st = P().stats;
    const firstSaveOfArt = !PS.artId;
    if (firstSaveOfArt) { st.saves++; if (PS.drawing.free) st.freeSaves++; }
    if (r.stars === 5 && (!prev || prev.stars < 5)) st.fiveStars++;
    PS.colors.forEach((c) => { if (!st.colors.includes(c)) st.colors.push(c); });
    PS.tools.forEach((t) => { if (!st.tools.includes(t)) st.tools.push(t); });
    st.stickers += PS.stamps; PS.stamps = 0;
    if (!PS.drawing.free && PS.drawing.theme !== 'meus' && !st.themes.includes(PS.drawing.theme)) st.themes.push(PS.drawing.theme);
    // medalhas
    const newAch = [];
    ACHIEVEMENTS.forEach((a) => { if (!P().achievements[a.id] && a.check(P())) { P().achievements[a.id] = Date.now(); newAch.push(a); P().totalEarned += ACHIEVEMENT_BONUS; } });
    const after = pts();
    const unlocked = P().settings.unlockAll ? [] : unlockables().filter((u) => u.cost > before && u.cost <= after);
    Store.save();

    // salva na galeria
    const image = await new Promise((res) => painter.composite(1200).toBlob(res, 'image/jpeg', 0.92));
    const paint = await new Promise((res) => painter.cvPaint.toBlob(res, 'image/png'));
    const art = { id: PS.artId || 'a' + Date.now(), drawingId: PS.id, title: PS.drawing.title, theme: PS.drawing.theme, date: Date.now(), thumb: painter.thumbDataURL(360), image, paint, score: r.score, stars: r.stars };
    PS.artId = art.id;
    await Store.put('art', art).catch((e) => console.warn(e));
    painter.dirty = true; await saveDraft();
    $('#paintScreen .ptitle i').textContent = pts();
    showResult(r, gained, prev, unlocked, newAch);
  }

  function showResult(r, gained, prev, unlocked, achs) {
    const lvBefore = levelOf(pts() - gained - achs.length * ACHIEVEMENT_BONUS).level, lvAfter = levelOf(pts()).level;
    const card = h(`<div class="result">
      <div class="r-head"><div class="mascot small ${r.stars >= 4 ? 'jump' : 'bob'}">${mascot()}</div><h2>${r.title}</h2></div>
      <div class="r-art"><img src="${painter.thumbDataURL(420)}"></div>
      <div class="r-stars">${[0, 1, 2, 3, 4].map((i) => `<span class="rs" data-i="${i}">${IC.star}</span>`).join('')}</div>
      <div class="r-grade">Nota <b class="gr">0</b></div>
      <ul class="r-tips">${r.tips.map((t) => `<li class="${t.ok ? 'ok' : 'no'}">${t.ok ? '✔' : '➜'} ${t.text}</li>`).join('')}</ul>
      <div class="r-points">${gained > 0 ? `<span class="plus">+${gained}</span> ${IC.star}` : `<small>Você já ganhou ${prev ? prev.points : 0} ${IC.star} neste desenho. Capriche mais para ganhar mais!</small>`}</div>
      ${achs.length ? `<div class="r-unl"><h3>Medalha nova!</h3>${achs.map((a) => `<div class="u-item"><span class="u-em">${a.emoji}</span><div><b>${a.name}</b><small>${a.desc} · +${ACHIEVEMENT_BONUS} ${IC.star}</small></div></div>`).join('')}</div>` : ''}
      ${unlocked.length ? `<div class="r-unl"><h3>🎁 Você desbloqueou!</h3>${unlocked.map(unlockItemHTML).join('')}</div>` : ''}
      ${lvAfter > lvBefore ? `<div class="r-level">⬆️ Subiu para o <b>nível ${lvAfter}</b>: ${levelOf(pts()).name}!</div>` : ''}
      <div class="row wrap">
        <button class="btn ghost r-cont">${IC.brush}Continuar pintando</button>
        <button class="btn orange r-gal">🖼️ Galeria</button>
        <button class="btn purple r-more">🎨 Mais desenhos</button>
      </div></div>`);
    const m = modal(card, { cls: 'result-modal' });
    $('.r-cont', card).onclick = () => { SFX.tap(); m.close(); };
    $('.r-gal', card).onclick = () => { SFX.tap(); m.close(); go('#/galeria'); };
    $('.r-more', card).onclick = () => { SFX.tap(); m.close(); go(PS.drawing.free ? '#/' : '#/tema/' + PS.drawing.theme); };
    // animação: estrelas uma a uma, nota subindo, confete
    $$('.rs', card).forEach((s, i) => {
      if (i < r.stars) setTimeout(() => { s.classList.add('on'); SFX.star(i); }, 450 + i * 330);
    });
    const end = 450 + r.stars * 330;
    const gr = $('.gr', card); const t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / end); gr.textContent = ((r.score / 10) * k).toFixed(1).replace('.', ','); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
    setTimeout(() => {
      if (r.stars >= 3) { confetti(r.stars * 40); SFX.fanfare(); }
      if (gained) SFX.coin();
      if (unlocked.length || achs.length) setTimeout(() => { SFX.unlock(); confetti(120); }, 700);
    }, end);
    SFX.say(r.title.replace('!', ''));
  }
  function unlockItemHTML(u) {
    let vis = '';
    if (u.icon) vis = `<span class="u-ic" style="color:#FF5C8A">${u.icon}</span>`;
    else if (u.colors) vis = `<span class="u-cols">${u.colors.slice(0, 6).map((c) => `<i style="${swatchStyle(c.hex)}"></i>`).join('')}</span>`;
    else if (u.rainbow) vis = '<span class="u-cols"><i class="rainbow"></i></span>';
    else if (u.emoji) vis = `<span class="u-em">${u.emoji}</span>`;
    else if (u.drawing) vis = `<span class="u-dr"><img src="${svgToDataURL(u.drawing.svg)}"></span>`;
    return `<div class="u-item">${vis}<div><b>${esc(u.name)}</b><small>${u.kind}</small></div><i class="new">NOVO!</i></div>`;
  }

  // ================= GALERIA =================
  async function gallery() {
    const arts = (await Store.all('art').catch(() => [])).sort((a, b) => b.date - a.date);
    const s = show(`
      <div class="page">
        <div class="topbar" style="--a:#FF8C42"><button class="icon-btn" data-go="#/">${IC.back}</button><h1><span class="h-em">🖼️</span>Minha galeria</h1>${profileChip()}</div>
        ${arts.length ? `<div class="g-grid">${arts.map((a) => `<button class="g-card" data-id="${a.id}"><div class="frame"><img src="${a.thumb}"></div><b>${esc(a.title)}</b><div class="d-stars">${starsHTML(a.stars)}</div></button>`).join('')}</div>`
          : `<div class="empty"><div class="mascot bob">${mascot()}</div><p>Sua galeria está vazia.<br>Pinte um desenho e toque em <b>Terminei!</b> para guardar aqui.</p><button class="btn purple" data-go="#/temas">🎨 Pintar agora</button></div>`}
      </div>`, 'bg-soft');
    bindGo(s);
    $$('.g-card', s).forEach((b) => (b.onclick = () => viewArt(arts.find((a) => a.id === b.dataset.id))));
  }
  function viewArt(a) {
    SFX.tap();
    const url = URL.createObjectURL(a.image);
    const card = h(`<div class="viewer"><div class="v-img"><img src="${url}"></div>
      <div class="v-info"><h2>${esc(a.title)}</h2><div class="d-stars big">${starsHTML(a.stars)}</div><p>Nota <b>${(a.score / 10).toFixed(1).replace('.', ',')}</b> · ${new Date(a.date).toLocaleDateString('pt-BR')}</p>
      <div class="col">
        <button class="btn purple v-cont">${IC.brush}Continuar pintando</button>
        <button class="btn teal v-share">${IC.share}Enviar / salvar no aparelho</button>
        <button class="btn ghost v-down">${IC.download}Baixar imagem</button>
        <button class="btn ghost red-t v-del">${IC.trash}Apagar</button>
      </div></div></div>`);
    const m = modal(card, { cls: 'viewer-modal', onClose: () => URL.revokeObjectURL(url) });
    const fname = `PintaKids-${a.title.replace(/[^\wÀ-ú]+/g, '-')}.jpg`;
    $('.v-cont', card).onclick = () => { m.close(); PS.pendingArt = a; go('#/pintar/' + a.drawingId); };
    $('.v-down', card).onclick = () => { const l = document.createElement('a'); l.href = url; l.download = fname; l.click(); SFX.select(); };
    $('.v-share', card).onclick = async () => {
      const file = new File([a.image], fname, { type: 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: a.title }); } catch (e) {} }
      else { $('.v-down', card).click(); toast('Imagem baixada! Procure na pasta Downloads.'); }
    };
    $('.v-del', card).onclick = async () => {
      if (!(await confirmBox('Apagar esta pintura da galeria?', 'Apagar', 'Não'))) return;
      await Store.del('art', a.id); SFX.erase(); m.close(); gallery();
    };
  }

  // ================= PRÊMIOS =================
  function prizes(tab = 'premios') {
    const all = unlockables();
    const nu = nextUnlock();
    const lv = levelOf(pts());
    const prog = nu ? Math.min(100, (pts() / nu.cost) * 100) : 100;
    const groups = [['Lápis mágico', 'Lápis e pincéis'], ['Balde', 'Baldes de tinta'], ['Cores', 'Caixas de cores'], ['Carimbos', 'Carimbos'], ['Desenho', 'Desenhos']];
    const s = show(`
      <div class="page">
        <div class="topbar" style="--a:#FF5C8A"><button class="icon-btn" data-go="#/">${IC.back}</button><h1><span class="h-em">🏆</span>Prêmios</h1>${profileChip()}</div>
        <div class="next-card">
          <div class="nc-level"><div class="lv-badge big">${lv.level}</div><div><b>${lv.name}</b><small>${pts()} estrelinhas no total</small></div></div>
          ${nu ? `<div class="nc-next"><small>Próximo prêmio</small><div class="nc-row">${unlockItemHTML(nu).replace('<i class="new">NOVO!</i>', '')}</div>
            <div class="bar"><i style="width:${prog}%"></i></div><small>faltam <b>${nu.cost - pts()}</b> ${IC.star}</small></div>` : '<div class="nc-next"><b>Você desbloqueou TUDO! 🎉</b></div>'}
        </div>
        <div class="tabs"><button class="tab ${tab === 'premios' ? 'sel' : ''}" data-t="premios">🎁 Desbloqueios</button><button class="tab ${tab === 'medalhas' ? 'sel' : ''}" data-t="medalhas">🏅 Medalhas</button></div>
        ${tab === 'premios' ? groups.map(([k, title]) => `<h3 class="sec">${title}</h3><div class="u-grid">${all.filter((u) => u.kind === k).map((u) => {
          const ok = open(u.cost);
          return `<div class="u-card ${ok ? 'ok' : ''}">${unlockItemHTML(u).replace('<i class="new">NOVO!</i>', ok ? '<i class="okb">✔</i>' : `<i class="lockb">${IC.lock}${u.cost}</i>`)}</div>`;
        }).join('')}</div>`).join('')
        : `<div class="a-grid">${ACHIEVEMENTS.map((a) => { const ok = P().achievements[a.id]; return `<div class="a-card ${ok ? 'ok' : ''}"><span class="a-em">${a.emoji}</span><b>${a.name}</b><small>${a.desc}</small>${ok ? '<i class="okb">✔</i>' : ''}</div>`; }).join('')}</div>`}
      </div>`, 'bg-soft');
    bindGo(s);
    $$('.tab', s).forEach((b) => (b.onclick = () => { SFX.tap(); prizes(b.dataset.t); }));
  }

  // ================= ÁREA DOS PAIS =================
  let parentsOK = false;
  function parentsGate() {
    if (parentsOK) return parents();
    const a = 3 + Math.floor(Math.random() * 7), b = 3 + Math.floor(Math.random() * 7);
    const s = show(`<div class="page"><div class="topbar"><button class="icon-btn" data-go="#/">${IC.back}</button><h1>Área dos pais</h1></div>
      <div class="gate"><p>Para entrar, responda:</p><h2>${a} × ${b} = ?</h2><input type="number" inputmode="numeric" class="gate-in" autocomplete="off"><button class="btn purple gate-ok">Entrar</button></div></div>`, 'bg-soft');
    bindGo(s);
    const inp = $('.gate-in', s);
    const ok = () => { if (+inp.value === a * b) { parentsOK = true; parents(); } else { SFX.error(); inp.value = ''; inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 500); } };
    $('.gate-ok', s).onclick = ok; inp.onkeydown = (e) => { if (e.key === 'Enter') ok(); };
  }
  async function parents() {
    const st = P().settings;
    const customs = await Store.all('custom').catch(() => []);
    const s = show(`<div class="page"><div class="topbar"><button class="icon-btn" data-go="#/">${IC.back}</button><h1>Área dos pais</h1></div>
      <div class="settings">
        <section><h3>Perfil</h3><label class="field">Nome da criança<input class="s-name" value="${esc(P().name)}" maxlength="20"></label></section>
        <section><h3>Sons e voz</h3>
          <label class="tg"><input type="checkbox" class="s-sound" ${st.sound ? 'checked' : ''}><span></span>Efeitos sonoros</label>
          <label class="tg"><input type="checkbox" class="s-speak" ${st.speak ? 'checked' : ''}><span></span>Falar o nome das cores e lápis (ajuda a aprender)</label></section>
        <section><h3>Força do toque</h3>
          <p class="hint">Com caneta (stylus) o app usa a pressão real. Com o dedo, usa o tamanho do contato (quando o tablet informa) e a velocidade do traço: devagar = grosso, rápido = fino.</p>
          <label class="field">Sensibilidade <input type="range" min="0.4" max="2" step="0.1" class="s-sens" value="${st.sensitivity}"><b class="s-sens-v">${st.sensitivity}</b></label>
          <label class="tg"><input type="checkbox" class="s-speed" ${st.useSpeed ? 'checked' : ''}><span></span>Usar a velocidade do traço</label>
          <button class="btn ghost s-cal">Recalibrar dedo</button></section>
        <section><h3>Desbloqueios</h3>
          <label class="tg"><input type="checkbox" class="s-unlock" ${st.unlockAll ? 'checked' : ''}><span></span>Liberar tudo agora (sem precisar de pontos)</label>
          <p class="hint">Pontos atuais: <b>${pts()}</b>. Os pontos continuam contando mesmo com tudo liberado.</p></section>
        <section><h3>Meus desenhos (fotos e imagens)</h3>
          <p class="hint">Fotografe ou baixe qualquer página de colorir (personagens, heróis…) e ela vira um desenho pintável, com balde e pintura mágica. Funciona melhor com imagens de linhas pretas em fundo branco.</p>
          <button class="btn teal s-import">${IC.plus}Adicionar imagem</button>
          <div class="c-list">${customs.map((c) => `<div class="c-item"><img src="${c.image}"><span>${esc(c.title)}</span><button class="icon-btn small c-del" data-id="${c.id}">${IC.trash}</button></div>`).join('') || '<p class="hint">Nenhum ainda.</p>'}</div></section>
        <section><h3>Instalar no tablet</h3><p class="hint">Abra este endereço no <b>Chrome</b> do tablet → menu ⋮ → <b>Instalar app</b> (ou "Adicionar à tela inicial"). Ele ganha ícone próprio e funciona sem internet.</p></section>
        <section class="danger"><h3>Recomeçar</h3><button class="btn red s-reset">Apagar todo o progresso e a galeria</button></section>
        <p class="ver">PintaKids · feito com carinho</p>
      </div></div>`, 'bg-soft');
    bindGo(s);
    $('.s-name', s).oninput = (e) => { P().name = e.target.value.trim(); Store.save(); };
    $('.s-sound', s).onchange = (e) => { st.sound = e.target.checked; Store.save(); SFX.tap(); };
    $('.s-speak', s).onchange = (e) => { st.speak = e.target.checked; Store.save(); SFX.say('Vermelho'); };
    $('.s-sens', s).oninput = (e) => { st.sensitivity = +e.target.value; $('.s-sens-v', s).textContent = st.sensitivity; Store.save(); };
    $('.s-speed', s).onchange = (e) => { st.useSpeed = e.target.checked; Store.save(); };
    $('.s-cal', s).onclick = () => { P().touchCal = { min: 0, max: 0 }; Store.save(); toast('Pronto! O app vai reaprender o toque do dedo.'); };
    $('.s-unlock', s).onchange = (e) => { st.unlockAll = e.target.checked; Store.save(); if (st.unlockAll) { SFX.unlock(); confetti(); } };
    $('.s-import', s).onclick = () => importImage(parents);
    $$('.c-del', s).forEach((b) => (b.onclick = async () => {
      if (!(await confirmBox('Remover este desenho?', 'Remover', 'Não'))) return;
      await Store.del('custom', +b.dataset.id); await Store.del('drafts', 'c-' + b.dataset.id).catch(() => {}); parents();
    }));
    $('.s-reset', s).onclick = async () => {
      if (!(await confirmBox('Tem certeza? Isso apaga pontos, prêmios e TODAS as pinturas da galeria.', 'Apagar tudo', 'Cancelar'))) return;
      if (!(await confirmBox('Última confirmação: apagar mesmo?', 'Sim, apagar', 'Cancelar'))) return;
      await Store.clearAll(); Store.reset(); toast('Tudo zerado.'); go('#/');
    };
  }

  // ================= BOAS-VINDAS =================
  function welcome() {
    const card = h(`<div class="welcome"><div class="mascot bob">${mascot()}</div><h2>Oi! Eu sou o Pingo!</h2><p>Vou te ajudar a pintar. Qual é o seu nome?</p>
      <input class="w-name" maxlength="20" placeholder="Seu nome"><button class="btn purple w-go">Vamos pintar! 🎨</button></div>`);
    const m = modal(card, { dismiss: false });
    const go2 = () => { P().name = $('.w-name', card).value.trim(); P().welcomed = true; Store.save(); SFX.fanfare(); confetti(80); m.close(); home(); };
    $('.w-go', card).onclick = go2;
    $('.w-name', card).onkeydown = (e) => { if (e.key === 'Enter') go2(); };
  }

  // ================= NAVEGAÇÃO =================
  function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }
  function bindGo(root) { $$('[data-go]', root).forEach((b) => (b.onclick = () => { SFX.tap(); go(b.dataset.go); })); }
  let inPaint = false;
  async function route() {
    const [a, b] = location.hash.replace(/^#\/?/, '').split('/');
    if (inPaint && a !== 'pintar') { await saveDraft(); inPaint = false; }
    if (inPaint && a === 'pintar') await saveDraft();
    switch (a) {
      case 'temas': return themesScreen();
      case 'tema': return themeScreen(b);
      case 'pintar': inPaint = true; return openPaint(b || 'livre');
      case 'galeria': return gallery();
      case 'premios': return prizes();
      case 'pais': return parentsGate();
      default: return home();
    }
  }
  window.addEventListener('hashchange', route);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { saveDraft(); Store.save(); } });
  window.addEventListener('pagehide', () => saveDraft());

  // novo desenho livre ganha id próprio na URL (para o rascunho voltar certo)
  const _open = openPaint;
  openPaint = async function (id) {
    if (id === 'livre') { const nid = 'livre-' + Date.now(); history.replaceState(null, '', '#/pintar/' + nid); return _open(nid); }
    return _open(id);
  };

  window.addEventListener('DOMContentLoaded', () => {
    route();
    if (!P().welcomed) welcome();
  });
  window.PintaApp = { go, get painter() { return painter; } };
})();
