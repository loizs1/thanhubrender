"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODOptionRandomHexSuffix = exports.ODOptionRandomNumberSuffix = exports.ODOptionCounterFixedSuffix = exports.ODOptionCounterDynamicSuffix = exports.ODOptionUserIdSuffix = exports.ODOptionUserNicknameSuffix = exports.ODOptionUserNameSuffix = exports.ODOptionSuffix = exports.ODOptionSuffixManager = exports.ODRoleOption = exports.ODWebsiteOption = exports.ODTicketOption = exports.ODOptionData = exports.ODOption = exports.ODOptionManager = void 0;
const base_1 = require("../modules/base");
const crypto = __importStar(require("crypto"));
/**## ODOptionManager `class`
 * This is an Open Ticket option manager.
 *
 * This class manages all registered options in the bot. This also includes temporary options generated from tickets where the original option got deleted.
 *
 * All option types including: tickets, websites & reaction roles are stored here.
 */
class ODOptionManager extends base_1.ODManager {
    /**A reference to the Open Ticket debugger. */
    #debug;
    /**The option suffix manager used to generate channel suffixes for ticket names. */
    suffix;
    constructor(debug) {
        super(debug, "option");
        this.#debug = debug;
        this.suffix = new ODOptionSuffixManager(debug);
    }
    add(data, overwrite) {
        data.useDebug(this.#debug, "option data");
        return super.add(data, overwrite);
    }
}
exports.ODOptionManager = ODOptionManager;
/**## ODOption `class`
 * This is an Open Ticket option.
 *
 * This class contains all data related to this option (parsed from the config).
 *
 * It's recommended to use `ODTicketOption`, `ODWebsiteOption` or `ODRoleOption` instead!
 */
class ODOption extends base_1.ODManager {
    /**The id of this option. (from the config) */
    id;
    /**The type of this option. (e.g. `opendiscord:ticket`, `opendiscord:website`, `opendiscord:role`) */
    type;
    constructor(id, type, data) {
        super();
        this.id = new base_1.ODId(id);
        this.type = type;
        data.forEach((data) => {
            this.add(data);
        });
    }
    /**Convert this option to a JSON object for storing this option in the database. */
    toJson(version) {
        const data = this.getAll().map((data) => {
            return {
                id: data.id.toString(),
                value: data.value
            };
        });
        return {
            id: this.id.toString(),
            type: this.type,
            version: version.toString(),
            data
        };
    }
    /**Create an option from a JSON object in the database. */
    static fromJson(json) {
        return new ODOption(json.id, json.type, json.data.map((data) => new ODOptionData(data.id, data.value)));
    }
}
exports.ODOption = ODOption;
/**## ODOptionData `class`
 * This is Open Ticket option data.
 *
 * This class contains a single property for an option. (string, number, boolean, object, array, null)
 *
 * When this property is edited, the database will be updated automatically.
 */
class ODOptionData extends base_1.ODManagerData {
    /**The value of this property. */
    #value;
    constructor(id, value) {
        super(id);
        this.#value = value;
    }
    /**The value of this property. */
    set value(value) {
        this.#value = value;
        this._change();
    }
    get value() {
        return this.#value;
    }
    /**Refresh the database. Is only required to be used when updating `ODOptionData` with an object/array as value. */
    refreshDatabase() {
        this._change();
    }
}
exports.ODOptionData = ODOptionData;
/**## ODTicketOption `class`
 * This is an Open Ticket ticket option.
 *
 * This class contains all data related to an Open Ticket ticket option (parsed from the config).
 *
 * Use this option to create a new ticket!
 */
class ODTicketOption extends ODOption {
    type = "opendiscord:ticket";
    constructor(id, data) {
        super(id, "opendiscord:ticket", data);
    }
    get(id) {
        return super.get(id);
    }
    remove(id) {
        return super.remove(id);
    }
    exists(id) {
        return super.exists(id);
    }
    static fromJson(json) {
        return new ODTicketOption(json.id, json.data.map((data) => new ODOptionData(data.id, data.value)));
    }
}
exports.ODTicketOption = ODTicketOption;
/**## ODWebsiteOption `class`
 * This is an Open Ticket website option.
 *
 * This class contains all data related to an Open Ticket website option (parsed from the config).
 *
 * Use this option to create a button which links to a website!
 */
class ODWebsiteOption extends ODOption {
    type = "opendiscord:website";
    constructor(id, data) {
        super(id, "opendiscord:website", data);
    }
    get(id) {
        return super.get(id);
    }
    remove(id) {
        return super.remove(id);
    }
    exists(id) {
        return super.exists(id);
    }
    static fromJson(json) {
        return new ODWebsiteOption(json.id, json.data.map((data) => new ODOptionData(data.id, data.value)));
    }
}
exports.ODWebsiteOption = ODWebsiteOption;
/**## ODRoleOption `class`
 * This is an Open Ticket role option.
 *
 * This class contains all data related to an Open Ticket role option (parsed from the config).
 *
 * Use this option to create a button for reaction roles!
 */
class ODRoleOption extends ODOption {
    type = "opendiscord:role";
    constructor(id, data) {
        super(id, "opendiscord:role", data);
    }
    get(id) {
        return super.get(id);
    }
    remove(id) {
        return super.remove(id);
    }
    exists(id) {
        return super.exists(id);
    }
    static fromJson(json) {
        return new ODRoleOption(json.id, json.data.map((data) => new ODOptionData(data.id, data.value)));
    }
}
exports.ODRoleOption = ODRoleOption;
/**## ODOptionSuffixManager `class`
 * This is an Open Ticket option suffix manager.
 *
 * This class manages all suffixes from option in the bot. The id of an option suffix is the same as the option id.
 *
 * All ticket options should have a corresponding option suffix class.
 */
class ODOptionSuffixManager extends base_1.ODManager {
    constructor(debug) {
        super(debug, "ticket suffix");
    }
    /**Instantly get the suffix from an `ODTicketOption`. */
    async getSuffixFromOption(option, user, guild) {
        const suffix = this.getAll().find((suffix) => suffix.option.id.value == option.id.value);
        if (!suffix)
            return null;
        try {
            const member = await this.#getMember(guild, user);
            if (!member)
                return null;
            return await suffix.getSuffix(member);
        }
        catch (err) {
            process.emit("uncaughtException", err);
            return null;
        }
    }
    async #getMember(guild, user) {
        try {
            return await guild.members.fetch(user.id);
        }
        catch {
            return null;
        }
    }
}
exports.ODOptionSuffixManager = ODOptionSuffixManager;
/**## ODOptionSuffix `class`
 * This is an Open Ticket option suffix.
 *
 * This class can generate a suffix for a discord channel name from a specific option.
 *
 * Use `getSuffix()` to get the new suffix!
 */
class ODOptionSuffix extends base_1.ODManagerData {
    /**The option of this suffix. */
    option;
    constructor(id, option) {
        super(id);
        this.option = option;
    }
    /**Get the suffix for a new ticket. */
    async getSuffix(member) {
        throw new base_1.ODSystemError("Tried to use an unimplemented ODOptionSuffix!");
    }
}
exports.ODOptionSuffix = ODOptionSuffix;
/**## ODOptionUserNameSuffix `class`
 * This is an Open Ticket user-name option suffix.
 *
 * This class can generate a user-name suffix for a discord channel name from a specific option.
 *
 * Use `getSuffix()` to get the new suffix!
 */
class ODOptionUserNameSuffix extends ODOptionSuffix {
    async getSuffix(member) {
        return member.user.username;
    }
}
exports.ODOptionUserNameSuffix = ODOptionUserNameSuffix;
/**## ODOptionUserNicknameSuffix `class`
 * This is an Open Ticket user-nickname option suffix.
 *
 * This class can generate a user-nickname suffix for a discord channel name from a specific option.
 *
 * Use `getSuffix()` to get the new suffix!
 */
class ODOptionUserNicknameSuffix extends ODOptionSuffix {
    async getSuffix(member) {
        return member.displayName;
    }
}
exports.ODOptionUserNicknameSuffix = ODOptionUserNicknameSuffix;
/**## ODOptionUserIdSuffix `class`
 * This is an Open Ticket user-id option suffix.
 *
 * This class can generate a user-id suffix for a discord channel name from a specific option.
 *
 * Use `getSuffix()` to get the new suffix!
 */
class ODOptionUserIdSuffix extends ODOptionSuffix {
    async getSuffix(member) {
        return member.id;
    }
}
exports.ODOptionUserIdSuffix = ODOptionUserIdSuffix;
/**## ODOptionCounterDynamicSuffix `class`
 * This is an Open Ticket counter-dynamic option suffix.
 *
 * This class can generate a counter-dynamic suffix for a discord channel name from a specific option.
 *
 * Use `getSuffix()` to get the new suffix!
 */
class ODOptionCounterDynamicSuffix extends ODOptionSuffix {
    /**The database where the value of this counter is stored. */
    database;
    constructor(id, option, database) {
        super(id, option);
        this.database = database;
        this.#init();
    }
    /**Initialize the database for this suffix. */
    async #init() {
        if (!await this.database.exists("opendiscord:option-suffix-counter", this.option.id.value))
            await this.database.set("opendiscord:option-suffix-counter", this.option.id.value, 0);
    }
    async getSuffix(member) {
        const rawCurrentValue = await this.database.get("opendiscord:option-suffix-counter", this.option.id.value);
        const currentValue = (typeof rawCurrentValue != "number") ? 0 : rawCurrentValue;
        const newValue = currentValue + 1;
        await this.database.set("opendiscord:option-suffix-counter", this.option.id.value, newValue);
        return newValue.toString();
    }
}
exports.ODOptionCounterDynamicSuffix = ODOptionCounterDynamicSuffix;
/**## ODOptionCounterFixedSuffix `class`
 * This is an Open Ticket counter-fixed option suffix.
 *
 * This class can generate a counter-fixed suffix for a discord channel name from a specific option.
 *
 * Use `getSuffix()` to get the new suffix!
 */
class ODOptionCounterFixedSuffix extends ODOptionSuffix {
    /**The database where the value of this counter is stored. */
    database;
    constructor(id, option, database) {
        super(id, option);
        this.database = database;
        this.#init();
    }
    /**Initialize the database for this suffix. */
    async #init() {
        if (!await this.database.exists("opendiscord:option-suffix-counter", this.option.id.value))
            await this.database.set("opendiscord:option-suffix-counter", this.option.id.value, 0);
    }
    async getSuffix(member) {
        const rawCurrentValue = await this.database.get("opendiscord:option-suffix-counter", this.option.id.value);
        const currentValue = (typeof rawCurrentValue != "number") ? 0 : rawCurrentValue;
        const newValue = (currentValue >= 9999) ? 0 : currentValue + 1;
        await this.database.set("opendiscord:option-suffix-counter", this.option.id.value, newValue);
        if (newValue.toString().length == 1)
            return "000" + newValue.toString();
        else if (newValue.toString().length == 2)
            return "00" + newValue.toString();
        else if (newValue.toString().length == 3)
            return "0" + newValue.toString();
        else
            return newValue.toString();
    }
}
exports.ODOptionCounterFixedSuffix = ODOptionCounterFixedSuffix;
/**## ODOptionRandomNumberSuffix `class`
 * This is an Open Ticket random-number option suffix.
 *
 * This class can generate a random-number suffix for a discord channel name from a specific option.
 *
 * Use `getSuffix()` to get the new suffix!
 */
class ODOptionRandomNumberSuffix extends ODOptionSuffix {
    /**The database where previous random numbers are stored. */
    database;
    constructor(id, option, database) {
        super(id, option);
        this.database = database;
        this.#init();
    }
    /**Initialize the database for this suffix. */
    async #init() {
        if (!await this.database.exists("opendiscord:option-suffix-history", this.option.id.value))
            await this.database.set("opendiscord:option-suffix-history", this.option.id.value, []);
    }
    /**Get a unique number for this suffix. */
    #generateUniqueValue(history) {
        const rawNumber = Math.round(Math.random() * 1000).toString();
        let number = rawNumber;
        if (rawNumber.length == 1)
            number = "000" + rawNumber;
        else if (rawNumber.length == 2)
            number = "00" + rawNumber;
        else if (rawNumber.length == 3)
            number = "0" + rawNumber;
        if (history.includes(number))
            return this.#generateUniqueValue(history);
        else
            return number;
    }
    async getSuffix(member) {
        const rawCurrentValues = await this.database.get("opendiscord:option-suffix-history", this.option.id.value);
        const currentValues = ((Array.isArray(rawCurrentValues)) ? rawCurrentValues : []);
        const newValue = this.#generateUniqueValue(currentValues);
        currentValues.push(newValue);
        if (currentValues.length > 50)
            currentValues.shift();
        await this.database.set("opendiscord:option-suffix-history", this.option.id.value, currentValues);
        return newValue;
    }
}
exports.ODOptionRandomNumberSuffix = ODOptionRandomNumberSuffix;
/**## ODOptionRandomHexSuffix `class`
 * This is an Open Ticket random-hex option suffix.
 *
 * This class can generate a random-hex suffix for a discord channel name from a specific option.
 *
 * Use `getSuffix()` to get the new suffix!
 */
class ODOptionRandomHexSuffix extends ODOptionSuffix {
    /**The database where previous random hexes are stored. */
    database;
    constructor(id, option, database) {
        super(id, option);
        this.database = database;
        this.#init();
    }
    /**Initialize the database for this suffix. */
    async #init() {
        if (!await this.database.exists("opendiscord:option-suffix-history", this.option.id.value))
            await this.database.set("opendiscord:option-suffix-history", this.option.id.value, []);
    }
    /**Get a unique hex-string for this suffix. */
    #generateUniqueValue(history) {
        const hex = crypto.randomBytes(2).toString("hex");
        if (history.includes(hex))
            return this.#generateUniqueValue(history);
        else
            return hex;
    }
    async getSuffix(member) {
        const rawCurrentValues = await this.database.get("opendiscord:option-suffix-history", this.option.id.value);
        const currentValues = ((Array.isArray(rawCurrentValues)) ? rawCurrentValues : []);
        const newValue = this.#generateUniqueValue(currentValues);
        currentValues.push(newValue);
        if (currentValues.length > 50)
            currentValues.shift();
        await this.database.set("opendiscord:option-suffix-history", this.option.id.value, currentValues);
        return newValue;
    }
}
exports.ODOptionRandomHexSuffix = ODOptionRandomHexSuffix;
