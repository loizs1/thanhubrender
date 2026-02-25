"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerVerifyBars = exports.registerActions = void 0;
///////////////////////////////////////
//TICKET DELETION SYSTEM
///////////////////////////////////////
const index_1 = require("../index");
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const lang = index_1.opendiscord.languages;
const registerActions = async () => {
    index_1.opendiscord.actions.add(new index_1.api.ODAction("opendiscord:delete-ticket"));
    index_1.opendiscord.actions.get("opendiscord:delete-ticket").workers.add([
        new index_1.api.ODWorker("opendiscord:delete-ticket", 3, async (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, reason } = params;
            if (channel.isThread())
                throw new index_1.api.ODSystemError("Unable to delete ticket! Open Ticket doesn't support threads!");
            await index_1.opendiscord.events.get("onTicketDelete").emit([ticket, user, channel, reason]);
            //update ticket
            ticket.get("opendiscord:for-deletion").value = true;
            ticket.get("opendiscord:busy").value = true;
            //update ticket message
            const ticketMessage = await index_1.opendiscord.tickets.getTicketMessage(ticket);
            if (ticketMessage) {
                try {
                    ticketMessage.edit((await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-message").build("other", { guild, channel, user, ticket })).message);
                }
                catch (e) {
                    index_1.opendiscord.log("Unable to edit ticket message on ticket deletion!", "error", [
                        { key: "channel", value: "#" + channel.name },
                        { key: "channelid", value: channel.id, hidden: true },
                        { key: "messageid", value: ticketMessage.id },
                        { key: "option", value: ticket.option.id.value }
                    ]);
                    index_1.opendiscord.debugfile.writeErrorMessage(new index_1.api.ODError(e, "uncaughtException"));
                }
            }
            if (params.sendMessage)
                await channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:delete-message").build(source, { guild, channel, user, ticket, reason })).message);
            //create transcript
            if (!params.withoutTranscript) {
                const transcriptRes = await index_1.opendiscord.actions.get("opendiscord:create-transcript").run(source, { guild, channel, user, ticket });
                //transcript failure
                if (typeof transcriptRes.success == "boolean" && !transcriptRes.success && transcriptRes.compiler) {
                    const { compiler } = transcriptRes;
                    await channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:transcript-error").build(source, { guild, channel, user, ticket, compiler, reason: transcriptRes.errorReason ?? null })).message)
                        .catch((reason) => index_1.opendiscord.log("Unable to send transcript failure to ticket channel!", "error", [{ key: "id", value: channel.id }]));
                    //undo deletion
                    ticket.get("opendiscord:for-deletion").value = false;
                    ticket.get("opendiscord:busy").value = false;
                    index_1.opendiscord.log("Canceled ticket deletion because of transcript system malfunction!", "warning", [
                        { key: "compiler", value: compiler.id.value },
                        { key: "reason", value: transcriptRes.errorReason ?? "/" },
                    ]);
                    return cancel();
                }
            }
            //update stats
            await index_1.opendiscord.stats.get("opendiscord:global").setStat("opendiscord:tickets-deleted", 1, "increase");
            await index_1.opendiscord.stats.get("opendiscord:user").setStat("opendiscord:tickets-deleted", user.id, 1, "increase");
            //delete ticket from manager
            index_1.opendiscord.tickets.remove(ticket.id);
            //delete permissions from manager
            await (await import("../data/framework/permissionLoader.js")).removeTicketPermissions(ticket);
        }),
        new index_1.api.ODWorker("opendiscord:discord-logs", 2, async (instance, params, source, cancel) => {
            //logs before channel deletion => channel might still be used in log embeds
            const { guild, channel, user, ticket, reason } = params;
            //to logs
            if (generalConfig.data.system.logs.enabled && generalConfig.data.system.messages.deleting.logs) {
                const logChannel = index_1.opendiscord.posts.get("opendiscord:logs");
                if (logChannel)
                    logChannel.send(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-action-logs").build(source, { guild, channel, user, ticket, mode: "delete", reason, additionalData: null }));
            }
            //to dm
            const creator = await index_1.opendiscord.tickets.getTicketUser(ticket, "creator");
            if (creator && generalConfig.data.system.messages.deleting.dm)
                await index_1.opendiscord.client.sendUserDm(creator, await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-action-dm").build(source, { guild, channel, user, ticket, mode: "delete", reason, additionalData: null }));
        }),
        new index_1.api.ODWorker("opendiscord:delete-channel", 1, async (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, reason } = params;
            //delete channel & events
            await index_1.opendiscord.events.get("onTicketChannelDeletion").emit([ticket, channel, user]);
            await channel.delete("Ticket Deleted").catch((reason) => index_1.opendiscord.log("Unable to delete ticket channel!", "error", [{ key: "id", value: channel.id }]));
            await index_1.opendiscord.events.get("afterTicketChannelDeleted").emit([ticket, user]);
            //delete permissions from manager
            await (await import("../data/framework/permissionLoader.js")).removeTicketPermissions(ticket);
            await index_1.opendiscord.events.get("afterTicketDeleted").emit([ticket, user, reason]);
        }),
        new index_1.api.ODWorker("opendiscord:logs", 0, (instance, params, source, cancel) => {
            const { guild, channel, user, ticket } = params;
            index_1.opendiscord.log(user.displayName + " deleted a ticket!", "info", [
                { key: "user", value: user.username },
                { key: "userid", value: user.id, hidden: true },
                { key: "channel", value: "#" + channel.name },
                { key: "channelid", value: channel.id, hidden: true },
                { key: "reason", value: params.reason ?? "/" },
                { key: "method", value: source },
                { key: "transcript", value: (!params.withoutTranscript).toString() },
            ]);
        })
    ]);
    index_1.opendiscord.actions.get("opendiscord:delete-ticket").workers.backupWorker = new index_1.api.ODWorker("opendiscord:cancel-busy", 0, (instance, params) => {
        //set busy to false in case of crash or cancel
        params.ticket.get("opendiscord:busy").value = false;
        params.ticket.get("opendiscord:for-deletion").value = false;
    });
};
exports.registerActions = registerActions;
const registerVerifyBars = async () => {
    //DELETE TICKET TICKET MESSAGE
    index_1.opendiscord.verifybars.add(new index_1.api.ODVerifyBar("opendiscord:delete-ticket-ticket-message", index_1.opendiscord.builders.messages.getSafe("opendiscord:verifybar-ticket-message"), !generalConfig.data.system.disableVerifyBars));
    index_1.opendiscord.verifybars.get("opendiscord:delete-ticket-ticket-message").success.add([
        new index_1.api.ODWorker("opendiscord:delete-ticket", 0, async (instance, params, source, cancel) => {
            const { user, member, channel, guild } = instance;
            //check permissions
            const permsResult = await index_1.opendiscord.permissions.checkCommandPerms(generalConfig.data.system.permissions.delete, "support", user, member, channel, guild);
            if (!permsResult.hasPerms) {
                if (permsResult.reason == "not-in-server")
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                else
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild, channel, user, permissions: ["support"] }));
                return cancel();
            }
            //don't allow deleteWithoutTranscript to non-global-admins when enabled
            if (params.data == "no-transcript" && generalConfig.data.system.adminOnlyDeleteWithoutTranscript) {
                if (!index_1.opendiscord.permissions.hasPermissions("support", await index_1.opendiscord.permissions.getPermissions(instance.user, instance.channel, instance.guild, { allowChannelRoleScope: false, allowChannelUserScope: false, allowGlobalRoleScope: true, allowGlobalUserScope: true }))) {
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, permissions: ["support"] }));
                    return cancel();
                }
            }
            //check is in guild/server
            if (!guild) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                return cancel();
            }
            //check if ticket exists
            const ticket = index_1.opendiscord.tickets.get(channel.id);
            if (!ticket || channel.isDMBased()) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-unknown").build("button", { guild, channel, user }));
                return cancel();
            }
            //return when busy
            if (ticket.get("opendiscord:busy").value) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-busy").build("button", { guild, channel, user }));
                return cancel();
            }
            //return when not allowed because of missing messages
            if (!permsResult.isAdmin && (!generalConfig.data.system.allowCloseBeforeMessage || !generalConfig.data.system.allowCloseBeforeAdminMessage)) {
                const analysis = await index_1.opendiscord.transcripts.collector.ticketUserMessagesAnalysis(ticket, guild, channel);
                if (analysis && !generalConfig.data.system.allowCloseBeforeMessage && analysis.totalMessages < 1) {
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild, channel, user, layout: "simple", error: lang.getTranslation("errors.descriptions.closeBeforeMessage"), customTitle: lang.getTranslation("errors.titles.noPermissions") }));
                    return cancel();
                }
                if (analysis && !generalConfig.data.system.allowCloseBeforeAdminMessage && analysis.adminMessages < 1) {
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild, channel, user, layout: "simple", error: lang.getTranslation("errors.descriptions.closeBeforeAdminMessage"), customTitle: lang.getTranslation("errors.titles.noPermissions") }));
                    return cancel();
                }
            }
            //start deleting ticket
            if (params.data == "reason") {
                //delete with reason
                instance.modal(await index_1.opendiscord.builders.modals.getSafe("opendiscord:delete-ticket-reason").build("ticket-message", { guild, channel, user, ticket }));
            }
            else {
                //delete without reason
                await instance.defer("update", false);
                //don't await DELETE action => else it will update the message after the channel has been deleted
                index_1.opendiscord.actions.get("opendiscord:delete-ticket").run("ticket-message", { guild, channel, user, ticket, reason: null, sendMessage: true, withoutTranscript: (params.data == "no-transcript") });
                //update ticket (for ticket message) => no-await doesn't wait for the action to set this variable
                ticket.get("opendiscord:for-deletion").value = true;
                await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-message").build("other", { guild, channel, user, ticket }));
            }
        })
    ]);
    index_1.opendiscord.verifybars.get("opendiscord:delete-ticket-ticket-message").failure.add([
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
    //DELETE TICKET CLOSE MESSAGE
    index_1.opendiscord.verifybars.add(new index_1.api.ODVerifyBar("opendiscord:delete-ticket-close-message", index_1.opendiscord.builders.messages.getSafe("opendiscord:verifybar-close-message"), !generalConfig.data.system.disableVerifyBars));
    index_1.opendiscord.verifybars.get("opendiscord:delete-ticket-close-message").success.add([
        new index_1.api.ODWorker("opendiscord:delete-ticket", 0, async (instance, params, source, cancel) => {
            const { user, member, channel, guild } = instance;
            //check permissions
            const permsResult = await index_1.opendiscord.permissions.checkCommandPerms(generalConfig.data.system.permissions.delete, "support", user, member, channel, guild);
            if (!permsResult.hasPerms) {
                if (permsResult.reason == "not-in-server")
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                else
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild, channel, user, permissions: ["support"] }));
                return cancel();
            }
            //don't allow deleteWithoutTranscript to non-global-admins when enabled
            if (params.data == "no-transcript" && generalConfig.data.system.adminOnlyDeleteWithoutTranscript) {
                if (!index_1.opendiscord.permissions.hasPermissions("support", await index_1.opendiscord.permissions.getPermissions(instance.user, instance.channel, instance.guild, { allowChannelRoleScope: false, allowChannelUserScope: false, allowGlobalRoleScope: true, allowGlobalUserScope: true }))) {
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, permissions: ["support"] }));
                    return cancel();
                }
            }
            //check is in guild/server
            if (!guild) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                return cancel();
            }
            //check if ticket exists
            const ticket = index_1.opendiscord.tickets.get(channel.id);
            if (!ticket || channel.isDMBased()) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-unknown").build("button", { guild, channel, user }));
                return cancel();
            }
            //return when busy
            if (ticket.get("opendiscord:busy").value) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-busy").build("button", { guild, channel, user }));
                return cancel();
            }
            //return when not allowed because of missing messages
            if (!permsResult.isAdmin && (!generalConfig.data.system.allowCloseBeforeMessage || !generalConfig.data.system.allowCloseBeforeAdminMessage)) {
                const analysis = await index_1.opendiscord.transcripts.collector.ticketUserMessagesAnalysis(ticket, guild, channel);
                if (analysis && !generalConfig.data.system.allowCloseBeforeMessage && analysis.totalMessages < 1) {
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild, channel, user, layout: "simple", error: lang.getTranslation("errors.descriptions.closeBeforeMessage"), customTitle: lang.getTranslation("errors.titles.noPermissions") }));
                    return cancel();
                }
                if (analysis && !generalConfig.data.system.allowCloseBeforeAdminMessage && analysis.adminMessages < 1) {
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild, channel, user, layout: "simple", error: lang.getTranslation("errors.descriptions.closeBeforeAdminMessage"), customTitle: lang.getTranslation("errors.titles.noPermissions") }));
                    return cancel();
                }
            }
            //start deleting ticket
            if (params.data == "reason") {
                //delete with reason
                instance.modal(await index_1.opendiscord.builders.modals.getSafe("opendiscord:delete-ticket-reason").build("close-message", { guild, channel, user, ticket }));
            }
            else {
                //delete without reason
                await instance.defer("update", false);
                //don't await DELETE action => else it will update the message after the channel has been deleted
                index_1.opendiscord.actions.get("opendiscord:delete-ticket").run("close-message", { guild, channel, user, ticket, reason: null, sendMessage: false, withoutTranscript: (params.data == "no-transcript") });
                //update ticket (for ticket message) => no-await doesn't wait for the action to set this variable
                ticket.get("opendiscord:for-deletion").value = true;
                await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:delete-message").build("close-message", { guild, channel, user, ticket, reason: null }));
            }
        })
    ]);
    index_1.opendiscord.verifybars.get("opendiscord:delete-ticket-close-message").failure.add([
        new index_1.api.ODWorker("opendiscord:back-to-close-message", 0, async (instance, params, source, cancel) => {
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
            await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:close-message").build("other", { guild, channel, user, ticket, reason }));
        })
    ]);
    //DELETE TICKET REOPEN MESSAGE
    index_1.opendiscord.verifybars.add(new index_1.api.ODVerifyBar("opendiscord:delete-ticket-reopen-message", index_1.opendiscord.builders.messages.getSafe("opendiscord:verifybar-reopen-message"), !generalConfig.data.system.disableVerifyBars));
    index_1.opendiscord.verifybars.get("opendiscord:delete-ticket-reopen-message").success.add([
        new index_1.api.ODWorker("opendiscord:delete-ticket", 0, async (instance, params, source, cancel) => {
            const { user, member, channel, guild } = instance;
            //check permissions
            const permsResult = await index_1.opendiscord.permissions.checkCommandPerms(generalConfig.data.system.permissions.delete, "support", user, member, channel, guild);
            if (!permsResult.hasPerms) {
                if (permsResult.reason == "not-in-server")
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                else
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild, channel, user, permissions: ["support"] }));
                return cancel();
            }
            //don't allow deleteWithoutTranscript to non-global-admins when enabled
            if (params.data == "no-transcript" && generalConfig.data.system.adminOnlyDeleteWithoutTranscript) {
                if (!index_1.opendiscord.permissions.hasPermissions("support", await index_1.opendiscord.permissions.getPermissions(instance.user, instance.channel, instance.guild, { allowChannelRoleScope: false, allowChannelUserScope: false, allowGlobalRoleScope: true, allowGlobalUserScope: true }))) {
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, permissions: ["support"] }));
                    return cancel();
                }
            }
            //check is in guild/server
            if (!guild) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                return cancel();
            }
            //check if ticket exists
            const ticket = index_1.opendiscord.tickets.get(channel.id);
            if (!ticket || channel.isDMBased()) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-unknown").build("button", { guild, channel, user }));
                return cancel();
            }
            //return when busy
            if (ticket.get("opendiscord:busy").value) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-busy").build("button", { guild, channel, user }));
                return cancel();
            }
            //return when not allowed because of missing messages
            if (!permsResult.isAdmin && (!generalConfig.data.system.allowCloseBeforeMessage || !generalConfig.data.system.allowCloseBeforeAdminMessage)) {
                const analysis = await index_1.opendiscord.transcripts.collector.ticketUserMessagesAnalysis(ticket, guild, channel);
                if (analysis && !generalConfig.data.system.allowCloseBeforeMessage && analysis.totalMessages < 1) {
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild, channel, user, layout: "simple", error: lang.getTranslation("errors.descriptions.closeBeforeMessage"), customTitle: lang.getTranslation("errors.titles.noPermissions") }));
                    return cancel();
                }
                if (analysis && !generalConfig.data.system.allowCloseBeforeAdminMessage && analysis.adminMessages < 1) {
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild, channel, user, layout: "simple", error: lang.getTranslation("errors.descriptions.closeBeforeAdminMessage"), customTitle: lang.getTranslation("errors.titles.noPermissions") }));
                    return cancel();
                }
            }
            //start deleting ticket
            if (params.data == "reason") {
                //delete with reason
                instance.modal(await index_1.opendiscord.builders.modals.getSafe("opendiscord:delete-ticket-reason").build("reopen-message", { guild, channel, user, ticket }));
            }
            else {
                //delete without reason
                await instance.defer("update", false);
                //don't await DELETE action => else it will update the message after the channel has been deleted
                index_1.opendiscord.actions.get("opendiscord:delete-ticket").run("reopen-message", { guild, channel, user, ticket, reason: null, sendMessage: false, withoutTranscript: (params.data == "no-transcript") });
                //update ticket (for ticket message) => no-await doesn't wait for the action to set this variable
                ticket.get("opendiscord:for-deletion").value = true;
                await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:delete-message").build("reopen-message", { guild, channel, user, ticket, reason: null }));
            }
        })
    ]);
    index_1.opendiscord.verifybars.get("opendiscord:delete-ticket-reopen-message").failure.add([
        new index_1.api.ODWorker("opendiscord:back-to-reopen-message", 0, async (instance, params, source, cancel) => {
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
            await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:reopen-message").build("other", { guild, channel, user, ticket, reason }));
        })
    ]);
    //DELETE TICKET AUTOCLOSE MESSAGE
    index_1.opendiscord.verifybars.add(new index_1.api.ODVerifyBar("opendiscord:delete-ticket-autoclose-message", index_1.opendiscord.builders.messages.getSafe("opendiscord:verifybar-autoclose-message"), !generalConfig.data.system.disableVerifyBars));
    index_1.opendiscord.verifybars.get("opendiscord:delete-ticket-autoclose-message").success.add([
        new index_1.api.ODWorker("opendiscord:delete-ticket", 0, async (instance, params, source, cancel) => {
            const { user, member, channel, guild } = instance;
            //check permissions
            const permsResult = await index_1.opendiscord.permissions.checkCommandPerms(generalConfig.data.system.permissions.delete, "support", user, member, channel, guild);
            if (!permsResult.hasPerms) {
                if (permsResult.reason == "not-in-server")
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                else
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild, channel, user, permissions: ["support"] }));
                return cancel();
            }
            //don't allow deleteWithoutTranscript to non-global-admins when enabled
            if (params.data == "no-transcript" && generalConfig.data.system.adminOnlyDeleteWithoutTranscript) {
                if (!index_1.opendiscord.permissions.hasPermissions("support", await index_1.opendiscord.permissions.getPermissions(instance.user, instance.channel, instance.guild, { allowChannelRoleScope: false, allowChannelUserScope: false, allowGlobalRoleScope: true, allowGlobalUserScope: true }))) {
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, permissions: ["support"] }));
                    return cancel();
                }
            }
            //check is in guild/server
            if (!guild) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                return cancel();
            }
            //check if ticket exists
            const ticket = index_1.opendiscord.tickets.get(channel.id);
            if (!ticket || channel.isDMBased()) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-unknown").build("button", { guild, channel, user }));
                return cancel();
            }
            //return when busy
            if (ticket.get("opendiscord:busy").value) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-busy").build("button", { guild, channel, user }));
                return cancel();
            }
            //return when not allowed because of missing messages
            if (!permsResult.isAdmin && (!generalConfig.data.system.allowCloseBeforeMessage || !generalConfig.data.system.allowCloseBeforeAdminMessage)) {
                const analysis = await index_1.opendiscord.transcripts.collector.ticketUserMessagesAnalysis(ticket, guild, channel);
                if (analysis && !generalConfig.data.system.allowCloseBeforeMessage && analysis.totalMessages < 1) {
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild, channel, user, layout: "simple", error: lang.getTranslation("errors.descriptions.closeBeforeMessage"), customTitle: lang.getTranslation("errors.titles.noPermissions") }));
                    return cancel();
                }
                if (analysis && !generalConfig.data.system.allowCloseBeforeAdminMessage && analysis.adminMessages < 1) {
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild, channel, user, layout: "simple", error: lang.getTranslation("errors.descriptions.closeBeforeAdminMessage"), customTitle: lang.getTranslation("errors.titles.noPermissions") }));
                    return cancel();
                }
            }
            //start deleting ticket
            if (params.data == "reason") {
                //delete with reason
                instance.modal(await index_1.opendiscord.builders.modals.getSafe("opendiscord:delete-ticket-reason").build("autoclose-message", { guild, channel, user, ticket }));
            }
            else {
                //delete without reason
                await instance.defer("update", false);
                //don't await DELETE action => else it will update the message after the channel has been deleted
                index_1.opendiscord.actions.get("opendiscord:delete-ticket").run("autoclose-message", { guild, channel, user, ticket, reason: null, sendMessage: false, withoutTranscript: (params.data == "no-transcript") });
                //update ticket (for ticket message) => no-await doesn't wait for the action to set this variable
                ticket.get("opendiscord:for-deletion").value = true;
                await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:delete-message").build("autoclose-message", { guild, channel, user, ticket, reason: null }));
            }
        })
    ]);
    index_1.opendiscord.verifybars.get("opendiscord:delete-ticket-autoclose-message").failure.add([
        new index_1.api.ODWorker("opendiscord:back-to-autoclose-message", 0, async (instance, params, source, cancel) => {
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
            await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:autoclose-message").build("other", { guild, channel, user, ticket }));
        })
    ]);
};
exports.registerVerifyBars = registerVerifyBars;
