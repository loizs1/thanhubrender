"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerVerifyBars = exports.registerActions = void 0;
///////////////////////////////////////
//TICKET UNPINNING SYSTEM
///////////////////////////////////////
const index_1 = require("../index");
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const registerActions = async () => {
    index_1.opendiscord.actions.add(new index_1.api.ODAction("opendiscord:unpin-ticket"));
    index_1.opendiscord.actions.get("opendiscord:unpin-ticket").workers.add([
        new index_1.api.ODWorker("opendiscord:unpin-ticket", 2, async (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, reason } = params;
            if (channel.isThread())
                throw new index_1.api.ODSystemError("Unable to unpin ticket! Open Ticket doesn't support threads!");
            await index_1.opendiscord.events.get("onTicketUnpin").emit([ticket, user, channel, reason]);
            //update ticket
            ticket.get("opendiscord:pinned").value = false;
            ticket.get("opendiscord:pinned-by").value = null;
            ticket.get("opendiscord:pinned-on").value = null;
            ticket.get("opendiscord:busy").value = true;
            //rename channel (and give error when crashed)
            const pinEmoji = ticket.get("opendiscord:pinned").value ? generalConfig.data.system.pinEmoji : "";
            const priorityEmoji = index_1.opendiscord.priorities.getFromPriorityLevel(ticket.get("opendiscord:priority").value).channelEmoji ?? "";
            const originalName = channel.name;
            const newName = pinEmoji + priorityEmoji + index_1.utilities.trimEmojis(channel.name);
            try {
                await index_1.utilities.timedAwait(channel.setName(newName), 2500, (err) => {
                    index_1.opendiscord.log("Failed to rename channel on ticket unpin", "error");
                });
            }
            catch (err) {
                await channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-channel-rename").build("ticket-unpin", { guild, channel, user, originalName, newName })).message);
            }
            //update ticket message
            const ticketMessage = await index_1.opendiscord.tickets.getTicketMessage(ticket);
            if (ticketMessage) {
                try {
                    ticketMessage.edit((await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-message").build("other", { guild, channel, user, ticket })).message);
                }
                catch (e) {
                    index_1.opendiscord.log("Unable to edit ticket message on ticket unpinning!", "error", [
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
                await channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:unpin-message").build(source, { guild, channel, user, ticket, reason })).message);
            ticket.get("opendiscord:busy").value = false;
            await index_1.opendiscord.events.get("afterTicketUnpinned").emit([ticket, user, channel, reason]);
            //update channel topic
            await index_1.opendiscord.actions.get("opendiscord:update-ticket-topic").run("ticket-action", { guild, channel, user, ticket, sendMessage: false, newTopic: null });
        }),
        new index_1.api.ODWorker("opendiscord:discord-logs", 1, async (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, reason } = params;
            //to logs
            if (generalConfig.data.system.logs.enabled && generalConfig.data.system.messages.pinning.logs) {
                const logChannel = index_1.opendiscord.posts.get("opendiscord:logs");
                if (logChannel)
                    logChannel.send(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-action-logs").build(source, { guild, channel, user, ticket, mode: "unpin", reason, additionalData: null }));
            }
            //to dm
            const creator = await index_1.opendiscord.tickets.getTicketUser(ticket, "creator");
            if (creator && generalConfig.data.system.messages.pinning.dm)
                await index_1.opendiscord.client.sendUserDm(creator, await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-action-dm").build(source, { guild, channel, user, ticket, mode: "unpin", reason, additionalData: null }));
        }),
        new index_1.api.ODWorker("opendiscord:logs", 0, (instance, params, source, cancel) => {
            const { guild, channel, user, ticket } = params;
            index_1.opendiscord.log(user.displayName + " unpinned a ticket!", "info", [
                { key: "user", value: user.username },
                { key: "userid", value: user.id, hidden: true },
                { key: "channel", value: "#" + channel.name },
                { key: "channelid", value: channel.id, hidden: true },
                { key: "reason", value: params.reason ?? "/" },
                { key: "method", value: source }
            ]);
        })
    ]);
};
exports.registerActions = registerActions;
const registerVerifyBars = async () => {
    //UNPIN TICKET TICKET MESSAGE
    index_1.opendiscord.verifybars.add(new index_1.api.ODVerifyBar("opendiscord:unpin-ticket-ticket-message", index_1.opendiscord.builders.messages.getSafe("opendiscord:verifybar-ticket-message"), !generalConfig.data.system.disableVerifyBars));
    index_1.opendiscord.verifybars.get("opendiscord:unpin-ticket-ticket-message").success.add([
        new index_1.api.ODWorker("opendiscord:permissions", 1, async (instance, params, source, cancel) => {
            const permissionMode = generalConfig.data.system.permissions.unpin;
            if (permissionMode == "none") {
                //no permissions
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, permissions: [] }));
                return cancel();
            }
            else if (permissionMode == "everyone")
                return;
            else if (permissionMode == "admin") {
                if (!index_1.opendiscord.permissions.hasPermissions("support", await index_1.opendiscord.permissions.getPermissions(instance.user, instance.channel, instance.guild))) {
                    //no permissions
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, permissions: ["support"] }));
                    return cancel();
                }
                else
                    return;
            }
            else {
                if (!instance.guild || !instance.member) {
                    //error
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, error: "Permission Error: Not in Server #1", layout: "advanced" }));
                    return cancel();
                }
                const role = await index_1.opendiscord.client.fetchGuildRole(instance.guild, permissionMode);
                if (!role) {
                    //error
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, error: "Permission Error: Not in Server #2", layout: "advanced" }));
                    return cancel();
                }
                if (!role.members.has(instance.member.id)) {
                    //no permissions
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, permissions: [] }));
                    return cancel();
                }
                else
                    return;
            }
        }),
        new index_1.api.ODWorker("opendiscord:unpin-ticket", 0, async (instance, params, source, cancel) => {
            const { guild, channel, user } = instance;
            if (!guild) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                return cancel();
            }
            const ticket = index_1.opendiscord.tickets.get(channel.id);
            if (!ticket || channel.isDMBased()) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-unknown").build("button", { guild, channel, user }));
                return cancel();
            }
            //return when not pinned
            if (!ticket.get("opendiscord:pinned").value) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild, channel, user, error: index_1.opendiscord.languages.getTranslation("errors.actionInvalid.unpin"), layout: "simple" }));
                return cancel();
            }
            //return when busy
            if (ticket.get("opendiscord:busy").value) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-busy").build("button", { guild, channel, user }));
                return cancel();
            }
            //start unpining ticket
            if (params.data == "reason") {
                //unpin with reason
                instance.modal(await index_1.opendiscord.builders.modals.getSafe("opendiscord:unpin-ticket-reason").build("ticket-message", { guild, channel, user, ticket }));
            }
            else {
                //unpin without reason
                await instance.defer("update", false);
                await index_1.opendiscord.actions.get("opendiscord:unpin-ticket").run("ticket-message", { guild, channel, user, ticket, reason: null, sendMessage: true });
                await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-message").build("other", { guild, channel, user, ticket }));
            }
        })
    ]);
    index_1.opendiscord.verifybars.get("opendiscord:unpin-ticket-ticket-message").failure.add([
        new index_1.api.ODWorker("opendiscord:back-to-ticket-message", 0, async (instance, params, source, cancel) => {
            const { guild, channel, user } = instance;
            if (!guild) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                return cancel();
            }
            const ticket = index_1.opendiscord.tickets.get(channel.id);
            if (!ticket || channel.isDMBased()) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-unknown").build("button", { guild, channel, user }));
                return cancel();
            }
            await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-message").build("other", { guild, channel, user, ticket }));
        })
    ]);
    //UNPIN TICKET PIN MESSAGE
    index_1.opendiscord.verifybars.add(new index_1.api.ODVerifyBar("opendiscord:unpin-ticket-pin-message", index_1.opendiscord.builders.messages.getSafe("opendiscord:verifybar-pin-message"), !generalConfig.data.system.disableVerifyBars));
    index_1.opendiscord.verifybars.get("opendiscord:unpin-ticket-pin-message").success.add([
        new index_1.api.ODWorker("opendiscord:permissions", 1, async (instance, params, source, cancel) => {
            const permissionMode = generalConfig.data.system.permissions.unpin;
            if (permissionMode == "none") {
                //no permissions
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, permissions: [] }));
                return cancel();
            }
            else if (permissionMode == "everyone")
                return;
            else if (permissionMode == "admin") {
                if (!index_1.opendiscord.permissions.hasPermissions("support", await index_1.opendiscord.permissions.getPermissions(instance.user, instance.channel, instance.guild))) {
                    //no permissions
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, permissions: ["support"] }));
                    return cancel();
                }
                else
                    return;
            }
            else {
                if (!instance.guild || !instance.member) {
                    //error
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, error: "Permission Error: Not in Server #1", layout: "advanced" }));
                    return cancel();
                }
                const role = await index_1.opendiscord.client.fetchGuildRole(instance.guild, permissionMode);
                if (!role) {
                    //error
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, error: "Permission Error: Not in Server #2", layout: "advanced" }));
                    return cancel();
                }
                if (!role.members.has(instance.member.id)) {
                    //no permissions
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, permissions: [] }));
                    return cancel();
                }
                else
                    return;
            }
        }),
        new index_1.api.ODWorker("opendiscord:unpin-ticket", 0, async (instance, params, source, cancel) => {
            const { guild, channel, user } = instance;
            if (!guild) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                return cancel();
            }
            const ticket = index_1.opendiscord.tickets.get(channel.id);
            if (!ticket || channel.isDMBased()) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-unknown").build("button", { guild, channel, user }));
                return cancel();
            }
            //return when not pinned
            if (!ticket.get("opendiscord:pinned").value) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild, channel, user, error: index_1.opendiscord.languages.getTranslation("errors.actionInvalid.unpin"), layout: "simple" }));
                return cancel();
            }
            //return when busy
            if (ticket.get("opendiscord:busy").value) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-busy").build("button", { guild, channel, user }));
                return cancel();
            }
            //start unpinning ticket
            if (params.data == "reason") {
                //unpin with reason
                instance.modal(await index_1.opendiscord.builders.modals.getSafe("opendiscord:unpin-ticket-reason").build("pin-message", { guild, channel, user, ticket }));
            }
            else {
                //unpin without reason
                await instance.defer("update", false);
                await index_1.opendiscord.actions.get("opendiscord:unpin-ticket").run("pin-message", { guild, channel, user, ticket, reason: null, sendMessage: false });
                await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:unpin-message").build("pin-message", { guild, channel, user, ticket, reason: null }));
            }
        })
    ]);
    index_1.opendiscord.verifybars.get("opendiscord:unpin-ticket-pin-message").failure.add([
        new index_1.api.ODWorker("opendiscord:back-to-pin-message", 0, async (instance, params, source, cancel) => {
            const { guild, channel, user } = instance;
            const { verifybarMessage } = params;
            if (!guild) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                return cancel();
            }
            const ticket = index_1.opendiscord.tickets.get(channel.id);
            if (!ticket || channel.isDMBased()) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-unknown").build("button", { guild, channel, user }));
                return cancel();
            }
            const rawReason = (verifybarMessage && verifybarMessage.embeds[0] && verifybarMessage.embeds[0].fields[0]) ? verifybarMessage.embeds[0].fields[0].value : null;
            const reason = (rawReason == null) ? null : rawReason.substring(3, rawReason.length - 3);
            await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:pin-message").build("other", { guild, channel, user, ticket, reason }));
        })
    ]);
    index_1.opendiscord.actions.get("opendiscord:unpin-ticket").workers.backupWorker = new index_1.api.ODWorker("opendiscord:cancel-busy", 0, (instance, params) => {
        //set busy to false in case of crash or cancel
        params.ticket.get("opendiscord:busy").value = false;
    });
};
exports.registerVerifyBars = registerVerifyBars;
