"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODAction_Default = exports.ODActionManager_Default = void 0;
const action_1 = require("../modules/action");
/**## ODActionManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODActionManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.actions`!
 */
class ODActionManager_Default extends action_1.ODActionManager {
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
exports.ODActionManager_Default = ODActionManager_Default;
/**## ODAction_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODAction class.
 * It doesn't add any extra features!
 *
 * This default class is made for the default `ODAction`'s!
 */
class ODAction_Default extends action_1.ODAction {
}
exports.ODAction_Default = ODAction_Default;
