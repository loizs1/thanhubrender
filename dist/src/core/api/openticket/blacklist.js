"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODBlacklistManager = exports.ODBlacklist = void 0;
///////////////////////////////////////
//OPENTICKET BLACKLIST MODULE
///////////////////////////////////////
const base_1 = require("../modules/base");
/**## ODBlacklist `class`
 * This is an Open Ticket blacklisted user.
 *
 * This class contains the id of the user this class belongs to & an optional reason for being blacklisted.
 *
 * Create this class & add it to the `ODBlacklistManager` to blacklist someone!
 */
class ODBlacklist extends base_1.ODManagerData {
    /**The reason why this user got blacklisted. (optional) */
    #reason;
    constructor(id, reason) {
        super(id);
        this.#reason = reason;
    }
    /**The reason why this user got blacklisted. (optional) */
    set reason(reason) {
        this.#reason = reason;
        this._change();
    }
    get reason() {
        return this.#reason;
    }
}
exports.ODBlacklist = ODBlacklist;
/**## ODBlacklistManager `class`
 * This is an Open Ticket blacklist manager.
 *
 * This class manages all blacklisted users & their reason. Check if someone is blacklisted using their ID in the `exists()` method.
 *
 * All `ODBlacklist`'s added, removed & edited in this list will be synced automatically with the database.
 */
class ODBlacklistManager extends base_1.ODManager {
    constructor(debug) {
        super(debug, "blacklist");
    }
}
exports.ODBlacklistManager = ODBlacklistManager;
