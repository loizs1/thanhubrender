"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerActions = void 0;
///////////////////////////////////////
//TICKET RENAMING SYSTEM
///////////////////////////////////////
const index_1 = require("../index");
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const registerActions = async () => {
    index_1.opendiscord.actions.add(new index_1.api.ODAction("opendiscord:rename-ticket"));
    index_1.opendiscord.actions.get("opendiscord:rename-ticket").workers.add([
        new index_1.api.ODWorker("opendiscord:rename-ticket", 2, async (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, reason, data } = params;
            if (channel.isThread())
                throw new index_1.api.ODSystemError("Unable to rename ticket! Open Ticket doesn't support threads!");
            await index_1.opendiscord.events.get("onTicketRename").emit([ticket, user, channel, reason]);
            //rename channel (and give error when crashed)
            const pinEmoji = ticket.get("opendiscord:pinned").value ? generalConfig.data.system.pinEmoji : "";
            const priorityEmoji = index_1.opendiscord.priorities.getFromPriorityLevel(ticket.get("opendiscord:priority").value).channelEmoji ?? "";
            const originalName = channel.name;
            const newName = pinEmoji + priorityEmoji + index_1.utilities.trimEmojis(data);
            try {
                await index_1.utilities.timedAwait(channel.setName(newName), 2500, (err) => {
                    index_1.opendiscord.log("Failed to rename channel on ticket rename", "error");
                });
            }
            catch (err) {
                await channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-channel-rename").build("ticket-rename", { guild, channel, user, originalName, newName: data })).message);
            }
            //update ticket message
            const ticketMessage = await index_1.opendiscord.tickets.getTicketMessage(ticket);
            if (ticketMessage) {
                try {
                    ticketMessage.edit((await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-message").build("other", { guild, channel, user, ticket })).message);
                }
                catch (e) {
                    index_1.opendiscord.log("Unable to edit ticket message on ticket renaming!", "error", [
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
                await channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:rename-message").build(source, { guild, channel, user, ticket, reason, data })).message);
            ticket.get("opendiscord:busy").value = false;
            await index_1.opendiscord.events.get("afterTicketRenamed").emit([ticket, user, channel, reason]);
            //update channel topic
            await index_1.opendiscord.actions.get("opendiscord:update-ticket-topic").run("ticket-action", { guild, channel, user, ticket, sendMessage: false, newTopic: null });
        }),
        new index_1.api.ODWorker("opendiscord:discord-logs", 1, async (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, reason, data } = params;
            //to logs
            if (generalConfig.data.system.logs.enabled && generalConfig.data.system.messages.renaming.logs) {
                const logChannel = index_1.opendiscord.posts.get("opendiscord:logs");
                if (logChannel)
                    logChannel.send(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-action-logs").build(source, { guild, channel, user, ticket, mode: "rename", reason, additionalData: data }));
            }
            //to dm
            const creator = await index_1.opendiscord.tickets.getTicketUser(ticket, "creator");
            if (creator && generalConfig.data.system.messages.renaming.dm)
                await index_1.opendiscord.client.sendUserDm(creator, await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-action-dm").build(source, { guild, channel, user, ticket, mode: "rename", reason, additionalData: data }));
        }),
        new index_1.api.ODWorker("opendiscord:logs", 0, (instance, params, source, cancel) => {
            const { guild, channel, user, ticket } = params;
            index_1.opendiscord.log(user.displayName + " renamed a ticket!", "info", [
                { key: "user", value: user.username },
                { key: "userid", value: user.id, hidden: true },
                { key: "channel", value: "#" + channel.name },
                { key: "channelid", value: channel.id, hidden: true },
                { key: "reason", value: params.reason ?? "/" },
                { key: "method", value: source }
            ]);
        })
    ]);
    index_1.opendiscord.actions.get("opendiscord:rename-ticket").workers.backupWorker = new index_1.api.ODWorker("opendiscord:cancel-busy", 0, (instance, params) => {
        //set busy to false in case of crash or cancel
        params.ticket.get("opendiscord:busy").value = false;
    });
};
exports.registerActions = registerActions;
