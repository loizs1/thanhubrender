"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTicket = exports.loadAllTickets = void 0;
const index_1 = require("../../index");
const optionDatabase = index_1.opendiscord.databases.get("opendiscord:options");
const loadAllTickets = async () => {
    const ticketDatabase = index_1.opendiscord.databases.get("opendiscord:tickets");
    if (!ticketDatabase)
        return;
    const tickets = await ticketDatabase.getCategory("opendiscord:ticket");
    if (!tickets)
        return;
    for (const ticket of tickets) {
        try {
            index_1.opendiscord.tickets.add(await (0, exports.loadTicket)(ticket.value));
        }
        catch (err) {
            process.emit("uncaughtException", err);
            process.emit("uncaughtException", new index_1.api.ODSystemError("Failed to load ticket from database! => id: " + ticket.key + "\n ===> " + err));
        }
    }
};
exports.loadAllTickets = loadAllTickets;
const loadTicket = async (ticket) => {
    const backupOption = (await optionDatabase.exists("opendiscord:used-option", ticket.option)) ? index_1.api.ODTicketOption.fromJson(await optionDatabase.get("opendiscord:used-option", ticket.option)) : null;
    const configOption = index_1.opendiscord.options.get(ticket.option);
    //check if option is of type "ticket"
    if (configOption && !(configOption instanceof index_1.api.ODTicketOption))
        throw new index_1.api.ODSystemError("Unable to load ticket because option is not of 'ticket' type!");
    //manage backup option (+ sync version of options with latest OT version in database)
    if (configOption)
        await optionDatabase.set("opendiscord:used-option", configOption.id.value, configOption.toJson(index_1.opendiscord.versions.get("opendiscord:version")));
    else if (backupOption) {
        index_1.opendiscord.options.add(backupOption);
        await optionDatabase.set("opendiscord:used-option", backupOption.id.value, backupOption.toJson(index_1.opendiscord.versions.get("opendiscord:version")));
    }
    else
        throw new index_1.api.ODSystemError("Unable to use backup option! Normal option not found in config!");
    //load ticket & option
    const option = (configOption ?? backupOption);
    return index_1.api.ODTicket.fromJson(ticket, option);
};
exports.loadTicket = loadTicket;
