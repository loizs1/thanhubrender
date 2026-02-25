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
exports.loadAllStats = exports.loadAllStatScopes = void 0;
const index_1 = require("../../index");
const discord = __importStar(require("discord.js"));
const stats = index_1.opendiscord.stats;
const lang = index_1.opendiscord.languages;
const loadAllStatScopes = async () => {
    stats.add(new index_1.api.ODStatGlobalScope("opendiscord:global", index_1.utilities.emojiTitle("📊", lang.getTranslation("stats.scopes.global"))));
    stats.add(new index_1.api.ODStatGlobalScope("opendiscord:system", index_1.utilities.emojiTitle("⚙️", lang.getTranslation("stats.scopes.system"))));
    stats.add(new index_1.api.ODStatScope("opendiscord:user", index_1.utilities.emojiTitle("📊", lang.getTranslation("stats.scopes.user"))));
    stats.add(new index_1.api.ODStatScope("opendiscord:ticket", index_1.utilities.emojiTitle("📊", lang.getTranslation("stats.scopes.ticket"))));
    stats.add(new index_1.api.ODStatScope("opendiscord:participants", index_1.utilities.emojiTitle("👥", lang.getTranslation("stats.scopes.participants"))));
    stats.add(new index_1.api.ODStatScope("opendiscord:messages", index_1.utilities.emojiTitle("💬", lang.getTranslation("stats.scopes.messages"))));
};
exports.loadAllStatScopes = loadAllStatScopes;
const loadAllStats = async () => {
    const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
    if (!generalConfig)
        return;
    const global = stats.get("opendiscord:global");
    if (global) {
        global.add(new index_1.api.ODBasicStat("opendiscord:tickets-created", 13, lang.getTranslation("stats.properties.ticketsCreated"), 0));
        global.add(new index_1.api.ODBasicStat("opendiscord:tickets-closed", 12, lang.getTranslation("stats.properties.ticketsClosed"), 0));
        global.add(new index_1.api.ODBasicStat("opendiscord:tickets-deleted", 11, lang.getTranslation("stats.properties.ticketsDeleted"), 0));
        global.add(new index_1.api.ODBasicStat("opendiscord:tickets-reopened", 10, lang.getTranslation("stats.properties.ticketsReopened"), 0));
        global.add(new index_1.api.ODBasicStat("opendiscord:tickets-autoclosed", 9, lang.getTranslation("stats.properties.ticketsAutoclosed"), 0));
        global.add(new index_1.api.ODBasicStat("opendiscord:tickets-autodeleted", 8, lang.getTranslation("stats.properties.ticketsAutodeleted"), 0));
        global.add(new index_1.api.ODBasicStat("opendiscord:tickets-claimed", 7, lang.getTranslation("stats.properties.ticketsClaimed"), 0));
        global.add(new index_1.api.ODBasicStat("opendiscord:tickets-pinned", 6, lang.getTranslation("stats.properties.ticketsPinned"), 0));
        global.add(new index_1.api.ODBasicStat("opendiscord:tickets-moved", 5, lang.getTranslation("stats.properties.ticketsMoved"), 0));
        global.add(new index_1.api.ODBasicStat("opendiscord:tickets-transferred", 4, lang.getTranslation("stats.properties.ticketsTransferred"), 0));
        global.add(new index_1.api.ODBasicStat("opendiscord:users-blacklisted", 3, lang.getTranslation("stats.properties.usersBlacklisted"), 0));
        global.add(new index_1.api.ODBasicStat("opendiscord:transcripts-created", 2, lang.getTranslation("stats.properties.transcriptsCreated"), 0));
        global.add(new index_1.api.ODDynamicStat("opendiscord:ticket-volume", 1, () => {
            return lang.getTranslation("stats.properties.ticketVolume") + ": `" + index_1.opendiscord.tickets.getLength() + "`";
        }));
        global.add(new index_1.api.ODDynamicStat("opendiscord:average-tickets", 0, async () => {
            const userTicketsCreated = await index_1.opendiscord.stats.get("opendiscord:user").getAllStats("opendiscord:tickets-created");
            const average = userTicketsCreated.map((s) => s.value).filter((t) => t > 0).reduce((prev, curr) => prev + curr, 0) / userTicketsCreated.length;
            const roundedAverage = Math.round(average * 1000) / 1000;
            return lang.getTranslation("stats.properties.averageTickets") + ": `" + roundedAverage + "`";
        }));
    }
    const system = stats.get("opendiscord:system");
    if (system) {
        system.add(new index_1.api.ODDynamicStat("opendiscord:startup-date", 2, () => {
            return lang.getTranslation("params.uppercase.startupDate") + ": " + discord.time(index_1.opendiscord.processStartupDate, "f");
        }));
        system.add(new index_1.api.ODDynamicStat("opendiscord:system-uptime", 1, () => {
            return lang.getTranslation("params.uppercase.uptime") + ": " + discord.time(index_1.opendiscord.processStartupDate, "R");
        }));
        system.add(new index_1.api.ODDynamicStat("opendiscord:version", 0, () => {
            return lang.getTranslation("params.uppercase.version") + ": `" + index_1.opendiscord.versions.get("opendiscord:version").toString() + "`";
        }));
    }
    const user = stats.get("opendiscord:user");
    if (user) {
        user.add(new index_1.api.ODDynamicStat("opendiscord:name", 11, async (scopeId, guild, channel, user) => {
            return lang.getTranslation("params.uppercase.name") + ": " + discord.userMention(scopeId);
        }));
        user.add(new index_1.api.ODDynamicStat("opendiscord:role", 10, async (scopeId, guild, channel, user) => {
            const scopeMember = await index_1.opendiscord.client.fetchGuildMember(guild, scopeId);
            if (!scopeMember)
                return "";
            const permissions = await index_1.opendiscord.permissions.getPermissions(scopeMember.user, channel, guild);
            if (permissions.type == "developer")
                return lang.getTranslation("params.uppercase.role") + ": 💻 `" + lang.getTranslation("stats.roles.developer") + "`";
            if (permissions.type == "owner")
                return lang.getTranslation("params.uppercase.role") + ": 👑 `" + lang.getTranslation("stats.roles.serverOwner") + "`";
            if (permissions.type == "admin")
                return lang.getTranslation("params.uppercase.role") + ": 💼 `" + lang.getTranslation("stats.roles.serverAdmin") + "`";
            if (permissions.type == "moderator")
                return lang.getTranslation("params.uppercase.role") + ": 🚔 `" + lang.getTranslation("stats.roles.moderator") + "`";
            if (permissions.type == "support")
                return lang.getTranslation("params.uppercase.role") + ": 💬 `" + lang.getTranslation("stats.roles.support") + "`";
            else
                return lang.getTranslation("params.uppercase.role") + ": 👤 `" + lang.getTranslation("stats.roles.member") + "`";
        }));
        user.add(new index_1.api.ODBasicStat("opendiscord:tickets-created", 10, lang.getTranslation("stats.properties.ticketsCreated"), 0));
        user.add(new index_1.api.ODBasicStat("opendiscord:tickets-closed", 9, lang.getTranslation("stats.properties.ticketsClosed"), 0));
        user.add(new index_1.api.ODBasicStat("opendiscord:tickets-deleted", 8, lang.getTranslation("stats.properties.ticketsDeleted"), 0));
        user.add(new index_1.api.ODBasicStat("opendiscord:tickets-reopened", 7, lang.getTranslation("stats.properties.ticketsReopened"), 0));
        user.add(new index_1.api.ODBasicStat("opendiscord:tickets-claimed", 6, lang.getTranslation("stats.properties.ticketsClaimed"), 0));
        user.add(new index_1.api.ODBasicStat("opendiscord:tickets-pinned", 5, lang.getTranslation("stats.properties.ticketsPinned"), 0));
        user.add(new index_1.api.ODBasicStat("opendiscord:tickets-moved", 4, lang.getTranslation("stats.properties.ticketsMoved"), 0));
        user.add(new index_1.api.ODBasicStat("opendiscord:tickets-transferred", 3, lang.getTranslation("stats.properties.ticketsTransferred"), 0));
        user.add(new index_1.api.ODBasicStat("opendiscord:users-blacklisted", 2, lang.getTranslation("stats.properties.usersBlacklisted"), 0));
        user.add(new index_1.api.ODBasicStat("opendiscord:transcripts-created", 1, lang.getTranslation("stats.properties.transcriptsCreated"), 0));
        user.add(new index_1.api.ODDynamicStat("opendiscord:current-tickets", 0, async (scopeId, guild, channel, user) => {
            return lang.getTranslation("stats.properties.currentTickets") + ": `" + index_1.opendiscord.tickets.getFiltered((t) => t.get("opendiscord:opened-by").value === scopeId).length + "`";
        }));
    }
    const ticket = stats.get("opendiscord:ticket");
    if (ticket) {
        ticket.add(new index_1.api.ODDynamicStat("opendiscord:name", 5, async (scopeId, guild, channel, user) => {
            return lang.getTranslation("params.uppercase.ticket") + ": " + discord.channelMention(scopeId);
        }));
        ticket.add(new index_1.api.ODDynamicStat("opendiscord:status", 4, async (scopeId, guild, channel, user) => {
            const ticket = index_1.opendiscord.tickets.get(scopeId);
            if (!ticket)
                return "";
            const closed = ticket.exists("opendiscord:closed") ? ticket.get("opendiscord:closed").value : false;
            return closed ? lang.getTranslation("params.uppercase.status") + ": 🔒 `" + lang.getTranslation("params.uppercase.closed") + "`" : lang.getTranslation("params.uppercase.status") + ": 🔓 `" + lang.getTranslation("params.uppercase.open") + "`";
        }));
        ticket.add(new index_1.api.ODDynamicStat("opendiscord:claimed", 3, async (scopeId, guild, channel, user) => {
            const ticket = index_1.opendiscord.tickets.get(scopeId);
            if (!ticket)
                return "";
            const claimed = ticket.exists("opendiscord:claimed") ? ticket.get("opendiscord:claimed").value : false;
            return claimed ? lang.getTranslation("params.uppercase.claimed") + ": 🟢 `" + lang.getTranslation("params.uppercase.yes") + "`" : lang.getTranslation("params.uppercase.claimed") + ": 🔴 `" + lang.getTranslation("params.uppercase.no") + "`";
        }));
        ticket.add(new index_1.api.ODDynamicStat("opendiscord:pinned", 2, async (scopeId, guild, channel, user) => {
            const ticket = index_1.opendiscord.tickets.get(scopeId);
            if (!ticket)
                return "";
            const pinned = ticket.exists("opendiscord:pinned") ? ticket.get("opendiscord:pinned").value : false;
            return pinned ? lang.getTranslation("params.uppercase.pinned") + ": 🟢 `" + lang.getTranslation("params.uppercase.yes") + "`" : lang.getTranslation("params.uppercase.pinned") + ": 🔴 `" + lang.getTranslation("params.uppercase.no") + "`";
        }));
        ticket.add(new index_1.api.ODDynamicStat("opendiscord:creation-date", 1, async (scopeId, guild, channel, user) => {
            const ticket = index_1.opendiscord.tickets.get(scopeId);
            if (!ticket)
                return "";
            const rawDate = ticket.get("opendiscord:opened-on").value ?? new Date().getTime();
            return lang.getTranslation("params.uppercase.creationDate") + ": " + discord.time(new Date(rawDate), "f");
        }));
        ticket.add(new index_1.api.ODDynamicStat("opendiscord:creator", 0, async (scopeId, guild, channel, user) => {
            const ticket = index_1.opendiscord.tickets.get(scopeId);
            if (!ticket)
                return "";
            const creator = ticket.get("opendiscord:opened-by").value;
            return lang.getTranslation("params.uppercase.creator") + ": " + (creator ? discord.userMention(creator) : "`unknown`");
        }));
        ticket.add(new index_1.api.ODDynamicStat("opendiscord:ticket-age", -1, async (scopeId, guild, channel, user) => {
            const ticket = index_1.opendiscord.tickets.get(scopeId);
            if (!ticket)
                return "";
            const rawDate = ticket.get("opendiscord:opened-on").value ?? new Date().getTime();
            return lang.getTranslation("stats.properties.age") + ": " + discord.time(new Date(rawDate), "R");
        }));
        //TODO: opendiscord:response-time --> lang.getTranslation("stats.properties.responseTime")
        //TODO: opendiscord:resolution-time --> lang.getTranslation("stats.properties.resolutionTime")
    }
    const participants = stats.get("opendiscord:participants");
    if (participants) {
        participants.add(new index_1.api.ODDynamicStat("opendiscord:participants", 0, async (scopeId, guild, channel, user) => {
            const ticket = index_1.opendiscord.tickets.get(scopeId);
            if (!ticket)
                return "";
            const participants = ticket.exists("opendiscord:participants") ? ticket.get("opendiscord:participants").value : [];
            return participants.map((p) => {
                return (p.type == "role") ? discord.roleMention(p.id) : discord.userMention(p.id);
            }).join("\n");
        }));
    }
    const messages = stats.get("opendiscord:messages");
    if (messages) {
        messages.add(new index_1.api.ODDynamicStat("opendiscord:count", 0, async (scopeId, guild, channel, user) => {
            const ticket = index_1.opendiscord.tickets.get(scopeId);
            if (!ticket)
                return "";
            const messages = await index_1.opendiscord.transcripts.collector.collectAllMessages(ticket, { bots: true, client: true, users: true });
            if (!messages)
                return "";
            const parsedMessages = await index_1.opendiscord.transcripts.collector.convertMessagesToTranscriptData(messages);
            let messageCount = parsedMessages.length;
            let embedCount = 0;
            let fileCount = 0;
            let componentCount = 0;
            for (const msg of parsedMessages) {
                embedCount += msg.embeds.length;
                fileCount += msg.files.length;
                for (const row of msg.components) {
                    componentCount += row.components.length;
                }
            }
            return [
                lang.getTranslation("params.uppercase.messages") + ": `" + messageCount + "`",
                lang.getTranslation("params.uppercase.embeds") + ": `" + embedCount + "`",
                lang.getTranslation("params.uppercase.files") + ": `" + fileCount + "`",
                lang.getTranslation("params.uppercase.components") + ": `" + componentCount + "`"
            ].join("\n");
        }));
    }
};
exports.loadAllStats = loadAllStats;
