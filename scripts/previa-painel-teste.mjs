// ══════════════════════════════════════════════════════════════════════
// previa-painel-teste.mjs — confere o Painel de teste (so DEV) no navegador.
// Sobe um Vite proprio (porta 3120). Cenarios: painel no menu; Ato X onda 30 com time pronto (a
// muralha nao pode cair na hora); Fome fase 1 pelo F9; derrota (Ato X onda 29 Infernal, sem time)
// e "Tentar de novo desta onda". Saida: release-demo/previa-painel-teste/
// Uso: node scripts/previa-painel-teste.mjs
// ══════════════════════════════════════════════════════════════════════
import { chromium } from 'playwright';
import { createServer } from 'vite';
import fs from 'node:fs';

const OUT = 'release-demo/previa-painel-teste';
fs.mkdirSync(OUT, { recursive: true });
const vite = await createServer({ server: { port: 3120, strictPort: true }, logLevel: 'error' });
await vite.listen();
const URL = 'http://localhost:3120';
const browser = await chromium.launch({ args: ['--mute-audio'] });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, locale: 'en-US' });
const page = await ctx.newPage();
const erros = []; page.on('pageerror', e => erros.push(e.message));
const dorme = (ms) => page.waitForTimeout(ms);
const foto = (n) => page.screenshot({ path: `${OUT}/${n}.png` });
const tid = (id) => page.click(`[data-testid="${id}"]`);
const faxina = () => page.evaluate(() => {
  document.querySelector('.upg-card')?.click();
  [...document.querySelectorAll('button')].find(x => /^(PULAR|SKIP)/.test(x.innerText.trim()))?.click();
  const o = [...document.querySelectorAll('[data-testid="encontro-opcao"]')].filter(b => !b.disabled); if (o.length) o[o.length - 1].click();
});
// estado pelo React (so leitura): o ref cuja current e a lista de inimigos / o jogador
const acharRef = (teste) => page.evaluate((teste) => {
  const f0 = document.getElementById('root'); const k = Object.keys(f0).find(k => k.startsWith('__reactContainer'));
  const pilha = [f0[k]]; let n = 0; const ok = new Function('c', 'return ' + teste);
  while (pilha.length && n++ < 200000) {
    const f = pilha.pop(); if (!f) continue;
    let h = f.memoizedState;
    while (h) { const c = h.memoizedState?.current; try { if (c && ok(c)) return true; } catch {} h = h.next; }
    if (f.child) pilha.push(f.child); if (f.sibling) pilha.push(f.sibling);
  }
  return false;
}, teste);
const estado = () => page.evaluate(() => {
  const f0 = document.getElementById('root'); const k = Object.keys(f0).find(k => k.startsWith('__reactContainer'));
  const pilha = [f0[k]]; let n = 0, jog = null, ini = null;
  while (pilha.length && n++ < 200000 && !(jog && ini)) {
    const f = pilha.pop(); if (!f) continue;
    let h = f.memoizedState;
    while (h) { const c = h.memoizedState?.current;
      if (c && !Array.isArray(c) && Array.isArray(c.allies) && 'xpToNextLevel' in c) jog = c;
      if (Array.isArray(c) && c.length && c[0]?.position && 'lane' in c[0]) ini = c;
      h = h.next; }
    if (f.child) pilha.push(f.child); if (f.sibling) pilha.push(f.sibling);
  }
  return { nivel: jog?.level, ouro: jog?.gold, aliados: jog?.allies.map(a => `${a.type}:${a.level}:${a.damage}`), inimigos: (ini ?? []).map(e => e.type).slice(0, 12),
    derrota: !!document.querySelector('[data-testid="tentar-de-novo"]') };
});
const configurar = async ({ ato, onda, dif, fome, muralha, corrompido, time = true }) => {
  await page.waitForSelector('[data-testid="painel-teste-dev"]');
  await tid(`ato-${ato}`);
  await page.fill('[data-testid="onda"]', String(onda));
  await page.click(`button:has-text("${dif}")`);
  if (fome !== undefined) await tid(`fome-${fome}`);
  if (corrompido !== undefined) await page.selectOption('[data-testid="corrompido"]', corrompido);
  const tp = await page.$eval('[data-testid="time-pronto"]', b => b.textContent);
  if ((tp === 'SIM') !== time) await tid('time-pronto');
  const mu = await page.$eval('[data-testid="muralha"]', b => b.textContent);
  if ((mu === 'SIM') !== muralha) await tid('muralha');
};
const log = [];
const anota = async (rot) => { const e = await estado(); log.push({ rot, ...e }); console.log(rot, JSON.stringify(e)); return e; };

await page.goto(URL + '/', { timeout: 180000 }); await dorme(2500);
if (await page.$('input[maxlength="20"]')) { await page.fill('input[maxlength="20"]', 'Teste'); await page.keyboard.press('Enter'); await dorme(800); }
await page.waitForSelector('[data-testid="abrir-painel-teste"]', { timeout: 60000 });
await foto('01-menu-botao');
await tid('abrir-painel-teste');
await configurar({ ato: 'X', onda: 30, dif: 'Normal', fome: 0, muralha: false, corrompido: '' });
await foto('02-painel');
await tid('iniciar-teste'); await dorme(3000);
await anota('ato10-onda30-inicio');
await foto('03-ato10-onda30-inicio');
let caiu = null;
for (let s = 1; s <= 60; s++) { await faxina(); await dorme(1000); if ((await estado()).derrota) { caiu = s; break; } if (s === 20) await foto('04-ato10-onda30-20s'); }
await anota('ato10-onda30-60s'); await foto('05-ato10-onda30-60s');
console.log('muralha caiu em', caiu ?? 'nao caiu em 60 s');

// Fome fase 1 via F9
await page.keyboard.press('F9');
await configurar({ ato: 'X', onda: 30, dif: 'Normal', fome: 1, muralha: true });
await tid('iniciar-teste'); await dorme(9000); await faxina();
await anota('fome-fase1'); await foto('06-fome-fase1');

// derrota e checkpoint: A = morre na onda inicial (volta pela cfg); B = Ato I onda 3 sem time em
// Infernal a 5x, morre numa onda seguinte (volta pelo checkpoint copiado no inicio daquela onda)
const txtBotao = [];
const derrota = async (nome, cfg, vel) => {
  await page.keyboard.press('F9');
  await configurar(cfg);
  await tid('iniciar-teste');
  if (vel) for (let i = 0; i < 4; i++) { const v = await page.evaluate(() => { const b = document.querySelector('button[title$="x Speed"]'); return b ? parseInt(b.title) : null; }); if (v === null || v >= vel) break; await page.click('button[title$="x Speed"]'); await dorme(150); }
  let t = 0; for (; t < 400; t++) { await faxina(); await dorme(1000); if ((await estado()).derrota) break; }
  await anota(`${nome}-derrota-apos-${t}s`); await foto(`${nome}-1-derrota-botao`);
  txtBotao.push(await page.$eval('[data-testid="tentar-de-novo"]', b => b.textContent).catch(() => null));
  await tid('tentar-de-novo'); await dorme(1500);
  await anota(`${nome}-tentar-de-novo`); await foto(`${nome}-2-tentar-de-novo`);
};
await derrota('07a', { ato: 'X', onda: 29, dif: 'Infernal', muralha: false, time: false });
await derrota('07b', { ato: 'I', onda: 3, dif: 'Infernal', muralha: false, time: false }, 5);

fs.writeFileSync(`${OUT}/resultado.json`, JSON.stringify({ caiuOnda30Em: caiu, txtBotao, log, erros }, null, 2));
console.log('botao:', txtBotao, 'erros:', erros.length);
await browser.close(); await vite.close();
