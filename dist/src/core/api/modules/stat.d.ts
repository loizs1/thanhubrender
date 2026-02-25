import { ODId, ODManager, ODManagerData, ODValidId } from "./base";
import { ODDebugger } from "./console";
import { ODDatabase, ODJsonDatabaseStructure } from "./database";
import * as discord from "discord.js";
/**## ODValidStatValue `type`
 * These are the only allowed types for a stat value to improve compatibility with different database systems.
 */
export type ODValidStatValue = string | number | boolean;
/**## ODStatsManagerInitCallback `type`
 * This callback can be used to execute something when the stats have been initiated.
 *
 * By default this is used to clear stats from users that left the server or tickets which don't exist anymore.
 */
export type ODStatsManagerInitCallback = (database: ODJsonDatabaseStructure, deletables: ODJsonDatabaseStructure) => void | Promise<void>;
/**## ODStatScopeSetMode `type`
 * This type contains all valid methods for changing the value of a stat.
 */
export type ODStatScopeSetMode = "set" | "increase" | "decrease";
/**## ODStatsManager `class`
 * This is an Open Ticket stats manager.
 *
 * This class is responsible for managing all stats of the bot.
 * Stats are categorized in "scopes" which can be accessed in this manager.
 *
 * Stats can be accessed in the individual scopes.
 */
export declare class ODStatsManager extends ODManager<ODStatScope> {
    #private;
    /**Alias to Open Ticket stats database. */
    database: ODDatabase | null;
    constructor(debug: ODDebugger);
    /**Select the database to use to read/write all stats from/to. */
    useDatabase(database: ODDatabase): void;
    add(data: ODStatScope, overwrite?: boolean): boolean;
    /**Init all stats and run `onInit()` listeners. */
    init(): Promise<void>;
    /**Reset all stats. (clears the entire database) */
    reset(): Promise<void>;
    /**Run a function when the stats are initialized. This can be used to clear stats from users that left the server or tickets which don't exist anymore. */
    onInit(callback: ODStatsManagerInitCallback): void;
}
/**## ODStatScope `class`
 * This is an Open Ticket stat scope.
 *
 * A scope can contain multiple stats. Every scope is seperated from other scopes.
 * Here, you can read & write the values of all stats.
 *
 * The built-in Open Ticket scopes are: `global`, `user`, `ticket`
 */
export declare class ODStatScope extends ODManager<ODStat> {
    /**The id of this statistics scope. */
    id: ODId;
    /**Is this stat scope already initialized? */
    ready: boolean;
    /**Alias to Open Ticket stats database. */
    database: ODDatabase | null;
    /**The name of this scope (used in embed title) */
    name: string;
    constructor(id: ODValidId, name: string);
    /**Select the database to use to read/write all stats from/to. (Automatically assigned when used in `ODStatsManager`) */
    useDatabase(database: ODDatabase): void;
    /**Get the value of a statistic. The `scopeId` is the unique id of the user, channel, role, etc that the stats are related to. */
    getStat(id: ODValidId, scopeId: string): Promise<ODValidStatValue | null>;
    /**Get the value of a statistic for all `scopeId`'s. The `scopeId` is the unique id of the user, channel, role, etc that the stats are related to. */
    getAllStats(id: ODValidId): Promise<{
        id: string;
        value: ODValidStatValue;
    }[]>;
    /**Set, increase or decrease the value of a statistic. The `scopeId` is the unique id of the user, channel, role, etc that the stats are related to. */
    setStat(id: ODValidId, scopeId: string, value: ODValidStatValue, mode: ODStatScopeSetMode): Promise<boolean>;
    /**Reset the value of a statistic to the initial value. The `scopeId` is the unique id of the user, channel, role, etc that the stats are related to. */
    resetStat(id: ODValidId, scopeId: string): Promise<ODValidStatValue | null>;
    /**Initialize this stat scope & return a list of all statistic ids in the following format: `<scopeid>_<statid>`  */
    init(): string[];
    /**Render all stats in this scope for usage in a discord message/embed. */
    render(scopeId: string, guild: discord.Guild, channel: discord.TextBasedChannel, user: discord.User): Promise<string>;
}
/**## ODStatGlobalScope `class`
 * This is an Open Ticket stat global scope.
 *
 * A scope can contain multiple stats. Every scope is seperated from other scopes.
 * Here, you can read & write the values of all stats.
 *
 * This scope is made specifically for the global stats of Open Ticket.
 */
export declare class ODStatGlobalScope extends ODStatScope {
    getStat(id: ODValidId): Promise<ODValidStatValue | null>;
    getAllStats(id: ODValidId): Promise<{
        id: string;
        value: ODValidStatValue;
    }[]>;
    setStat(id: ODValidId, value: ODValidStatValue, mode: ODStatScopeSetMode): Promise<boolean>;
    resetStat(id: ODValidId): Promise<ODValidStatValue | null>;
    render(scopeId: "GLOBAL", guild: discord.Guild, channel: discord.TextBasedChannel, user: discord.User): Promise<string>;
}
/**## ODStatRenderer `type`
 * This callback will render a single statistic for a discord embed/message.
 */
export type ODStatRenderer = (value: ODValidStatValue, scopeId: string, guild: discord.Guild, channel: discord.TextBasedChannel, user: discord.User) => string | Promise<string>;
/**## ODStat `class`
 * This is an Open Ticket statistic.
 *
 * This single statistic doesn't do anything except defining the rules of this statistic.
 * Use it in a stats scope to register a new statistic. A statistic can also include a priority to choose the render priority.
 *
 * It's recommended to use the `ODBasicStat` & `ODDynamicStat` classes instead of this one!
 */
export declare class ODStat extends ODManagerData {
    /**The priority of this statistic. */
    priority: number;
    /**The render function of this statistic. */
    render: ODStatRenderer;
    /**The value of this statistic. */
    value: ODValidStatValue | null;
    constructor(id: ODValidId, priority: number, render: ODStatRenderer, value?: ODValidStatValue);
}
/**## ODBasicStat `class`
 * This is an Open Ticket basic statistic.
 *
 * This single statistic will store a number, boolean or string in the database.
 * Use it to create a simple statistic for any stats scope.
 */
export declare class ODBasicStat extends ODStat {
    /**The name of this stat. Rendered in discord embeds/messages. */
    name: string;
    constructor(id: ODValidId, priority: number, name: string, value: ODValidStatValue);
}
/**## ODDynamicStatRenderer `type`
 * This callback will render a single dynamic statistic for a discord embed/message.
 */
export type ODDynamicStatRenderer = (scopeId: string, guild: discord.Guild, channel: discord.TextBasedChannel, user: discord.User) => string | Promise<string>;
/**## ODDynamicStat `class`
 * This is an Open Ticket dynamic statistic.
 *
 * A dynamic statistic does not store anything in the database! Instead, it will execute a function to return a custom result.
 * This can be used to show statistics which are not stored in the database.
 *
 * This is used in Open Ticket for the live ticket status, participants & system status.
 */
export declare class ODDynamicStat extends ODStat {
    constructor(id: ODValidId, priority: number, render: ODDynamicStatRenderer);
}
