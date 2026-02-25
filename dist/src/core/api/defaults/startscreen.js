"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODStartScreenManager_Default = void 0;
const startscreen_1 = require("../modules/startscreen");
/**## ODStartScreenManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODStartScreenManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.startscreen`!
 */
class ODStartScreenManager_Default extends startscreen_1.ODStartScreenManager {
    get(id) {
        return super.get(id);
    }
    remove(id) {
        return super.remove(id);
    }
    exists(id) {
        return super.exists(id);
    }
}
exports.ODStartScreenManager_Default = ODStartScreenManager_Default;
