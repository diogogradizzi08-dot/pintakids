/* PintaKids — avaliação da pintura
   O que conta (e é explicado para a criança no fim):
   - COBRIU o desenho?  quanto de cada parte foi pintada (partes pequenas valem
     tanto quanto as grandes, senão pintar só o fundo "resolveria")
   - CAPRICHO: quantas partes ficaram bem preenchidas, sem buraquinho branco
   - CORES: quantas cores diferentes foram usadas
   - BÔNUS: pintar o fundo (céu, chão) */
(function () {
  const MIN_AREA = 900; // em pixels da tela de 1200 (≈ 10x10 px num tablet)

  function evaluate(painter) {
    const { cov, hues, inkTotal, samples } = painter.coverage();
    const regs = painter.regions;

    // desenho livre (sem linhas): avalia quanto do papel foi usado e as cores
    if (!painter.hasLines || regs.length <= 2) {
      const ink = inkTotal / samples;
      const colors = countColors(hues, inkTotal);
      const use = Math.min(1, ink / 0.3);
      const score = Math.round(100 * (0.6 * use + 0.4 * Math.min(1, colors / 5)));
      return finish({ score, coverage: use, neat: use, colors, background: false, free: true, missing: 0 });
    }

    const inner = [], bg = [];
    regs.forEach((r, L) => {
      if (!L || r.area < MIN_AREA) return;
      (r.border ? bg : inner).push(L);
    });
    let wSum = 0, wCov = 0, cSum = 0, full = 0, missing = 0;
    inner.forEach((L) => {
      const c = Math.min(1, cov[L] / 0.9);
      const a = regs[L].area;
      wSum += a; wCov += a * c; cSum += c;
      if (cov[L] >= 0.92) full++;
      if (cov[L] < 0.5) missing++;
    });
    const coverage = inner.length ? 0.5 * (wCov / wSum) + 0.5 * (cSum / inner.length) : 0;
    const neat = inner.length ? full / inner.length : 0;
    let bgA = 0, bgC = 0;
    bg.forEach((L) => { bgA += regs[L].area; bgC += regs[L].area * cov[L]; });
    const background = bgA > 0 && bgC / bgA > 0.6;
    const colors = countColors(hues, inkTotal);

    let score = 100 * (0.5 * coverage + 0.2 * neat + 0.3 * Math.min(1, colors / 4));
    if (background) score += 8;
    return finish({ score: Math.round(Math.min(100, score)), coverage, neat, colors, background, free: false, missing, total: inner.length });
  }

  function countColors(hues, total) {
    let n = 0;
    for (const v of hues.values()) if (v / Math.max(1, total) > 0.006) n++;
    return n;
  }

  function finish(r) {
    r.stars = r.score >= 90 ? 5 : r.score >= 75 ? 4 : r.score >= 55 ? 3 : r.score >= 30 ? 2 : 1;
    r.grade = (r.score / 10).toFixed(1).replace('.', ',');
    r.points = [0, 8, 15, 25, 35, 50][r.stars] + (r.background ? 5 : 0) + (r.colors >= 6 ? 5 : 0) + (r.stars === 5 && r.neat >= 0.95 ? 5 : 0);
    r.title = ['', 'Bom começo!', 'Muito bem!', 'Que lindo!', 'Incrível!', 'OBRA-PRIMA!'][r.stars];
    const tips = [];
    if (!r.free) {
      if (r.missing > 0) tips.push({ ok: false, text: r.missing === 1 ? 'Faltou pintar 1 pedacinho' : `Faltou pintar ${r.missing} pedacinhos` });
      else tips.push({ ok: true, text: 'Pintou todas as partes!' });
      if (r.neat >= 0.9) tips.push({ ok: true, text: 'Super caprichado, sem buraquinhos!' });
      else if (r.neat < 0.6) tips.push({ ok: false, text: 'Dá pra caprichar mais nos cantinhos' });
      tips.push(r.background ? { ok: true, text: 'Pintou o fundo! +5' } : { ok: false, text: 'Pinte o fundo para ganhar bônus' });
    } else {
      tips.push(r.coverage > 0.8 ? { ok: true, text: 'Usou bem o papel todo!' } : { ok: false, text: 'Use mais espaço do papel' });
    }
    tips.push(r.colors >= 4 ? { ok: true, text: `Usou ${r.colors} cores! ${r.colors >= 6 ? '+5' : ''}` } : { ok: false, text: `Usou ${r.colors} ${r.colors === 1 ? 'cor' : 'cores'} — tente mais!` });
    r.tips = tips;
    return r;
  }

  window.Score = { evaluate, MIN_AREA };
})();
