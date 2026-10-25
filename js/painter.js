/* PintaKids — motor de pintura
   Camadas (de baixo para cima): papel branco (CSS) · pintura · traço em andamento ·
   linhas do desenho · dicas. As linhas ficam SEMPRE por cima, então a pintura
   nunca cobre o contorno — o desenho continua bonito mesmo com rabiscos.
   O desenho é dividido em REGIÕES (áreas fechadas pelas linhas): é isso que faz
   o balde, a "pintura mágica" (não sai da linha), as dicas e a nota funcionarem. */
(function () {
  const S = 1200;
  const LINE_RGB = [42, 34, 56];

  function mk(w = S, h = S) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; return c;
  }
  function loadImage(src) {
    return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  }
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  class Painter {
    constructor(host) {
      this.host = host;
      host.innerHTML =
        '<div class="stage"><canvas class="cv cv-paint"></canvas><canvas class="cv cv-stroke"></canvas>' +
        '<canvas class="cv cv-lines"></canvas><canvas class="cv cv-hint"></canvas></div>';
      this.stage = host.querySelector('.stage');
      const [p, st, ln, hn] = host.querySelectorAll('canvas');
      [p, st, ln, hn].forEach((c) => { c.width = c.height = S; });
      this.cvPaint = p; this.cvStroke = st; this.cvLines = ln; this.cvHint = hn;
      this.px = p.getContext('2d', { willReadFrequently: true });
      this.sx = st.getContext('2d');
      this.lx = ln.getContext('2d');
      this.hx = hn.getContext('2d');
      this.backup = mk(); this.bx = this.backup.getContext('2d', { willReadFrequently: true });

      this.tool = 'giz'; this.color = '#E53935'; this.sizeIdx = 1; this.fillStyle = 'solido';
      this.sticker = '⭐'; this.magic = false; this.sensitivity = 1; this.useSpeed = true;
      this.undoStack = []; this.redoStack = []; this.undoBytes = 0;
      this.view = { s: 1, tx: 0, ty: 0 };
      this.pointers = new Map();
      this.maskCache = new Map();
      this.touchCal = { min: 0, max: 0 };
      this.onChange = null; this.onStroke = null; this.onPressure = null; this.onView = null;

      this._bind();
      this._ro = new ResizeObserver(() => this.fit());
      this._ro.observe(host);
    }

    // ---------------- layout / zoom ----------------
    fit() {
      const w = this.host.clientWidth, h = this.host.clientHeight;
      const side = Math.max(50, Math.floor(Math.min(w, h)));
      this.side = side;
      this.stage.style.width = this.stage.style.height = side + 'px';
      this.stage.style.left = Math.floor((w - side) / 2) + 'px';
      this.stage.style.top = Math.floor((h - side) / 2) + 'px';
      this._applyView();
    }
    _applyView() {
      const v = this.view;
      if (v.s <= 1.001) { v.s = 1; v.tx = 0; v.ty = 0; }
      else {
        const lim = this.side * (v.s - 1);
        v.tx = clamp(v.tx, -lim - this.side * 0.25, this.side * 0.25);
        v.ty = clamp(v.ty, -lim - this.side * 0.25, this.side * 0.25);
      }
      this.stage.style.transform = `translate(${v.tx}px,${v.ty}px) scale(${v.s})`;
      this.onView && this.onView(v.s > 1.01);
    }
    resetView() { this.view = { s: 1, tx: 0, ty: 0 }; this._applyView(); }
    _zoomAt(cx, cy, s, base) { // cx,cy em coordenadas do host
      const b = base || this.view;
      const px = (cx - parseFloat(this.stage.style.left) - b.tx) / b.s;
      const py = (cy - parseFloat(this.stage.style.top) - b.ty) / b.s;
      this.view.s = clamp(s, 1, 6);
      this.view.tx = cx - parseFloat(this.stage.style.left) - px * this.view.s;
      this.view.ty = cy - parseFloat(this.stage.style.top) - py * this.view.s;
      this._applyView();
    }

    // ---------------- carregar desenho ----------------
    async load({ svg = null, imageURL = null, paintURL = null, photo = false } = {}) {
      const tmp = mk(); const tx = tmp.getContext('2d', { willReadFrequently: true });
      tx.fillStyle = '#fff'; tx.fillRect(0, 0, S, S);
      if (svg || imageURL) {
        const img = await loadImage(svg ? svgToDataURL(svg) : imageURL);
        if (svg) tx.drawImage(img, 0, 0, S, S);
        else { // foto/imagem importada: encaixa sem distorcer
          const k = Math.min(S / img.width, S / img.height);
          const w = img.width * k, h = img.height * k;
          tx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
        }
      }
      const src = tx.getImageData(0, 0, S, S).data;
      const N = S * S;
      this.line = new Uint8Array(N);
      const out = this.lx.createImageData(S, S); const od = out.data;
      let lo = 70, hi = 235, cut = 150;
      if (photo) { // limiar adaptativo pela média da imagem
        let sum = 0; for (let i = 0; i < N; i++) sum += src[i * 4] * 0.3 + src[i * 4 + 1] * 0.59 + src[i * 4 + 2] * 0.11;
        const mean = sum / N; cut = Math.min(150, mean * 0.72); hi = Math.min(235, cut + 60); lo = Math.max(0, cut - 70);
      }
      this.hasLines = false;
      for (let i = 0; i < N; i++) {
        const j = i * 4;
        const lum = src[j] * 0.3 + src[j + 1] * 0.59 + src[j + 2] * 0.11;
        if (lum < cut) { this.line[i] = 1; this.hasLines = true; }
        const a = clamp((hi - lum) / (hi - lo), 0, 1);
        od[j] = LINE_RGB[0]; od[j + 1] = LINE_RGB[1]; od[j + 2] = LINE_RGB[2]; od[j + 3] = Math.round(a * 255);
      }
      this.lx.clearRect(0, 0, S, S); this.lx.putImageData(out, 0, 0);
      this._label();
      this.maskCache.clear();
      this.px.clearRect(0, 0, S, S);
      if (paintURL) { const pi = await loadImage(paintURL); this.px.drawImage(pi, 0, 0, S, S); }
      this.bx.clearRect(0, 0, S, S); this.bx.drawImage(this.cvPaint, 0, 0);
      this.undoStack = []; this.redoStack = []; this.undoBytes = 0;
      this.hx.clearRect(0, 0, S, S);
      this.resetView();
      this.dirty = false;
      this._emitChange();
    }

    // rotula cada área fechada (4-vizinhança) — base de balde, magia, dicas e nota
    _label() {
      const N = S * S, line = this.line;
      const lab = (this.labels = new Int32Array(N));
      const regions = (this.regions = [null]);
      const stack = new Int32Array(N);
      let id = 0;
      for (let i0 = 0; i0 < N; i0++) {
        if (line[i0] || lab[i0]) continue;
        id++;
        let sp = 0, area = 0, minx = S, miny = S, maxx = 0, maxy = 0, border = false;
        stack[sp++] = i0; lab[i0] = id;
        while (sp) {
          const i = stack[--sp];
          const x = i % S, y = (i / S) | 0;
          area++;
          if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y;
          if (x === 0 || y === 0 || x === S - 1 || y === S - 1) border = true;
          if (x > 0 && !line[i - 1] && !lab[i - 1]) { lab[i - 1] = id; stack[sp++] = i - 1; }
          if (x < S - 1 && !line[i + 1] && !lab[i + 1]) { lab[i + 1] = id; stack[sp++] = i + 1; }
          if (y > 0 && !line[i - S] && !lab[i - S]) { lab[i - S] = id; stack[sp++] = i - S; }
          if (y < S - 1 && !line[i + S] && !lab[i + S]) { lab[i + S] = id; stack[sp++] = i + S; }
        }
        regions.push({ id, area, minx, miny, maxx, maxy, border });
      }
    }
    labelAt(x, y) {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= S || y >= S) return 0;
      const L = this.labels[y * S + x];
      if (L) return L;
      for (let r = 1; r <= 14; r++) { // tocou na linha: procura a região mais próxima
        for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= S || yy >= S) continue;
          const l = this.labels[yy * S + xx]; if (l) return l;
        }
      }
      return 0;
    }
    // máscara da região, avançando alguns pixels por baixo das linhas (sem frestas brancas)
    _regionMask(L, grow = 6) {
      const R = this.regions[L];
      const x0 = Math.max(0, R.minx - grow), y0 = Math.max(0, R.miny - grow);
      const x1 = Math.min(S - 1, R.maxx + grow), y1 = Math.min(S - 1, R.maxy + grow);
      const w = x1 - x0 + 1, h = y1 - y0 + 1;
      const m = new Uint8Array(w * h);
      const lab = this.labels, line = this.line;
      for (let y = 0; y < h; y++) {
        const row = (y + y0) * S + x0;
        for (let x = 0; x < w; x++) if (lab[row + x] === L) m[y * w + x] = 1;
      }
      for (let k = 1; k <= grow; k++) {
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const i = y * w + x;
          if (m[i] || !line[(y + y0) * S + x + x0]) continue;
          if ((x > 0 && m[i - 1] && m[i - 1] <= k) || (x < w - 1 && m[i + 1] && m[i + 1] <= k) ||
              (y > 0 && m[i - w] && m[i - w] <= k) || (y < h - 1 && m[i + w] && m[i + w] <= k)) m[i] = k + 1;
        }
      }
      return { x: x0, y: y0, w, h, m };
    }
    _maskCanvas(L) {
      if (this.maskCache.has(L)) return this.maskCache.get(L);
      const R = this._regionMask(L, 6);
      const c = mk(); const g = c.getContext('2d');
      const img = g.createImageData(R.w, R.h);
      for (let i = 0; i < R.m.length; i++) if (R.m[i]) img.data[i * 4 + 3] = 255;
      g.putImageData(img, R.x, R.y);
      if (this.maskCache.size > 10) this.maskCache.delete(this.maskCache.keys().next().value);
      this.maskCache.set(L, c);
      return c;
    }

    // ---------------- entrada (toque, caneta, mouse) ----------------
    _bind() {
      const el = this.host;
      el.style.touchAction = 'none';
      el.addEventListener('pointerdown', (e) => this._down(e));
      el.addEventListener('pointermove', (e) => this._move(e));
      el.addEventListener('pointerup', (e) => this._up(e));
      el.addEventListener('pointercancel', (e) => this._up(e, true));
      el.addEventListener('wheel', (e) => {
        e.preventDefault();
        const r = el.getBoundingClientRect();
        this._zoomAt(e.clientX - r.left, e.clientY - r.top, this.view.s * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
      }, { passive: false });
      el.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    _toCanvas(e) {
      const r = this.cvPaint.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * S, y: ((e.clientY - r.top) / r.height) * S };
    }
    _hostPt(e) { const r = this.host.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

    _down(e) {
      if (e.pointerType === 'touch' && this.penDown) return; // apoio da mão enquanto usa caneta
      try { this.host.setPointerCapture(e.pointerId); } catch (_) {}
      this.pointers.set(e.pointerId, this._hostPt(e));
      if (e.pointerType === 'pen') this.penDown = true;
      if (this.pointers.size >= 2) { // dois dedos = zoom/arrastar
        if (this.stroke) this._cancelStroke();
        this._startGesture();
        return;
      }
      if (this.gesture || this.gestureLock) return;
      if (e.button && e.button !== 0) return;
      this._startStroke(e);
    }
    _move(e) {
      if (this.pointers.has(e.pointerId)) this.pointers.set(e.pointerId, this._hostPt(e));
      if (this.gesture) { this._updateGesture(); return; }
      if (!this.stroke || e.pointerId !== this.stroke.pid) return;
      const list = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
      (list && list.length ? list : [e]).forEach((ev) => this._addPoint(ev));
    }
    _up(e, cancel) {
      this.pointers.delete(e.pointerId);
      if (e.pointerType === 'pen') this.penDown = false;
      if (this.gesture) {
        if (this.pointers.size < 2) { this.gesture = null; this.gestureLock = this.pointers.size > 0; }
        return;
      }
      if (this.pointers.size === 0) this.gestureLock = false;
      if (this.stroke && e.pointerId === this.stroke.pid) cancel ? this._cancelStroke() : this._endStroke();
    }
    _startGesture() {
      const [a, b] = [...this.pointers.values()];
      this.gesture = { d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, m0: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, v0: { ...this.view } };
    }
    _updateGesture() {
      const pts = [...this.pointers.values()]; if (pts.length < 2) return;
      const [a, b] = pts, g = this.gesture;
      const d = Math.hypot(a.x - b.x, a.y - b.y), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const s = clamp(g.v0.s * (d / g.d0), 1, 6);
      const left = parseFloat(this.stage.style.left), top = parseFloat(this.stage.style.top);
      const px = (g.m0.x - left - g.v0.tx) / g.v0.s, py = (g.m0.y - top - g.v0.ty) / g.v0.s;
      this.view = { s, tx: m.x - left - px * s, ty: m.y - top - py * s };
      this._applyView();
    }

    // FORÇA DO TOQUE: caneta usa pressão real; dedo usa o tamanho do contato
    // (dedo apertado achata e cresce) quando o aparelho informa; e a velocidade
    // sempre ajuda: traço lento = grosso, rápido = fino, como um pincel de verdade.
    _pressure(e, t) {
      const st = this.stroke;
      let p = null;
      if (e.pointerType === 'pen' && e.pressure > 0) p = e.pressure;
      else if (e.pointerType === 'touch') {
        if (e.pressure > 0 && Math.abs(e.pressure - 0.5) > 0.01 && e.pressure !== 1) p = e.pressure;
        else {
          const w = Math.max(e.width || 0, e.height || 0);
          if (w > 1) {
            const c = this.touchCal;
            if (!c.min || w < c.min) c.min = w;
            if (w > c.max) c.max = w;
            if (c.max - c.min > 3) p = (w - c.min) / (c.max - c.min);
          }
        }
      }
      let speedP = 0.6;
      if (st && st.last) {
        const dt = Math.max(1, t - st.lastT);
        const v = Math.hypot(e.clientX - st.lastCX, e.clientY - st.lastCY) / dt; // px/ms
        st.v = st.v == null ? v : st.v * 0.7 + v * 0.3;
        speedP = clamp(1 - st.v / 2.4, 0.1, 1);
      }
      if (p == null) p = this.useSpeed ? 0.3 + 0.7 * speedP : 0.65;
      else if (this.useSpeed && e.pointerType !== 'pen') p = p * 0.75 + speedP * 0.25;
      p = clamp(0.5 + (p - 0.5) * this.sensitivity, 0, 1);
      if (st) { st.p = st.p == null ? p : st.p * 0.65 + p * 0.35; p = st.p; }
      return p;
    }

    get brush() { return BRUSHES[this.tool]; }
    get baseSize() {
      const t = CATALOG.TOOLS.find((x) => x.id === this.tool);
      return t && t.sizes ? t.sizes[this.sizeIdx] : 20;
    }

    _startStroke(e) {
      const pt = this._toCanvas(e);
      if (this.tool === 'balde') { this.fillAt(pt.x, pt.y); return; }
      const b = this.brush; if (!b) return;
      const st = (this.stroke = {
        pid: e.pointerId, pts: [], raw: [], color: this.color, sticker: this.sticker,
        len: 0, carry: 0, rect: null, t0: performance.now(), tool: this.tool,
      });
      st.mask = null;
      if (this.magic && this.hasLines) {
        const L = this.labelAt(pt.x, pt.y);
        if (L) st.mask = this._maskCanvas(L);
      }
      const sx = this.sx;
      sx.save();
      sx.clearRect(0, 0, S, S);
      sx.lineCap = 'round'; sx.lineJoin = 'round';
      b.begin && b.begin(sx, st);
      this.cvStroke.style.opacity = b.mode === 'layer' ? (b.opacity || 1) : 1;
      this._addPoint(e, true);
    }
    _addPoint(e, first) {
      const st = this.stroke; if (!st) return;
      const t = e.timeStamp || performance.now();
      const p = this._pressure(e, t);
      this.onPressure && this.onPressure(p);
      const pt = this._toCanvas(e);
      const b = this.brush;
      const [lo, hi] = b.pressure || [1, 1];
      pt.w = Math.max(1, this.baseSize * (lo + (hi - lo) * p));
      st.last = true; st.lastT = t; st.lastCX = e.clientX; st.lastCY = e.clientY;
      const R = st.raw;
      if (R.length && Math.hypot(pt.x - R[R.length - 1].x, pt.y - R[R.length - 1].y) < 0.8 && !first) return;
      R.push(pt);
      const n = R.length;
      if (n === 1) { this._emit([pt, { x: pt.x + 0.01, y: pt.y, w: pt.w }]); return; }
      const mid = (a, c) => ({ x: (a.x + c.x) / 2, y: (a.y + c.y) / 2, w: (a.w + c.w) / 2 });
      if (n === 2) { this._curve(R[0], null, mid(R[0], R[1])); return; }
      this._curve(mid(R[n - 3], R[n - 2]), R[n - 2], mid(R[n - 2], R[n - 1]));
    }
    // amostra a curva suavizada em pontinhos e os entrega ao pincel
    _curve(a, ctrl, b) {
      const len = ctrl ? Math.hypot(ctrl.x - a.x, ctrl.y - a.y) + Math.hypot(b.x - ctrl.x, b.y - ctrl.y) : Math.hypot(b.x - a.x, b.y - a.y);
      const steps = Math.max(1, Math.ceil(len / 2));
      const out = [a];
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        let x, y;
        if (ctrl) { const u = 1 - t; x = u * u * a.x + 2 * u * t * ctrl.x + t * t * b.x; y = u * u * a.y + 2 * u * t * ctrl.y + t * t * b.y; }
        else { x = a.x + (b.x - a.x) * t; y = a.y + (b.y - a.y) * t; }
        out.push({ x, y, w: a.w + (b.w - a.w) * t });
      }
      this._emit(out);
    }
    _emit(pts) {
      const st = this.stroke, b = this.brush, ctx = this.sx;
      const pad = (b.pad || 0) + 3;
      let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
      const grow = (x, y, w) => {
        const r = w * (b.kind === 'dab' && (this.tool === 'spray') ? 1.1 : 0.75) + pad;
        if (x - r < minx) minx = x - r; if (y - r < miny) miny = y - r;
        if (x + r > maxx) maxx = x + r; if (y + r > maxy) maxy = y + r;
      };
      if (b.kind === 'line') {
        for (let i = 1; i < pts.length; i++) {
          const p0 = pts[i - 1], p1 = pts[i];
          b.seg(ctx, p0, p1, (p0.w + p1.w) / 2, st);
          st.len += Math.hypot(p1.x - p0.x, p1.y - p0.y);
          grow(p0.x, p0.y, p0.w); grow(p1.x, p1.y, p1.w);
          st.pts.push(p1);
        }
      } else {
        for (let i = 1; i < pts.length; i++) {
          const p0 = pts[i - 1], p1 = pts[i];
          const d = Math.hypot(p1.x - p0.x, p1.y - p0.y);
          const first = st.len === 0 && i === 1;
          if (first) { b.dab(ctx, p0.x, p0.y, p0.w, st); grow(p0.x, p0.y, p0.w); }
          st.carry += d; st.len += d;
          const spacing = Math.max(1, (b.spacing || 0.5) * p1.w);
          while (st.carry >= spacing) {
            st.carry -= spacing;
            const t = d ? 1 - st.carry / d : 1;
            const x = p0.x + (p1.x - p0.x) * clamp(t, 0, 1), y = p0.y + (p1.y - p0.y) * clamp(t, 0, 1);
            b.dab(ctx, x, y, p1.w, st); grow(x, y, p1.w);
          }
          st.pts.push(p1);
        }
      }
      if (minx > maxx) return;
      const r = this._clampRect(minx, miny, maxx, maxy);
      if (!r) return;
      this._applyMask(r);
      if (b.mode === 'live') this._transfer(r, b.erase);
      st.rect = this._union(st.rect, r);
      this.dirty = true;
    }
    _clampRect(x0, y0, x1, y1) {
      x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0));
      x1 = Math.min(S, Math.ceil(x1)); y1 = Math.min(S, Math.ceil(y1));
      if (x1 <= x0 || y1 <= y0) return null;
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    }
    _union(a, b) {
      if (!a) return { ...b };
      const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
      return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
    }
    _applyMask(r) {
      const m = this.stroke && this.stroke.mask; if (!m) return;
      const sx = this.sx;
      const f = sx.filter; sx.filter = 'none';
      sx.globalCompositeOperation = 'destination-in';
      sx.drawImage(m, r.x, r.y, r.w, r.h, r.x, r.y, r.w, r.h);
      sx.globalCompositeOperation = 'source-over';
      sx.filter = f;
    }
    _transfer(r, erase) {
      const px = this.px;
      px.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
      px.drawImage(this.cvStroke, r.x, r.y, r.w, r.h, r.x, r.y, r.w, r.h);
      px.globalCompositeOperation = 'source-over';
      const f = this.sx.filter; this.sx.filter = 'none';
      this.sx.clearRect(r.x, r.y, r.w, r.h);
      this.sx.filter = f;
    }
    _endStroke() {
      const st = this.stroke; if (!st) return;
      const b = this.brush;
      const R = st.raw;
      if (R.length > 1) {
        const last = R[R.length - 1];
        const a = { x: (R[R.length - 2].x + last.x) / 2, y: (R[R.length - 2].y + last.y) / 2, w: (R[R.length - 2].w + last.w) / 2 };
        this._curve(a, null, last);
      }
      if (b.mode === 'layer' && st.rect) {
        if (b.finish) { b.finish(this.sx, st.pts); const pr = st.rect; this._applyMask(pr); }
        const r = st.rect;
        this.px.globalAlpha = b.opacity || 1;
        this.px.drawImage(this.cvStroke, r.x, r.y, r.w, r.h, r.x, r.y, r.w, r.h);
        this.px.globalAlpha = 1;
      }
      this.sx.restore();
      this.sx.clearRect(0, 0, S, S);
      this.cvStroke.style.opacity = 1;
      this.stroke = null;
      if (st.rect) this._commit(st.rect);
      this.onStroke && this.onStroke({ tool: st.tool, color: b.ignoresColor || b.erase ? null : st.color, stamps: st.stamps || 0 });
    }
    _cancelStroke() {
      const st = this.stroke; if (!st) return;
      this.sx.restore(); this.sx.clearRect(0, 0, S, S); this.cvStroke.style.opacity = 1;
      if (st.rect) { const r = st.rect; this.px.putImageData(this.bx.getImageData(r.x, r.y, r.w, r.h), r.x, r.y); }
      this.stroke = null;
    }

    // ---------------- balde de tinta ----------------
    fillAt(x, y) {
      if (!this.hasLines) return this._floodByColor(x, y);
      const L = this.labelAt(x, y); if (!L) return;
      const R = this._regionMask(L, 6);
      const img = this.px.getImageData(R.x, R.y, R.w, R.h);
      this._paintMask(img.data, R.m, R.w, R.h, R.x, R.y);
      this.px.putImageData(img, R.x, R.y);
      this._commit({ x: R.x, y: R.y, w: R.w, h: R.h });
      this.dirty = true;
      SFX.splash();
      this.onStroke && this.onStroke({ tool: 'balde', color: this.color, fill: true });
    }
    _paintMask(d, m, w, h, ox, oy) {
      const [r0, g0, b0] = ColorUtil.hexToRgb(this.color);
      const style = this.fillStyle;
      let hue0 = 0;
      if (style === 'arcoiris') hue0 = ColorUtil.rgbToHsl(r0, g0, b0)[0];
      let seed = 1234567;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x; if (!m[i]) continue;
        let r = r0, g = g0, b = b0;
        if (style === 'degrade') {
          const t = y / Math.max(1, h - 1); const k = 0.6 * (1 - t);
          r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k;
        } else if (style === 'arcoiris') {
          const hh = (hue0 + ((x + y) / (w + h)) * 330) % 360;
          [r, g, b] = hsl2rgb(hh, 0.85, 0.58);
        } else if (style === 'brilho') {
          const n = rnd();
          const k = n > 0.985 ? 0.85 : (n - 0.5) * 0.22;
          const t = k > 0 ? 255 : 0, a = Math.abs(k);
          r += (t - r) * a; g += (t - g) * a; b += (t - b) * a;
        }
        const j = i * 4; d[j] = r; d[j + 1] = g; d[j + 2] = b; d[j + 3] = 255;
      }
    }
    // desenho livre: balde respeita o que a criança desenhou (cor parecida)
    _floodByColor(x, y) {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= S || y >= S) return;
      const img = this.px.getImageData(0, 0, S, S); const d = img.data;
      const k0 = (y * S + x) * 4;
      const tr = d[k0], tg = d[k0 + 1], tb = d[k0 + 2], ta = d[k0 + 3];
      const same = (j) => {
        const a = d[j + 3];
        if (ta < 40) return a < 90;
        return a > 40 && Math.abs(d[j] - tr) + Math.abs(d[j + 1] - tg) + Math.abs(d[j + 2] - tb) < 70;
      };
      const m = new Uint8Array(S * S); const stack = [y * S + x]; m[y * S + x] = 1;
      let minx = x, miny = y, maxx = x, maxy = y;
      while (stack.length) {
        const i = stack.pop(); const xx = i % S, yy = (i / S) | 0;
        if (xx < minx) minx = xx; if (xx > maxx) maxx = xx; if (yy < miny) miny = yy; if (yy > maxy) maxy = yy;
        const nb = [xx > 0 ? i - 1 : -1, xx < S - 1 ? i + 1 : -1, yy > 0 ? i - S : -1, yy < S - 1 ? i + S : -1];
        for (const n of nb) if (n >= 0 && !m[n] && same(n * 4)) { m[n] = 1; stack.push(n); }
      }
      // avança 2px para cobrir a borda suave do traço
      for (let k = 0; k < 2; k++) {
        const add = [];
        for (let yy = Math.max(1, miny - 1); yy <= Math.min(S - 2, maxy + 1); yy++) for (let xx = Math.max(1, minx - 1); xx <= Math.min(S - 2, maxx + 1); xx++) {
          const i = yy * S + xx; if (m[i]) continue;
          if (m[i - 1] || m[i + 1] || m[i - S] || m[i + S]) add.push(i);
        }
        add.forEach((i) => (m[i] = 2));
        minx = Math.max(0, minx - 1); miny = Math.max(0, miny - 1); maxx = Math.min(S - 1, maxx + 1); maxy = Math.min(S - 1, maxy + 1);
      }
      const w = maxx - minx + 1, h = maxy - miny + 1;
      const sub = new Uint8Array(w * h);
      for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) sub[yy * w + xx] = m[(yy + miny) * S + xx + minx];
      const part = this.px.getImageData(minx, miny, w, h);
      this._paintMask(part.data, sub, w, h, minx, miny);
      this.px.putImageData(part, minx, miny);
      this._commit({ x: minx, y: miny, w, h });
      this.dirty = true;
      SFX.splash();
      this.onStroke && this.onStroke({ tool: 'balde', color: this.color, fill: true });
    }

    // ---------------- desfazer / refazer ----------------
    _commit(r) {
      const before = this.bx.getImageData(r.x, r.y, r.w, r.h);
      const after = this.px.getImageData(r.x, r.y, r.w, r.h);
      this.bx.putImageData(after, r.x, r.y);
      this.undoStack.push({ r, before, after });
      this.undoBytes += r.w * r.h * 8;
      while (this.undoBytes > 140e6 && this.undoStack.length > 1) {
        const o = this.undoStack.shift(); this.undoBytes -= o.r.w * o.r.h * 8;
      }
      this.redoStack = [];
      this._emitChange();
    }
    undo() {
      const a = this.undoStack.pop(); if (!a) return false;
      this.px.putImageData(a.before, a.r.x, a.r.y); this.bx.putImageData(a.before, a.r.x, a.r.y);
      this.undoBytes -= a.r.w * a.r.h * 8;
      this.redoStack.push(a); this.dirty = true; this._emitChange(); return true;
    }
    redo() {
      const a = this.redoStack.pop(); if (!a) return false;
      this.px.putImageData(a.after, a.r.x, a.r.y); this.bx.putImageData(a.after, a.r.x, a.r.y);
      this.undoStack.push(a); this.undoBytes += a.r.w * a.r.h * 8; this.dirty = true; this._emitChange(); return true;
    }
    clearAll() {
      this.px.clearRect(0, 0, S, S);
      this._commit({ x: 0, y: 0, w: S, h: S });
      this.dirty = true;
    }
    _emitChange() { this.onChange && this.onChange({ canUndo: this.undoStack.length > 0, canRedo: this.redoStack.length > 0 }); }

    // ---------------- análise / dicas ----------------
    coverage() { // fração pintada de cada região
      const d = this.px.getImageData(0, 0, S, S).data;
      const lab = this.labels, cnt = new Float64Array(this.regions.length), tot = new Float64Array(this.regions.length);
      const hues = new Map();
      for (let y = 0; y < S; y += 2) for (let x = 0; x < S; x += 2) {
        const i = y * S + x, L = lab[i]; if (!L) continue;
        tot[L]++;
        const j = i * 4;
        if (d[j + 3] > 70) {
          cnt[L]++;
          const key = colorBucket(d[j], d[j + 1], d[j + 2]);
          hues.set(key, (hues.get(key) || 0) + 1);
        }
      }
      let inkTotal = 0; for (const v of hues.values()) inkTotal += v;
      return { cov: this.regions.map((r, L) => (L && tot[L] ? cnt[L] / tot[L] : 0)), tot, hues, inkTotal, samples: (S * S) / 4 };
    }
    showHints(minArea, cov) {
      const hx = this.hx; hx.clearRect(0, 0, S, S);
      const img = hx.createImageData(S, S); const d = img.data;
      const want = new Uint8Array(this.regions.length); let any = 0;
      this.regions.forEach((r, L) => { if (L && !r.border && r.area >= minArea && cov[L] < 0.6) { want[L] = 1; any++; } });
      if (!any) return 0;
      for (let i = 0; i < S * S; i++) {
        if (!want[this.labels[i]]) continue;
        const x = i % S, y = (i / S) | 0;
        const stripe = ((x + y) >> 4) & 1;
        const j = i * 4; d[j] = 255; d[j + 1] = stripe ? 210 : 235; d[j + 2] = stripe ? 60 : 120; d[j + 3] = stripe ? 200 : 140;
      }
      hx.putImageData(img, 0, 0);
      this.cvHint.classList.remove('blink'); void this.cvHint.offsetWidth; this.cvHint.classList.add('blink');
      clearTimeout(this._hintT);
      this._hintT = setTimeout(() => { hx.clearRect(0, 0, S, S); this.cvHint.classList.remove('blink'); }, 3200);
      return any;
    }

    // ---------------- exportar ----------------
    composite(size = S) {
      const c = mk(size, size); const g = c.getContext('2d');
      g.fillStyle = '#fff'; g.fillRect(0, 0, size, size);
      g.drawImage(this.cvPaint, 0, 0, size, size);
      g.drawImage(this.cvLines, 0, 0, size, size);
      return c;
    }
    paintDataURL() { return this.cvPaint.toDataURL('image/png'); }
    thumbDataURL(size = 360) { return this.composite(size).toDataURL('image/jpeg', 0.86); }
    destroy() { this._ro.disconnect(); }
  }

  function hsl2rgb(h, s, l) {
    const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [f(0) * 255, f(8) * 255, f(4) * 255];
  }
  // agrupa cores parecidas (para contar "quantas cores diferentes" na nota)
  function colorBucket(r, g, b) {
    const [h, s, l] = ColorUtil.rgbToHsl(r, g, b);
    if (s < 0.15 || l < 0.12 || l > 0.93) return 'n' + Math.min(4, Math.floor(l * 5));
    return 'c' + Math.floor(((h + 15) % 360) / 30) + (l < 0.4 ? 'd' : l > 0.72 ? 'l' : 'm');
  }

  Painter.SIZE = S;
  window.Painter = Painter;
})();
