import { ODValidId } from "../modules/base";
import { ODClientManager, ODSlashCommand, ODTextCommand, ODSlashCommandManager, ODTextCommandManager, ODSlashCommandInteractionCallback, ODTextCommandInteractionCallback, ODContextMenu, ODContextMenuManager, ODContextMenuInteractionCallback } from "../modules/client";
/** (CONTRIBUTOR GUIDE) HOW TO ADD NEW COMMANDS?
 * - Register the command in loadAllSlashCommands() & loadAllTextCommands() in (./src/data/framework/commandLoader.ts)
 * - Add autocomplete for the command in OD(Slash/Text)CommandManagerIds_Default in (./src/core/api/defaults/client.ts)
 * - Add the command to the help menu in (./src/data/framework/helpMenuLoader.ts)
 * - If required, new config variables should be added (incl. logs, dm-logs & permissions).
 * - Update the Open Ticket Documentation.
 * - If the command contains complex logic or can be executed from a button/dropdown, it should be placed inside an `ODAction`.
 * - Check all files, test the bot carefully & try a lot of different scenario's with different settings.
 */
/**## ODClientManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODClientManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.client`!
 */
export declare class ODClientManager_Default extends ODClientManager {
    slashCommands: ODSlashCommandManager_Default;
    textCommands: ODTextCommandManager_Default;
    contextMenus: ODContextMenuManager_Default;
}
/**## ODSlashCommandManagerIds_Default `interface`
 * This interface is a list of ids available in the `ODSlashCommandManager_Default` class.
 * It's used to generate typescript declarations for this class.
 */
export interface ODSlashCommandManagerIds_Default {
    "opendiscord:help": ODSlashCommand;
    "opendiscord:panel": ODSlashCommand;
    "opendiscord:ticket": ODSlashCommand;
    "opendiscord:close": ODSlashCommand;
    "opendiscord:delete": ODSlashCommand;
    "opendiscord:reopen": ODSlashCommand;
    "opendiscord:claim": ODSlashCommand;
    "opendiscord:unclaim": ODSlashCommand;
    "opendiscord:pin": ODSlashCommand;
    "opendiscord:unpin": ODSlashCommand;
    "opendiscord:move": ODSlashCommand;
    "opendiscord:rename": ODSlashCommand;
    "opendiscord:add": ODSlashCommand;
    "opendiscord:remove": ODSlashCommand;
    "opendiscord:blacklist": ODSlashCommand;
    "opendiscord:stats": ODSlashCommand;
    "opendiscord:clear": ODSlashCommand;
    "opendiscord:autoclose": ODSlashCommand;
    "opendiscord:autodelete": ODSlashCommand;
    "opendiscord:topic": ODSlashCommand;
    "opendiscord:priority": ODSlashCommand;
    "opendiscord:transfer": ODSlashCommand;
}
/**## ODSlashCommandManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODSlashCommandManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.client.slashCommands`!
 */
export declare class ODSlashCommandManager_Default extends ODSlashCommandManager {
    get<SlashCommandId extends keyof ODSlashCommandManagerIds_Default>(id: SlashCommandId): ODSlashCommandManagerIds_Default[SlashCommandId];
    get(id: ODValidId): ODSlashCommand | null;
    remove<SlashCommandId extends keyof ODSlashCommandManagerIds_Default>(id: SlashCommandId): ODSlashCommandManagerIds_Default[SlashCommandId];
    remove(id: ODValidId): ODSlashCommand | null;
    exists(id: keyof ODSlashCommandManagerIds_Default): boolean;
    exists(id: ODValidId): boolean;
    onInteraction(commandName: keyof ODSlashCommandManagerIds_Default, callback: ODSlashCommandInteractionCallback): void;
    onInteraction(commandName: string | RegExp, callback: ODSlashCommandInteractionCallback): void;
}
/**## ODTextCommandManagerIds_Default `interface`
 * This interface is a list of ids available in the `ODTextCommandManager_Default` class.
 * It's used to generate typescript declarations for this class.
 */
export interface ODTextCommandManagerIds_Default {
    "opendiscord:dump": ODTextCommand;
    "opendiscord:help": ODTextCommand;
    "opendiscord:panel": ODTextCommand;
    "opendiscord:close": ODTextCommand;
    "opendiscord:delete": ODTextCommand;
    "opendiscord:reopen": ODTextCommand;
    "opendiscord:claim": ODTextCommand;
    "opendiscord:unclaim": ODTextCommand;
    "opendiscord:pin": ODTextCommand;
    "opendiscord:unpin": ODTextCommand;
    "opendiscord:move": ODTextCommand;
    "opendiscord:rename": ODTextCommand;
    "opendiscord:add": ODTextCommand;
    "opendiscord:remove": ODTextCommand;
    "opendiscord:blacklist-view": ODTextCommand;
    "opendiscord:blacklist-add": ODTextCommand;
    "opendiscord:blacklist-remove": ODTextCommand;
    "opendiscord:blacklist-get": ODTextCommand;
    "opendiscord:stats-global": ODTextCommand;
    "opendiscord:stats-reset": ODTextCommand;
    "opendiscord:stats-ticket": ODTextCommand;
    "opendiscord:stats-user": ODTextCommand;
    "opendiscord:clear": ODTextCommand;
    "opendiscord:autoclose-disable": ODTextCommand;
    "opendiscord:autoclose-enable": ODTextCommand;
    "opendiscord:autodelete-disable": ODTextCommand;
    "opendiscord:autodelete-enable": ODTextCommand;
    "opendiscord:topic-set": ODTextCommand;
    "opendiscord:priority-set": ODTextCommand;
    "opendiscord:priority-get": ODTextCommand;
    "opendiscord:transfer": ODTextCommand;
}
/**## ODTextCommandManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODTextCommandManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.client.textCommands`!
 */
export declare class ODTextCommandManager_Default extends ODTextCommandManager {
    get<TextCommandId extends keyof ODTextCommandManagerIds_Default>(id: TextCommandId): ODTextCommandManagerIds_Default[TextCommandId];
    get(id: ODValidId): ODTextCommand | null;
    remove<TextCommandId extends keyof ODTextCommandManagerIds_Default>(id: TextCommandId): ODTextCommandManagerIds_Default[TextCommandId];
    remove(id: ODValidId): ODTextCommand | null;
    exists(id: keyof ODTextCommandManagerIds_Default): boolean;
    exists(id: ODValidId): boolean;
    onInteraction(commandPrefix: string, commandName: string | RegExp, callback: ODTextCommandInteractionCallback): void;
}
/**## ODContextMenuManagerIds_Default `interface`
 * This interface is a list of ids available in the `ODContextMenuManager_Default` class.
 * It's used to generate typescript declarations for this class.
 */
export interface ODContextMenuManagerIds_Default {
}
/**## ODContextMenuManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODContextMenuManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.client.contextMenus`!
 */
export declare class ODContextMenuManager_Default extends ODContextMenuManager {
    get<ContextMenuId extends keyof ODContextMenuManagerIds_Default>(id: ContextMenuId): ODContextMenuManagerIds_Default[ContextMenuId];
    get(id: ODValidId): ODContextMenu | null;
    remove<ContextMenuId extends keyof ODContextMenuManagerIds_Default>(id: ContextMenuId): ODContextMenuManagerIds_Default[ContextMenuId];
    remove(id: ODValidId): ODContextMenu | null;
    exists(id: keyof ODContextMenuManagerIds_Default): boolean;
    exists(id: ODValidId): boolean;
    onInteraction(menuName: keyof ODContextMenuManagerIds_Default, callback: ODContextMenuInteractionCallback): void;
    onInteraction(menuName: string | RegExp, callback: ODContextMenuInteractionCallback): void;
}
