// ══════════════════════════════════════════════════════════════════════
// previa-efeitos-todas.mjs — folha de contato dos efeitos de magia, UM PNG POR HEROI.
// Sobe um Vite proprio (porta 3100), joga o Ato I com cada heroi (?muralha=1: muralha imortal, so previa)
// e, SO NESTA PAGINA, liga as tags de arvore do heroi (e as condicoes: acumulos, Furia, almas, HP baixo)
// pelo ref do React. Tira quadros por ~30s e guarda o que tiver mais efeitos na camada.
// Se o jogo nao disparar nenhum efeito no tempo, faz a VITRINE ENCENADA: chama as mesmas linhas de
// efeito (window.__efeitos, so em DEV) sobre inimigos reais e salva <heroi>-encenado.png.
// Saida: release-demo/previa-efeitos/todas/  |  Uso: node scripts/previa-efeitos-todas.mjs [heroi...]
// ══════════════════════════════════════════════════════════════════════
import { chromium } from 'playwright';
import { createServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'release-demo/previa-efeitos/todas';
fs.mkdirSync(OUT, { recursive: true });

// tipo: { arq (sprite do card), onda, tags, extra (JS no heroi a cada tique), encena (vitrine) }
const H = {
  archer:      { tags: ['archer_last_stand'], encena: `E.sobre(en[0],'fogo'); E.sobre(en[1]??en[0],'fogo')` },
  warlock:     { tags: ['warlock_void_prison', 'warlock_void_portal'], extra: `for (const e of W.inimigos) e._warlockDebuffStacks = 3;`,
                 encena: `E.chao(cx(en[0]), en[0].position.y+en[0].height, 70, 'sombra', 3000); E.sobre(en[0],'sombra'); E.sobre(en[1]??en[0],'sombra')` },
  druid:       { tags: ['druid_eternal_winter', 'druid_wildfire', 'druid_cycle_pulse'],
                 encena: `const p=pos(); E.area(p.x,p.y,220,'veneno',600); en.slice(0,4).forEach(e=>E.sobre(e,'luz',1)); E.sobre(en[0],'fogo'); E.sobre(en[1]??en[0],'gelo',1)` },
  necromancer: { tags: [], encena: `` },
  cleric:      { tags: ['cleric_judgment', 'cleric_smite', 'cleric_fallen_seraph'],
                 encena: `const a=en[0], b=en[1]??en[0]; E.feixe(cx(a),cy(a),cx(b),cy(b),'sagrado',600); E.sobre(b,'luz',1); E.sobre(a,'luz'); const p=pos(); E.explosao(p.x,p.y,'luz',1)` },
  paladin:     { onda: 20, tags: ['paladin_divine_charge', 'paladin_avatars_oath'], extra: `h.perks = { ...(h.perks??{}), divineCalderaStacks: 3 };`,
                 encena: `const p=pos(); E.tremor(4,300); E.area(p.x,p.y,120,'sagrado',600); en.slice(0,8).forEach(e=>E.sobre(e,'luz')); E.explosao(p.x,p.y,'luz')` },
  priest:      { onda: 5, arq: 'hyo', tags: ['priest_miracle_worker'], encena: `const p=pos(); E.explosao(p.x,p.y,'luz')` },
  bard:        { tags: ['bard_death_metal', 'bard_battle_cry'],
                 encena: `const p=pos(); E.area(p.x,p.y,260,'sagrado',700); E.explosao(p.x,p.y,'luz'); E.area(cx(en[0]),cy(en[0]),80,'fogo',500); E.sobre(en[0],'fogo')` },
  runesmith:   { tags: ['rune_storm_omega'],
                 encena: `en.slice(1,6).forEach(e=>{E.feixe(cx(en[0]),cy(en[0]),cx(e),cy(e),'gelo',600); E.sobre(e,'gelo',1)})` },
  sylvanite:   { tags: ['sylva_world_poison'], extra: `h.perks = { ...(h.perks??{}), sylvaWorldTree: true };`,
                 encena: `en.slice(0,6).forEach(e=>E.chao(cx(e), e.position.y+e.height, 36, 'veneno', 2500))` },
  dreadlord:   { tags: ['dread_dark_nova', 'dread_apocalyptic_tide'], extra: `h._voidHarvestStacks = 10; h._sk_apocUsed = false;`,
                 encena: `E.area(cx(en[0]),cy(en[0]),150,'sombra',600); E.sobre(en[0],'sombra'); en.slice(1,6).forEach(e=>E.sobre(e,'sombra'))` },
  jester:      { tags: ['jester_pandemonium', 'jester_grand_chaos'],
                 encena: `en.slice(0,8).forEach((e,i)=>E.sobre(e,i%2?'luz':'sombra'))` },
  vex:         { tags: [], encena: `` },
  zylvara:     { tags: ['zylv_void_stalker', 'zylv_apex_predator'],
                 encena: `E.sobre(en[0],'sombra'); const p=pos(); E.explosao(p.x,p.y,'sombra',1)` },
  morrigan:    { tags: ['morri_soul_storm', 'morri_ascendant_witch'], extra: `h._morriSouls = 10;`,
                 encena: `E.area(cx(en[0]),cy(en[0]),200,'sombra',700); en.slice(0,5).forEach(e=>E.sobre(e,'sombra')); const p=pos(); E.explosao(p.x,p.y,'sombra',1)` },
  ixara:       { tags: ['ixara_supernova', 'ixara_demon_unleashed'], extra: `h.perks = { ...(h.perks??{}), furyStacks: 10 };`,
                 encena: `E.area(cx(en[0]),cy(en[0]),200,'fogo',700); E.sobre(en[0],'fogo'); const p=pos(); E.explosao(p.x,p.y,'fogo',1)` },
  berserker:   { tags: ['berserker_howl', 'berserker_warlord_incarnate'], extra: `h.hp = Math.max(1, Math.round(h.maxHp * 0.15));`,
                 encena: `E.area(cx(en[0]),cy(en[0]),120,'fogo',600); const p=pos(); E.explosao(p.x,p.y,'fogo'); E.area(p.x,p.y,60,'fogo',700)` },
  frost_warden:{ tags: ['frost_warden_absolute_zero'],
                 encena: `E.chao(cx(en[0]),cy(en[0]),100,'gelo',3000); E.sobre(en[0],'gelo')` },
  inquisitor:  { tags: ['inquisitor_execution_order', 'inquisitor_divine_purge'],
                 encena: `const a=en[0]; E.feixe(cx(a),a.position.y-120,cx(a),cy(a),'sagrado',600); E.sobre(a,'luz'); const p=pos(); E.explosao(p.x,p.y,'luz',1)` },
  malachar_human: { arq: 'Malachar', tags: ['mal_forma_final'], encena: `en.slice(0,4).forEach(e=>E.sobre(e,'sombra',1))` },
  yue:         { tags: ['yue_encore'], encena: `const p=pos(); E.explosao(p.x,p.y,'luz'); E.area(p.x,p.y,60,'sagrado',700)` },
  billy:       { tags: ['billy_cortina_3', 'billy_quinto'], encena: `const p=pos(); E.explosao(p.x+20,p.y,'gelo',1); E.explosao(p.x+20,p.y+20,'fogo',1)` },
};
const ALVO = process.argv.slice(2);
const lista = Object.keys(H).filter(k => !ALVO.length || ALVO.includes(k));

const vite = await createServer({ server: { port: 3100, strictPort: true }, logLevel: 'error', cacheDir: 'node_modules/.vite-previa-efeitos' });
await vite.listen();
const URL = 'http://localhost:3100';
const browser = await chromium.launch({ args: ['--mute-audio'] });
const resultado = {};

for (const tipo of lista) {
  const cfg = H[tipo];
  const page = await (await browser.newContext({ viewport: { width: 1400, height: 860 } })).newPage();
  const erros = []; page.on('pageerror', e => erros.push(e.message));
  const dorme = (ms) => page.waitForTimeout(ms);
  const clickTxt = (re) => page.evaluate((src) => { const r = new RegExp(src); const b = [...document.querySelectorAll('button')].find(x => r.test(x.innerText.trim())); if (b) { b.click(); return true; } return false; }, re);
  const pular = async () => { for (let i = 0; i < 5; i++) { if (!(await clickTxt('^PULAR'))) return; await dorme(250); } };
  const r = { tipo };
  try {
    await page.goto(URL + '/');
    await page.evaluate((t) => { localStorage.setItem('arcane_unlocks', JSON.stringify([t])); }, tipo);
    await page.goto(URL + `/?onda=${cfg.onda ?? 6}&muralha=1`); await dorme(1500);
    const input = page.locator('input').first();
    if (await input.isVisible().catch(() => false)) { await input.fill('Previa'); await page.locator('button', { hasText: /INICIAR/i }).first().click(); await dorme(400); }
    await page.locator('button', { hasText: /^COMEÇAR/ }).first().click(); await dorme(400);
    await page.locator('button', { hasText: /ESCOLHA SUA DIFICULDADE/ }).first().click(); await dorme(400);
    await page.locator('text=/^NORMAL$/').first().click({ force: true }); await dorme(700);
    await pular();
    const card = page.locator(`img[src*="/allies/${cfg.arq ?? tipo}.png"]`).first();
    r.card = await card.count();
    if (r.card) { await card.click({ force: true }).catch(() => {}); await dorme(200); }
    for (let i = 0; i < 8; i++) {
      await pular();
      if (await page.locator('button[title$="x Speed"]').count()) break;
      if (!(await clickTxt('^Ato I(?!I|V)'))) await clickTxt('^JOGAR'); await dorme(900);
    }
    // liga tags/condicoes no heroi (allies[0]) a cada tique — so previa
    const tique = () => page.evaluate(([tags, extra]) => {
      const w = window;
      const acha = (teste) => {
        const raiz = document.getElementById('root'); const k = Object.keys(raiz).find(k => k.startsWith('__reactContainer'));
        const pilha = [raiz[k]]; let n = 0;
        while (pilha.length && n++ < 200000) {
          const f = pilha.pop(); if (!f) continue;
          let h = f.memoizedState;
          while (h) { const c = h.memoizedState?.current; if (teste(c)) return h.memoizedState; h = h.next; }
          if (f.child) pilha.push(f.child); if (f.sibling) pilha.push(f.sibling);
        }
        return null;
      };
      w.__refJogador = w.__refJogador ?? acha(c => c && Array.isArray(c.allies) && 'gold' in c);
      w.__refInimigos = w.__refInimigos ?? acha(c => Array.isArray(c) && c.length && c[0]?.position && 'maxHp' in c[0] && !('gridPosition' in c[0]) && 'speed' in c[0]);
      const h = w.__refJogador?.current?.allies?.[0];
      if (!h) return 'sem heroi';
      h._skillTags = new Set(tags);
      const W = { inimigos: (w.__refInimigos?.current ?? []) };
      try { new Function('h', 'W', extra)(h, W); } catch (e) { return String(e); }
      return h.type;
    }, [cfg.tags, cfg.extra ?? '']);
    const conta = () => page.evaluate(() => document.querySelectorAll('[data-camada="efeitos-magias"] > *').length);
    let melhor = 0;
    for (let t = 0, k = 0; t < 30000 && cfg.tags.length; t += 150, k++) {
      if (k % 4 === 0) {
        r.heroi = await tique();
        await page.evaluate(() => { document.querySelector('.upg-card')?.click(); const o = [...document.querySelectorAll('[data-testid="encontro-opcao"]')].filter(b => !b.disabled); if (o.length) o[o.length - 1].click(); });
      }
      const n = await conta();
      if (n > melhor) { melhor = n; await page.screenshot({ path: path.join(OUT, `${tipo}.png`) }); }
      await dorme(150);
    }
    r.efeitosJogo = melhor;
    if (!melhor && cfg.encena) {
      r.encenado = await page.evaluate((cod) => {
        const E = window.__efeitos; if (!E) return 'sem __efeitos';
        const en = (window.__refInimigos?.current ?? []).filter(e => e.hp > 0);
        if (!en.length) return 'sem inimigos';
        const h = window.__refJogador?.current?.allies?.[0];
        const cx = (e) => e.position.x + e.width / 2, cy = (e) => e.position.y + e.height / 2;
        const pos = () => { const el = document.querySelector('img[src*="/allies/"]'); const cv = document.querySelector('[data-camada="efeitos-magias"]')?.parentElement; if (!el || !cv) return { x: 120, y: 450 }; const a = el.getBoundingClientRect(), b = cv.getBoundingClientRect(); const k = b.width / cv.offsetWidth; return { x: (a.x + a.width / 2 - b.x) / k, y: (a.y + a.height / 2 - b.y) / k }; };
        new Function('E', 'en', 'h', 'cx', 'cy', 'pos', cod)(E, en, h, cx, cy, pos);
        return 'ok';
      }, cfg.encena);
      await dorme(250);
      await page.screenshot({ path: path.join(OUT, `${tipo}-encenado.png`) });
    }
  } catch (e) { r.erro = String(e).slice(0, 200); }
  r.pageerror = erros.length;
  resultado[tipo] = r; console.log(JSON.stringify(r));
  await page.context().close();
}
fs.writeFileSync(path.join(OUT, 'resultado.json'), JSON.stringify(resultado, null, 2));
await browser.close(); await vite.close();
