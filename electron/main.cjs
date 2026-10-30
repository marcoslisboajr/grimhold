const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const fs = require('fs')

// ── Qual build e este ───────────────────────────────────────────────────
// Vem do package.json empacotado. O electron-builder injeta pelo
// extraMetadata: o build da demo grava grimholdBuild='demo' e o App ID
// dela. Sem isso (dev, jogo completo), vale o padrao.
let meta = {}
try { meta = require('../package.json') } catch (e) { try { meta = require('./package.json') } catch (e2) { meta = {} } }
const IS_DEMO_BUILD = meta.grimholdBuild === 'demo'

// Nome do app fixo pra pasta de save (userData) ser estavel em dev E no
// build empacotado. A demo usa nome PROPRIO: e app separado na Steam e
// precisa de save.json proprio, senao a Cloud de um sincroniza o outro.
app.setName(IS_DEMO_BUILD ? 'Grimhold Demo' : 'Grimhold')

// ── PHYSICAL SAVES FOR STEAM CLOUD SUPPORT ──────────────────────────────
// The renderer (components/systems/storage.ts) mirrors every write here, key
// by key, via window.saveAPI. Steam Cloud syncs this single JSON file;
// localStorage stays the fast synchronous cache on the renderer side.
const getSaveFilePath = () => {
  return path.join(app.getPath('userData'), 'save.json')
}

// Read the whole save file as an object { key: value }. Never throws.
const readSaveObject = () => {
  try {
    const raw = fs.readFileSync(getSaveFilePath(), 'utf-8')
    const obj = JSON.parse(raw)
    return obj && typeof obj === 'object' ? obj : {}
  } catch {
    return {}
  }
}

// Write the whole object back to disk. Never throws.
const writeSaveObject = (obj) => {
  try {
    fs.writeFileSync(getSaveFilePath(), JSON.stringify(obj), 'utf-8')
  } catch (e) {
    console.log('[Save] falha ao gravar save.json:', e && e.message)
  }
}

// ── STEAM (steamworks.js) ───────────────────────────────────────────────
// App ID na Steamworks. A demo e um app SEPARADO e tem o seu proprio —
// injetado pelo electron-builder em steamAppId. (480 = "Spacewar", o app
// de teste da Valve.)
const STEAM_APP_ID = Number(meta.steamAppId) || 5187440

let steamClient = null
try {
  const steamworks = require('steamworks.js')
  steamClient = steamworks.init(STEAM_APP_ID)
  // habilita o overlay da Steam (Shift+Tab) dentro do Electron
  steamworks.electronEnableSteamOverlay()
  console.log('[Steam] conectado como:', steamClient.localplayer.getName())
} catch (e) {
  // Sem Steam rodando, sem steamworks.js instalado, ou fora da Steam (itch/dev):
  // o jogo continua normal — apenas sem conquistas da Steam.
  console.log('[Steam] não iniciado:', e && e.message)
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 800,
    minHeight: 500,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    title: 'Grimhold',
    backgroundColor: '#0a0a1a',
  })

  win.setMenuBarVisibility(false)

  // Links (target=_blank / window.open): nunca abrem janela nova do jogo.
  // steam:// vai pro cliente da Steam; https vai pro navegador. Resto é ignorado.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^(steam:\/\/|https:\/\/)/.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })

  const isDev = !app.isPackaged
  if (isDev) {
    win.loadURL('http://localhost:3000')
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// ── IPC: conquistas — o renderer pede pra desbloquear uma conquista ─────
ipcMain.on('steam-unlock-achievement', (_event, id) => {
  if (!steamClient || typeof id !== 'string') return
  try {
    // 'id' precisa bater com o "API Name" da conquista na Steamworks.
    steamClient.achievement.activate(id)
  } catch (e) {
    console.log('[Steam] falha ao desbloquear', id, e && e.message)
  }
})

// ── IPC: idioma — o renderer pergunta em que idioma a Steam está ───────
// Devolve o nome usado pela Steam ('english', 'brazilian', 'schinese'...)
// ou null fora da Steam. O i18n normaliza esse valor.
ipcMain.handle('steam:get-language', () => {
  if (!steamClient) return null
  try {
    return steamClient.apps.currentGameLanguage()
  } catch (e) {
    console.log('[Steam] falha ao ler idioma:', e && e.message)
    return null
  }
})

// ── IPC: saves físicos (Steam Cloud) — casa com storage.ts ──────────────
// loadAllSync: SÍNCRONO — devolve o objeto inteiro { chave: valor }.
// storage.ts chama isto uma vez na reconciliação inicial.
ipcMain.on('save:load-all-sync', (event) => {
  event.returnValue = readSaveObject()
})

// saveKeyAsync: grava/atualiza uma chave.
ipcMain.on('save:set-key', (_event, payload) => {
  if (!payload || typeof payload.key !== 'string') return
  const obj = readSaveObject()
  obj[payload.key] = payload.value
  writeSaveObject(obj)
})

// deleteKeyAsync: apaga uma chave.
ipcMain.on('save:delete-key', (_event, payload) => {
  if (!payload || typeof payload.key !== 'string') return
  const obj = readSaveObject()
  delete obj[payload.key]
  writeSaveObject(obj)
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
