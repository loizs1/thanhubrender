"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODSessionManager_Default = void 0;
const session_1 = require("../modules/session");
/**## ODSessionManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODSessionManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.sessions`!
 */
class ODSessionManager_Default extends session_1.ODSessionManager {
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
exports.ODSessionManager_Default = ODSessionManager_Default;
