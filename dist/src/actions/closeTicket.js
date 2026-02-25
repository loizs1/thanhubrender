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
exports.registerVerifyBars = exports.registerActions = void 0;
///////////////////////////////////////
//TICKET CLOSING SYSTEM
///////////////////////////////////////
const index_1 = require("../index");
const discord = __importStar(require("discord.js"));
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const lang = index_1.opendiscord.languages;
const registerActions = async () => {
    index_1.opendiscord.actions.add(new index_1.api.ODAction("opendiscord:close-ticket"));
    index_1.opendiscord.actions.get("opendiscord:close-ticket").workers.add([
        new index_1.api.ODWorker("opendiscord:close-ticket", 2, async (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, reason } = params;
            if (channel.isThread())
                throw new index_1.api.ODSystemError("Unable to close ticket! Open Ticket doesn't support threads!");
            await index_1.opendiscord.events.get("onTicketClose").emit([ticket, user, channel, reason]);
            //update ticket
            ticket.get("opendiscord:closed").value = true;
            ticket.get("opendiscord:closed-by").value = user.id;
            ticket.get("opendiscord:closed-on").value = new Date().getTime();
            //store close reason for transcript
            if (!ticket.exists("opendiscord:closed-reason"))
                ticket.add(new index_1.api.ODTicketData("opendiscord:closed-reason", reason ?? null));
            else
                ticket.get("opendiscord:closed-reason").value = reason ?? null;
            ticket.get("opendiscord:reopened").value = false;
            ticket.get("opendiscord:reopened-by").value = null;
            ticket.get("opendiscord:reopened-on").value = null;
            if (source == "autoclose")
                ticket.get("opendiscord:autoclosed").value = true;
            ticket.get("opendiscord:open").value = false;
            ticket.get("opendiscord:busy").value = true;
            //update stats
            await index_1.opendiscord.stats.get("opendiscord:global").setStat("opendiscord:tickets-closed", 1, "increase");
            await index_1.opendiscord.stats.get("opendiscord:user").setStat("opendiscord:tickets-closed", user.id, 1, "increase");
            //update category
            if (typeof params.allowCategoryChange == "boolean" ? params.allowCategoryChange : true) {
                const closeCategory = ticket.option.get("opendiscord:channel-category-closed").value;
                if (closeCategory !== "") {
                    try {
                        channel.setParent(closeCategory, { lockPermissions: false });
                        ticket.get("opendiscord:category-mode").value = "closed";
                        ticket.get("opendiscord:category").value = closeCategory;
                    }
                    catch (e) {
                        index_1.opendiscord.log("Unable to move ticket to 'closed category'!", "error", [
                            { key: "channel", value: "#" + channel.name },
                            { key: "channelid", value: channel.id, hidden: true },
                            { key: "categoryid", value: closeCategory }
                        ]);
                        index_1.opendiscord.debugfile.writeErrorMessage(new index_1.api.ODError(e, "uncaughtException"));
                    }
                }
            }
            //update permissions (non-staff => readonly)
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
            ticket.get("opendiscord:participants").value.forEach((participant) => {
                //all participants that aren't roles/admins => readonly (OR non-viewable when enabled)
                if (participant.type == "user") {
                    if (generalConfig.data.system.removeParticipantsOnClose)
                        permissions.push({
                            type: discord.OverwriteType.Member,
                            id: participant.id,
                            allow: [],
                            deny: ["SendMessages", "AddReactions", "AttachFiles", "SendPolls", "ViewChannel", "ReadMessageHistory"]
                        });
                    else
                        permissions.push({
                            type: discord.OverwriteType.Member,
                            id: participant.id,
                            allow: ["ViewChannel", "ReadMessageHistory"],
                            deny: ["SendMessages", "AddReactions", "AttachFiles", "SendPolls"]
                        });
                }
            });
            channel.permissionOverwrites.set(permissions);
            //rename channel to close-{username}
            const creatorId = ticket.get("opendiscord:opened-by").value;
            if (creatorId) {
                try {
                    const creatorMember = await guild.members.fetch(creatorId).catch(() => null);
                    const creatorName = creatorMember ? creatorMember.user.username : creatorId;
                    await channel.setName("close-" + creatorName);
                }
                catch (e) {
                    index_1.opendiscord.log("Unable to rename ticket channel on close!", "error", [
                        { key: "channel", value: "#" + channel.name },
                        { key: "channelid", value: channel.id, hidden: true }
                    ]);
                    index_1.opendiscord.debugfile.writeErrorMessage(new index_1.api.ODError(e, "uncaughtException"));
                }
            }
            //update ticket message
            const ticketMessage = await index_1.opendiscord.tickets.getTicketMessage(ticket);
            if (ticketMessage) {
                try {
                    ticketMessage.edit((await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-message").build("other", { guild, channel, user, ticket })).message);
                }
                catch (e) {
                    index_1.opendiscord.log("Unable to edit ticket message on ticket closing!", "error", [
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
                await channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:close-message").build(source, { guild, channel, user, ticket, reason })).message);
            ticket.get("opendiscord:busy").value = false;
            await index_1.opendiscord.events.get("afterTicketClosed").emit([ticket, user, channel, reason]);
            //update channel topic
            await index_1.opendiscord.actions.get("opendiscord:update-ticket-topic").run("ticket-action", { guild, channel, user, ticket, sendMessage: false, newTopic: null });
        }),
        new index_1.api.ODWorker("opendiscord:discord-logs", 1, async (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, reason } = params;
            //to logs
            if (generalConfig.data.system.logs.enabled && generalConfig.data.system.messages.closing.logs) {
                const logChannel = index_1.opendiscord.posts.get("opendiscord:logs");
                if (logChannel)
                    logChannel.send(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-action-logs").build(source, { guild, channel, user, ticket, mode: "close", reason, additionalData: null }));
            }
            //to dm
            const creator = await index_1.opendiscord.tickets.getTicketUser(ticket, "creator");
            if (creator && generalConfig.data.system.messages.closing.dm)
                await index_1.opendiscord.client.sendUserDm(creator, await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-action-dm").build(source, { guild, channel, user, ticket, mode: "close", reason, additionalData: null }));
        }),
        new index_1.api.ODWorker("opendiscord:logs", 0, (instance, params, source, cancel) => {
            const { guild, channel, user, ticket } = params;
            index_1.opendiscord.log(user.displayName + " closed a ticket!", "info", [
                { key: "user", value: user.username },
                { key: "userid", value: user.id, hidden: true },
                { key: "channel", value: "#" + channel.name },
                { key: "channelid", value: channel.id, hidden: true },
                { key: "reason", value: params.reason ?? "/" },
                { key: "method", value: source }
            ]);
        })
    ]);
    index_1.opendiscord.actions.get("opendiscord:close-ticket").workers.backupWorker = new index_1.api.ODWorker("opendiscord:cancel-busy", 0, (instance, params) => {
        //set busy to false in case of crash or cancel
        params.ticket.get("opendiscord:busy").value = false;
    });
};
exports.registerActions = registerActions;
const registerVerifyBars = async () => {
    //CLOSE TICKET TICKET MESSAGE
    index_1.opendiscord.verifybars.add(new index_1.api.ODVerifyBar("opendiscord:close-ticket-ticket-message", index_1.opendiscord.builders.messages.getSafe("opendiscord:verifybar-ticket-message"), !generalConfig.data.system.disableVerifyBars));
    index_1.opendiscord.verifybars.get("opendiscord:close-ticket-ticket-message").success.add([
        new index_1.api.ODWorker("opendiscord:close-ticket", 0, async (instance, params, source, cancel) => {
            const { user, member, channel, guild } = instance;
            //check permissions
            const permsResult = await index_1.opendiscord.permissions.checkCommandPerms(generalConfig.data.system.permissions.close, "support", user, member, channel, guild);
            if (!permsResult.hasPerms) {
                if (permsResult.reason == "not-in-server")
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                else
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild, channel, user, permissions: ["support"] }));
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
            //return when already closed
            if (ticket.get("opendiscord:closed").value) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild, channel, user, error: lang.getTranslation("errors.actionInvalid.close"), layout: "simple" }));
                return cancel();
            }
            //return when busy
            if (ticket.get("opendiscord:busy").value) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-busy").build("button", { guild, channel, user }));
                return cancel();
            }
            //return when not allowed because of missing messages
            if (!permsResult.isAdmin && (!generalConfig.data.system.allowCloseBeforeMessage || !generalConfig.data.system.allowCloseBeforeAdminMessage)) {
                const analysis = await index_1.opendiscord.transcripts.collector.ticketUserMessagesAnalysis(ticket, guild, channel);
                if (analysis && !generalConfig.data.system.allowCloseBeforeMessage && analysis.totalMessages < 1) {
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild, channel, user, layout: "simple", error: lang.getTranslation("errors.descriptions.closeBeforeMessage"), customTitle: lang.getTranslation("errors.titles.noPermissions") }));
                    return cancel();
                }
                if (analysis && !generalConfig.data.system.allowCloseBeforeAdminMessage && analysis.adminMessages < 1) {
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild, channel, user, layout: "simple", error: lang.getTranslation("errors.descriptions.closeBeforeAdminMessage"), customTitle: lang.getTranslation("errors.titles.noPermissions") }));
                    return cancel();
                }
            }
            //start closing ticket — reason is always mandatory
            instance.modal(await index_1.opendiscord.builders.modals.getSafe("opendiscord:close-ticket-reason").build("ticket-message", { guild, channel, user, ticket }));
        })
    ]);
    index_1.opendiscord.verifybars.get("opendiscord:close-ticket-ticket-message").failure.add([
        new index_1.api.ODWorker("opendiscord:back-to-ticket-message", 0, async (instance, params, source, cancel) => {
            const { guild, channel, user } = instance;
            if (!guild) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                return cancel();
            }
            const ticket = index_1.opendiscord.tickets.get(channel.id);
            if (!ticket || channel.isDMBased()) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-unknown").build("button", { guild, channel, user }));
                return cancel();
            }
            await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-message").build("other", { guild, channel, user, ticket }));
        })
    ]);
    //CLOSE TICKET REOPEN MESSAGE
    index_1.opendiscord.verifybars.add(new index_1.api.ODVerifyBar("opendiscord:close-ticket-reopen-message", index_1.opendiscord.builders.messages.getSafe("opendiscord:verifybar-reopen-message"), !generalConfig.data.system.disableVerifyBars));
    index_1.opendiscord.verifybars.get("opendiscord:close-ticket-reopen-message").success.add([
        new index_1.api.ODWorker("opendiscord:close-ticket", 0, async (instance, params, source, cancel) => {
            const { user, member, channel, guild } = instance;
            //check permissions
            const permsResult = await index_1.opendiscord.permissions.checkCommandPerms(generalConfig.data.system.permissions.close, "support", user, member, channel, guild);
            if (!permsResult.hasPerms) {
                if (permsResult.reason == "not-in-server")
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                else
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild, channel, user, permissions: ["support"] }));
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
            //return when already closed
            if (ticket.get("opendiscord:closed").value) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild, channel, user, error: lang.getTranslation("errors.actionInvalid.close"), layout: "simple" }));
                return cancel();
            }
            //return when busy
            if (ticket.get("opendiscord:busy").value) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-busy").build("button", { guild, channel, user }));
                return cancel();
            }
            //return when not allowed because of missing messages
            if (!permsResult.isAdmin && (!generalConfig.data.system.allowCloseBeforeMessage || !generalConfig.data.system.allowCloseBeforeAdminMessage)) {
                const analysis = await index_1.opendiscord.transcripts.collector.ticketUserMessagesAnalysis(ticket, guild, channel);
                if (analysis && !generalConfig.data.system.allowCloseBeforeMessage && analysis.totalMessages < 1) {
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild, channel, user, layout: "simple", error: lang.getTranslation("errors.descriptions.closeBeforeMessage"), customTitle: lang.getTranslation("errors.titles.noPermissions") }));
                    return cancel();
                }
                if (analysis && !generalConfig.data.system.allowCloseBeforeAdminMessage && analysis.adminMessages < 1) {
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild, channel, user, layout: "simple", error: lang.getTranslation("errors.descriptions.closeBeforeAdminMessage"), customTitle: lang.getTranslation("errors.titles.noPermissions") }));
                    return cancel();
                }
            }
            //start closing ticket — reason is always mandatory
            instance.modal(await index_1.opendiscord.builders.modals.getSafe("opendiscord:close-ticket-reason").build("reopen-message", { guild, channel, user, ticket }));
        })
    ]);
    index_1.opendiscord.verifybars.get("opendiscord:close-ticket-reopen-message").failure.add([
        new index_1.api.ODWorker("opendiscord:back-to-reopen-message", 0, async (instance, params, source, cancel) => {
            const { guild, channel, user } = instance;
            const { verifybarMessage } = params;
            if (!guild) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                return cancel();
            }
            const ticket = index_1.opendiscord.tickets.get(channel.id);
            if (!ticket || channel.isDMBased()) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-ticket-unknown").build("button", { guild, channel, user }));
                return cancel();
            }
            const rawReason = (verifybarMessage && verifybarMessage.embeds[0] && verifybarMessage.embeds[0].fields[0]) ? verifybarMessage.embeds[0].fields[0].value : null;
            const reason = (rawReason == null) ? null : rawReason.substring(3, rawReason.length - 3);
            await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:reopen-message").build("other", { guild, channel, user, ticket, reason }));
        })
    ]);
};
exports.registerVerifyBars = registerVerifyBars;
