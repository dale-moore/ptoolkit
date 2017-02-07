const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const fs = require('fs');
const ipc = electron.ipcMain;
const path = require('path');
const {Menu, Tray} = electron;

var tipslogic = require('./tipslogic');

let mainWindow;

/**
 * Called by the framework when the Electron has finished initializing.
 */
app.on('ready', () => {
    mainWindow = new BrowserWindow({
      height: 800,
      width: 800
    })

    console.log("mapping to closed event");
    mainWindow.on('closed', _ => {
       // event raised as the browser window is dismissed
       console.log('closed');
       mainWindow = null;
    });


    console.log("creating tray object and context menu")
    //var imagePath = path.join("images", "ptray-icon.png_32x32.png")
    var imagePath = path.join("images", "ptray-icon.ico")
    const tray = new Tray(imagePath)
    const contextMenu = Menu.buildFromTemplate([
          {
               label:  'Exit ', // this is what the user sees
               click: _ => {
                 console.log("quitting the application");
                 app.quit();
               }
          }
     ]);
     tray.setToolTip('Programmers Tray');
     tray.setContextMenu(contextMenu);
     tray.on('click', () => {
        console.log("Programmer's Tray icon Click");
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
     })

     mainWindow.on('show', () => {
        // event raised when the tray icon is left clicked
        console.log("Programmer's Tray show event");
        tray.setHighlightMode('always');
     });
     mainWindow.on('hide', () => {
        // event raised when the tray icon is left clicked
        console.log("Programmer's Tray hide event");
        tray.setHighlightMode('never');
     });
     mainWindow.on('minimize', () => {
        console.log("Programmer's Tray minimize event");
        mainWindow.hide();
     })

     console.log("loading index.html");
     mainWindow.loadURL(`file://${__dirname}/index.html`);
})

/**
 * Called when the index.html has loaded.  This method
 * begins the loading of the tip file.
 */
ipc.on('main-window-loaded', _ => {
    console.log("main-window-loaded event received");
    tipslogic.loadTips(mainWindow);
})

/**
 * Called when the user enters a new tip on the index.html page.
 * The indexrenderer validates the tip and then raises an event
 * with the tip id and the tip to this main module for saving to the file.
 */
ipc.on('main-tip-added', (event, aId, aTip) => {
    console.log("main.js::main-tip-added event handler - event received with id(" +
                 aId + ") tip(" + aTip + ")");
    tipslogic.addNewTip(aId, aTip);
})

ipc.on('main-tip-deleted', (event, aId) => {
    console.log("main.js::main-tip-deleted event handler - event received with id(" +
                 aId + ")");
    tipslogic.deleteTip(aId);
})
