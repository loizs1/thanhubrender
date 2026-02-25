"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODVersionManager_Default = void 0;
///////////////////////////////////////
//BASE MODULE
///////////////////////////////////////
const base_1 = require("../modules/base");
/**## ODFlagManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODFlagManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.flags`!
 */
class ODVersionManager_Default extends base_1.ODVersionManager {
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
exports.ODVersionManager_Default = ODVersionManager_Default;
