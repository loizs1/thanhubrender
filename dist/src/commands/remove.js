"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommandResponders = void 0;
///////////////////////////////////////
//REMOVE COMMAND
///////////////////////////////////////
const index_1 = require("../index");
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const registerCommandResponders = async () => {
    //REMOVE COMMAND RESPONDER
    index_1.opendiscord.responders.commands.add(new index_1.api.ODCommandResponder("opendiscord:remove", generalConfig.data.prefix, "remove"));
    index_1.opendiscord.responders.commands.get("opendiscord:remove").workers.add([
        new index_1.api.ODWorker("opendiscord:remove", 0, async (instance, params, source, cancel) => {
            const { guild, channel, user, member } = instance;
            //check permissions
            const permsResult = await index_1.opendiscord.permissions.checkCommandPerms(generalConfig.data.system.permissions.remove, "support", user, member, channel, guild);
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
            const data = instance.options.getUser("user", true);
            const reason = instance.options.getString("reason", false);
            //return when user is not a participant of the ticket (admins & creator can't be removed)
            const participants = await index_1.opendiscord.tickets.getAllTicketParticipants(ticket);
            if (!participants || !participants.find((p) => p.user.id == data.id && p.role == "participant")) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild, channel, user, error: index_1.opendiscord.languages.getTranslation("errors.actionInvalid.remove"), layout: "simple" }));
                return cancel();
            }
            //start removing user from ticket
            await instance.defer(false);
            await index_1.opendiscord.actions.get("opendiscord:remove-ticket-user").run(source, { guild, channel, user, ticket, reason, sendMessage: false, data });
            await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:remove-message").build(source, { guild, channel, user, ticket, reason, data }));
        }),
        new index_1.api.ODWorker("opendiscord:logs", -1, (instance, params, source, cancel) => {
            index_1.opendiscord.log(instance.user.displayName + " used the 'remove' command!", "info", [
                { key: "user", value: instance.user.username },
                { key: "userid", value: instance.user.id, hidden: true },
                { key: "channelid", value: instance.channel.id, hidden: true },
                { key: "method", value: source }
            ]);
        })
    ]);
};
exports.registerCommandResponders = registerCommandResponders;
