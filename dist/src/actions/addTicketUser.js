"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerActions = void 0;
///////////////////////////////////////
//TICKET ADD USER SYSTEM
///////////////////////////////////////
const index_1 = require("../index");
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const registerActions = async () => {
    index_1.opendiscord.actions.add(new index_1.api.ODAction("opendiscord:add-ticket-user"));
    index_1.opendiscord.actions.get("opendiscord:add-ticket-user").workers.add([
        new index_1.api.ODWorker("opendiscord:add-ticket-user", 2, async (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, reason, data } = params;
            if (channel.isThread())
                throw new index_1.api.ODSystemError("Unable to add user to ticket! Open Ticket doesn't support threads!");
            await index_1.opendiscord.events.get("onTicketUserAdd").emit([ticket, user, data, channel, reason]);
            //update ticket
            ticket.get("opendiscord:participants").value.push({ type: "user", id: data.id });
            ticket.get("opendiscord:participants").refreshDatabase();
            ticket.get("opendiscord:busy").value = true;
            //update channel permissions
            try {
                await channel.permissionOverwrites.create(data, {
                    ViewChannel: true,
                    SendMessages: true,
                    AddReactions: true,
                    AttachFiles: true,
                    SendPolls: true,
                    ReadMessageHistory: true
                });
            }
            catch {
                index_1.opendiscord.log("Failed to add channel permission overwrites on add-ticket-user", "error");
            }
            //update ticket message
            const ticketMessage = await index_1.opendiscord.tickets.getTicketMessage(ticket);
            if (ticketMessage) {
                try {
                    ticketMessage.edit((await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-message").build("other", { guild, channel, user, ticket })).message);
                }
                catch (e) {
                    index_1.opendiscord.log("Unable to edit ticket message on ticket user adding!", "error", [
                        { key: "channel", value: "#" + channel.name },
                        { key: "channelid", value: channel.id, hidden: true },
                        { key: "messageid", value: ticketMessage.id },
                        { key: "option", value: ticket.option.id.value, hidden: true }
                    ]);
                    index_1.opendiscord.debugfile.writeErrorMessage(new index_1.api.ODError(e, "uncaughtException"));
                }
            }
            //reply with new message
            if (params.sendMessage)
                await channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:add-message").build(source, { guild, channel, user, ticket, reason, data })).message);
            ticket.get("opendiscord:busy").value = false;
            await index_1.opendiscord.events.get("afterTicketUserAdded").emit([ticket, user, data, channel, reason]);
            //update channel topic
            await index_1.opendiscord.actions.get("opendiscord:update-ticket-topic").run("ticket-action", { guild, channel, user, ticket, sendMessage: false, newTopic: null });
        }),
        new index_1.api.ODWorker("opendiscord:discord-logs", 1, async (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, reason, data } = params;
            //to logs
            if (generalConfig.data.system.logs.enabled && generalConfig.data.system.messages.adding.logs) {
                const logChannel = index_1.opendiscord.posts.get("opendiscord:logs");
                if (logChannel)
                    logChannel.send(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-action-logs").build(source, { guild, channel, user, ticket, mode: "add", reason, additionalData: data }));
            }
            //to dm
            const creator = await index_1.opendiscord.tickets.getTicketUser(ticket, "creator");
            if (creator && generalConfig.data.system.messages.adding.dm)
                await index_1.opendiscord.client.sendUserDm(creator, await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-action-dm").build(source, { guild, channel, user, ticket, mode: "add", reason, additionalData: data }));
        }),
        new index_1.api.ODWorker("opendiscord:logs", 0, (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, data } = params;
            index_1.opendiscord.log(user.displayName + " added " + data.displayName + " to a ticket!", "info", [
                { key: "user", value: user.username },
                { key: "userid", value: user.id, hidden: true },
                { key: "channel", value: "#" + channel.name },
                { key: "channelid", value: channel.id, hidden: true },
                { key: "reason", value: params.reason ?? "/" },
                { key: "method", value: source }
            ]);
        })
    ]);
    index_1.opendiscord.actions.get("opendiscord:add-ticket-user").workers.backupWorker = new index_1.api.ODWorker("opendiscord:cancel-busy", 0, (instance, params) => {
        //set busy to false in case of crash or cancel
        params.ticket.get("opendiscord:busy").value = false;
    });
};
exports.registerActions = registerActions;
