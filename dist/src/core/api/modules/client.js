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
exports.ODAutocompleteManager = exports.ODContextMenu = exports.ODContextMenuManager = exports.ODContextMenuComparator = exports.ODTextCommandManager = exports.ODTextCommand = exports.ODSlashCommand = exports.ODSlashCommandManager = exports.ODSlashCommandComparator = exports.ODClientActivityManager = exports.ODClientManager = void 0;
///////////////////////////////////////
//DISCORD CLIENT MODULE
///////////////////////////////////////
const base_1 = require("./base");
const discord = __importStar(require("discord.js"));
const rest_1 = require("@discordjs/rest");
const console_1 = require("./console");
/**## ODClientManager `class`
 * This is an Open Ticket client manager.
 *
 * It is responsible for managing the discord.js client. Here, you can set the status, register slash commands and much more!
 *
 * If you want, you can also listen for custom events on the `ODClientManager.client` variable (`discord.Client`)
 */
class ODClientManager {
    /**Alias to Open Ticket debugger. */
    #debug;
    /**List of required bot intents. Add intents to this list using the `onClientLoad` event. */
    intents = [];
    /**List of required bot privileged intents. Add intents to this list using the `onClientLoad` event. */
    privileges = [];
    /**List of required bot partials. Add intents to this list using the `onClientLoad` event. **❌ Only use when neccessery!** */
    partials = [];
    /**List of required bot permissions. Add permissions to this list using the `onClientLoad` event. */
    permissions = [];
    /**The discord bot token, empty by default. */
    set token(value) {
        this.#token = value;
        this.rest.setToken(value);
    }
    get token() {
        return this.#token;
    }
    /**The discord  bot token. **DON'T USE THIS!!!** (use `ODClientManager.token` instead) */
    #token = "";
    /**The discord.js `discord.Client`. Only use it when initiated! */
    client = new discord.Client({ intents: [] }); //temporary client
    /**The discord.js REST client. Used for stuff that discord.js can't handle :) */
    rest = new rest_1.REST({ version: "10" });
    /**Is the bot initiated? */
    initiated = false;
    /**Is the bot logged in? */
    loggedIn = false;
    /**Is the bot ready? */
    ready = false;
    /**The main server of the bot. Provided by serverId in the config */
    mainServer = null;
    /**(❌ DO NOT OVERWRITE ❌) Internal Open Ticket function to continue the startup when the client is ready! */
    readyListener = null;
    /**The status manager is responsible for setting the bot status. */
    activity;
    /**The slash command manager is responsible for all slash commands & their events inside the bot. */
    slashCommands;
    /**The text command manager is responsible for all text commands & their events inside the bot. */
    textCommands;
    /**The context menu manager is responsible for all context menus & their events inside the bot. */
    contextMenus;
    /**The autocomplete manager is responsible for all autocomplete events inside the bot. */
    autocompletes;
    constructor(debug) {
        this.#debug = debug;
        this.activity = new ODClientActivityManager(this.#debug, this);
        this.slashCommands = new ODSlashCommandManager(this.#debug, this);
        this.textCommands = new ODTextCommandManager(this.#debug, this);
        this.contextMenus = new ODContextMenuManager(this.#debug, this);
        this.autocompletes = new ODAutocompleteManager(this.#debug, this);
    }
    /**Initiate the `client` variable & add the intents & partials to the bot. */
    initClient() {
        if (!this.intents.every((value) => typeof discord.GatewayIntentBits[value] != "undefined"))
            throw new base_1.ODSystemError("Client has non-existing intents!");
        if (!this.privileges.every((value) => typeof { GuildMembers: true, MessageContent: true, Presence: true }[value] != "undefined"))
            throw new base_1.ODSystemError("Client has non-existing privileged intents!");
        if (!this.partials.every((value) => typeof discord.Partials[value] != "undefined"))
            throw new base_1.ODSystemError("Client has non-existing partials!");
        if (!this.permissions.every((value) => typeof discord.PermissionFlagsBits[value] != "undefined"))
            throw new base_1.ODSystemError("Client has non-existing partials!");
        const intents = this.intents.map((value) => discord.GatewayIntentBits[value]);
        const partials = this.partials.map((value) => discord.Partials[value]);
        const oldClient = this.client;
        this.client = new discord.Client({ intents, partials });
        //@ts-ignore
        oldClient.eventNames().forEach((event) => {
            //@ts-ignore
            const callbacks = oldClient.rawListeners(event);
            callbacks.forEach((cb) => {
                this.client.on(event, cb);
            });
        });
        this.initiated = true;
        this.#debug.debug("Created client with intents: " + this.intents.join(", "));
        this.#debug.debug("Created client with privileged intents: " + this.privileges.join(", "));
        this.#debug.debug("Created client with partials: " + this.partials.join(", "));
        this.#debug.debug("Created client with permissions: " + this.permissions.join(", "));
    }
    /**Get all servers the bot is part of. */
    async getGuilds() {
        if (!this.initiated)
            throw new base_1.ODSystemError("Client isn't initiated yet!");
        if (!this.ready)
            throw new base_1.ODSystemError("Client isn't ready yet!");
        return this.client.guilds.cache.map((guild) => guild);
    }
    /**Check if the bot is in a specific guild */
    checkBotInGuild(guild) {
        return (guild.members.me) ? true : false;
    }
    /**Check if a specific guild has all required permissions (or `Administrator`) */
    checkGuildPerms(guild) {
        if (!guild.members.me)
            throw new base_1.ODSystemError("Client isn't a member in this server!");
        const perms = guild.members.me.permissions;
        if (perms.has("Administrator"))
            return true;
        else {
            return this.permissions.every((perm) => {
                return perms.has(perm);
            });
        }
    }
    /**Log-in with a discord auth token. Rejects returns `false` using 'softErrors' on failure. */
    login(softErrors) {
        return new Promise(async (resolve, reject) => {
            if (!this.initiated)
                reject("Client isn't initiated yet!");
            if (!this.token)
                reject("Client doesn't have a token!");
            try {
                this.client.once("clientReady", async () => {
                    this.ready = true;
                    //set slashCommandManager & contextMenuManager to client applicationCommandManager
                    if (!this.client.application)
                        throw new base_1.ODSystemError("Couldn't get client application for slashCommand & contextMenu managers!");
                    this.slashCommands.commandManager = this.client.application.commands;
                    this.contextMenus.commandManager = this.client.application.commands;
                    this.autocompletes.commandManager = this.client.application.commands;
                    if (this.readyListener)
                        await this.readyListener();
                    resolve(true);
                });
                this.#debug.debug("Actual discord.js client.login()");
                await this.client.login(this.token);
                this.#debug.debug("Finished discord.js client.login()");
                this.loggedIn = true;
            }
            catch (err) {
                if (softErrors)
                    return resolve(false);
                else if (err.message.toLowerCase().includes("used disallowed intents")) {
                    process.emit("uncaughtException", new base_1.ODSystemError("Used disallowed intents"));
                }
                else if (err.message.toLowerCase().includes("tokeninvalid") || err.message.toLowerCase().includes("an invalid token was provided")) {
                    process.emit("uncaughtException", new base_1.ODSystemError("Invalid discord bot token provided"));
                }
                else
                    reject("OT Login Error: " + err);
            }
        });
    }
    /**A simplified shortcut to get a `discord.User` :) */
    async fetchUser(id) {
        if (!this.initiated)
            throw new base_1.ODSystemError("Client isn't initiated yet!");
        if (!this.ready)
            throw new base_1.ODSystemError("Client isn't ready yet!");
        try {
            return await this.client.users.fetch(id);
        }
        catch {
            return null;
        }
    }
    /**A simplified shortcut to get a `discord.Guild` :) */
    async fetchGuild(id) {
        if (!this.initiated)
            throw new base_1.ODSystemError("Client isn't initiated yet!");
        if (!this.ready)
            throw new base_1.ODSystemError("Client isn't ready yet!");
        try {
            return await this.client.guilds.fetch(id);
        }
        catch {
            return null;
        }
    }
    /**A simplified shortcut to get a `discord.Channel` :) */
    async fetchChannel(id) {
        if (!this.initiated)
            throw new base_1.ODSystemError("Client isn't initiated yet!");
        if (!this.ready)
            throw new base_1.ODSystemError("Client isn't ready yet!");
        try {
            return await this.client.channels.fetch(id);
        }
        catch {
            return null;
        }
    }
    /**A simplified shortcut to get a `discord.GuildBasedChannel` :) */
    async fetchGuildChannel(guildId, id) {
        if (!this.initiated)
            throw new base_1.ODSystemError("Client isn't initiated yet!");
        if (!this.ready)
            throw new base_1.ODSystemError("Client isn't ready yet!");
        try {
            const guild = (guildId instanceof discord.Guild) ? guildId : await this.fetchGuild(guildId);
            if (!guild)
                return null;
            const channel = await guild.channels.fetch(id);
            return channel;
        }
        catch {
            return null;
        }
    }
    /**A simplified shortcut to get a `discord.TextChannel` :) */
    async fetchGuildTextChannel(guildId, id) {
        if (!this.initiated)
            throw new base_1.ODSystemError("Client isn't initiated yet!");
        if (!this.ready)
            throw new base_1.ODSystemError("Client isn't ready yet!");
        try {
            const guild = (guildId instanceof discord.Guild) ? guildId : await this.fetchGuild(guildId);
            if (!guild)
                return null;
            const channel = await guild.channels.fetch(id);
            if (!channel || channel.type != discord.ChannelType.GuildText)
                return null;
            return channel;
        }
        catch {
            return null;
        }
    }
    /**A simplified shortcut to get a `discord.CategoryChannel` :) */
    async fetchGuildCategoryChannel(guildId, id) {
        if (!this.initiated)
            throw new base_1.ODSystemError("Client isn't initiated yet!");
        if (!this.ready)
            throw new base_1.ODSystemError("Client isn't ready yet!");
        try {
            const guild = (guildId instanceof discord.Guild) ? guildId : await this.fetchGuild(guildId);
            if (!guild)
                return null;
            const channel = await guild.channels.fetch(id);
            if (!channel || channel.type != discord.ChannelType.GuildCategory)
                return null;
            return channel;
        }
        catch {
            return null;
        }
    }
    /**A simplified shortcut to get a `discord.GuildMember` :) */
    async fetchGuildMember(guildId, id) {
        if (!this.initiated)
            throw new base_1.ODSystemError("Client isn't initiated yet!");
        if (!this.ready)
            throw new base_1.ODSystemError("Client isn't ready yet!");
        if (typeof id != "string")
            throw new base_1.ODSystemError("TEMP ERROR => ODClientManager.fetchGuildMember() => id param isn't string");
        try {
            const guild = (guildId instanceof discord.Guild) ? guildId : await this.fetchGuild(guildId);
            if (!guild)
                return null;
            return await guild.members.fetch(id);
        }
        catch {
            return null;
        }
    }
    /**A simplified shortcut to get a `discord.Role` :) */
    async fetchGuildRole(guildId, id) {
        if (!this.initiated)
            throw new base_1.ODSystemError("Client isn't initiated yet!");
        if (!this.ready)
            throw new base_1.ODSystemError("Client isn't ready yet!");
        if (typeof id != "string")
            throw new base_1.ODSystemError("TEMP ERROR => ODClientManager.fetchGuildRole() => id param isn't string");
        try {
            const guild = (guildId instanceof discord.Guild) ? guildId : await this.fetchGuild(guildId);
            if (!guild)
                return null;
            return await guild.roles.fetch(id);
        }
        catch {
            return null;
        }
    }
    async fetchGuildChannelMessage(guildId, channelId, id) {
        if (!this.initiated)
            throw new base_1.ODSystemError("Client isn't initiated yet!");
        if (!this.ready)
            throw new base_1.ODSystemError("Client isn't ready yet!");
        try {
            if (guildId instanceof discord.TextChannel && typeof channelId == "string") {
                const channel = guildId;
                return await channel.messages.fetch(channelId);
            }
            else if (!(guildId instanceof discord.TextChannel) && id) {
                const channel = (channelId instanceof discord.TextChannel) ? channelId : await this.fetchGuildTextChannel(guildId, channelId);
                if (!channel)
                    return null;
                return await channel.messages.fetch(id);
            }
            else
                return null;
        }
        catch {
            return null;
        }
    }
    /**A simplified shortcut to send a DM to a user :) */
    async sendUserDm(user, message) {
        if (!this.initiated)
            throw new base_1.ODSystemError("Client isn't initiated yet!");
        if (!this.ready)
            throw new base_1.ODSystemError("Client isn't ready yet!");
        try {
            if (user instanceof discord.User) {
                if (user.bot)
                    return { success: false, message: null };
                const channel = await user.createDM();
                const msg = await channel.send(message.message);
                return { success: true, message: msg };
            }
            else {
                const newUser = await this.fetchUser(user);
                if (!newUser)
                    throw new Error();
                if (newUser.bot)
                    return { success: false, message: null };
                const channel = await newUser.createDM();
                const msg = await channel.send(message.message);
                return { success: true, message: msg };
            }
        }
        catch {
            try {
                this.#debug.console.log("Failed to send DM to user! ", "warning", [
                    { key: "id", value: (user instanceof discord.User ? user.id : user) },
                    { key: "message", value: message.id.value }
                ]);
            }
            catch { }
            return { success: false, message: null };
        }
    }
}
exports.ODClientManager = ODClientManager;
/**## ODClientActivityManager `class`
 * This is an Open Ticket client activity manager.
 *
 * It's responsible for managing the client status. Here, you can set the activity & status of the bot.
 *
 * It also has a built-in refresh function, so the status will refresh every 10 minutes to keep it visible.
 */
class ODClientActivityManager {
    /**Alias to Open Ticket debugger. */
    #debug;
    /**Copy of discord.js client */
    manager;
    /**The current status type */
    type = false;
    /**The current status text */
    text = "";
    /**The current status mode */
    mode = "online";
    /**Additional state text */
    state = "";
    /**The timer responsible for refreshing the status. Stop it using `clearInterval(interval)` */
    interval;
    /**status refresh interval in seconds (5 minutes by default)*/
    refreshInterval = 600;
    /**Is the status already initiated? */
    initiated = false;
    constructor(debug, manager) {
        this.#debug = debug;
        this.manager = manager;
    }
    /**Update the status. When already initiated, it can take up to 10min to see the updated status in discord. */
    setStatus(type, text, mode, state, forceUpdate) {
        this.type = type;
        this.text = text;
        this.mode = mode;
        this.state = state;
        if (forceUpdate)
            this.#updateClientActivity(this.type, this.text);
    }
    /**When initiating the status, the bot starts updating the status using `discord.js`. Returns `true` when successfull. */
    initStatus() {
        if (this.initiated || !this.manager.ready)
            return false;
        this.#updateClientActivity(this.type, this.text);
        this.interval = setInterval(() => {
            this.#updateClientActivity(this.type, this.text);
            this.#debug.debug("Client status update cycle");
        }, this.refreshInterval * 1000);
        this.initiated = true;
        this.#debug.debug("Client status initiated");
        return true;
    }
    /**Update the client status */
    #updateClientActivity(type, text) {
        if (!this.manager.client.user)
            throw new base_1.ODSystemError("Couldn't set client status: client.user == undefined");
        if (type == false) {
            this.manager.client.user.setActivity();
            return;
        }
        this.manager.client.user.setPresence({
            activities: [{
                    type: this.#getStatusTypeEnum(type),
                    state: this.state ? this.state : undefined,
                    name: text,
                }],
            status: this.mode
        });
    }
    /**Get the enum that links to the correct type */
    #getStatusTypeEnum(type) {
        if (type == "playing")
            return discord.ActivityType.Playing;
        else if (type == "listening")
            return discord.ActivityType.Listening;
        else if (type == "watching")
            return discord.ActivityType.Watching;
        else if (type == "custom")
            return discord.ActivityType.Custom;
        else
            return discord.ActivityType.Listening;
    }
    /**Get the status type (for displaying the status) */
    getStatusType() {
        if (this.type == "listening" || this.type == "playing" || this.type == "watching")
            return this.type + " ";
        else
            return "";
    }
}
exports.ODClientActivityManager = ODClientActivityManager;
/**## ODSlashCommandComparator `class`
 * A utility class to compare existing slash commands with newly registered ones.
 */
class ODSlashCommandComparator {
    /**Convert a `discord.ApplicationCommandOptionChoiceData<string>` to a universal Open Ticket slash command option choice object for comparison. */
    #convertOptionChoice(choice) {
        const nameLoc = choice.nameLocalizations ?? {};
        return {
            name: choice.name,
            nameLocalizations: Object.keys(nameLoc).map((key) => { return { language: key, value: nameLoc[key] }; }),
            value: choice.value
        };
    }
    /**Convert a `discord.ApplicationCommandOptionData` to a universal Open Ticket slash command option object for comparison. */
    #convertBuilderOption(option) {
        const nameLoc = option.nameLocalizations ?? {};
        const descLoc = option.descriptionLocalizations ?? {};
        return {
            type: option.type,
            name: option.name,
            nameLocalizations: Object.keys(nameLoc).map((key) => { return { language: key, value: nameLoc[key] }; }),
            description: option.description,
            descriptionLocalizations: Object.keys(descLoc).map((key) => { return { language: key, value: descLoc[key] }; }),
            required: (option.type != discord.ApplicationCommandOptionType.SubcommandGroup && option.type != discord.ApplicationCommandOptionType.Subcommand && option.required) ? true : false,
            autocomplete: option.autocomplete ?? false,
            choices: (option.type == discord.ApplicationCommandOptionType.String && !option.autocomplete && option.choices) ? option.choices.map((choice) => this.#convertOptionChoice(choice)) : [],
            options: ((option.type == discord.ApplicationCommandOptionType.SubcommandGroup || option.type == discord.ApplicationCommandOptionType.Subcommand) && option.options) ? option.options.map((opt) => this.#convertBuilderOption(opt)) : [],
            channelTypes: (option.type == discord.ApplicationCommandOptionType.Channel && option.channelTypes) ? option.channelTypes : [],
            minValue: (option.type == discord.ApplicationCommandOptionType.Number && option.minValue) ? option.minValue : null,
            maxValue: (option.type == discord.ApplicationCommandOptionType.Number && option.maxValue) ? option.maxValue : null,
            minLength: (option.type == discord.ApplicationCommandOptionType.String && option.minLength) ? option.minLength : null,
            maxLength: (option.type == discord.ApplicationCommandOptionType.String && option.maxLength) ? option.maxLength : null
        };
    }
    /**Convert a `discord.ApplicationCommandOption` to a universal Open Ticket slash command option object for comparison. */
    #convertCommandOption(option) {
        const nameLoc = option.nameLocalizations ?? {};
        const descLoc = option.descriptionLocalizations ?? {};
        return {
            type: option.type,
            name: option.name,
            nameLocalizations: Object.keys(nameLoc).map((key) => { return { language: key, value: nameLoc[key] }; }),
            description: option.description,
            descriptionLocalizations: Object.keys(descLoc).map((key) => { return { language: key, value: descLoc[key] }; }),
            required: (option.type != discord.ApplicationCommandOptionType.SubcommandGroup && option.type != discord.ApplicationCommandOptionType.Subcommand && option.required) ? true : false,
            autocomplete: option.autocomplete ?? false,
            choices: (option.type == discord.ApplicationCommandOptionType.String && !option.autocomplete && option.choices) ? option.choices.map((choice) => this.#convertOptionChoice(choice)) : [],
            options: ((option.type == discord.ApplicationCommandOptionType.SubcommandGroup || option.type == discord.ApplicationCommandOptionType.Subcommand) && option.options) ? option.options.map((opt) => this.#convertBuilderOption(opt)) : [],
            channelTypes: (option.type == discord.ApplicationCommandOptionType.Channel && option.channelTypes) ? option.channelTypes : [],
            minValue: (option.type == discord.ApplicationCommandOptionType.Number && option.minValue) ? option.minValue : null,
            maxValue: (option.type == discord.ApplicationCommandOptionType.Number && option.maxValue) ? option.maxValue : null,
            minLength: (option.type == discord.ApplicationCommandOptionType.String && option.minLength) ? option.minLength : null,
            maxLength: (option.type == discord.ApplicationCommandOptionType.String && option.maxLength) ? option.maxLength : null
        };
    }
    /**Convert a `ODSlashCommandBuilder` to a universal Open Ticket slash command object for comparison. */
    convertBuilder(builder, guildId) {
        if (builder.type != discord.ApplicationCommandType.ChatInput)
            return null; //throw new ODSystemError("ODSlashCommandComparator:convertBuilder() is not supported for other types than 'ChatInput'!")
        const nameLoc = builder.nameLocalizations ?? {};
        const descLoc = builder.descriptionLocalizations ?? {};
        return {
            type: 1,
            name: builder.name,
            nameLocalizations: Object.keys(nameLoc).map((key) => { return { language: key, value: nameLoc[key] }; }),
            description: builder.description,
            descriptionLocalizations: Object.keys(descLoc).map((key) => { return { language: key, value: descLoc[key] }; }),
            guildId: guildId,
            nsfw: builder.nsfw ?? false,
            options: builder.options ? builder.options.map((opt) => this.#convertBuilderOption(opt)) : [],
            defaultMemberPermissions: discord.PermissionsBitField.resolve(builder.defaultMemberPermissions ?? ["ViewChannel"]),
            dmPermission: (builder.contexts && builder.contexts.includes(discord.InteractionContextType.BotDM)) ?? false,
            integrationTypes: builder.integrationTypes ?? [discord.ApplicationIntegrationType.GuildInstall],
            contexts: builder.contexts ?? []
        };
    }
    /**Convert a `discord.ApplicationCommand` to a universal Open Ticket slash command object for comparison. */
    convertCommand(cmd) {
        if (cmd.type != discord.ApplicationCommandType.ChatInput)
            return null; //throw new ODSystemError("ODSlashCommandComparator:convertCommand() is not supported for other types than 'ChatInput'!")
        const nameLoc = cmd.nameLocalizations ?? {};
        const descLoc = cmd.descriptionLocalizations ?? {};
        return {
            type: 1,
            name: cmd.name,
            nameLocalizations: Object.keys(nameLoc).map((key) => { return { language: key, value: nameLoc[key] }; }),
            description: cmd.description,
            descriptionLocalizations: Object.keys(descLoc).map((key) => { return { language: key, value: descLoc[key] }; }),
            guildId: cmd.guildId,
            nsfw: cmd.nsfw,
            options: cmd.options ? cmd.options.map((opt) => this.#convertCommandOption(opt)) : [],
            defaultMemberPermissions: discord.PermissionsBitField.resolve(cmd.defaultMemberPermissions ?? ["ViewChannel"]),
            dmPermission: (cmd.contexts && cmd.contexts.includes(discord.InteractionContextType.BotDM)) ? true : false,
            integrationTypes: cmd.integrationTypes ?? [discord.ApplicationIntegrationType.GuildInstall],
            contexts: cmd.contexts ?? []
        };
    }
    /**Returns `true` when the 2 slash command options are the same. */
    compareOption(optA, optB) {
        if (optA.name != optB.name)
            return false;
        if (optA.description != optB.description)
            return false;
        if (optA.type != optB.type)
            return false;
        if (optA.required != optB.required)
            return false;
        if (optA.autocomplete != optB.autocomplete)
            return false;
        if (optA.minValue != optB.minValue)
            return false;
        if (optA.maxValue != optB.maxValue)
            return false;
        if (optA.minLength != optB.minLength)
            return false;
        if (optA.maxLength != optB.maxLength)
            return false;
        //nameLocalizations
        if (optA.nameLocalizations.length != optB.nameLocalizations.length)
            return false;
        if (!optA.nameLocalizations.every((nameA) => {
            const nameB = optB.nameLocalizations.find((nameB) => nameB.language == nameA.language);
            if (!nameB || nameA.value != nameB.value)
                return false;
            else
                return true;
        }))
            return false;
        //descriptionLocalizations
        if (optA.descriptionLocalizations.length != optB.descriptionLocalizations.length)
            return false;
        if (!optA.descriptionLocalizations.every((descA) => {
            const descB = optB.descriptionLocalizations.find((descB) => descB.language == descA.language);
            if (!descB || descA.value != descB.value)
                return false;
            else
                return true;
        }))
            return false;
        //choices
        if (optA.choices.length != optB.choices.length)
            return false;
        if (!optA.choices.every((choiceA, index) => {
            const choiceB = optB.choices[index];
            if (choiceA.name != choiceB.name)
                return false;
            if (choiceA.value != choiceB.value)
                return false;
            //nameLocalizations
            if (choiceA.nameLocalizations.length != choiceB.nameLocalizations.length)
                return false;
            if (!choiceA.nameLocalizations.every((nameA) => {
                const nameB = choiceB.nameLocalizations.find((nameB) => nameB.language == nameA.language);
                if (!nameB || nameA.value != nameB.value)
                    return false;
                else
                    return true;
            }))
                return false;
            return true;
        }))
            return false;
        //channelTypes
        if (optA.channelTypes.length != optB.channelTypes.length)
            return false;
        if (!optA.channelTypes.every((typeA) => {
            return optB.channelTypes.includes(typeA);
        }))
            return false;
        //options
        if (optA.options.length != optB.options.length)
            return false;
        if (!optA.options.every((subOptA, index) => {
            return this.compareOption(subOptA, optB.options[index]);
        }))
            return false;
        return true;
    }
    /**Returns `true` when the 2 slash commands are the same. */
    compare(cmdA, cmdB) {
        if (cmdA.name != cmdB.name)
            return false;
        if (cmdA.description != cmdB.description)
            return false;
        if (cmdA.type != cmdB.type)
            return false;
        if (cmdA.nsfw != cmdB.nsfw)
            return false;
        if (cmdA.guildId != cmdB.guildId)
            return false;
        if (cmdA.dmPermission != cmdB.dmPermission)
            return false;
        if (cmdA.defaultMemberPermissions != cmdB.defaultMemberPermissions)
            return false;
        //nameLocalizations
        if (cmdA.nameLocalizations.length != cmdB.nameLocalizations.length)
            return false;
        if (!cmdA.nameLocalizations.every((nameA) => {
            const nameB = cmdB.nameLocalizations.find((nameB) => nameB.language == nameA.language);
            if (!nameB || nameA.value != nameB.value)
                return false;
            else
                return true;
        }))
            return false;
        //descriptionLocalizations
        if (cmdA.descriptionLocalizations.length != cmdB.descriptionLocalizations.length)
            return false;
        if (!cmdA.descriptionLocalizations.every((descA) => {
            const descB = cmdB.descriptionLocalizations.find((descB) => descB.language == descA.language);
            if (!descB || descA.value != descB.value)
                return false;
            else
                return true;
        }))
            return false;
        //contexts
        if (cmdA.contexts.length != cmdB.contexts.length)
            return false;
        if (!cmdA.contexts.every((contextA) => {
            return cmdB.contexts.includes(contextA);
        }))
            return false;
        //integrationTypes
        if (cmdA.integrationTypes.length != cmdB.integrationTypes.length)
            return false;
        if (!cmdA.integrationTypes.every((integrationA) => {
            return cmdB.integrationTypes.includes(integrationA);
        }))
            return false;
        //options
        if (cmdA.options.length != cmdB.options.length)
            return false;
        if (!cmdA.options.every((optA, index) => {
            return this.compareOption(optA, cmdB.options[index]);
        }))
            return false;
        return true;
    }
}
exports.ODSlashCommandComparator = ODSlashCommandComparator;
/**## ODSlashCommandManager `class`
 * This is an Open Ticket client slash manager.
 *
 * It's responsible for managing all the slash commands from the client.
 *
 * Here, you can add & remove slash commands & the bot will do the (de)registering.
 */
class ODSlashCommandManager extends base_1.ODManager {
    /**Alias to Open Ticket debugger. */
    #debug;
    /**Refrerence to discord.js client. */
    manager;
    /**Discord.js application commands manager. */
    commandManager;
    /**Collection of all interaction listeners. */
    #interactionListeners = [];
    /**Set the soft limit for maximum amount of listeners. A warning will be shown when there are more listeners than this limit. */
    listenerLimit = 100;
    /**A utility class used to compare 2 slash commands with each other. */
    comparator = new ODSlashCommandComparator();
    constructor(debug, manager) {
        super(debug, "slash command");
        this.#debug = debug;
        this.manager = manager;
        this.commandManager = (manager.client.application) ? manager.client.application.commands : null;
    }
    /**Get all registered & unregistered slash commands. */
    async getAllRegisteredCommands(guildId) {
        if (!this.commandManager)
            throw new base_1.ODSystemError("Couldn't get client application to register slash commands!");
        const cmds = (await this.commandManager.fetch({ guildId })).toJSON();
        const registered = [];
        const unregistered = [];
        const unused = [];
        await this.loopAll((instance) => {
            if (guildId && instance.guildId != guildId)
                return;
            const index = cmds.findIndex((cmd) => cmd.name == instance.name);
            const cmd = cmds[index];
            cmds.splice(index, 1);
            if (cmd) {
                //command is registered (and may need to be updated)
                const universalBuilder = this.comparator.convertBuilder(instance.builder, instance.guildId);
                const universalCmd = this.comparator.convertCommand(cmd);
                //command is not of the type 'chatinput'
                if (!universalBuilder || !universalCmd)
                    return;
                const didChange = !this.comparator.compare(universalBuilder, universalCmd);
                const requiresUpdate = didChange || (instance.requiresUpdate ? instance.requiresUpdate(universalCmd) : false);
                registered.push({ instance, cmd: universalCmd, requiresUpdate });
                //command is not registered
            }
            else
                unregistered.push({ instance, cmd: null, requiresUpdate: true });
        });
        cmds.forEach((cmd) => {
            //command does not exist in the manager (only append to unused when type == 'chatinput')
            const universalCmd = this.comparator.convertCommand(cmd);
            if (!universalCmd)
                return;
            unused.push({ instance: null, cmd: universalCmd, requiresUpdate: false });
        });
        return { registered, unregistered, unused };
    }
    /**Create all commands that are not registered yet.*/
    async createNewCommands(instances, progress) {
        if (!this.manager.ready)
            throw new base_1.ODSystemError("Client isn't ready yet! Unable to register slash commands!");
        if (instances.length > 0 && progress) {
            progress.max = instances.length;
            progress.start();
        }
        for (const instance of instances) {
            await this.createCmd(instance);
            this.#debug.debug("Created new slash command", [
                { key: "id", value: instance.id.value },
                { key: "name", value: instance.name }
            ]);
            if (progress)
                progress.increase(1);
        }
    }
    /**Update all commands that are already registered. */
    async updateExistingCommands(instances, progress) {
        if (!this.manager.ready)
            throw new base_1.ODSystemError("Client isn't ready yet! Unable to register slash commands!");
        if (instances.length > 0 && progress) {
            progress.max = instances.length;
            progress.start();
        }
        for (const instance of instances) {
            await this.createCmd(instance);
            this.#debug.debug("Updated existing slash command", [{ key: "id", value: instance.id.value }, { key: "name", value: instance.name }]);
            if (progress)
                progress.increase(1);
        }
    }
    /**Remove all commands that are registered but unused by Open Ticket. */
    async removeUnusedCommands(instances, guildId, progress) {
        if (!this.manager.ready)
            throw new base_1.ODSystemError("Client isn't ready yet! Unable to register slash commands!");
        if (!this.commandManager)
            throw new base_1.ODSystemError("Couldn't get client application to register slash commands!");
        if (instances.length > 0 && progress) {
            progress.max = instances.length;
            progress.start();
        }
        const cmds = await this.commandManager.fetch({ guildId });
        for (const instance of instances) {
            const cmd = cmds.find((cmd) => cmd.name == instance.name);
            if (cmd) {
                try {
                    await cmd.delete();
                    this.#debug.debug("Removed existing slash command", [{ key: "name", value: cmd.name }, { key: "guildId", value: guildId ?? "/" }]);
                }
                catch (err) {
                    process.emit("uncaughtException", err);
                    throw new base_1.ODSystemError("Failed to delete slash command '/" + cmd.name + "'!");
                }
            }
            if (progress)
                progress.increase(1);
        }
    }
    /**Create a slash command. **(SYSTEM ONLY)** => Use `ODSlashCommandManager` for registering commands the default way! */
    async createCmd(cmd) {
        if (!this.commandManager)
            throw new base_1.ODSystemError("Couldn't get client application to register slash commands!");
        try {
            await this.commandManager.create(cmd.builder, (cmd.guildId ?? undefined));
        }
        catch (err) {
            process.emit("uncaughtException", err);
            throw new base_1.ODSystemError("Failed to register slash command '/" + cmd.name + "'!");
        }
    }
    /**Start listening to the discord.js client `interactionCreate` event. */
    startListeningToInteractions() {
        this.manager.client.on("interactionCreate", (interaction) => {
            //return when not in main server or DM
            if (!this.manager.mainServer || (interaction.guild && interaction.guild.id != this.manager.mainServer.id))
                return;
            if (!interaction.isChatInputCommand())
                return;
            const cmd = this.getFiltered((cmd) => cmd.name == interaction.commandName)[0];
            if (!cmd)
                return;
            this.#interactionListeners.forEach((listener) => {
                if (typeof listener.name == "string" && (interaction.commandName != listener.name))
                    return;
                else if (listener.name instanceof RegExp && !listener.name.test(interaction.commandName))
                    return;
                //this is a valid listener
                listener.callback(interaction, cmd);
            });
        });
    }
    /**Callback on interaction from one or multiple slash commands. */
    onInteraction(commandName, callback) {
        this.#interactionListeners.push({
            name: commandName,
            callback
        });
        if (this.#interactionListeners.length > this.listenerLimit) {
            this.#debug.console.log(new console_1.ODConsoleWarningMessage("Possible slash command interaction memory leak detected!", [
                { key: "listeners", value: this.#interactionListeners.length.toString() }
            ]));
        }
    }
}
exports.ODSlashCommandManager = ODSlashCommandManager;
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
class ODSlashCommand extends base_1.ODManagerData {
    /**The discord.js builder for this slash command. */
    builder;
    /**The id of the guild this command is for. Null when not set. */
    guildId;
    /**Function to check if the slash command requires to be updated (when it already exists). */
    requiresUpdate = null;
    constructor(id, builder, requiresUpdate, guildId) {
        super(id);
        if (builder.type != discord.ApplicationCommandType.ChatInput)
            throw new base_1.ODSystemError("ApplicationCommandData is required to be the 'ChatInput' type!");
        this.builder = builder;
        this.guildId = guildId ?? null;
        this.requiresUpdate = requiresUpdate ?? null;
    }
    /**The name of this slash command. */
    get name() {
        return this.builder.name;
    }
    set name(name) {
        this.builder.name = name;
    }
}
exports.ODSlashCommand = ODSlashCommand;
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
class ODTextCommand extends base_1.ODManagerData {
    /**The builder for this slash command. */
    builder;
    /**The name of this slash command. */
    name;
    constructor(id, builder) {
        super(id);
        this.builder = builder;
        this.name = builder.name;
    }
}
exports.ODTextCommand = ODTextCommand;
/**## ODTextCommandManager `class`
 * This is an Open Ticket client text manager.
 *
 * It's responsible for managing all the text commands from the client.
 *
 * Here, you can add & remove text commands & the bot will do the (de)registering.
 */
class ODTextCommandManager extends base_1.ODManager {
    /**Alias to Open Ticket debugger. */
    #debug;
    /**Copy of discord.js client. */
    manager;
    /**Collection of all interaction listeners. */
    #interactionListeners = [];
    /**Collection of all error listeners. */
    #errorListeners = [];
    /**Set the soft limit for maximum amount of listeners. A warning will be shown when there are more listeners than this limit. */
    listenerLimit = 100;
    constructor(debug, manager) {
        super(debug, "text command");
        this.#debug = debug;
        this.manager = manager;
    }
    /*Check if a message is a registered command. */
    async #checkMessage(msg) {
        if (this.manager.client.user && msg.author.id == this.manager.client.user.id)
            return false;
        //filter commands for correct prefix
        const validPrefixCommands = [];
        await this.loopAll((cmd) => {
            if (msg.content.startsWith(cmd.builder.prefix))
                validPrefixCommands.push({
                    cmd: cmd,
                    newContent: msg.content.substring(cmd.builder.prefix.length)
                });
        });
        //return when no command with prefix
        if (validPrefixCommands.length == 0) {
            this.#errorListeners.forEach((cb) => cb({
                type: "unknown_prefix",
                msg: msg
            }));
            return false;
        }
        //filter commands for correct name
        const validNameCommands = [];
        validPrefixCommands.forEach((cmd) => {
            if (cmd.newContent.startsWith(cmd.cmd.builder.name + " ") || cmd.newContent == cmd.cmd.builder.name)
                validNameCommands.push({
                    cmd: cmd.cmd,
                    newContent: cmd.newContent.substring(cmd.cmd.builder.name.length + 1) //+1 because of space after command name
                });
        });
        //return when no command with name
        if (validNameCommands.length == 0) {
            this.#errorListeners.forEach((cb) => cb({
                type: "unknown_command",
                msg: msg
            }));
            return false;
        }
        //the final command
        const command = validNameCommands[0];
        const builder = command.cmd.builder;
        //check additional options
        if (typeof builder.allowBots != "undefined" && !builder.allowBots && msg.author.bot)
            return false;
        else if (typeof builder.dmPermission != "undefined" && !builder.dmPermission && msg.channel.type == discord.ChannelType.DM)
            return false;
        else if (typeof builder.guildPermission != "undefined" && !builder.guildPermission && msg.guild)
            return false;
        else if (typeof builder.allowedGuildIds != "undefined" && msg.guild && !builder.allowedGuildIds.includes(msg.guild.id))
            return false;
        //check all command options & return when incorrect
        const options = await this.#checkOptions(command.cmd, command.newContent, msg);
        if (!options.valid)
            return false;
        //a command matched this message => emit event
        this.#interactionListeners.forEach((listener) => {
            if (typeof listener.prefix == "string" && (command.cmd.builder.prefix != listener.prefix))
                return;
            if (typeof listener.name == "string" && (command.cmd.name.split(" ")[0] != listener.name))
                return;
            else if (listener.name instanceof RegExp && !listener.name.test(command.cmd.name.split(" ")[0]))
                return;
            //this is a valid listener
            listener.callback(msg, command.cmd, options.data);
        });
        return true;
    }
    /**Check if all options of a command are correct. */
    async #checkOptions(cmd, newContent, msg) {
        const options = cmd.builder.options;
        if (!options)
            return { valid: true, data: [] };
        let tempContent = newContent;
        let optionInvalid = false;
        const optionData = [];
        const optionError = (type, option, location, value, reason) => {
            //ERROR INVALID
            if (type == "invalid_option" && value && reason) {
                this.#errorListeners.forEach((cb) => cb({
                    type: "invalid_option",
                    msg: msg,
                    prefix: cmd.builder.prefix,
                    command: cmd,
                    name: cmd.builder.name,
                    option,
                    location,
                    value,
                    reason
                }));
            }
            else if (type == "missing_option") {
                this.#errorListeners.forEach((cb) => cb({
                    type: "missing_option",
                    msg: msg,
                    prefix: cmd.builder.prefix,
                    command: cmd,
                    name: cmd.builder.name,
                    option,
                    location
                }));
            }
            optionInvalid = true;
        };
        for (let location = 0; location < options.length; location++) {
            const option = options[location];
            if (optionInvalid)
                break;
            //CHECK BOOLEAN
            if (option.type == "boolean") {
                const falseValue = option.falseValue ?? "false";
                const trueValue = option.trueValue ?? "true";
                if (tempContent.startsWith(falseValue + " ")) {
                    //FALSE VALUE
                    optionData.push({
                        name: option.name,
                        type: "boolean",
                        value: false
                    });
                    tempContent = tempContent.substring(falseValue.length + 1);
                }
                else if (tempContent.startsWith(trueValue + " ")) {
                    //TRUE VALUE
                    optionData.push({
                        name: option.name,
                        type: "boolean",
                        value: true
                    });
                    tempContent = tempContent.substring(trueValue.length + 1);
                }
                else if (option.required) {
                    //REQUIRED => ERROR IF NOT EXISTING
                    const invalidregex = /^[^ ]+/;
                    const invalidRes = invalidregex.exec(tempContent);
                    if (invalidRes)
                        optionError("invalid_option", option, location, invalidRes[0], "boolean");
                    else
                        optionError("missing_option", option, location);
                }
                //CHECK NUMBER
            }
            else if (option.type == "number") {
                const numRegex = /^[0-9\.\,]+/;
                const res = numRegex.exec(tempContent);
                if (res) {
                    const value = res[0].replace(/\,/g, ".");
                    tempContent = tempContent.substring(value.length + 1);
                    const numValue = Number(value);
                    if (isNaN(numValue)) {
                        optionError("invalid_option", option, location, value, "number_invalid");
                    }
                    else if (typeof option.allowDecimal == "boolean" && !option.allowDecimal && (numValue % 1) !== 0) {
                        optionError("invalid_option", option, location, value, "number_decimal");
                    }
                    else if (typeof option.allowNegative == "boolean" && !option.allowNegative && numValue < 0) {
                        optionError("invalid_option", option, location, value, "number_negative");
                    }
                    else if (typeof option.allowPositive == "boolean" && !option.allowPositive && numValue > 0) {
                        optionError("invalid_option", option, location, value, "number_positive");
                    }
                    else if (typeof option.allowZero == "boolean" && !option.allowZero && numValue == 0) {
                        optionError("invalid_option", option, location, value, "number_zero");
                    }
                    else if (typeof option.max == "number" && numValue > option.max) {
                        optionError("invalid_option", option, location, value, "number_max");
                    }
                    else if (typeof option.min == "number" && numValue < option.min) {
                        optionError("invalid_option", option, location, value, "number_min");
                    }
                    else {
                        //VALID NUMBER
                        optionData.push({
                            name: option.name,
                            type: "number",
                            value: numValue
                        });
                    }
                }
                else if (option.required) {
                    //REQUIRED => ERROR IF NOT EXISTING
                    const invalidRegex = /^[^ ]+/;
                    const invalidRes = invalidRegex.exec(tempContent);
                    if (invalidRes)
                        optionError("invalid_option", option, location, invalidRes[0], "number_invalid");
                    else
                        optionError("missing_option", option, location);
                }
                //CHECK STRING
            }
            else if (option.type == "string") {
                if (option.allowSpaces) {
                    //STRING WITH SPACES
                    const value = tempContent;
                    tempContent = "";
                    if (typeof option.minLength == "number" && value.length < option.minLength) {
                        optionError("invalid_option", option, location, value, "string_min_length");
                    }
                    else if (typeof option.maxLength == "number" && value.length > option.maxLength) {
                        optionError("invalid_option", option, location, value, "string_max_length");
                    }
                    else if (option.regex && !option.regex.test(value)) {
                        optionError("invalid_option", option, location, value, "string_regex");
                    }
                    else if (option.choices && !option.choices.includes(value)) {
                        optionError("invalid_option", option, location, value, "string_choice");
                    }
                    else if (option.required && value === "") {
                        //REQUIRED => ERROR IF NOT EXISTING
                        optionError("missing_option", option, location);
                    }
                    else {
                        //VALID STRING
                        optionData.push({
                            name: option.name,
                            type: "string",
                            value
                        });
                    }
                }
                else {
                    //STRING WITHOUT SPACES
                    const stringRegex = /^[^ ]+/;
                    const res = stringRegex.exec(tempContent);
                    if (res) {
                        const value = res[0];
                        tempContent = tempContent.substring(value.length + 1);
                        if (typeof option.minLength == "number" && value.length < option.minLength) {
                            optionError("invalid_option", option, location, value, "string_min_length");
                        }
                        else if (typeof option.maxLength == "number" && value.length > option.maxLength) {
                            optionError("invalid_option", option, location, value, "string_max_length");
                        }
                        else if (option.regex && !option.regex.test(value)) {
                            optionError("invalid_option", option, location, value, "string_regex");
                        }
                        else if (option.choices && !option.choices.includes(value)) {
                            optionError("invalid_option", option, location, value, "string_choice");
                        }
                        else {
                            //VALID STRING
                            optionData.push({
                                name: option.name,
                                type: "string",
                                value
                            });
                        }
                    }
                    else if (option.required) {
                        //REQUIRED => ERROR IF NOT EXISTING
                        optionError("missing_option", option, location);
                    }
                }
                //CHECK CHANNEL
            }
            else if (option.type == "channel") {
                const channelRegex = /^(?:<#)?([0-9]+)>?/;
                const res = channelRegex.exec(tempContent);
                if (res) {
                    const value = res[0];
                    tempContent = tempContent.substring(value.length + 1);
                    const channelId = res[1];
                    if (!msg.guild) {
                        optionError("invalid_option", option, location, value, "not_in_guild");
                    }
                    else {
                        try {
                            const channel = await msg.guild.channels.fetch(channelId);
                            if (!channel) {
                                optionError("invalid_option", option, location, value, "channel_not_found");
                            }
                            else if (option.channelTypes && !option.channelTypes.includes(channel.type)) {
                                optionError("invalid_option", option, location, value, "channel_type");
                            }
                            else {
                                //VALID CHANNEL
                                optionData.push({
                                    name: option.name,
                                    type: "channel",
                                    value: channel
                                });
                            }
                        }
                        catch {
                            optionError("invalid_option", option, location, value, "channel_not_found");
                        }
                    }
                }
                else if (option.required) {
                    //REQUIRED => ERROR IF NOT EXISTING
                    const invalidRegex = /^[^ ]+/;
                    const invalidRes = invalidRegex.exec(tempContent);
                    if (invalidRes)
                        optionError("invalid_option", option, location, invalidRes[0], "channel_not_found");
                    else
                        optionError("missing_option", option, location);
                }
                //CHECK ROLE
            }
            else if (option.type == "role") {
                const roleRegex = /^(?:<@&)?([0-9]+)>?/;
                const res = roleRegex.exec(tempContent);
                if (res) {
                    const value = res[0];
                    tempContent = tempContent.substring(value.length + 1);
                    const roleId = res[1];
                    if (!msg.guild) {
                        optionError("invalid_option", option, location, value, "not_in_guild");
                    }
                    else {
                        try {
                            const role = await msg.guild.roles.fetch(roleId);
                            if (!role) {
                                optionError("invalid_option", option, location, value, "role_not_found");
                            }
                            else {
                                //VALID ROLE
                                optionData.push({
                                    name: option.name,
                                    type: "role",
                                    value: role
                                });
                            }
                        }
                        catch {
                            optionError("invalid_option", option, location, value, "role_not_found");
                        }
                    }
                }
                else if (option.required) {
                    //REQUIRED => ERROR IF NOT EXISTING
                    const invalidRegex = /^[^ ]+/;
                    const invalidRes = invalidRegex.exec(tempContent);
                    if (invalidRes)
                        optionError("invalid_option", option, location, invalidRes[0], "role_not_found");
                    else
                        optionError("missing_option", option, location);
                }
                //CHECK GUILD MEMBER
            }
            else if (option.type == "guildmember") {
                const memberRegex = /^(?:<@)?([0-9]+)>?/;
                const res = memberRegex.exec(tempContent);
                if (res) {
                    const value = res[0];
                    tempContent = tempContent.substring(value.length + 1);
                    const memberId = res[1];
                    if (!msg.guild) {
                        optionError("invalid_option", option, location, value, "not_in_guild");
                    }
                    else {
                        try {
                            const member = await msg.guild.members.fetch(memberId);
                            if (!member) {
                                optionError("invalid_option", option, location, value, "member_not_found");
                            }
                            else {
                                //VALID GUILD MEMBER
                                optionData.push({
                                    name: option.name,
                                    type: "guildmember",
                                    value: member
                                });
                            }
                        }
                        catch {
                            optionError("invalid_option", option, location, value, "member_not_found");
                        }
                    }
                }
                else if (option.required) {
                    //REQUIRED => ERROR IF NOT EXISTING
                    const invalidRegex = /^[^ ]+/;
                    const invalidRes = invalidRegex.exec(tempContent);
                    if (invalidRes)
                        optionError("invalid_option", option, location, invalidRes[0], "member_not_found");
                    else
                        optionError("missing_option", option, location);
                }
                //CHECK USER
            }
            else if (option.type == "user") {
                const userRegex = /^(?:<@)?([0-9]+)>?/;
                const res = userRegex.exec(tempContent);
                if (res) {
                    const value = res[0];
                    tempContent = tempContent.substring(value.length + 1);
                    const userId = res[1];
                    try {
                        const user = await this.manager.client.users.fetch(userId);
                        if (!user) {
                            optionError("invalid_option", option, location, value, "user_not_found");
                        }
                        else {
                            //VALID USER
                            optionData.push({
                                name: option.name,
                                type: "user",
                                value: user
                            });
                        }
                    }
                    catch {
                        optionError("invalid_option", option, location, value, "user_not_found");
                    }
                }
                else if (option.required) {
                    //REQUIRED => ERROR IF NOT EXISTING
                    const invalidRegex = /^[^ ]+/;
                    const invalidRes = invalidRegex.exec(tempContent);
                    if (invalidRes)
                        optionError("invalid_option", option, location, invalidRes[0], "user_not_found");
                    else
                        optionError("missing_option", option, location);
                }
                //CHECK MENTIONABLE
            }
            else if (option.type == "mentionable") {
                const mentionableRegex = /^<(@&?)([0-9]+)>/;
                const res = mentionableRegex.exec(tempContent);
                if (res) {
                    const value = res[0];
                    const type = (res[1] == "@&") ? "role" : "user";
                    tempContent = tempContent.substring(value.length + 1);
                    const mentionableId = res[2];
                    if (!msg.guild) {
                        optionError("invalid_option", option, location, value, "not_in_guild");
                    }
                    else if (type == "role") {
                        try {
                            const role = await msg.guild.roles.fetch(mentionableId);
                            if (!role) {
                                optionError("invalid_option", option, location, value, "mentionable_not_found");
                            }
                            else {
                                //VALID ROLE
                                optionData.push({
                                    name: option.name,
                                    type: "mentionable",
                                    value: role
                                });
                            }
                        }
                        catch {
                            optionError("invalid_option", option, location, value, "mentionable_not_found");
                        }
                    }
                    else if (type == "user") {
                        try {
                            const user = await this.manager.client.users.fetch(mentionableId);
                            if (!user) {
                                optionError("invalid_option", option, location, value, "mentionable_not_found");
                            }
                            else {
                                //VALID USER
                                optionData.push({
                                    name: option.name,
                                    type: "mentionable",
                                    value: user
                                });
                            }
                        }
                        catch {
                            optionError("invalid_option", option, location, value, "mentionable_not_found");
                        }
                    }
                }
                else if (option.required) {
                    //REQUIRED => ERROR IF NOT EXISTING
                    const invalidRegex = /^[^ ]+/;
                    const invalidRes = invalidRegex.exec(tempContent);
                    if (invalidRes)
                        optionError("invalid_option", option, location, invalidRes[0], "mentionable_not_found");
                    else
                        optionError("missing_option", option, location);
                }
            }
        }
        return { valid: !optionInvalid, data: optionData };
    }
    /**Start listening to the discord.js client `messageCreate` event. */
    startListeningToInteractions() {
        this.manager.client.on("messageCreate", (msg) => {
            //return when not in main server or DM
            if (!this.manager.mainServer || (msg.guild && msg.guild.id != this.manager.mainServer.id))
                return;
            this.#checkMessage(msg);
        });
    }
    /**Check if optional values are only present at the end of the command. */
    #checkBuilderOptions(builder) {
        let optionalVisited = false;
        let valid = true;
        let reason = null;
        if (!builder.options)
            return { valid: true, reason: null };
        builder.options.forEach((opt, index, list) => {
            if (!opt.required)
                optionalVisited = true;
            if (optionalVisited && opt.required) {
                valid = false;
                reason = "required_after_optional";
            }
            if (opt.type == "string" && opt.allowSpaces && ((index + 1) != list.length)) {
                valid = false;
                reason = "allowspaces_not_last";
            }
        });
        return { valid, reason };
    }
    /**Callback on interaction from one of the registered text commands */
    onInteraction(commandPrefix, commandName, callback) {
        this.#interactionListeners.push({
            prefix: commandPrefix,
            name: commandName,
            callback
        });
        if (this.#interactionListeners.length > this.listenerLimit) {
            this.#debug.console.log(new console_1.ODConsoleWarningMessage("Possible text command interaction memory leak detected!", [
                { key: "listeners", value: this.#interactionListeners.length.toString() }
            ]));
        }
    }
    /**Callback on error from all the registered text commands */
    onError(callback) {
        this.#errorListeners.push(callback);
    }
    add(data, overwrite) {
        const checkResult = this.#checkBuilderOptions(data.builder);
        if (!checkResult.valid && checkResult.reason == "required_after_optional")
            throw new base_1.ODSystemError("Invalid text command '" + data.id.value + "' => optional options are only allowed at the end of a command!");
        else if (!checkResult.valid && checkResult.reason == "allowspaces_not_last")
            throw new base_1.ODSystemError("Invalid text command '" + data.id.value + "' => string option with 'allowSpaces' is only allowed at the end of a command!");
        else
            return super.add(data, overwrite);
    }
}
exports.ODTextCommandManager = ODTextCommandManager;
/**## ODContextMenuComparator `class`
 * A utility class to compare existing context menu's with newly registered ones.
 */
class ODContextMenuComparator {
    /**Convert a `ODContextMenuBuilder` to a universal Open Ticket context menu object for comparison. */
    convertBuilder(builder, guildId) {
        if (builder.type != discord.ApplicationCommandType.Message && builder.type != discord.ApplicationCommandType.User)
            return null;
        const nameLoc = builder.nameLocalizations ?? {};
        return {
            type: builder.type,
            name: builder.name,
            nameLocalizations: Object.keys(nameLoc).map((key) => { return { language: key, value: nameLoc[key] }; }),
            guildId: guildId,
            nsfw: builder.nsfw ?? false,
            defaultMemberPermissions: discord.PermissionsBitField.resolve(builder.defaultMemberPermissions ?? ["ViewChannel"]),
            dmPermission: (builder.contexts && builder.contexts.includes(discord.InteractionContextType.BotDM)) ?? false,
            integrationTypes: builder.integrationTypes ?? [discord.ApplicationIntegrationType.GuildInstall],
            contexts: builder.contexts ?? []
        };
    }
    /**Convert a `discord.ApplicationCommand` to a universal Open Ticket context menu object for comparison. */
    convertMenu(cmd) {
        if (cmd.type != discord.ApplicationCommandType.Message && cmd.type != discord.ApplicationCommandType.User)
            return null;
        const nameLoc = cmd.nameLocalizations ?? {};
        return {
            type: cmd.type,
            name: cmd.name,
            nameLocalizations: Object.keys(nameLoc).map((key) => { return { language: key, value: nameLoc[key] }; }),
            guildId: cmd.guildId,
            nsfw: cmd.nsfw,
            defaultMemberPermissions: discord.PermissionsBitField.resolve(cmd.defaultMemberPermissions ?? ["ViewChannel"]),
            dmPermission: (cmd.contexts && cmd.contexts.includes(discord.InteractionContextType.BotDM)) ? true : false,
            integrationTypes: cmd.integrationTypes ?? [discord.ApplicationIntegrationType.GuildInstall],
            contexts: cmd.contexts ?? []
        };
    }
    /**Returns `true` when the 2 context menus are the same. */
    compare(ctxA, ctxB) {
        if (ctxA.name != ctxB.name)
            return false;
        if (ctxA.type != ctxB.type)
            return false;
        if (ctxA.nsfw != ctxB.nsfw)
            return false;
        if (ctxA.guildId != ctxB.guildId)
            return false;
        if (ctxA.dmPermission != ctxB.dmPermission)
            return false;
        if (ctxA.defaultMemberPermissions != ctxB.defaultMemberPermissions)
            return false;
        //nameLocalizations
        if (ctxA.nameLocalizations.length != ctxB.nameLocalizations.length)
            return false;
        if (!ctxA.nameLocalizations.every((nameA) => {
            const nameB = ctxB.nameLocalizations.find((nameB) => nameB.language == nameA.language);
            if (!nameB || nameA.value != nameB.value)
                return false;
            else
                return true;
        }))
            return false;
        //contexts
        if (ctxA.contexts.length != ctxB.contexts.length)
            return false;
        if (!ctxA.contexts.every((contextA) => {
            return ctxB.contexts.includes(contextA);
        }))
            return false;
        //integrationTypes
        if (ctxA.integrationTypes.length != ctxB.integrationTypes.length)
            return false;
        if (!ctxA.integrationTypes.every((integrationA) => {
            return ctxB.integrationTypes.includes(integrationA);
        }))
            return false;
        return true;
    }
}
exports.ODContextMenuComparator = ODContextMenuComparator;
/**## ODContextMenuManager `class`
 * This is an Open Ticket client context menu manager.
 *
 * It's responsible for managing all the context interactions from the client.
 *
 * Here, you can add & remove context interactions & the bot will do the (de)registering.
 */
class ODContextMenuManager extends base_1.ODManager {
    /**Alias to Open Ticket debugger. */
    #debug;
    /**Refrerence to discord.js client. */
    manager;
    /**Discord.js application commands manager. */
    commandManager;
    /**Collection of all interaction listeners. */
    #interactionListeners = [];
    /**Set the soft limit for maximum amount of listeners. A warning will be shown when there are more listeners than this limit. */
    listenerLimit = 100;
    /**A utility class used to compare 2 context menus with each other. */
    comparator = new ODContextMenuComparator();
    constructor(debug, manager) {
        super(debug, "context menu");
        this.#debug = debug;
        this.manager = manager;
        this.commandManager = (manager.client.application) ? manager.client.application.commands : null;
    }
    /**Get all registered & unregistered message context menu commands. */
    async getAllRegisteredMenus(guildId) {
        if (!this.commandManager)
            throw new base_1.ODSystemError("Couldn't get client application to register message context menus!");
        const menus = (await this.commandManager.fetch({ guildId })).toJSON();
        const registered = [];
        const unregistered = [];
        const unused = [];
        await this.loopAll((instance) => {
            if (guildId && instance.guildId != guildId)
                return;
            const index = menus.findIndex((menu) => menu.name == instance.name);
            const menu = menus[index];
            menus.splice(index, 1);
            if (menu) {
                //menu is registered (and may need to be updated)
                const universalBuilder = this.comparator.convertBuilder(instance.builder, instance.guildId);
                const universalMenu = this.comparator.convertMenu(menu);
                //menu is not of the type 'message'|'user'
                if (!universalBuilder || !universalMenu)
                    return;
                const didChange = !this.comparator.compare(universalBuilder, universalMenu);
                const requiresUpdate = didChange || (instance.requiresUpdate ? instance.requiresUpdate(universalMenu) : false);
                registered.push({ instance, menu: universalMenu, requiresUpdate });
                //menu is not registered
            }
            else
                unregistered.push({ instance, menu: null, requiresUpdate: true });
        });
        menus.forEach((menu) => {
            //menu does not exist in the manager (only append to unused when type == 'message'|'user')
            const universalCmd = this.comparator.convertMenu(menu);
            if (!universalCmd)
                return;
            unused.push({ instance: null, menu: universalCmd, requiresUpdate: false });
        });
        return { registered, unregistered, unused };
    }
    /**Create all context menus that are not registered yet.*/
    async createNewMenus(instances, progress) {
        if (!this.manager.ready)
            throw new base_1.ODSystemError("Client isn't ready yet! Unable to register context menus!");
        if (instances.length > 0 && progress) {
            progress.max = instances.length;
            progress.start();
        }
        for (const instance of instances) {
            await this.createMenu(instance);
            this.#debug.debug("Created new context menu", [
                { key: "id", value: instance.id.value },
                { key: "name", value: instance.name },
                { key: "type", value: (instance.builder.type == discord.ApplicationCommandType.Message) ? "message-context" : "user-context" }
            ]);
            if (progress)
                progress.increase(1);
        }
    }
    /**Update all context menus that are already registered. */
    async updateExistingMenus(instances, progress) {
        if (!this.manager.ready)
            throw new base_1.ODSystemError("Client isn't ready yet! Unable to register context menus!");
        if (instances.length > 0 && progress) {
            progress.max = instances.length;
            progress.start();
        }
        for (const instance of instances) {
            await this.createMenu(instance);
            this.#debug.debug("Updated existing context menu", [
                { key: "id", value: instance.id.value },
                { key: "name", value: instance.name },
                { key: "type", value: (instance.builder.type == discord.ApplicationCommandType.Message) ? "message-context" : "user-context" }
            ]);
            if (progress)
                progress.increase(1);
        }
    }
    /**Remove all context menus that are registered but unused by Open Ticket. */
    async removeUnusedMenus(instances, guildId, progress) {
        if (!this.manager.ready)
            throw new base_1.ODSystemError("Client isn't ready yet! Unable to register context menus!");
        if (!this.commandManager)
            throw new base_1.ODSystemError("Couldn't get client application to register context menus!");
        if (instances.length > 0 && progress) {
            progress.max = instances.length;
            progress.start();
        }
        const menus = await this.commandManager.fetch({ guildId });
        for (const instance of instances) {
            const menu = menus.find((menu) => menu.name == instance.name);
            if (menu) {
                try {
                    await menu.delete();
                    this.#debug.debug("Removed existing context menu", [
                        { key: "name", value: menu.name },
                        { key: "guildId", value: guildId ?? "/" },
                        { key: "type", value: (instance.type == discord.ApplicationCommandType.Message) ? "message-context" : "user-context" }
                    ]);
                }
                catch (err) {
                    process.emit("uncaughtException", err);
                    throw new base_1.ODSystemError("Failed to delete context menu '" + menu.name + "'!");
                }
            }
            if (progress)
                progress.increase(1);
        }
    }
    /**Create a context menu. **(SYSTEM ONLY)** => Use `ODContextMenuManager` for registering context menu's the default way! */
    async createMenu(menu) {
        if (!this.commandManager)
            throw new base_1.ODSystemError("Couldn't get client application to register context menu's!");
        try {
            await this.commandManager.create(menu.builder, (menu.guildId ?? undefined));
        }
        catch (err) {
            process.emit("uncaughtException", err);
            throw new base_1.ODSystemError("Failed to register context menu '" + menu.name + "'!");
        }
    }
    /**Start listening to the discord.js client `interactionCreate` event. */
    startListeningToInteractions() {
        this.manager.client.on("interactionCreate", (interaction) => {
            //return when not in main server or DM
            if (!this.manager.mainServer || (interaction.guild && interaction.guild.id != this.manager.mainServer.id))
                return;
            if (!interaction.isContextMenuCommand())
                return;
            const menu = this.getFiltered((menu) => menu.name == interaction.commandName)[0];
            if (!menu)
                return;
            this.#interactionListeners.forEach((listener) => {
                if (typeof listener.name == "string" && (interaction.commandName != listener.name))
                    return;
                else if (listener.name instanceof RegExp && !listener.name.test(interaction.commandName))
                    return;
                //this is a valid listener
                listener.callback(interaction, menu);
            });
        });
    }
    /**Callback on interaction from one or multiple context menu's. */
    onInteraction(menuName, callback) {
        this.#interactionListeners.push({
            name: menuName,
            callback
        });
        if (this.#interactionListeners.length > this.listenerLimit) {
            this.#debug.console.log("Possible context menu interaction memory leak detected!", "warning", [
                { key: "listeners", value: this.#interactionListeners.length.toString() }
            ]);
        }
    }
}
exports.ODContextMenuManager = ODContextMenuManager;
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
class ODContextMenu extends base_1.ODManagerData {
    /**The discord.js builder for this context menu. */
    builder;
    /**The id of the guild this context menu is for. `null` when not set. */
    guildId;
    /**Function to check if the context menu requires to be updated (when it already exists). */
    requiresUpdate = null;
    constructor(id, builder, requiresUpdate, guildId) {
        super(id);
        if (builder.type != discord.ApplicationCommandType.Message && builder.type != discord.ApplicationCommandType.User)
            throw new base_1.ODSystemError("ApplicationCommandData is required to be the 'Message'|'User' type!");
        this.builder = builder;
        this.guildId = guildId ?? null;
        this.requiresUpdate = requiresUpdate ?? null;
    }
    /**The name of this context menu. */
    get name() {
        return this.builder.name;
    }
    set name(name) {
        this.builder.name = name;
    }
}
exports.ODContextMenu = ODContextMenu;
/**## ODAutocompleteManager `class`
 * This is an Open Ticket client autocomplete interaction manager.
 *
 * It's responsible for managing all the autocomplete interactions from the client.
 */
class ODAutocompleteManager {
    /**Alias to Open Ticket debugger. */
    #debug;
    /**Refrerence to discord.js client. */
    manager;
    /**Discord.js application commands manager. */
    commandManager;
    /**Collection of all interaction listeners. */
    #interactionListeners = [];
    /**Set the soft limit for maximum amount of listeners. A warning will be shown when there are more listeners than this limit. */
    listenerLimit = 100;
    constructor(debug, manager) {
        this.#debug = debug;
        this.manager = manager;
        this.commandManager = (manager.client.application) ? manager.client.application.commands : null;
    }
    /**Start listening to the discord.js client `interactionCreate` event. */
    startListeningToInteractions() {
        this.manager.client.on("interactionCreate", (interaction) => {
            //return when not in main server or DM
            if (!this.manager.mainServer || (interaction.guild && interaction.guild.id != this.manager.mainServer.id))
                return;
            if (!interaction.isAutocomplete())
                return;
            this.#interactionListeners.forEach((listener) => {
                if (typeof listener.cmdName == "string" && (interaction.commandName != listener.cmdName))
                    return;
                else if (listener.cmdName instanceof RegExp && !listener.cmdName.test(interaction.commandName))
                    return;
                if (typeof listener.optName == "string" && (interaction.options.getFocused(true).name != listener.optName))
                    return;
                else if (listener.optName instanceof RegExp && !listener.optName.test(interaction.options.getFocused(true).name))
                    return;
                //this is a valid listener
                listener.callback(interaction);
            });
        });
    }
    /**Callback on interaction from one or multiple autocompletes. */
    onInteraction(cmdName, optName, callback) {
        this.#interactionListeners.push({
            cmdName, optName, callback
        });
        if (this.#interactionListeners.length > this.listenerLimit) {
            this.#debug.console.log("Possible autocomplete interaction memory leak detected!", "warning", [
                { key: "listeners", value: this.#interactionListeners.length.toString() }
            ]);
        }
    }
}
exports.ODAutocompleteManager = ODAutocompleteManager;
