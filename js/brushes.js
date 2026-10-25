/* PintaKids — pincéis
   kind 'line' : o pintor chama seg() entre pontinhos próximos (traço contínuo)
   kind 'dab'  : o pintor chama dab() a cada `spacing * largura` (carimbo repetido)
   mode 'live' : vai direto ao papel (textura acumula ao passar de novo)
   mode 'layer': fica numa camada até soltar o dedo (tinta uniforme, sem manchas) */
(function () {
  const TAU = Math.PI * 2;
  const rand = Math.random;

  function hexToRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map((x) => x + x).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    let h = 0, s = 0; const l = (mx + mn) / 2;
    if (mx !== mn) {
      const d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    return [h, s, l];
  }
  function shade(hex, amt) { // amt -1..1 (escurece / clareia)
    const [r, g, b] = hexToRgb(hex);
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    return `rgb(${Math.round(r + (t - r) * p)},${Math.round(g + (t - g) * p)},${Math.round(b + (t - b) * p)})`;
  }

  // textura de giz de cera: grão fixo no papel, tingido por cor (cache)
  let grain = null;
  const grainCache = {};
  function grainCanvas() {
    if (grain) return grain;
    const n = 160;
    grain = document.createElement('canvas'); grain.width = grain.height = n;
    const g = grain.getContext('2d');
    const img = g.createImageData(n, n);
    // ruído com "fibras" horizontais leves, como papel de verdade
    for (let y = 0; y < n; y++) {
      const row = 0.85 + 0.15 * Math.sin(y * 1.7) * Math.sin(y * 0.31);
      for (let x = 0; x < n; x++) {
        const i = (y * n + x) * 4;
        const v = rand() * row;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
        img.data[i + 3] = v < 0.16 ? 0 : v < 0.32 ? 120 : 255;
      }
    }
    g.putImageData(img, 0, 0);
    return grain;
  }
  function crayonPattern(ctx, color) {
    if (!grainCache[color]) {
      const src = grainCanvas();
      const c = document.createElement('canvas'); c.width = c.height = src.width;
      const g = c.getContext('2d');
      g.fillStyle = color; g.fillRect(0, 0, c.width, c.height);
      g.globalCompositeOperation = 'destination-in';
      g.drawImage(src, 0, 0);
      grainCache[color] = c;
    }
    return ctx.createPattern(grainCache[color], 'repeat');
  }

  function starPath(ctx, x, y, R, rr, n, a0) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const rad = i % 2 ? rr : R, a = a0 + (i * Math.PI) / n;
      const px = x + rad * Math.cos(a), py = y + rad * Math.sin(a);
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
  }
  function heartPath(ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.7);
    ctx.bezierCurveTo(x - s * 1.0, y + s * 0.1, x - s * 1.3, y - s * 0.6, x - s * 0.7, y - s * 0.95);
    ctx.bezierCurveTo(x - s * 0.3, y - s * 1.15, x, y - s * 0.8, x, y - s * 0.55);
    ctx.bezierCurveTo(x, y - s * 0.8, x + s * 0.3, y - s * 1.15, x + s * 0.7, y - s * 0.95);
    ctx.bezierCurveTo(x + s * 1.3, y - s * 0.6, x + s * 1.0, y + s * 0.1, x, y + s * 0.7);
    ctx.closePath();
  }
  function line(ctx, a, b, w) {
    ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }

  const B = {
    lapis: {
      kind: 'dab', mode: 'live', spacing: 0.22, pressure: [0.35, 1.25],
      dab(ctx, x, y, w, st) {
        ctx.fillStyle = st.color;
        const n = Math.max(3, Math.round(w * 1.6));
        for (let i = 0; i < n; i++) {
          const a = rand() * TAU, rr = Math.sqrt(rand()) * w * 0.5;
          ctx.globalAlpha = 0.25 + rand() * 0.55;
          const d = 1.3 + rand() * 1.2;
          ctx.fillRect(x + Math.cos(a) * rr - d / 2, y + Math.sin(a) * rr - d / 2, d, d);
        }
        ctx.globalAlpha = 1;
      },
    },
    giz: {
      kind: 'line', mode: 'live', pressure: [0.45, 1.2],
      begin(ctx, st) { st.pat = crayonPattern(ctx, st.color); },
      seg(ctx, a, b, w, st) { ctx.strokeStyle = st.pat; line(ctx, a, b, w); },
    },
    canetinha: {
      kind: 'line', mode: 'layer', opacity: 0.93, pressure: [0.7, 1.1],
      seg(ctx, a, b, w, st) { ctx.strokeStyle = st.color; line(ctx, a, b, w); },
    },
    pincel: {
      kind: 'line', mode: 'live', pressure: [0.18, 1.45],
      seg(ctx, a, b, w, st) { ctx.strokeStyle = st.color; line(ctx, a, b, w); },
    },
    aquarela: {
      kind: 'line', mode: 'layer', opacity: 0.5, pressure: [0.4, 1.3], pad: 8,
      begin(ctx) { ctx.filter = 'blur(3px)'; },
      seg(ctx, a, b, w, st) {
        ctx.strokeStyle = st.color;
        line(ctx, a, b, w * (0.9 + rand() * 0.2));
      },
    },
    borracha: {
      kind: 'line', mode: 'live', erase: true, pressure: [0.6, 1.2],
      seg(ctx, a, b, w) { ctx.strokeStyle = '#000'; line(ctx, a, b, w); },
    },
    spray: {
      kind: 'dab', mode: 'live', spacing: 0.12, pressure: [0.5, 1.3], pad: 4,
      dab(ctx, x, y, w, st) {
        ctx.fillStyle = st.color;
        const n = Math.round(w * 0.55);
        for (let i = 0; i < n; i++) {
          const a = rand() * TAU, rr = rand() * rand() * w;
          ctx.globalAlpha = 0.5 + rand() * 0.5;
          ctx.beginPath(); ctx.arc(x + Math.cos(a) * rr, y + Math.sin(a) * rr, 0.8 + rand() * 1.4, 0, TAU); ctx.fill();
        }
        ctx.globalAlpha = 1;
      },
    },
    bolinhas: {
      kind: 'dab', mode: 'live', spacing: 1.7, pressure: [0.5, 1.3],
      dab(ctx, x, y, w, st) {
        ctx.fillStyle = st.color;
        ctx.beginPath(); ctx.arc(x, y, w / 2, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.55)';
        ctx.beginPath(); ctx.arc(x - w * 0.15, y - w * 0.15, w * 0.14, 0, TAU); ctx.fill();
      },
    },
    arcoiris: {
      kind: 'line', mode: 'live', pressure: [0.4, 1.3], ignoresColor: true,
      seg(ctx, a, b, w, st) { ctx.strokeStyle = `hsl(${(st.len * 0.55) % 360},92%,55%)`; line(ctx, a, b, w); },
    },
    estrelinhas: {
      kind: 'dab', mode: 'live', spacing: 1.5, pressure: [0.5, 1.3],
      dab(ctx, x, y, w, st) {
        ctx.fillStyle = shade(st.color, (rand() - 0.5) * 0.5);
        starPath(ctx, x, y, w * 0.6, w * 0.26, 5, rand() * TAU); ctx.fill();
      },
    },
    coracoes: {
      kind: 'dab', mode: 'live', spacing: 1.6, pressure: [0.5, 1.3],
      dab(ctx, x, y, w, st) {
        ctx.fillStyle = shade(st.color, (rand() - 0.3) * 0.4);
        heartPath(ctx, x, y, w * 0.55); ctx.fill();
      },
    },
    neon: {
      kind: 'line', mode: 'layer', opacity: 1, pressure: [0.6, 1.25], pad: 30,
      seg(ctx, a, b, w, st) {
        ctx.shadowColor = st.color; ctx.shadowBlur = w * 1.6;
        ctx.strokeStyle = st.color; line(ctx, a, b, w);
        ctx.shadowBlur = 0;
      },
      finish(ctx, pts) { // núcleo branco brilhante por cima do traço inteiro
        if (pts.length < 2) return;
        ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,.9)';
        for (let i = 1; i < pts.length; i++) line(ctx, pts[i - 1], pts[i], Math.max(1.5, pts[i].w * 0.32));
      },
    },
    glitter: {
      kind: 'dab', mode: 'live', spacing: 0.35, pressure: [0.5, 1.3], pad: 6,
      dab(ctx, x, y, w, st) {
        for (let i = 0; i < 4; i++) {
          const a = rand() * TAU, rr = Math.sqrt(rand()) * w * 0.5;
          const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
          const k = rand();
          ctx.fillStyle = k < 0.12 ? '#fff' : k < 0.3 ? '#FFE680' : shade(st.color, (rand() - 0.4) * 0.7);
          const d = 1.5 + rand() * 2.5;
          ctx.beginPath(); ctx.arc(px, py, d, 0, TAU); ctx.fill();
        }
        if (rand() < 0.08) { // brilho em cruz
          ctx.fillStyle = '#fff';
          const s = w * 0.35, px = x + (rand() - 0.5) * w, py = y + (rand() - 0.5) * w;
          starPath(ctx, px, py, s, s * 0.18, 4, 0); ctx.fill();
        }
      },
    },
    carimbos: {
      kind: 'dab', mode: 'live', spacing: 1.25, pressure: [0.85, 1.1], pad: 10,
      dab(ctx, x, y, w, st) {
        ctx.save();
        ctx.translate(x, y); ctx.rotate((rand() - 0.5) * 0.5);
        ctx.font = `${Math.round(w)}px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(st.sticker || '⭐', 0, 0);
        ctx.restore();
        st.stamps = (st.stamps || 0) + 1;
      },
    },
  };

  window.BRUSHES = B;
  window.ColorUtil = { hexToRgb, rgbToHsl, shade };
})();
