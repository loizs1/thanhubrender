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
exports.ODPermissionManager = exports.ODPermission = exports.ODPermissionLevel = void 0;
///////////////////////////////////////
//PERMISSION MODULE
///////////////////////////////////////
const base_1 = require("./base");
const discord = __importStar(require("discord.js"));
/**## ODPermissionLevel `enum`
 * All available permission types/levels. But as `enum` instead of `type`. Used to calculate the level.
 */
var ODPermissionLevel;
(function (ODPermissionLevel) {
    /**A normal member. (Default for everyone) */
    ODPermissionLevel[ODPermissionLevel["member"] = 0] = "member";
    /**Support team. Higher than a normal member. (Used for ticket-admins) */
    ODPermissionLevel[ODPermissionLevel["support"] = 1] = "support";
    /**Moderator. Higher than the support team. (Unused) */
    ODPermissionLevel[ODPermissionLevel["moderator"] = 2] = "moderator";
    /**Admin. Higher than a moderator. (Used for global-admins) */
    ODPermissionLevel[ODPermissionLevel["admin"] = 3] = "admin";
    /**Server owner. (Able to use all commands including `/stats reset`) */
    ODPermissionLevel[ODPermissionLevel["owner"] = 4] = "owner";
    /**Bot owner or all users from dev team. (Able to use all commands including `/stats reset`) */
    ODPermissionLevel[ODPermissionLevel["developer"] = 5] = "developer";
})(ODPermissionLevel || (exports.ODPermissionLevel = ODPermissionLevel = {}));
/**## ODPermission `class`
 * This is an Open Ticket permission.
 *
 * It defines a single permission level for a specific scope (global/channel & user/role)
 * These permissions only apply to commands & interactions.
 * They are not related to channel permissions in the ticket system.
 *
 * Register this class to an `ODPermissionManager` to use it!
 */
class ODPermission extends base_1.ODManagerData {
    /**The scope of this permission. */
    scope;
    /**The type/level of this permission. */
    permission;
    /**The user/role of this permission. */
    value;
    /**The channel that this permission applies to. (`null` when global) */
    channel;
    constructor(id, scope, permission, value, channel) {
        super(id);
        this.scope = scope;
        this.permission = permission;
        this.value = value;
        this.channel = channel ?? null;
    }
}
exports.ODPermission = ODPermission;
/**## ODPermissionManager `class`
 * This is an Open Ticket permission manager.
 *
 * It manages all permissions in the bot!
 * Use the `getPermissions()` and `hasPermissions()` methods to get user perms.
 *
 * Add new permissions using the `ODPermission` class in your plugin!
 */
class ODPermissionManager extends base_1.ODManager {
    /**Alias for Open Ticket debugger. */
    #debug;
    /**The function for calculating permissions in this manager. */
    #calculation;
    /**An alias to the Open Discord client manager. */
    #client;
    /**The result which is returned when no other permissions match. (`member` by default) */
    defaultResult = {
        level: ODPermissionLevel["member"],
        scope: "default",
        type: "member",
        source: null
    };
    constructor(debug, client, useDefaultCalculation) {
        super(debug, "permission");
        this.#debug = debug;
        this.#calculation = useDefaultCalculation ? this.#defaultCalculation : null;
        this.#client = client;
    }
    /**Edit the permission calculation function in this manager. */
    setCalculation(calculation) {
        this.#calculation = calculation;
    }
    /**Edit the result which is returned when no other permissions match. (`member` by default) */
    setDefaultResult(result) {
        this.defaultResult = result;
    }
    /**Get an `ODPermissionResult` based on a few context factors. Use `hasPermissions()` to simplify the result. */
    getPermissions(user, channel, guild, settings) {
        try {
            if (!this.#calculation)
                throw new base_1.ODSystemError("ODPermissionManager:getPermissions() => missing perms calculation");
            return this.#calculation(user, channel, guild, settings);
        }
        catch (err) {
            process.emit("uncaughtException", err);
            throw new base_1.ODSystemError("ODPermissionManager:getPermissions() => failed perms calculation");
        }
    }
    /**Simplifies the `ODPermissionResult` returned from `getPermissions()` and returns a boolean to check if the user matches the required permissions. */
    hasPermissions(minimum, data) {
        if (minimum == "member")
            return true;
        else if (minimum == "support")
            return (data.level >= ODPermissionLevel["support"]);
        else if (minimum == "moderator")
            return (data.level >= ODPermissionLevel["moderator"]);
        else if (minimum == "admin")
            return (data.level >= ODPermissionLevel["admin"]);
        else if (minimum == "owner")
            return (data.level >= ODPermissionLevel["owner"]);
        else if (minimum == "developer")
            return (data.level >= ODPermissionLevel["developer"]);
        else
            throw new base_1.ODSystemError("Invalid minimum permission type at ODPermissionManager.hasPermissions()");
    }
    /**Check for permissions. (default calculation) */
    async #defaultCalculation(user, channel, guild, settings) {
        const globalCalc = await this.#defaultGlobalCalculation(user, channel, guild, settings);
        const channelCalc = await this.#defaultChannelCalculation(user, channel, guild, settings);
        if (globalCalc.level > channelCalc.level)
            return globalCalc;
        else
            return channelCalc;
    }
    /**Check for global permissions. Result will be compared with the channel perms in `#defaultCalculation()`. */
    async #defaultGlobalCalculation(user, channel, guild, settings) {
        const idRegex = (settings && typeof settings.idRegex != "undefined") ? settings.idRegex : null;
        const allowGlobalUserScope = (settings && typeof settings.allowGlobalUserScope != "undefined") ? settings.allowGlobalUserScope : true;
        const allowGlobalRoleScope = (settings && typeof settings.allowGlobalRoleScope != "undefined") ? settings.allowGlobalRoleScope : true;
        //check for global user permissions
        if (allowGlobalUserScope) {
            const users = this.getFiltered((permission) => (!idRegex || (idRegex && idRegex.test(permission.id.value))) && permission.scope == "global-user" && (permission.value instanceof discord.User) && permission.value.id == user.id);
            if (users.length > 0) {
                //sort all permisions from highest to lowest
                users.sort((a, b) => {
                    const levelA = ODPermissionLevel[a.permission];
                    const levelB = ODPermissionLevel[b.permission];
                    if (levelB > levelA)
                        return 1;
                    else if (levelA > levelB)
                        return -1;
                    else
                        return 0;
                });
                return {
                    type: users[0].permission,
                    scope: "global-user",
                    level: ODPermissionLevel[users[0].permission],
                    source: users[0] ?? null
                };
            }
        }
        //check for global role permissions
        if (allowGlobalRoleScope) {
            if (guild) {
                const member = await this.#client.fetchGuildMember(guild, user.id);
                if (member) {
                    const memberRoles = member.roles.cache.map((role) => role.id);
                    const roles = this.getFiltered((permission) => (!idRegex || (idRegex && idRegex.test(permission.id.value))) && permission.scope == "global-role" && (permission.value instanceof discord.Role) && memberRoles.includes(permission.value.id) && permission.value.guild.id == guild.id);
                    if (roles.length > 0) {
                        //sort all permisions from highest to lowest
                        roles.sort((a, b) => {
                            const levelA = ODPermissionLevel[a.permission];
                            const levelB = ODPermissionLevel[b.permission];
                            if (levelB > levelA)
                                return 1;
                            else if (levelA > levelB)
                                return -1;
                            else
                                return 0;
                        });
                        return {
                            type: roles[0].permission,
                            scope: "global-role",
                            level: ODPermissionLevel[roles[0].permission],
                            source: roles[0] ?? null
                        };
                    }
                }
            }
        }
        //spread result to prevent accidental referencing
        return { ...this.defaultResult };
    }
    /**Check for channel permissions. Result will be compared with the global perms in `#defaultCalculation()`. */
    async #defaultChannelCalculation(user, channel, guild, settings) {
        const idRegex = (settings && typeof settings.idRegex != "undefined") ? settings.idRegex : null;
        const allowChannelUserScope = (settings && typeof settings.allowChannelUserScope != "undefined") ? settings.allowChannelUserScope : true;
        const allowChannelRoleScope = (settings && typeof settings.allowChannelRoleScope != "undefined") ? settings.allowChannelRoleScope : true;
        if (guild && channel && !channel.isDMBased()) {
            //check for channel user permissions
            if (allowChannelUserScope) {
                const users = this.getFiltered((permission) => (!idRegex || (idRegex && idRegex.test(permission.id.value))) && permission.scope == "channel-user" && permission.channel && (permission.channel.id == channel.id) && (permission.value instanceof discord.User) && permission.value.id == user.id);
                if (users.length > 0) {
                    //sort all permisions from highest to lowest
                    users.sort((a, b) => {
                        const levelA = ODPermissionLevel[a.permission];
                        const levelB = ODPermissionLevel[b.permission];
                        if (levelB > levelA)
                            return 1;
                        else if (levelA > levelB)
                            return -1;
                        else
                            return 0;
                    });
                    return {
                        type: users[0].permission,
                        scope: "channel-user",
                        level: ODPermissionLevel[users[0].permission],
                        source: users[0] ?? null
                    };
                }
            }
            //check for channel role permissions
            if (allowChannelRoleScope) {
                const member = await this.#client.fetchGuildMember(guild, user.id);
                if (member) {
                    const memberRoles = member.roles.cache.map((role) => role.id);
                    const roles = this.getFiltered((permission) => (!idRegex || (idRegex && idRegex.test(permission.id.value))) && permission.scope == "channel-role" && permission.channel && (permission.channel.id == channel.id) && (permission.value instanceof discord.Role) && memberRoles.includes(permission.value.id) && permission.value.guild.id == guild.id);
                    if (roles.length > 0) {
                        //sort all permisions from highest to lowest
                        roles.sort((a, b) => {
                            const levelA = ODPermissionLevel[a.permission];
                            const levelB = ODPermissionLevel[b.permission];
                            if (levelB > levelA)
                                return 1;
                            else if (levelA > levelB)
                                return -1;
                            else
                                return 0;
                        });
                        return {
                            type: roles[0].permission,
                            scope: "channel-role",
                            level: ODPermissionLevel[roles[0].permission],
                            source: roles[0] ?? null
                        };
                    }
                }
            }
        }
        //spread result to prevent accidental modification because of referencing
        return { ...this.defaultResult };
    }
    /**Check the permissions for a certain command of the bot. */
    async checkCommandPerms(permissionMode, requiredLevel, user, member, channel, guild, settings) {
        if (permissionMode === "none") {
            return { hasPerms: false, reason: "disabled" };
        }
        else if (permissionMode === "everyone") {
            const isAdmin = this.hasPermissions(requiredLevel, await this.getPermissions(user, channel, guild, settings));
            return { hasPerms: true, isAdmin };
        }
        else if (permissionMode === "admin") {
            const isAdmin = this.hasPermissions(requiredLevel, await this.getPermissions(user, channel, guild, settings));
            if (!isAdmin)
                return { hasPerms: false, reason: "no-perms" };
            else
                return { hasPerms: true, isAdmin };
        }
        else {
            if (!guild || !member) {
                this.#debug.debug("ODPermissionManager.checkCommandPerms(): Permission Error, Not in server! (#1)");
                return { hasPerms: false, reason: "not-in-server" };
            }
            // Support comma-separated role IDs (e.g. "roleId1,roleId2,roleId3")
            const roleIds = permissionMode.split(",").map(id => id.trim()).filter(id => id.length > 0);
            let hasRole = false;
            for (const roleId of roleIds) {
                const role = await this.#client.fetchGuildRole(guild, roleId);
                if (!role) {
                    this.#debug.debug("ODPermissionManager.checkCommandPerms(): Permission Error, role not found: " + roleId);
                    continue;
                }
                if (role.members.has(member.id)) {
                    hasRole = true;
                    break;
                }
            }
            if (!hasRole)
                return { hasPerms: false, reason: "no-perms" };
            const isAdmin = this.hasPermissions(requiredLevel, await this.getPermissions(user, channel, guild, settings));
            return { hasPerms: true, isAdmin };
        }
    }
}
exports.ODPermissionManager = ODPermissionManager;
