// ══════════════════════════════════════════════════════════════════════
// Empacotamento da DEMO.  Uso: npm run electron:build:demo
//
// Formato .cjs e nao .json de proposito: o electron-builder valida o
// config contra um schema estrito e REJEITA qualquer chave desconhecida
// — inclusive um "$comment". Como este arquivo precisa de explicacao,
// vai em JS, onde comentario e comentario.
//
// A demo do Steam Next Fest e um APP SEPARADO na Steamworks, com App ID
// proprio — nao e uma flag dentro do app cheio. Por isso appId,
// productName e pasta de saida diferem do jogo completo (que fica no
// bloco "build" do package.json).
//
//   jogo completo : App ID 5187440 · com.grimhold.game   · release/
//   demo          : App ID 5223130 · com.grimhold.demo   · release-demo/
//
// O extraMetadata escreve grimholdBuild e steamAppId no package.json que
// vai DENTRO do pacote; o electron/main.cjs le de la pra escolher o App
// ID da Steam e o nome da pasta de save (userData).
// ══════════════════════════════════════════════════════════════════════

module.exports = {
  appId: 'com.grimhold.demo',
  productName: 'Grimhold Demo',
  icon: 'build/icon',

  extraMetadata: {
    grimholdBuild: 'demo',
    steamAppId: 5223130,
  },

  directories: { output: 'release-demo' },

  files: ['dist/**/*', 'electron/**/*'],

  asarUnpack: ['**/node_modules/steamworks.js/**'],

  // O steamworks.js exige um steam_appid.txt ao lado do executavel quando
  // o jogo NAO e aberto pelo cliente Steam (teste local). Aqui vai o da
  // DEMO — mandar o do jogo completo faria o pacote se conectar ao app
  // errado, silenciosamente.
  extraResources: [
    { from: 'steam_appid.demo.txt', to: '../steam_appid.txt' },
  ],

  win: { target: 'nsis', icon: 'build/icon.ico' },
  mac: { target: 'dmg', icon: 'build/icon.icns' },
  linux: { icon: 'build/icons' },
};
