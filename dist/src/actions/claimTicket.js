"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerVerifyBars = exports.registerActions = void 0;
///////////////////////////////////////
//TICKET CLAIMING SYSTEM
///////////////////////////////////////
const index_1 = require("../index");
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const registerActions = async () => {
    index_1.opendiscord.actions.add(new index_1.api.ODAction("opendiscord:claim-ticket"));
    index_1.opendiscord.actions.get("opendiscord:claim-ticket").workers.add([
        new index_1.api.ODWorker("opendiscord:claim-ticket", 2, async (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, reason } = params;
            if (channel.isThread())
                throw new index_1.api.ODSystemError("Unable to claim ticket! Open Ticket doesn't support threads!");
            await index_1.opendiscord.events.get("onTicketClaim").emit([ticket, user, channel, reason]);
            //update ticket
            ticket.get("opendiscord:claimed").value = true;
            ticket.get("opendiscord:claimed-by").value = user.id;
            ticket.get("opendiscord:claimed-on").value = new Date().getTime();
            ticket.get("opendiscord:busy").value = true;
            //update stats
            await index_1.opendiscord.stats.get("opendiscord:global").setStat("opendiscord:tickets-claimed", 1, "increase");
            await index_1.opendiscord.stats.get("opendiscord:user").setStat("opendiscord:tickets-claimed", user.id, 1, "increase");
            //update leaderboard
            const leaderboardDb = index_1.opendiscord.databases.get("opendiscord:leaderboard");
            if (leaderboardDb) {
                const currentCount = await leaderboardDb.get("claims", user.id);
                const newCount = (typeof currentCount === "number" ? currentCount : 0) + 1;
                await leaderboardDb.set("claims", user.id, newCount);
            }
            //update category
            if (typeof params.allowCategoryChange == "boolean" ? params.allowCategoryChange : true) {
                const rawClaimCategory = ticket.option.get("opendiscord:channel-categories-claimed").value.find((c) => c.user == user.id);
                const claimCategory = (rawClaimCategory) ? rawClaimCategory.category : null;
                if (claimCategory) {
                    try {
                        channel.setParent(claimCategory, { lockPermissions: false });
                        ticket.get("opendiscord:category-mode").value = "claimed";
                        ticket.get("opendiscord:category").value = claimCategory;
                    }
                    catch (e) {
                        index_1.opendiscord.log("Unable to move ticket to 'claimed category'!", "error", [
                            { key: "channel", value: "#" + channel.name },
                            { key: "channelid", value: channel.id, hidden: true },
                            { key: "categoryid", value: claimCategory }
                        ]);
                        index_1.opendiscord.debugfile.writeErrorMessage(new index_1.api.ODError(e, "uncaughtException"));
                    }
                }
            }
            //update ticket message
            const ticketMessage = await index_1.opendiscord.tickets.getTicketMessage(ticket);
            if (ticketMessage) {
                try {
                    ticketMessage.edit((await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-message").build("other", { guild, channel, user, ticket })).message);
                }
                catch (e) {
                    index_1.opendiscord.log("Unable to edit ticket message on ticket claiming!", "error", [
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
                await channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:claim-message").build(source, { guild, channel, user, ticket, reason })).message);
            ticket.get("opendiscord:busy").value = false;
            await index_1.opendiscord.events.get("afterTicketClaimed").emit([ticket, user, channel, reason]);
            //update channel topic
            await index_1.opendiscord.actions.get("opendiscord:update-ticket-topic").run("ticket-action", { guild, channel, user, ticket, sendMessage: false, newTopic: null });
        }),
        new index_1.api.ODWorker("opendiscord:discord-logs", 1, async (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, reason } = params;
            //to logs
            if (generalConfig.data.system.logs.enabled && generalConfig.data.system.messages.claiming.logs) {
                const logChannel = index_1.opendiscord.posts.get("opendiscord:logs");
                if (logChannel)
                    logChannel.send(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-action-logs").build(source, { guild, channel, user, ticket, mode: "claim", reason, additionalData: null }));
            }
            //to dm
            const creator = await index_1.opendiscord.tickets.getTicketUser(ticket, "creator");
            if (creator && generalConfig.data.system.messages.claiming.dm)
                await index_1.opendiscord.client.sendUserDm(creator, await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-action-dm").build(source, { guild, channel, user, ticket, mode: "claim", reason, additionalData: null }));
        }),
        new index_1.api.ODWorker("opendiscord:logs", 0, (instance, params, source, cancel) => {
            const { guild, channel, user, ticket } = params;
            index_1.opendiscord.log(user.displayName + " claimed a ticket!", "info", [
                { key: "user", value: user.username },
                { key: "userid", value: user.id, hidden: true },
                { key: "channel", value: "#" + channel.name },
                { key: "channelid", value: channel.id, hidden: true },
                { key: "reason", value: params.reason ?? "/" },
                { key: "method", value: source }
            ]);
        })
    ]);
    index_1.opendiscord.actions.get("opendiscord:claim-ticket").workers.backupWorker = new index_1.api.ODWorker("opendiscord:cancel-busy", 0, (instance, params) => {
        //set busy to false in case of crash or cancel
        params.ticket.get("opendiscord:busy").value = false;
    });
};
exports.registerActions = registerActions;
/**Helper: check if a member has any of the comma-separated role IDs */
const checkMultiRolePermission = async (guild, member, permissionMode) => {
    const roleIds = permissionMode.split(",").map((r) => r.trim()).filter((r) => r.length > 0);
    for (const roleId of roleIds) {
        const role = await index_1.opendiscord.client.fetchGuildRole(guild, roleId);
        if (role && role.members.has(member.id))
            return true;
    }
    return false;
};
const registerVerifyBars = async () => {
    //CLAIM TICKET TICKET MESSAGE
    index_1.opendiscord.verifybars.add(new index_1.api.ODVerifyBar("opendiscord:claim-ticket-ticket-message", index_1.opendiscord.builders.messages.getSafe("opendiscord:verifybar-ticket-message"), !generalConfig.data.system.disableVerifyBars));
    index_1.opendiscord.verifybars.get("opendiscord:claim-ticket-ticket-message").success.add([
        new index_1.api.ODWorker("opendiscord:permissions", 1, async (instance, params, source, cancel) => {
            const permissionMode = generalConfig.data.system.permissions.claim;
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
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, permissions: ["support"] }));
                    return cancel();
                }
                else
                    return;
            }
            else {
                if (!instance.guild || !instance.member) {
                    //error
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, error: "Permission Error: Not in Server #1", layout: "advanced" }));
                    return cancel();
                }
                //support comma-separated role IDs
                const hasRole = await checkMultiRolePermission(instance.guild, instance.member, permissionMode);
                if (!hasRole) {
                    //no permissions
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, permissions: [] }));
                    return cancel();
                }
                else
                    return;
            }
        }),
        new index_1.api.ODWorker("opendiscord:claim-ticket", 0, async (instance, params, source, cancel) => {
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
            //start claiming ticket
            if (params.data == "reason") {
                //claim with reason
                instance.modal(await index_1.opendiscord.builders.modals.getSafe("opendiscord:claim-ticket-reason").build("ticket-message", { guild, channel, user, ticket }));
            }
            else {
                //claim without reason
                await instance.defer("update", false);
                await index_1.opendiscord.actions.get("opendiscord:claim-ticket").run("ticket-message", { guild, channel, user, ticket, reason: null, sendMessage: true });
                await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-message").build("other", { guild, channel, user, ticket }));
            }
        })
    ]);
    index_1.opendiscord.verifybars.get("opendiscord:claim-ticket-ticket-message").failure.add([
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
    //CLAIM TICKET UNCLAIM MESSAGE
    index_1.opendiscord.verifybars.add(new index_1.api.ODVerifyBar("opendiscord:claim-ticket-unclaim-message", index_1.opendiscord.builders.messages.getSafe("opendiscord:verifybar-unclaim-message"), !generalConfig.data.system.disableVerifyBars));
    index_1.opendiscord.verifybars.get("opendiscord:claim-ticket-unclaim-message").success.add([
        new index_1.api.ODWorker("opendiscord:permissions", 1, async (instance, params, source, cancel) => {
            const permissionMode = generalConfig.data.system.permissions.claim;
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
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, permissions: ["support"] }));
                    return cancel();
                }
                else
                    return;
            }
            else {
                if (!instance.guild || !instance.member) {
                    //error
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, error: "Permission Error: Not in Server #1", layout: "advanced" }));
                    return cancel();
                }
                //support comma-separated role IDs
                const hasRole = await checkMultiRolePermission(instance.guild, instance.member, permissionMode);
                if (!hasRole) {
                    //no permissions
                    instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build("button", { guild: instance.guild, channel: instance.channel, user: instance.user, permissions: [] }));
                    return cancel();
                }
                else
                    return;
            }
        }),
        new index_1.api.ODWorker("opendiscord:claim-ticket", 0, async (instance, params, source, cancel) => {
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
            //start claiming ticket
            if (params.data == "reason") {
                //claim with reason
                instance.modal(await index_1.opendiscord.builders.modals.getSafe("opendiscord:claim-ticket-reason").build("unclaim-message", { guild, channel, user, ticket }));
            }
            else {
                //claim without reason
                await instance.defer("update", false);
                await index_1.opendiscord.actions.get("opendiscord:claim-ticket").run("unclaim-message", { guild, channel, user, ticket, reason: null, sendMessage: false });
                await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:claim-message").build("unclaim-message", { guild, channel, user, ticket, reason: null }));
            }
        })
    ]);
    index_1.opendiscord.verifybars.get("opendiscord:claim-ticket-unclaim-message").failure.add([
        new index_1.api.ODWorker("opendiscord:back-to-unclaim-message", 0, async (instance, params, source, cancel) => {
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
            await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:unclaim-message").build("other", { guild, channel, user, ticket, reason }));
        })
    ]);
};
exports.registerVerifyBars = registerVerifyBars;
