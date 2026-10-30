// ══════════════════════════════════════════════════════════════════════
// gravar-meteoro.mjs — grava o Meteoro caindo na horda (Ato I, onda 12),
// quadro a quadro pelo screencast do Chromium, pra montar posts de antes/depois.
// Sobe um Vite proprio na pasta pedida (da pra apontar pra um worktree antigo).
// Saida: <saida>/f0000.png ... + quadros.json (recorte e tempos)
// Uso:  node scripts/gravar-meteoro.mjs <raiz do projeto> <pasta de saida> [porta=3010]
// ══════════════════════════════════════════════════════════════════════
import { chromium } from 'playwright';
import { createServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

const [,, RAIZ = '.', SAIDA = 'release-demo/posts/meteoro', PORTA = '3010'] = process.argv;
fs.rmSync(SAIDA, { recursive: true, force: true }); fs.mkdirSync(SAIDA, { recursive: true });
const vite = await createServer({ root: path.resolve(RAIZ), configFile: path.resolve(RAIZ, 'vite.config.ts'), server: { port: +PORTA, strictPort: true }, logLevel: 'error' });
await vite.listen();
const URL = `http://localhost:${PORTA}`;

const browser = await chromium.launch({ args: ['--mute-audio'] });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, locale: 'en-US' });
const page = await ctx.newPage();
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

// inimigos em campo = imagens de /sprites/enemies/ (centro de cada uma)
const inimigos = () => page.evaluate(() => [...document.querySelectorAll('img')].filter(i => /sprites\/enemies\//.test(i.src)).map(i => i.getBoundingClientRect()).filter(r => r.width > 0 && r.x > 500).map(r => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 })));
const limpar = () => page.evaluate(() => {
  const dev = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === '+5W'); if (dev) dev.parentElement.style.display = 'none';
  document.querySelectorAll('.hud-fixo').forEach(e => { e.style.display = 'none'; });
  [...document.querySelectorAll('span,div')].filter(e => e.children.length === 0 && /^\d{6} \/ 999999$/.test(e.textContent.trim())).forEach(e => { e.style.visibility = 'hidden'; });
});
await page.goto(URL);
await page.evaluate(() => {
  localStorage.setItem('grimhold.lang', 'en');
  localStorage.setItem('grimhold_charselect_tutorial_v2', 'true');
  localStorage.setItem('grimhold_tutorial_done', 'true');
  localStorage.setItem('grimhold_ui_zoom', '1.15');
});
await page.goto(URL + '/?onda=11&muralha=1&ouro=4000'); await dorme(3000);
if (await page.$('input[maxlength="20"]')) { await page.fill('input[maxlength="20"]', 'Guardiao'); await page.keyboard.press('Enter'); await dorme(800); }
await clickText('START'); await dorme(600);
await clickText('STANDARD'); await dorme(400);
await clickText('CHOOSE YOUR DIFFICULTY'); await dorme(500);
await clickText('NORMAL'); await dorme(1200);
await clickText('PLAY'); await dorme(1200);
await clickText('ACT I'); await dorme(3000);
// sem invocar ninguem: os inimigos se amontoam na muralha (imortal) e o feitico carrega
for (let i = 0; i < 100; i++) {
  await faxina(); await dorme(500);
  const pronto = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.style.borderImage.includes('panel_ember')); return !!b && !b.disabled; });
  const l = await inimigos(); const bolo = Math.max(0, ...l.map(p => l.filter(q => Math.hypot(q.x - p.x, q.y - p.y) < 150).length));
  if (pronto && (bolo >= 5 || i > 90)) break;
}
for (let i = 0; i < 5; i++) { await faxina(); await dorme(300); }
// alvo: o inimigo que tem mais vizinhos a ate 150 px (meio do bolo)
const lista = await inimigos();
const alvo = lista.length ? lista.map(p => ({ ...p, v: lista.filter(q => Math.hypot(q.x - p.x, q.y - p.y) < 150).length })).sort((a, b) => b.v - a.v)[0] : { x: 1300, y: 520 };
await limpar();
// avisos que surgem durante a gravacao (nivel de conta, conquista) somem assim que aparecem
await page.evaluate(() => setInterval(() => document.querySelectorAll('div').forEach(d => { if (d.children.length < 8 && /N[ÍI]VEL DE CONTA|CONQUISTA DESBLOQUEADA|ACCOUNT LEVEL|ACHIEVEMENT UNLOCKED/i.test(d.innerText || '') && d.getBoundingClientRect().width < 400) d.style.visibility = 'hidden'; }), 30));
// recorte 16:9 em volta do impacto, dentro da tela
const W = 960, H = 540;
const clip = { x: Math.max(0, Math.min(1920 - W, Math.round(alvo.x - W / 2))), y: Math.max(0, Math.min(1080 - H, Math.round(alvo.y - H / 2 - 60))), width: W, height: H };

// screencast: ~0,8 s antes do clique e ~2,2 s depois
const cdp = await ctx.newCDPSession(page);
const quadros = [];
cdp.on('Page.screencastFrame', (f) => { quadros.push({ t: f.metadata.timestamp, d: f.data }); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: 1920, maxHeight: 1080 });
await dorme(800);
await page.evaluate(() => { [...document.querySelectorAll('button')].find(x => x.style.borderImage.includes('panel_ember')).click(); });
await dorme(120);
await page.mouse.click(alvo.x, alvo.y);
await dorme(2200);
await cdp.send('Page.stopScreencast');
fs.writeFileSync(path.join(SAIDA, 'quadros.json'), JSON.stringify({ clip, tempos: quadros.map(q => q.t) }));
quadros.forEach((q, i) => fs.writeFileSync(path.join(SAIDA, `f${String(i).padStart(4, '0')}.png`), Buffer.from(q.d, 'base64')));
console.log('quadros', quadros.length, 'alvo', alvo, 'clip', clip);
await browser.close(); await vite.close();
