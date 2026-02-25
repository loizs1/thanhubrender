"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerActions = void 0;
///////////////////////////////////////
//TICKET REMOVE USER SYSTEM
///////////////////////////////////////
const index_1 = require("../index");
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const registerActions = async () => {
    index_1.opendiscord.actions.add(new index_1.api.ODAction("opendiscord:remove-ticket-user"));
    index_1.opendiscord.actions.get("opendiscord:remove-ticket-user").workers.add([
        new index_1.api.ODWorker("opendiscord:remove-ticket-user", 2, async (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, reason, data } = params;
            if (channel.isThread())
                throw new index_1.api.ODSystemError("Unable to remove user from ticket! Open Ticket doesn't support threads!");
            await index_1.opendiscord.events.get("onTicketUserRemove").emit([ticket, user, data, channel, reason]);
            //update ticket
            const index = ticket.get("opendiscord:participants").value.findIndex((p) => p.type == "user" && p.id == data.id);
            if (index < 0)
                return cancel();
            ticket.get("opendiscord:participants").value.splice(index, 1);
            ticket.get("opendiscord:participants").refreshDatabase();
            ticket.get("opendiscord:busy").value = true;
            //update channel permissions
            try {
                await channel.permissionOverwrites.delete(data);
            }
            catch {
                index_1.opendiscord.log("Failed to remove channel permission overwrites on remove-ticket-user", "error");
            }
            //update ticket message
            const ticketMessage = await index_1.opendiscord.tickets.getTicketMessage(ticket);
            if (ticketMessage) {
                try {
                    ticketMessage.edit((await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-message").build("other", { guild, channel, user, ticket })).message);
                }
                catch (e) {
                    index_1.opendiscord.log("Unable to edit ticket message on ticket user removal!", "error", [
                        { key: "channel", value: channel.id },
                        { key: "message", value: ticketMessage.id },
                        { key: "option", value: ticket.option.id.value }
                    ]);
                    index_1.opendiscord.debugfile.writeErrorMessage(new index_1.api.ODError(e, "uncaughtException"));
                }
            }
            //reply with new message
            if (params.sendMessage)
                await channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:remove-message").build(source, { guild, channel, user, ticket, reason, data })).message);
            ticket.get("opendiscord:busy").value = false;
            await index_1.opendiscord.events.get("afterTicketUserRemoved").emit([ticket, user, data, channel, reason]);
            //update channel topic
            await index_1.opendiscord.actions.get("opendiscord:update-ticket-topic").run("ticket-action", { guild, channel, user, ticket, sendMessage: false, newTopic: null });
        }),
        new index_1.api.ODWorker("opendiscord:discord-logs", 1, async (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, reason, data } = params;
            //to logs
            if (generalConfig.data.system.logs.enabled && generalConfig.data.system.messages.removing.logs) {
                const logChannel = index_1.opendiscord.posts.get("opendiscord:logs");
                if (logChannel)
                    logChannel.send(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-action-logs").build(source, { guild, channel, user, ticket, mode: "remove", reason, additionalData: data }));
            }
            //to dm
            const creator = await index_1.opendiscord.tickets.getTicketUser(ticket, "creator");
            if (creator && generalConfig.data.system.messages.removing.dm)
                await index_1.opendiscord.client.sendUserDm(creator, await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-action-dm").build(source, { guild, channel, user, ticket, mode: "remove", reason, additionalData: data }));
        }),
        new index_1.api.ODWorker("opendiscord:logs", 0, (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, data } = params;
            index_1.opendiscord.log(user.displayName + " removed " + data.displayName + " from a ticket!", "info", [
                { key: "user", value: user.username },
                { key: "userid", value: user.id, hidden: true },
                { key: "channel", value: "#" + channel.name },
                { key: "channelid", value: channel.id, hidden: true },
                { key: "reason", value: params.reason ?? "/" },
                { key: "method", value: source }
            ]);
        })
    ]);
    index_1.opendiscord.actions.get("opendiscord:remove-ticket-user").workers.backupWorker = new index_1.api.ODWorker("opendiscord:cancel-busy", 0, (instance, params) => {
        //set busy to false in case of crash or cancel
        params.ticket.get("opendiscord:busy").value = false;
    });
};
exports.registerActions = registerActions;
