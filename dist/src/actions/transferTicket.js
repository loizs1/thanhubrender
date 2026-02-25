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
exports.registerActions = void 0;
///////////////////////////////////////
//TICKET TRANSFER SYSTEM
///////////////////////////////////////
const index_1 = require("../index");
const discord = __importStar(require("discord.js"));
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const registerActions = async () => {
    index_1.opendiscord.actions.add(new index_1.api.ODAction("opendiscord:transfer-ticket"));
    index_1.opendiscord.actions.get("opendiscord:transfer-ticket").workers.add([
        new index_1.api.ODWorker("opendiscord:transfer-ticket", 2, async (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, reason, newCreator } = params;
            if (channel.isThread())
                throw new index_1.api.ODSystemError("Unable to transfer ticket! Open Ticket doesn't support threads!");
            const oldCreator = await index_1.opendiscord.tickets.getTicketUser(ticket, "creator") ?? index_1.opendiscord.client.client.user;
            await index_1.opendiscord.events.get("onTicketTransfer").emit([ticket, user, channel, oldCreator, newCreator, reason]);
            //update ticket
            const oldCreatorId = ticket.get("opendiscord:opened-by").value;
            if (oldCreatorId) {
                ticket.get("opendiscord:previous-creators").value.push(oldCreatorId);
                ticket.get("opendiscord:previous-creators").refreshDatabase();
            }
            if (!ticket.get("opendiscord:participants").value.find((p) => p.type == "user" && p.id == newCreator.id)) {
                ticket.get("opendiscord:participants").value.push({ type: "user", id: newCreator.id });
                ticket.get("opendiscord:participants").refreshDatabase();
            }
            ticket.get("opendiscord:opened-by").value = newCreator.id;
            if (["user-name", "user-nickname", "user-id"].includes(ticket.option.get("opendiscord:channel-suffix").value)) {
                const newSuffix = await index_1.opendiscord.options.suffix.getSuffixFromOption(ticket.option, newCreator, guild);
                if (newSuffix)
                    ticket.get("opendiscord:channel-suffix").value = newSuffix;
            }
            //update stats
            await index_1.opendiscord.stats.get("opendiscord:global").setStat("opendiscord:tickets-transferred", 1, "increase");
            await index_1.opendiscord.stats.get("opendiscord:user").setStat("opendiscord:tickets-transferred", user.id, 1, "increase");
            //get new channel properties
            const channelPrefix = ticket.option.get("opendiscord:channel-prefix").value;
            const channelSuffix = ticket.get("opendiscord:channel-suffix").value;
            //handle permissions
            const permissions = [{
                    type: discord.OverwriteType.Role,
                    id: guild.roles.everyone.id,
                    allow: [],
                    deny: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
                }];
            const globalAdmins = index_1.opendiscord.configs.get("opendiscord:general").data.globalAdmins;
            const optionAdmins = ticket.option.get("opendiscord:admins").value;
            const readonlyAdmins = ticket.option.get("opendiscord:admins-readonly").value;
            globalAdmins.forEach((admin) => {
                permissions.push({
                    type: discord.OverwriteType.Role,
                    id: admin,
                    allow: ["ViewChannel", "SendMessages", "AddReactions", "AttachFiles", "SendPolls", "ReadMessageHistory", "ManageMessages"],
                    deny: []
                });
            });
            optionAdmins.forEach((admin) => {
                if (globalAdmins.includes(admin))
                    return;
                permissions.push({
                    type: discord.OverwriteType.Role,
                    id: admin,
                    allow: ["ViewChannel", "SendMessages", "AddReactions", "AttachFiles", "SendPolls", "ReadMessageHistory", "ManageMessages"],
                    deny: []
                });
            });
            readonlyAdmins.forEach((admin) => {
                if (globalAdmins.includes(admin))
                    return;
                if (optionAdmins.includes(admin))
                    return;
                permissions.push({
                    type: discord.OverwriteType.Role,
                    id: admin,
                    allow: ["ViewChannel", "ReadMessageHistory"],
                    deny: ["SendMessages", "AddReactions", "AttachFiles", "SendPolls"]
                });
            });
            //transfer all old user-participants over to the new ticket (creator & participants)
            ticket.get("opendiscord:participants").value.forEach((p) => {
                if (p.type == "user")
                    permissions.push({
                        type: discord.OverwriteType.Member,
                        id: p.id,
                        allow: ["ViewChannel", "SendMessages", "AddReactions", "AttachFiles", "SendPolls", "ReadMessageHistory"],
                        deny: []
                    });
            });
            try {
                await channel.permissionOverwrites.set(permissions);
            }
            catch {
                index_1.opendiscord.log("Failed to reset channel permissions on ticket transfer!", "error");
            }
            //rename channel (and give error when crashed)
            const pinEmoji = ticket.get("opendiscord:pinned").value ? generalConfig.data.system.pinEmoji : "";
            const priorityEmoji = index_1.opendiscord.priorities.getFromPriorityLevel(ticket.get("opendiscord:priority").value).channelEmoji ?? "";
            const originalName = channel.name;
            const newName = pinEmoji + priorityEmoji + index_1.utilities.trimEmojis(channelPrefix + channelSuffix);
            try {
                await index_1.utilities.timedAwait(channel.setName(newName), 2500, (err) => {
                    index_1.opendiscord.log("Failed to rename channel on ticket transfer", "error");
                });
            }
            catch (err) {
                await channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-channel-rename").build("ticket-transfer", { guild, channel, user, originalName, newName: newName })).message);
            }
            //update ticket message
            const ticketMessage = await index_1.opendiscord.tickets.getTicketMessage(ticket);
            if (ticketMessage) {
                try {
                    ticketMessage.edit((await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-message").build("other", { guild, channel, user, ticket })).message);
                }
                catch (e) {
                    index_1.opendiscord.log("Unable to edit ticket message on ticket transferring!", "error", [
                        { key: "channel", value: "#" + channel.name },
                        { key: "channelid", value: channel.id, hidden: true },
                        { key: "messageid", value: ticketMessage.id },
                        { key: "option", value: ticket.option.id.value }
                    ]);
                    index_1.opendiscord.debugfile.writeErrorMessage(new index_1.api.ODError(e, "uncaughtException"));
                }
            }
            //reply with new message
            if (params.sendMessage)
                await channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:transfer-message").build(source, { guild, channel, user, ticket, oldCreator, newCreator, reason })).message);
            ticket.get("opendiscord:busy").value = false;
            await index_1.opendiscord.events.get("afterTicketTransferred").emit([ticket, user, channel, oldCreator, newCreator, reason]);
            //update channel topic
            await index_1.opendiscord.actions.get("opendiscord:update-ticket-topic").run("ticket-action", { guild, channel, user, ticket, sendMessage: false, newTopic: null });
        }),
        new index_1.api.ODWorker("opendiscord:discord-logs", 1, async (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, newCreator, reason } = params;
        }),
        new index_1.api.ODWorker("opendiscord:logs", 0, (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, newCreator } = params;
            index_1.opendiscord.log(user.displayName + " transferred a ticket to '" + newCreator.displayName + "'!", "info", [
                { key: "user", value: user.username },
                { key: "userid", value: user.id, hidden: true },
                { key: "channel", value: "#" + channel.name },
                { key: "channelid", value: channel.id, hidden: true },
                { key: "reason", value: params.reason ?? "/" },
                { key: "method", value: source }
            ]);
        })
    ]);
    index_1.opendiscord.actions.get("opendiscord:transfer-ticket").workers.backupWorker = new index_1.api.ODWorker("opendiscord:cancel-busy", 0, (instance, params) => {
        //set busy to false in case of crash or cancel
        params.ticket.get("opendiscord:busy").value = false;
    });
};
exports.registerActions = registerActions;
