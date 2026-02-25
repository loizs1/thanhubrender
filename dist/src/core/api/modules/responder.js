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
exports.ODAutocompleteResponder = exports.ODAutocompleteResponderInstance = exports.ODAutocompleteResponderManager = exports.ODContextMenuResponder = exports.ODContextMenuResponderInstance = exports.ODContextMenuResponderManager = exports.ODModalResponder = exports.ODModalResponderInstance = exports.ODModalResponderInstanceValues = exports.ODModalResponderManager = exports.ODDropdownResponder = exports.ODDropdownResponderInstance = exports.ODDropdownResponderInstanceValues = exports.ODDropdownResponderManager = exports.ODButtonResponder = exports.ODButtonResponderInstance = exports.ODButtonResponderManager = exports.ODCommandResponder = exports.ODCommandResponderInstance = exports.ODCommandResponderInstanceOptions = exports.ODCommandResponderManager = exports.ODResponderManager = exports.ODResponderImplementation = void 0;
///////////////////////////////////////
//RESPONDER MODULE
///////////////////////////////////////
const base_1 = require("./base");
const discord = __importStar(require("discord.js"));
const worker_1 = require("./worker");
const client_1 = require("./client");
/**## ODResponderImplementation `class`
 * This is an Open Ticket responder implementation.
 *
 * It is a basic implementation of the `ODWorkerManager` used by all `ODResponder` classes.
 *
 * This class can't be used stand-alone & needs to be extended from!
 */
class ODResponderImplementation extends base_1.ODManagerData {
    /**The manager that has all workers of this implementation */
    workers;
    /**The `commandName` or `customId` needs to match this string or regex for this responder to be executed. */
    match;
    constructor(id, match, callback, priority, callbackId) {
        super(id);
        this.match = match;
        this.workers = new worker_1.ODWorkerManager("descending");
        if (callback)
            this.workers.add(new worker_1.ODWorker(callbackId ? callbackId : id, priority ?? 0, callback));
    }
    /**Execute all workers & return the result. */
    async respond(instance, source, params) {
        throw new base_1.ODSystemError("Tried to build an unimplemented ODResponderImplementation");
    }
}
exports.ODResponderImplementation = ODResponderImplementation;
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
class ODResponderManager {
    /**A manager for all (text & slash) command responders. */
    commands;
    /**A manager for all button responders. */
    buttons;
    /**A manager for all dropdown/select menu responders. */
    dropdowns;
    /**A manager for all modal responders. */
    modals;
    /**A manager for all context menu responders. */
    contextMenus;
    /**A manager for all autocomplete responders. */
    autocomplete;
    constructor(debug, client) {
        this.commands = new ODCommandResponderManager(debug, "command responder", client);
        this.buttons = new ODButtonResponderManager(debug, "button responder", client);
        this.dropdowns = new ODDropdownResponderManager(debug, "dropdown responder", client);
        this.modals = new ODModalResponderManager(debug, "modal responder", client);
        this.contextMenus = new ODContextMenuResponderManager(debug, "context menu responder", client);
        this.autocomplete = new ODAutocompleteResponderManager(debug, "autocomplete responder", client);
    }
}
exports.ODResponderManager = ODResponderManager;
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
class ODCommandResponderManager extends base_1.ODManager {
    /**An alias to the Open Ticket client manager. */
    #client;
    /**The callback executed when the default workers take too much time to reply. */
    #timeoutErrorCallback = null;
    /**The amount of milliseconds before the timeout error callback is executed. */
    #timeoutMs = null;
    constructor(debug, debugname, client) {
        super(debug, debugname);
        this.#client = client;
    }
    /**Set the message to send when the response times out! */
    setTimeoutErrorCallback(callback, ms) {
        this.#timeoutErrorCallback = callback;
        this.#timeoutMs = ms;
    }
    add(data, overwrite) {
        const res = super.add(data, overwrite);
        //add the callback to the slash command manager
        this.#client.slashCommands.onInteraction(data.match, (interaction, cmd) => {
            const newData = this.get(data.id);
            if (!newData)
                return;
            newData.respond(new ODCommandResponderInstance(interaction, cmd, this.#timeoutErrorCallback, this.#timeoutMs), "slash", {});
        });
        //add the callback to the text command manager
        this.#client.textCommands.onInteraction(data.prefix, data.match, (interaction, cmd, options) => {
            const newData = this.get(data.id);
            if (!newData)
                return;
            newData.respond(new ODCommandResponderInstance(interaction, cmd, this.#timeoutErrorCallback, this.#timeoutMs, options), "text", {});
        });
        return res;
    }
}
exports.ODCommandResponderManager = ODCommandResponderManager;
/**## ODCommandResponderInstanceOptions `class`
 * This is an Open Ticket command responder instance options manager.
 *
 * This class will manage all options & subcommands from slash & text commands.
 */
class ODCommandResponderInstanceOptions {
    /**The interaction to get data from. */
    #interaction;
    /**The command which is related to the interaction. */
    #cmd;
    /**A list of options which have been parsed by the text command parser. */
    #options;
    constructor(interaction, cmd, options) {
        this.#interaction = interaction;
        this.#cmd = cmd;
        this.#options = options ?? [];
    }
    getString(name, required) {
        if (this.#interaction instanceof discord.ChatInputCommandInteraction) {
            try {
                return this.#interaction.options.getString(name, required);
            }
            catch {
                throw new base_1.ODSystemError("ODCommandResponderInstanceOptions:getString() slash command option not found!");
            }
        }
        else if (this.#interaction instanceof discord.Message) {
            const opt = this.#options.find((opt) => opt.type == "string" && opt.name == name);
            if (opt && typeof opt.value == "string")
                return opt.value;
            else
                return null;
        }
        else
            return null;
    }
    getBoolean(name, required) {
        if (this.#interaction instanceof discord.ChatInputCommandInteraction) {
            try {
                return this.#interaction.options.getBoolean(name, required);
            }
            catch {
                throw new base_1.ODSystemError("ODCommandResponderInstanceOptions:getBoolean() slash command option not found!");
            }
        }
        else if (this.#interaction instanceof discord.Message) {
            const opt = this.#options.find((opt) => opt.type == "boolean" && opt.name == name);
            if (opt && typeof opt.value == "boolean")
                return opt.value;
            else
                return null;
        }
        else
            return null;
    }
    getNumber(name, required) {
        if (this.#interaction instanceof discord.ChatInputCommandInteraction) {
            try {
                return this.#interaction.options.getNumber(name, required);
            }
            catch {
                throw new base_1.ODSystemError("ODCommandResponderInstanceOptions:getNumber() slash command option not found!");
            }
        }
        else if (this.#interaction instanceof discord.Message) {
            const opt = this.#options.find((opt) => opt.type == "number" && opt.name == name);
            if (opt && typeof opt.value == "number")
                return opt.value;
            else
                return null;
        }
        else
            return null;
    }
    getChannel(name, required) {
        if (this.#interaction instanceof discord.ChatInputCommandInteraction) {
            try {
                return this.#interaction.options.getChannel(name, required);
            }
            catch {
                throw new base_1.ODSystemError("ODCommandResponderInstanceOptions:getChannel() slash command option not found!");
            }
        }
        else if (this.#interaction instanceof discord.Message) {
            const opt = this.#options.find((opt) => opt.type == "channel" && opt.name == name);
            if (opt && (opt.value instanceof discord.TextChannel || opt.value instanceof discord.VoiceChannel || opt.value instanceof discord.StageChannel || opt.value instanceof discord.NewsChannel || opt.value instanceof discord.MediaChannel || opt.value instanceof discord.ForumChannel || opt.value instanceof discord.CategoryChannel))
                return opt.value;
            else
                return null;
        }
        else
            return null;
    }
    getRole(name, required) {
        if (this.#interaction instanceof discord.ChatInputCommandInteraction) {
            try {
                return this.#interaction.options.getRole(name, required);
            }
            catch {
                throw new base_1.ODSystemError("ODCommandResponderInstanceOptions:getRole() slash command option not found!");
            }
        }
        else if (this.#interaction instanceof discord.Message) {
            const opt = this.#options.find((opt) => opt.type == "role" && opt.name == name);
            if (opt && opt.value instanceof discord.Role)
                return opt.value;
            else
                return null;
        }
        else
            return null;
    }
    getUser(name, required) {
        if (this.#interaction instanceof discord.ChatInputCommandInteraction) {
            try {
                return this.#interaction.options.getUser(name, required);
            }
            catch {
                throw new base_1.ODSystemError("ODCommandResponderInstanceOptions:getUser() slash command option not found!");
            }
        }
        else if (this.#interaction instanceof discord.Message) {
            const opt = this.#options.find((opt) => opt.type == "user" && opt.name == name);
            if (opt && opt.value instanceof discord.User)
                return opt.value;
            else
                return null;
        }
        else
            return null;
    }
    getGuildMember(name, required) {
        if (this.#interaction instanceof discord.ChatInputCommandInteraction) {
            try {
                const member = this.#interaction.options.getMember(name);
                if (!member && required)
                    throw new base_1.ODSystemError("ODCommandResponderInstanceOptions:getGuildMember() slash command option not found!");
                return member;
            }
            catch {
                throw new base_1.ODSystemError("ODCommandResponderInstanceOptions:getGuildMember() slash command option not found!");
            }
        }
        else if (this.#interaction instanceof discord.Message) {
            const opt = this.#options.find((opt) => opt.type == "guildmember" && opt.name == name);
            if (opt && opt.value instanceof discord.GuildMember)
                return opt.value;
            else
                return null;
        }
        else
            return null;
    }
    getMentionable(name, required) {
        if (this.#interaction instanceof discord.ChatInputCommandInteraction) {
            try {
                return this.#interaction.options.getMentionable(name, required);
            }
            catch {
                throw new base_1.ODSystemError("ODCommandResponderInstanceOptions:getGuildMember() slash command option not found!");
            }
        }
        else if (this.#interaction instanceof discord.Message) {
            const opt = this.#options.find((opt) => opt.type == "mentionable" && opt.name == name);
            if (opt && (opt.value instanceof discord.User || opt.value instanceof discord.GuildMember || opt.value instanceof discord.Role))
                return opt.value;
            else
                return null;
        }
        else
            return null;
    }
    getSubGroup() {
        if (this.#interaction instanceof discord.ChatInputCommandInteraction) {
            try {
                return this.#interaction.options.getSubcommandGroup(true);
            }
            catch {
                throw new base_1.ODSystemError("ODCommandResponderInstanceOptions:getSubGroup() slash command option not found!");
            }
        }
        else if (this.#interaction instanceof discord.Message && this.#cmd instanceof client_1.ODTextCommand) {
            //0: name, 1:sub/group, 2:sub
            const splittedName = this.#cmd.builder.name.split(" ");
            return splittedName[1] ?? null;
        }
        else
            return null;
    }
    getSubCommand() {
        if (this.#interaction instanceof discord.ChatInputCommandInteraction) {
            try {
                return this.#interaction.options.getSubcommand(true);
            }
            catch {
                throw new base_1.ODSystemError("ODCommandResponderInstanceOptions:getSubCommand() slash command option not found!");
            }
        }
        else if (this.#interaction instanceof discord.Message && this.#cmd instanceof client_1.ODTextCommand) {
            //0: name, 1:sub/group, 2:sub
            const splittedName = this.#cmd.builder.name.split(" ");
            //return the second subcommand when there is a subgroup
            if (splittedName.length > 2) {
                return splittedName[2] ?? null;
            }
            else
                return splittedName[1] ?? null;
        }
        else
            return null;
    }
}
exports.ODCommandResponderInstanceOptions = ODCommandResponderInstanceOptions;
/**## ODCommandResponderInstance `class`
 * This is an Open Ticket command responder instance.
 *
 * An instance is an active slash interaction or used text command. You can reply to the command using `reply()` for both slash & text commands.
 */
class ODCommandResponderInstance {
    /**The interaction which is the source of this instance. */
    interaction;
    /**The command wich is the source of this instance. */
    cmd;
    /**The type/source of instance. (from text or slash command) */
    type;
    /**Did a worker already reply to this instance/interaction? */
    didReply = false;
    /**The manager for all options of this command. */
    options;
    /**The user who triggered this command. */
    user;
    /**The guild member who triggered this command. */
    member;
    /**The guild where this command was triggered. */
    guild;
    /**The channel where this command was triggered. */
    channel;
    constructor(interaction, cmd, errorCallback, timeoutMs, options) {
        if (!interaction.channel)
            throw new base_1.ODSystemError("ODCommandResponderInstance: Unable to find interaction channel!");
        this.interaction = interaction;
        this.cmd = cmd;
        this.type = (interaction instanceof discord.Message) ? "message" : "interaction";
        this.options = new ODCommandResponderInstanceOptions(interaction, cmd, options);
        this.user = (interaction instanceof discord.Message) ? interaction.author : interaction.user;
        this.member = (interaction.member instanceof discord.GuildMember) ? interaction.member : null;
        this.guild = interaction.guild;
        this.channel = interaction.channel;
        setTimeout(async () => {
            if (!this.didReply) {
                try {
                    if (!errorCallback) {
                        this.reply({ id: new base_1.ODId("looks-like-we-got-an-error-here"), ephemeral: true, message: {
                                content: ":x: **Something went wrong while replying to this command!**"
                            } });
                    }
                    else {
                        await errorCallback(this, (this.type == "interaction") ? "slash" : "text");
                    }
                }
                catch (err) {
                    process.emit("uncaughtException", err);
                }
            }
        }, timeoutMs ?? 2500);
    }
    /**Reply to this command. */
    async reply(msg) {
        try {
            const msgFlags = msg.ephemeral ? [discord.MessageFlags.Ephemeral] : [];
            if (this.type == "interaction" && this.interaction instanceof discord.ChatInputCommandInteraction) {
                if (this.interaction.replied || this.interaction.deferred) {
                    const sent = await this.interaction.editReply(Object.assign(msg.message, { flags: msgFlags }));
                    this.didReply = true;
                    return { success: true, message: sent };
                }
                else {
                    const sent = await this.interaction.reply(Object.assign(msg.message, { flags: msgFlags }));
                    this.didReply = true;
                    return { success: true, message: await sent.fetch() };
                }
            }
            else if (this.type == "message" && this.interaction instanceof discord.Message && this.interaction.channel.type != discord.ChannelType.GroupDM) {
                const sent = await this.interaction.channel.send(msg.message);
                this.didReply = true;
                return { success: true, message: sent };
            }
            else
                return { success: false, message: null };
        }
        catch {
            return { success: false, message: null };
        }
    }
    /**Defer this command. */
    async defer(ephemeral) {
        if (this.type != "interaction" || !(this.interaction instanceof discord.ChatInputCommandInteraction))
            return false;
        if (this.interaction.deferred || this.interaction.replied)
            return false;
        const msgFlags = ephemeral ? [discord.MessageFlags.Ephemeral] : [];
        await this.interaction.deferReply({ flags: msgFlags });
        this.didReply = true;
        return true;
    }
    /**Show a modal as reply to this command. */
    async modal(modal) {
        if (this.type != "interaction" || !(this.interaction instanceof discord.ChatInputCommandInteraction))
            return false;
        if (this.interaction.deferred || this.interaction.replied)
            return false;
        await this.interaction.showModal(modal.modal);
        this.didReply = true;
        return true;
    }
}
exports.ODCommandResponderInstance = ODCommandResponderInstance;
/**## ODCommandResponder `class`
 * This is an Open Ticket command responder.
 *
 * This class manages all workers which are executed when the related command is triggered.
 */
class ODCommandResponder extends ODResponderImplementation {
    /**The prefix of the text command needs to match this */
    prefix;
    constructor(id, prefix, match, callback, priority, callbackId) {
        super(id, match, callback, priority, callbackId);
        this.prefix = prefix;
    }
    /**Respond to this command */
    async respond(instance, source, params) {
        //wait for workers to finish
        await this.workers.executeWorkers(instance, source, params);
    }
}
exports.ODCommandResponder = ODCommandResponder;
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
class ODButtonResponderManager extends base_1.ODManager {
    /**An alias to the Open Ticket client manager. */
    #client;
    /**The callback executed when the default workers take too much time to reply. */
    #timeoutErrorCallback = null;
    /**The amount of milliseconds before the timeout error callback is executed. */
    #timeoutMs = null;
    /**A list of listeners which will listen to the raw interactionCreate event from discord.js */
    #listeners = [];
    constructor(debug, debugname, client) {
        super(debug, debugname);
        this.#client = client;
        this.#client.client.on("interactionCreate", (interaction) => {
            if (!interaction.isButton())
                return;
            this.#listeners.forEach((cb) => cb(interaction));
        });
    }
    /**Set the message to send when the response times out! */
    setTimeoutErrorCallback(callback, ms) {
        this.#timeoutErrorCallback = callback;
        this.#timeoutMs = ms;
    }
    add(data, overwrite) {
        const res = super.add(data, overwrite);
        this.#listeners.push((interaction) => {
            const newData = this.get(data.id);
            if (!newData)
                return;
            if ((typeof newData.match == "string") ? interaction.customId == newData.match : newData.match.test(interaction.customId))
                newData.respond(new ODButtonResponderInstance(interaction, this.#timeoutErrorCallback, this.#timeoutMs), "button", {});
        });
        return res;
    }
}
exports.ODButtonResponderManager = ODButtonResponderManager;
/**## ODButtonResponderInstance `class`
 * This is an Open Ticket button responder instance.
 *
 * An instance is an active button interaction. You can reply to the button using `reply()`.
 */
class ODButtonResponderInstance {
    /**The interaction which is the source of this instance. */
    interaction;
    /**Did a worker already reply to this instance/interaction? */
    didReply = false;
    /**The user who triggered this button. */
    user;
    /**The guild member who triggered this button. */
    member;
    /**The guild where this button was triggered. */
    guild;
    /**The channel where this button was triggered. */
    channel;
    /**The message this button originates from. */
    message;
    constructor(interaction, errorCallback, timeoutMs) {
        if (!interaction.channel)
            throw new base_1.ODSystemError("ODButtonResponderInstance: Unable to find interaction channel!");
        this.interaction = interaction;
        this.user = interaction.user;
        this.member = (interaction.member instanceof discord.GuildMember) ? interaction.member : null;
        this.guild = interaction.guild;
        this.channel = interaction.channel;
        this.message = interaction.message;
        setTimeout(async () => {
            if (!this.didReply) {
                try {
                    if (!errorCallback) {
                        this.reply({ id: new base_1.ODId("looks-like-we-got-an-error-here"), ephemeral: true, message: {
                                content: ":x: **Something went wrong while replying to this button!**"
                            } });
                    }
                    else {
                        await errorCallback(this, "button");
                    }
                }
                catch (err) {
                    process.emit("uncaughtException", err);
                }
            }
        }, timeoutMs ?? 2500);
    }
    /**Reply to this button. */
    async reply(msg) {
        try {
            const msgFlags = msg.ephemeral ? [discord.MessageFlags.Ephemeral] : [];
            if (this.interaction.replied || this.interaction.deferred) {
                const sent = await this.interaction.editReply(Object.assign(msg.message, { flags: msgFlags }));
                this.didReply = true;
                return { success: true, message: sent };
            }
            else {
                const sent = await this.interaction.reply(Object.assign(msg.message, { flags: msgFlags }));
                this.didReply = true;
                return { success: true, message: await sent.fetch() };
            }
        }
        catch {
            return { success: false, message: null };
        }
    }
    /**Update the message of this button. */
    async update(msg) {
        try {
            const msgFlags = msg.ephemeral ? [discord.MessageFlags.Ephemeral] : [];
            if (this.interaction.replied || this.interaction.deferred) {
                const sent = await this.interaction.editReply(Object.assign(msg.message, { flags: msgFlags }));
                this.didReply = true;
                return { success: true, message: await sent.fetch() };
            }
            else {
                const sent = await this.interaction.update(Object.assign(msg.message, { flags: msgFlags }));
                this.didReply = true;
                return { success: true, message: await sent.fetch() };
            }
        }
        catch {
            return { success: false, message: null };
        }
    }
    /**Defer this button. */
    async defer(type, ephemeral) {
        if (this.interaction.deferred || this.interaction.replied)
            return false;
        if (type == "reply") {
            const msgFlags = ephemeral ? [discord.MessageFlags.Ephemeral] : [];
            await this.interaction.deferReply({ flags: msgFlags });
        }
        else {
            await this.interaction.deferUpdate();
        }
        this.didReply = true;
        return true;
    }
    /**Show a modal as reply to this button. */
    async modal(modal) {
        if (this.interaction.deferred || this.interaction.replied)
            return false;
        await this.interaction.showModal(modal.modal);
        this.didReply = true;
        return true;
    }
    getMessageComponent(type, id) {
        let result = null;
        this.message.components.forEach((row) => {
            if (row.type != discord.ComponentType.ActionRow)
                return;
            row.components.forEach((component) => {
                if (type == "button" && component.type == discord.ComponentType.Button && component.customId && ((typeof id == "string") ? component.customId == id : id.test(component.customId)))
                    result = component;
                else if (type == "string-dropdown" && component.type == discord.ComponentType.StringSelect && component.customId && ((typeof id == "string") ? component.customId == id : id.test(component.customId)))
                    result = component;
                else if (type == "user-dropdown" && component.type == discord.ComponentType.UserSelect && component.customId && ((typeof id == "string") ? component.customId == id : id.test(component.customId)))
                    result = component;
                else if (type == "channel-dropdown" && component.type == discord.ComponentType.ChannelSelect && component.customId && ((typeof id == "string") ? component.customId == id : id.test(component.customId)))
                    result = component;
                else if (type == "role-dropdown" && component.type == discord.ComponentType.RoleSelect && component.customId && ((typeof id == "string") ? component.customId == id : id.test(component.customId)))
                    result = component;
                else if (type == "mentionable-dropdown" && component.type == discord.ComponentType.MentionableSelect && component.customId && ((typeof id == "string") ? component.customId == id : id.test(component.customId)))
                    result = component;
            });
        });
        return result;
    }
    /**Get the first embed of the original message if it exists. */
    getMessageEmbed() {
        return this.message.embeds[0] ?? null;
    }
}
exports.ODButtonResponderInstance = ODButtonResponderInstance;
/**## ODButtonResponder `class`
 * This is an Open Ticket button responder.
 *
 * This class manages all workers which are executed when the related button is triggered.
 */
class ODButtonResponder extends ODResponderImplementation {
    /**Respond to this button */
    async respond(instance, source, params) {
        //wait for workers to finish
        await this.workers.executeWorkers(instance, source, params);
    }
}
exports.ODButtonResponder = ODButtonResponder;
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
class ODDropdownResponderManager extends base_1.ODManager {
    /**An alias to the Open Ticket client manager. */
    #client;
    /**The callback executed when the default workers take too much time to reply. */
    #timeoutErrorCallback = null;
    /**The amount of milliseconds before the timeout error callback is executed. */
    #timeoutMs = null;
    /**A list of listeners which will listen to the raw interactionCreate event from discord.js */
    #listeners = [];
    constructor(debug, debugname, client) {
        super(debug, debugname);
        this.#client = client;
        this.#client.client.on("interactionCreate", (interaction) => {
            if (!interaction.isAnySelectMenu())
                return;
            this.#listeners.forEach((cb) => cb(interaction));
        });
    }
    /**Set the message to send when the response times out! */
    setTimeoutErrorCallback(callback, ms) {
        this.#timeoutErrorCallback = callback;
        this.#timeoutMs = ms;
    }
    add(data, overwrite) {
        const res = super.add(data, overwrite);
        this.#listeners.push((interaction) => {
            const newData = this.get(data.id);
            if (!newData)
                return;
            if ((typeof newData.match == "string") ? interaction.customId == newData.match : newData.match.test(interaction.customId))
                newData.respond(new ODDropdownResponderInstance(interaction, this.#timeoutErrorCallback, this.#timeoutMs), "dropdown", {});
        });
        return res;
    }
}
exports.ODDropdownResponderManager = ODDropdownResponderManager;
/**## ODDropdownResponderInstanceValues `class`
 * This is an Open Ticket dropdown responder instance values manager.
 *
 * This class will manage all values from the dropdowns & select menus.
 */
class ODDropdownResponderInstanceValues {
    /**The interaction to get data from. */
    #interaction;
    /**The type of this dropdown. */
    #type;
    constructor(interaction, type) {
        this.#interaction = interaction;
        this.#type = type;
        if (interaction.isChannelSelectMenu()) {
            interaction.values;
        }
    }
    /**Get the selected values. */
    getStringValues() {
        try {
            return this.#interaction.values;
        }
        catch {
            throw new base_1.ODSystemError("ODDropdownResponderInstanceValues:getStringValues() invalid values!");
        }
    }
    /**Get the selected roles. */
    async getRoleValues() {
        if (this.#type != "role")
            throw new base_1.ODSystemError("ODDropdownResponderInstanceValues:getRoleValues() dropdown type isn't role!");
        try {
            const result = [];
            for (const id of this.#interaction.values) {
                if (!this.#interaction.guild)
                    break;
                const role = await this.#interaction.guild.roles.fetch(id);
                if (role)
                    result.push(role);
            }
            return result;
        }
        catch {
            throw new base_1.ODSystemError("ODDropdownResponderInstanceValues:getRoleValues() invalid values!");
        }
    }
    /**Get the selected users. */
    async getUserValues() {
        if (this.#type != "role")
            throw new base_1.ODSystemError("ODDropdownResponderInstanceValues:getUserValues() dropdown type isn't user!");
        try {
            const result = [];
            for (const id of this.#interaction.values) {
                const user = await this.#interaction.client.users.fetch(id);
                if (user)
                    result.push(user);
            }
            return result;
        }
        catch {
            throw new base_1.ODSystemError("ODDropdownResponderInstanceValues:getUserValues() invalid values!");
        }
    }
    /**Get the selected channels. */
    async getChannelValues() {
        if (this.#type != "role")
            throw new base_1.ODSystemError("ODDropdownResponderInstanceValues:getChannelValues() dropdown type isn't channel!");
        try {
            const result = [];
            for (const id of this.#interaction.values) {
                if (!this.#interaction.guild)
                    break;
                const guild = await this.#interaction.guild.channels.fetch(id);
                if (guild)
                    result.push(guild);
            }
            return result;
        }
        catch {
            throw new base_1.ODSystemError("ODDropdownResponderInstanceValues:getChannelValues() invalid values!");
        }
    }
}
exports.ODDropdownResponderInstanceValues = ODDropdownResponderInstanceValues;
/**## ODDropdownResponderInstance `class`
 * This is an Open Ticket dropdown responder instance.
 *
 * An instance is an active dropdown interaction. You can reply to the dropdown using `reply()`.
 */
class ODDropdownResponderInstance {
    /**The interaction which is the source of this instance. */
    interaction;
    /**Did a worker already reply to this instance/interaction? */
    didReply = false;
    /**The dropdown type. */
    type;
    /**The manager for all values of this dropdown. */
    values;
    /**The user who triggered this dropdown. */
    user;
    /**The guild member who triggered this dropdown. */
    member;
    /**The guild where this dropdown was triggered. */
    guild;
    /**The channel where this dropdown was triggered. */
    channel;
    /**The message this dropdown originates from. */
    message;
    constructor(interaction, errorCallback, timeoutMs) {
        if (!interaction.channel)
            throw new base_1.ODSystemError("ODDropdownResponderInstance: Unable to find interaction channel!");
        this.interaction = interaction;
        if (interaction.isStringSelectMenu()) {
            this.type = "string";
        }
        else if (interaction.isRoleSelectMenu()) {
            this.type = "role";
        }
        else if (interaction.isUserSelectMenu()) {
            this.type = "user";
        }
        else if (interaction.isChannelSelectMenu()) {
            this.type = "channel";
        }
        else if (interaction.isMentionableSelectMenu()) {
            this.type = "mentionable";
        }
        else
            throw new base_1.ODSystemError("ODDropdownResponderInstance: invalid dropdown type!");
        this.values = new ODDropdownResponderInstanceValues(interaction, this.type);
        this.user = interaction.user;
        this.member = (interaction.member instanceof discord.GuildMember) ? interaction.member : null;
        this.guild = interaction.guild;
        this.channel = interaction.channel;
        this.message = interaction.message;
        setTimeout(async () => {
            if (!this.didReply) {
                try {
                    if (!errorCallback) {
                        this.reply({ id: new base_1.ODId("looks-like-we-got-an-error-here"), ephemeral: true, message: {
                                content: ":x: **Something went wrong while replying to this dropdown!**"
                            } });
                    }
                    else {
                        await errorCallback(this, "dropdown");
                    }
                }
                catch (err) {
                    process.emit("uncaughtException", err);
                }
            }
        }, timeoutMs ?? 2500);
    }
    /**Reply to this dropdown. */
    async reply(msg) {
        try {
            const msgFlags = msg.ephemeral ? [discord.MessageFlags.Ephemeral] : [];
            if (this.interaction.replied || this.interaction.deferred) {
                const sent = await this.interaction.editReply(Object.assign(msg.message, { flags: msgFlags }));
                this.didReply = true;
                return { success: true, message: sent };
            }
            else {
                const sent = await this.interaction.reply(Object.assign(msg.message, { flags: msgFlags }));
                this.didReply = true;
                return { success: true, message: await sent.fetch() };
            }
        }
        catch {
            return { success: false, message: null };
        }
    }
    /**Update the message of this dropdown. */
    async update(msg) {
        try {
            const msgFlags = msg.ephemeral ? [discord.MessageFlags.Ephemeral] : [];
            if (this.interaction.replied || this.interaction.deferred) {
                const sent = await this.interaction.editReply(Object.assign(msg.message, { flags: msgFlags }));
                this.didReply = true;
                return { success: true, message: await sent.fetch() };
            }
            else {
                const sent = await this.interaction.update(Object.assign(msg.message, { flags: msgFlags }));
                this.didReply = true;
                return { success: true, message: await sent.fetch() };
            }
        }
        catch {
            return { success: false, message: null };
        }
    }
    /**Defer this dropdown. */
    async defer(type, ephemeral) {
        if (this.interaction.deferred || this.interaction.replied)
            return false;
        if (type == "reply") {
            const msgFlags = ephemeral ? [discord.MessageFlags.Ephemeral] : [];
            await this.interaction.deferReply({ flags: msgFlags });
        }
        else {
            await this.interaction.deferUpdate();
        }
        this.didReply = true;
        return true;
    }
    /**Show a modal as reply to this dropdown. */
    async modal(modal) {
        if (this.interaction.deferred || this.interaction.replied)
            return false;
        await this.interaction.showModal(modal.modal);
        this.didReply = true;
        return true;
    }
    getMessageComponent(type, id) {
        let result = null;
        this.message.components.forEach((row) => {
            if (row.type != discord.ComponentType.ActionRow)
                return;
            row.components.forEach((component) => {
                if (type == "button" && component.type == discord.ComponentType.Button && component.customId && ((typeof id == "string") ? component.customId == id : id.test(component.customId)))
                    result = component;
                else if (type == "string-dropdown" && component.type == discord.ComponentType.StringSelect && component.customId && ((typeof id == "string") ? component.customId == id : id.test(component.customId)))
                    result = component;
                else if (type == "user-dropdown" && component.type == discord.ComponentType.UserSelect && component.customId && ((typeof id == "string") ? component.customId == id : id.test(component.customId)))
                    result = component;
                else if (type == "channel-dropdown" && component.type == discord.ComponentType.ChannelSelect && component.customId && ((typeof id == "string") ? component.customId == id : id.test(component.customId)))
                    result = component;
                else if (type == "role-dropdown" && component.type == discord.ComponentType.RoleSelect && component.customId && ((typeof id == "string") ? component.customId == id : id.test(component.customId)))
                    result = component;
                else if (type == "mentionable-dropdown" && component.type == discord.ComponentType.MentionableSelect && component.customId && ((typeof id == "string") ? component.customId == id : id.test(component.customId)))
                    result = component;
            });
        });
        return result;
    }
    /**Get the first embed of the original message if it exists. */
    getMessageEmbed() {
        return this.message.embeds[0] ?? null;
    }
}
exports.ODDropdownResponderInstance = ODDropdownResponderInstance;
/**## ODDropdownResponder `class`
 * This is an Open Ticket dropdown responder.
 *
 * This class manages all workers which are executed when the related dropdown is triggered.
 */
class ODDropdownResponder extends ODResponderImplementation {
    /**Respond to this dropdown */
    async respond(instance, source, params) {
        //wait for workers to finish
        await this.workers.executeWorkers(instance, source, params);
    }
}
exports.ODDropdownResponder = ODDropdownResponder;
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
class ODModalResponderManager extends base_1.ODManager {
    /**An alias to the Open Ticket client manager. */
    #client;
    /**The callback executed when the default workers take too much time to reply. */
    #timeoutErrorCallback = null;
    /**The amount of milliseconds before the timeout error callback is executed. */
    #timeoutMs = null;
    /**A list of listeners which will listen to the raw interactionCreate event from discord.js */
    #listeners = [];
    constructor(debug, debugname, client) {
        super(debug, debugname);
        this.#client = client;
        this.#client.client.on("interactionCreate", (interaction) => {
            if (!interaction.isModalSubmit())
                return;
            this.#listeners.forEach((cb) => cb(interaction));
        });
    }
    /**Set the message to send when the response times out! */
    setTimeoutErrorCallback(callback, ms) {
        this.#timeoutErrorCallback = callback;
        this.#timeoutMs = ms;
    }
    add(data, overwrite) {
        const res = super.add(data, overwrite);
        this.#listeners.push((interaction) => {
            const newData = this.get(data.id);
            if (!newData)
                return;
            if ((typeof newData.match == "string") ? interaction.customId == newData.match : newData.match.test(interaction.customId))
                newData.respond(new ODModalResponderInstance(interaction, this.#timeoutErrorCallback, this.#timeoutMs), "modal", {});
        });
        return res;
    }
}
exports.ODModalResponderManager = ODModalResponderManager;
/**## ODModalResponderInstanceValues `class`
 * This is an Open Ticket modal responder instance values manager.
 *
 * This class will manage all fields from the modals.
 */
class ODModalResponderInstanceValues {
    /**The interaction to get data from. */
    #interaction;
    constructor(interaction) {
        this.#interaction = interaction;
    }
    getTextField(name, required) {
        try {
            const data = this.#interaction.fields.getField(name, discord.ComponentType.TextInput);
            if (!data && required)
                throw new base_1.ODSystemError("ODModalResponderInstanceValues:getTextField() field not found!");
            return (data) ? data.value : null;
        }
        catch {
            throw new base_1.ODSystemError("ODModalResponderInstanceValues:getTextField() field not found!");
        }
    }
}
exports.ODModalResponderInstanceValues = ODModalResponderInstanceValues;
/**## ODModalResponderInstance `class`
 * This is an Open Ticket modal responder instance.
 *
 * An instance is an active modal interaction. You can reply to the modal using `reply()`.
 */
class ODModalResponderInstance {
    /**The interaction which is the source of this instance. */
    interaction;
    /**Did a worker already reply to this instance/interaction? */
    didReply = false;
    /**The manager for all fields of this modal. */
    values;
    /**The user who triggered this modal. */
    user;
    /**The guild member who triggered this modal. */
    member;
    /**The guild where this modal was triggered. */
    guild;
    /**The channel where this modal was triggered. */
    channel;
    constructor(interaction, errorCallback, timeoutMs) {
        this.interaction = interaction;
        this.values = new ODModalResponderInstanceValues(interaction);
        this.user = interaction.user;
        this.member = (interaction.member instanceof discord.GuildMember) ? interaction.member : null;
        this.guild = interaction.guild;
        this.channel = interaction.channel;
        setTimeout(async () => {
            if (!this.didReply) {
                try {
                    if (!errorCallback) {
                        this.reply({ id: new base_1.ODId("looks-like-we-got-an-error-here"), ephemeral: true, message: {
                                content: ":x: **Something went wrong while replying to this modal!**"
                            } });
                    }
                    else {
                        await errorCallback(this, "modal");
                    }
                }
                catch (err) {
                    process.emit("uncaughtException", err);
                }
            }
        }, timeoutMs ?? 2500);
    }
    /**Reply to this modal. */
    async reply(msg) {
        try {
            const msgFlags = msg.ephemeral ? [discord.MessageFlags.Ephemeral] : [];
            const sent = await this.interaction.followUp(Object.assign(msg.message, { flags: msgFlags }));
            this.didReply = true;
            return { success: true, message: sent };
        }
        catch {
            return { success: false, message: null };
        }
    }
    /**Update the message of this modal. */
    async update(msg) {
        try {
            const msgFlags = msg.ephemeral ? [discord.MessageFlags.Ephemeral] : [];
            if (this.interaction.replied || this.interaction.deferred) {
                const sent = await this.interaction.editReply(Object.assign(msg.message, { flags: msgFlags }));
                this.didReply = true;
                return { success: true, message: await sent.fetch() };
            }
            else {
                const sent = await this.interaction.reply(Object.assign(msg.message, { flags: msgFlags }));
                this.didReply = true;
                return { success: true, message: await sent.fetch() };
            }
        }
        catch {
            return { success: false, message: null };
        }
    }
    /**Defer this modal. */
    async defer(type, ephemeral) {
        if (this.interaction.deferred || this.interaction.replied)
            return false;
        if (type == "reply") {
            const msgFlags = ephemeral ? [discord.MessageFlags.Ephemeral] : [];
            await this.interaction.deferReply({ flags: msgFlags });
        }
        else {
            await this.interaction.deferUpdate();
        }
        this.didReply = true;
        return true;
    }
}
exports.ODModalResponderInstance = ODModalResponderInstance;
/**## ODModalResponder `class`
 * This is an Open Ticket modal responder.
 *
 * This class manages all workers which are executed when the related modal is triggered.
 */
class ODModalResponder extends ODResponderImplementation {
    /**Respond to this modal */
    async respond(instance, source, params) {
        //wait for workers to finish
        await this.workers.executeWorkers(instance, source, params);
    }
}
exports.ODModalResponder = ODModalResponder;
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
class ODContextMenuResponderManager extends base_1.ODManager {
    /**An alias to the Open Ticket client manager. */
    #client;
    /**The callback executed when the default workers take too much time to reply. */
    #timeoutErrorCallback = null;
    /**The amount of milliseconds before the timeout error callback is executed. */
    #timeoutMs = null;
    constructor(debug, debugname, client) {
        super(debug, debugname);
        this.#client = client;
    }
    /**Set the message to send when the response times out! */
    setTimeoutErrorCallback(callback, ms) {
        this.#timeoutErrorCallback = callback;
        this.#timeoutMs = ms;
    }
    add(data, overwrite) {
        const res = super.add(data, overwrite);
        this.#client.contextMenus.onInteraction(data.match, (interaction, cmd) => {
            const newData = this.get(data.id);
            if (!newData)
                return;
            newData.respond(new ODContextMenuResponderInstance(interaction, cmd, this.#timeoutErrorCallback, this.#timeoutMs), "context-menu", {});
        });
        return res;
    }
}
exports.ODContextMenuResponderManager = ODContextMenuResponderManager;
/**## ODContextMenuResponderInstance `class`
 * This is an Open Ticket context menu responder instance.
 *
 * An instance is an active context menu interaction. You can reply to the context menu using `reply()`.
 */
class ODContextMenuResponderInstance {
    /**The interaction which is the source of this instance. */
    interaction;
    /**Did a worker already reply to this instance/interaction? */
    didReply = false;
    /**The context menu wich is the source of this instance. */
    menu;
    /**The user who triggered this context menu. */
    user;
    /**The guild member who triggered this context menu. */
    member;
    /**The guild where this context menu was triggered. */
    guild;
    /**The channel where this context menu was triggered. */
    channel;
    /**The target of this context menu (user or message). */
    target;
    constructor(interaction, menu, errorCallback, timeoutMs) {
        if (!interaction.channel)
            throw new base_1.ODSystemError("ODContextMenuResponderInstance: Unable to find interaction channel!");
        this.interaction = interaction;
        this.menu = menu;
        this.user = interaction.user;
        this.member = (interaction.member instanceof discord.GuildMember) ? interaction.member : null;
        this.guild = interaction.guild;
        this.channel = interaction.channel;
        if (interaction.isMessageContextMenuCommand())
            this.target = interaction.targetMessage;
        else if (interaction.isUserContextMenuCommand())
            this.target = interaction.targetUser;
        else
            throw new base_1.ODSystemError("ODContextMenuResponderInstance: Invalid context menu type. Should be of the type User/Message!");
        setTimeout(async () => {
            if (!this.didReply) {
                try {
                    if (!errorCallback) {
                        this.reply({ id: new base_1.ODId("looks-like-we-got-an-error-here"), ephemeral: true, message: {
                                content: ":x: **Something went wrong while replying to this context menu!**"
                            } });
                    }
                    else {
                        await errorCallback(this, "context-menu");
                    }
                }
                catch (err) {
                    process.emit("uncaughtException", err);
                }
            }
        }, timeoutMs ?? 2500);
    }
    /**Reply to this context menu. */
    async reply(msg) {
        try {
            const msgFlags = msg.ephemeral ? [discord.MessageFlags.Ephemeral] : [];
            if (this.interaction.replied || this.interaction.deferred) {
                const sent = await this.interaction.editReply(Object.assign(msg.message, { flags: msgFlags }));
                this.didReply = true;
                return { success: true, message: sent };
            }
            else {
                const sent = await this.interaction.reply(Object.assign(msg.message, { flags: msgFlags }));
                this.didReply = true;
                return { success: true, message: await sent.fetch() };
            }
        }
        catch {
            return { success: false, message: null };
        }
    }
    /**Update the message of this context menu. */
    async update(msg) {
        try {
            const msgFlags = msg.ephemeral ? [discord.MessageFlags.Ephemeral] : [];
            if (this.interaction.replied || this.interaction.deferred) {
                const sent = await this.interaction.editReply(Object.assign(msg.message, { flags: msgFlags }));
                this.didReply = true;
                return { success: true, message: await sent.fetch() };
            }
            else
                throw new base_1.ODSystemError("Unable to update context menu interaction!");
        }
        catch {
            return { success: false, message: null };
        }
    }
    /**Defer this context menu. */
    async defer(type, ephemeral) {
        if (this.interaction.deferred || this.interaction.replied)
            return false;
        if (type == "reply") {
            const msgFlags = ephemeral ? [discord.MessageFlags.Ephemeral] : [];
            await this.interaction.deferReply({ flags: msgFlags });
        }
        this.didReply = true;
        return true;
    }
    /**Show a modal as reply to this context menu. */
    async modal(modal) {
        if (this.interaction.deferred || this.interaction.replied)
            return false;
        await this.interaction.showModal(modal.modal);
        this.didReply = true;
        return true;
    }
}
exports.ODContextMenuResponderInstance = ODContextMenuResponderInstance;
/**## ODContextMenuResponder `class`
 * This is an Open Ticket context menu responder.
 *
 * This class manages all workers which are executed when the related context menu is triggered.
 */
class ODContextMenuResponder extends ODResponderImplementation {
    /**Respond to this button */
    async respond(instance, source, params) {
        //wait for workers to finish
        await this.workers.executeWorkers(instance, source, params);
    }
}
exports.ODContextMenuResponder = ODContextMenuResponder;
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
class ODAutocompleteResponderManager extends base_1.ODManager {
    /**An alias to the Open Ticket client manager. */
    #client;
    /**The callback executed when the default workers take too much time to reply. */
    #timeoutErrorCallback = null;
    /**The amount of milliseconds before the timeout error callback is executed. */
    #timeoutMs = null;
    constructor(debug, debugname, client) {
        super(debug, debugname);
        this.#client = client;
    }
    /**Set the message to send when the response times out! */
    setTimeoutErrorCallback(callback, ms) {
        this.#timeoutErrorCallback = callback;
        this.#timeoutMs = ms;
    }
    add(data, overwrite) {
        const res = super.add(data, overwrite);
        this.#client.autocompletes.onInteraction(data.cmdMatch, data.match, (interaction) => {
            const newData = this.get(data.id);
            if (!newData)
                return;
            newData.respond(new ODAutocompleteResponderInstance(interaction, this.#timeoutErrorCallback, this.#timeoutMs), "autocomplete", {});
        });
        return res;
    }
}
exports.ODAutocompleteResponderManager = ODAutocompleteResponderManager;
/**## ODAutocompleteResponderInstance `class`
 * This is an Open Ticket autocomplete responder instance.
 *
 * An instance is an active autocomplete interaction. You can reply to the autocomplete using `reply()`.
 */
class ODAutocompleteResponderInstance {
    /**The interaction which is the source of this instance. */
    interaction;
    /**Did a worker already respond to this instance/interaction? */
    didRespond = false;
    /**The user who triggered this autocomplete. */
    user;
    /**The guild member who triggered this autocomplete. */
    member;
    /**The guild where this autocomplete was triggered. */
    guild;
    /**The channel where this autocomplete was triggered. */
    channel;
    /**The target slash command option of this autocomplete. */
    target;
    constructor(interaction, errorCallback, timeoutMs) {
        if (!interaction.channel)
            throw new base_1.ODSystemError("ODAutocompleteResponderInstance: Unable to find interaction channel!");
        this.interaction = interaction;
        this.user = interaction.user;
        this.member = (interaction.member instanceof discord.GuildMember) ? interaction.member : null;
        this.guild = interaction.guild;
        this.channel = interaction.channel;
        this.target = interaction.options.getFocused(true);
        setTimeout(async () => {
            if (!this.didRespond) {
                process.emit("uncaughtException", new base_1.ODSystemError("Autocomplete responder instance failed to respond widthin 2.5sec!"));
            }
        }, timeoutMs ?? 2500);
    }
    /**Reply to this autocomplete. */
    async autocomplete(choices) {
        const newChoices = choices.map((raw) => {
            if (typeof raw == "string")
                return { name: raw, value: raw };
            else
                return raw;
        });
        try {
            if (this.interaction.responded) {
                return { success: false };
            }
            else {
                await this.interaction.respond(newChoices);
                this.didRespond = true;
                return { success: true };
            }
        }
        catch (err) {
            process.emit("uncaughtException", err);
            return { success: false };
        }
    }
    /**Reply to this autocomplete, but filter choices based on the input of the user. */
    async filteredAutocomplete(choices) {
        const newChoices = choices.map((raw) => {
            if (typeof raw == "string")
                return { name: raw, value: raw };
            else
                return raw;
        });
        const filteredChoices = newChoices.filter((choice) => choice.name.startsWith(this.target.value) || choice.value.toString().startsWith(this.target.value)).slice(0, 25);
        return await this.autocomplete(filteredChoices);
    }
}
exports.ODAutocompleteResponderInstance = ODAutocompleteResponderInstance;
/**## ODAutocompleteResponder `class`
 * This is an Open Ticket autocomplete responder.
 *
 * This class manages all workers which are executed when the related autocomplete is triggered.
 */
class ODAutocompleteResponder extends ODResponderImplementation {
    /**The slash command of the autocomplete should match the following regex. */
    cmdMatch;
    constructor(id, cmdMatch, match, callback, priority, callbackId) {
        super(id, match, callback, priority, callbackId);
        this.cmdMatch = cmdMatch;
    }
    /**Respond to this autocomplete interaction. */
    async respond(instance, source, params) {
        //wait for workers to finish
        await this.workers.executeWorkers(instance, source, params);
    }
}
exports.ODAutocompleteResponder = ODAutocompleteResponder;
