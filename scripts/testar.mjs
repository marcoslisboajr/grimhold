// testar.mjs — roda os testes de tests/**/*.test.ts sem dependencia nova:
// esbuild empacota cada teste (resolve TS e imports do jogo) e o node:test roda.
// Uso: npm test            (todos)   |   npm test -- atos   (so os que tem "atos" no caminho)
import { buildSync } from 'esbuild';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const filtro = process.argv[2] || '';
const acha = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? acha(path.join(d, e.name)) : e.name.endsWith('.test.ts') ? [path.join(d, e.name)] : []);
const testes = acha('tests').filter(f => f.includes(filtro));
const saida = path.join('node_modules', '.cache', 'testes');
fs.rmSync(saida, { recursive: true, force: true }); fs.mkdirSync(saida, { recursive: true });
const gerados = testes.map(t => {
  const out = path.join(saida, t.replace(/[\\/]/g, '__').replace(/\.ts$/, '.mjs'));
  buildSync({ entryPoints: [t], bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'error',
    define: { 'import.meta.env.DEV': 'false', 'import.meta.env.MODE': '"test"' },
    loader: { '.png': 'empty', '.css': 'empty' } });
  return path.resolve(out);
});
const r = spawnSync(process.execPath, ['--test', ...gerados], { stdio: 'inherit', env: { ...process.env, GRIM_RAIZ: process.cwd() } });
process.exit(r.status ?? 1);
