"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerModalResponders = exports.registerButtonResponders = exports.registerCommandResponders = void 0;
///////////////////////////////////////
//CLAIM COMMAND
///////////////////////////////////////
const index_1 = require("../index");
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const registerCommandResponders = async () => {
    //CLAIM COMMAND RESPONDER
    index_1.opendiscord.responders.commands.add(new index_1.api.ODCommandResponder("opendiscord:claim", generalConfig.data.prefix, "claim"));
    index_1.opendiscord.responders.commands.get("opendiscord:claim").workers.add([
        new index_1.api.ODWorker("opendiscord:claim", 0, async (instance, params, source, cancel) => {
            const { guild, channel, user, member } = instance;
            //check permissions
            const permsResult = await index_1.opendiscord.permissions.checkCommandPerms(generalConfig.data.system.permissions.claim, "support", user, member, channel, guild);
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
            //return when already claimed
            if (ticket.get("opendiscord:claimed").value) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild, channel, user, error: index_1.opendiscord.languages.getTranslation("errors.actionInvalid.claim"), layout: "simple" }));
                return cancel();
            }
            //return when busy
            if (ticket.get("opendiscord:busy").value) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-busy").build("button", { guild, channel, user }));
                return cancel();
            }
            const claimUser = instance.options.getUser("user", false) ?? user;
            const reason = instance.options.getString("reason", false);
            //start claiming ticket
            await instance.defer(false);
            await index_1.opendiscord.actions.get("opendiscord:claim-ticket").run(source, { guild, channel, user: claimUser, ticket, reason, sendMessage: false });
            await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:claim-message").build(source, { guild, channel, user: claimUser, ticket, reason }));
        }),
        new index_1.api.ODWorker("opendiscord:logs", -1, (instance, params, source, cancel) => {
            index_1.opendiscord.log(instance.user.displayName + " used the 'claim' command!", "info", [
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
    //CLAIM TICKET BUTTON RESPONDER
    index_1.opendiscord.responders.buttons.add(new index_1.api.ODButtonResponder("opendiscord:claim-ticket", /^od:claim-ticket/));
    index_1.opendiscord.responders.buttons.get("opendiscord:claim-ticket").workers.add(new index_1.api.ODWorker("opendiscord:claim-ticket", 0, async (instance, params, source, cancel) => {
        const originalSource = instance.interaction.customId.split("_")[1];
        if (originalSource == "ticket-message")
            await index_1.opendiscord.verifybars.get("opendiscord:claim-ticket-ticket-message").activate(instance);
        else if (originalSource == "unclaim-message")
            await index_1.opendiscord.verifybars.get("opendiscord:claim-ticket-unclaim-message").activate(instance);
        else
            await instance.defer("update", false);
    }));
};
exports.registerButtonResponders = registerButtonResponders;
const registerModalResponders = async () => {
    //CLAIM WITH REASON MODAL RESPONDER
    index_1.opendiscord.responders.modals.add(new index_1.api.ODModalResponder("opendiscord:claim-ticket-reason", /^od:claim-ticket-reason_/));
    index_1.opendiscord.responders.modals.get("opendiscord:claim-ticket-reason").workers.add([
        new index_1.api.ODWorker("opendiscord:claim-ticket-reason", 0, async (instance, params, source, cancel) => {
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
            //claim with reason
            if (originalSource == "ticket-message") {
                await instance.defer("update", false);
                await index_1.opendiscord.actions.get("opendiscord:claim-ticket").run(originalSource, { guild, channel, user, ticket, reason, sendMessage: true });
                await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-message").build("other", { guild, channel, user, ticket }));
            }
            else if (originalSource == "unclaim-message") {
                await instance.defer("update", false);
                await index_1.opendiscord.actions.get("opendiscord:claim-ticket").run(originalSource, { guild, channel, user, ticket, reason, sendMessage: false });
                await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:claim-message").build("other", { guild, channel, user, ticket, reason }));
            }
            else {
                await instance.defer("update", false);
                await index_1.opendiscord.actions.get("opendiscord:claim-ticket").run(originalSource, { guild, channel, user, ticket, reason, sendMessage: true });
            }
        })
    ]);
};
exports.registerModalResponders = registerModalResponders;
