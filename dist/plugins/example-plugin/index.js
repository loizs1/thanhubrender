"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _opendiscord_1 = require("#opendiscord");
/////////////////////////////////////////////
//// This plugin is not enabled yet!     ////
//// Enable it in the plugin.json file!  ////
/////////////////////////////////////////////
if (_opendiscord_1.utilities.project != "openticket")
    throw new _opendiscord_1.api.ODPluginError("This plugin only works in Open Ticket!");
//Let's register the example config. This way it's available for all plugins & systems.
_opendiscord_1.opendiscord.events.get("onConfigLoad").listen((configManager) => {
    configManager.add(new _opendiscord_1.api.ODJsonConfig("example-plugin:config", "config.json", "./plugins/example-plugin/"));
    /*===== What did we do? =====
    - "example-plugin:config" Is the ID of this config. You can use this id troughout the bot to access this config file. Even in other plugins.
    - "config.json" Is the FILE of this config. It is just the filename.
    - "./plugins/example-plugin/" Is the DIRECTORY of this config. By default it's "./config/", but we want to change it to point at the plugin directory.
    */
    //Let's also log it to the console to let us know it worked!
    const ourConfig = configManager.get("example-plugin:config");
    _opendiscord_1.opendiscord.log("The example config loaded successfully!", "plugin", [
        { key: "var-1", value: ourConfig.data.testVariable1 },
        { key: "var-2", value: ourConfig.data.testVariable2.toString() },
        { key: "var-3", value: ourConfig.data.testVariable3.toString() }
    ]);
});
_opendiscord_1.opendiscord.events.get("onTicketCreate").listen((creator) => {
    //This is logged before the ticket is created (after the button is pressed)
    _opendiscord_1.opendiscord.log("Ticket is getting created...", "plugin");
});
_opendiscord_1.opendiscord.events.get("afterTicketCreated").listen((ticket, creator, channel) => {
    //This is logged after the ticket is created
    _opendiscord_1.opendiscord.log("Ticket ready!", "plugin");
});
