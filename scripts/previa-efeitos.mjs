// ══════════════════════════════════════════════════════════════════════
// previa-efeitos.mjs — conferencia no navegador da camada de efeitos de magia (components/efeitosMagias.tsx).
// Piloto: Caldeira Divina do Paladino (anel dourado no raio real + faiscas nos inimigos atingidos).
// Sobe um Vite proprio (porta 3100), joga o Ato I de Paladino e, SO PARA A PREVIA, liga a carta da Caldeira
// no heroi pelo ref do React (divineCalderaStacks=3; depois Cruzada Eterna para o raio 360). Nada disso
// fica gravado: e so a pagina de teste.
// Saida: release-demo/previa-efeitos/ (PNGs + quadros para o GIF)  |  Uso: node scripts/previa-efeitos.mjs
// ══════════════════════════════════════════════════════════════════════
import { chromium } from 'playwright';
import { createServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'release-demo/previa-efeitos';
fs.mkdirSync(path.join(OUT, 'quadros'), { recursive: true });
const vite = await createServer({ server: { port: 3100, strictPort: true }, logLevel: 'error', cacheDir: 'node_modules/.vite-previa-efeitos' });
await vite.listen();
const URL = 'http://localhost:3100';
const browser = await chromium.launch({ args: ['--mute-audio'] });
const page = await (await browser.newContext({ viewport: { width: 1400, height: 860 } })).newPage();
const erros = []; page.on('pageerror', e => erros.push(e.message));
const dorme = (ms) => page.waitForTimeout(ms);

await page.goto(URL + '/');
await page.evaluate(() => localStorage.setItem('arcane_unlocks', JSON.stringify(['paladin'])));
await page.reload(); await dorme(1200);
const input = page.locator('input').first();
if (await input.isVisible().catch(() => false)) { await input.fill('Previa'); await page.locator('button', { hasText: /INICIAR/i }).first().click(); await dorme(400); }
await page.locator('button', { hasText: /^COMEÇAR/ }).first().click(); await dorme(400);
await page.locator('button', { hasText: /ESCOLHA SUA DIFICULDADE/ }).first().click(); await dorme(400);
await page.locator('text=/^NORMAL$/').first().click({ force: true }); await dorme(700);
const clickTxt = (re) => page.evaluate((src) => { const r = new RegExp(src); const b = [...document.querySelectorAll('button')].find(x => r.test(x.innerText.trim())); if (b) { b.click(); return true; } return false; }, re);
const pular = async () => { for (let i = 0; i < 5; i++) { if (!(await clickTxt('^PULAR'))) return; await dorme(300); } };
await pular();
const card = page.locator('img[src*="/allies/paladin.png"]').first();
if (await card.count()) { await card.click({ force: true }).catch(() => {}); await dorme(200); }
for (let i = 0; i < 8; i++) {
  await pular();
  if (await page.locator('button[title$="x Speed"]').count()) break;
  if (!(await clickTxt('^Ato I(?!I|V)'))) await clickTxt('^JOGAR'); await dorme(900);
}

// acha o ref do jogador (current com allies[]) e liga a Caldeira no paladino — so depuracao
const ligar = (cruzada) => page.evaluate((cruzada) => {
  const w = window;
  if (!w.__refJogador) {
    const raiz = document.getElementById('root'); const k = Object.keys(raiz).find(k => k.startsWith('__reactContainer'));
    const pilha = [raiz[k]]; let n = 0;
    while (pilha.length && !w.__refJogador && n++ < 200000) {
      const f = pilha.pop(); if (!f) continue;
      let h = f.memoizedState;
      while (h && !w.__refJogador) { const c = h.memoizedState?.current; if (c && Array.isArray(c.allies) && 'gold' in c) w.__refJogador = h.memoizedState; h = h.next; }
      if (f.child) pilha.push(f.child); if (f.sibling) pilha.push(f.sibling);
    }
  }
  const pal = w.__refJogador?.current?.allies?.find(a => a.type === 'paladin');
  if (!pal) return 'sem paladino: ' + (w.__refJogador?.current?.allies ?? []).map(a => a.type).join(',');
  pal.perks = { ...(pal.perks ?? {}), divineCalderaStacks: 3, paladinEternalCrusade: !!cruzada };
  return 'ok';
}, cruzada);
const faxina = () => page.evaluate(() => {
  document.querySelector('.upg-card')?.click();
  [...document.querySelectorAll('button')].find(x => /^(PULAR|SKIP)/.test(x.innerText.trim()))?.click();
  const o = [...document.querySelectorAll('[data-testid="encontro-opcao"]')].filter(b => !b.disabled); if (o.length) o[o.length - 1].click();
});
const aneis = () => page.evaluate(() => document.querySelectorAll('[data-camada="efeitos-magias"] img').length);

const r = {};
r.ligar180 = await ligar(false);
// raio 180: o anel aparece a cada tique (500 ms de jogo)
for (let t = 0; t < 10000 && !(await aneis()); t += 100) await dorme(100);
r.aneis180 = await aneis();
await page.screenshot({ path: path.join(OUT, 'caldeira-180.png') });
// Cruzada Eterna (raio 360): alcanca a frente da muralha; espera faiscas (inimigo dentro do raio)
r.ligar360 = await ligar(true);
const faiscas = () => page.evaluate(() => document.querySelectorAll('[data-camada="efeitos-magias"] > div').length);
// so previa: traz cada inimigo UMA vez para a frente da muralha (dentro do raio); o paladino mata de longe antes
const puxar = () => page.evaluate(() => {
  const w = window;
  if (!w.__refInimigos) {
    const raiz = document.getElementById('root'); const k = Object.keys(raiz).find(k => k.startsWith('__reactContainer'));
    const pilha = [raiz[k]]; let n = 0;
    while (pilha.length && !w.__refInimigos && n++ < 200000) {
      const f = pilha.pop(); if (!f) continue;
      let h = f.memoizedState;
      while (h && !w.__refInimigos) { const c = h.memoizedState?.current; if (Array.isArray(c) && c.length && c[0]?.position && 'maxHp' in c[0] && !('gridPosition' in c[0]) && 'speed' in c[0]) w.__refInimigos = h.memoizedState; h = h.next; }
      if (f.child) pilha.push(f.child); if (f.sibling) pilha.push(f.sibling);
    }
  }
  let i = 0; for (const e of w.__refInimigos?.current ?? []) if (e.hp > 0 && !e._previa && e.position.x > 420) { e._previa = 1; e.position.x = 340 + (i % 3) * 30; i++; }
  return i;
});
for (let t = 0; t < 90000; t += 300) { await faxina(); await ligar(true); r.puxados = (r.puxados ?? 0) + await puxar(); if (await faiscas()) break; await dorme(300); }
r.faiscas = await faiscas(); r.aneis360 = await aneis();
await page.screenshot({ path: path.join(OUT, 'caldeira-360-cruzada.png') });
for (let i = 0; i < 30; i++) { await page.screenshot({ path: path.join(OUT, 'quadros', `q${String(i).padStart(2, '0')}.png`)}); await dorme(60); }
r.pageerror = erros.length; r.erros = erros.slice(0, 5);
console.log(JSON.stringify(r));
fs.writeFileSync(path.join(OUT, 'resultado.json'), JSON.stringify(r, null, 2));
await browser.close(); await vite.close();
