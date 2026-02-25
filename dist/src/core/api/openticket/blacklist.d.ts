import { ODManager, ODManagerData, ODValidId } from "../modules/base";
import { ODDebugger } from "../modules/console";
/**## ODBlacklist `class`
 * This is an Open Ticket blacklisted user.
 *
 * This class contains the id of the user this class belongs to & an optional reason for being blacklisted.
 *
 * Create this class & add it to the `ODBlacklistManager` to blacklist someone!
 */
export declare class ODBlacklist extends ODManagerData {
    #private;
    constructor(id: ODValidId, reason: string | null);
    /**The reason why this user got blacklisted. (optional) */
    set reason(reason: string | null);
    get reason(): string | null;
}
/**## ODBlacklistManager `class`
 * This is an Open Ticket blacklist manager.
 *
 * This class manages all blacklisted users & their reason. Check if someone is blacklisted using their ID in the `exists()` method.
 *
 * All `ODBlacklist`'s added, removed & edited in this list will be synced automatically with the database.
 */
export declare class ODBlacklistManager extends ODManager<ODBlacklist> {
    constructor(debug: ODDebugger);
}
