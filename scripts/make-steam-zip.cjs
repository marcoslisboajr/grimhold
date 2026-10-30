const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const winUnpacked = path.resolve('release-demo/win-unpacked');
const targetZip = path.resolve('release-demo/grimhold-demo-fest-v12.zip');

if (fs.existsSync(targetZip)) {
  fs.unlinkSync(targetZip);
}

console.log('Compactando com tar.exe nativo do Windows...');
cp.execFileSync('tar.exe', ['-a', '-c', '-f', targetZip, '*'], {
  cwd: winUnpacked
});

const stats = fs.statSync(targetZip);
console.log('Zip gerado com sucesso! Tamanho:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
