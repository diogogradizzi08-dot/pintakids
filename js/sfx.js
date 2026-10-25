/* PintaKids — sons sintetizados (sem arquivos) e voz para o nome das cores */
(function () {
  let ctx = null;
  const on = () => !window.Store || Store.profile.settings.sound;
  function ac() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type = 'sine', vol = 0.18, delay = 0, slide = 0) {
    if (!on()) return;
    const a = ac(); if (!a) return;
    const t = a.currentTime + delay;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol = 0.1, freq = 2000, delay = 0) {
    if (!on()) return;
    const a = ac(); if (!a) return;
    const t = a.currentTime + delay;
    const len = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = a.createBufferSource(); s.buffer = buf;
    const flt = a.createBiquadFilter(); flt.type = 'bandpass'; flt.frequency.value = freq; flt.Q.value = 0.8;
    const g = a.createGain(); g.gain.value = vol;
    s.connect(flt).connect(g).connect(a.destination);
    s.start(t);
  }

  const SFX = {
    tap() { tone(660, 0.08, 'triangle', 0.12); },
    select() { tone(523, 0.07, 'triangle', 0.13); tone(784, 0.09, 'triangle', 0.12, 0.05); },
    pop() { tone(380, 0.12, 'sine', 0.2, 0, 2.2); },
    splash() { noise(0.35, 0.18, 900); tone(300, 0.25, 'sine', 0.12, 0, 0.5); },
    stamp() { tone(220, 0.1, 'square', 0.06); tone(880, 0.1, 'sine', 0.12, 0.03); },
    undo() { tone(500, 0.1, 'triangle', 0.1, 0, 0.6); },
    erase() { noise(0.15, 0.08, 3000); },
    error() { tone(200, 0.18, 'sawtooth', 0.06); tone(150, 0.2, 'sawtooth', 0.06, 0.12); },
    star(i = 0) { const n = [523, 659, 784, 988, 1175][i] || 1175; tone(n, 0.28, 'triangle', 0.16); tone(n * 2, 0.2, 'sine', 0.06, 0.04); },
    fanfare() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'triangle', 0.14, i * 0.11)); tone(1047, 0.6, 'triangle', 0.14, 0.48); tone(1319, 0.6, 'sine', 0.08, 0.48); },
    unlock() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.18, 'sine', 0.13, i * 0.07)); noise(0.4, 0.05, 6000, 0.1); },
    magic() { [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.12, 'sine', 0.08, i * 0.05)); },
    coin() { tone(988, 0.08, 'square', 0.06); tone(1319, 0.16, 'square', 0.06, 0.07); },
    whoosh() { noise(0.25, 0.08, 1200); },
  };

  // voz: fala o nome da cor (ajuda a criança a aprender as cores)
  let voice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices();
    voice = vs.find((v) => /pt[-_]BR/i.test(v.lang)) || vs.find((v) => /^pt/i.test(v.lang)) || null;
  }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  SFX.say = function (text) {
    if (!window.Store || !Store.profile.settings.speak || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'pt-BR'; if (voice) u.voice = voice;
      u.rate = 1.05; u.pitch = 1.25;
      speechSynthesis.speak(u);
    } catch (e) {}
  };
  // o primeiro toque destrava o áudio (regra dos navegadores)
  window.addEventListener('pointerdown', () => ac(), { once: true });
  window.SFX = SFX;
})();
