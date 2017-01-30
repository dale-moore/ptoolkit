const electron = require('electron');
const ipc = electron.ipcRenderer;
// The remote API allows renderer processes to use the main process modules
const {dialog} = require('electron').remote

console.log("renderer.js loading");

ipc.on('add-tip-from-file-event', (evt, tipId, tipValue) => {
    console.log("renderer.js received tipId(" + tipId + ") tipValue(" +
                tipValue + ")");
    addNewTipToUI(tipId, tipValue);
});

function onNewTipEntered() {
    console.log("renderer.js::onNewTipsEntered entered");

    var newTipValue = document.getElementById("myInput").value;
    if (newTipValue === '') {
        console.log("renderer.js::onNewTipsEntered user did not enter a tip." +
                    "  Showing warning dialog.");
        dialog.showMessageBox({ type:"warning", buttons:["OK"],
                                title:"Missing Input",
                                message:"Input a tip before pressing Add"})
    }
    var uuid = generateUUID();
    console.log("Creating tip with GUID(" + uuid + ")");

    addNewTipToUI(uuid, newTipValue);

    // The main module is listening for this event so it knows
    // when a new tip is added.  The main module will add the tip
    // to the JSON file.
    ipc.send('main-tip-added', uuid, newTipValue);

    document.getElementById("myInput").value = "";
}

function generateUUID(){
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

// Create a new list item when clicking on the "Add" button
function addNewTipToUI(aTipId, aTip) {
    var li = document.createElement("li");
    li.setAttribute("id", aTipId);

    var t = document.createTextNode(aTip);
    li.appendChild(t);
    document.getElementById("myTipList").appendChild(li);

    var span = document.createElement("SPAN");
    // Set to the Unicode multiplication sign character.
    var txt = document.createTextNode("\u00D7");
    span.className = "close";
    span.appendChild(txt);
    li.appendChild(span);

    var close = document.getElementsByClassName("close");
    for (i = 0; i < close.length; i++) {
        // Add a click handler to each of the close elements
        close[i].onclick = onDeleteTipFunction;
    }
}

/**
 * Called when the (x) button on a tip <LI> is clicked.
 * Assigned to the (x) button's click handler when a new tip is added.
 */
var onDeleteTipFunction = function onDeleteTip() {
    console.log("renderer.js list LI delete button clicked");

    var div = this.parentElement;

    // confirm tip deletion
    if (confirmTipDelete() === true) {
        // Hide the tip
        div.style.display = "none";
        ipc.send('main-tip-deleted', div.id);
    }
}

function confirmTipDelete() {
  var selectedIndex = dialog.showMessageBox({ type: "question",
        buttons:["YES","No"],
        title:"Confirm Delete",
        message:"Are you sure you want to delete this tip?"});
  if (selectedIndex === 0) {
    console.log("renderer.js::onDeleteTipFunction selected index-" +
        selectedIndex + ")");
    return true;
  }
  return false;
}

/**
 * Called when the HTML <body> onload() is called.
 */
function onFormLoadComplete() {
    // The main module is listening for this event so it knows
    // it can load the list of tips from the file.
    ipc.send('main-window-loaded');
}

console.log("renderer.js adding click event listener to the UL item");
var list = document.querySelector('ul');
list.addEventListener('click', function(ev) {
    if (ev.target.tagName === 'LI') {
        // TODO - copy the tip to the clipboard
        ev.target.classList.toggle('checked');
        console.log("renderer.js list LI clicked");
    }
}, false);

console.log("renderer.js loaded");
