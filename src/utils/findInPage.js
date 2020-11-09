
const { remote, ipcRenderer } = require('electron')
import { FindInPage } from 'electron-find'

let findInPage = new FindInPage(remote.getCurrentWebContents(), {
  offsetTop: 8,
  offsetRight: 12
})

ipcRenderer.on('on-find', (e, args) => {
  findInPage.openFindWindow()
})