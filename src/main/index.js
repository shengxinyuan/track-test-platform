import { app, BrowserWindow, globalShortcut, Menu, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import packageJson from '../../package.json'
const appVersion = packageJson.version
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    webPreferences: {webSecurity: false},
    height: 788,
    useContentSize: true,
    width: 1200
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('focus', () => {
    globalShortcut.register('CommandOrControl+F', function () {
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('on-find', '')
      }
    })
  })

  mainWindow.on('blur', () => {
    globalShortcut.unregister('CommandOrControl+F')
  })

  mainWindow.webContents.openDevTools()

}

app.on('ready', () => {
  require('./server.js')
  createWindow()

  // menu
  const template = [
    {
      label: 'Application',
      submenu: []
    }, 
    {
      label: 'Edit',
      submenu: [
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
  globalShortcut.unregister('CommandOrControl+F')
  globalShortcut.unregister('CommandOrControl+C')
  globalShortcut.unregister('CommandOrControl+V')
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('web-contents-created', (e, webContents) => {
  webContents.on('new-window', (event, url) => {
      event.preventDefault();
      shell.openExternal(url);
  });
});

// autoUpdater.on('update-downloaded', () => {
//   autoUpdater.quitAndInstall()
// })
// let updateFeed = 'http://localhost:3000/updates/latest';
// autoUpdater.setFeedURL(updateFeed + '?v=' + appVersion);

// app.on('ready', () => {
//   if (process.env.NODE_ENV === 'production') {
//     const server = 'https://hazel-q08ovjzbk.vercel.app/'
//     const feed = `${server}/update/${process.platform}/${appVersion}`
//     autoUpdater.setFeedURL(feed)
//   }
// })

