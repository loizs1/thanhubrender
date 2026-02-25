import { ODId, ODManager, ODValidJsonType, ODValidId, ODVersion, ODManagerData } from "../modules/base";
import { ODDebugger } from "../modules/console";
import * as discord from "discord.js";
/**## ODRoleManager `class`
 * This is an Open Ticket role manager.
 *
 * This class manages all registered reaction roles in the bot.
 *
 * Roles are not stored in the database and will be parsed from the config every startup.
 */
export declare class ODRoleManager extends ODManager<ODRole> {
    #private;
    constructor(debug: ODDebugger);
    add(data: ODRole, overwrite?: boolean): boolean;
}
/**## ODRoleDataJson `interface`
 * The JSON representatation from a single role property.
 */
export interface ODRoleDataJson {
    /**The id of this property. */
    id: string;
    /**The value of this property. */
    value: ODValidJsonType;
}
/**## ODRoleJson `interface`
 * The JSON representatation from a single role.
 */
export interface ODRoleJson {
    /**The id of this role. */
    id: string;
    /**The version of Open Ticket used to create this role. */
    version: string;
    /**The full list of properties/variables related to this role. */
    data: ODRoleDataJson[];
}
/**## ODRoleIds `type`
 * This interface is a list of ids available in the `ODRole` class.
 * It's used to generate typescript declarations for this class.
 */
export interface ODRoleIds {
    "opendiscord:roles": ODRoleData<string[]>;
    "opendiscord:mode": ODRoleData<ODRoleUpdateMode>;
    "opendiscord:remove-roles-on-add": ODRoleData<string[]>;
    "opendiscord:add-on-join": ODRoleData<boolean>;
}
/**## ODRole `class`
 * This is an Open Ticket role.
 *
 * This class contains all data related to this role (parsed from the config).
 *
 * These properties will be used to handle reaction role options.
 */
export declare class ODRole extends ODManager<ODRoleData<ODValidJsonType>> {
    /**The id of this role. (from the config) */
    id: ODId;
    constructor(id: ODValidId, data: ODRoleData<ODValidJsonType>[]);
    /**Convert this role to a JSON object for storing this role in the database. */
    toJson(version: ODVersion): ODRoleJson;
    /**Create a role from a JSON object in the database. */
    static fromJson(json: ODRoleJson): ODRole;
    get<OptionId extends keyof ODRoleIds>(id: OptionId): ODRoleIds[OptionId];
    get(id: ODValidId): ODRoleData<ODValidJsonType> | null;
    remove<OptionId extends keyof ODRoleIds>(id: OptionId): ODRoleIds[OptionId];
    remove(id: ODValidId): ODRoleData<ODValidJsonType> | null;
    exists(id: keyof ODRoleIds): boolean;
    exists(id: ODValidId): boolean;
}
/**## ODRoleData `class`
 * This is Open Ticket role data.
 *
 * This class contains a single property for a role. (string, number, boolean, object, array, null)
 *
 * When this property is edited, the database will be updated automatically.
 */
export declare class ODRoleData<DataType extends ODValidJsonType> extends ODManagerData {
    #private;
    constructor(id: ODValidId, value: DataType);
    /**The value of this property. */
    set value(value: DataType);
    get value(): DataType;
    /**Refresh the database. Is only required to be used when updating `ODRoleData` with an object/array as value. */
    refreshDatabase(): void;
}
/**## ODRoleUpdateResult `interface`
 * This interface represents the result of a single role when the roles of users are updated.
 */
export interface ODRoleUpdateResult {
    /**The role which was affected. */
    role: discord.Role;
    /**The action which was done. `null` when nothing happend. */
    action: "added" | "removed" | null;
}
/**## ODRoleUpdateMode `type`
 * This is the mode of the reaction role option in the config.
 */
export type ODRoleUpdateMode = "add&remove" | "add" | "remove";
