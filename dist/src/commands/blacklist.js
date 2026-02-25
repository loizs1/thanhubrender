"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommandResponders = void 0;
///////////////////////////////////////
//BLACKLIST COMMAND
///////////////////////////////////////
const index_1 = require("../index");
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const registerCommandResponders = async () => {
    //BLACKLIST COMMAND RESPONDER
    index_1.opendiscord.responders.commands.add(new index_1.api.ODCommandResponder("opendiscord:blacklist", generalConfig.data.prefix, /^blacklist/));
    index_1.opendiscord.responders.commands.get("opendiscord:blacklist").workers.add([
        new index_1.api.ODWorker("opendiscord:blacklist", 0, async (instance, params, source, cancel) => {
            const { guild, channel, user, member } = instance;
            //check permissions
            const permsResult = await index_1.opendiscord.permissions.checkCommandPerms(generalConfig.data.system.permissions.blacklist, "support", user, member, channel, guild);
            if (!permsResult.hasPerms) {
                if (permsResult.reason == "not-in-server")
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                else
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build(source, { guild, channel, user, permissions: ["support"] }));
                return cancel();
            }
            //check is in guild/server
            if (!guild) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build(source, { channel: instance.channel, user: instance.user }));
                return cancel();
            }
            //subcommands
            const scope = instance.options.getSubCommand();
            if (!scope || (scope != "add" && scope != "get" && scope != "remove" && scope != "view"))
                return;
            if (scope == "view") {
                await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:blacklist-view").build(source, { guild, channel, user }));
            }
            else if (scope == "get") {
                const data = instance.options.getUser("user", true);
                await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:blacklist-get").build(source, { guild, channel, user, data }));
            }
            else if (scope == "add") {
                const data = instance.options.getUser("user", true);
                const reason = instance.options.getString("reason", false);
                index_1.opendiscord.blacklist.add(new index_1.api.ODBlacklist(data.id, reason), true);
                index_1.opendiscord.log(instance.user.displayName + " added " + data.displayName + " to blacklist!", "info", [
                    { key: "user", value: user.username },
                    { key: "userid", value: user.id, hidden: true },
                    { key: "channelid", value: channel.id, hidden: true },
                    { key: "method", value: source },
                    { key: "reason", value: reason ?? "/" }
                ]);
                //manage stats
                await index_1.opendiscord.stats.get("opendiscord:global").setStat("opendiscord:users-blacklisted", 1, "increase");
                await index_1.opendiscord.stats.get("opendiscord:user").setStat("opendiscord:users-blacklisted", user.id, 1, "increase");
                await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:blacklist-add").build(source, { guild, channel, user, data, reason }));
            }
            else if (scope == "remove") {
                const data = instance.options.getUser("user", true);
                const reason = instance.options.getString("reason", false);
                index_1.opendiscord.blacklist.remove(data.id);
                index_1.opendiscord.log(instance.user.displayName + " removed " + data.displayName + " from blacklist!", "info", [
                    { key: "user", value: user.username },
                    { key: "userid", value: user.id, hidden: true },
                    { key: "channelid", value: channel.id, hidden: true },
                    { key: "method", value: source },
                    { key: "reason", value: reason ?? "/" }
                ]);
                await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:blacklist-remove").build(source, { guild, channel, user, data, reason }));
            }
        }),
        new index_1.api.ODWorker("opendiscord:discord-logs", 1, async (instance, params, source, cancel) => {
            const { guild, channel, user } = instance;
            if (!guild)
                return;
            const scope = instance.options.getSubCommand();
            if (!scope || (scope != "add" && scope != "remove"))
                return;
            const data = instance.options.getUser("user", true);
            const reason = instance.options.getString("reason", false);
            //to logs
            if (generalConfig.data.system.logs.enabled && generalConfig.data.system.messages.blacklisting.logs) {
                const logChannel = index_1.opendiscord.posts.get("opendiscord:logs");
                if (logChannel)
                    logChannel.send(await index_1.opendiscord.builders.messages.getSafe("opendiscord:blacklist-logs").build(source, { guild, channel, user, mode: scope, data, reason }));
            }
            //to dm
            if (generalConfig.data.system.messages.blacklisting.dm)
                await index_1.opendiscord.client.sendUserDm(user, await index_1.opendiscord.builders.messages.getSafe("opendiscord:blacklist-dm").build(source, { guild, channel, user, mode: scope, data, reason }));
        }),
        new index_1.api.ODWorker("opendiscord:logs", -1, (instance, params, source, cancel) => {
            const scope = instance.options.getSubCommand();
            index_1.opendiscord.log(instance.user.displayName + " used the 'blacklist " + scope + "' command!", "info", [
                { key: "user", value: instance.user.username },
                { key: "userid", value: instance.user.id, hidden: true },
                { key: "channelid", value: instance.channel.id, hidden: true },
                { key: "method", value: source }
            ]);
        })
    ]);
};
exports.registerCommandResponders = registerCommandResponders;
