import { ODDatabase } from "../modules/database";
import { ODJsonConfig_DefaultOptionEmbedSettingsType, ODJsonConfig_DefaultOptionPingSettingsType } from "../defaults/config";
import { ODId, ODManager, ODValidJsonType, ODValidId, ODVersion, ODValidButtonColor, ODManagerData } from "../modules/base";
import { ODDebugger } from "../modules/console";
import * as discord from "discord.js";
import { ODRoleUpdateMode } from "./role";
/**## ODOptionManager `class`
 * This is an Open Ticket option manager.
 *
 * This class manages all registered options in the bot. This also includes temporary options generated from tickets where the original option got deleted.
 *
 * All option types including: tickets, websites & reaction roles are stored here.
 */
export declare class ODOptionManager extends ODManager<ODOption> {
    #private;
    /**The option suffix manager used to generate channel suffixes for ticket names. */
    suffix: ODOptionSuffixManager;
    constructor(debug: ODDebugger);
    add(data: ODOption, overwrite?: boolean): boolean;
}
/**## ODOptionDataJson `interface`
 * The JSON representatation from a single option property.
 */
export interface ODOptionDataJson {
    /**The id of this property. */
    id: string;
    /**The value of this property. */
    value: ODValidJsonType;
}
/**## ODOptionDataJson `interface`
 * The JSON representatation from a single option.
 */
export interface ODOptionJson {
    /**The id of this option. */
    id: string;
    /**The type of this option. (e.g. `opendiscord:ticket`, `opendiscord:website`, `opendiscord:role`) */
    type: string;
    /**The version of Open Ticket used to create this option & store it in the database. */
    version: string;
    /**The full list of properties/variables related to this option. */
    data: ODOptionDataJson[];
}
/**## ODOption `class`
 * This is an Open Ticket option.
 *
 * This class contains all data related to this option (parsed from the config).
 *
 * It's recommended to use `ODTicketOption`, `ODWebsiteOption` or `ODRoleOption` instead!
 */
export declare class ODOption extends ODManager<ODOptionData<ODValidJsonType>> {
    /**The id of this option. (from the config) */
    id: ODId;
    /**The type of this option. (e.g. `opendiscord:ticket`, `opendiscord:website`, `opendiscord:role`) */
    type: string;
    constructor(id: ODValidId, type: string, data: ODOptionData<ODValidJsonType>[]);
    /**Convert this option to a JSON object for storing this option in the database. */
    toJson(version: ODVersion): ODOptionJson;
    /**Create an option from a JSON object in the database. */
    static fromJson(json: ODOptionJson): ODOption;
}
/**## ODOptionData `class`
 * This is Open Ticket option data.
 *
 * This class contains a single property for an option. (string, number, boolean, object, array, null)
 *
 * When this property is edited, the database will be updated automatically.
 */
export declare class ODOptionData<DataType extends ODValidJsonType> extends ODManagerData {
    #private;
    constructor(id: ODValidId, value: DataType);
    /**The value of this property. */
    set value(value: DataType);
    get value(): DataType;
    /**Refresh the database. Is only required to be used when updating `ODOptionData` with an object/array as value. */
    refreshDatabase(): void;
}
/**## ODTicketOptionIds `type`
 * This interface is a list of ids available in the `ODTicketOption` class.
 * It's used to generate typescript declarations for this class.
 */
export interface ODTicketOptionIds {
    "opendiscord:name": ODOptionData<string>;
    "opendiscord:description": ODOptionData<string>;
    "opendiscord:button-emoji": ODOptionData<string>;
    "opendiscord:button-label": ODOptionData<string>;
    "opendiscord:button-color": ODOptionData<ODValidButtonColor>;
    "opendiscord:admins": ODOptionData<string[]>;
    "opendiscord:admins-readonly": ODOptionData<string[]>;
    "opendiscord:allow-blacklisted-users": ODOptionData<boolean>;
    "opendiscord:questions": ODOptionData<string[]>;
    "opendiscord:channel-prefix": ODOptionData<string>;
    "opendiscord:channel-suffix": ODOptionData<"user-name" | "user-nickname" | "user-id" | "random-number" | "random-hex" | "counter-dynamic" | "counter-fixed">;
    "opendiscord:channel-category": ODOptionData<string>;
    "opendiscord:channel-category-closed": ODOptionData<string>;
    "opendiscord:channel-category-backup": ODOptionData<string>;
    "opendiscord:channel-categories-claimed": ODOptionData<{
        user: string;
        category: string;
    }[]>;
    "opendiscord:channel-topic": ODOptionData<string>;
    "opendiscord:dm-message-enabled": ODOptionData<boolean>;
    "opendiscord:dm-message-text": ODOptionData<string>;
    "opendiscord:dm-message-embed": ODOptionData<ODJsonConfig_DefaultOptionEmbedSettingsType>;
    "opendiscord:ticket-message-enabled": ODOptionData<boolean>;
    "opendiscord:ticket-message-text": ODOptionData<string>;
    "opendiscord:ticket-message-embed": ODOptionData<ODJsonConfig_DefaultOptionEmbedSettingsType>;
    "opendiscord:ticket-message-ping": ODOptionData<ODJsonConfig_DefaultOptionPingSettingsType>;
    "opendiscord:autoclose-enable-hours": ODOptionData<boolean>;
    "opendiscord:autoclose-enable-leave": ODOptionData<boolean>;
    "opendiscord:autoclose-disable-claim": ODOptionData<boolean>;
    "opendiscord:autoclose-hours": ODOptionData<number>;
    "opendiscord:autodelete-enable-days": ODOptionData<boolean>;
    "opendiscord:autodelete-enable-leave": ODOptionData<boolean>;
    "opendiscord:autodelete-disable-claim": ODOptionData<boolean>;
    "opendiscord:autodelete-days": ODOptionData<number>;
    "opendiscord:cooldown-enabled": ODOptionData<boolean>;
    "opendiscord:cooldown-minutes": ODOptionData<number>;
    "opendiscord:limits-enabled": ODOptionData<boolean>;
    "opendiscord:limits-maximum-global": ODOptionData<number>;
    "opendiscord:limits-maximum-user": ODOptionData<number>;
    "opendiscord:slowmode-enabled": ODOptionData<boolean>;
    "opendiscord:slowmode-seconds": ODOptionData<number>;
}
/**## ODTicketOption `class`
 * This is an Open Ticket ticket option.
 *
 * This class contains all data related to an Open Ticket ticket option (parsed from the config).
 *
 * Use this option to create a new ticket!
 */
export declare class ODTicketOption extends ODOption {
    type: "opendiscord:ticket";
    constructor(id: ODValidId, data: ODOptionData<ODValidJsonType>[]);
    get<OptionId extends keyof ODTicketOptionIds>(id: OptionId): ODTicketOptionIds[OptionId];
    get(id: ODValidId): ODOptionData<ODValidJsonType> | null;
    remove<OptionId extends keyof ODTicketOptionIds>(id: OptionId): ODTicketOptionIds[OptionId];
    remove(id: ODValidId): ODOptionData<ODValidJsonType> | null;
    exists(id: keyof ODTicketOptionIds): boolean;
    exists(id: ODValidId): boolean;
    static fromJson(json: ODOptionJson): ODTicketOption;
}
/**## ODWebsiteOptionIds `type`
 * This interface is a list of ids available in the `ODWebsiteOption` class.
 * It's used to generate typescript declarations for this class.
 */
export interface ODWebsiteOptionIds {
    "opendiscord:name": ODOptionData<string>;
    "opendiscord:description": ODOptionData<string>;
    "opendiscord:button-emoji": ODOptionData<string>;
    "opendiscord:button-label": ODOptionData<string>;
    "opendiscord:url": ODOptionData<string>;
}
/**## ODWebsiteOption `class`
 * This is an Open Ticket website option.
 *
 * This class contains all data related to an Open Ticket website option (parsed from the config).
 *
 * Use this option to create a button which links to a website!
 */
export declare class ODWebsiteOption extends ODOption {
    type: "opendiscord:website";
    constructor(id: ODValidId, data: ODOptionData<ODValidJsonType>[]);
    get<OptionId extends keyof ODWebsiteOptionIds>(id: OptionId): ODWebsiteOptionIds[OptionId];
    get(id: ODValidId): ODOptionData<ODValidJsonType> | null;
    remove<OptionId extends keyof ODWebsiteOptionIds>(id: OptionId): ODWebsiteOptionIds[OptionId];
    remove(id: ODValidId): ODOptionData<ODValidJsonType> | null;
    exists(id: keyof ODWebsiteOptionIds): boolean;
    exists(id: ODValidId): boolean;
    static fromJson(json: ODOptionJson): ODWebsiteOption;
}
/**## ODRoleOptionIds `type`
 * This interface is a list of ids available in the `ODRoleOption` class.
 * It's used to generate typescript declarations for this class.
 */
export interface ODRoleOptionIds {
    "opendiscord:name": ODOptionData<string>;
    "opendiscord:description": ODOptionData<string>;
    "opendiscord:button-emoji": ODOptionData<string>;
    "opendiscord:button-label": ODOptionData<string>;
    "opendiscord:button-color": ODOptionData<ODValidButtonColor>;
    "opendiscord:roles": ODOptionData<string[]>;
    "opendiscord:mode": ODOptionData<ODRoleUpdateMode>;
    "opendiscord:remove-roles-on-add": ODOptionData<string[]>;
    "opendiscord:add-on-join": ODOptionData<boolean>;
}
/**## ODRoleOption `class`
 * This is an Open Ticket role option.
 *
 * This class contains all data related to an Open Ticket role option (parsed from the config).
 *
 * Use this option to create a button for reaction roles!
 */
export declare class ODRoleOption extends ODOption {
    type: "opendiscord:role";
    constructor(id: ODValidId, data: ODOptionData<ODValidJsonType>[]);
    get<OptionId extends keyof ODRoleOptionIds>(id: OptionId): ODRoleOptionIds[OptionId];
    get(id: ODValidId): ODOptionData<ODValidJsonType> | null;
    remove<OptionId extends keyof ODRoleOptionIds>(id: OptionId): ODRoleOptionIds[OptionId];
    remove(id: ODValidId): ODOptionData<ODValidJsonType> | null;
    exists(id: keyof ODRoleOptionIds): boolean;
    exists(id: ODValidId): boolean;
    static fromJson(json: ODOptionJson): ODRoleOption;
}
/**## ODOptionSuffixManager `class`
 * This is an Open Ticket option suffix manager.
 *
 * This class manages all suffixes from option in the bot. The id of an option suffix is the same as the option id.
 *
 * All ticket options should have a corresponding option suffix class.
 */
export declare class ODOptionSuffixManager extends ODManager<ODOptionSuffix> {
    #private;
    constructor(debug: ODDebugger);
    /**Instantly get the suffix from an `ODTicketOption`. */
    getSuffixFromOption(option: ODTicketOption, user: discord.User, guild: discord.Guild): Promise<string | null>;
}
/**## ODOptionSuffix `class`
 * This is an Open Ticket option suffix.
 *
 * This class can generate a suffix for a discord channel name from a specific option.
 *
 * Use `getSuffix()` to get the new suffix!
 */
export declare class ODOptionSuffix extends ODManagerData {
    /**The option of this suffix. */
    option: ODTicketOption;
    constructor(id: ODValidId, option: ODTicketOption);
    /**Get the suffix for a new ticket. */
    getSuffix(member: discord.GuildMember): Promise<string>;
}
/**## ODOptionUserNameSuffix `class`
 * This is an Open Ticket user-name option suffix.
 *
 * This class can generate a user-name suffix for a discord channel name from a specific option.
 *
 * Use `getSuffix()` to get the new suffix!
 */
export declare class ODOptionUserNameSuffix extends ODOptionSuffix {
    getSuffix(member: discord.GuildMember): Promise<string>;
}
/**## ODOptionUserNicknameSuffix `class`
 * This is an Open Ticket user-nickname option suffix.
 *
 * This class can generate a user-nickname suffix for a discord channel name from a specific option.
 *
 * Use `getSuffix()` to get the new suffix!
 */
export declare class ODOptionUserNicknameSuffix extends ODOptionSuffix {
    getSuffix(member: discord.GuildMember): Promise<string>;
}
/**## ODOptionUserIdSuffix `class`
 * This is an Open Ticket user-id option suffix.
 *
 * This class can generate a user-id suffix for a discord channel name from a specific option.
 *
 * Use `getSuffix()` to get the new suffix!
 */
export declare class ODOptionUserIdSuffix extends ODOptionSuffix {
    getSuffix(member: discord.GuildMember): Promise<string>;
}
/**## ODOptionCounterDynamicSuffix `class`
 * This is an Open Ticket counter-dynamic option suffix.
 *
 * This class can generate a counter-dynamic suffix for a discord channel name from a specific option.
 *
 * Use `getSuffix()` to get the new suffix!
 */
export declare class ODOptionCounterDynamicSuffix extends ODOptionSuffix {
    #private;
    /**The database where the value of this counter is stored. */
    database: ODDatabase;
    constructor(id: ODValidId, option: ODTicketOption, database: ODDatabase);
    getSuffix(member: discord.GuildMember): Promise<string>;
}
/**## ODOptionCounterFixedSuffix `class`
 * This is an Open Ticket counter-fixed option suffix.
 *
 * This class can generate a counter-fixed suffix for a discord channel name from a specific option.
 *
 * Use `getSuffix()` to get the new suffix!
 */
export declare class ODOptionCounterFixedSuffix extends ODOptionSuffix {
    #private;
    /**The database where the value of this counter is stored. */
    database: ODDatabase;
    constructor(id: ODValidId, option: ODTicketOption, database: ODDatabase);
    getSuffix(member: discord.GuildMember): Promise<string>;
}
/**## ODOptionRandomNumberSuffix `class`
 * This is an Open Ticket random-number option suffix.
 *
 * This class can generate a random-number suffix for a discord channel name from a specific option.
 *
 * Use `getSuffix()` to get the new suffix!
 */
export declare class ODOptionRandomNumberSuffix extends ODOptionSuffix {
    #private;
    /**The database where previous random numbers are stored. */
    database: ODDatabase;
    constructor(id: ODValidId, option: ODTicketOption, database: ODDatabase);
    getSuffix(member: discord.GuildMember): Promise<string>;
}
/**## ODOptionRandomHexSuffix `class`
 * This is an Open Ticket random-hex option suffix.
 *
 * This class can generate a random-hex suffix for a discord channel name from a specific option.
 *
 * Use `getSuffix()` to get the new suffix!
 */
export declare class ODOptionRandomHexSuffix extends ODOptionSuffix {
    #private;
    /**The database where previous random hexes are stored. */
    database: ODDatabase;
    constructor(id: ODValidId, option: ODTicketOption, database: ODDatabase);
    getSuffix(member: discord.GuildMember): Promise<string>;
}
