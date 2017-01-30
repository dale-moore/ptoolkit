const electron = require('electron');
const app = electron.app;
const fs = require('fs');

var windowToNotify

module.exports = {

loadTips: function(aWindowToNotify) {
    console.log("Loading the tips");
    windowToNotify = aWindowToNotify;

    // Check if the tips file exists and if not, create it.
    if (module.exports.checkIfTipsFileExists()==false) {
      console.log("The tips file does not exist.  Creating a default file now.");
      var jsonContent = JSON.parse({"1" : "Create a tip and press add",
                                    "2" : "Delete tips by pressing the x"});
      module.exports.saveTipsFile(jsonContent);
    }
    else {
      console.log("The tips file already exists.");
    }

    // Read the tips file, but before doing that, learn
    // about JavaScript arrays.
    var jsonContent = module.exports.readTipsFileIntoJsonObject();

    // Traverse through each element of the JSON object
    for (var jsonKey in jsonContent) {
        console.log("Found tip key:"+jsonKey+", value:"+jsonContent[jsonKey]);
        // Add each key and value to our JS Map
        ///tipsMap.set(jsonKey, jsonContent[jsonKey]);
        console.log('raising add-tip-from-file event');
        windowToNotify.webContents.send('add-tip-from-file-event', jsonKey, jsonContent[jsonKey]);
    }
},

getTipsFileName: function() {
    return app.getPath('userData') + '/tips.json';
},

checkIfTipsFileExists: function() {
    var filePath = module.exports.getTipsFileName();
    try {
      fs.openSync(filePath, 'r+'); // throws error if file doesn't exist
      return true;
    }
    catch (err) {
      return false;
    }
},

saveTipsFile: function(aJSONContent) {
    var filePath = module.exports.getTipsFileName();
    console.log("Saving tips file at location " + filePath);
    var fd = fs.openSync(filePath, 'w+');
    fs.writeFileSync(filePath, JSON.stringify(aJSONContent));
},

readTipsFileIntoJsonObject: function() {
    // Define the location of the file
    var path = module.exports.getTipsFileName();
    console.log('reading tips file at path: ' + path);
    var contents = fs.readFileSync(path);
    // convert to JSON
    var jsonContent = JSON.parse(contents);
    return jsonContent;
},

addNewTip: function(aId, aTip) {
  console.log("tipslog.js::addNewTip() enter");
  var jsonContent = module.exports.readTipsFileIntoJsonObject();
  console.log("tipslog.js::addNewTip() add new tip with id(" + aId +
              ") value(" + aTip + ") to JSON.");
  jsonContent[aId] = aTip;
  module.exports.saveTipsFile(jsonContent);
},

deleteTip: function(aId) {
  console.log("tipslog.js::deleteTip() enter");
  var jsonContent = module.exports.readTipsFileIntoJsonObject();
  // Traverse through each element of the JSON object and find the ID
  for (var jsonKey in jsonContent) {
      console.log("tipslog.js::deleteTip() - iterating on tip key:"+jsonKey+", value:"+jsonContent[jsonKey]);
      // Add each key and value to our JS Map
      if (jsonKey === aId) {
        console.log("tipslog.js::deleteTip() - deleting key:"+jsonKey);
        delete jsonContent[jsonKey];
        break;
      }
  }
  module.exports.saveTipsFile(jsonContent);
}

};  // end of module exports
