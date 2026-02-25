"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODDynamicStat = exports.ODBasicStat = exports.ODStat = exports.ODStatGlobalScope = exports.ODStatScope = exports.ODStatsManager = void 0;
///////////////////////////////////////
//STAT MODULE
///////////////////////////////////////
const base_1 = require("./base");
/**## ODStatsManager `class`
 * This is an Open Ticket stats manager.
 *
 * This class is responsible for managing all stats of the bot.
 * Stats are categorized in "scopes" which can be accessed in this manager.
 *
 * Stats can be accessed in the individual scopes.
 */
class ODStatsManager extends base_1.ODManager {
    /**Alias to Open Ticket debugger. */
    #debug;
    /**Alias to Open Ticket stats database. */
    database = null;
    /**All the listeners for the init event. */
    #initListeners = [];
    constructor(debug) {
        super(debug, "stat scope");
        this.#debug = debug;
    }
    /**Select the database to use to read/write all stats from/to. */
    useDatabase(database) {
        this.database = database;
    }
    add(data, overwrite) {
        data.useDebug(this.#debug, "stat");
        if (this.database)
            data.useDatabase(this.database);
        return super.add(data, overwrite);
    }
    /**Init all stats and run `onInit()` listeners. */
    async init() {
        if (!this.database)
            throw new base_1.ODSystemError("Unable to initialize stats scopes due to missing database!");
        //get all valid categories
        const validCategories = [];
        for (const scope of this.getAll()) {
            validCategories.push(...scope.init());
        }
        //filter out the deletable stats
        const deletableStats = [];
        const data = await this.database.getAll();
        data.forEach((data) => {
            if (!validCategories.includes(data.category))
                deletableStats.push(data);
        });
        //do additional deletion
        for (const cb of this.#initListeners) {
            await cb(data, deletableStats);
        }
        //delete all deletable stats
        for (const data of deletableStats) {
            if (!this.database)
                return;
            await this.database.delete(data.category, data.key);
        }
    }
    /**Reset all stats. (clears the entire database) */
    async reset() {
        if (!this.database)
            return;
        const data = await this.database.getAll();
        for (const d of data) {
            if (!this.database)
                return;
            await this.database.delete(d.category, d.key);
        }
    }
    /**Run a function when the stats are initialized. This can be used to clear stats from users that left the server or tickets which don't exist anymore. */
    onInit(callback) {
        this.#initListeners.push(callback);
    }
}
exports.ODStatsManager = ODStatsManager;
/**## ODStatScope `class`
 * This is an Open Ticket stat scope.
 *
 * A scope can contain multiple stats. Every scope is seperated from other scopes.
 * Here, you can read & write the values of all stats.
 *
 * The built-in Open Ticket scopes are: `global`, `user`, `ticket`
 */
class ODStatScope extends base_1.ODManager {
    /**The id of this statistics scope. */
    id;
    /**Is this stat scope already initialized? */
    ready = false;
    /**Alias to Open Ticket stats database. */
    database = null;
    /**The name of this scope (used in embed title) */
    name;
    constructor(id, name) {
        super();
        this.id = new base_1.ODId(id);
        this.name = name;
    }
    /**Select the database to use to read/write all stats from/to. (Automatically assigned when used in `ODStatsManager`) */
    useDatabase(database) {
        this.database = database;
    }
    /**Get the value of a statistic. The `scopeId` is the unique id of the user, channel, role, etc that the stats are related to. */
    async getStat(id, scopeId) {
        if (!this.database)
            return null;
        const newId = new base_1.ODId(id);
        const data = await this.database.get(this.id.value + "_" + newId.value, scopeId);
        if (typeof data == "undefined") {
            //set stats to default value & return
            return this.resetStat(id, scopeId);
        }
        else if (typeof data == "string" || typeof data == "boolean" || typeof data == "number") {
            //return value received from database
            return data;
        }
        //return null on error
        return null;
    }
    /**Get the value of a statistic for all `scopeId`'s. The `scopeId` is the unique id of the user, channel, role, etc that the stats are related to. */
    async getAllStats(id) {
        if (!this.database)
            return [];
        const newId = new base_1.ODId(id);
        const data = await this.database.getCategory(this.id.value + "_" + newId.value) ?? [];
        const output = [];
        for (const stat of data) {
            if (typeof stat.value == "string" || typeof stat.value == "boolean" || typeof stat.value == "number") {
                //return value received from database
                output.push({ id: stat.key, value: stat.value });
            }
        }
        //return null on error
        return output;
    }
    /**Set, increase or decrease the value of a statistic. The `scopeId` is the unique id of the user, channel, role, etc that the stats are related to. */
    async setStat(id, scopeId, value, mode) {
        if (!this.database)
            return false;
        const stat = this.get(id);
        if (!stat)
            return false;
        if (mode == "set" || typeof value != "number") {
            await this.database.set(this.id.value + "_" + stat.id.value, scopeId, value);
        }
        else if (mode == "increase") {
            const currentValue = await this.getStat(id, scopeId);
            if (typeof currentValue != "number")
                await this.database.set(this.id.value + "_" + stat.id.value, scopeId, 0 + value);
            else
                await this.database.set(this.id.value + "_" + stat.id.value, scopeId, currentValue + value);
        }
        else if (mode == "decrease") {
            const currentValue = await this.getStat(id, scopeId);
            if (typeof currentValue != "number")
                await this.database.set(this.id.value + "_" + stat.id.value, scopeId, 0 - value);
            else
                await this.database.set(this.id.value + "_" + stat.id.value, scopeId, currentValue - value);
        }
        return true;
    }
    /**Reset the value of a statistic to the initial value. The `scopeId` is the unique id of the user, channel, role, etc that the stats are related to. */
    async resetStat(id, scopeId) {
        if (!this.database)
            return null;
        const stat = this.get(id);
        if (!stat)
            return null;
        if (stat.value != null)
            await this.database.set(this.id.value + "_" + stat.id.value, scopeId, stat.value);
        return stat.value;
    }
    /**Initialize this stat scope & return a list of all statistic ids in the following format: `<scopeid>_<statid>`  */
    init() {
        //get all valid stats categories
        this.ready = true;
        return this.getAll().map((stat) => this.id.value + "_" + stat.id.value);
    }
    /**Render all stats in this scope for usage in a discord message/embed. */
    async render(scopeId, guild, channel, user) {
        //sort from high priority to low
        const derefArray = [...this.getAll()];
        derefArray.sort((a, b) => {
            return b.priority - a.priority;
        });
        const result = [];
        for (const stat of derefArray) {
            try {
                if (stat instanceof ODDynamicStat) {
                    //dynamic render (without value)
                    result.push(await stat.render("", scopeId, guild, channel, user));
                }
                else {
                    //normal render (with value)
                    const value = await this.getStat(stat.id, scopeId);
                    if (value != null)
                        result.push(await stat.render(value, scopeId, guild, channel, user));
                }
            }
            catch (err) {
                process.emit("uncaughtException", err);
            }
        }
        return result.filter((stat) => stat !== "").join("\n");
    }
}
exports.ODStatScope = ODStatScope;
/**## ODStatGlobalScope `class`
 * This is an Open Ticket stat global scope.
 *
 * A scope can contain multiple stats. Every scope is seperated from other scopes.
 * Here, you can read & write the values of all stats.
 *
 * This scope is made specifically for the global stats of Open Ticket.
 */
class ODStatGlobalScope extends ODStatScope {
    getStat(id) {
        return super.getStat(id, "GLOBAL");
    }
    getAllStats(id) {
        return super.getAllStats(id);
    }
    setStat(id, value, mode) {
        return super.setStat(id, "GLOBAL", value, mode);
    }
    resetStat(id) {
        return super.resetStat(id, "GLOBAL");
    }
    render(scopeId, guild, channel, user) {
        return super.render("GLOBAL", guild, channel, user);
    }
}
exports.ODStatGlobalScope = ODStatGlobalScope;
/**## ODStat `class`
 * This is an Open Ticket statistic.
 *
 * This single statistic doesn't do anything except defining the rules of this statistic.
 * Use it in a stats scope to register a new statistic. A statistic can also include a priority to choose the render priority.
 *
 * It's recommended to use the `ODBasicStat` & `ODDynamicStat` classes instead of this one!
 */
class ODStat extends base_1.ODManagerData {
    /**The priority of this statistic. */
    priority;
    /**The render function of this statistic. */
    render;
    /**The value of this statistic. */
    value;
    constructor(id, priority, render, value) {
        super(id);
        this.priority = priority;
        this.render = render;
        this.value = value ?? null;
    }
}
exports.ODStat = ODStat;
/**## ODBasicStat `class`
 * This is an Open Ticket basic statistic.
 *
 * This single statistic will store a number, boolean or string in the database.
 * Use it to create a simple statistic for any stats scope.
 */
class ODBasicStat extends ODStat {
    /**The name of this stat. Rendered in discord embeds/messages. */
    name;
    constructor(id, priority, name, value) {
        super(id, priority, (value) => {
            return "" + name + ": `" + value.toString() + "`";
        }, value);
        this.name = name;
    }
}
exports.ODBasicStat = ODBasicStat;
/**## ODDynamicStat `class`
 * This is an Open Ticket dynamic statistic.
 *
 * A dynamic statistic does not store anything in the database! Instead, it will execute a function to return a custom result.
 * This can be used to show statistics which are not stored in the database.
 *
 * This is used in Open Ticket for the live ticket status, participants & system status.
 */
class ODDynamicStat extends ODStat {
    constructor(id, priority, render) {
        super(id, priority, (value, scopeId, guild, channel, user) => {
            return render(scopeId, guild, channel, user);
        });
    }
}
exports.ODDynamicStat = ODDynamicStat;
