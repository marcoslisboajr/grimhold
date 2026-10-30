// ══════════════════════════════════════════════════════════════════════
// i18n-leaks.mjs — acha texto em inglês CRAVADO em posição de JSX.
//
// Por que existe: o i18n-scan.mjs pega toda string literal do arquivo e
// afoga o achado em ruído (nome de seção, classe CSS, id...). Este aqui
// parseia o arquivo com o Babel e olha só onde o jogador de fato LÊ:
// os nós JSXText, ou seja, o texto entre as tags.
//
// Foi escrito depois de 13 vazamentos terem passado por todas as outras
// checagens — a tela de Seleção de Ato inteira, os rótulos de raridade,
// "THE FORGE", "(need 40)", "40 Essence". Regex em linha não dá conta
// porque JSX quebra em várias linhas e mistura texto com expressão.
//
// Uso:  node scripts/i18n-leaks.mjs [arquivo...]
//       (sem argumento roda no GameCanvas + componentes vivos)
// ══════════════════════════════════════════════════════════════════════
import fs from 'node:fs';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';

const traverse = _traverse.default ?? _traverse;

const ALVOS_PADRAO = [
  'components/GameCanvas.tsx',
  'components/CharacterEndingScreen.tsx',
  'components/ModeSelectOverlay.tsx',
  'components/LanguageSelect.tsx',
  'components/panels/RunHistoryPanel.tsx',
  'components/panels/SkillTreePanel.tsx',
  'components/panels/WaveSummaryOverlay.tsx',
  'components/panels/BattlePassPanel.tsx',
  // primitivas compartilhadas: o ModeSelectOverlay usa, entao e codigo vivo
  'components/primitives.tsx',
];

// Texto que é legítimo aparecer cru na tela e NÃO deve ser traduzido.
const PERMITIDOS = [
  /^GRIMHOLD$/i,
  /^TOWER DEFENSE ROGUELIKE$/i,
  /^ESS$/,                 // símbolo da moeda, igual em todo idioma
  /^[IVX]+$/,              // algarismo romano (Ato I, II...)
  /^[^\p{L}]*$/u,          // sem nenhuma letra: número, seta, bullet, pontuação

  // ── Créditos ──
  // O GLOSSARIO.md proíbe traduzir: nome de pessoa, de estúdio, de obra e
  // URL. Traduzir quebra a atribuição exigida pelas licenças dos assets.
  // Os RÓTULOS em volta ("Arte", "Música") são chave i18n normal — só o
  // nome em si fica cru.
  /^Marcos Antonio Lisboa Junior$/,
  /^Final Boss Blues$/,
  /^Eric Matyas$/,
  /^Mixkit$/,
  /^"Ancient Crusades"$/,
  /^"Tower Defense"$/,
  /^[a-z0-9.-]+\.(com|org|co|net|io)(\/\S*)?$/i,   // URL de crédito

  // ── Ferramentas de debug ──
  // Botões que só renderizam em localhost (marcados "remove before
  // release") e o medidor de quadro do F3. São ferramenta de
  // desenvolvimento, não texto que o jogador lê no fluxo normal.
  /^WIN$/,
  /^\+\d+W$/,           // pular ondas: +5W, +10W, +25W
  /^\+\d+ PROJ$/,       // encher a tela de projéteis
  /^medindo\.\.\.$/,     // medidor F3 antes da primeira amostra

  // Opção de Intl.DateTimeFormat / toLocaleString, não texto de tela.
  /^(2-digit|numeric|long|short|narrow)$/,
];

const ehPermitido = (t) => PERMITIDOS.some((re) => re.test(t));
const temPalavra  = (t) => /[A-Za-z]{3,}/.test(t);

function achar(arquivo) {
  const fonte = fs.readFileSync(arquivo, 'utf8');
  const ast = parse(fonte, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
    errorRecovery: true,
  });

  const achados = [];
  const dentroDeTrans = (caminho) =>
    !!caminho.findParent((p) => p.isJSXElement() && p.node.openingElement.name.name === 'Trans');

  // o mesmo nó é visitado mais de uma vez quando há {...} dentro de {...}
  const vistos = new Set();
  const registrar = (caminho, txt) => {
    if (!txt || !temPalavra(txt) || ehPermitido(txt)) return;
    if (dentroDeTrans(caminho)) return;   // aí o texto cru é o default da chave
    const linha = caminho.node.loc.start.line;
    const id = `${linha}|${txt}`;
    if (vistos.has(id)) return;
    vistos.add(id);
    achados.push({ linha, txt });
  };

  traverse(ast, {
    // 0. string passada a uma funcao que MOSTRA texto: setXxxToast('...'),
    //    window.confirm('...'), alert('...'). Nao e JSX, entao os visitantes
    //    abaixo nao veem. Foi por aqui que 15 strings escaparam de toda a
    //    migracao (achadas no teste da demo: "ETERNAL FLAME — The ground
    //    burns beneath your feet!" no chefe do Ato I, em portugues).
    CallExpression(caminho) {
      const callee = caminho.node.callee;
      const nome = callee.type === 'Identifier' ? callee.name
        : callee.type === 'MemberExpression' && callee.property.type === 'Identifier' ? callee.property.name
        : '';
      if (!/^(set\w*Toast|confirm|alert|prompt)$/.test(nome)) return;
      for (const arg of caminho.node.arguments) {
        // string direta, ou o primeiro pedaco de uma concatenacao 'a' + x + 'b'
        let no = arg;
        while (no.type === 'BinaryExpression' && no.operator === '+') no = no.left;
        if (no.type !== 'StringLiteral') continue;
        registrar({ node: no, findParent: () => null }, no.value.trim());
      }
    },

    // 1. texto solto entre as tags:  <span>Locked</span>
    JSXText(caminho) {
      registrar(caminho, caminho.node.value.replace(/\s+/g, ' ').trim());
    },

    // 2. string dentro de {...} que é FILHO de uma tag — ou seja, renderizada:
    //    {remaining === 0 ? 'Wave Clear' : 'Enemies'}
    //    Atributo (className="...") não entra aqui porque o pai dele é
    //    JSXAttribute, não JSXElement.
    JSXExpressionContainer(caminho) {
      if (!caminho.parentPath.isJSXElement() && !caminho.parentPath.isJSXFragment()) return;
      caminho.traverse({
        StringLiteral(s) {
          // Dentro do container tem JSX aninhado, e JSX aninhado tem
          // className/style/onClick — nada disso é texto de tela. Corta
          // tudo que estiver debaixo de um atributo.
          if (s.findParent((p) => p.isJSXAttribute())) return;
          const pai = s.parentPath;
          // argumento de t()/tList() já é chave i18n, não vazamento — inclusive
          // quando vem por ternário: t(n === 1 ? 'a.b' : 'a.c', {...})
          const chamadaT = s.findParent(
            (p) => p.isCallExpression() && /^(t|tList|hasKey)$/.test(p.node.callee.name ?? '')
          );
          if (chamadaT) return;
          // nome de propriedade de objeto não é texto ({ meteor: ... })
          if (pai.isObjectProperty() && pai.node.key === s.node) return;
          // comparação (x === 'act2') é lógica, não texto
          if (pai.isBinaryExpression() || pai.isSwitchCase()) return;
          // argumento de String/Array (startsWith, includes, split...) é id
          if (pai.isCallExpression() && pai.node.callee.type === 'MemberExpression') return;

          const txt = s.node.value.trim();
          // cor, gradiente, unidade CSS
          if (/^#[0-9a-f]{3,8}$/i.test(txt)) return;
          if (/^(linear|radial|conic)-gradient|^(rgba?|hsla?|var|calc|url)\(/i.test(txt)) return;
          // lista de classe (Tailwind): TODO token no formato de classe.
          // "bg-gradient-to-b from-slate-900" sai; "Wave Clear" fica.
          const ehTokenCss = (tk) =>
            tk.includes(':') || tk.includes('[') ||
            /^-?[a-z][a-z0-9]*(-[a-z0-9.]+)*(\/[0-9]+)?$/.test(tk);
          if (txt.split(/\s+/).every(ehTokenCss)) return;
          // identificador de uma palavra só: 'dragon_lord', 'semiRare',
          // 'new-frost_warden'. Texto de tela de uma palavra começa com
          // maiúscula ('Meteor') ou é todo maiúsculo ('MAX').
          if (!/\s/.test(txt) && (txt.includes('_') || /^[a-z].*[A-Z]/.test(txt))) return;

          registrar(s, txt);
        },
      });
    },
  });
  return achados;
}

const alvos = process.argv.slice(2).length ? process.argv.slice(2) : ALVOS_PADRAO;
let total = 0;

for (const arquivo of alvos) {
  if (!fs.existsSync(arquivo)) { console.log(`(pulei, não existe: ${arquivo})`); continue; }
  const achados = achar(arquivo);
  total += achados.length;
  if (!achados.length) { console.log(`✓ ${arquivo}`); continue; }
  console.log(`\n⚠ ${arquivo} — ${achados.length} vazamento(s):`);
  for (const a of achados) console.log(`   ${String(a.linha).padStart(6)}  ${a.txt}`);
}

console.log(total ? `\n${total} vazamento(s) no total.` : '\n✓ Nenhum texto cravado em posição de JSX.');
process.exit(total ? 1 : 0);
