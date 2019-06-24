const electron = require('electron');
const path = require('path');
const url = require('url');

// SET ENV
process.env.NODE_ENV = 'production';

const {app, BrowserWindow, Menu, ipcMain} = electron;



let currentWindow;
let mainWindows = [];
function getCurrentWindow() { return currentWindow; };


// Handle credits window
function createCreditsWindow(){
  creditsWindow = new BrowserWindow({
    width: 300,
    height:200,
    title:'Crédits'
  });
  creditsWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'creditsWindow.html'),
    protocol: 'file:',
    slashes:true
  }));
  // Handle garbage collection
  creditsWindow.on('close', function(){
    creditsWindow = null;
  });
}

function createMainWindow( filename = null, content = null){
  // Create new window
  currentWindow = new BrowserWindow({});
  // Load html in window
  currentWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes:true
  }));

  mainWindows.push(currentWindow);
  let pos = mainWindows.indexOf(currentWindow);
  currentWindow.on('close', function(){
    mainWindows.splice(pos, 1);
  })

  if( filename != null && content != null ) {
    currentWindow.webContents.once('dom-ready', () => {
      currentWindow.webContents.send('setContent', content);
      currentWindow.webContents.send('setFilename', filename);
    });
  }
  else{
    currentWindow.webContents.once('dom-ready', () => {
      currentWindow.webContents.send('setFilename', "Draft" + (pos+1));
    });
  }
}

module.exports = {
  getCurrentWindow : getCurrentWindow,
  createMainWindow : createMainWindow,
  createCreditsWindow : createCreditsWindow,
};

// Create menu template
const {mainMenuTemplate} = require('./menu');
const {saveDialog, openDialog} = require('./fileUtil');


// Listen for app to be ready
app.on('ready', function(){
  createMainWindow();
  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('save', (event, filename) => {
  saveDialog(filename, event.sender);
});

ipcMain.on('open', (event) => {
  openDialog();
});

