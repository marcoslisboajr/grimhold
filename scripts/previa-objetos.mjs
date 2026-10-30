// ══════════════════════════════════════════════════════════════════════
// previa-objetos.mjs — prova da "fisica" dos objetos altos (systems/pegadas.ts).
// Sobe um Vite proprio (porta 3130), entra no ato com ?onda=N&muralha=1 e, com os
// inimigos que nasceram, monta cenas junto de um objeto alto:
//   antes  = regra velha simulada no DOM (zIndex = base - min(48, h*0.33)) e inimigo
//            preso com o pe DENTRO da pegada (o que acontecia sem desvio)
//   depois = jogo como esta: o mesmo inimigo solto no mesmo ponto desliza pra fora
//            da pegada; o maior inimigo logo abaixo da base (na frente, inteiro) e o
//            menor ("gosma") logo acima (atras).
// Saida: release-demo/previa-objetos/  |  Uso: node scripts/previa-objetos.mjs
// ══════════════════════════════════════════════════════════════════════
import { chromium } from 'playwright';
import { createServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'release-demo/previa-objetos';
fs.mkdirSync(OUT, { recursive: true });
const vite = await createServer({ server: { port: 3130, strictPort: true }, logLevel: 'error' });
await vite.listen();
const URL = 'http://localhost:3130';
const browser = await chromium.launch({ args: ['--mute-audio'] });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, locale: 'en-US' });
const page = await ctx.newPage();
const erros = []; page.on('pageerror', e => erros.push(e.message));
const dorme = (ms) => page.waitForTimeout(ms);
const clickText = async (txt) => {
  for (let i = 0; i < 40; i++) {
    const ok = await page.evaluate((txt) => { const el = [...document.querySelectorAll('button,div,span,h1,h2,h3')].find(e => e.children.length < 4 && e.textContent.trim().toUpperCase() === txt); if (el) { el.click(); return true; } return false; }, txt);
    if (ok) return; await dorme(250);
  }
  throw new Error('nao achei: ' + txt);
};
const faxina = () => page.evaluate(() => {
  document.querySelector('.upg-card')?.click();
  [...document.querySelectorAll('button')].find(x => /^(PULAR|SKIP)/.test(x.innerText.trim()))?.click();
  const o = [...document.querySelectorAll('[data-testid="encontro-opcao"]')].filter(b => !b.disabled); if (o.length) o[o.length - 1].click();
});
const entrar = async (ato, onda) => {
  await page.goto(URL + '/'); await page.goto(URL + `/?onda=${onda}&muralha=1&ouro=4000`); await dorme(2500);
  if (await page.$('input[maxlength="20"]')) { await page.fill('input[maxlength="20"]', 'Guardiao'); await page.keyboard.press('Enter'); await dorme(800); }
  await clickText('START'); await dorme(600);
  await clickText('STANDARD'); await dorme(400);
  await clickText('CHOOSE YOUR DIFFICULTY'); await dorme(500);
  await clickText('NORMAL'); await dorme(1200);
  await clickText('PLAY'); await dorme(1200);
  await clickText(ato); await dorme(3000);
  for (let i = 0; i < 5; i++) { await faxina(); await dorme(300); }
};
// ref da lista de inimigos (so leitura/depuracao, como nos outros previa-*)
const acharRef = () => page.evaluate(() => {
  const w = window; w.__refInimigos = null;
  const raiz = document.getElementById('root'); const k = Object.keys(raiz).find(k => k.startsWith('__reactContainer'));
  const pilha = [raiz[k]]; let achou = null, n = 0;
  while (pilha.length && !achou && n++ < 200000) {
    const f = pilha.pop(); if (!f) continue;
    let h = f.memoizedState;
    while (h && !achou) { const c = h.memoizedState?.current; if (Array.isArray(c) && c.length && c[0]?.position && 'maxHp' in c[0]) achou = h.memoizedState; h = h.next; }
    if (f.child) pilha.push(f.child); if (f.sibling) pilha.push(f.sibling);
  }
  w.__refInimigos = achou; return !!achou;
});
const esperarInimigos = async (n) => {
  for (let i = 0; i < 120; i++) { await faxina(); if (await acharRef() && await page.evaluate((n) => window.__refInimigos.current.filter(e => e.hp > 0).length >= n, n)) return; await dorme(500); }
  throw new Error('sem inimigos');
};
// cena: objeto (src termina em `sufixo`, indice `qual`), inimigos por pe relativo a base
const cena = async (nome, sufixo, qual, cenas, antes) => {
  await page.evaluate(({ sufixo, qual, cenas, antes }) => {
    const w = window; clearInterval(w.__pino);
    const imgs = [...document.querySelectorAll('img')].filter(i => i.src.endsWith(sufixo));
    const img = imgs[qual]; const campo = img.parentElement.getBoundingClientRect();
    const r = img.getBoundingClientRect(), s = campo.width / 1600;
    const o = { x: (r.left - campo.left) / s, w: r.width / s, h: r.height / s, base: Number(img.style.zIndex) };
    if (antes) { o.base = Number(img.dataset.base ?? img.style.zIndex); img.dataset.base = o.base; img.style.zIndex = String(o.base - Math.min(48, Math.round(o.h * 0.33))); }
    else if (img.dataset.base) { img.style.zIndex = img.dataset.base; }
    const vivos = w.__refInimigos.current.filter(e => e.hp > 0).sort((a, b) => b.height - a.height);
    vivos.forEach(e => { e.hp = e.maxHp = 1e9; });
    vivos.forEach((e, i) => { if (i >= cenas.length) { e.position.x = 1700; } });
    const presos = cenas.map((c, i) => { const e = c.menor ? vivos[vivos.length - 1] : vivos[i]; return { e, x: o.x + o.w * c.fx - e.width / 2, y: o.base + c.pe - e.height, pino: c.pino }; });
    presos.forEach(p => { p.e.position.x = p.x; p.e.position.y = p.y; });
    w.__pino = setInterval(() => presos.forEach(p => { if (p.pino) { p.e.position.x = p.x; p.e.position.y = p.y; } else { p.e.position.x = Math.max(p.e.position.x, p.x - 20); } }), 5);
  }, { sufixo, qual, cenas, antes });
  await dorme(antes ? 700 : 1600);
  await page.screenshot({ path: path.join(OUT, `${nome}.png`) });
};

const CASOS = [
  { ato: 'ACT II', onda: 3, arq: 'ato2', obj: '/lapides.png', qual: 0 },
  { ato: 'ACT III', onda: 3, arq: 'ato3', obj: '/pedregulho.png', qual: 0 },
  { ato: 'ACT VII', onda: 3, arq: 'ato7', obj: '/pedra_g.png', qual: 0 },
  { ato: 'ACT VI', onda: 3, arq: 'ato6-estatua', obj: '/estatua.png', qual: 0 },
  { ato: 'ACT VI', onda: 3, arq: 'ato6-pedras', obj: '/pedras.png', qual: 0 },
  { ato: 'ACT VI', onda: 3, arq: 'ato6-vulto', obj: '/vulto.png', qual: 0 },
  { ato: 'ACT I', onda: 3, arq: 'ato1', obj: '/arvore_p.png', qual: 0 },
];
for (const c of CASOS) {
  await entrar(c.ato, c.onda);
  await esperarInimigos(3);
  await page.evaluate(() => { window.__gs = document.querySelector('button[title$="x Speed"]'); });
  // antes: inimigo medio e gosma com o pe dentro da parte de baixo do objeto -> desenhados POR CIMA
  await cena(`${c.arq}-antes`, c.obj, c.qual, [{ fx: 0.35, pe: -12, pino: true }, { fx: 0.75, pe: -20, pino: true, menor: true }], true);
  // depois: os mesmos pontos, soltos -> desviam da pegada; grande logo abaixo fica na frente
  await cena(`${c.arq}-depois`, c.obj, c.qual, [{ fx: 0.35, pe: -12, pino: false }, { fx: 0.75, pe: -20, pino: false, menor: true }], false);
  await cena(`${c.arq}-grande-e-gosma`, c.obj, c.qual, [{ fx: 0.5, pe: 14, pino: true }, { fx: 0.8, pe: -34, pino: true, menor: true }], false);
  const pes = await page.evaluate(() => window.__refInimigos.current.filter(e => e.position.x < 1600).map(e => ({ t: e.type, x: Math.round(e.position.x), pe: Math.round(e.position.y + e.height) })));
  console.log(c.arq, JSON.stringify(pes));
}
console.log('pageerror:', erros.length, erros.slice(0, 3));
await browser.close(); await vite.close();
