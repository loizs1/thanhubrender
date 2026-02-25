"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODFlagManager_Default = void 0;
const flag_1 = require("../modules/flag");
/**## ODFlagManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODFlagManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.flags`!
 */
class ODFlagManager_Default extends flag_1.ODFlagManager {
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
exports.ODFlagManager_Default = ODFlagManager_Default;
