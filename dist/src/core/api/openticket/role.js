"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODRoleData = exports.ODRole = exports.ODRoleManager = void 0;
///////////////////////////////////////
//OPENTICKET ROLE MODULE
///////////////////////////////////////
const base_1 = require("../modules/base");
/**## ODRoleManager `class`
 * This is an Open Ticket role manager.
 *
 * This class manages all registered reaction roles in the bot.
 *
 * Roles are not stored in the database and will be parsed from the config every startup.
 */
class ODRoleManager extends base_1.ODManager {
    /**A reference to the Open Ticket debugger. */
    #debug;
    constructor(debug) {
        super(debug, "role");
        this.#debug = debug;
    }
    add(data, overwrite) {
        data.useDebug(this.#debug, "role data");
        return super.add(data, overwrite);
    }
}
exports.ODRoleManager = ODRoleManager;
/**## ODRole `class`
 * This is an Open Ticket role.
 *
 * This class contains all data related to this role (parsed from the config).
 *
 * These properties will be used to handle reaction role options.
 */
class ODRole extends base_1.ODManager {
    /**The id of this role. (from the config) */
    id;
    constructor(id, data) {
        super();
        this.id = new base_1.ODId(id);
        data.forEach((data) => {
            this.add(data);
        });
    }
    /**Convert this role to a JSON object for storing this role in the database. */
    toJson(version) {
        const data = this.getAll().map((data) => {
            return {
                id: data.id.toString(),
                value: data.value
            };
        });
        return {
            id: this.id.toString(),
            version: version.toString(),
            data
        };
    }
    /**Create a role from a JSON object in the database. */
    static fromJson(json) {
        return new ODRole(json.id, json.data.map((data) => new ODRoleData(data.id, data.value)));
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
}
exports.ODRole = ODRole;
/**## ODRoleData `class`
 * This is Open Ticket role data.
 *
 * This class contains a single property for a role. (string, number, boolean, object, array, null)
 *
 * When this property is edited, the database will be updated automatically.
 */
class ODRoleData extends base_1.ODManagerData {
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
    /**Refresh the database. Is only required to be used when updating `ODRoleData` with an object/array as value. */
    refreshDatabase() {
        this._change();
    }
}
exports.ODRoleData = ODRoleData;
