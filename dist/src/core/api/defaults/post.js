"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODPostManager_Default = void 0;
const post_1 = require("../modules/post");
/**## ODPostManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODPostManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.code`!
 */
class ODPostManager_Default extends post_1.ODPostManager {
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
exports.ODPostManager_Default = ODPostManager_Default;
