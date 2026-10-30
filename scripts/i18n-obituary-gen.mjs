// ══════════════════════════════════════════════════════════════════════
// Gera as traduções de ui.obituary.* reaproveitando o que já existe.
//
// O obituário (MVP / nêmesis no fim da run) tem um mapa próprio de nomes
// que repete coisas já traduzidas em ui.class.*, enemy.*.name e
// ui.actSelect.boss.*. Reescrever à mão daria dois nomes diferentes pro
// mesmo bicho — que é exatamente o que o GLOSSARIO manda evitar.
//
// Regra de busca, em ordem:
//   1. mesma chave semântica (ui.class.<id>, enemy.<id>.name)
//   2. qualquer chave já traduzida cujo INGLÊS seja idêntico
//   3. sobra pro humano — sai listado no fim
//
// Uso: node scripts/i18n-obituary-gen.mjs <locale>
// ══════════════════════════════════════════════════════════════════════
import fs from 'node:fs';

const locale = process.argv[2];
if (!locale) { console.error('uso: node scripts/i18n-obituary-gen.mjs <pt-BR|zh-CN>'); process.exit(1); }

const en  = JSON.parse(fs.readFileSync('i18n/locales/en.json', 'utf8'));
const loc = JSON.parse(fs.readFileSync(`i18n/locales/${locale}.json`, 'utf8'));

const saida = {};
const semFonte = [];

function traduzido(chave) {
  return chave && loc[chave] ? loc[chave] : null;
}

// procura qualquer chave já traduzida com exatamente o mesmo inglês
function porTextoIgual(txt, ignorar) {
  for (const k of Object.keys(en)) {
    if (k === ignorar || k.startsWith('ui.obituary.')) continue;
    if (en[k] === txt && loc[k]) return loc[k];
  }
  return null;
}

for (const chave of Object.keys(en)) {
  if (!chave.startsWith('ui.obituary.')) continue;
  if (loc[chave]) continue;                       // já traduzido, não mexe
  const [, , tipo, id] = chave.split('.');
  const ingles = en[chave];

  const preferida = tipo === 'ally' ? `ui.class.${id}` : `enemy.${id}.name`;
  let valor = null;

  // 1. mesma chave semântica — só serve se o inglês bater, senão viraria
  //    outro nome (ex.: enemy.goblin_king.name é "Zog'Krix", não "Goblin King")
  if (en[preferida] === ingles) valor = traduzido(preferida);
  // 2. qualquer chave com o mesmo inglês
  if (!valor) valor = porTextoIgual(ingles, chave);
  // 3. nome próprio em alfabeto latino continua igual nos 3 idiomas
  if (!valor && /^[A-Z][A-Za-z'’]*$/.test(ingles) && !/^(The|Orc|Demon|Dragon|Vampire|Minotaur|Goblin|Skeleton|Ghoul|Lich|Mummy|Cyclops|Ogre|Hydra|Beholder|Wraith|Banshee|Archer|Mage|Warlock|Druid|Bard|Cleric|Paladin|Jester|Necro)$/.test(ingles)) {
    valor = ingles;
  }

  if (valor) saida[chave] = valor;
  else semFonte.push(`${chave} = ${JSON.stringify(ingles)}`);
}

const destino = `traducoes/${locale === 'pt-BR' ? 'ptbr' : 'zhcn'}-obituary.json`;
fs.writeFileSync(destino, JSON.stringify(saida, null, 2) + '\n');
console.log(`${destino}: ${Object.keys(saida).length} chaves reaproveitadas`);
if (semFonte.length) {
  console.log(`\n${semFonte.length} sem fonte — traduzir à mão:`);
  semFonte.forEach(l => console.log('  ' + l));
}
