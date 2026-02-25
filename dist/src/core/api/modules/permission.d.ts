import { ODValidId, ODManager, ODManagerData } from "./base";
import * as discord from "discord.js";
import { ODDebugger } from "./console";
import { ODClientManager } from "./client";
/**## ODPermissionType `type`
 * All available permission types/levels. Can be used in the `ODPermission` class.
 */
export type ODPermissionType = "member" | "support" | "moderator" | "admin" | "owner" | "developer";
/**## ODPermissionScope `type`
 * The scope in which a certain permission is active.
 */
export type ODPermissionScope = "global-user" | "channel-user" | "global-role" | "channel-role";
/**## ODPermissionResult `interface`
 * The result returned by `ODPermissionManager.getPermissions()`.
 */
export interface ODPermissionResult {
    /**The permission type. */
    type: ODPermissionType;
    /**The permission scope. */
    scope: ODPermissionScope | "default";
    /**The highest level available for this scope. */
    level: ODPermissionLevel;
    /**The permission which returned this level. */
    source: ODPermission | null;
}
/**## ODPermissionLevel `enum`
 * All available permission types/levels. But as `enum` instead of `type`. Used to calculate the level.
 */
export declare enum ODPermissionLevel {
    /**A normal member. (Default for everyone) */
    member = 0,
    /**Support team. Higher than a normal member. (Used for ticket-admins) */
    support = 1,
    /**Moderator. Higher than the support team. (Unused) */
    moderator = 2,
    /**Admin. Higher than a moderator. (Used for global-admins) */
    admin = 3,
    /**Server owner. (Able to use all commands including `/stats reset`) */
    owner = 4,
    /**Bot owner or all users from dev team. (Able to use all commands including `/stats reset`) */
    developer = 5
}
/**## ODPermission `class`
 * This is an Open Ticket permission.
 *
 * It defines a single permission level for a specific scope (global/channel & user/role)
 * These permissions only apply to commands & interactions.
 * They are not related to channel permissions in the ticket system.
 *
 * Register this class to an `ODPermissionManager` to use it!
 */
export declare class ODPermission extends ODManagerData {
    /**The scope of this permission. */
    readonly scope: ODPermissionScope;
    /**The type/level of this permission. */
    readonly permission: ODPermissionType;
    /**The user/role of this permission. */
    readonly value: discord.Role | discord.User;
    /**The channel that this permission applies to. (`null` when global) */
    readonly channel: discord.Channel | null;
    constructor(id: ODValidId, scope: "global-user", permission: ODPermissionType, value: discord.User);
    constructor(id: ODValidId, scope: "global-role", permission: ODPermissionType, value: discord.Role);
    constructor(id: ODValidId, scope: "channel-user", permission: ODPermissionType, value: discord.User, channel: discord.Channel);
    constructor(id: ODValidId, scope: "channel-role", permission: ODPermissionType, value: discord.Role, channel: discord.Channel);
}
/**## ODPermissionSettings `interface`
 * Optional settings for the `getPermissions()` method in the `ODPermissionManager`.
 */
export interface ODPermissionSettings {
    /**Include permissions from the global user scope. */
    allowGlobalUserScope?: boolean;
    /**Include permissions from the global role scope. */
    allowGlobalRoleScope?: boolean;
    /**Include permissions from the channel user scope. */
    allowChannelUserScope?: boolean;
    /**Include permissions from the channel role scope. */
    allowChannelRoleScope?: boolean;
    /**Only include permissions of which the id matches this regex. */
    idRegex?: RegExp;
}
/**## ODPermissionCalculationCallback `type`
 * The callback of the permission calculation. (Used in `ODPermissionManager`)
 */
export type ODPermissionCalculationCallback = (user: discord.User, channel?: discord.Channel | null, guild?: discord.Guild | null, settings?: ODPermissionSettings | null) => Promise<ODPermissionResult>;
/**## ODPermissionCommandResult `type`
 * The result of calculating permissions for a command.
 */
export type ODPermissionCommandResult = {
    /**Returns `true` when the user has valid permissions. */
    hasPerms: false;
    reason: "no-perms" | "disabled" | "not-in-server";
} | {
    /**Returns `true` when the user has valid permissions. */
    hasPerms: true;
    /**Is the user a server admin or a normal member? This does not decide if the user has permissions or not. */
    isAdmin: boolean;
};
/**## ODPermissionManager `class`
 * This is an Open Ticket permission manager.
 *
 * It manages all permissions in the bot!
 * Use the `getPermissions()` and `hasPermissions()` methods to get user perms.
 *
 * Add new permissions using the `ODPermission` class in your plugin!
 */
export declare class ODPermissionManager extends ODManager<ODPermission> {
    #private;
    /**The result which is returned when no other permissions match. (`member` by default) */
    defaultResult: ODPermissionResult;
    constructor(debug: ODDebugger, client: ODClientManager, useDefaultCalculation?: boolean);
    /**Edit the permission calculation function in this manager. */
    setCalculation(calculation: ODPermissionCalculationCallback): void;
    /**Edit the result which is returned when no other permissions match. (`member` by default) */
    setDefaultResult(result: ODPermissionResult): void;
    /**Get an `ODPermissionResult` based on a few context factors. Use `hasPermissions()` to simplify the result. */
    getPermissions(user: discord.User, channel?: discord.Channel | null, guild?: discord.Guild | null, settings?: ODPermissionSettings | null): Promise<ODPermissionResult>;
    /**Simplifies the `ODPermissionResult` returned from `getPermissions()` and returns a boolean to check if the user matches the required permissions. */
    hasPermissions(minimum: ODPermissionType, data: ODPermissionResult): boolean;
    /**Check the permissions for a certain command of the bot. */
    checkCommandPerms(permissionMode: string, requiredLevel: ODPermissionType, user: discord.User, member?: discord.GuildMember | null, channel?: discord.Channel | null, guild?: discord.Guild | null, settings?: ODPermissionSettings): Promise<ODPermissionCommandResult>;
}
