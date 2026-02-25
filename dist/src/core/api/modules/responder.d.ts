import { ODManager, ODValidId, ODManagerData } from "./base";
import * as discord from "discord.js";
import { ODWorkerManager, ODWorkerCallback } from "./worker";
import { ODDebugger } from "./console";
import { ODClientManager, ODContextMenu, ODSlashCommand, ODTextCommand, ODTextCommandInteractionOption } from "./client";
import { ODDropdownData, ODMessageBuildResult, ODMessageBuildSentResult, ODModalBuildResult } from "./builder";
/**## ODResponderImplementation `class`
 * This is an Open Ticket responder implementation.
 *
 * It is a basic implementation of the `ODWorkerManager` used by all `ODResponder` classes.
 *
 * This class can't be used stand-alone & needs to be extended from!
 */
export declare class ODResponderImplementation<Instance, Source extends string, Params> extends ODManagerData {
    /**The manager that has all workers of this implementation */
    workers: ODWorkerManager<Instance, Source, Params>;
    /**The `commandName` or `customId` needs to match this string or regex for this responder to be executed. */
    match: string | RegExp;
    constructor(id: ODValidId, match: string | RegExp, callback?: ODWorkerCallback<Instance, Source, Params>, priority?: number, callbackId?: ODValidId);
    /**Execute all workers & return the result. */
    respond(instance: Instance, source: Source, params: Params): Promise<void>;
}
/**## ODResponderTimeoutErrorCallback `type`
 * This is the callback for the responder timeout function. It will be executed when something went wrong or the action takes too much time.
 */
export type ODResponderTimeoutErrorCallback<Instance, Source extends "slash" | "text" | "button" | "dropdown" | "modal" | "other" | "context-menu" | "autocomplete"> = (instance: Instance, source: Source) => void | Promise<void>;
/**## ODResponderManager `class`
 * This is an Open Ticket responder manager.
 *
 * It contains all Open Ticket responders. Responders can respond to an interaction, button, dropdown, modal or command.
 *
 * Using the Open Ticket responder system has a few advantages compared to vanilla discord.js:
 * - plugins can extend/edit replies
 * - automatically reply on error
 * - independent workers (with priority)
 * - fail-safe design using try-catch
 * - write code once => reply to both slash & text commands at the same time!
 * - know where the request came from & parse options/subcommands & without errors!
 * - And so much more!
 */
export declare class ODResponderManager {
    /**A manager for all (text & slash) command responders. */
    commands: ODCommandResponderManager;
    /**A manager for all button responders. */
    buttons: ODButtonResponderManager;
    /**A manager for all dropdown/select menu responders. */
    dropdowns: ODDropdownResponderManager;
    /**A manager for all modal responders. */
    modals: ODModalResponderManager;
    /**A manager for all context menu responders. */
    contextMenus: ODContextMenuResponderManager;
    /**A manager for all autocomplete responders. */
    autocomplete: ODAutocompleteResponderManager;
    constructor(debug: ODDebugger, client: ODClientManager);
}
/**## ODCommandResponderManager `class`
 * This is an Open Ticket command responder manager.
 *
 * It contains all Open Ticket command responders. These can respond to text & slash commands.
 *
 * Using the Open Ticket responder system has a few advantages compared to vanilla discord.js:
 * - plugins can extend/edit replies
 * - automatically reply on error
 * - independent workers (with priority)
 * - fail-safe design using try-catch
 * - write code once => reply to both slash & text commands at the same time!
 * - know where the request came from & parse options/subcommands & without errors!
 * - And so much more!
 */
export declare class ODCommandResponderManager extends ODManager<ODCommandResponder<"slash" | "text", any>> {
    #private;
    constructor(debug: ODDebugger, debugname: string, client: ODClientManager);
    /**Set the message to send when the response times out! */
    setTimeoutErrorCallback(callback: ODResponderTimeoutErrorCallback<ODCommandResponderInstance, "slash" | "text"> | null, ms: number | null): void;
    add(data: ODCommandResponder<"slash" | "text", any>, overwrite?: boolean): boolean;
}
/**## ODCommandResponderInstanceOptions `class`
 * This is an Open Ticket command responder instance options manager.
 *
 * This class will manage all options & subcommands from slash & text commands.
 */
export declare class ODCommandResponderInstanceOptions {
    #private;
    constructor(interaction: discord.ChatInputCommandInteraction | discord.Message, cmd: ODSlashCommand | ODTextCommand, options?: ODTextCommandInteractionOption[]);
    /**Get a string option. */
    getString(name: string, required: true): string;
    getString(name: string, required: false): string | null;
    /**Get a boolean option. */
    getBoolean(name: string, required: true): boolean;
    getBoolean(name: string, required: false): boolean | null;
    /**Get a number option. */
    getNumber(name: string, required: true): number;
    getNumber(name: string, required: false): number | null;
    /**Get a channel option. */
    getChannel(name: string, required: true): discord.TextChannel | discord.VoiceChannel | discord.StageChannel | discord.NewsChannel | discord.MediaChannel | discord.ForumChannel | discord.CategoryChannel;
    getChannel(name: string, required: false): discord.TextChannel | discord.VoiceChannel | discord.StageChannel | discord.NewsChannel | discord.MediaChannel | discord.ForumChannel | discord.CategoryChannel | null;
    /**Get a role option. */
    getRole(name: string, required: true): discord.Role;
    getRole(name: string, required: false): discord.Role | null;
    /**Get a user option. */
    getUser(name: string, required: true): discord.User;
    getUser(name: string, required: false): discord.User | null;
    /**Get a guild member option. */
    getGuildMember(name: string, required: true): discord.GuildMember;
    getGuildMember(name: string, required: false): discord.GuildMember | null;
    /**Get a mentionable option. */
    getMentionable(name: string, required: true): discord.User | discord.GuildMember | discord.Role;
    getMentionable(name: string, required: false): discord.User | discord.GuildMember | discord.Role | null;
    /**Get a subgroup. */
    getSubGroup(): string | null;
    /**Get a subcommand. */
    getSubCommand(): string | null;
}
/**## ODCommandResponderInstance `class`
 * This is an Open Ticket command responder instance.
 *
 * An instance is an active slash interaction or used text command. You can reply to the command using `reply()` for both slash & text commands.
 */
export declare class ODCommandResponderInstance {
    /**The interaction which is the source of this instance. */
    interaction: discord.ChatInputCommandInteraction | discord.Message;
    /**The command wich is the source of this instance. */
    cmd: ODSlashCommand | ODTextCommand;
    /**The type/source of instance. (from text or slash command) */
    type: "message" | "interaction";
    /**Did a worker already reply to this instance/interaction? */
    didReply: boolean;
    /**The manager for all options of this command. */
    options: ODCommandResponderInstanceOptions;
    /**The user who triggered this command. */
    user: discord.User;
    /**The guild member who triggered this command. */
    member: discord.GuildMember | null;
    /**The guild where this command was triggered. */
    guild: discord.Guild | null;
    /**The channel where this command was triggered. */
    channel: discord.TextBasedChannel;
    constructor(interaction: discord.ChatInputCommandInteraction | discord.Message, cmd: ODSlashCommand | ODTextCommand, errorCallback: ODResponderTimeoutErrorCallback<ODCommandResponderInstance, "slash" | "text"> | null, timeoutMs: number | null, options?: ODTextCommandInteractionOption[]);
    /**Reply to this command. */
    reply(msg: ODMessageBuildResult): Promise<ODMessageBuildSentResult<boolean>>;
    /**Defer this command. */
    defer(ephemeral: boolean): Promise<boolean>;
    /**Show a modal as reply to this command. */
    modal(modal: ODModalBuildResult): Promise<boolean>;
}
/**## ODCommandResponder `class`
 * This is an Open Ticket command responder.
 *
 * This class manages all workers which are executed when the related command is triggered.
 */
export declare class ODCommandResponder<Source extends "slash" | "text", Params> extends ODResponderImplementation<ODCommandResponderInstance, Source, Params> {
    /**The prefix of the text command needs to match this */
    prefix: string;
    constructor(id: ODValidId, prefix: string, match: string | RegExp, callback?: ODWorkerCallback<ODCommandResponderInstance, Source, Params>, priority?: number, callbackId?: ODValidId);
    /**Respond to this command */
    respond(instance: ODCommandResponderInstance, source: Source, params: Params): Promise<void>;
}
/**## ODButtonResponderManager `class`
 * This is an Open Ticket button responder manager.
 *
 * It contains all Open Ticket button responders. These can respond to button interactions.
 *
 * Using the Open Ticket responder system has a few advantages compared to vanilla discord.js:
 * - plugins can extend/edit replies
 * - automatically reply on error
 * - independent workers (with priority)
 * - fail-safe design using try-catch
 * - know where the request came from!
 * - And so much more!
 */
export declare class ODButtonResponderManager extends ODManager<ODButtonResponder<"button", any>> {
    #private;
    constructor(debug: ODDebugger, debugname: string, client: ODClientManager);
    /**Set the message to send when the response times out! */
    setTimeoutErrorCallback(callback: ODResponderTimeoutErrorCallback<ODButtonResponderInstance, "button"> | null, ms: number | null): void;
    add(data: ODButtonResponder<"button", any>, overwrite?: boolean): boolean;
}
/**## ODButtonResponderInstance `class`
 * This is an Open Ticket button responder instance.
 *
 * An instance is an active button interaction. You can reply to the button using `reply()`.
 */
export declare class ODButtonResponderInstance {
    /**The interaction which is the source of this instance. */
    interaction: discord.ButtonInteraction;
    /**Did a worker already reply to this instance/interaction? */
    didReply: boolean;
    /**The user who triggered this button. */
    user: discord.User;
    /**The guild member who triggered this button. */
    member: discord.GuildMember | null;
    /**The guild where this button was triggered. */
    guild: discord.Guild | null;
    /**The channel where this button was triggered. */
    channel: discord.TextBasedChannel;
    /**The message this button originates from. */
    message: discord.Message;
    constructor(interaction: discord.ButtonInteraction, errorCallback: ODResponderTimeoutErrorCallback<ODButtonResponderInstance, "button"> | null, timeoutMs: number | null);
    /**Reply to this button. */
    reply(msg: ODMessageBuildResult): Promise<ODMessageBuildSentResult<boolean>>;
    /**Update the message of this button. */
    update(msg: ODMessageBuildResult): Promise<ODMessageBuildSentResult<boolean>>;
    /**Defer this button. */
    defer(type: "reply" | "update", ephemeral: boolean): Promise<boolean>;
    /**Show a modal as reply to this button. */
    modal(modal: ODModalBuildResult): Promise<boolean>;
    /**Get a component from the original message of this button. */
    getMessageComponent(type: "button", id: string | RegExp): discord.ButtonComponent | null;
    getMessageComponent(type: "string-dropdown", id: string | RegExp): discord.StringSelectMenuComponent | null;
    getMessageComponent(type: "user-dropdown", id: string | RegExp): discord.UserSelectMenuComponent | null;
    getMessageComponent(type: "channel-dropdown", id: string | RegExp): discord.ChannelSelectMenuComponent | null;
    getMessageComponent(type: "role-dropdown", id: string | RegExp): discord.RoleSelectMenuComponent | null;
    getMessageComponent(type: "mentionable-dropdown", id: string | RegExp): discord.MentionableSelectMenuComponent | null;
    /**Get the first embed of the original message if it exists. */
    getMessageEmbed(): discord.Embed | null;
}
/**## ODButtonResponder `class`
 * This is an Open Ticket button responder.
 *
 * This class manages all workers which are executed when the related button is triggered.
 */
export declare class ODButtonResponder<Source extends string, Params> extends ODResponderImplementation<ODButtonResponderInstance, Source, Params> {
    /**Respond to this button */
    respond(instance: ODButtonResponderInstance, source: Source, params: Params): Promise<void>;
}
/**## ODDropdownResponderManager `class`
 * This is an Open Ticket dropdown responder manager.
 *
 * It contains all Open Ticket dropdown responders. These can respond to dropdown interactions.
 *
 * Using the Open Ticket responder system has a few advantages compared to vanilla discord.js:
 * - plugins can extend/edit replies
 * - automatically reply on error
 * - independent workers (with priority)
 * - fail-safe design using try-catch
 * - know where the request came from!
 * - And so much more!
 */
export declare class ODDropdownResponderManager extends ODManager<ODDropdownResponder<"dropdown", any>> {
    #private;
    constructor(debug: ODDebugger, debugname: string, client: ODClientManager);
    /**Set the message to send when the response times out! */
    setTimeoutErrorCallback(callback: ODResponderTimeoutErrorCallback<ODDropdownResponderInstance, "dropdown"> | null, ms: number | null): void;
    add(data: ODDropdownResponder<"dropdown", any>, overwrite?: boolean): boolean;
}
/**## ODDropdownResponderInstanceValues `class`
 * This is an Open Ticket dropdown responder instance values manager.
 *
 * This class will manage all values from the dropdowns & select menus.
 */
export declare class ODDropdownResponderInstanceValues {
    #private;
    constructor(interaction: discord.AnySelectMenuInteraction, type: ODDropdownData["type"]);
    /**Get the selected values. */
    getStringValues(): string[];
    /**Get the selected roles. */
    getRoleValues(): Promise<discord.Role[]>;
    /**Get the selected users. */
    getUserValues(): Promise<discord.User[]>;
    /**Get the selected channels. */
    getChannelValues(): Promise<discord.GuildBasedChannel[]>;
}
/**## ODDropdownResponderInstance `class`
 * This is an Open Ticket dropdown responder instance.
 *
 * An instance is an active dropdown interaction. You can reply to the dropdown using `reply()`.
 */
export declare class ODDropdownResponderInstance {
    /**The interaction which is the source of this instance. */
    interaction: discord.AnySelectMenuInteraction;
    /**Did a worker already reply to this instance/interaction? */
    didReply: boolean;
    /**The dropdown type. */
    type: ODDropdownData["type"];
    /**The manager for all values of this dropdown. */
    values: ODDropdownResponderInstanceValues;
    /**The user who triggered this dropdown. */
    user: discord.User;
    /**The guild member who triggered this dropdown. */
    member: discord.GuildMember | null;
    /**The guild where this dropdown was triggered. */
    guild: discord.Guild | null;
    /**The channel where this dropdown was triggered. */
    channel: discord.TextBasedChannel;
    /**The message this dropdown originates from. */
    message: discord.Message;
    constructor(interaction: discord.AnySelectMenuInteraction, errorCallback: ODResponderTimeoutErrorCallback<ODDropdownResponderInstance, "dropdown"> | null, timeoutMs: number | null);
    /**Reply to this dropdown. */
    reply(msg: ODMessageBuildResult): Promise<ODMessageBuildSentResult<boolean>>;
    /**Update the message of this dropdown. */
    update(msg: ODMessageBuildResult): Promise<ODMessageBuildSentResult<boolean>>;
    /**Defer this dropdown. */
    defer(type: "reply" | "update", ephemeral: boolean): Promise<boolean>;
    /**Show a modal as reply to this dropdown. */
    modal(modal: ODModalBuildResult): Promise<boolean>;
    /**Get a component from the original message of this dropdown. */
    getMessageComponent(type: "button", id: string | RegExp): discord.ButtonComponent | null;
    getMessageComponent(type: "string-dropdown", id: string | RegExp): discord.StringSelectMenuComponent | null;
    getMessageComponent(type: "user-dropdown", id: string | RegExp): discord.UserSelectMenuComponent | null;
    getMessageComponent(type: "channel-dropdown", id: string | RegExp): discord.ChannelSelectMenuComponent | null;
    getMessageComponent(type: "role-dropdown", id: string | RegExp): discord.RoleSelectMenuComponent | null;
    getMessageComponent(type: "mentionable-dropdown", id: string | RegExp): discord.MentionableSelectMenuComponent | null;
    /**Get the first embed of the original message if it exists. */
    getMessageEmbed(): discord.Embed | null;
}
/**## ODDropdownResponder `class`
 * This is an Open Ticket dropdown responder.
 *
 * This class manages all workers which are executed when the related dropdown is triggered.
 */
export declare class ODDropdownResponder<Source extends string, Params> extends ODResponderImplementation<ODDropdownResponderInstance, Source, Params> {
    /**Respond to this dropdown */
    respond(instance: ODDropdownResponderInstance, source: Source, params: Params): Promise<void>;
}
/**## ODModalResponderManager `class`
 * This is an Open Ticket modal responder manager.
 *
 * It contains all Open Ticket modal responders. These can respond to modal interactions.
 *
 * Using the Open Ticket responder system has a few advantages compared to vanilla discord.js:
 * - plugins can extend/edit replies
 * - automatically reply on error
 * - independent workers (with priority)
 * - fail-safe design using try-catch
 * - know where the request came from!
 * - And so much more!
 */
export declare class ODModalResponderManager extends ODManager<ODModalResponder<"modal", any>> {
    #private;
    constructor(debug: ODDebugger, debugname: string, client: ODClientManager);
    /**Set the message to send when the response times out! */
    setTimeoutErrorCallback(callback: ODResponderTimeoutErrorCallback<ODModalResponderInstance, "modal"> | null, ms: number | null): void;
    add(data: ODModalResponder<"modal", any>, overwrite?: boolean): boolean;
}
/**## ODModalResponderInstanceValues `class`
 * This is an Open Ticket modal responder instance values manager.
 *
 * This class will manage all fields from the modals.
 */
export declare class ODModalResponderInstanceValues {
    #private;
    constructor(interaction: discord.ModalSubmitInteraction);
    /**Get the value of a text field. */
    getTextField(name: string, required: true): string;
    getTextField(name: string, required: false): string | null;
}
/**## ODModalResponderInstance `class`
 * This is an Open Ticket modal responder instance.
 *
 * An instance is an active modal interaction. You can reply to the modal using `reply()`.
 */
export declare class ODModalResponderInstance {
    /**The interaction which is the source of this instance. */
    interaction: discord.ModalSubmitInteraction;
    /**Did a worker already reply to this instance/interaction? */
    didReply: boolean;
    /**The manager for all fields of this modal. */
    values: ODModalResponderInstanceValues;
    /**The user who triggered this modal. */
    user: discord.User;
    /**The guild member who triggered this modal. */
    member: discord.GuildMember | null;
    /**The guild where this modal was triggered. */
    guild: discord.Guild | null;
    /**The channel where this modal was triggered. */
    channel: discord.TextBasedChannel | null;
    constructor(interaction: discord.ModalSubmitInteraction, errorCallback: ODResponderTimeoutErrorCallback<ODModalResponderInstance, "modal"> | null, timeoutMs: number | null);
    /**Reply to this modal. */
    reply(msg: ODMessageBuildResult): Promise<ODMessageBuildSentResult<boolean>>;
    /**Update the message of this modal. */
    update(msg: ODMessageBuildResult): Promise<ODMessageBuildSentResult<boolean>>;
    /**Defer this modal. */
    defer(type: "reply" | "update", ephemeral: boolean): Promise<boolean>;
}
/**## ODModalResponder `class`
 * This is an Open Ticket modal responder.
 *
 * This class manages all workers which are executed when the related modal is triggered.
 */
export declare class ODModalResponder<Source extends string, Params> extends ODResponderImplementation<ODModalResponderInstance, Source, Params> {
    /**Respond to this modal */
    respond(instance: ODModalResponderInstance, source: Source, params: Params): Promise<void>;
}
/**## ODContextMenuResponderManager `class`
 * This is an Open Ticket context menu responder manager.
 *
 * It contains all Open Ticket context menu responders. These can respond to user/message context menu interactions.
 *
 * Using the Open Ticket responder system has a few advantages compared to vanilla discord.js:
 * - plugins can extend/edit replies
 * - automatically reply on error
 * - independent workers (with priority)
 * - fail-safe design using try-catch
 * - know where the request came from!
 * - And so much more!
 */
export declare class ODContextMenuResponderManager extends ODManager<ODContextMenuResponder<"context-menu", any>> {
    #private;
    constructor(debug: ODDebugger, debugname: string, client: ODClientManager);
    /**Set the message to send when the response times out! */
    setTimeoutErrorCallback(callback: ODResponderTimeoutErrorCallback<ODContextMenuResponderInstance, "context-menu"> | null, ms: number | null): void;
    add(data: ODContextMenuResponder<"context-menu", any>, overwrite?: boolean): boolean;
}
/**## ODContextMenuResponderInstance `class`
 * This is an Open Ticket context menu responder instance.
 *
 * An instance is an active context menu interaction. You can reply to the context menu using `reply()`.
 */
export declare class ODContextMenuResponderInstance {
    /**The interaction which is the source of this instance. */
    interaction: discord.ContextMenuCommandInteraction;
    /**Did a worker already reply to this instance/interaction? */
    didReply: boolean;
    /**The context menu wich is the source of this instance. */
    menu: ODContextMenu;
    /**The user who triggered this context menu. */
    user: discord.User;
    /**The guild member who triggered this context menu. */
    member: discord.GuildMember | null;
    /**The guild where this context menu was triggered. */
    guild: discord.Guild | null;
    /**The channel where this context menu was triggered. */
    channel: discord.TextBasedChannel;
    /**The target of this context menu (user or message). */
    target: discord.Message | discord.User;
    constructor(interaction: discord.ContextMenuCommandInteraction, menu: ODContextMenu, errorCallback: ODResponderTimeoutErrorCallback<ODContextMenuResponderInstance, "context-menu"> | null, timeoutMs: number | null);
    /**Reply to this context menu. */
    reply(msg: ODMessageBuildResult): Promise<ODMessageBuildSentResult<boolean>>;
    /**Update the message of this context menu. */
    update(msg: ODMessageBuildResult): Promise<ODMessageBuildSentResult<boolean>>;
    /**Defer this context menu. */
    defer(type: "reply", ephemeral: boolean): Promise<boolean>;
    /**Show a modal as reply to this context menu. */
    modal(modal: ODModalBuildResult): Promise<boolean>;
}
/**## ODContextMenuResponder `class`
 * This is an Open Ticket context menu responder.
 *
 * This class manages all workers which are executed when the related context menu is triggered.
 */
export declare class ODContextMenuResponder<Source extends string, Params> extends ODResponderImplementation<ODContextMenuResponderInstance, Source, Params> {
    /**Respond to this button */
    respond(instance: ODContextMenuResponderInstance, source: Source, params: Params): Promise<void>;
}
/**## ODAutocompleteResponderManager `class`
 * This is an Open Ticket autocomplete responder manager.
 *
 * It contains all Open Ticket autocomplete responders. These can respond to autocomplete interactions.
 *
 * Using the Open Ticket responder system has a few advantages compared to vanilla discord.js:
 * - plugins can extend/edit replies
 * - automatically reply on error
 * - independent workers (with priority)
 * - fail-safe design using try-catch
 * - know where the request came from!
 * - And so much more!
 */
export declare class ODAutocompleteResponderManager extends ODManager<ODAutocompleteResponder<"autocomplete", any>> {
    #private;
    constructor(debug: ODDebugger, debugname: string, client: ODClientManager);
    /**Set the message to send when the response times out! */
    setTimeoutErrorCallback(callback: ODResponderTimeoutErrorCallback<ODAutocompleteResponderInstance, "autocomplete"> | null, ms: number | null): void;
    add(data: ODAutocompleteResponder<"autocomplete", any>, overwrite?: boolean): boolean;
}
/**## ODAutocompleteResponderInstance `class`
 * This is an Open Ticket autocomplete responder instance.
 *
 * An instance is an active autocomplete interaction. You can reply to the autocomplete using `reply()`.
 */
export declare class ODAutocompleteResponderInstance {
    /**The interaction which is the source of this instance. */
    interaction: discord.AutocompleteInteraction;
    /**Did a worker already respond to this instance/interaction? */
    didRespond: boolean;
    /**The user who triggered this autocomplete. */
    user: discord.User;
    /**The guild member who triggered this autocomplete. */
    member: discord.GuildMember | null;
    /**The guild where this autocomplete was triggered. */
    guild: discord.Guild | null;
    /**The channel where this autocomplete was triggered. */
    channel: discord.TextBasedChannel;
    /**The target slash command option of this autocomplete. */
    target: discord.AutocompleteFocusedOption;
    constructor(interaction: discord.AutocompleteInteraction, errorCallback: ODResponderTimeoutErrorCallback<ODAutocompleteResponderInstance, "autocomplete"> | null, timeoutMs: number | null);
    /**Reply to this autocomplete. */
    autocomplete(choices: (string | discord.ApplicationCommandOptionChoiceData)[]): Promise<{
        success: boolean;
    }>;
    /**Reply to this autocomplete, but filter choices based on the input of the user. */
    filteredAutocomplete(choices: (string | discord.ApplicationCommandOptionChoiceData)[]): Promise<{
        success: boolean;
    }>;
}
/**## ODAutocompleteResponder `class`
 * This is an Open Ticket autocomplete responder.
 *
 * This class manages all workers which are executed when the related autocomplete is triggered.
 */
export declare class ODAutocompleteResponder<Source extends string, Params> extends ODResponderImplementation<ODAutocompleteResponderInstance, Source, Params> {
    /**The slash command of the autocomplete should match the following regex. */
    cmdMatch: string | RegExp;
    constructor(id: ODValidId, cmdMatch: string | RegExp, match: string | RegExp, callback?: ODWorkerCallback<ODAutocompleteResponderInstance, Source, Params>, priority?: number, callbackId?: ODValidId);
    /**Respond to this autocomplete interaction. */
    respond(instance: ODAutocompleteResponderInstance, source: Source, params: Params): Promise<void>;
}
