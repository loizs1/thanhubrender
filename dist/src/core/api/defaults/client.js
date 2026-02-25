"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODContextMenuManager_Default = exports.ODTextCommandManager_Default = exports.ODSlashCommandManager_Default = exports.ODClientManager_Default = void 0;
const client_1 = require("../modules/client");
/** (CONTRIBUTOR GUIDE) HOW TO ADD NEW COMMANDS?
 * - Register the command in loadAllSlashCommands() & loadAllTextCommands() in (./src/data/framework/commandLoader.ts)
 * - Add autocomplete for the command in OD(Slash/Text)CommandManagerIds_Default in (./src/core/api/defaults/client.ts)
 * - Add the command to the help menu in (./src/data/framework/helpMenuLoader.ts)
 * - If required, new config variables should be added (incl. logs, dm-logs & permissions).
 * - Update the Open Ticket Documentation.
 * - If the command contains complex logic or can be executed from a button/dropdown, it should be placed inside an `ODAction`.
 * - Check all files, test the bot carefully & try a lot of different scenario's with different settings.
 */
/**## ODClientManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODClientManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.client`!
 */
class ODClientManager_Default extends client_1.ODClientManager {
}
exports.ODClientManager_Default = ODClientManager_Default;
/**## ODSlashCommandManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODSlashCommandManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.client.slashCommands`!
 */
class ODSlashCommandManager_Default extends client_1.ODSlashCommandManager {
    get(id) {
        return super.get(id);
    }
    remove(id) {
        return super.remove(id);
    }
    exists(id) {
        return super.exists(id);
    }
    onInteraction(commandName, callback) {
        return super.onInteraction(commandName, callback);
    }
}
exports.ODSlashCommandManager_Default = ODSlashCommandManager_Default;
/**## ODTextCommandManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODTextCommandManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.client.textCommands`!
 */
class ODTextCommandManager_Default extends client_1.ODTextCommandManager {
    get(id) {
        return super.get(id);
    }
    remove(id) {
        return super.remove(id);
    }
    exists(id) {
        return super.exists(id);
    }
    onInteraction(commandPrefix, commandName, callback) {
        return super.onInteraction(commandPrefix, commandName, callback);
    }
}
exports.ODTextCommandManager_Default = ODTextCommandManager_Default;
/**## ODContextMenuManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODContextMenuManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.client.contextMenus`!
 */
class ODContextMenuManager_Default extends client_1.ODContextMenuManager {
    get(id) {
        return super.get(id);
    }
    remove(id) {
        return super.remove(id);
    }
    exists(id) {
        return super.exists(id);
    }
    onInteraction(menuName, callback) {
        return super.onInteraction(menuName, callback);
    }
}
exports.ODContextMenuManager_Default = ODContextMenuManager_Default;
