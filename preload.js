// Preload script for Electron
// This script runs before the renderer process loads
// It provides a secure bridge between the main process and renderer

const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
  platform: process.platform
});
