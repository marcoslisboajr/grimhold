// ══════════════════════════════════════════════════════════════════════
// previa-fome.mjs — conferencia no navegador da luta final do Ato X (Etapa 3b), copia do previa-ato10.
// Sobe um Vite proprio (porta 3017), libera o Ato X e entra em ?onda=31&muralha=1&fome=N (atalho DEV: a
// onda 31, a ultima do X, nao solta ninguem e a Fome comeca; N=2/3 pula para a fase). Prints: transicao, fase 1, aviso
// do Verme (fase 2), Coracao (fase 3) e o epilogo (o Coracao e derrubado pelo ref, so depuracao).
// Saida: release-demo/previa-fome/  |  Uso: node scripts/previa-fome.mjs
// ══════════════════════════════════════════════════════════════════════
import { chromium } from 'playwright';
import { createServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'release-demo/previa-fome';
fs.mkdirSync(OUT, { recursive: true });
const ONDAS = process.argv.slice(2).map(Number).filter(Boolean);
const vite = await createServer({ server: { port: 3017, strictPort: true }, logLevel: 'error' });
await vite.listen();
const URL = 'http://localhost:3017';
const browser = await chromium.launch({ args: ['--mute-audio'] });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, locale: 'en-US' });
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
const invocar = () => page.evaluate(() => { const b = document.querySelector('button[title^="Summon"]'); if (b && !b.disabled) b.click(); });
const velocidade = async (v) => {
  for (let i = 0; i < 3; i++) {
    const a = await page.evaluate(() => { const b = document.querySelector('button[title$="x Speed"]'); return b ? parseInt(b.title) : null; });
    if (a === null || a === v) return;
    await page.click('button[title$="x Speed"]'); await dorme(150);
  }
};
const entrar = async (query) => {
  await page.goto(URL + '/', { timeout: 180000 }); await page.evaluate(() => localStorage.setItem('grimhold_act10_unlocked', 'true'));
  await page.goto(URL + '/' + query); await dorme(2500);
  if (await page.$('input[maxlength="20"]')) { await page.fill('input[maxlength="20"]', 'Ventre'); await page.keyboard.press('Enter'); await dorme(800); }
  await clickText('START'); await dorme(600);
  await clickText('STANDARD'); await dorme(400);
  await clickText('CHOOSE YOUR DIFFICULTY'); await dorme(500);
  await clickText('NORMAL'); await dorme(1200);
  await clickText('PLAY'); await dorme(1200);
  await clickText('ACT X'); await dorme(3000);
  for (let i = 0; i < 5; i++) { await faxina(); await dorme(300); }
};
// estado do jogo pelo React (so leitura/depuracao): acha o ref cujo current e a lista de inimigos
const inimigos = () => page.evaluate(() => {
  const w = window;
  if (!w.__refInimigos) {
    const raiz = document.getElementById('root'); const k = Object.keys(raiz).find(k => k.startsWith('__reactContainer'));
    const pilha = [raiz[k]]; let achou = null, n = 0;
    while (pilha.length && !achou && n++ < 200000) {
      const f = pilha.pop(); if (!f) continue;
      let h = f.memoizedState;
      while (h && !achou) { const c = h.memoizedState?.current; if (Array.isArray(c) && c.length && c[0]?.position && 'maxHp' in c[0] && 'lane' in c[0]) achou = h.memoizedState; h = h.next; }
      if (f.child) pilha.push(f.child); if (f.sibling) pilha.push(f.sibling);
    }
    w.__refInimigos = achou;
  }
  return (w.__refInimigos?.current ?? []).map(e => ({ fechado: !!e._fechado, type: e.type, hp: Math.round(e.hp), maxHp: Math.round(e.maxHp), x: Math.round(e.position.x), y: Math.round(e.position.y), semAlvo: !!e._semAlvo, fase: e._fase }));
});
const barra = () => page.evaluate(() => {
  const p = [...document.querySelectorAll('span.pixel-text.uppercase')].find(s => s.parentElement?.parentElement && getComputedStyle(s.closest('[class*="z-50"]') ?? s).opacity === '1' && s.textContent && s.style.letterSpacing === '0.16em');
  return p ? p.textContent : null;
});
const balao = () => page.evaluate(() => { const d = [...document.querySelectorAll('div.pixel-text')].find(e => e.style.fontSize === '15px' && e.parentElement?.firstElementChild?.style?.color === 'rgb(255, 215, 106)'); return d ? d.textContent : null; });

const cenarioVentre = () => page.evaluate(() => document.documentElement.innerHTML.includes('bg_act10b_field'));
const derrubar = (tipo) => page.evaluate((tipo) => { for (const e of window.__refInimigos?.current ?? []) if (e.type === tipo) e.hp = 0; }, tipo);
const resultado = [];
const espera = async (cond, ms) => { for (let t = 0; t < ms; t += 250) { await faxina(); if (await cond()) return true; await dorme(250); } return false; };
for (const n of [1, 2, 3]) {
  const e0 = erros.length;
  await entrar(`?onda=31&muralha=1&fome=${n}`);
  const r = { fome: n };
  if (n === 1) {
    await dorme(1500); await page.screenshot({ path: path.join(OUT, 'transicao.png') });
    r.pontos = await espera(async () => (await inimigos()).filter(e => e.type === 'fome_ponto').length === 4, 20000);
    r.cenario = await cenarioVentre(); r.barra = await barra();
    await dorme(4000); await page.screenshot({ path: path.join(OUT, 'fase1.png') });
  }
  if (n === 2) {
    r.fase2 = await espera(async () => (await inimigos()).filter(e => e.type === 'fome_ponto' && e.hp > 0).length === 2, 20000);
    r.avisoVerme = await espera(() => page.evaluate(() => [...document.querySelectorAll('div')].some(d => d.style.borderTop?.includes('dashed'))), 20000);
    await page.screenshot({ path: path.join(OUT, 'aviso-verme.png') });
    await dorme(1800); await page.screenshot({ path: path.join(OUT, 'verme.png') });
  }
  if (n === 3) {
    r.coracao = await espera(async () => (await inimigos()).some(e => e.type === 'fome_coracao'), 20000);
    await dorme(2000); r.barra = await barra(); await page.screenshot({ path: path.join(OUT, 'coracao.png') });
    await derrubar('fome_coracao');
    r.epilogo = await espera(() => page.evaluate(() => document.body.innerText.length > 0 && !!document.querySelector('[class*="fixed"]') && /Malachar|ending|epil/i.test(document.body.innerHTML)), 15000);
    await dorme(2500); await page.screenshot({ path: path.join(OUT, 'epilogo.png') });
  }
  r.pageerror = erros.length - e0;
  resultado.push(r); console.log(JSON.stringify(r));
}
fs.writeFileSync(path.join(OUT, 'resultado.json'), JSON.stringify({ resultado, erros }, null, 2));
await browser.close(); await vite.close();
