// bot-exe.mjs — joga a DEMO EMPACOTADA (release-demo/win-unpacked/Grimhold Demo.exe)
// pelo Playwright/Electron, pra testar a build que vai pro Steam (sem atalhos de dev).
// Uso: node scripts/bot-exe.mjs [padrao|solo] [minutos=15]
//   padrao: Ato I Normal, invoca aliados e lança o Meteoro sempre que der
//   solo:   Guardião Solitário, Ato I Normal, anda com WASD (toque e tecla segurada)
// Loga onda, muralha e erros da página; tira print a cada 5 ondas em release-demo/bot-exe/.
import { _electron } from 'playwright';
import fs from 'node:fs';
const [,, modo = 'padrao', minutos = '15'] = process.argv;
const OUT = 'release-demo/bot-exe'; fs.mkdirSync(OUT, { recursive: true });
// janela do bot fica em segundo plano: sem esses flags o Chromium estrangula o rAF e o jogo congela
const app = await _electron.launch({ executablePath: 'release-demo/win-unpacked/Grimhold Demo.exe', args: ['--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows'] });
const w = await app.firstWindow();
const erros = []; w.on('pageerror', e => { erros.push(e.message); console.log('ERRO pagina:', e.message.slice(0, 200)); });
w.on('close', () => console.log('JANELA FECHOU')); w.on('requestfailed', r => console.log('FALHOU:', r.url().slice(-120))); app.on('close', () => console.log('APP FECHOU'));
w.on('console', m => { if (/error|warn/.test(m.type())) console.log('console.' + m.type() + ':', m.text().slice(0, 200)); }); w.on('console', m => { if (m.type() === 'error') erros.push(m.text().slice(0, 160)); });
const dorme = (ms) => w.waitForTimeout(ms);
const clickTxt = (re) => w.evaluate((src) => { const r = new RegExp(src); const b = [...document.querySelectorAll('button,div,span')].find(x => x.children.length < 4 && r.test((x.innerText || '').trim())); if (b) { b.click(); return true; } return false; }, re);
await dorme(5000);
const input = w.locator('input[maxlength="20"]');
if (await input.count()) { await input.fill('Bot'); await w.keyboard.press('Enter'); await dorme(800); }
// idioma do jogo segue o sistema; os textos abaixo aceitam pt ou en
await clickTxt('^(COMEÇAR|START)'); await dorme(700);
await clickTxt(modo === 'solo' ? '^(GUARDIÃO SOLITÁRIO|LONE GUARDIAN)$' : '^(PADRÃO|STANDARD)$'); await dorme(500);
await clickTxt('^(ESCOLHA SUA DIFICULDADE|CHOOSE YOUR DIFFICULTY)'); await dorme(600);
await clickTxt('^NORMAL$'); await dorme(1200);
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 5; j++) { if (!(await clickTxt('^(PULAR|SKIP)'))) break; await dorme(300); }
  if (await w.locator('button[title$="x Speed"]').count()) break;
  if (!(await clickTxt('^(Ato I|Act I)(?!I|V)'))) await clickTxt('^(JOGAR|PLAY)'); await dorme(1200);
}
for (let i = 0; i < 4; i++) { const t = await w.evaluate(() => { const b = document.querySelector('button[title$="x Speed"]'); if (!b) return null; if (b.title.startsWith('5')) return b.title; b.click(); return 'c'; }); if (t !== 'c') break; await dorme(200); }
console.log(modo, 'velocidade:', await w.locator('button[title$="x Speed"]').first().getAttribute('title').catch(() => '?'));
const t0 = Date.now(); let ultOnda = 0, meteoros = 0, passos = 0, fim = '';
const TECLAS = ['w', 's', 'a', 'd'];
while (Date.now() - t0 < (+minutos) * 60000) {
  await dorme(600);
  await clickTxt('^(PULAR|SKIP)');
  await w.evaluate(() => { const c = document.querySelector('.upg-card'); if (c) c.click(); });
  await w.evaluate(() => { const o = [...document.querySelectorAll('[data-testid="encontro-opcao"]')].filter(b => !b.disabled); if (o.length) o[o.length - 1].click(); });
  if (await w.locator('text=/toque para fechar|tap to close/i').first().isVisible().catch(() => false)) await w.mouse.click(700, 430);
  if (modo === 'padrao') await w.evaluate(() => { const b = document.querySelector('button[title^="Summon"]'); if (b && !b.disabled) b.click(); });
  // meteoro: quando pronto, mira no primeiro inimigo com rotulo na tela
  const pronto = await w.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.style.borderImage.includes('panel_ember')); if (b && !b.disabled) { b.click(); return true; } return false; });
  if (pronto) {
    const alvo = await w.evaluate(() => { const e = [...document.querySelectorAll('div,span')].find(d => d.children.length === 0 && /^[A-ZÀ-Ú' ]{4,}$/.test(d.textContent.trim()) && d.getBoundingClientRect().x > 500 && d.getBoundingClientRect().y > 150); const r = e?.getBoundingClientRect(); return r ? { x: r.x + r.width / 2, y: r.y + 40 } : null; });
    if (alvo) { await dorme(100); await w.mouse.click(alvo.x, alvo.y); meteoros++; } else await w.evaluate(() => [...document.querySelectorAll('button')].find(x => x.style.borderImage.includes('panel_ember'))?.click());   // cancela a mira (Esc pausaria)
  }
  if (modo === 'solo') {   // toque rapido ou tecla segurada ~0,7 s
    const k = TECLAS[Math.floor(Math.random() * 4)];
    if (Math.random() < 0.5) await w.keyboard.press(k); else { await w.keyboard.down(k); await dorme(700); await w.keyboard.up(k); }
    passos++;
  }
  const st = await w.evaluate(() => {
    const txt = document.body.innerText;
    const onda = +(txt.match(/(ONDA|WAVE)\s*(\d+)/) || [])[2] || 0;
    const derrota = [...document.querySelectorAll('h1,h2,h3')].some(h => /FIM DE JOGO|GAME OVER/.test(h.textContent));
    const vitoria = [...document.querySelectorAll('h1,h2,h3')].some(h => /GRIMHOLD RESISTE|GRIMHOLD STANDS|VIT[ÓO]RIA|VICTORY/i.test(h.textContent));
    return { onda, derrota, vitoria };
  });
  if (st.onda && st.onda !== ultOnda) {
    ultOnda = st.onda;
    console.log(`${Math.round((Date.now() - t0) / 1000)}s onda ${st.onda} meteoros ${meteoros}${modo === 'solo' ? ' passos ' + passos : ''} erros ${erros.length}`);
    if (st.onda % 5 === 0) await w.screenshot({ path: `${OUT}/${modo}-onda${st.onda}.png` });
  }
  if (process.env.BOT_DEBUG && !globalThis.__dbg && Date.now() - t0 > 60000) { globalThis.__dbg = 1; await w.screenshot({ path: OUT + '/debug.png' }); console.log('debug', await w.evaluate(() => ({ cartas: document.querySelectorAll('.upg-card').length, texto: document.body.innerText.split('💀').join('').slice(0, 250) }))); }
  if (st.derrota || st.vitoria) { fim = st.derrota ? 'DERROTA na onda ' + ultOnda : 'VITÓRIA'; await w.screenshot({ path: `${OUT}/${modo}-fim.png` }); break; }
}
console.log(modo, 'RESULTADO:', fim || `tempo esgotado na onda ${ultOnda}`, '| meteoros', meteoros, '| erros', erros.length, erros.slice(0, 5));
await app.close();
