import { ODManager, ODManagerData, ODValidId } from "./base";
import * as discord from "discord.js";
import { ODDebugger } from "./console";
import { ODMessageBuildResult, ODMessageBuildSentResult } from "./builder";
import { ODManualProgressBar } from "./progressbar";
/**## ODClientIntents `type`
 * A list of intents required when inviting the bot.
 */
export type ODClientIntents = ("Guilds" | "GuildMembers" | "GuildModeration" | "GuildEmojisAndStickers" | "GuildIntegrations" | "GuildWebhooks" | "GuildInvites" | "GuildVoiceStates" | "GuildPresences" | "GuildMessages" | "GuildMessageReactions" | "GuildMessageTyping" | "DirectMessages" | "DirectMessageReactions" | "DirectMessageTyping" | "MessageContent" | "GuildScheduledEvents" | "AutoModerationConfiguration" | "AutoModerationExecution");
/**## ODClientPriviligedIntents `type`
 * A list of priviliged intents required to be enabled in the developer portal.
 */
export type ODClientPriviligedIntents = ("GuildMembers" | "MessageContent" | "Presence");
/**## ODClientPartials `type`
 * A list of partials required for the bot to work. (`Message` & `Channel` are for receiving DM messages from uncached channels)
 */
export type ODClientPartials = ("User" | "Channel" | "GuildMember" | "Message" | "Reaction" | "GuildScheduledEvent" | "ThreadMember");
/**## ODClientPermissions `type`
 * A list of permissions required in the server that the bot is active in.
 */
export type ODClientPermissions = ("CreateInstantInvite" | "KickMembers" | "BanMembers" | "Administrator" | "ManageChannels" | "ManageGuild" | "AddReactions" | "ViewAuditLog" | "PrioritySpeaker" | "Stream" | "ViewChannel" | "SendMessages" | "SendTTSMessages" | "ManageMessages" | "EmbedLinks" | "AttachFiles" | "ReadMessageHistory" | "MentionEveryone" | "UseExternalEmojis" | "ViewGuildInsights" | "Connect" | "Speak" | "MuteMembers" | "DeafenMembers" | "MoveMembers" | "UseVAD" | "ChangeNickname" | "ManageNicknames" | "ManageRoles" | "ManageWebhooks" | "ManageGuildExpressions" | "UseApplicationCommands" | "RequestToSpeak" | "ManageEvents" | "ManageThreads" | "CreatePublicThreads" | "CreatePrivateThreads" | "UseExternalStickers" | "SendMessagesInThreads" | "UseEmbeddedActivities" | "ModerateMembers" | "ViewCreatorMonetizationAnalytics" | "UseSoundboard" | "UseExternalSounds" | "SendVoiceMessages");
/**## ODClientManager `class`
 * This is an Open Ticket client manager.
 *
 * It is responsible for managing the discord.js client. Here, you can set the status, register slash commands and much more!
 *
 * If you want, you can also listen for custom events on the `ODClientManager.client` variable (`discord.Client`)
 */
export declare class ODClientManager {
    #private;
    /**List of required bot intents. Add intents to this list using the `onClientLoad` event. */
    intents: ODClientIntents[];
    /**List of required bot privileged intents. Add intents to this list using the `onClientLoad` event. */
    privileges: ODClientPriviligedIntents[];
    /**List of required bot partials. Add intents to this list using the `onClientLoad` event. **❌ Only use when neccessery!** */
    partials: ODClientPartials[];
    /**List of required bot permissions. Add permissions to this list using the `onClientLoad` event. */
    permissions: ODClientPermissions[];
    /**The discord bot token, empty by default. */
    set token(value: string);
    get token(): string;
    /**The discord.js `discord.Client`. Only use it when initiated! */
    client: discord.Client<true>;
    /**The discord.js REST client. Used for stuff that discord.js can't handle :) */
    rest: discord.REST;
    /**Is the bot initiated? */
    initiated: boolean;
    /**Is the bot logged in? */
    loggedIn: boolean;
    /**Is the bot ready? */
    ready: boolean;
    /**The main server of the bot. Provided by serverId in the config */
    mainServer: discord.Guild | null;
    /**(❌ DO NOT OVERWRITE ❌) Internal Open Ticket function to continue the startup when the client is ready! */
    readyListener: (() => Promise<void>) | null;
    /**The status manager is responsible for setting the bot status. */
    activity: ODClientActivityManager;
    /**The slash command manager is responsible for all slash commands & their events inside the bot. */
    slashCommands: ODSlashCommandManager;
    /**The text command manager is responsible for all text commands & their events inside the bot. */
    textCommands: ODTextCommandManager;
    /**The context menu manager is responsible for all context menus & their events inside the bot. */
    contextMenus: ODContextMenuManager;
    /**The autocomplete manager is responsible for all autocomplete events inside the bot. */
    autocompletes: ODAutocompleteManager;
    constructor(debug: ODDebugger);
    /**Initiate the `client` variable & add the intents & partials to the bot. */
    initClient(): void;
    /**Get all servers the bot is part of. */
    getGuilds(): Promise<discord.Guild[]>;
    /**Check if the bot is in a specific guild */
    checkBotInGuild(guild: discord.Guild): boolean;
    /**Check if a specific guild has all required permissions (or `Administrator`) */
    checkGuildPerms(guild: discord.Guild): boolean;
    /**Log-in with a discord auth token. Rejects returns `false` using 'softErrors' on failure. */
    login(softErrors?: boolean): Promise<boolean>;
    /**A simplified shortcut to get a `discord.User` :) */
    fetchUser(id: string): Promise<discord.User | null>;
    /**A simplified shortcut to get a `discord.Guild` :) */
    fetchGuild(id: string): Promise<discord.Guild | null>;
    /**A simplified shortcut to get a `discord.Channel` :) */
    fetchChannel(id: string): Promise<discord.Channel | null>;
    /**A simplified shortcut to get a `discord.GuildBasedChannel` :) */
    fetchGuildChannel(guildId: string | discord.Guild, id: string): Promise<discord.GuildBasedChannel | null>;
    /**A simplified shortcut to get a `discord.TextChannel` :) */
    fetchGuildTextChannel(guildId: string | discord.Guild, id: string): Promise<discord.TextChannel | null>;
    /**A simplified shortcut to get a `discord.CategoryChannel` :) */
    fetchGuildCategoryChannel(guildId: string | discord.Guild, id: string): Promise<discord.CategoryChannel | null>;
    /**A simplified shortcut to get a `discord.GuildMember` :) */
    fetchGuildMember(guildId: string | discord.Guild, id: string): Promise<discord.GuildMember | null>;
    /**A simplified shortcut to get a `discord.Role` :) */
    fetchGuildRole(guildId: string | discord.Guild, id: string): Promise<discord.Role | null>;
    /**A simplified shortcut to get a `discord.Message` :) */
    fetchGuildChannelMessage(guildId: string | discord.Guild, channelId: string | discord.TextChannel, id: string): Promise<discord.Message<true> | null>;
    fetchGuildChannelMessage(channelId: discord.TextChannel, id: string): Promise<discord.Message<true> | null>;
    /**A simplified shortcut to send a DM to a user :) */
    sendUserDm(user: string | discord.User, message: ODMessageBuildResult): Promise<ODMessageBuildSentResult<false>>;
}
/**## ODClientActivityType `type`
 * Possible activity types for the bot.
 */
export type ODClientActivityType = ("playing" | "listening" | "watching" | "custom" | false);
/**## ODClientActivityMode `type`
 * Possible activity statuses for the bot.
 */
export type ODClientActivityMode = ("online" | "invisible" | "idle" | "dnd");
/**## ODClientActivityManager `class`
 * This is an Open Ticket client activity manager.
 *
 * It's responsible for managing the client status. Here, you can set the activity & status of the bot.
 *
 * It also has a built-in refresh function, so the status will refresh every 10 minutes to keep it visible.
 */
export declare class ODClientActivityManager {
    #private;
    /**Copy of discord.js client */
    manager: ODClientManager;
    /**The current status type */
    type: ODClientActivityType;
    /**The current status text */
    text: string;
    /**The current status mode */
    mode: ODClientActivityMode;
    /**Additional state text */
    state: string;
    /**The timer responsible for refreshing the status. Stop it using `clearInterval(interval)` */
    interval?: NodeJS.Timeout;
    /**status refresh interval in seconds (5 minutes by default)*/
    refreshInterval: number;
    /**Is the status already initiated? */
    initiated: boolean;
    constructor(debug: ODDebugger, manager: ODClientManager);
    /**Update the status. When already initiated, it can take up to 10min to see the updated status in discord. */
    setStatus(type: ODClientActivityType, text: string, mode: ODClientActivityMode, state: string, forceUpdate?: boolean): void;
    /**When initiating the status, the bot starts updating the status using `discord.js`. Returns `true` when successfull. */
    initStatus(): boolean;
    /**Get the status type (for displaying the status) */
    getStatusType(): "listening " | "playing " | "watching " | "";
}
/**## ODSlashCommandUniversalTranslation `interface`
 * A universal template for a slash command translation. (used in names & descriptions)
 *
 * Why universal? Both **existing slash commands** & **unregistered templates** can be converted to this type.
 */
export interface ODSlashCommandUniversalTranslation {
    /**The language code or locale of this language. */
    language: `${discord.Locale}`;
    /**The translation of the name in this language. */
    value: string;
}
/**## ODSlashCommandUniversalOptionChoice `interface`
 * A universal template for a slash command option choice. (used in `string` options)
 *
 * Why universal? Both **existing slash commands** & **unregistered templates** can be converted to this type.
 */
export interface ODSlashCommandUniversalOptionChoice {
    /**The name of this choice. */
    name: string;
    /**All localized names of this choice. */
    nameLocalizations: readonly ODSlashCommandUniversalTranslation[];
    /**The value of this choice. */
    value: string;
}
/**## ODSlashCommandUniversalOption `interface`
 * A universal template for a slash command option.
 *
 * Why universal? Both **existing slash commands** & **unregistered templates** can be converted to this type.
 */
export interface ODSlashCommandUniversalOption {
    /**The type of this option. */
    type: discord.ApplicationCommandOptionType;
    /**The name of this option. */
    name: string;
    /**All localized names of this option. */
    nameLocalizations: readonly ODSlashCommandUniversalTranslation[];
    /**The description of this option. */
    description: string;
    /**All localized descriptions of this option. */
    descriptionLocalizations: readonly ODSlashCommandUniversalTranslation[];
    /**Is this option required? */
    required: boolean;
    /**Is autocomplete enabled in this option? */
    autocomplete: boolean | null;
    /**Choices for this option (only when type is `string`) */
    choices: ODSlashCommandUniversalOptionChoice[];
    /**A list of sub-options for this option (only when type is `subCommand` or `subCommandGroup`) */
    options: readonly ODSlashCommandUniversalOption[];
    /**A list of allowed channel types for this option (only when type is `channel`) */
    channelTypes: readonly discord.ChannelType[];
    /**The minimum amount required for this option (only when type is `number` or `integer`) */
    minValue: number | null;
    /**The maximum amount required for this option (only when type is `number` or `integer`) */
    maxValue: number | null;
    /**The minimum length required for this option (only when type is `string`) */
    minLength: number | null;
    /**The maximum length required for this option (only when type is `string`) */
    maxLength: number | null;
}
/**## ODSlashCommandUniversalCommand `interface`
 * A universal template for a slash command.
 *
 * Why universal? Both **existing slash commands** & **unregistered templates** can be converted to this type.
 */
export interface ODSlashCommandUniversalCommand {
    /**The type of this command. (required => `ChatInput`) */
    type: discord.ApplicationCommandType.ChatInput;
    /**The name of this command. */
    name: string;
    /**All localized names of this command. */
    nameLocalizations: readonly ODSlashCommandUniversalTranslation[];
    /**The description of this command. */
    description: string;
    /**All localized descriptions of this command. */
    descriptionLocalizations: readonly ODSlashCommandUniversalTranslation[];
    /**The id of the guild this command is registered in. */
    guildId: string | null;
    /**Is this command for 18+ users only? */
    nsfw: boolean;
    /**A list of options for this command. */
    options: readonly ODSlashCommandUniversalOption[];
    /**A bitfield of the user permissions required to use this command. */
    defaultMemberPermissions: bigint;
    /**Is this command available in DM? */
    dmPermission: boolean;
    /**A list of contexts where you can install this command. */
    integrationTypes: readonly discord.ApplicationIntegrationType[];
    /**A list of contexts where you can use this command. */
    contexts: readonly discord.InteractionContextType[];
}
/**## ODSlashCommandBuilder `interface`
 * The builder for slash commands. Here you can add options to the command.
 */
export interface ODSlashCommandBuilder extends discord.ChatInputApplicationCommandData {
    /**This field is required in Open Ticket for future compatibility. */
    integrationTypes: discord.ApplicationIntegrationType[];
    /**This field is required in Open Ticket for future compatibility. */
    contexts: discord.InteractionContextType[];
}
/**## ODSlashCommandComparator `class`
 * A utility class to compare existing slash commands with newly registered ones.
 */
export declare class ODSlashCommandComparator {
    #private;
    /**Convert a `ODSlashCommandBuilder` to a universal Open Ticket slash command object for comparison. */
    convertBuilder(builder: ODSlashCommandBuilder, guildId: string | null): ODSlashCommandUniversalCommand | null;
    /**Convert a `discord.ApplicationCommand` to a universal Open Ticket slash command object for comparison. */
    convertCommand(cmd: discord.ApplicationCommand): ODSlashCommandUniversalCommand | null;
    /**Returns `true` when the 2 slash command options are the same. */
    compareOption(optA: ODSlashCommandUniversalOption, optB: ODSlashCommandUniversalOption): boolean;
    /**Returns `true` when the 2 slash commands are the same. */
    compare(cmdA: ODSlashCommandUniversalCommand, cmdB: ODSlashCommandUniversalCommand): boolean;
}
/**## ODSlashCommandInteractionCallback `type`
 * Callback for the slash command interaction listener.
 */
export type ODSlashCommandInteractionCallback = (interaction: discord.ChatInputCommandInteraction, cmd: ODSlashCommand) => void;
/**## ODSlashCommandRegisteredResult `type`
 * The result which will be returned when getting all (un)registered slash commands from the manager.
 */
export type ODSlashCommandRegisteredResult = {
    /**A list of all registered commands. */
    registered: {
        /**The instance (`ODSlashCommand`) from this command. */
        instance: ODSlashCommand;
        /**The (universal) slash command object/template of this command. */
        cmd: ODSlashCommandUniversalCommand;
        /**Does this command require an update? */
        requiresUpdate: boolean;
    }[];
    /**A list of all unregistered commands. */
    unregistered: {
        /**The instance (`ODSlashCommand`) from this command. */
        instance: ODSlashCommand;
        /**The (universal) slash command object/template of this command. */
        cmd: null;
        /**Does this command require an update? */
        requiresUpdate: true;
    }[];
    /**A list of all unused commands (not found in `ODSlashCommandManager`). */
    unused: {
        /**The instance (`ODSlashCommand`) from this command. */
        instance: null;
        /**The (universal) slash command object/template of this command. */
        cmd: ODSlashCommandUniversalCommand;
        /**Does this command require an update? */
        requiresUpdate: false;
    }[];
};
/**## ODSlashCommandManager `class`
 * This is an Open Ticket client slash manager.
 *
 * It's responsible for managing all the slash commands from the client.
 *
 * Here, you can add & remove slash commands & the bot will do the (de)registering.
 */
export declare class ODSlashCommandManager extends ODManager<ODSlashCommand> {
    #private;
    /**Refrerence to discord.js client. */
    manager: ODClientManager;
    /**Discord.js application commands manager. */
    commandManager: discord.ApplicationCommandManager | null;
    /**Set the soft limit for maximum amount of listeners. A warning will be shown when there are more listeners than this limit. */
    listenerLimit: number;
    /**A utility class used to compare 2 slash commands with each other. */
    comparator: ODSlashCommandComparator;
    constructor(debug: ODDebugger, manager: ODClientManager);
    /**Get all registered & unregistered slash commands. */
    getAllRegisteredCommands(guildId?: string): Promise<ODSlashCommandRegisteredResult>;
    /**Create all commands that are not registered yet.*/
    createNewCommands(instances: ODSlashCommand[], progress?: ODManualProgressBar): Promise<void>;
    /**Update all commands that are already registered. */
    updateExistingCommands(instances: ODSlashCommand[], progress?: ODManualProgressBar): Promise<void>;
    /**Remove all commands that are registered but unused by Open Ticket. */
    removeUnusedCommands(instances: ODSlashCommandUniversalCommand[], guildId?: string, progress?: ODManualProgressBar): Promise<void>;
    /**Create a slash command. **(SYSTEM ONLY)** => Use `ODSlashCommandManager` for registering commands the default way! */
    createCmd(cmd: ODSlashCommand): Promise<void>;
    /**Start listening to the discord.js client `interactionCreate` event. */
    startListeningToInteractions(): void;
    /**Callback on interaction from one or multiple slash commands. */
    onInteraction(commandName: string | RegExp, callback: ODSlashCommandInteractionCallback): void;
}
/**## ODSlashCommandUpdateFunction `type`
 * The function responsible for updating slash commands when they already exist.
 */
export type ODSlashCommandUpdateFunction = (command: ODSlashCommandUniversalCommand) => boolean;
/**## ODSlashCommand `class`
 * This is an Open Ticket slash command.
 *
 * When registered, you can listen for this command using the `ODCommandResponder`. The advantages of using this class for creating a slash command are:
 * - automatic option parsing (even for channels, users, roles & mentions)!
 * - automatic registration in discord.js
 * - error reporting to the user when the bot fails to respond
 * - plugins can extend this command
 * - the bot won't re-register the command when it already exists (except when requested)!
 *
 * And more!
 */
export declare class ODSlashCommand extends ODManagerData {
    /**The discord.js builder for this slash command. */
    builder: ODSlashCommandBuilder;
    /**The id of the guild this command is for. Null when not set. */
    guildId: string | null;
    /**Function to check if the slash command requires to be updated (when it already exists). */
    requiresUpdate: ODSlashCommandUpdateFunction | null;
    constructor(id: ODValidId, builder: ODSlashCommandBuilder, requiresUpdate?: ODSlashCommandUpdateFunction, guildId?: string);
    /**The name of this slash command. */
    get name(): string;
    set name(name: string);
}
/**## ODTextCommandBuilderBaseOptionType `type`
 * The types available in the text command option builder.
 */
export type ODTextCommandBuilderBaseOptionType = "string" | "number" | "boolean" | "user" | "guildmember" | "role" | "mentionable" | "channel";
/**## ODTextCommandBuilderBaseOption `interface`
 * The default option builder for text commands.
 */
export interface ODTextCommandBuilderBaseOption {
    /**The name of this option */
    name: string;
    /**The type of this option */
    type: ODTextCommandBuilderBaseOptionType;
    /**Is this option required? (optional options can only exist at the end of the command!) */
    required?: boolean;
}
/**## ODTextCommandBuilderStringOption `interface`
 * The string option builder for text commands.
 */
export interface ODTextCommandBuilderStringOption extends ODTextCommandBuilderBaseOption {
    type: "string";
    /**Set the maximum length of this string */
    maxLength?: number;
    /**Set the minimum length of this string */
    minLength?: number;
    /**The string needs to match this regex or it will be invalid */
    regex?: RegExp;
    /**The string needs to match one of these choices or it will be invalid */
    choices?: string[];
    /**When this is the last option, allow this string to contain spaces */
    allowSpaces?: boolean;
}
/**## ODTextCommandBuilderNumberOption `interface`
 * The number option builder for text commands.
 */
export interface ODTextCommandBuilderNumberOption extends ODTextCommandBuilderBaseOption {
    type: "number";
    /**The number can't be higher than this value */
    max?: number;
    /**The number can't be lower than this value */
    min?: number;
    /**Allow the number to be negative */
    allowNegative?: boolean;
    /**Allow the number to be positive */
    allowPositive?: boolean;
    /**Allow the number to be zero */
    allowZero?: boolean;
    /**Allow a number with decimal */
    allowDecimal?: boolean;
}
/**## ODTextCommandBuilderBooleanOption `interface`
 * The boolean option builder for text commands.
 */
export interface ODTextCommandBuilderBooleanOption extends ODTextCommandBuilderBaseOption {
    type: "boolean";
    /**The value when `true` */
    trueValue?: string;
    /**The value when `false` */
    falseValue?: string;
}
/**## ODTextCommandBuilderChannelOption `interface`
 * The channel option builder for text commands.
 */
export interface ODTextCommandBuilderChannelOption extends ODTextCommandBuilderBaseOption {
    type: "channel";
    /**When specified, only allow the following channel types */
    channelTypes?: discord.GuildChannelType[];
}
/**## ODTextCommandBuilderRoleOption `interface`
 * The role option builder for text commands.
 */
export interface ODTextCommandBuilderRoleOption extends ODTextCommandBuilderBaseOption {
    type: "role";
}
/**## ODTextCommandBuilderUserOption `interface`
 * The user option builder for text commands.
 */
export interface ODTextCommandBuilderUserOption extends ODTextCommandBuilderBaseOption {
    type: "user";
}
/**## ODTextCommandBuilderGuildMemberOption `interface`
 * The guild member option builder for text commands.
 */
export interface ODTextCommandBuilderGuildMemberOption extends ODTextCommandBuilderBaseOption {
    type: "guildmember";
}
/**## ODTextCommandBuilderMentionableOption `interface`
 * The mentionable option builder for text commands.
 */
export interface ODTextCommandBuilderMentionableOption extends ODTextCommandBuilderBaseOption {
    type: "mentionable";
}
/**## ODTextCommandBuilderOption `type`
 * The option builder for text commands.
 */
export type ODTextCommandBuilderOption = (ODTextCommandBuilderStringOption | ODTextCommandBuilderBooleanOption | ODTextCommandBuilderNumberOption | ODTextCommandBuilderChannelOption | ODTextCommandBuilderRoleOption | ODTextCommandBuilderUserOption | ODTextCommandBuilderGuildMemberOption | ODTextCommandBuilderMentionableOption);
/**## ODTextCommandBuilder `interface`
 * The builder for text commands. Here you can add options to the command.
 */
export interface ODTextCommandBuilder {
    /**The prefix of this command */
    prefix: string;
    /**The name of this command (can include spaces for subcommands) */
    name: string;
    /**Is this command allowed in dm? */
    dmPermission?: boolean;
    /**Is this command allowed in guilds? */
    guildPermission?: boolean;
    /**When specified, only allow this command to be executed in the following guilds */
    allowedGuildIds?: string[];
    /**Are bots allowed to execute this command? */
    allowBots?: boolean;
    /**The options for this text command (like slash commands) */
    options?: ODTextCommandBuilderOption[];
}
/**## ODTextCommand `class`
 * This is an Open Ticket text command.
 *
 * When registered, you can listen for this command using the `ODCommandResponder`. The advantages of using this class for creating a text command are:
 * - automatic option parsing (even for channels, users, roles & mentions)!
 * - automatic errors on invalid parameters
 * - error reporting to the user when the bot fails to respond
 * - plugins can extend this command
 *
 * And more!
 */
export declare class ODTextCommand extends ODManagerData {
    /**The builder for this slash command. */
    builder: ODTextCommandBuilder;
    /**The name of this slash command. */
    name: string;
    constructor(id: ODValidId, builder: ODTextCommandBuilder);
}
/**## ODTextCommandInteractionOptionBase `interface`
 * The object returned for options from a text command interaction.
 */
export interface ODTextCommandInteractionOptionBase<Name, Type> {
    /**The name of this option */
    name: string;
    /**The type of this option */
    type: Name;
    /**The value of this option */
    value: Type;
}
/**## ODTextCommandInteractionOption `type`
 * A list of types returned for options from a text command interaction.
 */
export type ODTextCommandInteractionOption = (ODTextCommandInteractionOptionBase<"string", string> | ODTextCommandInteractionOptionBase<"number", number> | ODTextCommandInteractionOptionBase<"boolean", boolean> | ODTextCommandInteractionOptionBase<"channel", discord.GuildBasedChannel> | ODTextCommandInteractionOptionBase<"role", discord.Role> | ODTextCommandInteractionOptionBase<"user", discord.User> | ODTextCommandInteractionOptionBase<"guildmember", discord.GuildMember> | ODTextCommandInteractionOptionBase<"mentionable", discord.Role | discord.User>);
/**## ODTextCommandInteractionCallback `type`
 * Callback for the text command interaction listener.
 */
export type ODTextCommandInteractionCallback = (msg: discord.Message, cmd: ODTextCommand, options: ODTextCommandInteractionOption[]) => void;
/**## ODTextCommandErrorBase `interface`
 * The object returned from a text command error callback.
 */
export interface ODTextCommandErrorBase {
    /**The type of text command error */
    type: "unknown_prefix" | "unknown_command" | "invalid_option" | "missing_option";
    /**The message this error originates from */
    msg: discord.Message;
}
/**## ODTextCommandErrorUnknownPrefix `interface`
 * The object returned from a text command unknown prefix error callback.
 */
export interface ODTextCommandErrorUnknownPrefix extends ODTextCommandErrorBase {
    type: "unknown_prefix";
}
/**## ODTextCommandErrorUnknownCommand `interface`
 * The object returned from a text command unknown command error callback.
 */
export interface ODTextCommandErrorUnknownCommand extends ODTextCommandErrorBase {
    type: "unknown_command";
}
/**## ODTextCommandErrorInvalidOptionReason `type`
 * A list of reasons for the invalid_option error to be thrown.
 */
export type ODTextCommandErrorInvalidOptionReason = ("boolean" | "number_max" | "number_min" | "number_decimal" | "number_negative" | "number_positive" | "number_zero" | "number_invalid" | "string_max_length" | "string_min_length" | "string_regex" | "string_choice" | "not_in_guild" | "channel_not_found" | "channel_type" | "user_not_found" | "member_not_found" | "role_not_found" | "mentionable_not_found");
/**## ODTextCommandErrorInvalidOption `interface`
 * The object returned from a text command invalid option error callback.
 */
export interface ODTextCommandErrorInvalidOption extends ODTextCommandErrorBase {
    type: "invalid_option";
    /**The command this error originates from */
    command: ODTextCommand;
    /**The command prefix this error originates from */
    prefix: string;
    /**The command name this error originates from (can include spaces for subcommands) */
    name: string;
    /**The option that this error originates from */
    option: ODTextCommandBuilderOption;
    /**The location that this option was found */
    location: number;
    /**The current value of this invalid option */
    value: string;
    /**The reason for this invalid option */
    reason: ODTextCommandErrorInvalidOptionReason;
}
/**## ODTextCommandErrorMissingOption `interface`
 * The object returned from a text command missing option error callback.
 */
export interface ODTextCommandErrorMissingOption extends ODTextCommandErrorBase {
    type: "missing_option";
    /**The command this error originates from */
    command: ODTextCommand;
    /**The command prefix this error originates from */
    prefix: string;
    /**The command name this error originates from (can include spaces for subcommands) */
    name: string;
    /**The option that this error originates from */
    option: ODTextCommandBuilderOption;
    /**The location that this option was found */
    location: number;
}
/**## ODTextCommandError `type`
 * A list of types returned for errors from a text command interaction.
 */
export type ODTextCommandError = (ODTextCommandErrorUnknownPrefix | ODTextCommandErrorUnknownCommand | ODTextCommandErrorInvalidOption | ODTextCommandErrorMissingOption);
/**## ODTextCommandErrorCallback `type`
 * Callback for the text command error listener.
 */
export type ODTextCommandErrorCallback = (error: ODTextCommandError) => void;
/**## ODTextCommandManager `class`
 * This is an Open Ticket client text manager.
 *
 * It's responsible for managing all the text commands from the client.
 *
 * Here, you can add & remove text commands & the bot will do the (de)registering.
 */
export declare class ODTextCommandManager extends ODManager<ODTextCommand> {
    #private;
    /**Copy of discord.js client. */
    manager: ODClientManager;
    /**Set the soft limit for maximum amount of listeners. A warning will be shown when there are more listeners than this limit. */
    listenerLimit: number;
    constructor(debug: ODDebugger, manager: ODClientManager);
    /**Start listening to the discord.js client `messageCreate` event. */
    startListeningToInteractions(): void;
    /**Callback on interaction from one of the registered text commands */
    onInteraction(commandPrefix: string, commandName: string | RegExp, callback: ODTextCommandInteractionCallback): void;
    /**Callback on error from all the registered text commands */
    onError(callback: ODTextCommandErrorCallback): void;
    add(data: ODTextCommand, overwrite?: boolean): boolean;
}
/**## ODContextMenuUniversalMenu `interface`
 * A universal template for a context menu.
 *
 * Why universal? Both **existing context menus** & **unregistered templates** can be converted to this type.
 */
export interface ODContextMenuUniversalMenu {
    /**The type of this context menu. (required => `Message`|`User`) */
    type: discord.ApplicationCommandType.Message | discord.ApplicationCommandType.User;
    /**The name of this context menu. */
    name: string;
    /**All localized names of this context menu. */
    nameLocalizations: readonly ODSlashCommandUniversalTranslation[];
    /**The id of the guild this context menu is registered in. */
    guildId: string | null;
    /**Is this context menu for 18+ users only? */
    nsfw: boolean;
    /**A bitfield of the user permissions required to use this context menu. */
    defaultMemberPermissions: bigint;
    /**Is this context menu available in DM? */
    dmPermission: boolean;
    /**A list of contexts where you can install this context menu. */
    integrationTypes: readonly discord.ApplicationIntegrationType[];
    /**A list of contexts where you can use this context menu. */
    contexts: readonly discord.InteractionContextType[];
}
/**## ODContextMenuBuilderMessage `interface`
 * The builder for message context menus.
 */
export interface ODContextMenuBuilderMessage extends discord.MessageApplicationCommandData {
    /**This field is required in Open Ticket for future compatibility. */
    integrationTypes: discord.ApplicationIntegrationType[];
    /**This field is required in Open Ticket for future compatibility. */
    contexts: discord.InteractionContextType[];
}
/**## ODContextMenuBuilderUser `interface`
 * The builder for user context menus.
 */
export interface ODContextMenuBuilderUser extends discord.UserApplicationCommandData {
    /**This field is required in Open Ticket for future compatibility. */
    integrationTypes: discord.ApplicationIntegrationType[];
    /**This field is required in Open Ticket for future compatibility. */
    contexts: discord.InteractionContextType[];
}
/**## ODContextMenuBuilderUser `interface`
 * The builder for context menus.
 */
export type ODContextMenuBuilder = (ODContextMenuBuilderMessage | ODContextMenuBuilderUser);
/**## ODContextMenuComparator `class`
 * A utility class to compare existing context menu's with newly registered ones.
 */
export declare class ODContextMenuComparator {
    /**Convert a `ODContextMenuBuilder` to a universal Open Ticket context menu object for comparison. */
    convertBuilder(builder: ODContextMenuBuilder, guildId: string | null): ODContextMenuUniversalMenu | null;
    /**Convert a `discord.ApplicationCommand` to a universal Open Ticket context menu object for comparison. */
    convertMenu(cmd: discord.ApplicationCommand): ODContextMenuUniversalMenu | null;
    /**Returns `true` when the 2 context menus are the same. */
    compare(ctxA: ODContextMenuUniversalMenu, ctxB: ODContextMenuUniversalMenu): boolean;
}
/**## ODContextMenuInteractionCallback `type`
 * Callback for the context menu interaction listener.
 */
export type ODContextMenuInteractionCallback = (interaction: discord.ContextMenuCommandInteraction, cmd: ODContextMenu) => void;
/**## ODContextMenuRegisteredResult `type`
 * The result which will be returned when getting all (un)registered user context menu's from the manager.
 */
export type ODContextMenuRegisteredResult = {
    /**A list of all registered context menus. */
    registered: {
        /**The instance (`ODContextMenu`) from this context menu. */
        instance: ODContextMenu;
        /**The universal object/template/builder of this context menu. */
        menu: ODContextMenuUniversalMenu;
        /**Does this context menu require an update? */
        requiresUpdate: boolean;
    }[];
    /**A list of all unregistered context menus. */
    unregistered: {
        /**The instance (`ODContextMenu`) from this context menu. */
        instance: ODContextMenu;
        /**The universal object/template/builder of this context menu. */
        menu: null;
        /**Does this context menu require an update? */
        requiresUpdate: true;
    }[];
    /**A list of all unused context menus (not found in `ODContextMenuManager`). */
    unused: {
        /**The instance (`ODContextMenu`) from this context menu. */
        instance: null;
        /**The universal object/template/builder of this context menu. */
        menu: ODContextMenuUniversalMenu;
        /**Does this context menu require an update? */
        requiresUpdate: false;
    }[];
};
/**## ODContextMenuManager `class`
 * This is an Open Ticket client context menu manager.
 *
 * It's responsible for managing all the context interactions from the client.
 *
 * Here, you can add & remove context interactions & the bot will do the (de)registering.
 */
export declare class ODContextMenuManager extends ODManager<ODContextMenu> {
    #private;
    /**Refrerence to discord.js client. */
    manager: ODClientManager;
    /**Discord.js application commands manager. */
    commandManager: discord.ApplicationCommandManager | null;
    /**Set the soft limit for maximum amount of listeners. A warning will be shown when there are more listeners than this limit. */
    listenerLimit: number;
    /**A utility class used to compare 2 context menus with each other. */
    comparator: ODContextMenuComparator;
    constructor(debug: ODDebugger, manager: ODClientManager);
    /**Get all registered & unregistered message context menu commands. */
    getAllRegisteredMenus(guildId?: string): Promise<ODContextMenuRegisteredResult>;
    /**Create all context menus that are not registered yet.*/
    createNewMenus(instances: ODContextMenu[], progress?: ODManualProgressBar): Promise<void>;
    /**Update all context menus that are already registered. */
    updateExistingMenus(instances: ODContextMenu[], progress?: ODManualProgressBar): Promise<void>;
    /**Remove all context menus that are registered but unused by Open Ticket. */
    removeUnusedMenus(instances: ODContextMenuUniversalMenu[], guildId?: string, progress?: ODManualProgressBar): Promise<void>;
    /**Create a context menu. **(SYSTEM ONLY)** => Use `ODContextMenuManager` for registering context menu's the default way! */
    createMenu(menu: ODContextMenu): Promise<void>;
    /**Start listening to the discord.js client `interactionCreate` event. */
    startListeningToInteractions(): void;
    /**Callback on interaction from one or multiple context menu's. */
    onInteraction(menuName: string | RegExp, callback: ODContextMenuInteractionCallback): void;
}
/**## ODContextMenuUpdateFunction `type`
 * The function responsible for updating context menu's when they already exist.
 */
export type ODContextMenuUpdateFunction = (menu: ODContextMenuUniversalMenu) => boolean;
/**## ODContextMenu `class`
 * This is an Open Ticket context menu.
 *
 * When registered, you can listen for this context menu using the `ODContextResponder`. The advantages of using this class for creating a context menu are:
 * - automatic registration in discord.js
 * - error reporting to the user when the bot fails to respond
 * - plugins can extend this context menu
 * - the bot won't re-register the context menu when it already exists (except when requested)!
 *
 * And more!
 */
export declare class ODContextMenu extends ODManagerData {
    /**The discord.js builder for this context menu. */
    builder: ODContextMenuBuilder;
    /**The id of the guild this context menu is for. `null` when not set. */
    guildId: string | null;
    /**Function to check if the context menu requires to be updated (when it already exists). */
    requiresUpdate: ODContextMenuUpdateFunction | null;
    constructor(id: ODValidId, builder: ODContextMenuBuilder, requiresUpdate?: ODContextMenuUpdateFunction, guildId?: string);
    /**The name of this context menu. */
    get name(): string;
    set name(name: string);
}
/**## ODAutocompleteInteractionCallback `type`
 * Callback for the autocomplete interaction listener.
 */
export type ODAutocompleteInteractionCallback = (interaction: discord.AutocompleteInteraction) => void;
/**## ODAutocompleteManager `class`
 * This is an Open Ticket client autocomplete interaction manager.
 *
 * It's responsible for managing all the autocomplete interactions from the client.
 */
export declare class ODAutocompleteManager {
    #private;
    /**Refrerence to discord.js client. */
    manager: ODClientManager;
    /**Discord.js application commands manager. */
    commandManager: discord.ApplicationCommandManager | null;
    /**Set the soft limit for maximum amount of listeners. A warning will be shown when there are more listeners than this limit. */
    listenerLimit: number;
    constructor(debug: ODDebugger, manager: ODClientManager);
    /**Start listening to the discord.js client `interactionCreate` event. */
    startListeningToInteractions(): void;
    /**Callback on interaction from one or multiple autocompletes. */
    onInteraction(cmdName: string | RegExp, optName: string | RegExp, callback: ODAutocompleteInteractionCallback): void;
}
