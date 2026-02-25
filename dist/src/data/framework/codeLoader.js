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
exports.loadDatabaseSaversCode = exports.loadPanelAutoUpdateCode = exports.loadDatabaseCleanersCode = exports.loadStartListeningInteractionsCode = exports.loadCommandErrorHandlingCode = exports.loadAllCode = void 0;
const index_1 = require("../../index");
const discord = __importStar(require("discord.js"));
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const globalDatabase = index_1.opendiscord.databases.get("opendiscord:global");
const userDatabase = index_1.opendiscord.databases.get("opendiscord:users");
const ticketDatabase = index_1.opendiscord.databases.get("opendiscord:tickets");
const statsDatabase = index_1.opendiscord.databases.get("opendiscord:stats");
const optionDatabase = index_1.opendiscord.databases.get("opendiscord:options");
const mainServer = index_1.opendiscord.client.mainServer;
const loadAllCode = async () => {
    if (!generalConfig || !mainServer || !globalDatabase || !userDatabase || !ticketDatabase || !statsDatabase || !optionDatabase)
        return;
    (0, exports.loadCommandErrorHandlingCode)();
    (0, exports.loadStartListeningInteractionsCode)();
    (0, exports.loadDatabaseCleanersCode)();
    (0, exports.loadPanelAutoUpdateCode)();
    (0, exports.loadDatabaseSaversCode)();
    loadAutoCode();
};
exports.loadAllCode = loadAllCode;
const loadCommandErrorHandlingCode = async () => {
    //COMMAND ERROR HANDLING
    index_1.opendiscord.code.add(new index_1.api.ODCode("opendiscord:command-error-handling", 14, () => {
        //invalid/missing options
        index_1.opendiscord.client.textCommands.onError(async (error) => {
            if (error.msg.channel.type == discord.ChannelType.GroupDM)
                return;
            if (error.type == "invalid_option") {
                error.msg.channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-option-invalid").build("text", { guild: error.msg.guild, channel: error.msg.channel, user: error.msg.author, error })).message);
            }
            else if (error.type == "missing_option") {
                error.msg.channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-option-missing").build("text", { guild: error.msg.guild, channel: error.msg.channel, user: error.msg.author, error })).message);
            }
            else if (error.type == "unknown_command" && generalConfig.data.system.sendErrorOnUnknownCommand) {
                error.msg.channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-unknown-command").build("text", { guild: error.msg.guild, channel: error.msg.channel, user: error.msg.author, error })).message);
            }
        });
        //responder timeout
        index_1.opendiscord.responders.commands.setTimeoutErrorCallback(async (instance, source) => {
            instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-responder-timeout").build(source, { guild: instance.guild, channel: instance.channel, user: instance.user }));
        }, null);
        index_1.opendiscord.responders.buttons.setTimeoutErrorCallback(async (instance, source) => {
            instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-responder-timeout").build(source, { guild: instance.guild, channel: instance.channel, user: instance.user }));
        }, null);
        index_1.opendiscord.responders.dropdowns.setTimeoutErrorCallback(async (instance, source) => {
            instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-responder-timeout").build(source, { guild: instance.guild, channel: instance.channel, user: instance.user }));
        }, null);
        index_1.opendiscord.responders.modals.setTimeoutErrorCallback(async (instance, source) => {
            if (!instance.channel) {
                instance.reply({ id: new index_1.api.ODId("looks-like-we-got-an-error-here"), ephemeral: true, message: {
                        content: ":x: **Something went wrong while replying to this modal!**"
                    } });
                return;
            }
            instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-responder-timeout").build(source, { guild: instance.guild, channel: instance.channel, user: instance.user }));
        }, null);
    }));
};
exports.loadCommandErrorHandlingCode = loadCommandErrorHandlingCode;
const loadStartListeningInteractionsCode = async () => {
    //START LISTENING TO INTERACTIONS
    index_1.opendiscord.code.add(new index_1.api.ODCode("opendiscord:start-listening-interactions", 13, () => {
        index_1.opendiscord.client.slashCommands.startListeningToInteractions();
        index_1.opendiscord.client.textCommands.startListeningToInteractions();
        index_1.opendiscord.client.contextMenus.startListeningToInteractions();
        index_1.opendiscord.client.autocompletes.startListeningToInteractions();
    }));
};
exports.loadStartListeningInteractionsCode = loadStartListeningInteractionsCode;
const loadDatabaseCleanersCode = async () => {
    if (!mainServer)
        return;
    //PANEL DATABASE CLEANER
    index_1.opendiscord.code.add(new index_1.api.ODCode("opendiscord:panel-database-cleaner", 12, async () => {
        const validPanels = [];
        //check global database for valid panel embeds
        for (const panel of (await globalDatabase.getCategory("opendiscord:panel-message") ?? [])) {
            if (!validPanels.includes(panel.key)) {
                try {
                    const splittedId = panel.key.split("_");
                    const message = await index_1.opendiscord.client.fetchGuildChannelMessage(mainServer, splittedId[0], splittedId[1]);
                    if (message)
                        validPanels.push(panel.key);
                }
                catch { }
            }
        }
        //remove all unused panels
        for (const panel of (await globalDatabase.getCategory("opendiscord:panel-message") ?? [])) {
            if (!validPanels.includes(panel.key)) {
                await globalDatabase.delete("opendiscord:panel-message", panel.key);
                await globalDatabase.delete("opendiscord:panel-update", panel.key);
            }
        }
        //delete panel from database on delete
        index_1.opendiscord.client.client.on("messageDelete", async (msg) => {
            if (await globalDatabase.exists("opendiscord:panel-message", msg.channel.id + "_" + msg.id)) {
                await globalDatabase.delete("opendiscord:panel-message", msg.channel.id + "_" + msg.id);
                await globalDatabase.delete("opendiscord:panel-update", msg.channel.id + "_" + msg.id);
            }
        });
    }));
    //SUFFIX DATABASE CLEANER
    index_1.opendiscord.code.add(new index_1.api.ODCode("opendiscord:suffix-database-cleaner", 11, async () => {
        const validSuffixCounters = [];
        const validSuffixHistories = [];
        //check global database for valid option suffix counters
        for (const counter of (await globalDatabase.getCategory("opendiscord:option-suffix-counter") ?? [])) {
            if (!validSuffixCounters.includes(counter.key)) {
                if (index_1.opendiscord.options.exists(counter.key))
                    validSuffixCounters.push(counter.key);
            }
        }
        //check global database for valid option suffix histories
        for (const history of (await globalDatabase.getCategory("opendiscord:option-suffix-history") ?? [])) {
            if (!validSuffixHistories.includes(history.key)) {
                if (index_1.opendiscord.options.exists(history.key))
                    validSuffixHistories.push(history.key);
            }
        }
        //remove all unused suffix counters
        for (const counter of (await globalDatabase.getCategory("opendiscord:option-suffix-counter") ?? [])) {
            if (!validSuffixCounters.includes(counter.key)) {
                await globalDatabase.delete("opendiscord:option-suffix-counter", counter.key);
            }
        }
        //remove all unused suffix histories
        for (const history of (await globalDatabase.getCategory("opendiscord:option-suffix-history") ?? [])) {
            if (!validSuffixHistories.includes(history.key)) {
                await globalDatabase.delete("opendiscord:option-suffix-history", history.key);
            }
        }
    }));
    //OPTION DATABASE CLEANER
    index_1.opendiscord.code.add(new index_1.api.ODCode("opendiscord:option-database-cleaner", 10, async () => {
        //delete all unused options (async)
        for (const option of (await optionDatabase.getCategory("opendiscord:used-option") ?? [])) {
            if (!index_1.opendiscord.options.exists(option.key)) {
                //remove because option isn't loaded into memory (0 tickets require it)
                await optionDatabase.delete("opendiscord:used-option", option.key);
            }
            else if (!index_1.opendiscord.tickets.getAll().some((ticket) => ticket.option.id.value == option.key)) {
                //remove when loaded into memory (0 tickets require it)
                await optionDatabase.delete("opendiscord:used-option", option.key);
            }
        }
    }));
    //USER DATABASE CLEANER (full async/parallel because it takes a lot of time)
    index_1.opendiscord.code.add(new index_1.api.ODCode("opendiscord:user-database-cleaner", 9, () => {
        index_1.utilities.runAsync(async () => {
            const validUsers = [];
            //check user database for valid users
            for (const user of (await userDatabase.getAll())) {
                if (!validUsers.includes(user.key)) {
                    try {
                        const member = await mainServer.members.fetch(user.key);
                        if (member)
                            validUsers.push(member.id);
                    }
                    catch { }
                }
            }
            //check stats database for valid users
            for (const stat of (await statsDatabase.getAll())) {
                if (stat.category.startsWith("opendiscord:user_")) {
                    if (!validUsers.includes(stat.key)) {
                        try {
                            const member = await mainServer.members.fetch(stat.key);
                            if (member)
                                validUsers.push(member.id);
                        }
                        catch { }
                    }
                }
            }
            //remove all unused users
            for (const user of (await userDatabase.getAll())) {
                if (!validUsers.includes(user.key)) {
                    await userDatabase.delete(user.category, user.key);
                }
            }
            //remove all unused stats
            for (const stat of (await statsDatabase.getAll())) {
                if (stat.category.startsWith("opendiscord:user_")) {
                    if (!validUsers.includes(stat.key)) {
                        await statsDatabase.delete(stat.category, stat.key);
                    }
                }
            }
        });
        //delete user from database on leave
        index_1.opendiscord.client.client.on("guildMemberRemove", async (member) => {
            if (member.guild.id != mainServer.id)
                return;
            //remove unused user
            for (const user of (await userDatabase.getAll())) {
                if (user.key == member.id) {
                    await userDatabase.delete(user.category, user.key);
                }
            }
            //remove unused stats
            for (const stat of (await statsDatabase.getAll())) {
                if (stat.category.startsWith("opendiscord:user_")) {
                    if (stat.key == member.id) {
                        await statsDatabase.delete(stat.category, stat.key);
                    }
                }
            }
        });
    }));
    //TICKET DATABASE CLEANER
    index_1.opendiscord.code.add(new index_1.api.ODCode("opendiscord:ticket-database-cleaner", 8, async () => {
        const validTickets = [];
        //check ticket database for valid tickets
        for (const ticket of (await ticketDatabase.getAll())) {
            if (!validTickets.includes(ticket.key)) {
                try {
                    const channel = await index_1.opendiscord.client.fetchGuildTextChannel(mainServer, ticket.key);
                    if (channel)
                        validTickets.push(channel.id);
                }
                catch { }
            }
        }
        //check stats database for valid tickets
        for (const stat of (await statsDatabase.getAll())) {
            if (stat.category.startsWith("opendiscord:ticket_")) {
                if (!validTickets.includes(stat.key)) {
                    try {
                        const channel = await index_1.opendiscord.client.fetchGuildTextChannel(mainServer, stat.key);
                        if (channel)
                            validTickets.push(channel.id);
                    }
                    catch { }
                }
            }
        }
        //remove all unused tickets
        for (const ticket of (await ticketDatabase.getAll())) {
            if (!validTickets.includes(ticket.key)) {
                await ticketDatabase.delete(ticket.category, ticket.key);
                index_1.opendiscord.tickets.remove(ticket.key);
            }
        }
        //remove all unused stats
        for (const stat of (await statsDatabase.getAll())) {
            if (stat.category.startsWith("opendiscord:ticket_")) {
                if (!validTickets.includes(stat.key)) {
                    await statsDatabase.delete(stat.category, stat.key);
                }
            }
        }
        //delete ticket from database on delete
        index_1.opendiscord.client.client.on("channelDelete", async (channel) => {
            if (channel.isDMBased() || channel.guild.id != mainServer.id)
                return;
            //remove unused ticket
            for (const ticket of (await ticketDatabase.getAll())) {
                if (ticket.key == channel.id) {
                    await ticketDatabase.delete(ticket.category, ticket.key);
                    index_1.opendiscord.tickets.remove(ticket.key);
                }
            }
            //remove unused stats
            for (const stat of (await statsDatabase.getAll())) {
                if (stat.category.startsWith("opendiscord:ticket_")) {
                    if (stat.key == channel.id) {
                        await statsDatabase.delete(stat.category, stat.key);
                    }
                }
            }
        });
    }));
};
exports.loadDatabaseCleanersCode = loadDatabaseCleanersCode;
const loadPanelAutoUpdateCode = async () => {
    //PANEL AUTO UPDATE
    index_1.opendiscord.code.add(new index_1.api.ODCode("opendiscord:panel-auto-update", 7, async () => {
        const globalDatabase = index_1.opendiscord.databases.get("opendiscord:global");
        const panelIds = await globalDatabase.getCategory("opendiscord:panel-update") ?? [];
        if (!mainServer)
            return;
        for (const panelId of panelIds) {
            const panel = index_1.opendiscord.panels.get(panelId.value);
            //panel doesn't exist anymore in config and needs to be removed
            if (!panel) {
                globalDatabase.delete("opendiscord:panel-update", panelId.key);
                return;
            }
            try {
                const splittedId = panelId.key.split("_");
                const channel = await index_1.opendiscord.client.fetchGuildTextChannel(mainServer, splittedId[0]);
                if (!channel)
                    return;
                const message = await index_1.opendiscord.client.fetchGuildChannelMessage(mainServer, channel, splittedId[1]);
                if (!message || !message.editable)
                    return;
                message.edit((await index_1.opendiscord.builders.messages.getSafe("opendiscord:panel").build("auto-update", { guild: mainServer, channel, user: index_1.opendiscord.client.client.user, panel })).message);
                index_1.opendiscord.log("Panel in server got auto-updated!", "info", [
                    { key: "channelid", value: splittedId[0] },
                    { key: "messageid", value: splittedId[1] },
                    { key: "panel", value: panelId.value }
                ]);
            }
            catch { }
        }
    }));
};
exports.loadPanelAutoUpdateCode = loadPanelAutoUpdateCode;
const loadDatabaseSaversCode = async () => {
    //TICKET SAVER
    index_1.opendiscord.code.add(new index_1.api.ODCode("opendiscord:ticket-saver", 6, () => {
        const mainVersion = index_1.opendiscord.versions.get("opendiscord:version");
        index_1.opendiscord.tickets.onAdd(async (ticket) => {
            await ticketDatabase.set("opendiscord:ticket", ticket.id.value, ticket.toJson(mainVersion));
            //add option to database if non-existent
            if (!(await optionDatabase.exists("opendiscord:used-option", ticket.option.id.value))) {
                await optionDatabase.set("opendiscord:used-option", ticket.option.id.value, ticket.option.toJson(mainVersion));
            }
        });
        index_1.opendiscord.tickets.onChange(async (ticket) => {
            await ticketDatabase.set("opendiscord:ticket", ticket.id.value, ticket.toJson(mainVersion));
            //add option to database if non-existent
            if (!(await optionDatabase.exists("opendiscord:used-option", ticket.option.id.value))) {
                await optionDatabase.set("opendiscord:used-option", ticket.option.id.value, ticket.option.toJson(mainVersion));
            }
            //delete all unused options on ticket move
            for (const option of index_1.opendiscord.options.getAll()) {
                if (await optionDatabase.exists("opendiscord:used-option", option.id.value) && !index_1.opendiscord.tickets.getAll().some((ticket) => ticket.option.id.value == option.id.value)) {
                    await optionDatabase.delete("opendiscord:used-option", option.id.value);
                }
            }
        });
        index_1.opendiscord.tickets.onRemove(async (ticket) => {
            await ticketDatabase.delete("opendiscord:ticket", ticket.id.value);
            //remove option from database if unused
            if (!index_1.opendiscord.tickets.getAll().some((ticket) => ticket.option.id.value == ticket.option.id.value)) {
                await optionDatabase.delete("opendiscord:used-option", ticket.option.id.value);
            }
        });
    }));
    //BLACKLIST SAVER
    index_1.opendiscord.code.add(new index_1.api.ODCode("opendiscord:blacklist-saver", 5, () => {
        index_1.opendiscord.blacklist.onAdd(async (blacklist) => {
            await userDatabase.set("opendiscord:blacklist", blacklist.id.value, blacklist.reason);
        });
        index_1.opendiscord.blacklist.onChange(async (blacklist) => {
            await userDatabase.set("opendiscord:blacklist", blacklist.id.value, blacklist.reason);
        });
        index_1.opendiscord.blacklist.onRemove(async (blacklist) => {
            await userDatabase.delete("opendiscord:blacklist", blacklist.id.value);
        });
    }));
    //AUTO ROLE ON JOIN
    index_1.opendiscord.code.add(new index_1.api.ODCode("opendiscord:auto-role-on-join", 4, () => {
        index_1.opendiscord.client.client.on("guildMemberAdd", async (member) => {
            for (const option of index_1.opendiscord.options.getAll()) {
                if (option instanceof index_1.api.ODRoleOption && option.get("opendiscord:add-on-join").value) {
                    //add these roles on user join
                    await index_1.opendiscord.actions.get("opendiscord:reaction-role").run("panel-button", { guild: member.guild, user: member.user, option, overwriteMode: "add" });
                }
            }
        });
    }));
};
exports.loadDatabaseSaversCode = loadDatabaseSaversCode;
const loadAutoCode = () => {
    //AUTOCLOSE TIMEOUT
    index_1.opendiscord.code.add(new index_1.api.ODCode("opendiscord:autoclose-timeout", 3, () => {
        setInterval(async () => {
            let count = 0;
            for (const ticket of index_1.opendiscord.tickets.getAll()) {
                const channel = await index_1.opendiscord.tickets.getTicketChannel(ticket);
                if (!channel)
                    return;
                const lastMessage = (await channel.messages.fetch({ limit: 5 })).first();
                if (lastMessage && !ticket.get("opendiscord:closed").value) {
                    //ticket has last message
                    const disableOnClaim = ticket.option.get("opendiscord:autoclose-disable-claim").value && ticket.get("opendiscord:claimed").value;
                    const enabled = (disableOnClaim) ? false : ticket.get("opendiscord:autoclose-enabled").value;
                    const hours = ticket.get("opendiscord:autoclose-hours").value;
                    const time = hours * 60 * 60 * 1000; //hours in milliseconds
                    if (enabled && (new Date().getTime() - lastMessage.createdTimestamp) >= time) {
                        //autoclose ticket
                        await index_1.opendiscord.actions.get("opendiscord:close-ticket").run("autoclose", { guild: channel.guild, channel, user: index_1.opendiscord.client.client.user, ticket, reason: "Autoclose", sendMessage: false });
                        await channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:autoclose-message").build("timeout", { guild: channel.guild, channel, user: index_1.opendiscord.client.client.user, ticket })).message);
                        count++;
                        await index_1.opendiscord.stats.get("opendiscord:global").setStat("opendiscord:tickets-autoclosed", 1, "increase");
                    }
                }
            }
            index_1.opendiscord.debug.debug("Finished autoclose timeout cycle!", [
                { key: "interval", value: index_1.opendiscord.defaults.getDefault("autocloseCheckInterval").toString() },
                { key: "closed", value: count.toString() }
            ]);
        }, index_1.opendiscord.defaults.getDefault("autocloseCheckInterval"));
    }));
    //AUTOCLOSE LEAVE
    index_1.opendiscord.code.add(new index_1.api.ODCode("opendiscord:autoclose-leave", 2, () => {
        index_1.opendiscord.client.client.on("guildMemberRemove", async (member) => {
            for (const ticket of index_1.opendiscord.tickets.getAll()) {
                if (ticket.get("opendiscord:opened-by").value == member.id) {
                    const channel = await index_1.opendiscord.tickets.getTicketChannel(ticket);
                    if (!channel)
                        return;
                    //ticket has been created by this user
                    const disableOnClaim = ticket.option.get("opendiscord:autoclose-disable-claim").value && ticket.get("opendiscord:claimed").value;
                    const enabled = (disableOnClaim || !ticket.get("opendiscord:autoclose-enabled").value) ? false : ticket.option.get("opendiscord:autoclose-enable-leave");
                    if (enabled) {
                        //autoclose ticket
                        await index_1.opendiscord.actions.get("opendiscord:close-ticket").run("autoclose", { guild: channel.guild, channel, user: index_1.opendiscord.client.client.user, ticket, reason: "Autoclose", sendMessage: false });
                        await channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:autoclose-message").build("leave", { guild: channel.guild, channel, user: index_1.opendiscord.client.client.user, ticket })).message);
                        await index_1.opendiscord.stats.get("opendiscord:global").setStat("opendiscord:tickets-autoclosed", 1, "increase");
                    }
                }
            }
        });
    }));
    //AUTODELETE TIMEOUT
    index_1.opendiscord.code.add(new index_1.api.ODCode("opendiscord:autodelete-timeout", 1, () => {
        setInterval(async () => {
            let count = 0;
            for (const ticket of index_1.opendiscord.tickets.getAll()) {
                const channel = await index_1.opendiscord.tickets.getTicketChannel(ticket);
                if (!channel)
                    return;
                const lastMessage = (await channel.messages.fetch({ limit: 5 })).first();
                if (lastMessage) {
                    //ticket has last message
                    const disableOnClaim = ticket.option.get("opendiscord:autodelete-disable-claim").value && ticket.get("opendiscord:claimed").value;
                    const disableWhenNotClosed = generalConfig.data.system.autodeleteRequiresClosedTicket && !ticket.get("opendiscord:closed").value;
                    const enabled = (disableOnClaim || disableWhenNotClosed) ? false : ticket.get("opendiscord:autodelete-enabled").value;
                    const days = ticket.get("opendiscord:autodelete-days").value;
                    const time = days * 24 * 60 * 60 * 1000; //days in milliseconds
                    if (enabled && (new Date().getTime() - lastMessage.createdTimestamp) >= time) {
                        //autodelete ticket
                        await channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:autodelete-message").build("timeout", { guild: channel.guild, channel, user: index_1.opendiscord.client.client.user, ticket })).message);
                        await index_1.opendiscord.actions.get("opendiscord:delete-ticket").run("autodelete", { guild: channel.guild, channel, user: index_1.opendiscord.client.client.user, ticket, reason: "Autodelete", sendMessage: false, withoutTranscript: false });
                        count++;
                        await index_1.opendiscord.stats.get("opendiscord:global").setStat("opendiscord:tickets-autodeleted", 1, "increase");
                    }
                }
            }
            index_1.opendiscord.debug.debug("Finished autodelete timeout cycle!", [
                { key: "interval", value: index_1.opendiscord.defaults.getDefault("autodeleteCheckInterval").toString() },
                { key: "deleted", value: count.toString() }
            ]);
        }, index_1.opendiscord.defaults.getDefault("autodeleteCheckInterval"));
    }));
    //AUTODELETE LEAVE
    index_1.opendiscord.code.add(new index_1.api.ODCode("opendiscord:autodelete-leave", 0, () => {
        index_1.opendiscord.client.client.on("guildMemberRemove", async (member) => {
            for (const ticket of index_1.opendiscord.tickets.getAll()) {
                if (ticket.get("opendiscord:opened-by").value == member.id) {
                    const channel = await index_1.opendiscord.tickets.getTicketChannel(ticket);
                    if (!channel)
                        return;
                    //ticket has been created by this user
                    const disableOnClaim = ticket.option.get("opendiscord:autodelete-disable-claim").value && ticket.get("opendiscord:claimed").value;
                    const disableWhenNotClosed = generalConfig.data.system.autodeleteRequiresClosedTicket && !ticket.get("opendiscord:closed").value;
                    const enabled = (disableOnClaim || disableWhenNotClosed || !ticket.get("opendiscord:autodelete-enabled").value) ? false : ticket.option.get("opendiscord:autodelete-enable-leave");
                    if (enabled) {
                        //autodelete ticket
                        await channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:autodelete-message").build("leave", { guild: channel.guild, channel, user: index_1.opendiscord.client.client.user, ticket })).message);
                        await index_1.opendiscord.actions.get("opendiscord:delete-ticket").run("autodelete", { guild: channel.guild, channel, user: index_1.opendiscord.client.client.user, ticket, reason: "Autodelete", sendMessage: false, withoutTranscript: false });
                        await index_1.opendiscord.stats.get("opendiscord:global").setStat("opendiscord:tickets-autodeleted", 1, "increase");
                    }
                }
            }
        });
    }));
    //TICKET ANTI BUSY (+ sync version of tickets with latest OT version in database)
    index_1.opendiscord.code.add(new index_1.api.ODCode("opendiscord:ticket-anti-busy", -1, () => {
        for (const ticket of index_1.opendiscord.tickets.getAll()) {
            //free tickets from corruption due to opendiscord:busy variable
            ticket.get("opendiscord:busy").value = false;
        }
    }));
};
