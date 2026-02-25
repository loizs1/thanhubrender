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
exports.removeTicketPermissions = exports.addTicketPermissions = exports.loadAllPermissions = void 0;
const index_1 = require("../../index");
const discord = __importStar(require("discord.js"));
const loadAllPermissions = async () => {
    const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
    if (!generalConfig)
        return;
    const mainServer = index_1.opendiscord.client.mainServer;
    if (!mainServer)
        return;
    //DEVELOPER & OWNER
    const developer = (await index_1.opendiscord.client.client.application.fetch()).owner;
    if (developer instanceof discord.User) {
        index_1.opendiscord.permissions.add(new index_1.api.ODPermission("opendiscord:developer-" + developer.id, "global-user", "developer", developer));
    }
    else if (developer instanceof discord.Team) {
        developer.members.forEach((member) => {
            index_1.opendiscord.permissions.add(new index_1.api.ODPermission("opendiscord:developer-" + member.user.id, "global-user", "developer", member.user));
        });
    }
    const owner = (await mainServer.members.fetch(mainServer.ownerId)).user;
    index_1.opendiscord.permissions.add(new index_1.api.ODPermission("opendiscord:owner-" + owner.id, "global-user", "owner", owner));
    //GLOBAL ADMINS
    for (const admin of generalConfig.data.globalAdmins) {
        const role = await index_1.opendiscord.client.fetchGuildRole(mainServer, admin);
        if (!role)
            return index_1.opendiscord.log("Unable to register permission for global admin!", "error", [
                { key: "roleid", value: admin }
            ]);
        index_1.opendiscord.permissions.add(new index_1.api.ODPermission("opendiscord:global-admin-" + admin, "global-role", "admin", role));
    }
    //TICKET ADMINS
    await index_1.opendiscord.tickets.loopAll(async (ticket) => {
        try {
            const channel = await index_1.opendiscord.client.fetchGuildTextChannel(mainServer, ticket.id.value);
            if (!channel)
                return;
            const admins = ticket.option.exists("opendiscord:admins") ? ticket.option.get("opendiscord:admins").value : [];
            const readAdmins = ticket.option.exists("opendiscord:admins-readonly") ? ticket.option.get("opendiscord:admins-readonly").value : [];
            for (const admin of admins.concat(readAdmins)) {
                if (index_1.opendiscord.permissions.exists("opendiscord:ticket-admin_" + ticket.id.value + "_" + admin))
                    return;
                const role = await mainServer.roles.fetch(admin);
                if (!role)
                    return index_1.opendiscord.log("Unable to register permission for ticket admin!", "error", [
                        { key: "roleid", value: admin }
                    ]);
                index_1.opendiscord.permissions.add(new index_1.api.ODPermission("opendiscord:ticket-admin_" + ticket.id.value + "_" + admin, "channel-role", "support", role, channel));
            }
        }
        catch (err) {
            process.emit("uncaughtException", err);
            index_1.opendiscord.log("Ticket Admin Loading Permissions Error (see above)", "error");
        }
    });
};
exports.loadAllPermissions = loadAllPermissions;
const addTicketPermissions = async (ticket) => {
    const mainServer = index_1.opendiscord.client.mainServer;
    if (!mainServer)
        return;
    const channel = await index_1.opendiscord.client.fetchGuildTextChannel(mainServer, ticket.id.value);
    if (!channel)
        return;
    const admins = ticket.option.exists("opendiscord:admins") ? ticket.option.get("opendiscord:admins").value : [];
    const readAdmins = ticket.option.exists("opendiscord:admins-readonly") ? ticket.option.get("opendiscord:admins-readonly").value : [];
    for (const admin of admins.concat(readAdmins)) {
        if (index_1.opendiscord.permissions.exists("opendiscord:ticket-admin_" + ticket.id.value + "_" + admin))
            return;
        const role = await mainServer.roles.fetch(admin);
        if (!role)
            return index_1.opendiscord.log("Unable to register permission for ticket admin!", "error", [
                { key: "roleid", value: admin }
            ]);
        index_1.opendiscord.permissions.add(new index_1.api.ODPermission("opendiscord:ticket-admin_" + ticket.id.value + "_" + admin, "channel-role", "support", role, channel));
    }
};
exports.addTicketPermissions = addTicketPermissions;
const removeTicketPermissions = async (ticket) => {
    const admins = ticket.option.exists("opendiscord:admins") ? ticket.option.get("opendiscord:admins").value : [];
    const readAdmins = ticket.option.exists("opendiscord:admins-readonly") ? ticket.option.get("opendiscord:admins-readonly").value : [];
    for (const admin of admins.concat(readAdmins)) {
        if (!index_1.opendiscord.permissions.exists("opendiscord:ticket-admin_" + ticket.id.value + "_" + admin))
            return;
        index_1.opendiscord.permissions.remove("opendiscord:ticket-admin_" + ticket.id.value + "_" + admin);
    }
};
exports.removeTicketPermissions = removeTicketPermissions;
