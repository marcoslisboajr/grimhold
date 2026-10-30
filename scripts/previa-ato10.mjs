// ══════════════════════════════════════════════════════════════════════
// previa-ato10.mjs — conferencia no navegador do Ato X (Etapa 3a), copia do previa-ato9.
// Sobe um Vite proprio (porta 3016), libera o Ato X (grimhold_act10_unlocked) e entra em ?onda=N com
// &muralha=1. Ondas comuns (1, 14, 24, 30 — a 30 do X e a maior onda comum, sem chefe): confere o cenario bg_act10 e que so aparecem tipos do X. Ondas
// de chefe (5..25 e 31, a final): espera o chefe legado (barra no topo) e tira print. Os chefes do X sao os legados do
// V antigo: nenhum tem fala chefe.* (mantem so o que ja tinham), entao todos contam como mudos aqui.
// Saida: release-demo/previa-ato10/  |  Uso: node scripts/previa-ato10.mjs [1 5 10 ...]
// ══════════════════════════════════════════════════════════════════════
import { chromium } from 'playwright';
import { createServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'release-demo/previa-ato10';
fs.mkdirSync(OUT, { recursive: true });
const ONDAS = process.argv.slice(2).map(Number).filter(Boolean);
const vite = await createServer({ server: { port: 3016, strictPort: true }, logLevel: 'error' });
await vite.listen();
const URL = 'http://localhost:3016';
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
// numero da onda no HUD (so leitura): a onda comum pode acabar e a proxima comecar durante a amostra
const ondaHud = () => page.evaluate(() => { const s = [...document.querySelectorAll('span.pixel-display')].find(e => e.style.fontSize === '28px'); return s ? parseInt(s.textContent, 10) : null; });
const invocar = () => page.evaluate(() => { const b = document.querySelector('button[title^="Summon"]'); if (b && !b.disabled) b.click(); });
const velocidade = async (v) => {
  for (let i = 0; i < 3; i++) {
    const a = await page.evaluate(() => { const b = document.querySelector('button[title$="x Speed"]'); return b ? parseInt(b.title) : null; });
    if (a === null || a === v) return;
    await page.click('button[title$="x Speed"]'); await dorme(150);
  }
};
const entrar = async (query) => {
  await page.goto(URL + '/', { timeout: 180000 }); await page.evaluate((c) => {
    localStorage.setItem('grimhold_act10_unlocked', 'true');
    if (c) localStorage.setItem('grimhold_corrompido', c); else localStorage.removeItem('grimhold_corrompido');
  }, process.env.CORROMPIDO ?? '');
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
  return (w.__refInimigos?.current ?? []).map(e => ({ type: e.type, hp: Math.round(e.hp), maxHp: Math.round(e.maxHp), x: Math.round(e.position.x), y: Math.round(e.position.y), w: Math.round(e.width), semAlvo: !!e._semAlvo, fase: e._fase, escolta: !!e._invocadoPor && !!e._invocadoPor._escoltaFome, reward: e.reward, reforcoT: e._reforcoT }));
});
const barra = () => page.evaluate(() => {
  const p = [...document.querySelectorAll('span.pixel-text.uppercase')].find(s => s.parentElement?.parentElement && getComputedStyle(s.closest('[class*="z-50"]') ?? s).opacity === '1' && s.textContent && s.style.letterSpacing === '0.16em');
  return p ? p.textContent : null;
});
const balao = () => page.evaluate(() => { const d = [...document.querySelectorAll('div.pixel-text')].find(e => e.style.fontSize === '15px' && e.parentElement?.firstElementChild?.style?.color === 'rgb(255, 215, 106)'); return d ? d.textContent : null; });

const CHEFE = { 5: 'infernatil', 10: 'demon', 15: 'ghazbaran', 20: 'minotaur_king', 25: 'zathroth', 31: 'malachar' };
const MUDO = new Set(Object.values(CHEFE));
if (process.env.CORROMPIDO) { CHEFE[31] = `corrupted_${process.env.CORROMPIDO}`; MUDO.add(CHEFE[31]); }
const DO_ATO = /^(void_stalker|lord_demon|demon_eyes|lesser_demon|celula|tentaculo|acaro_|vespa|slime_grande|bolha|void_herald|warlock_shade|infernatil|demon|ghazbaran|minotaur_king|zathroth|malachar)/;
const cenario = () => page.evaluate(() => document.documentElement.innerHTML.includes('bg_act10_field'));
const resultado = [];
for (const onda of (ONDAS.length ? ONDAS : [1, 14, 24, 30, 5, 10, 15, 20, 25, 31])) {
  const e0 = erros.length;
  await entrar(`?onda=${onda}&muralha=1&ouro=4000`);
  await velocidade(3);
  if (!CHEFE[onda]) {
    const tipos = new Set(); let maxVivos = 0, ondaFim = onda;
    for (let i = 0; i < 40; i++) {
      if (i < 20) await invocar(); await faxina();
      ondaFim = (await ondaHud()) ?? onda; if (ondaFim !== onda) break;   // so conta a onda pedida
      const es = await inimigos(); es.forEach(e => tipos.add(e.type));
      if (es.length > maxVivos) { maxVivos = es.length; await page.screenshot({ path: path.join(OUT, `onda${onda}.png`) }); }
      await dorme(500);
    }
    const fora = [...tipos].filter(t => !DO_ATO.test(t));
    resultado.push({ onda, cenario: await cenario(), tipos: [...tipos], fora, maxVivos, ondaFim, semChefe: !tipos.has('malachar') && ![...tipos].some(t => t.startsWith('corrupted_')), pageerror: erros.length - e0 });
    console.log(JSON.stringify(resultado[resultado.length - 1]));
    continue;
  }
  let viu = null, nome = null, escoltaMax = 0, reforcoVisto = 0; const falas = new Set(); let cheg = false;
  for (let i = 0; i < 240 && !(viu && (cheg || MUDO.has(CHEFE[onda]))); i++) {   // ate ~2 min
    if (i < 20) await invocar();
    await faxina();
    const es = await inimigos();
    const c = es.find(e => e.type === CHEFE[onda]);
    escoltaMax = Math.max(escoltaMax, es.filter(e => e.escolta && e.hp > 0).length);
    if (c && c.x < 1440) viu = c;
    if (process.env.DEBUG && i % 10 === 0) console.log(JSON.stringify(es.filter(e => e.maxHp > 2000 || e.escolta).map(e => [e.type, e.x, e.hp, e.maxHp])));
    nome = nome ?? (viu ? await barra() : null);
    const b = await balao(); if (b) { falas.add(b); if (viu) cheg = true; }
    await dorme(500);
  }
  if (onda === 31 && viu) {   // escolta do Ato X (chefe final, onda 31): print na chegada e depois dos reforcos
    await page.screenshot({ path: path.join(OUT, `onda31-${CHEFE[onda]}-chegada.png`) });
    for (let i = 0; i < 60; i++) {
      await faxina(); const es = await inimigos(); const vivos = es.filter(e => e.escolta && e.hp > 0).length;
      if (vivos > 0 && !reforcoVisto && es.some(e => e.reforcoT !== undefined && e.reforcoT < 3000 && e.x < 1400)) { reforcoVisto = vivos; await page.screenshot({ path: path.join(OUT, `onda31-${CHEFE[onda]}-reforco.png`) }); }
      escoltaMax = Math.max(escoltaMax, vivos); await dorme(500);
    }
  }
  await page.screenshot({ path: path.join(OUT, `onda${onda}-${CHEFE[onda]}.png`) });
  const fim = await inimigos();
  const extra = { cenario: await cenario(), larguraChefe: viu?.w, escoltaMax, reforcoVisto, reforcoT: fim.find(e => e.type === CHEFE[onda])?.reforcoT, escoltaAgora: fim.filter(e => e.escolta && e.hp > 0).length, escoltaTipos: [...new Set(fim.filter(e => e.escolta).map(e => e.type))], escoltaSemOuro: fim.filter(e => e.escolta).every(e => e.reward === 0) };
  resultado.push({ onda, chefe: CHEFE[onda], viu: !!viu, barra: nome, falas: [...falas], pageerror: erros.length - e0, ...extra });
  console.log(JSON.stringify(resultado[resultado.length - 1]));
}
fs.writeFileSync(path.join(OUT, 'resultado.json'), JSON.stringify({ resultado, erros }, null, 2));
await browser.close(); await vite.close();
