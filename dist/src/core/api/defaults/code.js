"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODCodeManager_Default = void 0;
const code_1 = require("../modules/code");
/**## ODCodeManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODCodeManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.code`!
 */
class ODCodeManager_Default extends code_1.ODCodeManager {
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
exports.ODCodeManager_Default = ODCodeManager_Default;
