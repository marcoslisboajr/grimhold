const { contextBridge, ipcRenderer } = require('electron')

// Ponte mínima e segura pro renderer (contextIsolation: true).
// O jogo NÃO tem acesso ao Node — só a estas duas APIs.

contextBridge.exposeInMainWorld('steamAPI', {
  unlockAchievement: (id) => ipcRenderer.send('steam-unlock-achievement', id),
  // Idioma configurado pra este jogo na Steam ('english', 'brazilian',
  // 'schinese'...). Usado pelo i18n na primeira execução. null fora da Steam.
  getGameLanguage: () => ipcRenderer.invoke('steam:get-language'),
})

// Contrato esperado pelo components/systems/storage.ts:
//   isElectron        → flag pra detectar o modo desktop
//   loadAllSync()     → devolve { chave: valor } de todo o save.json (SÍNCRONO)
//   saveKeyAsync(k,v) → grava uma chave (fire-and-forget)
//   deleteKeyAsync(k) → apaga uma chave (fire-and-forget)
contextBridge.exposeInMainWorld('saveAPI', {
  isElectron: true,
  loadAllSync: () => ipcRenderer.sendSync('save:load-all-sync'),
  saveKeyAsync: (key, value) => ipcRenderer.send('save:set-key', { key, value }),
  deleteKeyAsync: (key) => ipcRenderer.send('save:delete-key', { key }),
})
