import { app, BrowserWindow, dialog, shell } from 'electron'
import electronUpdater from 'electron-updater'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const { autoUpdater } = electronUpdater
const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const developmentUrl = process.env.VITE_DEV_SERVER_URL
const releasePageUrl = 'https://github.com/aTong9/web3/releases/latest'
const updateCheckInterval = 4 * 60 * 60 * 1000

let skippedVersion = null
let downloadingUpdate = false
let mainWindow = null

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

  mainWindow = window
  window.once('closed', () => {
    if (mainWindow === window) mainWindow = null
  })
  return window
}

const showUpdateDialog = (options) => {
  const window = BrowserWindow.getFocusedWindow() ?? mainWindow
  return window ? dialog.showMessageBox(window, options) : dialog.showMessageBox(options)
}

const configureAutoUpdater = () => {
  if (!app.isPackaged) return

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-available', async (info) => {
    if (info.version === skippedVersion || downloadingUpdate) return

    const result = await showUpdateDialog({
      type: 'info',
      title: '发现新版本',
      message: `发现新版本 ${info.version}`,
      detail: `当前版本为 ${app.getVersion()}。是否立即下载更新？`,
      buttons: ['下载更新', '暂不更新', '查看发布说明'],
      defaultId: 0,
      cancelId: 1,
      noLink: true,
    })

    if (result.response === 2) {
      skippedVersion = info.version
      await shell.openExternal(releasePageUrl)
      return
    }
    if (result.response !== 0) {
      skippedVersion = info.version
      return
    }

    downloadingUpdate = true
    try {
      await autoUpdater.downloadUpdate()
    } catch (error) {
      downloadingUpdate = false
      console.error('Electron update download failed:', error)
      await showUpdateDialog({
        type: 'error',
        title: '更新下载失败',
        message: '无法下载新版本',
        detail: '请稍后重试，或前往 GitHub Releases 手动下载安装包。',
        buttons: ['知道了', '打开下载页面'],
        defaultId: 0,
        cancelId: 0,
      }).then((downloadResult) => {
        if (downloadResult.response === 1) return shell.openExternal(releasePageUrl)
      })
    }
  })

  autoUpdater.on('update-downloaded', async (info) => {
    downloadingUpdate = false
    const result = await showUpdateDialog({
      type: 'info',
      title: '更新已下载',
      message: `新版本 ${info.version} 已准备就绪`,
      detail: '重启应用后将自动完成安装。',
      buttons: ['立即重启并更新', '退出时更新'],
      defaultId: 0,
      cancelId: 1,
      noLink: true,
    })
    if (result.response === 0) autoUpdater.quitAndInstall(false, true)
  })

  autoUpdater.on('error', (error) => {
    downloadingUpdate = false
    console.warn('Electron update check failed:', error)
  })

  const checkForUpdates = () => {
    void autoUpdater.checkForUpdates().catch((error) => {
      console.warn('Electron update check failed:', error)
    })
  }

  setTimeout(checkForUpdates, 5_000)
  setInterval(checkForUpdates, updateCheckInterval)
}

app.whenReady().then(async () => {
  await createWindow()
  configureAutoUpdater()
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) await createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
