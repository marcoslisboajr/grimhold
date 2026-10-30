// ══════════════════════════════════════════════════════════════════════
// previa-ato6-chefes.mjs — conferencia no navegador dos chefes do Ato VI (Etapa 1b).
// Sobe um Vite proprio (porta 3011), libera o Ato VI (grimhold_act6_unlocked) e entra em
// ?onda=5,10,15,20,25,30 com &muralha=1. Em cada onda: espera o chefe (barra no topo) e o
// balao de chegada, tira print. Onda 10: print do circulo do Coro. Onda 25: forca a 1a morte
// da Fenix (vida 0 pelo estado do React, so aqui no script) e tira print do renascimento.
// Saida: release-demo/previa-ato6-chefes/  |  Uso: node scripts/previa-ato6-chefes.mjs [5 10 ...]
// ══════════════════════════════════════════════════════════════════════
import { chromium } from 'playwright';
import { createServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'release-demo/previa-ato6-chefes';
fs.mkdirSync(OUT, { recursive: true });
const ONDAS = process.argv.slice(2).map(Number).filter(Boolean);
const vite = await createServer({ server: { port: 3011, strictPort: true }, logLevel: 'error' });
await vite.listen();
const URL = 'http://localhost:3011';
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
  await page.goto(URL + '/'); await page.evaluate(() => localStorage.setItem('grimhold_act6_unlocked', 'true'));
  await page.goto(URL + '/' + query); await dorme(2500);
  if (await page.$('input[maxlength="20"]')) { await page.fill('input[maxlength="20"]', 'Guardiao'); await page.keyboard.press('Enter'); await dorme(800); }
  await clickText('START'); await dorme(600);
  await clickText('STANDARD'); await dorme(400);
  await clickText('CHOOSE YOUR DIFFICULTY'); await dorme(500);
  await clickText('NORMAL'); await dorme(1200);
  await clickText('PLAY'); await dorme(1200);
  await clickText('ACT VI'); await dorme(3000);
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
  return (w.__refInimigos?.current ?? []).map(e => ({ type: e.type, hp: Math.round(e.hp), maxHp: Math.round(e.maxHp), x: Math.round(e.position.x), y: Math.round(e.position.y), renasceu: !!e._renasceu }));
});
const barra = () => page.evaluate(() => {
  const p = [...document.querySelectorAll('span.pixel-text.uppercase')].find(s => s.parentElement?.parentElement && getComputedStyle(s.closest('[class*="z-50"]') ?? s).opacity === '1' && s.textContent && s.style.letterSpacing === '0.16em');
  return p ? p.textContent : null;
});
const balao = () => page.evaluate(() => { const d = [...document.querySelectorAll('div.pixel-text')].find(e => e.style.fontSize === '15px' && e.parentElement?.firstElementChild?.style?.color === 'rgb(255, 215, 106)'); return d ? d.textContent : null; });

const CHEFE = { 5: 'cultista_mor', 10: 'coro', 15: 'anjo_caido', 20: 'irma_de_cassiel', 25: 'fenix_ancia', 30: 'serafim_caido' };
const resultado = [];
for (const onda of (ONDAS.length ? ONDAS : [5, 10, 15, 20, 25, 30])) {
  const e0 = erros.length;
  await entrar(`?onda=${onda}&muralha=1&ouro=4000`);
  await velocidade(3);
  let viu = null, nome = null; const falas = new Set(); let cheg = false;
  for (let i = 0; i < 240 && !(viu && (cheg || onda === 25)); i++) {   // a Fenix nao fala   // ate ~2 min
    if (i < 20) await invocar();
    await faxina();
    const es = await inimigos();
    const c = es.find(e => e.type === CHEFE[onda]);
    if (c && c.x < 1440) viu = c;
    nome = nome ?? (viu ? await barra() : null);
    const b = await balao(); if (b) { falas.add(b); if (viu) cheg = true; }
    await dorme(500);
  }
  await page.screenshot({ path: path.join(OUT, `onda${onda}-${CHEFE[onda]}.png`) });
  const extra = {};
  if (onda === 10) {
    const es = await inimigos();
    extra.coristas = es.filter(e => e.type === 'coro_cultista').length;
    extra.regente = es.find(e => e.type === 'coro');
    await page.screenshot({ path: path.join(OUT, 'onda10-coro-circulo.png') });
  }
  if (onda === 25 && viu) {
    extra.fenixAntes = (await inimigos()).find(e => e.type === 'fenix_ancia');
    await page.evaluate(() => { const f = window.__refInimigos.current.find(e => e.type === 'fenix_ancia'); if (f) f.hp = 0; });
    await dorme(250);
    await page.screenshot({ path: path.join(OUT, 'onda25-fenix-renasce.png') });
    const f = (await inimigos()).find(e => e.type === 'fenix_ancia');
    extra.fenixDepois = f ?? 'sumiu';
  }
  resultado.push({ onda, chefe: CHEFE[onda], viu: !!viu, barra: nome, falas: [...falas], pageerror: erros.length - e0, ...extra });
  console.log(JSON.stringify(resultado[resultado.length - 1]));
}
fs.writeFileSync(path.join(OUT, 'resultado.json'), JSON.stringify({ resultado, erros }, null, 2));
await browser.close(); await vite.close();
