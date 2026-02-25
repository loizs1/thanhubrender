"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODTicketData = exports.ODTicket = exports.ODTicketManager = void 0;
///////////////////////////////////////
//OPENTICKET TICKET MODULE
///////////////////////////////////////
const base_1 = require("../modules/base");
/**## ODTicketManager `class`
 * This is an Open Ticket ticket manager.
 *
 * This class manages all currently created tickets in the bot.
 *
 * All tickets which are added, removed or modified in this manager will be updated automatically in the database.
 */
class ODTicketManager extends base_1.ODManager {
    /**A reference to the main server of the bot */
    #guild = null;
    /**A reference to the Open Ticket client manager. */
    #client;
    /**A reference to the Open Ticket debugger. */
    #debug;
    constructor(debug, client) {
        super(debug, "ticket");
        this.#debug = debug;
        this.#client = client;
    }
    add(data, overwrite) {
        data.useDebug(this.#debug, "ticket data");
        return super.add(data, overwrite);
    }
    /**Use a specific guild in this class for fetching the channel*/
    useGuild(guild) {
        this.#guild = guild;
    }
    /**Get the discord channel for a specific ticket. */
    async getTicketChannel(ticket) {
        if (!this.#guild)
            return null;
        try {
            const channel = await this.#guild.channels.fetch(ticket.id.value);
            if (!channel || !channel.isTextBased())
                return null;
            return channel;
        }
        catch {
            return null;
        }
    }
    /**Get the main ticket message of a ticket channel when found. */
    async getTicketMessage(ticket) {
        const msgId = ticket.get("opendiscord:ticket-message").value;
        if (!this.#guild || !msgId)
            return null;
        try {
            const channel = await this.getTicketChannel(ticket);
            if (!channel)
                return null;
            return await channel.messages.fetch(msgId);
        }
        catch {
            return null;
        }
    }
    /**Shortcut for getting a discord.js user within a ticket. */
    async getTicketUser(ticket, user) {
        if (!this.#guild)
            return null;
        try {
            if (user == "creator") {
                const creatorId = ticket.get("opendiscord:opened-by").value;
                if (!creatorId)
                    return null;
                else
                    return (await this.#guild.client.users.fetch(creatorId));
            }
            else if (user == "closer") {
                const closerId = ticket.get("opendiscord:closed-by").value;
                if (!closerId)
                    return null;
                else
                    return (await this.#guild.client.users.fetch(closerId));
            }
            else if (user == "claimer") {
                const claimerId = ticket.get("opendiscord:claimed-by").value;
                if (!claimerId)
                    return null;
                else
                    return (await this.#guild.client.users.fetch(claimerId));
            }
            else if (user == "pinner") {
                const pinnerId = ticket.get("opendiscord:pinned-by").value;
                if (!pinnerId)
                    return null;
                else
                    return (await this.#guild.client.users.fetch(pinnerId));
            }
            else
                return null;
        }
        catch {
            return null;
        }
    }
    /**Shortcut for getting all users that are able to view a ticket. */
    async getAllTicketParticipants(ticket) {
        if (!this.#guild)
            return null;
        const final = [];
        const channel = await this.getTicketChannel(ticket);
        if (!channel)
            return null;
        //add creator
        const creatorId = ticket.get("opendiscord:opened-by").value;
        if (creatorId) {
            const creator = await this.#client.fetchUser(creatorId);
            if (creator)
                final.push({ user: creator, role: "creator" });
        }
        //add participants
        const participants = ticket.get("opendiscord:participants").value.filter((p) => p.type == "user");
        for (const p of participants) {
            if (!final.find((u) => u.user.id == p.id)) {
                const participant = await this.#client.fetchUser(p.id);
                if (participant)
                    final.push({ user: participant, role: "participant" });
            }
        }
        //add admin roles
        const roles = ticket.get("opendiscord:participants").value.filter((p) => p.type == "role");
        for (const r of roles) {
            const role = await this.#client.fetchGuildRole(channel.guild, r.id);
            if (role) {
                role.members.forEach((member) => {
                    if (final.find((u) => u.user.id == member.id))
                        return;
                    final.push({ user: member.user, role: "admin" });
                });
            }
        }
        return final;
    }
}
exports.ODTicketManager = ODTicketManager;
/**## ODTicket `class`
 * This is an Open Ticket ticket.
 *
 * This class contains all data related to this ticket (parsed from the database).
 *
 * These properties contain the current state of the ticket & are used by actions like claiming, pinning, closing, ...
 */
class ODTicket extends base_1.ODManager {
    /**The id of this ticket. (discord channel id) */
    id;
    /**The option related to this ticket. */
    #option;
    constructor(id, option, data) {
        super();
        this.id = new base_1.ODId(id);
        this.#option = option;
        data.forEach((data) => {
            this.add(data);
        });
    }
    /**The option related to this ticket. */
    set option(option) {
        this.#option = option;
        this._change();
    }
    get option() {
        return this.#option;
    }
    /**Convert this ticket to a JSON object for storing this ticket in the database. */
    toJson(version) {
        const data = this.getAll().map((data) => {
            return {
                id: data.id.toString(),
                value: data.value
            };
        });
        return {
            id: this.id.toString(),
            option: this.option.id.value,
            version: version.toString(),
            data
        };
    }
    /**Create a ticket from a JSON object in the database. */
    static fromJson(json, option) {
        return new ODTicket(json.id, option, json.data.map((data) => new ODTicketData(data.id, data.value)));
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
exports.ODTicket = ODTicket;
/**## ODTicketData `class`
 * This is Open Ticket ticket data.
 *
 * This class contains a single property for a ticket. (string, number, boolean, object, array, null)
 *
 * When this property is edited, the database will be updated automatically.
 */
class ODTicketData extends base_1.ODManagerData {
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
    /**Refresh the database. Is only required to be used when updating `ODTicketData` with an object/array as value. */
    refreshDatabase() {
        this._change();
    }
}
exports.ODTicketData = ODTicketData;
