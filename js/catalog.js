/* PintaKids — catálogo: temas, ferramentas, cores, carimbos, níveis, medalhas */
(function () {
  const THEMES = [
    { id: 'animais', name: 'Animais', emoji: '🐶', color: '#FF8C42', color2: '#FFB26B' },
    { id: 'veiculos', name: 'Veículos', emoji: '🚗', color: '#3A86FF', color2: '#7CB3FF' },
    { id: 'formas', name: 'Formas', emoji: '🔷', color: '#2EC4B6', color2: '#7FE3D9' },
    { id: 'personagens', name: 'Personagens', emoji: '🧸', color: '#FF5C8A', color2: '#FF9AB8' },
    { id: 'herois', name: 'Super-Heróis', emoji: '🦸', color: '#E63946', color2: '#FF7A84' },
    { id: 'dinos', name: 'Dinossauros', emoji: '🦖', color: '#6A994E', color2: '#A7C957' },
    { id: 'datas', name: 'Datas Especiais', emoji: '🎉', color: '#8E5CF7', color2: '#B794FF' },
    { id: 'meus', name: 'Meus Desenhos', emoji: '📷', color: '#F4A300', color2: '#FFD166', custom: true },
  ];

  // custo (em pontos acumulados) para liberar cada desenho, pela posição no tema
  const SLOT_COST = [0, 0, 50, 130, 230, 350, 490, 650];
  const THEME_OFFSET = { animais: 0, veiculos: 10, formas: 5, personagens: 20, herois: 25, dinos: 15, datas: 30 };
  const perTheme = {};
  DRAWINGS.forEach((d) => {
    const i = (perTheme[d.theme] = (perTheme[d.theme] || 0) + 1) - 1;
    d.cost = SLOT_COST[i] === 0 ? 0 : SLOT_COST[Math.min(i, SLOT_COST.length - 1)] + (THEME_OFFSET[d.theme] || 0);
  });

  // ---------- ícones das ferramentas (a ponta usa a cor atual: currentColor) ----------
  const S = (inner) => `<svg viewBox="0 0 48 48" width="100%" height="100%">${inner}</svg>`;
  const ink = '#3b2f52';
  const ICONS = {
    lapis: S(`<path d="M10 38 L13 29 L33 9 L39 15 L19 35 Z" fill="#FFD166" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/><path d="M33 9 L36 6 Q38 4 40 6 L42 8 Q44 10 42 12 L39 15 Z" fill="#FF8FAB" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/><path d="M10 38 L13 29 L19 35 Z" fill="#F6D7B0" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/><path d="M10 38 L11.5 33.5 L14.5 36.5 Z" fill="currentColor"/>`),
    giz: S(`<rect x="15" y="10" width="18" height="30" rx="4" fill="currentColor" stroke="${ink}" stroke-width="2.5" transform="rotate(35 24 25)"/><rect x="15" y="20" width="18" height="12" fill="#fff" opacity=".85" transform="rotate(35 24 25)"/><path d="M14 8 Q24 2 34 8" fill="none" stroke="${ink}" stroke-width="2.5" transform="rotate(35 24 25)"/>`),
    canetinha: S(`<path d="M12 36 L30 10 Q33 6 37 9 L39 11 Q42 14 38 17 L16 40 Z" fill="#fff" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/><path d="M30 10 Q33 6 37 9 L39 11 Q42 14 38 17 L34 21 L26 14 Z" fill="currentColor" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/><path d="M12 36 L16 40 L8 42 Z" fill="currentColor" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>`),
    pincel: S(`<path d="M24 26 L38 6 Q41 3 43 6 Q44 8 42 10 L28 30 Z" fill="#B5835A" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/><rect x="21" y="25" width="9" height="7" fill="#C9CED6" stroke="${ink}" stroke-width="2.5" transform="rotate(35 25 28)"/><path d="M22 30 Q14 30 10 40 Q8 44 12 43 Q22 42 26 34 Z" fill="currentColor" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>`),
    aquarela: S(`<path d="M24 6 Q36 22 36 30 A12 12 0 0 1 12 30 Q12 22 24 6 Z" fill="currentColor" opacity=".55" stroke="${ink}" stroke-width="2.5"/><circle cx="19" cy="29" r="3" fill="#fff" opacity=".8"/><path d="M8 42 Q16 38 24 42 T40 42" fill="none" stroke="currentColor" stroke-width="3" opacity=".6"/>`),
    balde: S(`<path d="M12 18 L36 18 L32 42 L16 42 Z" fill="#E9ECF2" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/><path d="M12 18 Q24 26 36 18 L34 30 Q24 36 14 30 Z" fill="currentColor"/><path d="M14 18 Q24 4 34 18" fill="none" stroke="${ink}" stroke-width="2.5"/><path d="M36 20 Q44 24 40 32 Q38 36 40 38" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`),
    borracha: S(`<path d="M8 32 L26 12 L40 24 L22 42 L14 42 Z" fill="#FF8FAB" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/><path d="M8 32 L16 24 L30 36 L22 42 L14 42 Z" fill="#fff" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>`),
    carimbos: S(`<path d="M24 4 L28.5 15 L40 15.5 L31 22.5 L34 34 L24 27.5 L14 34 L17 22.5 L8 15.5 L19.5 15 Z" fill="#FFD166" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/><path d="M33 33 C28 30 28 25 32 25 C34 25 35 27 35 28 C35 27 36 25 38 25 C42 25 42 30 37 33 L35 35 Z" fill="#FF5C8A" stroke="${ink}" stroke-width="2"/><circle cx="12" cy="38" r="5" fill="#7FE3D9" stroke="${ink}" stroke-width="2"/>`),
    spray: S(`<rect x="12" y="18" width="16" height="26" rx="5" fill="currentColor" stroke="${ink}" stroke-width="2.5"/><rect x="15" y="10" width="10" height="8" rx="2" fill="#C9CED6" stroke="${ink}" stroke-width="2.5"/><g fill="currentColor"><circle cx="33" cy="10" r="2"/><circle cx="38" cy="14" r="1.6"/><circle cx="36" cy="7" r="1.4"/><circle cx="41" cy="9" r="1.3"/><circle cx="40" cy="18" r="1.2"/></g>`),
    bolinhas: S(`<g fill="currentColor" stroke="${ink}" stroke-width="2"><circle cx="12" cy="36" r="6"/><circle cx="24" cy="26" r="5"/><circle cx="34" cy="16" r="4"/></g><circle cx="40" cy="8" r="3" fill="currentColor"/>`),
    arcoiris: S(`<path d="M6 36 A18 18 0 0 1 42 36" fill="none" stroke="#FF595E" stroke-width="5"/><path d="M11 36 A13 13 0 0 1 37 36" fill="none" stroke="#FFCA3A" stroke-width="5"/><path d="M16 36 A8 8 0 0 1 32 36" fill="none" stroke="#8AC926" stroke-width="5"/><path d="M20.5 36 A3.5 3.5 0 0 1 27.5 36" fill="none" stroke="#1982C4" stroke-width="4"/>`),
    estrelinhas: S(`<path d="M18 8 L21 16 L29 16.5 L23 21.5 L25 29.5 L18 25 L11 29.5 L13 21.5 L7 16.5 L15 16 Z" fill="currentColor" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/><path d="M34 26 L36 31 L41 31.3 L37 34.5 L38.3 39.5 L34 36.7 L29.7 39.5 L31 34.5 L27 31.3 L32 31 Z" fill="currentColor" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/>`),
    neon: S(`<path d="M8 38 Q18 8 26 24 T42 10" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" opacity=".35"/><path d="M8 38 Q18 8 26 24 T42 10" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M8 38 Q18 8 26 24 T42 10" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`),
    glitter: S(`<path d="M24 4 L27 18 L40 21 L27 24 L24 38 L21 24 L8 21 L21 18 Z" fill="currentColor" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/><path d="M38 32 L39.5 37 L44 38.5 L39.5 40 L38 45 L36.5 40 L32 38.5 L36.5 37 Z" fill="#FFD166"/><circle cx="10" cy="38" r="2.5" fill="#FF8FAB"/><circle cx="40" cy="8" r="2" fill="#7FE3D9"/>`),
    coracoes: S(`<path d="M18 34 C6 26 4 16 11 13 C15 11 18 14 18 17 C18 14 21 11 25 13 C32 16 30 26 18 34 Z" fill="currentColor" stroke="${ink}" stroke-width="2"/><path d="M34 22 C27 17 26 11 30 9.5 C32.5 8.5 34 10 34 12 C34 10 35.5 8.5 38 9.5 C42 11 41 17 34 22 Z" fill="currentColor" stroke="${ink}" stroke-width="2"/>`),
  };

  // modo 'live' = vai direto ao papel a cada pedacinho (textura acumula)
  // modo 'layer' = fica numa camada própria e entra no papel ao soltar (tinta uniforme)
  const TOOLS = [
    { id: 'lapis', name: 'Lápis', cost: 0, sizes: [3, 5, 8, 12] },
    { id: 'giz', name: 'Giz de cera', cost: 0, sizes: [10, 16, 24, 34] },
    { id: 'canetinha', name: 'Canetinha', cost: 0, sizes: [8, 14, 22, 32] },
    { id: 'pincel', name: 'Pincel', cost: 0, sizes: [10, 20, 34, 52] },
    { id: 'balde', name: 'Balde de tinta', cost: 0, sizes: null },
    { id: 'borracha', name: 'Borracha', cost: 0, sizes: [14, 26, 42, 64] },
    { id: 'carimbos', name: 'Carimbos', cost: 0, sizes: [40, 60, 84, 110] },
    { id: 'spray', name: 'Spray', cost: 50, sizes: [20, 34, 50, 70] },
    { id: 'aquarela', name: 'Aquarela', cost: 120, sizes: [18, 30, 46, 66] },
    { id: 'bolinhas', name: 'Bolinhas', cost: 180, sizes: [10, 16, 24, 34] },
    { id: 'arcoiris', name: 'Arco-íris', cost: 250, sizes: [10, 18, 28, 40] },
    { id: 'estrelinhas', name: 'Estrelinhas', cost: 330, sizes: [12, 20, 30, 42] },
    { id: 'neon', name: 'Neon', cost: 420, sizes: [6, 10, 16, 24] },
    { id: 'glitter', name: 'Glitter', cost: 520, sizes: [16, 26, 38, 54] },
    { id: 'coracoes', name: 'Coraçõezinhos', cost: 640, sizes: [12, 20, 30, 42] },
  ];
  TOOLS.forEach((t) => (t.icon = ICONS[t.id]));

  const FILLS = [
    { id: 'solido', name: 'Cor lisa', cost: 0 },
    { id: 'degrade', name: 'Degradê', cost: 200 },
    { id: 'arcoiris', name: 'Arco-íris', cost: 450 },
    { id: 'brilho', name: 'Brilhante', cost: 700 },
  ];

  const P = (name, cost, list) => ({ id: name.toLowerCase().normalize('NFD').replace(/[^a-z]/g, ''), name, cost, colors: list.map(([n, h]) => ({ name: n, hex: h })) });
  const COLOR_PACKS = [
    P('Básicas', 0, [['Vermelho', '#E53935'], ['Laranja', '#FB8C00'], ['Amarelo', '#FDD835'], ['Verde-limão', '#9CCC65'], ['Verde', '#43A047'], ['Verde-escuro', '#1B5E20'], ['Azul-claro', '#4FC3F7'], ['Azul', '#1E88E5'], ['Azul-marinho', '#283593'], ['Roxo', '#8E24AA'], ['Lilás', '#BA68C8'], ['Rosa', '#F06292'], ['Marrom', '#795548'], ['Cinza', '#9E9E9E'], ['Preto', '#212121'], ['Branco', '#FFFFFF']]),
    P('Tons de pele', 0, [['Pele clarinha', '#FDE3CE'], ['Pele clara', '#F5CBA7'], ['Pele pêssego', '#E8B48A'], ['Pele morena clara', '#D49A6A'], ['Pele morena', '#B07A4E'], ['Pele canela', '#8D5A3B'], ['Pele escura', '#6B4029'], ['Pele bem escura', '#4A2C1C']]),
    P('Pastéis', 80, [['Rosa bebê', '#F8BBD0'], ['Pêssego', '#FFCCBC'], ['Baunilha', '#FFF59D'], ['Menta', '#B2DFDB'], ['Pistache', '#DCEDC8'], ['Céu', '#B3E5FC'], ['Lavanda', '#D1C4E9'], ['Algodão-doce', '#F3C4FB'], ['Creme', '#FFF3E0'], ['Azul bebê', '#C5CAE9'], ['Coral claro', '#FFAB91'], ['Lilás claro', '#E1BEE7']]),
    P('Natureza', 150, [['Folha', '#7CB342'], ['Musgo', '#558B2F'], ['Floresta', '#2E7D32'], ['Oceano', '#00838F'], ['Água', '#26C6DA'], ['Areia', '#E6C99A'], ['Terra', '#8D6E63'], ['Tronco', '#5D4037'], ['Pedra', '#78909C'], ['Pôr do sol', '#FF7043'], ['Girassol', '#FFC107'], ['Céu da noite', '#1A237E']]),
    P('Neon', 280, [['Rosa neon', '#FF2D95'], ['Verde neon', '#39FF14'], ['Amarelo neon', '#F7FF00'], ['Laranja neon', '#FF6A00'], ['Azul neon', '#00E5FF'], ['Roxo neon', '#B026FF'], ['Vermelho neon', '#FF1744'], ['Turquesa neon', '#1DE9B6'], ['Pink choque', '#F50057'], ['Limão neon', '#C6FF00']]),
    P('Doces', 360, [['Morango', '#FF4F6D'], ['Chiclete', '#FF8AD8'], ['Uva', '#7B3FA0'], ['Caramelo', '#C68642'], ['Chocolate', '#5C3317'], ['Hortelã', '#3EB489'], ['Mirtilo', '#4F5BD5'], ['Laranjinha', '#FFA94D'], ['Cereja', '#B3001B'], ['Leite', '#FFF8E7']]),
    P('Metálicas', 480, [['Ouro', '#D4AF37'], ['Prata', '#B8BEC6'], ['Bronze', '#B0703C'], ['Ouro rosé', '#E8A0A0'], ['Cobre', '#B87333'], ['Azul metálico', '#4A7BB7']]),
  ];
  const METALLIC = new Set(['#D4AF37', '#B8BEC6', '#B0703C', '#E8A0A0', '#B87333', '#4A7BB7']);
  const FREE_COLOR_COST = 600; // seletor de cor livre

  const STICKER_PACKS = [
    { id: 'basicos', name: 'Básicos', cost: 0, items: ['⭐', '❤️', '🌸', '☀️', '🌈', '🎈', '🌟', '🍀'] },
    { id: 'bichos', name: 'Bichinhos', cost: 140, items: ['🐶', '🐱', '🦋', '🐞', '🐠', '🦄', '🐢', '🐥'] },
    { id: 'natureza', name: 'Natureza', cost: 300, items: ['🌻', '🍓', '🍎', '🌙', '❄️', '🌵', '🍄', '🌴'] },
    { id: 'festa', name: 'Festa', cost: 460, items: ['🎁', '🎉', '👑', '🚀', '⚽', '🦖', '🍭', '🎂'] },
  ];

  const LEVELS = [0, 40, 100, 180, 280, 400, 550, 720, 920, 1150, 1400, 1700, 2100, 2600, 3200, 4000];
  const LEVEL_NAMES = ['Rabisquinho', 'Pintor Mirim', 'Colorista', 'Artista Júnior', 'Mestre das Cores', 'Artista Estrela', 'Pintor Mágico', 'Super Artista', 'Gênio das Cores', 'Lenda da Pintura'];
  const levelOf = (pts) => {
    let lv = 0;
    for (let i = 0; i < LEVELS.length; i++) if (pts >= LEVELS[i]) lv = i;
    const next = LEVELS[lv + 1];
    return {
      level: lv + 1,
      name: LEVEL_NAMES[Math.min(lv, LEVEL_NAMES.length - 1)],
      from: LEVELS[lv],
      to: next == null ? LEVELS[lv] + 1000 : next,
    };
  };

  // medalhas: check recebe o perfil
  const ACHIEVEMENTS = [
    { id: 'primeira', name: 'Primeira Obra', desc: 'Salvar a primeira pintura', emoji: '🎨', check: (p) => p.stats.saves >= 1 },
    { id: 'cinco', name: 'Cinco Obras', desc: 'Salvar 5 pinturas', emoji: '🖼️', check: (p) => p.stats.saves >= 5 },
    { id: 'quinze', name: 'Galeria Cheia', desc: 'Salvar 15 pinturas', emoji: '🏛️', check: (p) => p.stats.saves >= 15 },
    { id: 'perfeito', name: 'Cinco Estrelas', desc: 'Ganhar 5 estrelas numa pintura', emoji: '🌟', check: (p) => p.stats.fiveStars >= 1 },
    { id: 'perfeito3', name: 'Caprichoso', desc: 'Ganhar 5 estrelas em 3 pinturas', emoji: '🏆', check: (p) => p.stats.fiveStars >= 3 },
    { id: 'cores10', name: 'Arco-íris Vivo', desc: 'Usar 10 cores diferentes', emoji: '🌈', check: (p) => p.stats.colors.length >= 10 },
    { id: 'cores30', name: 'Caixa de 30 Cores', desc: 'Usar 30 cores diferentes', emoji: '🖍️', check: (p) => p.stats.colors.length >= 30 },
    { id: 'lapis5', name: 'Experimentador', desc: 'Usar 5 lápis diferentes', emoji: '✏️', check: (p) => p.stats.tools.length >= 5 },
    { id: 'carimbos20', name: 'Carimbador', desc: 'Colocar 20 carimbos', emoji: '💮', check: (p) => p.stats.stickers >= 20 },
    { id: 'livre', name: 'Criativo', desc: 'Salvar um desenho livre', emoji: '💡', check: (p) => p.stats.freeSaves >= 1 },
    { id: 'temas', name: 'Explorador', desc: 'Pintar desenhos de 4 temas', emoji: '🧭', check: (p) => p.stats.themes.length >= 4 },
    { id: 'todos', name: 'Volta ao Mundo', desc: 'Pintar desenhos de todos os 7 temas', emoji: '🌍', check: (p) => p.stats.themes.length >= 7 },
    { id: 'nivel5', name: 'Nível 5', desc: 'Chegar ao nível 5', emoji: '🚀', check: (p) => levelOf(p.totalEarned).level >= 5 },
    { id: 'nivel10', name: 'Nível 10', desc: 'Chegar ao nível 10', emoji: '👑', check: (p) => levelOf(p.totalEarned).level >= 10 },
  ];
  const ACHIEVEMENT_BONUS = 10;

  window.CATALOG = { THEMES, TOOLS, FILLS, COLOR_PACKS, METALLIC, FREE_COLOR_COST, STICKER_PACKS, LEVELS, levelOf, ACHIEVEMENTS, ACHIEVEMENT_BONUS, ICONS };
})();
