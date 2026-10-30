// ══════════════════════════════════════════════════════════════════════
// prints-loja.mjs — screenshots 1920x1080 pra pagina da Steam, tiradas
// do DEV SERVER (npm run dev em :3000) com Chromium headless (Playwright).
// Navega o jogo por texto (COMECAR -> PADRAO -> ...), forca ondas com os
// atalhos de dev (?onda=N, ?muralha=1) e salva em release-demo/prints/.
//
// Uso:  npm run dev   (em outro terminal)
//       node scripts/prints-loja.mjs           (todos os prints, pt-BR)
//       node scripts/prints-loja.mjs roster    (so o elenco completo em ingles, Ming selecionado)
// Dependencias: playwright (devDependency) + `npx playwright install chromium`.
// ══════════════════════════════════════════════════════════════════════
import { chromium } from 'playwright';
import fs from 'node:fs';

const URL = 'http://localhost:3000';
const OUT = 'release-demo/prints';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, locale: 'pt-BR' });
const page = await ctx.newPage();
const dorme = (ms) => page.waitForTimeout(ms);
// antes de cada print: some com a barra de botoes de dev (so existe em localhost)
// e com os toasts passageiros (.hud-fixo) — nada disso e "o jogo"
const limpar = () => page.evaluate(() => {
  const dev = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === '+5W');
  if (dev) dev.parentElement.style.display = 'none';
  document.querySelectorAll('.hud-fixo').forEach(e => { if (!e.textContent.includes('CONCLU')) e.style.display = 'none'; });
});
const shot = async (nome) => { await limpar(); await page.screenshot({ path: `${OUT}/${nome}.png` }); console.log('print:', nome); };

// clica no primeiro elemento cujo texto (aparado, maiusculo) bate exatamente
const clickText = async (txt, timeout = 8000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const ok = await page.evaluate((txt) => {
      const el = [...document.querySelectorAll('button,div,span,h1,h2,h3')]
        .find(e => e.children.length < 4 && e.textContent.trim().toUpperCase() === txt);
      if (el) { el.click(); return true; } return false;
    }, txt);
    if (ok) return true;
    await dorme(250);
  }
  throw new Error('nao achei: ' + txt);
};
const clickContains = async (txt, timeout = 8000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const ok = await page.evaluate((txt) => {
      const el = [...document.querySelectorAll('button')].find(e => e.textContent.toUpperCase().includes(txt));
      if (el) { el.click(); return true; } return false;
    }, txt);
    if (ok) return true;
    await dorme(250);
  }
  return false;
};
// o botao de velocidade e um so, com title "<atual>x Speed"; cada clique avanca 1 -> 2 -> 5 -> 1
const velocidade = async (v) => {
  for (let i = 0; i < 3; i++) {
    const atual = await page.evaluate(() => { const b = document.querySelector('button[title$="x Speed"]'); return b ? parseInt(b.title) : null; });
    if (atual === null || atual === v) return;
    await page.click('button[title$="x Speed"]'); await dorme(150);
  }
};

// estado inicial: pt-BR, tudo destravado, tutoriais feitos, texto Normal
await page.goto(URL);
await page.evaluate(() => {
  localStorage.setItem('grimhold.lang', 'pt-BR');
  ['act2', 'act3', 'act4', 'act5'].forEach(a => localStorage.setItem('grimhold_' + a + '_unlocked', '1'));
  localStorage.setItem('grimhold_charselect_tutorial_v2', 'true');
  localStorage.setItem('grimhold_tutorial_done', 'true');
  localStorage.setItem('grimhold_ui_zoom', '1.15');
  localStorage.setItem('grimhold_infernal_unlocked', 'true');
});

// destrava herois no perfil salvo (o roster so deixa clicar nos destravados)
const destravarHerois = async (...tipos) => {
  await page.evaluate((tipos) => {
    const k = 'grimhold_profile'; const p = JSON.parse(localStorage.getItem(k) || '{}');
    p.unlockedCharacters = [...new Set([...(p.unlockedCharacters || ['mage', 'archer', 'paladin']), ...tipos])];
    localStorage.setItem(k, JSON.stringify(p));
  }, tipos);
};

const entrarNaRun = async (ato, query, heroi = null) => {
  await page.goto(URL + '/' + query);
  await dorme(2500);
  await clickText('COMEÇAR');
  await dorme(600);
  await clickText('PADRÃO');
  await dorme(400);
  await clickText('ESCOLHA SUA DIFICULDADE');
  await dorme(500);
  await clickText('NORMAL');
  await dorme(1200);
  if (heroi) { await clickText(heroi.toUpperCase()); await dorme(900); }
  await clickText('JOGAR');
  await dorme(1200);
  await clickText(ato);
  await dorme(3500);
};

// ── modo "roster": elenco inteiro destravado, jogo em INGLES, Ming selecionado ──
if (process.argv[2] === 'roster') {
  const TODOS = ['mage', 'archer', 'warlock', 'druid', 'necromancer', 'cleric', 'paladin', 'priest', 'bard', 'runesmith', 'sylvanite',
    'dreadlord', 'jester', 'vex', 'zylvara', 'morrigan', 'ixara', 'berserker', 'frost_warden', 'inquisitor'];   // sem o Malachar redimido (segredo)
  await destravarHerois(...TODOS);
  // texto "Pequeno" (zoom 1) pra caber os 20 herois E o lore inteiro sem cortar
  await page.evaluate(() => { localStorage.setItem('grimhold.lang', 'en'); localStorage.setItem('grimhold_ui_zoom', '1'); });
  await page.goto(URL); await dorme(3000);
  if (await page.$('input[maxlength="20"]')) { await page.fill('input[maxlength="20"]', 'Guardian'); await page.keyboard.press('Enter'); await dorme(800); }
  await clickText('START'); await dorme(500); await clickText('STANDARD'); await dorme(400);
  await clickText('CHOOSE YOUR DIFFICULTY'); await dorme(500); await clickText('NORMAL'); await dorme(1500);
  await clickText('MING'); await dorme(1000);
  // so no print: o roster do jogo e 3 colunas com rolagem (12 visiveis); pra
  // caber os 21 de uma vez, alarga o painel da esquerda pra 7 colunas
  await page.evaluate(() => {
    const grid = document.querySelector('.cs-card').parentElement;
    grid.style.gridTemplateColumns = 'repeat(7, minmax(0, 1fr))';
    const painel = grid.parentElement.parentElement;
    painel.style.width = '950px'; painel.style.maxWidth = '950px';
  });
  await dorme(600);
  await shot('18-roster-en-ming');
  await browser.close(); process.exit(0);
}

// 0. primeira tela de um jogador novo: escolher o nome (e o print 00), depois confirma
await page.goto(URL); await dorme(3000);
if (await page.$('input[maxlength="20"]')) {
  await shot('00-boas-vindas');
  await page.fill('input[maxlength="20"]', 'Guardiao');
  await page.keyboard.press('Enter'); await dorme(800);
}

// 1. menu principal
await page.goto(URL); await dorme(3000); await shot('01-menu');

// 2. selecao de heroi (aba Pericias)
await page.goto(URL); await dorme(2500);
await clickText('COMEÇAR'); await dorme(500); await clickText('PADRÃO'); await dorme(400);
await clickText('ESCOLHA SUA DIFICULDADE'); await dorme(500); await clickText('NORMAL'); await dorme(1500);
await shot('02-heroi');
await clickText('PERÍCIAS').catch(() => {}); await dorme(800); await shot('02b-heroi-pericias');

// 3. bestiario e grimorio (pelo menu)
await page.goto(URL); await dorme(2500);
await clickText('BESTIÁRIO'); await dorme(1500); await shot('03-bestiario');
await page.goto(URL); await dorme(2500);
await clickText('GRIMÓRIO'); await dorme(1500); await shot('03b-grimorio');

// 4. ondas com horda: Ato I (chefe Rei Orc na 10), II, IV, V, III
for (const [ato, onda, nome] of [['ATO I', 20, '04-ato1-horda'], ['ATO II', 26, '05-ato2-floresta'], ['ATO IV', 18, '06-ato4-abismo'], ['ATO V', 22, '07-ato5-magma'], ['ATO III', 24, '08-ato3-montanha']]) {
  await entrarNaRun(ato, `?onda=${onda}&muralha=1`);
  await velocidade(2);
  // 12 s de onda; se um level-up aparecer no meio, escolhe a primeira carta e segue
  for (let i = 0; i < 8; i++) {
    await dorme(1000);
    await page.evaluate(() => { const c = [...document.querySelectorAll('div,span')].find(e => e.textContent.trim().toUpperCase() === 'ESCOLHER'); c && c.click(); });
  }
  await velocidade(1);
  await dorme(400);
  await shot(nome);
}

// 5. level-up com 3 cartas: onda alta com muralha imortal; espera a tela aparecer
await entrarNaRun('ATO I', '?onda=6&muralha=1');
await velocidade(5);
let achou = false;
for (let i = 0; i < 90 && !achou; i++) {
  await dorme(1000);
  achou = await page.evaluate(() => /Alcançado/i.test(document.body.innerText));
}
if (achou) { await dorme(800); await shot('09-levelup'); }
else console.log('level-up nao apareceu a tempo');

// 6. loja do mercador: comeca na 4 e espera o botao do mercador aparecer
await entrarNaRun('ATO I', '?onda=4&muralha=1');
await velocidade(5);
let loja = false;
for (let i = 0; i < 120 && !loja; i++) {
  await dorme(1000);
  // fecha level-up se aparecer (escolhe a primeira carta)
  await page.evaluate(() => { const c = [...document.querySelectorAll('div,span')].find(e => e.textContent.trim().toUpperCase() === 'ESCOLHER'); c && c.click(); });
  loja = await clickContains('FERREIR', 300) || await clickContains('CURAND', 300) || await clickContains('MAGO ', 300) || await clickContains('LIQUIDA', 300);
}
if (loja) { await dorme(1200); await shot('10-loja'); } else console.log('mercador nao apareceu');

// 8. herois favoritos: Ming (Bobo) e Morrigan (Bruxa) — selecao + onda
await destravarHerois('jester', 'morrigan');
await page.goto(URL); await dorme(2500);
await clickText('COMEÇAR'); await dorme(500); await clickText('PADRÃO'); await dorme(400);
await clickText('ESCOLHA SUA DIFICULDADE'); await dorme(500); await clickText('NORMAL'); await dorme(1500);
await clickText('MING'); await dorme(900); await shot('12-ming-heroi');
await clickText('MORRIGAN'); await dorme(900); await shot('13-morrigan-heroi');
for (const [heroi, ato, onda, nome] of [['Ming', 'ATO I', 20, '14-ming-ato1'], ['Morrigan', 'ATO II', 26, '15-morrigan-ato2'], ['Morrigan', 'ATO IV', 18, '16-morrigan-abismo'], ['Ming', 'ATO V', 22, '17-ming-magma']]) {
  await entrarNaRun(ato, `?onda=${onda}&muralha=1`, heroi);
  await velocidade(2);
  for (let i = 0; i < 8; i++) {
    await dorme(1000);
    await page.evaluate(() => { const c = [...document.querySelectorAll('div,span')].find(e => e.textContent.trim().toUpperCase() === 'ESCOLHER'); c && c.click(); });
  }
  await velocidade(1); await dorme(400); await shot(nome);
}

// 7. vitoria (botao dev WIN STANDARD, so em localhost)
await entrarNaRun('ATO I', '?onda=30&muralha=1');
await clickContains('WIN STANDARD', 3000); await dorme(2500); await shot('11-vitoria');

await browser.close();
console.log('ok ->', OUT);
