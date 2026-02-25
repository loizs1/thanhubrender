"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODVerifyBar_Default = exports.ODVerifyBarManager_Default = void 0;
const verifybar_1 = require("../modules/verifybar");
/**## ODVerifyBarManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODVerifyBarManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.verifybars`!
 */
class ODVerifyBarManager_Default extends verifybar_1.ODVerifyBarManager {
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
exports.ODVerifyBarManager_Default = ODVerifyBarManager_Default;
/**## ODVerifyBar_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODVerifyBar class.
 * It doesn't add any extra features!
 *
 * This default class is made for the default `ODVerifyBar`'s!
 */
class ODVerifyBar_Default extends verifybar_1.ODVerifyBar {
}
exports.ODVerifyBar_Default = ODVerifyBar_Default;
