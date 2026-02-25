"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerModalResponders = exports.registerButtonResponders = exports.registerCommandResponders = void 0;
///////////////////////////////////////
//REOPEN COMMAND
///////////////////////////////////////
const index_1 = require("../index");
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const registerCommandResponders = async () => {
    //REOPEN COMMAND RESPONDER
    index_1.opendiscord.responders.commands.add(new index_1.api.ODCommandResponder("opendiscord:reopen", generalConfig.data.prefix, "reopen"));
    index_1.opendiscord.responders.commands.get("opendiscord:reopen").workers.add([
        new index_1.api.ODWorker("opendiscord:reopen", 0, async (instance, params, source, cancel) => {
            const { guild, channel, user, member } = instance;
            //check permissions
            const permsResult = await index_1.opendiscord.permissions.checkCommandPerms(generalConfig.data.system.permissions.reopen, "support", user, member, channel, guild);
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
            //return when not closed
            if (!ticket.get("opendiscord:closed").value) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild, channel, user, error: index_1.opendiscord.languages.getTranslation("errors.actionInvalid.reopen"), layout: "simple" }));
                return cancel();
            }
            //return when busy
            if (ticket.get("opendiscord:busy").value) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-busy").build("button", { guild, channel, user }));
                return cancel();
            }
            const reason = instance.options.getString("reason", false);
            //start reopening ticket
            await instance.defer(false);
            await index_1.opendiscord.actions.get("opendiscord:reopen-ticket").run(source, { guild, channel, user, ticket, reason, sendMessage: false });
            await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:reopen-message").build(source, { guild, channel, user, ticket, reason }));
        }),
        new index_1.api.ODWorker("opendiscord:logs", -1, (instance, params, source, cancel) => {
            index_1.opendiscord.log(instance.user.displayName + " used the 'reopen' command!", "info", [
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
    //REOPEN TICKET BUTTON RESPONDER
    index_1.opendiscord.responders.buttons.add(new index_1.api.ODButtonResponder("opendiscord:reopen-ticket", /^od:reopen-ticket/));
    index_1.opendiscord.responders.buttons.get("opendiscord:reopen-ticket").workers.add(new index_1.api.ODWorker("opendiscord:reopen-ticket", 0, async (instance, params, source, cancel) => {
        const originalSource = instance.interaction.customId.split("_")[1];
        if (originalSource == "ticket-message")
            await index_1.opendiscord.verifybars.get("opendiscord:reopen-ticket-ticket-message").activate(instance);
        else if (originalSource == "close-message")
            await index_1.opendiscord.verifybars.get("opendiscord:reopen-ticket-close-message").activate(instance);
        else if (originalSource == "autoclose-message")
            await index_1.opendiscord.verifybars.get("opendiscord:reopen-ticket-autoclose-message").activate(instance);
        else
            await instance.defer("update", false);
    }));
};
exports.registerButtonResponders = registerButtonResponders;
const registerModalResponders = async () => {
    //REOPEN WITH REASON MODAL RESPONDER
    index_1.opendiscord.responders.modals.add(new index_1.api.ODModalResponder("opendiscord:reopen-ticket-reason", /^od:reopen-ticket-reason_/));
    index_1.opendiscord.responders.modals.get("opendiscord:reopen-ticket-reason").workers.add([
        new index_1.api.ODWorker("opendiscord:reopen-ticket-reason", 0, async (instance, params, source, cancel) => {
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
            //reopen with reason
            if (originalSource == "ticket-message") {
                await instance.defer("update", false);
                await index_1.opendiscord.actions.get("opendiscord:reopen-ticket").run(originalSource, { guild, channel, user, ticket, reason, sendMessage: true });
                await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-message").build("other", { guild, channel, user, ticket }));
            }
            else if (originalSource == "close-message") {
                await instance.defer("update", false);
                await index_1.opendiscord.actions.get("opendiscord:reopen-ticket").run(originalSource, { guild, channel, user, ticket, reason, sendMessage: false });
                await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:reopen-message").build("other", { guild, channel, user, ticket, reason }));
            }
            else if (originalSource == "autoclose-message") {
                await instance.defer("update", false);
                await index_1.opendiscord.actions.get("opendiscord:reopen-ticket").run(originalSource, { guild, channel, user, ticket, reason, sendMessage: false });
                await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:reopen-message").build("other", { guild, channel, user, ticket, reason }));
            }
            else {
                await instance.defer("update", false);
                await index_1.opendiscord.actions.get("opendiscord:reopen-ticket").run(originalSource, { guild, channel, user, ticket, reason, sendMessage: true });
            }
        })
    ]);
};
exports.registerModalResponders = registerModalResponders;
