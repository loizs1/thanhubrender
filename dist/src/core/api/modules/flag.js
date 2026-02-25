"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODFlagManager = exports.ODFlag = void 0;
///////////////////////////////////////
//FLAG MODULE
///////////////////////////////////////
const base_1 = require("./base");
/**## ODFlag `class`
 * This is an Open Ticket flag.
 *
 * A flag is a boolean that can be specified by a parameter in the console.
 * It's useful for small settings that are only required once in a while.
 *
 * Flags can also be enabled manually by plugins!
 */
class ODFlag extends base_1.ODManagerData {
    /**The method that has been used to set the value of this flag. (`null` when not set) */
    method = null;
    /**The name of this flag. Visible to the user. */
    name;
    /**The description of this flag. Visible to the user. */
    description;
    /**The name of the parameter in the console. (e.g. `--test`) */
    param;
    /**A list of aliases for the parameter in the console. */
    aliases;
    /**The value of this flag. */
    value = false;
    constructor(id, name, description, param, aliases, initialValue) {
        super(id);
        this.name = name;
        this.description = description;
        this.param = param;
        this.aliases = aliases ?? [];
        this.value = initialValue ?? false;
    }
    /**Set the value of this flag. */
    setValue(value, method) {
        this.value = value;
        this.method = method ?? "manual";
    }
    /**Detect if the process contains the param or aliases & set the value. Use `force` to overwrite a manually set value. */
    detectProcessParams(force) {
        if (force) {
            const params = [this.param, ...this.aliases];
            this.setValue(params.some((p) => process.argv.includes(p)), "param");
        }
        else if (this.method != "manual") {
            const params = [this.param, ...this.aliases];
            this.setValue(params.some((p) => process.argv.includes(p)), "param");
        }
    }
}
exports.ODFlag = ODFlag;
/**## ODFlagManager `class`
 * This is an Open Ticket flag manager.
 *
 * This class is responsible for managing & initiating all flags of the bot.
 * It also contains a shortcut for initiating all flags.
 */
class ODFlagManager extends base_1.ODManager {
    constructor(debug) {
        super(debug, "flag");
    }
    /**Set all flags to their `process.argv` value. */
    async init() {
        await this.loopAll((flag) => {
            flag.detectProcessParams(false);
        });
    }
}
exports.ODFlagManager = ODFlagManager;
