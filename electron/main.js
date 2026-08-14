import { app, BrowserWindow, shell } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))

const developmentUrl = process.env.VITE_DEV_SERVER_URL

const isTrustedNavigation = (url) => {
  if (developmentUrl) return url.startsWith(developmentUrl)
  return url.startsWith('file:')
}

const createWindow = async () => {
  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1024,
    minHeight: 720,
    backgroundColor: '#111827',
    title: 'FIRE Finance Workbench',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) void shell.openExternal(url)
    return { action: 'deny' }
  })

  window.webContents.on('will-navigate', (event, url) => {
    if (isTrustedNavigation(url)) return
    event.preventDefault()
    if (url.startsWith('https://') || url.startsWith('http://')) void shell.openExternal(url)
  })

  if (developmentUrl) {
    await window.loadURL(developmentUrl)
  } else {
    await window.loadFile(path.join(currentDirectory, '..', 'dist', 'index.html'))
  }
}

app.whenReady().then(async () => {
  await createWindow()
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) await createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
