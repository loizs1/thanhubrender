"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODLiveStatusManager_Default = void 0;
const console_1 = require("../modules/console");
/**## ODLiveStatusManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODLiveStatusManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.livestatus`!
 */
class ODLiveStatusManager_Default extends console_1.ODLiveStatusManager {
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
exports.ODLiveStatusManager_Default = ODLiveStatusManager_Default;
