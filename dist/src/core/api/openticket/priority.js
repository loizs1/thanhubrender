"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODPriorityLevel = exports.ODPriorityManager_Default = exports.ODPriorityManager = void 0;
///////////////////////////////////////
//OPENTICKET PRIORITY MODULE
///////////////////////////////////////
const base_1 = require("../modules/base");
/**## ODPriorityManager `class`
 * This is an Open Ticket priority manager.
 *
 * This class manages all registered priority levels in the bot.
 *
 * Priorities levels can be changed/updated/translated by plugins to allow for more customisability.
 */
class ODPriorityManager extends base_1.ODManager {
    /**A reference to the Open Ticket debugger. */
    #debug;
    constructor(debug) {
        super(debug, "priority");
        this.#debug = debug;
    }
    /**Get an `ODPriorityLevel` from the priority level value. Returns a dummy value when the level doesn't exist. */
    getFromPriorityLevel(level) {
        return this.getAll().find((lvl) => lvl.priority === level) ?? new ODPriorityLevel("opendiscord:unknown", 0, "unknown", "UNKNOWN_PRIORITY", "🚫", "🚫");
    }
    /**List the available priority levels. */
    listAvailableLevels() {
        return this.getAll().map((lvl) => lvl.priority);
    }
}
exports.ODPriorityManager = ODPriorityManager;
/**## ODPriorityManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODPriorityManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.priorities`!
 */
class ODPriorityManager_Default extends ODPriorityManager {
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
exports.ODPriorityManager_Default = ODPriorityManager_Default;
/**## ODPriorityLevel `class`
 * This is an Open Ticket priority level.
 *
 * Using this class, you can register or edit a priority level for the ticket priority system.
 *
 * Priority levels should be registered in `opendiscord.priorities`.
 *
 * #### 🚨 Negative priorities are treated as `disabled/no-priority`!
 */
class ODPriorityLevel extends base_1.ODManagerData {
    /**The priority level itself. A negative number (e.g. `-1`) is treated as `disabled/no-priority`. */
    priority;
    /**The raw name of the level (used in text/slash command inputs). */
    rawName;
    /**The display name of the level (used in embeds & messages). */
    displayName;
    /**The display emoji of the level (used in embeds & messages). */
    displayEmoji;
    /**The emoji added to the channel name when the level is applied to a ticket. */
    channelEmoji;
    constructor(id, priority, rawName, displayName, displayEmoji, channelEmoji) {
        super(id);
        this.priority = priority;
        this.rawName = rawName;
        this.displayName = displayName;
        this.displayEmoji = displayEmoji;
        this.channelEmoji = channelEmoji;
    }
    /**Get the display name + emoji for rendering this priority in the UI/embeds. */
    renderDisplayName() {
        return (this.displayEmoji ? this.displayEmoji + " " : "") + this.displayName;
    }
}
exports.ODPriorityLevel = ODPriorityLevel;
