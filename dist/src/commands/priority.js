"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommandResponders = void 0;
///////////////////////////////////////
//PRIORITY COMMAND
///////////////////////////////////////
const index_1 = require("../index");
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const registerCommandResponders = async () => {
    //PRIORITY COMMAND RESPONDER
    index_1.opendiscord.responders.commands.add(new index_1.api.ODCommandResponder("opendiscord:priority", generalConfig.data.prefix, "priority"));
    index_1.opendiscord.responders.commands.get("opendiscord:priority").workers.add([
        new index_1.api.ODWorker("opendiscord:priority", 0, async (instance, params, source, cancel) => {
            const { guild, channel, user, member } = instance;
            //check permissions
            const permsResult = await index_1.opendiscord.permissions.checkCommandPerms(generalConfig.data.system.permissions.priority, "support", user, member, channel, guild);
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
            //subcommands
            const scope = instance.options.getSubCommand();
            if (!scope || (scope != "set" && scope != "get"))
                return;
            if (scope == "set") {
                const priorityName = instance.options.getString("priority", true);
                const reason = instance.options.getString("reason", false);
                const priority = index_1.opendiscord.priorities.getAll().find((lvl) => lvl.rawName === priorityName) ?? null;
                if (!priority) {
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild, channel, user, layout: "simple", error: "Please provide a valid priority level.", customTitle: "Unknown Priority Level" }));
                    return cancel();
                }
                //start changing ticket priority
                await instance.defer(false);
                await index_1.opendiscord.actions.get("opendiscord:update-ticket-priority").run(source, { guild, channel, user, ticket, newPriority: priority, sendMessage: false, reason });
                await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:priority-set").build(source, { guild, channel, user, ticket, priority, reason }));
            }
            else if (scope == "get") {
                const priority = index_1.opendiscord.priorities.getFromPriorityLevel(ticket.get("opendiscord:priority").value);
                await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:priority-get").build(source, { guild, channel, user, ticket, priority }));
            }
        }),
        new index_1.api.ODWorker("opendiscord:logs", -1, (instance, params, source, cancel) => {
            const scope = instance.options.getSubCommand();
            index_1.opendiscord.log(instance.user.displayName + " used the 'priority " + scope + "' command!", "info", [
                { key: "user", value: instance.user.username },
                { key: "userid", value: instance.user.id, hidden: true },
                { key: "channelid", value: instance.channel.id, hidden: true },
                { key: "method", value: source }
            ]);
        })
    ]);
};
exports.registerCommandResponders = registerCommandResponders;
