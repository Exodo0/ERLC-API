const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Window Controls
  minimize: () => ipcRenderer.invoke("window-minimize"),
  maximize: () => ipcRenderer.invoke("window-maximize"),
  close: () => ipcRenderer.invoke("window-close"),
  isMaximized: () => ipcRenderer.invoke("window-is-maximized"),

  // Store / Theme
  getTheme: () => ipcRenderer.invoke("get-store-value", "theme"),
  setTheme: (theme) => ipcRenderer.invoke("set-store-value", "theme", theme),

  getCredentials: () => ipcRenderer.invoke("get-store-value", "credentials"),

  // ERLC API
  saveCredentials: (creds) => ipcRenderer.invoke("api-save-creds", creds),
  getServer: () => ipcRenderer.invoke("api-get-server"),
  getPlayers: () => ipcRenderer.invoke("api-get-players"),
  getBans: () => ipcRenderer.invoke("api-get-bans"),
  getCommandLogs: () => ipcRenderer.invoke("api-get-command-logs"),
  getJoinLogs: () => ipcRenderer.invoke("api-get-join-logs"),
  getKillLogs: () => ipcRenderer.invoke("api-get-kill-logs"),
  getModLogs: () => ipcRenderer.invoke("api-get-mod-logs"),
  getQueue: () => ipcRenderer.invoke("api-get-queue"),
  getStaff: () => ipcRenderer.invoke("api-get-staff"),
  getVehicles: () => ipcRenderer.invoke("api-get-vehicles"),
  runCommand: (command) => ipcRenderer.invoke("api-run-command", command),
});
