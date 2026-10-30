import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { SKINS } from '../components/data/skins';

const RAIZ = process.env.GRIM_RAIZ ?? process.cwd();
const ids = Object.values(SKINS).flat();

test('skins: todo id tem sprite e retrato de perfil', () => {
  for (const id of ids) {
    assert.ok(fs.existsSync(path.join(RAIZ, 'public/sprites/skins', id + '.png')), `sprite de ${id}`);
    assert.ok(fs.existsSync(path.join(RAIZ, 'public/ui/pixel/avatars', 'skin_' + id + '.png')), `retrato de ${id}`);
  }
});

test('skins: todo id tem nome nos 3 idiomas', () => {
  for (const loc of ['pt-BR', 'en', 'zh-CN']) {
    const d = JSON.parse(fs.readFileSync(path.join(RAIZ, 'i18n/locales', loc + '.json'), 'utf8'));
    for (const id of ids) assert.ok(d[`avatar.skin_${id}.name`], `${loc}: nome de ${id}`);
  }
});

test('skins: ids sem repeticao', () => {
  assert.equal(new Set(ids).size, ids.length);
});
