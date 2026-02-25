import { ODId, ODManager, ODValidJsonType, ODValidId, ODVersion, ODManagerData } from "../modules/base";
import { ODDebugger } from "../modules/console";
import { ODClientManager_Default } from "../defaults/client";
import { ODTicketOption } from "./option";
import * as discord from "discord.js";
/**## ODTicketManager `class`
 * This is an Open Ticket ticket manager.
 *
 * This class manages all currently created tickets in the bot.
 *
 * All tickets which are added, removed or modified in this manager will be updated automatically in the database.
 */
export declare class ODTicketManager extends ODManager<ODTicket> {
    #private;
    constructor(debug: ODDebugger, client: ODClientManager_Default);
    add(data: ODTicket, overwrite?: boolean): boolean;
    /**Use a specific guild in this class for fetching the channel*/
    useGuild(guild: discord.Guild | null): void;
    /**Get the discord channel for a specific ticket. */
    getTicketChannel(ticket: ODTicket): Promise<discord.GuildTextBasedChannel | null>;
    /**Get the main ticket message of a ticket channel when found. */
    getTicketMessage(ticket: ODTicket): Promise<discord.Message<true> | null>;
    /**Shortcut for getting a discord.js user within a ticket. */
    getTicketUser(ticket: ODTicket, user: "creator" | "closer" | "claimer" | "pinner"): Promise<discord.User | null>;
    /**Shortcut for getting all users that are able to view a ticket. */
    getAllTicketParticipants(ticket: ODTicket): Promise<{
        user: discord.User;
        role: "creator" | "participant" | "admin";
    }[] | null>;
}
/**## ODTicketDataJson `interface`
 * The JSON representatation from a single ticket property.
 */
export interface ODTicketDataJson {
    /**The id of this property. */
    id: string;
    /**The value of this property. */
    value: ODValidJsonType;
}
/**## ODTicketDataJson `interface`
 * The JSON representatation from a single ticket.
 */
export interface ODTicketJson {
    /**The id of this ticket. */
    id: string;
    /**The option id related to this ticket. */
    option: string;
    /**The version of Open Ticket used to create this ticket. */
    version: string;
    /**The full list of properties/variables related to this ticket. */
    data: ODTicketDataJson[];
}
/**## ODTicketIds `type`
 * This interface is a list of ids available in the `ODTicket` class.
 * It's used to generate typescript declarations for this class.
 */
export interface ODTicketIds {
    "opendiscord:busy": ODTicketData<boolean>;
    "opendiscord:ticket-message": ODTicketData<string | null>;
    "opendiscord:participants": ODTicketData<{
        type: "role" | "user";
        id: string;
    }[]>;
    "opendiscord:channel-suffix": ODTicketData<string>;
    "opendiscord:previous-creators": ODTicketData<string[]>;
    "opendiscord:open": ODTicketData<boolean>;
    "opendiscord:opened-by": ODTicketData<string | null>;
    "opendiscord:opened-on": ODTicketData<number | null>;
    "opendiscord:closed": ODTicketData<boolean>;
    "opendiscord:closed-by": ODTicketData<string | null>;
    "opendiscord:closed-on": ODTicketData<number | null>;
    "opendiscord:closed-reason": ODTicketData<string | null>;
    "opendiscord:reopened": ODTicketData<boolean>;
    "opendiscord:reopened-by": ODTicketData<string | null>;
    "opendiscord:reopened-on": ODTicketData<number | null>;
    "opendiscord:claimed": ODTicketData<boolean>;
    "opendiscord:claimed-by": ODTicketData<string | null>;
    "opendiscord:claimed-on": ODTicketData<number | null>;
    "opendiscord:pinned": ODTicketData<boolean>;
    "opendiscord:pinned-by": ODTicketData<string | null>;
    "opendiscord:pinned-on": ODTicketData<number | null>;
    "opendiscord:for-deletion": ODTicketData<boolean>;
    "opendiscord:category": ODTicketData<string | null>;
    "opendiscord:category-mode": ODTicketData<null | "normal" | "closed" | "backup" | "claimed">;
    "opendiscord:autoclose-enabled": ODTicketData<boolean>;
    "opendiscord:autoclose-hours": ODTicketData<number>;
    "opendiscord:autoclosed": ODTicketData<boolean>;
    "opendiscord:autodelete-enabled": ODTicketData<boolean>;
    "opendiscord:autodelete-days": ODTicketData<number>;
    "opendiscord:answers": ODTicketData<{
        id: string;
        name: string;
        type: "short" | "paragraph";
        value: string | null;
    }[]>;
    "opendiscord:priority": ODTicketData<number>;
    "opendiscord:topic": ODTicketData<string>;
    "opendiscord:message-sent": ODTicketData<boolean>;
    "opendiscord:admin-message-sent": ODTicketData<boolean>;
}
/**## ODTicket `class`
 * This is an Open Ticket ticket.
 *
 * This class contains all data related to this ticket (parsed from the database).
 *
 * These properties contain the current state of the ticket & are used by actions like claiming, pinning, closing, ...
 */
export declare class ODTicket extends ODManager<ODTicketData<ODValidJsonType>> {
    #private;
    /**The id of this ticket. (discord channel id) */
    id: ODId;
    constructor(id: ODValidId, option: ODTicketOption, data: ODTicketData<ODValidJsonType>[]);
    /**The option related to this ticket. */
    set option(option: ODTicketOption);
    get option(): ODTicketOption;
    /**Convert this ticket to a JSON object for storing this ticket in the database. */
    toJson(version: ODVersion): ODTicketJson;
    /**Create a ticket from a JSON object in the database. */
    static fromJson(json: ODTicketJson, option: ODTicketOption): ODTicket;
    get<OptionId extends keyof ODTicketIds>(id: OptionId): ODTicketIds[OptionId];
    get(id: ODValidId): ODTicketData<ODValidJsonType> | null;
    remove<OptionId extends keyof ODTicketIds>(id: OptionId): ODTicketIds[OptionId];
    remove(id: ODValidId): ODTicketData<ODValidJsonType> | null;
    exists(id: keyof ODTicketIds): boolean;
    exists(id: ODValidId): boolean;
}
/**## ODTicketData `class`
 * This is Open Ticket ticket data.
 *
 * This class contains a single property for a ticket. (string, number, boolean, object, array, null)
 *
 * When this property is edited, the database will be updated automatically.
 */
export declare class ODTicketData<DataType extends ODValidJsonType> extends ODManagerData {
    #private;
    constructor(id: ODValidId, value: DataType);
    /**The value of this property. */
    set value(value: DataType);
    get value(): DataType;
    /**Refresh the database. Is only required to be used when updating `ODTicketData` with an object/array as value. */
    refreshDatabase(): void;
}
/**## ODTicketClearFilter `type`
 * This type contains all possible "clear filters" for the `/clear` command.
 */
export type ODTicketClearFilter = "all" | "open" | "closed" | "claimed" | "unclaimed" | "pinned" | "unpinned" | "autoclosed";
