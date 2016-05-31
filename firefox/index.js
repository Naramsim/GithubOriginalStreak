var self = require("sdk/self");
var pageMod = require("sdk/page-mod");
 
pageMod.PageMod({
    include: "https://github.com/*",
    contentScriptFile: self.data.url("inject.js"),
    contentScriptWhen: "ready",
    contentStyleFile: self.data.url("inject.css")
});