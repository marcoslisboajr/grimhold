import { test } from 'node:test';
import assert from 'node:assert/strict';
import { heroisSilhueta, STEAM_STORE_URL } from '../components/systems/wishlist';

test('wishlist: silhuetas excluem liberados e o heroi secreto', () => {
  const r = heroisSilhueta(['mage', 'archer', 'vex', 'malachar_human', 'billy'], ['mage', 'archer']);
  assert.deepEqual(r, ['vex', 'billy']);
  assert.ok(!r.includes('malachar_human'));
});

test('wishlist: loja aponta pro App ID do jogo completo', () => {
  assert.match(STEAM_STORE_URL, /store\.steampowered\.com\/app\/5187440\//);
});
