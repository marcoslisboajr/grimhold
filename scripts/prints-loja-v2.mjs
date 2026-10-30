// ══════════════════════════════════════════════════════════════════════
// prints-loja-v2.mjs — leva de screenshots 1920x1080 pra Steam (25/09):
// time cheio (invoca com ?ouro=), chefe em destaque, meteoro em pixel art,
// pagina de Herois, encontro entre ondas e level-up. Mesmo esquema do
// prints-loja.mjs (dev server em :3000), saida em release-demo/prints-v16-en/ (jogo em ingles).
// A muralha imortal (?muralha=1) fica ligada, mas o numero some do print.
// Uso:  node scripts/prints-loja-v2.mjs [so=<prefixo do nome>]
// ══════════════════════════════════════════════════════════════════════
import { chromium } from 'playwright';
import fs from 'node:fs';

const URL = 'http://localhost:3000';
const OUT = 'release-demo/prints-v16-en';
fs.mkdirSync(OUT, { recursive: true });
const SO = (process.argv.find(a => a.startsWith('so=')) || '').slice(3);
const quer = (n) => !SO || n.startsWith(SO);

const browser = await chromium.launch({ args: ['--mute-audio'] });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, locale: 'en-US' });
const page = await ctx.newPage();
const erros = []; page.on('pageerror', e => erros.push(e.message));
const dorme = (ms) => page.waitForTimeout(ms);

// antes de cada print: some a barra de dev, os toasts e o numero da muralha imortal
const limpar = () => page.evaluate(() => {
  const dev = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === '+5W');
  if (dev) dev.parentElement.style.display = 'none';
  document.querySelectorAll('.hud-fixo').forEach(e => { if (!/CONCLU|COMPLET/.test(e.textContent)) e.style.display = 'none'; });
  [...document.querySelectorAll('span,div')]
    .filter(e => e.children.length === 0 && /^\d{6} \/ 999999$/.test(e.textContent.trim()))
    .forEach(e => { e.style.visibility = 'hidden'; });
});
const shot = async (nome) => { await limpar(); await page.screenshot({ path: `${OUT}/${nome}.png` }); console.log('print:', nome); };

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
const velocidade = async (v) => {
  for (let i = 0; i < 3; i++) {
    const a = await page.evaluate(() => { const b = document.querySelector('button[title$="x Speed"]'); return b ? parseInt(b.title) : null; });
    if (a === null || a === v) return;
    await page.click('button[title$="x Speed"]'); await dorme(150);
  }
};
const escolherCarta = () => page.evaluate(() => { const c = document.querySelector('.upg-card'); if (c) { c.click(); return true; } return false; });
const pular = () => page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^(PULAR|SKIP)/.test(x.innerText.trim())); if (b) { b.click(); return true; } return false; });
const invocar = () => page.evaluate(() => { const b = document.querySelector('button[title^="Summon"]'); if (b && !b.disabled) { b.click(); return true; } return false; });
const fecharEncontro = () => page.evaluate(() => { const o = [...document.querySelectorAll('[data-testid="encontro-opcao"]')].filter(b => !b.disabled); if (o.length) o[o.length - 1].click(); });

// estado inicial: jogo em ingles (posts e loja sao pra publico internacional), atos destravados, tutoriais feitos, texto Normal
await page.goto(URL);
await page.evaluate(() => {
  localStorage.setItem('grimhold.lang', 'en');
  ['act2', 'act3', 'act4', 'act5'].forEach(a => localStorage.setItem('grimhold_' + a + '_unlocked', '1'));
  localStorage.setItem('grimhold_charselect_tutorial_v2', 'true');
  localStorage.setItem('grimhold_tutorial_done', 'true');
  localStorage.setItem('grimhold_ui_zoom', '1.15');
});
await page.reload(); await dorme(2500);
if (await page.$('input[maxlength="20"]')) { await page.fill('input[maxlength="20"]', 'Guardiao'); await page.keyboard.press('Enter'); await dorme(800); }

const entrar = async (ato, query) => {
  await page.goto(URL + '/' + query); await dorme(2500);
  await clickText('START'); await dorme(600);
  await clickText('STANDARD'); await dorme(400);
  await clickText('CHOOSE YOUR DIFFICULTY'); await dorme(500);
  await clickText('NORMAL'); await dorme(1200);
  await clickText('PLAY'); await dorme(1200);
  await clickText(ato); await dorme(3000);
  for (let i = 0; i < 5; i++) { if (!(await pular())) break; await dorme(300); }
};
// time cheio: invoca ate lotar, fechando level-up/encontros no caminho
const montarTime = async (seg) => {
  await velocidade(2);
  for (let i = 0; i < seg * 2; i++) { await invocar(); await escolherCarta(); await pular(); await fecharEncontro(); await dorme(500); }
};

// espalha o time pela grade arrastando com o mouse de verdade (celula 87.5 x 112.5 no canvas de 900 de altura)
const FORMACAO = [[3, 4], [2, 2], [2, 6], [3, 1], [1, 4], [3, 7], [1, 2]];
const espalhar = async () => {
  const cv = await page.evaluate(() => { const r = document.querySelector('div.relative.shadow-2xl.bg-stone-900').getBoundingClientRect(); return { x: r.x, y: r.y, s: r.height / 900 }; });
  const n = await page.evaluate(() => document.querySelectorAll('div.absolute.z-20.cursor-grab').length);
  if (process.env.DEBUG) console.log('canvas', cv, 'aliados', n);
  for (let i = 0; i < Math.min(n, FORMACAO.length); i++) {
    const de = await page.evaluate((i) => { const r = document.querySelectorAll('div.absolute.z-20.cursor-grab')[i]?.getBoundingClientRect(); return r ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : null; }, i);
    if (!de) break;   // heroi morreu no meio do arrasto
    const [c, l] = FORMACAO[i];
    const para = { x: cv.x + (c * 87.5 + 43) * cv.s, y: cv.y + (l * 112.5 + 56) * cv.s };
    await page.mouse.move(de.x, de.y); await page.mouse.down(); await dorme(80);
    await page.mouse.move(para.x, para.y, { steps: 6 }); await dorme(80); await page.mouse.up(); await dorme(200);
    if (process.env.DEBUG) console.log('arrasto', i, de, para, await page.evaluate(() => [...document.querySelectorAll('div.absolute.z-20.cursor-grab')].map(e => { const r = e.getBoundingClientRect(); return Math.round(r.x) + ',' + Math.round(r.y); }).join(' ')));
  }
};
const ondaAtual = () => page.evaluate(() => { const m = document.body.innerText.match(/(?:ONDA|WAVE)\s*(\d+)/); return m ? +m[1] : 0; });

if (quer('01')) { await page.goto(URL); await dorme(3000); await shot('01-menu'); }
if (quer('02')) {
  await page.goto(URL); await dorme(2500);
  await clickText('HEROES').catch(() => {}); await dorme(2000); await shot('02-herois');
}

// batalhas com time cheio: monta o time na onda anterior e fotografa ~6 s depois que a onda-alvo comeca
for (const [ato, onda, nome] of [['ACT I', 20, '03-ato1-chefe'], ['ACT II', 14, '04-ato2-floresta'], ['ACT III', 20, '05-ato3-chefe'], ['ACT IV', 16, '06-ato4-abismo'], ['ACT V', 18, '07-ato5-magma']]) {
  if (!quer(nome)) continue;
  await entrar(ato, `?onda=${onda - 1}&muralha=1&ouro=4000`);
  await montarTime(8);
  await espalhar();
  await velocidade(5);
  for (let i = 0; i < 120 && (await ondaAtual()) < onda; i++) { await escolherCarta(); await pular(); await fecharEncontro(); await dorme(500); }
  await velocidade(1);
  await montarTime(2); await velocidade(1); await espalhar();
  // onda de chefe: espera a barra do chefe (NN%) aparecer; senao ~6 s de onda
  const chefe = onda % 10 === 0;
  for (let i = 0; i < (chefe ? 40 : 9); i++) {
    await escolherCarta(); await pular(); await fecharEncontro(); await dorme(700);
    if (chefe && await page.evaluate(() => [...document.querySelectorAll('span,div')].some(e => e.children.length === 0 && /^\d{1,3}%$/.test(e.textContent.trim())))) { await dorme(6000); break; }
  }
  for (let i = 0; i < 5 && (await escolherCarta()); i++) await dorme(600);   // level-up por cima da batalha nao
  await shot(nome);
}

// meteoro no meio da horda
if (quer('08')) {
  await entrar('ACT I', '?onda=15&muralha=1&ouro=4000');
  await montarTime(10);
  await velocidade(1);
  for (let i = 0; i < 60; i++) {   // espera o feitico carregar
    await escolherCarta(); await pular(); await fecharEncontro(); await dorme(500);
    const ok = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.style.borderImage.includes('panel_ember')); return !!b && !b.disabled; });
    if (ok) break;
  }
  // alvo: o primeiro rotulo de inimigo em campo (nome em cima da cabeca)
  const alvo = await page.evaluate(() => {
    const r = [...document.querySelectorAll('div,span')].filter(d => d.children.length === 0 && /^[A-ZÀ-Ú' ]{4,}$/.test(d.textContent.trim()) && d.getBoundingClientRect().x > 700 && d.getBoundingClientRect().y > 250 && d.getBoundingClientRect().y < 800)[0]?.getBoundingClientRect();
    return r ? { x: r.x + r.width / 2, y: r.y + 45 } : null;
  });
  await page.evaluate(() => { [...document.querySelectorAll('button')].find(x => x.style.borderImage.includes('panel_ember')).click(); });
  await dorme(150);
  await page.mouse.click(alvo?.x ?? 1300, alvo?.y ?? 520);
  await dorme(520); await shot('08-meteoro');
}

// level-up com 3 cartas
if (quer('09')) {
  await entrar('ACT I', '?onda=6&muralha=1'); await velocidade(5);
  for (let i = 0; i < 90; i++) { await pular(); await fecharEncontro(); if (await page.$('.upg-card')) break; await dorme(1000); }
  await dorme(900); await shot('09-levelup');
}

// encontro entre ondas
if (quer('10')) {
  await entrar('ACT I', '?onda=4&muralha=1&encontro=1'); await velocidade(5);
  for (let i = 0; i < 90; i++) { await escolherCarta(); await pular(); if (await page.$('[data-testid="encontro-opcao"]')) break; await dorme(1000); }
  await dorme(900); await shot('10-encontro');
}

console.log('erros', erros.slice(0, 5));
await browser.close();
