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
exports.registerActions = void 0;
///////////////////////////////////////
//TICKET CREATION SYSTEM
///////////////////////////////////////
const index_1 = require("../index");
const discord = __importStar(require("discord.js"));
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const lang = index_1.opendiscord.languages;
const registerActions = async () => {
    index_1.opendiscord.actions.add(new index_1.api.ODAction("opendiscord:create-ticket"));
    index_1.opendiscord.actions.get("opendiscord:create-ticket").workers.add([
        new index_1.api.ODWorker("opendiscord:create-ticket", 3, async (instance, params, source, cancel) => {
            const { guild, user, answers, option } = params;
            await index_1.opendiscord.events.get("onTicketCreate").emit([user]);
            await index_1.opendiscord.events.get("onTicketChannelCreation").emit([option, user]);
            //get channel properties
            const channelPrefix = option.get("opendiscord:channel-prefix").value;
            const channelCategory = option.get("opendiscord:channel-category").value;
            const channelBackupCategory = option.get("opendiscord:channel-category-backup").value;
            const channelTopicText = option.get("opendiscord:channel-topic").value;
            const channelSuffix = await index_1.opendiscord.options.suffix.getSuffixFromOption(option, user, guild);
            const channelName = channelPrefix + channelSuffix;
            //handle category
            let category = null;
            let categoryMode = null;
            if (channelCategory != "") {
                //category enabled
                const normalCategory = await index_1.opendiscord.client.fetchGuildCategoryChannel(guild, channelCategory);
                if (!normalCategory) {
                    //default category was not found
                    index_1.opendiscord.log("Ticket Creation Error: Unable to find category! #1", "error", [
                        { key: "categoryid", value: channelCategory },
                        { key: "backup", value: "false" }
                    ]);
                }
                else {
                    //default category was found
                    if (normalCategory.children.cache.size >= 50 && channelBackupCategory != "") {
                        //use backup category
                        const backupCategory = await index_1.opendiscord.client.fetchGuildCategoryChannel(guild, channelBackupCategory);
                        if (!backupCategory) {
                            //default category was not found
                            index_1.opendiscord.log("Ticket Creation Error: Unable to find category! #2", "error", [
                                { key: "categoryid", value: channelBackupCategory },
                                { key: "backup", value: "true" }
                            ]);
                        }
                        else {
                            category = backupCategory.id;
                            categoryMode = "backup";
                        }
                    }
                    else {
                        //use default category
                        category = normalCategory.id;
                        categoryMode = "normal";
                    }
                }
            }
            //handle permissions
            const permissions = [{
                    type: discord.OverwriteType.Role,
                    id: guild.roles.everyone.id,
                    allow: [],
                    deny: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
                }];
            const globalAdmins = index_1.opendiscord.configs.get("opendiscord:general").data.globalAdmins;
            const optionAdmins = option.get("opendiscord:admins").value;
            const readonlyAdmins = option.get("opendiscord:admins-readonly").value;
            globalAdmins.forEach((admin) => {
                permissions.push({
                    type: discord.OverwriteType.Role,
                    id: admin,
                    allow: ["ViewChannel", "SendMessages", "AddReactions", "AttachFiles", "SendPolls", "ReadMessageHistory", "ManageMessages", "PinMessages", "EmbedLinks"],
                    deny: []
                });
            });
            optionAdmins.forEach((admin) => {
                if (globalAdmins.includes(admin))
                    return;
                permissions.push({
                    type: discord.OverwriteType.Role,
                    id: admin,
                    allow: ["ViewChannel", "SendMessages", "AddReactions", "AttachFiles", "SendPolls", "ReadMessageHistory", "ManageMessages", "PinMessages", "EmbedLinks"],
                    deny: []
                });
            });
            readonlyAdmins.forEach((admin) => {
                if (globalAdmins.includes(admin))
                    return;
                if (optionAdmins.includes(admin))
                    return;
                permissions.push({
                    type: discord.OverwriteType.Role,
                    id: admin,
                    allow: ["ViewChannel", "ReadMessageHistory"],
                    deny: ["SendMessages", "AddReactions", "AttachFiles", "SendPolls", "PinMessages"]
                });
            });
            permissions.push({
                type: discord.OverwriteType.Member,
                id: user.id,
                allow: ["ViewChannel", "SendMessages", "AddReactions", "AttachFiles", "SendPolls", "ReadMessageHistory", "EmbedLinks", "PinMessages"],
                deny: []
            });
            //create participants
            const participants = [];
            permissions.forEach((permission, index) => {
                if (index == 0)
                    return; //don't include @everyone
                const type = (permission.type == discord.OverwriteType.Role) ? "role" : "user";
                const id = permission.id;
                participants.push({ type, id });
            });
            //manage slowmode
            const slowMode = option.get("opendiscord:slowmode-enabled").value ? option.get("opendiscord:slowmode-seconds").value : undefined;
            //handle channel topic
            const channelTopics = [];
            if (generalConfig.data.system.channelTopic.showOptionName)
                channelTopics.push(option.get("opendiscord:name").value);
            if (generalConfig.data.system.channelTopic.showOptionDescription)
                channelTopics.push(option.get("opendiscord:description").value);
            if (generalConfig.data.system.channelTopic.showOptionTopic)
                channelTopics.push(channelTopicText);
            if (generalConfig.data.system.channelTopic.showPriority)
                channelTopics.push("**" + lang.getTranslation("params.uppercase.priority") + ":** " + index_1.opendiscord.priorities.get("opendiscord:none").renderDisplayName());
            if (generalConfig.data.system.channelTopic.showClosed)
                channelTopics.push("**" + lang.getTranslation("params.uppercase.status") + ":** " + lang.getTranslation("params.uppercase.open"));
            if (generalConfig.data.system.channelTopic.showClaimed)
                channelTopics.push("**" + lang.getTranslation("stats.properties.claimedBy") + ":** " + lang.getTranslation("params.uppercase.noone"));
            if (generalConfig.data.system.channelTopic.showPinned)
                channelTopics.push("**" + lang.getTranslation("params.uppercase.pinned") + ":** " + lang.getTranslation("params.uppercase.no"));
            if (generalConfig.data.system.channelTopic.showCreator)
                channelTopics.push("**" + lang.getTranslation("params.uppercase.creator") + ":** " + discord.userMention(user.id));
            if (generalConfig.data.system.channelTopic.showParticipants)
                channelTopics.push("**" + lang.getTranslation("params.uppercase.participants") + ":** " + participants.map((p) => (p.type == "user") ? discord.userMention(p.id) : discord.roleMention(p.id)).join(", "));
            //create channel
            const channel = await guild.channels.create({
                type: discord.ChannelType.GuildText,
                name: channelName,
                nsfw: false,
                topic: (channelTopics.length > 0) ? channelTopics.join(" • ") : undefined,
                parent: category,
                reason: "Ticket Created By " + user.displayName,
                permissionOverwrites: permissions,
                rateLimitPerUser: slowMode
            });
            await index_1.opendiscord.events.get("afterTicketChannelCreated").emit([option, channel, user]);
            //create ticket
            const ticket = new index_1.api.ODTicket(channel.id, option, [
                new index_1.api.ODTicketData("opendiscord:busy", false),
                new index_1.api.ODTicketData("opendiscord:ticket-message", null),
                new index_1.api.ODTicketData("opendiscord:participants", participants),
                new index_1.api.ODTicketData("opendiscord:channel-suffix", channelSuffix),
                new index_1.api.ODTicketData("opendiscord:previous-creators", []),
                new index_1.api.ODTicketData("opendiscord:open", true),
                new index_1.api.ODTicketData("opendiscord:opened-by", user.id),
                new index_1.api.ODTicketData("opendiscord:opened-on", new Date().getTime()),
                new index_1.api.ODTicketData("opendiscord:closed", false),
                new index_1.api.ODTicketData("opendiscord:closed-by", null),
                new index_1.api.ODTicketData("opendiscord:closed-on", null),
                new index_1.api.ODTicketData("opendiscord:reopened", false),
                new index_1.api.ODTicketData("opendiscord:reopened-by", null),
                new index_1.api.ODTicketData("opendiscord:reopened-on", null),
                new index_1.api.ODTicketData("opendiscord:claimed", false),
                new index_1.api.ODTicketData("opendiscord:claimed-by", null),
                new index_1.api.ODTicketData("opendiscord:claimed-on", null),
                new index_1.api.ODTicketData("opendiscord:pinned", false),
                new index_1.api.ODTicketData("opendiscord:pinned-by", null),
                new index_1.api.ODTicketData("opendiscord:pinned-on", null),
                new index_1.api.ODTicketData("opendiscord:for-deletion", false),
                new index_1.api.ODTicketData("opendiscord:category", category),
                new index_1.api.ODTicketData("opendiscord:category-mode", categoryMode),
                new index_1.api.ODTicketData("opendiscord:autoclose-enabled", option.get("opendiscord:autoclose-enable-hours").value),
                new index_1.api.ODTicketData("opendiscord:autoclose-hours", (option.get("opendiscord:autoclose-enable-hours").value ? option.get("opendiscord:autoclose-hours").value : 0)),
                new index_1.api.ODTicketData("opendiscord:autoclosed", false),
                new index_1.api.ODTicketData("opendiscord:autodelete-enabled", option.get("opendiscord:autodelete-enable-days").value),
                new index_1.api.ODTicketData("opendiscord:autodelete-days", (option.get("opendiscord:autodelete-enable-days").value ? option.get("opendiscord:autodelete-days").value : 0)),
                new index_1.api.ODTicketData("opendiscord:answers", answers),
                new index_1.api.ODTicketData("opendiscord:priority", -1),
                new index_1.api.ODTicketData("opendiscord:topic", option.get("opendiscord:channel-topic").value),
                new index_1.api.ODTicketData("opendiscord:message-sent", false),
                new index_1.api.ODTicketData("opendiscord:admin-message-sent", false),
            ]);
            //manage stats
            await index_1.opendiscord.stats.get("opendiscord:global").setStat("opendiscord:tickets-created", 1, "increase");
            await index_1.opendiscord.stats.get("opendiscord:user").setStat("opendiscord:tickets-created", user.id, 1, "increase");
            //manage bot permissions
            await index_1.opendiscord.events.get("onTicketPermissionsCreated").emit([option, index_1.opendiscord.permissions, channel, user]);
            await (await import("../data/framework/permissionLoader.js")).addTicketPermissions(ticket);
            await index_1.opendiscord.events.get("afterTicketPermissionsCreated").emit([option, index_1.opendiscord.permissions, channel, user]);
            //export channel & ticket
            instance.channel = channel;
            instance.ticket = ticket;
            index_1.opendiscord.tickets.add(ticket);
        }),
        new index_1.api.ODWorker("opendiscord:send-ticket-message", 2, async (instance, params, source, cancel) => {
            const { guild, user, answers, option } = params;
            const { ticket, channel } = instance;
            if (!ticket || !channel)
                return index_1.opendiscord.log("Ticket Creation Error: Unable to send ticket message. Previous worker failed!", "error");
            await index_1.opendiscord.events.get("onTicketMainMessageCreated").emit([ticket, channel, user]);
            //check if ticket message is enabled
            if (!option.get("opendiscord:ticket-message-enabled").value)
                return;
            try {
                const msg = await channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-message").build(source, { guild, channel, user, ticket })).message);
                ticket.get("opendiscord:ticket-message").value = msg.id;
                //pin ticket message (if required)
                if (generalConfig.data.system.pinFirstTicketMessage && msg.pinnable)
                    await msg.pin("Ticket Message");
                //manage stats
                await index_1.opendiscord.stats.get("opendiscord:ticket").setStat("opendiscord:messages-sent", ticket.id.value, 1, "increase");
                await index_1.opendiscord.events.get("afterTicketMainMessageCreated").emit([ticket, msg, channel, user]);
            }
            catch (err) {
                process.emit("uncaughtException", err);
                //something went wrong while sending the ticket message
                channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("other", { guild, channel, user, error: "Ticket Message: Creation Error!\n=> Ticket Is Still Created Succesfully", layout: "advanced" })).message);
            }
            await index_1.opendiscord.events.get("afterTicketCreated").emit([ticket, user, channel]);
        }),
        new index_1.api.ODWorker("opendiscord:discord-logs", 1, async (instance, params, source, cancel) => {
            const { guild, user, answers, option } = params;
            const { ticket, channel } = instance;
            //to logs
            if (generalConfig.data.system.logs.enabled && generalConfig.data.system.messages.creation.logs) {
                const logChannel = index_1.opendiscord.posts.get("opendiscord:logs");
                if (logChannel)
                    logChannel.send(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-created-logs").build(source, { guild, channel, user, ticket }));
            }
            //to dm
            if (generalConfig.data.system.messages.creation.dm)
                await index_1.opendiscord.client.sendUserDm(user, await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-created-dm").build(source, { guild, channel, user, ticket }));
        }),
        new index_1.api.ODWorker("opendiscord:logs", 0, (instance, params, source, cancel) => {
            const { guild, user, answers, option } = params;
            const { ticket, channel } = instance;
            if (!ticket || !channel)
                return index_1.opendiscord.log("Ticket Creation Error: Unable to create logs. Previous worker failed!", "error");
            index_1.opendiscord.log(user.displayName + " created a ticket!", "info", [
                { key: "user", value: user.username },
                { key: "userid", value: user.id, hidden: true },
                { key: "channel", value: "#" + channel.name },
                { key: "channelid", value: channel.id, hidden: true },
                { key: "method", value: source },
                { key: "option", value: option.id.value }
            ]);
        })
    ]);
};
exports.registerActions = registerActions;
