"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommandResponders = void 0;
///////////////////////////////////////
//LEADERBOARD COMMAND
///////////////////////////////////////
const index_1 = require("../index");
const discord = __importStar(require("discord.js"));
const registerCommandResponders = async () => {
    const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
    if (!generalConfig)
        return;
    //LEADERBOARD COMMAND RESPONDER
    index_1.opendiscord.responders.commands.add(new index_1.api.ODCommandResponder("opendiscord:leaderboard", generalConfig.data.prefix, "leaderboard"));
    const leaderboardResponder = index_1.opendiscord.responders.commands.get("opendiscord:leaderboard");
    if (!leaderboardResponder)
        return;
    leaderboardResponder.workers.add(new index_1.api.ODWorker("opendiscord:leaderboard", 0, async (instance, params, source, cancel) => {
        const { user, member, channel, guild } = instance;
        //check permissions using config-based permission
        const permsResult = await index_1.opendiscord.permissions.checkCommandPerms(generalConfig.data.system.permissions.leaderboard, "support", user, member, channel, guild);
        if (!permsResult.hasPerms) {
            if (permsResult.reason == "not-in-server")
                await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("slash", { channel, user }));
            else
                await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build(source, { guild, channel, user, permissions: ["support"] }));
            return cancel();
        }
        if (!guild) {
            await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("slash", { channel, user }));
            return cancel();
        }
        await instance.defer(false);
        //check subcommand
        const subCommand = instance.options.getSubCommand();
        //read leaderboard database
        const leaderboardDb = index_1.opendiscord.databases.get("opendiscord:leaderboard");
        if (!leaderboardDb) {
            await instance.reply({ id: new index_1.api.ODId("opendiscord:leaderboard-error"), ephemeral: true, message: { content: ":x: **Leaderboard database not found!**" } });
            return cancel();
        }
        const mainColor = (generalConfig.data.mainColor ?? "#3498db");
        //HANDLE RESET SUBCOMMAND
        if (subCommand === "reset") {
            //check admin permissions for reset
            const adminResult = await index_1.opendiscord.permissions.checkCommandPerms("admin", "admin", user, member, channel, guild);
            if (!adminResult.hasPerms) {
                await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build(source, { guild, channel, user, permissions: ["admin"] }));
                return cancel();
            }
            const reason = instance.options.getString("reason", false) ?? "No reason provided";
            //clear all leaderboard entries
            const allEntries = await leaderboardDb.getCategory("claims") ?? [];
            for (const entry of allEntries) {
                await leaderboardDb.delete(entry.key, "claims");
            }
            await instance.reply({
                id: new index_1.api.ODId("opendiscord:leaderboard-reset"),
                ephemeral: false,
                message: { embeds: [
                        new discord.EmbedBuilder()
                            .setColor(mainColor)
                            .setTitle("🔄 Leaderboard Reset")
                            .setDescription(`The leaderboard has been reset by ${user.globalName ?? user.username}`)
                            .addFields({ name: "Reason", value: reason })
                            .setTimestamp()
                    ] }
            });
            return;
        }
        //HANDLE VIEW SUBCOMMAND (default)
        const allEntries = await leaderboardDb.getCategory("claims") ?? [];
        if (allEntries.length === 0) {
            await instance.reply({
                id: new index_1.api.ODId("opendiscord:leaderboard-empty"),
                ephemeral: false,
                message: { embeds: [
                        new discord.EmbedBuilder()
                            .setColor(mainColor)
                            .setTitle("🏆 Staff Claim Leaderboard")
                            .setDescription("No claims recorded yet.")
                            .setTimestamp()
                    ] }
            });
            return;
        }
        //sort by claim count descending
        const sorted = allEntries
            .filter(e => typeof e.value === "number")
            .sort((a, b) => b.value - a.value)
            .slice(0, 15);
        //build leaderboard lines with username lookup
        const lines = [];
        const medals = ["🥇", "🥈", "🥉"];
        for (let i = 0; i < sorted.length; i++) {
            const entry = sorted[i];
            const userId = entry.key;
            const count = entry.value;
            const rank = medals[i] ?? `**#${i + 1}**`;
            //try to fetch display name from guild
            let displayName;
            try {
                const guildMember = await guild.members.fetch(userId);
                displayName = `${guildMember.displayName} (\`${userId}\`)`;
            }
            catch {
                displayName = `Unknown (\`${userId}\`)`;
            }
            lines.push(`${rank} ${displayName} — **${count}** claim${count !== 1 ? "s" : ""}`);
        }
        const embed = new discord.EmbedBuilder()
            .setColor(mainColor)
            .setTitle("🏆 Staff Claim Leaderboard")
            .setDescription(lines.join("\n"))
            .setFooter({ text: `Total staff tracked: ${allEntries.length}` })
            .setTimestamp();
        await instance.reply({
            id: new index_1.api.ODId("opendiscord:leaderboard-result"),
            ephemeral: false,
            message: { embeds: [embed] }
        });
    }));
    leaderboardResponder.workers.add(new index_1.api.ODWorker("opendiscord:logs", -1, (instance, params, source, cancel) => {
        const subCommand = instance.options.getSubCommand();
        index_1.opendiscord.log(instance.user.displayName + " used the 'leaderboard " + subCommand + "' command!", "info", [
            { key: "user", value: instance.user.username },
            { key: "userid", value: instance.user.id, hidden: true },
            { key: "method", value: source }
        ]);
    }));
};
exports.registerCommandResponders = registerCommandResponders;
