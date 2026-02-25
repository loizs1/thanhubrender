"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommandResponders = void 0;
///////////////////////////////////////
//STATS COMMAND
///////////////////////////////////////
const index_1 = require("../index");
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const registerCommandResponders = async () => {
    //STATS COMMAND RESPONDER
    index_1.opendiscord.responders.commands.add(new index_1.api.ODCommandResponder("opendiscord:stats", generalConfig.data.prefix, /^stats/));
    index_1.opendiscord.responders.commands.get("opendiscord:stats").workers.add([
        new index_1.api.ODWorker("opendiscord:permissions", 1, async (instance, params, source, cancel) => {
            const permissionMode = generalConfig.data.system.permissions.stats;
            //command is disabled
            if (permissionMode == "none") {
                //no permissions
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, permissions: [] }));
                return cancel();
            }
            //reset subcommand is owner/developer only
            if (instance.options.getSubCommand() == "reset") {
                if (!index_1.opendiscord.permissions.hasPermissions("owner", await index_1.opendiscord.permissions.getPermissions(instance.user, instance.channel, instance.guild))) {
                    //no permissions
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build(source, { guild: instance.guild, channel: instance.channel, user: instance.user, permissions: ["owner", "developer"] }));
                    return cancel();
                }
                else
                    return;
            }
            //permissions for normal scopes
            if (permissionMode == "everyone")
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
        new index_1.api.ODWorker("opendiscord:stats", 0, async (instance, params, source, cancel) => {
            const { user, member, channel, guild } = instance;
            //check permissions
            if (generalConfig.data.system.permissions.stats === "none") {
                //command is disabled
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, permissions: [] }));
                return cancel();
            }
            else if (instance.options.getSubCommand() === "reset" && !index_1.opendiscord.permissions.hasPermissions("owner", await index_1.opendiscord.permissions.getPermissions(instance.user, instance.channel, instance.guild))) {
                //reset --> owner/developer role is required
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build(source, { guild: instance.guild, channel: instance.channel, user: instance.user, permissions: ["owner", "developer"] }));
                return cancel();
            }
            else {
                //default permissions check
                const permsResult = await index_1.opendiscord.permissions.checkCommandPerms(generalConfig.data.system.permissions.stats, "support", user, member, channel, guild);
                if (!permsResult.hasPerms) {
                    if (permsResult.reason == "not-in-server")
                        await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                    else
                        await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build(source, { guild, channel, user, permissions: ["support"] }));
                    return cancel();
                }
            }
            //check is in guild/server
            if (!guild) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build(source, { channel: instance.channel, user: instance.user }));
                return cancel();
            }
            //subcommands
            const scope = instance.options.getSubCommand();
            if (!scope || (scope != "global" && scope != "ticket" && scope != "user" && scope != "reset"))
                return;
            if (scope == "global") {
                await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:stats-global").build(source, { guild, channel, user }));
            }
            else if (scope == "ticket") {
                const id = instance.options.getChannel("ticket", false)?.id ?? channel.id;
                const ticket = index_1.opendiscord.tickets.get(id);
                if (ticket)
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:stats-ticket").build(source, { guild, channel, user, scopeData: ticket }));
                else
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:stats-ticket-unknown").build(source, { guild, channel, user, id }));
            }
            else if (scope == "user") {
                const statsUser = instance.options.getUser("user", false) ?? user;
                await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:stats-user").build(source, { guild, channel, user, scopeData: statsUser }));
            }
            else if (scope == "reset") {
                const reason = instance.options.getString("reason", false);
                index_1.opendiscord.stats.reset();
                await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:stats-reset").build(source, { guild, channel, user, reason }));
            }
        }),
        new index_1.api.ODWorker("opendiscord:logs", -1, (instance, params, source, cancel) => {
            const scope = instance.options.getSubCommand();
            let data;
            if (scope == "ticket") {
                data = instance.options.getChannel("ticket", false)?.id ?? instance.channel.id;
            }
            else if (scope == "user") {
                data = instance.options.getUser("user", false)?.id ?? instance.user.id;
            }
            else
                data = "/";
            index_1.opendiscord.log(instance.user.displayName + " used the 'stats " + scope + "' command!", "info", [
                { key: "user", value: instance.user.username },
                { key: "userid", value: instance.user.id, hidden: true },
                { key: "channelid", value: instance.channel.id, hidden: true },
                { key: "method", value: source },
                { key: "data", value: data },
            ]);
        })
    ]);
};
exports.registerCommandResponders = registerCommandResponders;
