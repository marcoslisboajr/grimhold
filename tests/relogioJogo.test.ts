import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Timers de jogo usam o relogio do jogo (virtualTimeRef/timestamp): pausa e velocidade valem.
const raiz = process.env.GRIM_RAIZ ?? process.cwd();
const src = fs.readFileSync(path.join(raiz, 'components/GameCanvas.tsx'), 'utf8');

test('nenhum prazo de jogo e montado com Date.now() + ms', () => {
  assert.equal(/Date\.now\(\)\s*\+\s*\d/.test(src), false);
});

test('nenhuma comparacao "Date.now() < campoUntil" (Indomavel e afins)', () => {
  assert.equal(/Date\.now\(\)\s*[<>]=?\s*\(?\s*[\w.()]*(Until|Expiry)/.test(src), false);
  assert.equal(/(Until|Expiry)\s*[<>]=?\s*Date\.now\(\)/.test(src), false);
});

test('o laco do jogo mede o tempo pelo timestamp virtual', () => {
  assert.ok(src.includes('const now = timestamp;'));
  assert.equal(/const gameLoop[\s\S]{0,600}const now = Date\.now\(\)/.test(src), false);
});
