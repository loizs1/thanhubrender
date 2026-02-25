"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODCooldownManager_Default = void 0;
const cooldown_1 = require("../modules/cooldown");
/**## ODCooldownManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODCooldownManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.cooldowns`!
 */
class ODCooldownManager_Default extends cooldown_1.ODCooldownManager {
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
exports.ODCooldownManager_Default = ODCooldownManager_Default;
