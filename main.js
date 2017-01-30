const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const fs = require('fs');
const ipc = electron.ipcMain;
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
       console.log('closed');
       mainWindow = null;
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

// Tasks...
// DONE - check if file exists
// DONE - read a JSON or XML file (done)
// DONE - show the contents of the JSON file in the HTML by raising an event.
// DONE - save new items to the file
// DONE - delete items from the file
// DONE - change (Add) button to be the default enter button.
// DONE - change renderer.js to indexrenderer.js for clarity
// DONE - move code to new folder
// create GIT repo
// run program in the system tray
// create edit tip
// Create copy to clipboard feature when tip is clicked with a little note that says it was copied
// change to Photon
// create re-order feature
// create deployment
// create auto-updater
// run program when the computer starts
// create new feature for creating PlantUML from Java file
// create new feature for editing the program preferences
