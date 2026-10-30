// ══════════════════════════════════════════════════════════════════════
// clipes-posts.mjs — clipes curtos (MP4 1280x720) pra respostas de
// #WishlistWednesday e posts: arrastar heroi, Guardiao com WASD, chefe,
// muralha quase caindo. Grava pelo screencast do Chromium e monta com o
// ffmpeg do pacote imageio-ffmpeg (python -m pip install imageio-ffmpeg).
// Sobe um Vite proprio na porta 3010.
// Saida: release-demo/posts/wishlist/<cena>.mp4 (+ .png do quadro do meio)
// Uso:  node scripts/clipes-posts.mjs [arrastar|wasd|chefe|muralha] (sem nada = todas)
// Cenas longas (20-40 s) pra Shorts/TikTok, saida em release-demo/posts/shorts/:
//       node scripts/clipes-posts.mjs shorts   (todas)  ou  s-guardiao|s-horda|s-chefe|s-derrota|s-time|s-5x|s-atos
// ══════════════════════════════════════════════════════════════════════
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'release-demo/posts/wishlist';
fs.mkdirSync(OUT, { recursive: true });
const SO = process.argv[2];
const OUT_S = 'release-demo/posts/shorts';
const cenaS = (n) => SO === 'shorts' || SO === n;   // cenas longas nunca rodam no "todas" dos clipes curtos
const CURTOS = !SO || ['arrastar', 'wasd', 'chefe', 'muralha'].includes(SO);
const FF = execFileSync('python', ['-c', 'import imageio_ffmpeg as f; print(f.get_ffmpeg_exe())']).toString().trim();
const vite = await createServer({ server: { port: 3010, strictPort: true }, logLevel: 'error' });
await vite.listen();
const URL = 'http://localhost:3010';

// com GPU: sem janela e sem GPU o Chromium roda o jogo a 30 fps (menos na batalha) e o clipe sai travado
const browser = await chromium.launch({ args: ['--mute-audio', '--enable-gpu', '--use-angle=d3d11'] });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, locale: 'en-US' });
const page = await ctx.newPage();
const erros = []; page.on('pageerror', e => erros.push(e.message));
const dorme = (ms) => page.waitForTimeout(ms);

// ── ajudantes (mesmos do prints-loja-v2) ──
const clickText = async (txt) => {
  for (let i = 0; i < 40; i++) {
    const ok = await page.evaluate((txt) => { const el = [...document.querySelectorAll('button,div,span,h1,h2,h3')].find(e => e.children.length < 4 && e.textContent.trim().toUpperCase() === txt); if (el) { el.click(); return true; } return false; }, txt);
    if (ok) return; await dorme(250);
  }
  throw new Error('nao achei: ' + txt);
};
const velocidade = async (v) => {
  for (let i = 0; i < 3; i++) {
    const a = await page.evaluate(() => { const b = document.querySelector('button[title$="x Speed"]'); return b ? parseInt(b.title) : null; });
    if (a === null || a === v) return;
    await page.click('button[title$="x Speed"]'); await dorme(150);
  }
};
const faxina = () => page.evaluate(() => {
  document.querySelector('.upg-card')?.click();
  [...document.querySelectorAll('button')].find(x => /^(PULAR|SKIP)/.test(x.innerText.trim()))?.click();
  const o = [...document.querySelectorAll('[data-testid="encontro-opcao"]')].filter(b => !b.disabled); if (o.length) o[o.length - 1].click();
});
const invocar = () => page.evaluate(() => { const b = document.querySelector('button[title^="Summon"]'); if (b && !b.disabled) b.click(); });
// some a barra de dev, toasts, avisos de nivel/conquista e o numero da muralha imortal (fica ligado durante a gravacao)
const limpar = () => page.evaluate(() => {
  if (window.__limpo) return; window.__limpo = 1;
  setInterval(() => {
    document.querySelector('.upg-card')?.click();   // level-up nao fica na tela durante a gravacao
    const dev = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === '+5W'); if (dev) dev.parentElement.style.display = 'none';
    document.querySelectorAll('.hud-fixo').forEach(e => { e.style.display = 'none'; });
    [...document.querySelectorAll('span,div')].filter(e => e.children.length === 0 && /^\d{6} \/ \d+$/.test(e.textContent.trim())).forEach(e => { e.style.visibility = 'hidden'; });
    document.querySelectorAll('div').forEach(d => { if (d.children.length < 8 && /N[ÍI]VEL DE CONTA|CONQUISTA DESBLOQUEADA|ACCOUNT LEVEL|ACHIEVEMENT UNLOCKED/i.test(d.innerText || '') && d.getBoundingClientRect().width < 400) d.style.visibility = 'hidden'; });
  }, 30);
});
const entrar = async (modo, query, heroi = null, ato = 'ACT I') => {
  await page.goto(URL + '/' + query); await dorme(2500);
  if (await page.$('input[maxlength="20"]')) { await page.fill('input[maxlength="20"]', 'Guardiao'); await page.keyboard.press('Enter'); await dorme(800); }
  await clickText('START'); await dorme(600);
  await clickText(modo); await dorme(400);
  await clickText('CHOOSE YOUR DIFFICULTY'); await dorme(500);
  await clickText('NORMAL'); await dorme(1200);
  if (heroi) {   // escolhe o heroi pelo nome no card da selecao
    await page.evaluate((h) => { const el = [...document.querySelectorAll('div,span')].find(e => e.children.length === 0 && e.textContent.trim().toUpperCase() === h); el?.closest('button,[role=button],div.cursor-pointer')?.click() ?? el?.click(); }, heroi);
    await dorme(600);
  }
  await clickText('PLAY'); await dorme(1200);
  await clickText(ato); await dorme(3000);
  for (let i = 0; i < 5; i++) { await faxina(); await dorme(300); }
  await limpar();
};
const montarTime = async (seg) => { await velocidade(2); for (let i = 0; i < seg * 2; i++) { await invocar(); await faxina(); await dorme(500); } };
const canvas = () => page.evaluate(() => { const r = document.querySelector('div.relative.shadow-2xl.bg-stone-900').getBoundingClientRect(); return { x: r.x, y: r.y, s: r.height / 900 }; });
const celula = (cv, c, l) => ({ x: cv.x + (c * 87.5 + 43) * cv.s, y: cv.y + (l * 112.5 + 56) * cv.s });
const aliados = () => page.evaluate(() => [...document.querySelectorAll('div.absolute.z-20.cursor-grab')].map(e => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }));
const arrastar = async (de, para, passos = 6) => {
  await page.mouse.move(de.x, de.y); await page.mouse.down(); await dorme(80);
  await page.mouse.move(para.x, para.y, { steps: passos }); await dorme(80); await page.mouse.up(); await dorme(200);
};
const FORMACAO = [[3, 4], [2, 2], [2, 6], [3, 1], [1, 4], [3, 7], [1, 2]];
const espalhar = async () => { const cv = await canvas(); const a = await aliados(); for (let i = 0; i < Math.min(a.length, FORMACAO.length); i++) { const b = (await aliados())[i]; await arrastar(b, celula(cv, ...FORMACAO[i])); } };
const inimigosX = () => page.evaluate(() => [...document.querySelectorAll('img')].filter(i => /sprites\/enemies\//.test(i.src)).map(i => i.getBoundingClientRect()).filter(r => r.width > 0).map(r => r.x));
const ondaAtual = () => page.evaluate(() => { const m = document.body.innerText.match(/(?:ONDA|WAVE)\s*(\d+)/); return m ? +m[1] : 0; });

// ── gravacao: screencast -> quadros png -> mp4 com a duracao real de cada quadro ──
const gravar = async (nome, acao, corte = null, out = OUT) => {
  const cdp = await ctx.newCDPSession(page);
  const q = [];
  cdp.on('Page.screencastFrame', (f) => { q.push({ t: f.metadata.timestamp, d: f.data }); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
  // jpeg em 1280x720 (tamanho final): png em 1920 so sai ~16 quadros/s e o clipe fica travado
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 95, everyNthFrame: 1, maxWidth: 1280, maxHeight: 720 });
  await acao();
  await cdp.send('Page.stopScreencast'); await cdp.detach();
  fs.mkdirSync(out, { recursive: true });
  const dir = path.join(out, '_q_' + nome); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
  let lista = 'ffconcat version 1.0\n';
  q.forEach((f, i) => {
    const arq = `f${String(i).padStart(4, '0')}.jpg`;
    fs.writeFileSync(path.join(dir, arq), Buffer.from(f.d, 'base64'));
    const dur = i < q.length - 1 ? q[i + 1].t - f.t : 0.1;
    lista += `file ${arq}\nduration ${dur.toFixed(4)}\n`;
  });
  fs.writeFileSync(path.join(dir, 'lista.txt'), lista);
  const mp4 = path.resolve(out, nome + '.mp4');
  execFileSync(FF, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'lista.txt', '-vf', (corte ? `crop=${corte.w}:${corte.h}:${corte.x}:${corte.y},` : '') + 'fps=60,scale=1280:720:flags=lanczos', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', mp4], { cwd: dir });
  await page.screenshot({ path: path.join(out, nome + '.png') });
  fs.rmSync(dir, { recursive: true, force: true });
  console.log('clipe:', nome, q.length, 'quadros', ((q.at(-1).t - q[0].t)).toFixed(1) + 's');
};

// estado inicial: jogo em ingles (posts e loja sao pra publico internacional), tutoriais feitos
await page.goto(URL);
await dorme(2500);
if (await page.$('input[maxlength="20"]')) { await page.fill('input[maxlength="20"]', 'Guardian'); await page.keyboard.press('Enter'); await dorme(800); }
await page.evaluate(() => {   // Yue liberada no perfil (Guardiao Solitario usa ela)
  const p = JSON.parse(localStorage.getItem('grimhold_profile') || '{}');
  p.unlockedCharacters = [...new Set([...(p.unlockedCharacters || []), 'yue'])];
  localStorage.setItem('grimhold_profile', JSON.stringify(p));
});
await page.evaluate(() => {
  localStorage.setItem('grimhold.lang', 'en');
  localStorage.setItem('grimhold_charselect_tutorial_v2', 'true');
  localStorage.setItem('grimhold_tutorial_done', 'true');
  localStorage.setItem('grimhold_ui_zoom', '1.15');
});

// 1) arrastar herois no meio da onda: time cheio, tres trocas de posto com o mouse devagar
if (CURTOS && (!SO || SO === 'arrastar')) {
  await entrar('STANDARD', '?onda=7&muralha=1&ouro=4000');
  await montarTime(8); await espalhar(); await velocidade(1);
  for (let i = 0; i < 6; i++) { await faxina(); await dorme(500); }
  const cv = await canvas();
  await gravar('arrastar', async () => {
    await dorme(1200);
    for (const [c, l] of [[0, 3], [3, 5], [1, 6]]) {
      const a = await aliados(); const de = a[Math.floor(Math.random() * a.length)];
      await arrastar(de, celula(cv, c, l), 30); await dorme(1300);
    }
    await dorme(800);
  });
}

// 2) Guardiao Solitario andando com WASD entre os inimigos
if (CURTOS && (!SO || SO === 'wasd')) {
  await entrar('LONE GUARDIAN', '?onda=8&muralha=1', 'YUE');
  await velocidade(1);
  for (let i = 0; i < 60; i++) { await faxina(); await dorme(500); if ((await inimigosX()).filter(x => x < 1100).length >= 3) break; }
  await gravar('wasd', async () => {
    await dorme(600);
    for (const [k, ms] of [['s', 700], ['d', 450], ['s', 250], ['w', 1100], ['a', 250], ['d', 700], ['s', 500], ['a', 450]]) {
      await page.keyboard.down(k); await dorme(ms); await page.keyboard.up(k); await dorme(350);
    }
    await dorme(500);
  });
}

// 3) chefe do Ato I entrando, com o time espalhado
if (CURTOS && (!SO || SO === 'chefe')) {
  await entrar('STANDARD', '?onda=14&muralha=1&ouro=4000');
  await montarTime(8); await espalhar(); await velocidade(5);
  for (let i = 0; i < 120 && (await ondaAtual()) < 15; i++) { await faxina(); await dorme(500); }
  await velocidade(1);
  for (let i = 0; i < 80; i++) {
    await faxina(); await dorme(500);
    if (await page.evaluate(() => /CEIFADOR|GRIM REAPER/i.test(document.body.innerText))) break;   // nome do chefe na barra
  }
  for (let i = 0; i < 4; i++) { await faxina(); await dorme(500); }
  await gravar('chefe', async () => { for (let i = 0; i < 16; i++) { await faxina(); await dorme(500); } });
}

// 4) muralha quase caindo: sem muralha imortal e sem time, espera a barreira passar de 15%
if (CURTOS && (!SO || SO === 'muralha')) {
  await entrar('STANDARD', '?onda=12');
  await velocidade(2);
  let pct = 100;
  for (let i = 0; i < 1500; i++) {
    await faxina(); await dorme(150);
    pct = await page.evaluate(() => { const sp = [...document.querySelectorAll('span.pixel-display')].find(e => e.previousElementSibling?.querySelector('svg') && /^\d+ \/ \d+$/.test(e.textContent.trim())); if (!sp) return 100; const [a, b] = sp.textContent.split('/').map(Number); return Math.round(100 * a / b); });
    if (pct <= 25 || await page.evaluate(() => /FIM DE JOGO|GAME OVER/.test(document.body.innerText))) break;
  }
  await velocidade(1);
  await page.screenshot({ path: `${OUT}/muralha.png` });
  console.log('muralha em', pct + '%');
}


// ══ cenas longas pra Shorts/TikTok (20-40 s cada) ══
const muralhaPct = () => page.evaluate(() => { const sp = [...document.querySelectorAll('span.pixel-display')].find(e => e.previousElementSibling?.querySelector('svg') && /^\d+ \/ \d+$/.test(e.textContent.trim())); if (!sp) return 100; const [a, b] = sp.textContent.split('/').map(Number); return Math.round(100 * a / b); });
const fimDeJogo = () => page.evaluate(() => /FIM DE JOGO|GAME OVER/.test(document.body.innerText));
const segurar = async (seg) => { for (let i = 0; i < seg * 2; i++) { await faxina(); await dorme(500); } };

// Guardiao Solitario: Yue anda e luta sozinha por ~28 s
if (cenaS('s-guardiao')) {
  await entrar('LONE GUARDIAN', '?onda=9&muralha=1', 'YUE');
  await velocidade(1);
  for (let i = 0; i < 60; i++) { await faxina(); await dorme(500); if ((await inimigosX()).filter(x => x < 1100).length >= 4) break; }
  await gravar('s-guardiao', async () => {
    const passos = [['s', 700], ['d', 500], ['w', 1100], ['d', 400], ['s', 900], ['a', 350], ['w', 600], ['d', 600], ['s', 500], ['a', 500]];
    for (let r = 0; r < 3; r++) for (const [k, ms] of passos) { await page.keyboard.down(k); await dorme(ms); await page.keyboard.up(k); await faxina(); await dorme(300); }
  }, null, OUT_S);
}

// horda de fim de ato contra o time cheio, velocidade 1
if (cenaS('s-horda')) {
  await entrar('STANDARD', '?onda=23&muralha=1&ouro=9000');
  await montarTime(10); await espalhar(); await velocidade(1);
  for (let i = 0; i < 40; i++) { await faxina(); await dorme(500); if ((await inimigosX()).length >= 12) break; }
  await gravar('s-horda', () => segurar(28), null, OUT_S);
}

// chefe do Ato I: da entrada ate morrer (limite ~40 s)
if (cenaS('s-chefe')) {
  await entrar('STANDARD', '?onda=14&muralha=1&ouro=6000');
  await montarTime(10); await espalhar(); await velocidade(5);
  for (let i = 0; i < 120 && (await ondaAtual()) < 15; i++) { await faxina(); await dorme(500); }
  await velocidade(1);
  for (let i = 0; i < 80; i++) { await faxina(); await dorme(500); if (await page.evaluate(() => /CEIFADOR|GRIM REAPER/i.test(document.body.innerText))) break; }
  await gravar('s-chefe', async () => {
    for (let i = 0; i < 80; i++) { await faxina(); await dorme(500); if (i > 10 && !(await page.evaluate(() => /CEIFADOR|GRIM REAPER/i.test(document.body.innerText)))) { await dorme(2500); break; } }
  }, null, OUT_S);
}

// derrota: muralha de 85% ate o GAME OVER (conteudo de "quase")
if (cenaS('s-derrota')) {
  await entrar('STANDARD', '?onda=12');
  await velocidade(2);
  for (let i = 0; i < 2000; i++) { await faxina(); await dorme(150); if ((await muralhaPct()) <= 85 || await fimDeJogo()) break; }
  await velocidade(1);
  await gravar('s-derrota', async () => { for (let i = 0; i < 90; i++) { await faxina(); await dorme(500); if (await fimDeJogo()) { await dorme(3000); break; } } }, null, OUT_S);
}

// montando o time do zero: invoca e posiciona cada heroi
if (cenaS('s-time')) {
  await entrar('STANDARD', '?onda=3&muralha=1&ouro=6000');
  await velocidade(1);
  const cv = await canvas();
  await gravar('s-time', async () => {
    await dorme(800);
    for (let i = 0; i < FORMACAO.length; i++) {
      const antes = (await aliados()).length;
      await invocar(); await dorme(900); await faxina();
      const a = await aliados(); if (a.length <= antes) continue;
      await arrastar(a[a.length - 1], celula(cv, ...FORMACAO[i]), 25); await dorme(1300);
    }
    await segurar(5);
  }, null, OUT_S);
}

// velocidade 5x: ondas passando rapido com o time cheio
if (cenaS('s-5x')) {
  await entrar('STANDARD', '?onda=16&muralha=1&ouro=9000');
  await montarTime(10); await espalhar(); await velocidade(5);
  await gravar('s-5x', () => segurar(22), null, OUT_S);
}

// passeio pelos 5 atos: 5 s de batalha em cada arena (junta num video so)
if (cenaS('s-atos')) {
  const ATOS = ['ACT I', 'ACT II', 'ACT III', 'ACT IV', 'ACT V'];
  await page.evaluate(() => { for (let n = 2; n <= 5; n++) localStorage.setItem(`grimhold_act${n}_unlocked`, 'true'); });
  const partes = [];
  for (const [i, ato] of ATOS.entries()) {
    await entrar('STANDARD', '?onda=6&muralha=1&ouro=4000', null, ato);
    await montarTime(5); await espalhar(); await velocidade(1);
    for (let k = 0; k < 20; k++) { await faxina(); await dorme(500); if ((await inimigosX()).length >= 6) break; }
    await gravar(`_ato${i + 1}`, () => segurar(5), null, OUT_S);
    partes.push(`file '_ato${i + 1}.mp4'`);
  }
  fs.writeFileSync(path.join(OUT_S, '_atos.txt'), partes.join('\n'));
  execFileSync(FF, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', '_atos.txt', '-c', 'copy', 's-atos.mp4'], { cwd: OUT_S });
  for (let i = 1; i <= 5; i++) { fs.rmSync(path.join(OUT_S, `_ato${i}.mp4`), { force: true }); fs.rmSync(path.join(OUT_S, `_ato${i}.png`), { force: true }); }
  fs.rmSync(path.join(OUT_S, '_atos.txt'), { force: true });
  console.log('clipe: s-atos (5 atos)');
}

console.log('erros', erros.slice(0, 5));
await browser.close(); await vite.close();
