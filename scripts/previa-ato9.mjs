// ══════════════════════════════════════════════════════════════════════
// previa-ato9.mjs — conferencia no navegador do Ato IX (Etapa 2b), copia do previa-ato8.
// Sobe um Vite proprio (porta 3014), libera o Ato IX (grimhold_act9_unlocked) e entra em
// ?onda=N com &muralha=1. Ondas comuns (1, 14, 24): confere o cenario bg_act9 e que so aparecem
// tipos do IX. Ondas de chefe (5..30): espera o chefe (barra no topo) e o balao de chegada
// (Cranio Ancestral e Cerbero Alfa nao falam), tira print. Onda 15: print com o fio de teia
// visivel e print com a Drider em cima; onda 20: print das duas estatuas.
// Saida: release-demo/previa-ato9/  |  Uso: node scripts/previa-ato9.mjs [1 5 10 ...]
// ══════════════════════════════════════════════════════════════════════
import { chromium } from 'playwright';
import { createServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'release-demo/previa-ato9';
fs.mkdirSync(OUT, { recursive: true });
const ONDAS = process.argv.slice(2).map(Number).filter(Boolean);
const vite = await createServer({ server: { port: 3014, strictPort: true }, logLevel: 'error' });
await vite.listen();
const URL = 'http://localhost:3014';
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
  await page.goto(URL + '/'); await page.evaluate(() => localStorage.setItem('grimhold_act9_unlocked', 'true'));
  await page.goto(URL + '/' + query); await dorme(2500);
  if (await page.$('input[maxlength="20"]')) { await page.fill('input[maxlength="20"]', 'Guardiao'); await page.keyboard.press('Enter'); await dorme(800); }
  await clickText('START'); await dorme(600);
  await clickText('STANDARD'); await dorme(400);
  await clickText('CHOOSE YOUR DIFFICULTY'); await dorme(500);
  await clickText('NORMAL'); await dorme(1200);
  await clickText('PLAY'); await dorme(1200);
  await clickText('ACT IX'); await dorme(3000);
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
  return (w.__refInimigos?.current ?? []).map(e => ({ type: e.type, hp: Math.round(e.hp), maxHp: Math.round(e.maxHp), x: Math.round(e.position.x), y: Math.round(e.position.y), semAlvo: !!e._semAlvo, fase: e._fase }));
});
const barra = () => page.evaluate(() => {
  const p = [...document.querySelectorAll('span.pixel-text.uppercase')].find(s => s.parentElement?.parentElement && getComputedStyle(s.closest('[class*="z-50"]') ?? s).opacity === '1' && s.textContent && s.style.letterSpacing === '0.16em');
  return p ? p.textContent : null;
});
const balao = () => page.evaluate(() => { const d = [...document.querySelectorAll('div.pixel-text')].find(e => e.style.fontSize === '15px' && e.parentElement?.firstElementChild?.style?.color === 'rgb(255, 215, 106)'); return d ? d.textContent : null; });

const CHEFE = { 5: 'general_ossos', 10: 'cranio_ancestral', 15: 'drider', 20: 'estatua_leste', 25: 'cerbero_alfa', 30: 'quimera' };
const MUDO = new Set(['cranio_ancestral', 'cerbero_alfa']);
const DO_ATO = /^(legiao|cranio|mumia|estatua_lamina|beholder9|cerbero|aranha|general_ossos|cranio_ancestral|drider|estatua_leste|estatua_oeste|cerbero_alfa|quimera)/;
const cenario = () => page.evaluate(() => document.documentElement.innerHTML.includes('bg_act9_field'));
const resultado = [];
for (const onda of (ONDAS.length ? ONDAS : [1, 14, 24, 5, 10, 15, 20, 25, 30])) {
  const e0 = erros.length;
  await entrar(`?onda=${onda}&muralha=1&ouro=4000`);
  await velocidade(3);
  if (!CHEFE[onda]) {
    const tipos = new Set();
    for (let i = 0; i < 40; i++) { if (i < 20) await invocar(); await faxina(); (await inimigos()).forEach(e => tipos.add(e.type)); await dorme(500); }
    await page.screenshot({ path: path.join(OUT, `onda${onda}.png`) });
    const fora = [...tipos].filter(t => !DO_ATO.test(t));
    resultado.push({ onda, cenario: await cenario(), tipos: [...tipos], fora, pageerror: erros.length - e0 });
    console.log(JSON.stringify(resultado[resultado.length - 1]));
    continue;
  }
  let viu = null, nome = null; const falas = new Set(); let cheg = false;
  for (let i = 0; i < 240 && !(viu && (cheg || MUDO.has(CHEFE[onda]))); i++) {   // ate ~2 min
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
  const extra = { cenario: await cenario() };
  if (onda === 15 && viu) {   // fio de teia visivel (DOM) e a Drider em cima (sem alvo)
    const fio = () => page.evaluate(() => { const f = document.querySelector('[data-fio]'); return f ? Math.round(parseFloat(f.style.height) || 0) : -1; });
    extra.fioAltura = await fio();
    await page.screenshot({ path: path.join(OUT, 'onda15-drider-fio.png') });
    for (let i = 0; i < 80; i++) { await faxina(); const c = (await inimigos()).find(e => e.type === 'drider'); if (c?.semAlvo) { extra.emCima = true; await dorme(400); extra.fioEmCima = await fio(); await page.screenshot({ path: path.join(OUT, 'onda15-drider-em-cima.png') }); break; } await dorme(200); }
    extra.crias = (await inimigos()).filter(e => e.type.startsWith('aranha')).length;
  }
  if (onda === 20 && viu) {   // as duas estatuas em campo
    for (let i = 0; i < 20; i++) { const es = await inimigos(); const l = es.find(e => e.type === 'estatua_leste'), o = es.find(e => e.type === 'estatua_oeste'); if (l && o && l.x < 1440 && o.x < 1440) { extra.estatuas = { leste: l, oeste: o }; break; } await dorme(300); }
    await page.screenshot({ path: path.join(OUT, 'onda20-estatuas.png') });
  }
  resultado.push({ onda, chefe: CHEFE[onda], viu: !!viu, barra: nome, falas: [...falas], pageerror: erros.length - e0, ...extra });
  console.log(JSON.stringify(resultado[resultado.length - 1]));
}
fs.writeFileSync(path.join(OUT, 'resultado.json'), JSON.stringify({ resultado, erros }, null, 2));
await browser.close(); await vite.close();
