import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { MORTOS_VIVOS, DEMONIOS, ehMortoVivo, ehDemonio, ehProfano } from '../components/data/profanos';
import { UNDEAD_TYPES } from '../components/data/allies';

const raiz = process.env.GRIM_RAIZ ?? process.cwd();
const pt = JSON.parse(fs.readFileSync(path.join(raiz, 'i18n/locales/pt-BR.json'), 'utf8')) as Record<string, string>;

test('toda entrada da classificacao e um tipo com nome no jogo', () => {
  for (const tipo of [...MORTOS_VIVOS, ...DEMONIOS]) {
    const conhecido = pt[`enemy.${tipo}.name`] || pt[`ui.actSelect.boss.${tipo}`] || pt[`bestiary.${tipo}.name`];
    assert.ok(conhecido, `tipo desconhecido: ${tipo}`);
  }
});

test('mortos-vivos e demonios nao se sobrepoem', () => {
  for (const tipo of MORTOS_VIVOS) assert.ok(!DEMONIOS.has(tipo), tipo);
});

test('mortos-vivos dos Atos V-X contam', () => {
  for (const t of ['esqueleto6', 'esqueleto6_escudo', 'lich6', 'lich6_dourado', 'lich5', 'lich_colegiado', 'mumia', 'legiao_c',
    'cranio_d', 'general_ossos', 'cranio_ancestral', 'death_knight', 'afogado', 'capitao_afogado', 'lanterna']) {
    assert.ok(ehMortoVivo(t), t); assert.ok(ehProfano(t), t);
  }
  for (const t of ['skeleton', 'lich', 'mummy', 'vampire_lord', 'grim_reaper']) assert.ok(ehMortoVivo(t), t);
});

test('demonios legados e dos atos novos contam', () => {
  for (const t of ['void_stalker', 'lord_demon', 'demon_eyes', 'lesser_demon', 'void_herald', 'warlock_shade', 'imp', 'devil',
    'demon', 'infernatil', 'ghazbaran', 'zathroth', 'malachar', 'anjo_caido', 'serafim_caido', 'cerbero_alfa']) {
    assert.ok(ehDemonio(t), t); assert.ok(ehProfano(t), t); assert.ok(!ehMortoVivo(t), t);
  }
});

test('humanos, bestas e vazios nao contam', () => {
  for (const t of ['goblin', 'orc', 'cultista_vermelho', 'soldado_ashfen', 'corrupt_paladin', 'sapo', 'kraken', 'celula', 'acaro_azul', undefined, null, '']) {
    assert.equal(ehProfano(t as string), false, String(t));
  }
});

test('UNDEAD_TYPES (Clériga) e a mesma lista de mortos-vivos', () => {
  assert.equal(UNDEAD_TYPES, MORTOS_VIVOS);
});
