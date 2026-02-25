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
//TICKET MOVING SYSTEM
///////////////////////////////////////
const index_1 = require("../index");
const discord = __importStar(require("discord.js"));
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const registerActions = async () => {
    index_1.opendiscord.actions.add(new index_1.api.ODAction("opendiscord:move-ticket"));
    index_1.opendiscord.actions.get("opendiscord:move-ticket").workers.add([
        new index_1.api.ODWorker("opendiscord:move-ticket", 2, async (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, reason, data } = params;
            if (channel.isThread())
                throw new index_1.api.ODSystemError("Unable to move ticket! Open Ticket doesn't support threads!");
            await index_1.opendiscord.events.get("onTicketMove").emit([ticket, user, channel, reason]);
            ticket.option = data;
            //update stats
            await index_1.opendiscord.stats.get("opendiscord:global").setStat("opendiscord:tickets-moved", 1, "increase");
            await index_1.opendiscord.stats.get("opendiscord:user").setStat("opendiscord:tickets-moved", user.id, 1, "increase");
            //get new channel properties
            const channelPrefix = ticket.option.get("opendiscord:channel-prefix").value;
            const channelSuffix = ticket.get("opendiscord:channel-suffix").value;
            const channelCategory = ticket.option.get("opendiscord:channel-category").value;
            const channelBackupCategory = ticket.option.get("opendiscord:channel-category-backup").value;
            const rawClaimCategory = ticket.option.get("opendiscord:channel-categories-claimed").value.find((c) => c.user == user.id);
            const claimCategory = (rawClaimCategory) ? rawClaimCategory.category : null;
            const closeCategory = ticket.option.get("opendiscord:channel-category-closed").value;
            const channelTopic = ticket.option.get("opendiscord:channel-topic").value;
            //handle category
            let category = null;
            let categoryMode = null;
            if (claimCategory) {
                //use claim category
                category = claimCategory;
                categoryMode = "claimed";
            }
            else if (closeCategory != "" && ticket.get("opendiscord:closed").value) {
                //use close category
                category = closeCategory;
                categoryMode = "closed";
            }
            else if (channelCategory != "") {
                //category enabled
                const normalCategory = await index_1.opendiscord.client.fetchGuildCategoryChannel(guild, channelCategory);
                if (!normalCategory) {
                    //default category was not found
                    index_1.opendiscord.log("Ticket Move Error: Unable to find category! #1", "error", [
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
                            index_1.opendiscord.log("Ticket Move Error: Unable to find category! #2", "error", [
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
            try {
                //only move category when not the same.
                if (channel.parentId != category)
                    await index_1.utilities.timedAwait(channel.setParent(category, { lockPermissions: false }), 2500, (err) => {
                        index_1.opendiscord.log("Failed to change channel category on ticket move", "error");
                    });
                ticket.get("opendiscord:category-mode").value = categoryMode;
                ticket.get("opendiscord:category").value = category;
            }
            catch (e) {
                index_1.opendiscord.log("Unable to move ticket to 'moved category'!", "error", [
                    { key: "channel", value: "#" + channel.name },
                    { key: "channelid", value: channel.id, hidden: true },
                    { key: "categoryid", value: category ?? "/" }
                ]);
                index_1.opendiscord.debugfile.writeErrorMessage(new index_1.api.ODError(e, "uncaughtException"));
            }
            //handle permissions
            const permissions = [{
                    type: discord.OverwriteType.Role,
                    id: guild.roles.everyone.id,
                    allow: [],
                    deny: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
                }];
            const globalAdmins = index_1.opendiscord.configs.get("opendiscord:general").data.globalAdmins;
            const optionAdmins = ticket.option.get("opendiscord:admins").value;
            const readonlyAdmins = ticket.option.get("opendiscord:admins-readonly").value;
            globalAdmins.forEach((admin) => {
                permissions.push({
                    type: discord.OverwriteType.Role,
                    id: admin,
                    allow: ["ViewChannel", "SendMessages", "AddReactions", "AttachFiles", "SendPolls", "ReadMessageHistory", "ManageMessages"],
                    deny: []
                });
            });
            optionAdmins.forEach((admin) => {
                if (globalAdmins.includes(admin))
                    return;
                permissions.push({
                    type: discord.OverwriteType.Role,
                    id: admin,
                    allow: ["ViewChannel", "SendMessages", "AddReactions", "AttachFiles", "SendPolls", "ReadMessageHistory", "ManageMessages"],
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
                    deny: ["SendMessages", "AddReactions", "AttachFiles", "SendPolls"]
                });
            });
            //transfer all old user-participants over to the new ticket (creator & participants)
            ticket.get("opendiscord:participants").value.forEach((p) => {
                if (p.type == "user")
                    permissions.push({
                        type: discord.OverwriteType.Member,
                        id: p.id,
                        allow: ["ViewChannel", "SendMessages", "AddReactions", "AttachFiles", "SendPolls", "ReadMessageHistory"],
                        deny: []
                    });
            });
            try {
                await channel.permissionOverwrites.set(permissions);
            }
            catch {
                index_1.opendiscord.log("Failed to reset channel permissions on ticket move!", "error");
            }
            //handle participants
            const participants = [];
            permissions.forEach((permission, index) => {
                if (index == 0)
                    return; //don't include @everyone
                const type = (permission.type == discord.OverwriteType.Role) ? "role" : "user";
                const id = permission.id;
                participants.push({ type, id });
            });
            ticket.get("opendiscord:participants").value = participants;
            ticket.get("opendiscord:participants").refreshDatabase();
            //rename channel (and give error when crashed)
            const pinEmoji = ticket.get("opendiscord:pinned").value ? generalConfig.data.system.pinEmoji : "";
            const priorityEmoji = index_1.opendiscord.priorities.getFromPriorityLevel(ticket.get("opendiscord:priority").value).channelEmoji ?? "";
            const originalName = channel.name;
            const newName = pinEmoji + priorityEmoji + index_1.utilities.trimEmojis(channelPrefix + channelSuffix);
            try {
                await index_1.utilities.timedAwait(channel.setName(newName), 2500, (err) => {
                    index_1.opendiscord.log("Failed to rename channel on ticket move", "error");
                });
            }
            catch (err) {
                await channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-channel-rename").build("ticket-move", { guild, channel, user, originalName, newName: newName })).message);
            }
            //update ticket message
            const ticketMessage = await index_1.opendiscord.tickets.getTicketMessage(ticket);
            if (ticketMessage) {
                try {
                    ticketMessage.edit((await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-message").build("other", { guild, channel, user, ticket })).message);
                }
                catch (e) {
                    index_1.opendiscord.log("Unable to edit ticket message on ticket moving!", "error", [
                        { key: "channel", value: "#" + channel.name },
                        { key: "channelid", value: channel.id, hidden: true },
                        { key: "messageid", value: ticketMessage.id },
                        { key: "option", value: ticket.option.id.value }
                    ]);
                    index_1.opendiscord.debugfile.writeErrorMessage(new index_1.api.ODError(e, "uncaughtException"));
                }
            }
            //reply with new message
            if (params.sendMessage)
                await channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:move-message").build(source, { guild, channel, user, ticket, reason, data })).message);
            ticket.get("opendiscord:busy").value = false;
            await index_1.opendiscord.events.get("afterTicketMoved").emit([ticket, user, channel, reason]);
            //update channel topic
            await index_1.opendiscord.actions.get("opendiscord:update-ticket-topic").run("ticket-action", { guild, channel, user, ticket, sendMessage: false, newTopic: null });
        }),
        new index_1.api.ODWorker("opendiscord:discord-logs", 1, async (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, reason, data } = params;
            //to logs
            if (generalConfig.data.system.logs.enabled && generalConfig.data.system.messages.moving.logs) {
                const logChannel = index_1.opendiscord.posts.get("opendiscord:logs");
                if (logChannel)
                    logChannel.send(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-action-logs").build(source, { guild, channel, user, ticket, mode: "move", reason, additionalData: data }));
            }
            //to dm
            const creator = await index_1.opendiscord.tickets.getTicketUser(ticket, "creator");
            if (creator && generalConfig.data.system.messages.moving.dm)
                await index_1.opendiscord.client.sendUserDm(creator, await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-action-dm").build(source, { guild, channel, user, ticket, mode: "move", reason, additionalData: data }));
        }),
        new index_1.api.ODWorker("opendiscord:logs", 0, (instance, params, source, cancel) => {
            const { guild, channel, user, ticket } = params;
            index_1.opendiscord.log(user.displayName + " moved a ticket!", "info", [
                { key: "user", value: user.username },
                { key: "userid", value: user.id, hidden: true },
                { key: "channel", value: "#" + channel.name },
                { key: "channelid", value: channel.id, hidden: true },
                { key: "reason", value: params.reason ?? "/" },
                { key: "method", value: source }
            ]);
        })
    ]);
    index_1.opendiscord.actions.get("opendiscord:move-ticket").workers.backupWorker = new index_1.api.ODWorker("opendiscord:cancel-busy", 0, (instance, params) => {
        //set busy to false in case of crash or cancel
        params.ticket.get("opendiscord:busy").value = false;
    });
};
exports.registerActions = registerActions;
