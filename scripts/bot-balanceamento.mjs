// bot-balanceamento.mjs — o PIOR jogador possivel, pra medir o piso da curva.
// Joga o Ato I na demo (localhost:3001, `preview grimhold-demo`) com um heroi
// so, nunca recruta, nunca usa loja/magia, pega sempre a 1a carta, a 5x.
// Le a telemetria DEV de window.__grimLog (GameCanvas, efeito em waveSummary)
// e imprime muralha/ouro/nivel por onda. Uso:
//   node scripts/bot-balanceamento.mjs [heroi=mage] [dificuldade=normal] [ato=1|2]
//   BOT_MS=120000 node scripts/bot-balanceamento.mjs   (limite de tempo)
// Referencia (20/09, curva nova): Krash passivo toma o 1o dano na W9 e morre na W15.
import { chromium } from 'playwright';
const [,, heroi = 'mage', dif = 'normal', ato = '1'] = process.argv;   // ato: 1..5, 'endless' ou 'randomizer' (o bot forca o destrave dos atos)
const URL = process.env.BOT_URL || 'http://localhost:3001/';   // :3001 demo (prefixo demo_), :3000 jogo completo
const PREFIX = URL.includes('3001') ? 'demo_' : '';
// BOT_ONDA=20 BOT_OURO=1000 (atalhos dev do jogo, so no `npm run dev`) e BOT_RECRUTA=1 (clica em Invocar sempre que der:
// mede um time "real" em vez do heroi sozinho — usado pra testar chefes finais)
const ONDA = process.env.BOT_ONDA, OURO = process.env.BOT_OURO, RECRUTA = process.env.BOT_RECRUTA === '1';
const URL_RUN = URL + (ONDA || OURO ? `?${ONDA ? 'onda=' + ONDA : ''}${ONDA && OURO ? '&' : ''}${OURO ? 'ouro=' + OURO : ''}${process.env.BOT_FOME ? '&fome=' + process.env.BOT_FOME : ''}` : '');   // BOT_FOME=1..3 (com BOT_ONDA=31, a ultima do X): comeca direto na Fome
// BOT_TIME=mage: toda invocacao sai desse heroi (time fixo, comparacao justa)
// BOT_FORJA_CAT=barrier|economy|allies|combat: so essa categoria da forja
// BOT_FORJA=0.5|1: fração do nível máximo de cada upgrade da forja (lido de components/data/forge.ts)
import { readFileSync } from 'fs';
const FORJA_F = parseFloat(process.env.BOT_FORJA || '0');
const FORJA = FORJA_F > 0 ? Object.fromEntries([...readFileSync('components/data/forge.ts', 'utf8').matchAll(/id: '(forge_\w+)',[\s\S]*?maxLevel: (\d+)[^\n]*category: '(\w+)'/g)].filter(m => !process.env.BOT_FORJA_CAT || m[3] === process.env.BOT_FORJA_CAT).map(m => [m[1], Math.round(+m[2] * FORJA_F)]).filter(([, n]) => n > 0)) : null;
const erros = [];
const b = await chromium.launch({ args: ['--mute-audio'] }); const page = await (await b.newContext({ viewport: { width: 1400, height: 860 } })).newPage();
page.on('pageerror', e => erros.push(e.message)); page.on('console', m => { if (m.type() === 'error') erros.push(m.text().slice(0, 160)); });
await page.goto(URL_RUN); await page.evaluate(([pre, FORJA, heroi]) => { localStorage.setItem(`${pre}grimhold_infernal_unlocked`, 'true'); for (const n of [2, 3, 4, 5, 6, 7, 8, 9, 10]) localStorage.setItem(`${pre}grimhold_act${n}_unlocked`, 'true'); if (FORJA) localStorage.setItem(`${pre}grimhold_forge`, JSON.stringify(FORJA)); if (!pre) localStorage.setItem('arcane_unlocks', JSON.stringify([heroi])); }, [PREFIX, FORJA, heroi]); await page.reload(); await page.waitForTimeout(900);
// a barra de debug do localhost (WIN ACTn / FIM DE JOGO / +5W...) nao pode receber clique do bot: encerrava runs sozinha
const bloquearDebug = () => page.addInitScript(() => document.addEventListener('click', (e) => { const b = e.target && e.target.closest && e.target.closest('button'); if (b && /^(WIN |FIM DE JOGO$|\+\d+W$|\+200 PROJ$)/.test(b.innerText.trim())) { e.stopImmediatePropagation(); e.preventDefault(); console.log('BOT: clique de debug bloqueado: ' + b.innerText.trim()); } }, true));
await bloquearDebug(); await page.reload(); await page.waitForTimeout(600);
page.on('console', m => { if (m.text().startsWith('BOT:')) console.log(m.text()); });
const input = page.locator('input').first();
if (await input.isVisible().catch(() => false)) { await input.fill('Bot'); await page.locator('button', { hasText: /INICIAR/i }).first().click(); await page.waitForTimeout(400); }
await page.locator('button', { hasText: /^COMEÇAR/ }).first().click(); await page.waitForTimeout(400);
if (ato === 'endless') { await page.locator('text=/^INFINITO$/').first().click({ force: true }); await page.waitForTimeout(300); }
if (ato === 'randomizer') { await page.locator('text=/^RANDOMIZADOR$/').first().click({ force: true }); await page.waitForTimeout(300); }
await page.locator('button', { hasText: /ESCOLHA SUA DIFICULDADE/ }).first().click(); await page.waitForTimeout(400);
const difTxt = { easy: /^FÁCIL$/, normal: /^NORMAL$/, hard: /^DIFÍCIL$/, infernal: /^INFERNAL$/ }[dif];
await page.locator(`text=${difTxt}`).first().click({ force: true }); await page.waitForTimeout(700);
await (async () => { for (let i = 0; i < 5; i++) { const ok = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^PULAR/.test(x.innerText.trim())); if (b) { b.click(); return true; } return false; }); if (!ok) break; await page.waitForTimeout(300); } })();   // tutorial da selecao cobria o card (o heroi nunca era escolhido)
const card = page.locator(`img[src*="/allies/${heroi}.png"]`).first();
if (await card.count()) { await card.click({ force: true }).catch(() => {}); await page.waitForTimeout(200); }
const clickTxt = (re) => page.evaluate((src) => { const r = new RegExp(src); const b = [...document.querySelectorAll('button')].find(x => r.test(x.innerText.trim())); if (b) { b.click(); return true; } return false; }, re).catch(() => false);
async function pular() { for (let i = 0; i < 5; i++) { if (!(await clickTxt('^PULAR'))) return; await page.waitForTimeout(300); } }
for (let i = 0; i < 8; i++) {
  await pular();
  if (await page.locator('button[title$="x Speed"]').count()) break;
  const atoRe = { '1': '^Ato I(?!I|V|X)', '2': '^Ato II(?!I)', '3': '^Ato III', '4': '^Ato IV', '5': '^Ato V(?!I)', '6': '^Ato VI(?!I)', '7': '^Ato VII(?!I)', '8': '^Ato VIII', '9': '^Ato IX', '10': '^Ato X' }[ato];
  if (!(atoRe && await clickTxt(atoRe))) await clickTxt('^JOGAR'); await page.waitForTimeout(900);
}
for (let i = 0; i < 6; i++) { const t = await page.evaluate(() => { const b = document.querySelector('button[title$="x Speed"]'); if (!b) return null; if (b.title.startsWith('5')) return b.title; b.click(); return 'clicked'; }); if (t !== 'clicked') break; await page.waitForTimeout(200); }
console.log('speed:', await page.locator('button[title$="x Speed"]').first().getAttribute('title').catch(() => '?'));
let last = 0; const t0 = Date.now(); let tOnda = Date.now(); const ondas = []; let fim = 'TEMPO';
while (Date.now() - t0 < (Number(process.env.BOT_MS) || 600000)) {
  try {
  await page.waitForTimeout(700);
  if (process.env.BOT_TRACE) console.log('trace', await page.evaluate(() => { const L = document.body.innerText.split(String.fromCharCode(10)); const k = L.findIndex(x => x.includes('BARREIRA')); return L.slice(k, k + 2).join(' ') + ' | ' + L.filter(x => /Lv|HP|morreu|caiu/.test(x)).slice(0, 4).join(' ; ') + ' | ' + [...document.querySelectorAll('h1,h2,h3')].map(h => h.textContent).join('/').slice(0, 60); }));
  await pular();
  if (process.env.BOT_AUDIO) { const _src = await page.evaluate(() => [...document.querySelectorAll('audio')].filter(a => !a.paused).map(a => a.src.split('/').pop()).join(',')); if (_src !== globalThis.__ultAudio) { globalThis.__ultAudio = _src; console.log('musica:', _src || '(nenhuma)'); } }   // BOT_AUDIO=1: loga troca de faixa
  { const _est = await page.evaluate((pre) => localStorage.getItem(`${pre}grimhold_estandartes`), PREFIX); if (_est !== globalThis.__ultEst) { globalThis.__ultEst = _est; console.log('estandartes:', _est); } }   // loga ganho de Estandarte
  if (RECRUTA) await page.evaluate((t) => { if (t) window.__botSummon = t; const b = document.querySelector('button[title^="Summon"]'); if (b && !b.disabled) b.click(); }, process.env.BOT_TIME || '');
  // carta de level-up: primeira
  const c = page.locator('.upg-card').first(); if (await c.isVisible().catch(() => false)) { const tx = await c.innerText(); console.log('  carta:', tx.split(String.fromCharCode(10)).join(' | ').slice(0, 90)); await c.click({ force: true }); continue; }
  // resumo de onda / overlays "toque para fechar"
  const d = page.locator('text=toque para fechar').first(); if (await d.isVisible().catch(() => false)) { await page.mouse.click(700, 430); }
  // encontro: primeira opcao
  // encontro: a ultima opcao habilitada (costuma ser 'ignorar' — o bot nao toma decisao)
  await page.evaluate(() => { const ops = [...document.querySelectorAll('[data-testid="encontro-opcao"]')].filter(b => !b.disabled); if (ops.length) ops[ops.length - 1].click(); });
  const log = await page.evaluate(() => (window).__grimLog ?? []);
  for (const e of log.slice(last)) { const agora = Date.now(); ondas.push({ w: e.wave, s: Math.round((agora - tOnda) / 100) / 10, muralha: e.towerHp, ouro: e.gold, ganho: e.goldEarned, nv: e.level, boss: e.isBossWave }); tOnda = agora; console.log(`W${String(e.wave).padStart(2)} muralha=${e.towerHp} ouro=${e.gold} (+${e.goldEarned} na onda) nv=${e.level} abates=${e.kills} dmgMuralha=${e.barrierDelta} nota=${e.grade} time=[${e.allies.join(' ')}]`); }
  last = log.length;
  const over = await page.evaluate(() => [...document.querySelectorAll('h1,h2,h3')].some(h => /FIM DE JOGO/.test(h.textContent)));
  const win = await page.evaluate(() => [...document.querySelectorAll('h1,h2,h3')].some(h => /GRIMHOLD RESISTE|O BOSQUE DESPERTA|QUEDA DOS TIT|O ABISMO SELADO|GRIMHOLD PERDURA|A MURALHA FOI VENDIDA|A OUTRA MARGEM CAI|A RAVINA SE CALA|O MAR SE AQUIETA|O PORTÃO CAI|A PORTA ESTÁ ABERTA/.test(h.textContent)));
  if (over || win) { fim = over ? 'D' + (last ? log[last - 1].wave + 1 : 0) : 'V'; console.log(over ? 'DERROTA na onda ' + (last ? log[last - 1].wave + 1 : '?') : 'VITÓRIA'); break; }
  } catch (e) { if (!/context was destroyed|navigation/i.test(String(e))) throw e; await page.waitForTimeout(1000); }   // navegacao no meio de um evaluate: tenta de novo
}
// BOT_JSON=arquivo: acrescenta uma linha JSON com o resultado (usado pelo fechamento-balanceamento)
if (process.env.BOT_JSON) (await import('fs')).appendFileSync(process.env.BOT_JSON, JSON.stringify({ heroi, dif, ato, recruta: RECRUTA, forja: FORJA_F, fim, pos30s: Math.round((Date.now() - tOnda) / 1000), ondas }) + String.fromCharCode(10));
if (process.env.BOT_SHOT) await page.screenshot({ path: process.env.BOT_SHOT });
console.log('erros de pagina:', erros.length, erros.slice(0, 5));
await b.close();
