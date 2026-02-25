"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerModalResponders = exports.registerButtonResponders = exports.registerCommandResponders = void 0;
///////////////////////////////////////
//DELETE COMMAND
///////////////////////////////////////
const index_1 = require("../index");
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const lang = index_1.opendiscord.languages;
const registerCommandResponders = async () => {
    //DELETE COMMAND RESPONDER
    index_1.opendiscord.responders.commands.add(new index_1.api.ODCommandResponder("opendiscord:delete", generalConfig.data.prefix, "delete"));
    index_1.opendiscord.responders.commands.get("opendiscord:delete").workers.add([
        new index_1.api.ODWorker("opendiscord:delete", 0, async (instance, params, source, cancel) => {
            const { user, member, channel, guild } = instance;
            //check permissions
            const permsResult = await index_1.opendiscord.permissions.checkCommandPerms(generalConfig.data.system.permissions.delete, "support", user, member, channel, guild);
            if (!permsResult.hasPerms) {
                if (permsResult.reason == "not-in-server")
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                else
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build(source, { guild, channel, user, permissions: ["support"] }));
                return cancel();
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
            const reason = instance.options.getString("reason", false);
            const withoutTranscript = instance.options.getBoolean("notranscript", false) ?? false;
            //don't allow deleteWithoutTranscript to non-global-admins when enabled
            if (withoutTranscript && generalConfig.data.system.adminOnlyDeleteWithoutTranscript) {
                if (!index_1.opendiscord.permissions.hasPermissions("support", await index_1.opendiscord.permissions.getPermissions(instance.user, instance.channel, instance.guild, { allowChannelRoleScope: false, allowChannelUserScope: false, allowGlobalRoleScope: true, allowGlobalUserScope: true }))) {
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, permissions: ["support"] }));
                    return cancel();
                }
            }
            //start deleting ticket
            await instance.defer(false);
            await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:delete-message").build(source, { guild, channel, user, ticket, reason }));
            await index_1.opendiscord.actions.get("opendiscord:delete-ticket").run(source, { guild, channel, user, ticket, reason, sendMessage: false, withoutTranscript });
        }),
        new index_1.api.ODWorker("opendiscord:logs", -1, (instance, params, source, cancel) => {
            index_1.opendiscord.log(instance.user.displayName + " used the 'delete' command!", "info", [
                { key: "user", value: instance.user.username },
                { key: "userid", value: instance.user.id, hidden: true },
                { key: "channelid", value: instance.channel.id, hidden: true },
                { key: "method", value: source }
            ]);
        })
    ]);
};
exports.registerCommandResponders = registerCommandResponders;
const registerButtonResponders = async () => {
    //DELETE TICKET BUTTON RESPONDER
    index_1.opendiscord.responders.buttons.add(new index_1.api.ODButtonResponder("opendiscord:delete-ticket", /^od:delete-ticket/));
    index_1.opendiscord.responders.buttons.get("opendiscord:delete-ticket").workers.add(new index_1.api.ODWorker("opendiscord:delete-ticket", 0, async (instance, params, source, cancel) => {
        const originalSource = instance.interaction.customId.split("_")[1];
        if (originalSource == "ticket-message")
            await index_1.opendiscord.verifybars.get("opendiscord:delete-ticket-ticket-message").activate(instance);
        else if (originalSource == "close-message")
            await index_1.opendiscord.verifybars.get("opendiscord:delete-ticket-close-message").activate(instance);
        else if (originalSource == "reopen-message")
            await index_1.opendiscord.verifybars.get("opendiscord:delete-ticket-reopen-message").activate(instance);
        else if (originalSource == "autoclose-message")
            await index_1.opendiscord.verifybars.get("opendiscord:delete-ticket-autoclose-message").activate(instance);
        else
            await instance.defer("update", false);
    }));
};
exports.registerButtonResponders = registerButtonResponders;
const registerModalResponders = async () => {
    //REOPEN WITH REASON MODAL RESPONDER
    index_1.opendiscord.responders.modals.add(new index_1.api.ODModalResponder("opendiscord:delete-ticket-reason", /^od:delete-ticket-reason_/));
    index_1.opendiscord.responders.modals.get("opendiscord:delete-ticket-reason").workers.add([
        new index_1.api.ODWorker("opendiscord:delete-ticket-reason", 0, async (instance, params, source, cancel) => {
            const { guild, channel, user } = instance;
            if (!channel)
                return;
            if (!guild) {
                //error
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build(source, { channel, user: instance.user }));
                return cancel();
            }
            const ticket = index_1.opendiscord.tickets.get(instance.interaction.customId.split("_")[1]);
            if (!ticket || channel.isDMBased()) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-unknown").build("button", { guild, channel, user }));
                return;
            }
            const originalSource = instance.interaction.customId.split("_")[2];
            const reason = instance.values.getTextField("reason", true);
            //delete with reason
            if (originalSource == "ticket-message") {
                await instance.defer("update", false);
                //don't await DELETE action => else it will update the message after the channel has been deleted
                index_1.opendiscord.actions.get("opendiscord:delete-ticket").run(originalSource, { guild, channel, user, ticket, reason, sendMessage: true, withoutTranscript: false });
                //update ticket (for ticket message) => no-await doesn't wait for the action to set this variable
                ticket.get("opendiscord:for-deletion").value = true;
                await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-message").build("other", { guild, channel, user, ticket }));
            }
            else if (originalSource == "close-message") {
                await instance.defer("update", false);
                //don't await DELETE action => else it will update the message after the channel has been deleted
                index_1.opendiscord.actions.get("opendiscord:delete-ticket").run(originalSource, { guild, channel, user, ticket, reason, sendMessage: false, withoutTranscript: false });
                await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:delete-message").build("other", { guild, channel, user, ticket, reason }));
            }
            else if (originalSource == "reopen-message") {
                await instance.defer("update", false);
                //don't await DELETE action => else it will update the message after the channel has been deleted
                index_1.opendiscord.actions.get("opendiscord:delete-ticket").run(originalSource, { guild, channel, user, ticket, reason, sendMessage: false, withoutTranscript: false });
                await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:delete-message").build("other", { guild, channel, user, ticket, reason }));
            }
            else if (originalSource == "autoclose-message") {
                await instance.defer("update", false);
                //don't await DELETE action => else it will update the message after the channel has been deleted
                index_1.opendiscord.actions.get("opendiscord:delete-ticket").run(originalSource, { guild, channel, user, ticket, reason, sendMessage: false, withoutTranscript: false });
                await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:delete-message").build("other", { guild, channel, user, ticket, reason }));
            }
            else {
                await instance.defer("update", false);
                //don't await DELETE action => else it will update the message after the channel has been deleted
                index_1.opendiscord.actions.get("opendiscord:delete-ticket").run(originalSource, { guild, channel, user, ticket, reason, sendMessage: true, withoutTranscript: false });
            }
        })
    ]);
};
exports.registerModalResponders = registerModalResponders;
