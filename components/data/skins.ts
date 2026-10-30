// ══════════════════════════════════════════════════════════════════════
// data/skins.ts — skins dos heróis (montadas em paperdoll, ver docs/SKINS.html)
//
// Sprite: public/sprites/skins/<id>.png, mesmo canvas 68x92 dos heróis (Ixara: 73x102, o tamanho do sprite base dela).
// O nome vem do i18n do ícone de perfil correspondente ('avatar.skin_<id>.name').
// Compradas com essência; a equipada vale em todo lugar que usa CharacterSprite
// (seleção, codex, campo de batalha).
//
// Estado no storage (não no perfil) porque CharacterSprite lê fora do
// GameCanvas: 'grimhold_skins' (ids comprados) e 'grimhold_skin_equip'
// ({ tipoDoHeroi: idDaSkin }).
// ══════════════════════════════════════════════════════════════════════
import { useSyncExternalStore } from 'react';
import { storage } from '../systems/storage';

export const PRECO_SKIN = 400;

/** tipo do herói -> ids das skins (id = nome do arquivo em public/sprites/skins) */
export const SKINS: Record<string, string[]> = {
  mage: ['mage__aprendiz_rubro', 'mage__erudito_de_jade', 'mage__chama_de_papel', 'mage__mago_errante'],
  archer: ['archer__cacadora', 'archer__cavaleira_da_estepe', 'archer__arqueira_de_luto'],
  paladin: ['paladin__cavaleiro_azul', 'paladin__cruzado_dourado', 'paladin__vigilia_de_luto', 'paladin__cavaleiro_do_lago'],
  berserker: ['berserker__brigao', 'berserker__saqueador', 'berserker__furia_da_savana', 'berserker__barbaro_das_terras_frias'],
  necromancer: ['necromancer__capuz_negro', 'necromancer__coveiro', 'necromancer__embalsamador_de_neferu', 'necromancer__rei_do_tumulo_gelado'],
  cleric: ['cleric__voto_branco', 'cleric__voto_das_lanternas', 'cleric__mestra_do_voto', 'cleric__donzela_do_cerco'],
  dreadlord: ['dreadlord__sentinela_negro', 'dreadlord__couraca_da_savana', 'dreadlord__senhor_mestre'],
  druid: ['druid__andarilha', 'druid__druida_da_savana', 'druid__guardia_de_jade'],
  frost_warden: ['frost_warden__guarda_do_inverno', 'frost_warden__cavaleiro_de_gelo', 'frost_warden__guardiao_mestre', 'frost_warden__sombra_da_nevasca'],
  priest: ['hyo__peregrina', 'hyo__sacerdotisa_de_jade', 'hyo__noite_das_lanternas'],
  inquisitor: ['inquisitor__juiz_de_aco', 'inquisitor__inquisidor_desonrado', 'inquisitor__juiz_dourado', 'inquisitor__cacador_do_crepusculo'],
  runesmith: ['runesmith__andarilho_runico', 'runesmith__forjador_da_savana', 'runesmith__gravador_de_neferu'],
  warlock: ['warlock__capuz_do_vazio', 'warlock__manto_violeta', 'warlock__capuz_de_luto'],
  vex: ['vex__assassina', 'vex__lamina_de_jade', 'vex__mascara_de_papel'],
  sylvanite: ['sylvanite__folha_nova', 'sylvanite__batedora_do_bosque', 'sylvanite__folha_dourada'],
  jester: ['jester__saltimbanco', 'jester__bobo_de_luto', 'jester__arlequim_de_jade'],
  bard: ['bard__menestrel', 'bard__mercador_de_cancoes', 'bard__cantor_das_lanternas'],
  morrigan: ['morrigan__viuva_palida', 'morrigan__bruxa_mestra', 'morrigan__viuva_de_neferu'],
  zylvara: ['zylvara__oraculo_azul', 'zylvara__vidente', 'zylvara__oraculo_de_neferu'],
  yue: ['yue__ensaio', 'yue__tunica_de_palco', 'yue__noite_das_lanternas'],
  ixara: ['ixara__chama_de_gelo', 'ixara__furia_dourada', 'ixara__furia_sombria', 'ixara__tentadora_infernal'],
  billy: ['billy__capitao', 'billy__mercador', 'billy__noite_de_estreia', 'billy__andarilho_do_poente'],
};

const K_DONO = 'grimhold_skins';
const K_EQUIP = 'grimhold_skin_equip';
function ler<T>(k: string, pad: T): T { try { const v = storage.get(k); return v ? JSON.parse(v) as T : pad; } catch { return pad; } }

let dono: string[] = ler<string[]>(K_DONO, []);
let equip: Record<string, string> = ler<Record<string, string>>(K_EQUIP, {});
let versao = 0;
const ouvintes = new Set<() => void>();
const avisa = () => { versao++; ouvintes.forEach(f => f()); };

export const temSkin = (id: string) => dono.includes(id);
export const skinEquipada = (tipo: string): string | undefined => {
  const id = equip[tipo];
  return id && dono.includes(id) ? id : undefined;
};
export const comprarSkin = (id: string) => {
  if (dono.includes(id)) return;
  dono = [...dono, id]; storage.set(K_DONO, JSON.stringify(dono)); avisa();
};
/** id undefined = volta pro visual original */
export const equiparSkin = (tipo: string, id?: string) => {
  const novo = { ...equip }; if (id) novo[tipo] = id; else delete novo[tipo];
  equip = novo; storage.set(K_EQUIP, JSON.stringify(equip)); avisa();
};

/** re-renderiza quem usa quando compra/equipa muda */
export const useSkins = () => useSyncExternalStore(
  (f) => { ouvintes.add(f); return () => { ouvintes.delete(f); }; },
  () => versao,
);
