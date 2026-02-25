"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerModalResponders = exports.registerButtonResponders = exports.registerCommandResponders = void 0;
///////////////////////////////////////
//PIN COMMAND
///////////////////////////////////////
const index_1 = require("../index");
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const registerCommandResponders = async () => {
    //PIN COMMAND RESPONDER
    index_1.opendiscord.responders.commands.add(new index_1.api.ODCommandResponder("opendiscord:pin", generalConfig.data.prefix, "pin"));
    index_1.opendiscord.responders.commands.get("opendiscord:pin").workers.add([
        new index_1.api.ODWorker("opendiscord:permissions", 1, async (instance, params, source, cancel) => {
            const permissionMode = generalConfig.data.system.permissions.pin;
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
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build(source, { guild: instance.guild, channel: instance.channel, user: instance.user, permissions: ["support"] }));
                    return cancel();
                }
                else
                    return;
            }
            else {
                if (!instance.guild || !instance.member) {
                    //error
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build(source, { guild: instance.guild, channel: instance.channel, user: instance.user, error: "Permission Error: Not in Server #1", layout: "advanced" }));
                    return cancel();
                }
                const role = await index_1.opendiscord.client.fetchGuildRole(instance.guild, permissionMode);
                if (!role) {
                    //error
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build(source, { guild: instance.guild, channel: instance.channel, user: instance.user, error: "Permission Error: Not in Server #2", layout: "advanced" }));
                    return cancel();
                }
                if (!role.members.has(instance.member.id)) {
                    //no permissions
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build(source, { guild: instance.guild, channel: instance.channel, user: instance.user, permissions: [] }));
                    return cancel();
                }
                else
                    return;
            }
        }),
        new index_1.api.ODWorker("opendiscord:pin", 0, async (instance, params, source, cancel) => {
            const { guild, channel, user, member } = instance;
            //check permissions
            const permsResult = await index_1.opendiscord.permissions.checkCommandPerms(generalConfig.data.system.permissions.pin, "support", user, member, channel, guild);
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
            //return when already pinned
            if (ticket.get("opendiscord:pinned").value) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild, channel, user, error: index_1.opendiscord.languages.getTranslation("errors.actionInvalid.pin"), layout: "simple" }));
                return cancel();
            }
            //return when busy
            if (ticket.get("opendiscord:busy").value) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-busy").build("button", { guild, channel, user }));
                return cancel();
            }
            const reason = instance.options.getString("reason", false);
            //start pinning ticket
            await instance.defer(false);
            await index_1.opendiscord.actions.get("opendiscord:pin-ticket").run(source, { guild, channel, user, ticket, reason, sendMessage: false });
            await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:pin-message").build(source, { guild, channel, user, ticket, reason }));
        }),
        new index_1.api.ODWorker("opendiscord:logs", -1, (instance, params, source, cancel) => {
            index_1.opendiscord.log(instance.user.displayName + " used the 'pin' command!", "info", [
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
    //PIN TICKET BUTTON RESPONDER
    index_1.opendiscord.responders.buttons.add(new index_1.api.ODButtonResponder("opendiscord:pin-ticket", /^od:pin-ticket/));
    index_1.opendiscord.responders.buttons.get("opendiscord:pin-ticket").workers.add(new index_1.api.ODWorker("opendiscord:pin-ticket", 0, async (instance, params, source, cancel) => {
        const originalSource = instance.interaction.customId.split("_")[1];
        if (originalSource == "ticket-message")
            await index_1.opendiscord.verifybars.get("opendiscord:pin-ticket-ticket-message").activate(instance);
        else if (originalSource == "unpin-message")
            await index_1.opendiscord.verifybars.get("opendiscord:pin-ticket-unpin-message").activate(instance);
        else
            await instance.defer("update", false);
    }));
};
exports.registerButtonResponders = registerButtonResponders;
const registerModalResponders = async () => {
    //PIN WITH REASON MODAL RESPONDER
    index_1.opendiscord.responders.modals.add(new index_1.api.ODModalResponder("opendiscord:pin-ticket-reason", /^od:pin-ticket-reason_/));
    index_1.opendiscord.responders.modals.get("opendiscord:pin-ticket-reason").workers.add([
        new index_1.api.ODWorker("opendiscord:pin-ticket-reason", 0, async (instance, params, source, cancel) => {
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
            //pin with reason
            if (originalSource == "ticket-message") {
                await instance.defer("update", false);
                await index_1.opendiscord.actions.get("opendiscord:pin-ticket").run(originalSource, { guild, channel, user, ticket, reason, sendMessage: true });
                await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-message").build("other", { guild, channel, user, ticket }));
            }
            else if (originalSource == "unpin-message") {
                await instance.defer("update", false);
                await index_1.opendiscord.actions.get("opendiscord:pin-ticket").run(originalSource, { guild, channel, user, ticket, reason, sendMessage: false });
                await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:pin-message").build("other", { guild, channel, user, ticket, reason }));
            }
            else {
                await instance.defer("update", false);
                await index_1.opendiscord.actions.get("opendiscord:pin-ticket").run(originalSource, { guild, channel, user, ticket, reason, sendMessage: true });
            }
        })
    ]);
};
exports.registerModalResponders = registerModalResponders;
