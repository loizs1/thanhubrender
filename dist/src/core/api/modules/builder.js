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
exports.ODModal = exports.ODModalInstance = exports.ODModalManager = exports.ODQuickMessage = exports.ODMessage = exports.ODMessageInstance = exports.ODMessageManager = exports.ODQuickEmbed = exports.ODEmbed = exports.ODEmbedInstance = exports.ODEmbedManager = exports.ODQuickFile = exports.ODFile = exports.ODFileInstance = exports.ODFileManager = exports.ODQuickDropdown = exports.ODDropdown = exports.ODDropdownInstance = exports.ODDropdownManager = exports.ODQuickButton = exports.ODButton = exports.ODButtonInstance = exports.ODButtonManager = exports.ODBuilderManager = exports.ODBuilderImplementation = void 0;
///////////////////////////////////////
//BUILDER MODULE
///////////////////////////////////////
const base_1 = require("./base");
const discord = __importStar(require("discord.js"));
const worker_1 = require("./worker");
/**## ODBuilderImplementation `class`
 * This is an Open Ticket builder implementation.
 *
 * It is a basic implementation of the `ODWorkerManager` used by all `ODBuilder` classes.
 *
 * This class can't be used stand-alone & needs to be extended from!
 */
class ODBuilderImplementation extends base_1.ODManagerData {
    /**The manager that has all workers of this implementation */
    workers;
    /**Cache a build or create it every time from scratch when this.build() gets executed. */
    allowCache = false;
    /**Did the build already got created/cached? */
    didCache = false;
    /**The cache of this build. */
    cache = null;
    constructor(id, callback, priority, callbackId) {
        super(id);
        this.workers = new worker_1.ODWorkerManager("ascending");
        if (callback)
            this.workers.add(new worker_1.ODWorker(callbackId ? callbackId : id, priority ?? 0, callback));
    }
    /**Set if caching is allowed */
    setCacheMode(allowed) {
        this.allowCache = allowed;
        this.resetCache();
        return this;
    }
    /**Reset the current cache */
    resetCache() {
        this.cache = null;
        this.didCache = false;
        return this;
    }
    /**Execute all workers & return the result. */
    async build(source, params) {
        throw new base_1.ODSystemError("Tried to build an unimplemented ODBuilderImplementation");
    }
}
exports.ODBuilderImplementation = ODBuilderImplementation;
/**## ODBuilderManager `class`
 * This is an Open Ticket builder manager.
 *
 * It contains all Open Ticket builders. You can find messages, embeds, files & dropdowns, buttons & modals all here!
 *
 * Using the Open Ticket builder system has a few advantages compared to vanilla discord.js:
 * - plugins can extend/edit messages
 * - automatically reply on error
 * - independent workers (with priority)
 * - fail-safe design using try-catch
 * - cache frequently used objects
 * - get to know the source of the build request for a specific message, button, etc
 * - And so much more!
 */
class ODBuilderManager {
    /**The manager for all button builders */
    buttons;
    /**The manager for all dropdown builders */
    dropdowns;
    /**The manager for all file/attachment builders */
    files;
    /**The manager for all embed builders */
    embeds;
    /**The manager for all message builders */
    messages;
    /**The manager for all modal builders */
    modals;
    constructor(debug) {
        this.buttons = new ODButtonManager(debug);
        this.dropdowns = new ODDropdownManager(debug);
        this.files = new ODFileManager(debug);
        this.embeds = new ODEmbedManager(debug);
        this.messages = new ODMessageManager(debug);
        this.modals = new ODModalManager(debug);
    }
}
exports.ODBuilderManager = ODBuilderManager;
/**## ODButtonManager `class`
 * This is an Open Ticket button manager.
 *
 * It contains all Open Ticket button builders. Here, you can add your own buttons or edit existing ones!
 *
 * It's recommended to use this system in combination with all the other Open Ticket builders!
 */
class ODButtonManager extends base_1.ODManagerWithSafety {
    constructor(debug) {
        super(() => {
            return new ODButton("opendiscord:unknown-button", (instance, params, source, cancel) => {
                instance.setCustomId("od:unknown-button");
                instance.setMode("button");
                instance.setColor("red");
                instance.setLabel("<ODError:Unknown Button>");
                instance.setEmoji("✖");
                instance.setDisabled(true);
                cancel();
            });
        }, debug, "button");
    }
    /**Get a newline component for buttons & dropdowns! */
    getNewLine(id) {
        return {
            id: new base_1.ODId(id),
            component: "\n"
        };
    }
}
exports.ODButtonManager = ODButtonManager;
/**## ODButtonInstance `class`
 * This is an Open Ticket button instance.
 *
 * It contains all properties & functions to build a button!
 */
class ODButtonInstance {
    /**The current data of this button */
    data = {
        customId: "",
        mode: "button",
        url: null,
        color: null,
        label: null,
        emoji: null,
        disabled: false
    };
    /**Set the custom id of this button */
    setCustomId(id) {
        this.data.customId = id;
        return this;
    }
    /**Set the mode of this button */
    setMode(mode) {
        this.data.mode = mode;
        return this;
    }
    /**Set the url of this button */
    setUrl(url) {
        this.data.url = url;
        return this;
    }
    /**Set the color of this button */
    setColor(color) {
        this.data.color = color;
        return this;
    }
    /**Set the label of this button */
    setLabel(label) {
        this.data.label = label;
        return this;
    }
    /**Set the emoji of this button */
    setEmoji(emoji) {
        this.data.emoji = emoji;
        return this;
    }
    /**Disable this button */
    setDisabled(disabled) {
        this.data.disabled = disabled;
        return this;
    }
}
exports.ODButtonInstance = ODButtonInstance;
/**## ODButton `class`
 * This is an Open Ticket button builder.
 *
 * With this class, you can create a button to use in a message.
 * The only difference with normal buttons is that this one can be edited by Open Ticket plugins!
 *
 * This is possible by using "workers" or multiple functions that will be executed in priority order!
 */
class ODButton extends ODBuilderImplementation {
    /**Build this button & compile it for discord.js */
    async build(source, params) {
        if (this.didCache && this.cache && this.allowCache)
            return this.cache;
        try {
            //create instance
            const instance = new ODButtonInstance();
            //wait for workers to finish
            await this.workers.executeWorkers(instance, source, params);
            //create the discord.js button
            const button = new discord.ButtonBuilder();
            if (instance.data.mode == "button")
                button.setCustomId(instance.data.customId);
            if (instance.data.mode == "url")
                button.setStyle(discord.ButtonStyle.Link);
            else if (instance.data.color == "gray")
                button.setStyle(discord.ButtonStyle.Secondary);
            else if (instance.data.color == "blue")
                button.setStyle(discord.ButtonStyle.Primary);
            else if (instance.data.color == "green")
                button.setStyle(discord.ButtonStyle.Success);
            else if (instance.data.color == "red")
                button.setStyle(discord.ButtonStyle.Danger);
            if (instance.data.url)
                button.setURL(instance.data.url);
            if (instance.data.label)
                button.setLabel(instance.data.label);
            if (instance.data.emoji)
                button.setEmoji(instance.data.emoji);
            if (instance.data.disabled)
                button.setDisabled(instance.data.disabled);
            if (!instance.data.emoji && !instance.data.label)
                button.setLabel(instance.data.customId);
            this.cache = { id: this.id, component: button };
            this.didCache = true;
            return { id: this.id, component: button };
        }
        catch (err) {
            process.emit("uncaughtException", new base_1.ODSystemError("ODButton:build(\"" + this.id.value + "\") => Major Error (see next error)"));
            process.emit("uncaughtException", err);
            return { id: this.id, component: null };
        }
    }
}
exports.ODButton = ODButton;
/**## ODQuickButton `class`
 * This is an Open Ticket quick button builder.
 *
 * With this class, you can quickly create a button to use in a message.
 * This quick button can be used by Open Ticket plugins instead of the normal builders to speed up the process!
 *
 * Because of the quick functionality, these buttons are less customisable by other plugins.
 */
class ODQuickButton {
    /**The id of this button. */
    id;
    /**The current data of this button */
    data;
    constructor(id, data) {
        this.id = new base_1.ODId(id);
        this.data = data;
    }
    /**Build this button & compile it for discord.js */
    async build() {
        try {
            //create the discord.js button
            const button = new discord.ButtonBuilder();
            if (this.data.mode == "button" || (!this.data.mode && this.data.customId))
                button.setCustomId(this.data.customId ?? "od:unknown-button");
            if (this.data.mode == "url")
                button.setStyle(discord.ButtonStyle.Link);
            else if (this.data.color == "gray")
                button.setStyle(discord.ButtonStyle.Secondary);
            else if (this.data.color == "blue")
                button.setStyle(discord.ButtonStyle.Primary);
            else if (this.data.color == "green")
                button.setStyle(discord.ButtonStyle.Success);
            else if (this.data.color == "red")
                button.setStyle(discord.ButtonStyle.Danger);
            else
                button.setStyle(discord.ButtonStyle.Secondary);
            if (this.data.url)
                button.setURL(this.data.url);
            if (this.data.label)
                button.setLabel(this.data.label);
            if (this.data.emoji)
                button.setEmoji(this.data.emoji);
            if (this.data.disabled)
                button.setDisabled(this.data.disabled);
            if (!this.data.emoji && !this.data.label)
                button.setLabel(this.data.customId ?? "od:unknown-button");
            return { id: this.id, component: button };
        }
        catch (err) {
            process.emit("uncaughtException", new base_1.ODSystemError("ODQuickButton:build(\"" + this.id.value + "\") => Major Error (see next error)"));
            process.emit("uncaughtException", err);
            return { id: this.id, component: null };
        }
    }
}
exports.ODQuickButton = ODQuickButton;
/**## ODDropdownManager `class`
 * This is an Open Ticket dropdown manager.
 *
 * It contains all Open Ticket dropdown builders. Here, you can add your own dropdowns or edit existing ones!
 *
 * It's recommended to use this system in combination with all the other Open Ticket builders!
 */
class ODDropdownManager extends base_1.ODManagerWithSafety {
    constructor(debug) {
        super(() => {
            return new ODDropdown("opendiscord:unknown-dropdown", (instance, params, source, cancel) => {
                instance.setCustomId("od:unknown-dropdown");
                instance.setType("string");
                instance.setPlaceholder("❌ <ODError:Unknown Dropdown>");
                instance.setDisabled(true);
                instance.setOptions([
                    { emoji: "❌", label: "<ODError:Unknown Dropdown>", value: "error" }
                ]);
                cancel();
            });
        }, debug, "dropdown");
    }
    /**Get a newline component for buttons & dropdowns! */
    getNewLine(id) {
        return {
            id: new base_1.ODId(id),
            component: "\n"
        };
    }
}
exports.ODDropdownManager = ODDropdownManager;
/**## ODDropdownInstance `class`
 * This is an Open Ticket dropdown instance.
 *
 * It contains all properties & functions to build a dropdown!
 */
class ODDropdownInstance {
    /**The current data of this dropdown */
    data = {
        customId: "",
        type: "string",
        placeholder: null,
        minValues: null,
        maxValues: null,
        disabled: false,
        channelTypes: [],
        options: [],
        users: [],
        roles: [],
        channels: [],
        mentionables: []
    };
    /**Set the custom id of this dropdown */
    setCustomId(id) {
        this.data.customId = id;
        return this;
    }
    /**Set the type of this dropdown */
    setType(type) {
        this.data.type = type;
        return this;
    }
    /**Set the placeholder of this dropdown */
    setPlaceholder(placeholder) {
        this.data.placeholder = placeholder;
        return this;
    }
    /**Set the minimum amount of values in this dropdown */
    setMinValues(minValues) {
        this.data.minValues = minValues;
        return this;
    }
    /**Set the maximum amount of values ax this dropdown */
    setMaxValues(maxValues) {
        this.data.maxValues = maxValues;
        return this;
    }
    /**Set the disabled of this dropdown */
    setDisabled(disabled) {
        this.data.disabled = disabled;
        return this;
    }
    /**Set the channel types of this dropdown */
    setChannelTypes(channelTypes) {
        this.data.channelTypes = channelTypes;
        return this;
    }
    /**Set the options of this dropdown (when `type == "string"`) */
    setOptions(options) {
        this.data.options = options;
        return this;
    }
    /**Set the users of this dropdown (when `type == "user"`) */
    setUsers(users) {
        this.data.users = users;
        return this;
    }
    /**Set the roles of this dropdown (when `type == "role"`) */
    setRoles(roles) {
        this.data.roles = roles;
        return this;
    }
    /**Set the channels of this dropdown (when `type == "channel"`) */
    setChannels(channels) {
        this.data.channels = channels;
        return this;
    }
    /**Set the mentionables of this dropdown (when `type == "mentionable"`) */
    setMentionables(mentionables) {
        this.data.mentionables = mentionables;
        return this;
    }
}
exports.ODDropdownInstance = ODDropdownInstance;
/**## ODDropdown `class`
 * This is an Open Ticket dropdown builder.
 *
 * With this class, you can create a dropdown to use in a message.
 * The only difference with normal dropdowns is that this one can be edited by Open Ticket plugins!
 *
 * This is possible by using "workers" or multiple functions that will be executed in priority order!
 */
class ODDropdown extends ODBuilderImplementation {
    /**Build this dropdown & compile it for discord.js */
    async build(source, params) {
        if (this.didCache && this.cache && this.allowCache)
            return this.cache;
        try {
            //create instance
            const instance = new ODDropdownInstance();
            //wait for workers to finish
            await this.workers.executeWorkers(instance, source, params);
            //create the discord.js dropdown
            if (instance.data.type == "string") {
                const dropdown = new discord.StringSelectMenuBuilder();
                dropdown.setCustomId(instance.data.customId);
                dropdown.setOptions(...instance.data.options);
                if (instance.data.placeholder)
                    dropdown.setPlaceholder(instance.data.placeholder);
                if (instance.data.minValues)
                    dropdown.setMinValues(instance.data.minValues);
                if (instance.data.maxValues)
                    dropdown.setMaxValues(instance.data.maxValues);
                if (instance.data.disabled)
                    dropdown.setDisabled(instance.data.disabled);
                this.cache = { id: this.id, component: dropdown };
                this.didCache = true;
                return { id: this.id, component: dropdown };
            }
            else if (instance.data.type == "user") {
                const dropdown = new discord.UserSelectMenuBuilder();
                dropdown.setCustomId(instance.data.customId);
                if (instance.data.users.length > 0)
                    dropdown.setDefaultUsers(...instance.data.users.map((u) => u.id));
                if (instance.data.placeholder)
                    dropdown.setPlaceholder(instance.data.placeholder);
                if (instance.data.minValues)
                    dropdown.setMinValues(instance.data.minValues);
                if (instance.data.maxValues)
                    dropdown.setMaxValues(instance.data.maxValues);
                if (instance.data.disabled)
                    dropdown.setDisabled(instance.data.disabled);
                this.cache = { id: this.id, component: dropdown };
                this.didCache = true;
                return { id: this.id, component: dropdown };
            }
            else if (instance.data.type == "role") {
                const dropdown = new discord.RoleSelectMenuBuilder();
                dropdown.setCustomId(instance.data.customId);
                if (instance.data.roles.length > 0)
                    dropdown.setDefaultRoles(...instance.data.roles.map((r) => r.id));
                if (instance.data.placeholder)
                    dropdown.setPlaceholder(instance.data.placeholder);
                if (instance.data.minValues)
                    dropdown.setMinValues(instance.data.minValues);
                if (instance.data.maxValues)
                    dropdown.setMaxValues(instance.data.maxValues);
                if (instance.data.disabled)
                    dropdown.setDisabled(instance.data.disabled);
                this.cache = { id: this.id, component: dropdown };
                this.didCache = true;
                return { id: this.id, component: dropdown };
            }
            else if (instance.data.type == "channel") {
                const dropdown = new discord.ChannelSelectMenuBuilder();
                dropdown.setCustomId(instance.data.customId);
                if (instance.data.channels.length > 0)
                    dropdown.setDefaultChannels(...instance.data.channels.map((c) => c.id));
                if (instance.data.placeholder)
                    dropdown.setPlaceholder(instance.data.placeholder);
                if (instance.data.minValues)
                    dropdown.setMinValues(instance.data.minValues);
                if (instance.data.maxValues)
                    dropdown.setMaxValues(instance.data.maxValues);
                if (instance.data.disabled)
                    dropdown.setDisabled(instance.data.disabled);
                this.cache = { id: this.id, component: dropdown };
                this.didCache = true;
                return { id: this.id, component: dropdown };
            }
            else if (instance.data.type == "mentionable") {
                const dropdown = new discord.MentionableSelectMenuBuilder();
                const values = [];
                instance.data.mentionables.forEach((m) => {
                    if (m instanceof discord.User) {
                        values.push({ type: discord.SelectMenuDefaultValueType.User, id: m.id });
                    }
                    else {
                        values.push({ type: discord.SelectMenuDefaultValueType.Role, id: m.id });
                    }
                });
                dropdown.setCustomId(instance.data.customId);
                if (instance.data.mentionables.length > 0)
                    dropdown.setDefaultValues(...values);
                if (instance.data.placeholder)
                    dropdown.setPlaceholder(instance.data.placeholder);
                if (instance.data.minValues)
                    dropdown.setMinValues(instance.data.minValues);
                if (instance.data.maxValues)
                    dropdown.setMaxValues(instance.data.maxValues);
                if (instance.data.disabled)
                    dropdown.setDisabled(instance.data.disabled);
                this.cache = { id: this.id, component: dropdown };
                this.didCache = true;
                return { id: this.id, component: dropdown };
            }
            else {
                throw new Error("Tried to build an ODDropdown with unknown type!");
            }
        }
        catch (err) {
            process.emit("uncaughtException", new base_1.ODSystemError("ODDropdown:build(\"" + this.id.value + "\") => Major Error (see next error)"));
            process.emit("uncaughtException", err);
            return { id: this.id, component: null };
        }
    }
}
exports.ODDropdown = ODDropdown;
/**## ODQuickDropdown `class`
 * This is an Open Ticket quick dropdown builder.
 *
 * With this class, you can quickly create a dropdown to use in a message.
 * This quick dropdown can be used by Open Ticket plugins instead of the normal builders to speed up the process!
 *
 * Because of the quick functionality, these dropdowns are less customisable by other plugins.
 */
class ODQuickDropdown {
    /**The id of this dropdown. */
    id;
    /**The current data of this dropdown */
    data;
    constructor(id, data) {
        this.id = new base_1.ODId(id);
        this.data = data;
    }
    /**Build this dropdown & compile it for discord.js */
    async build() {
        try {
            //create the discord.js dropdown
            if (this.data.type == "string") {
                if (!this.data.options)
                    throw new base_1.ODSystemError("ODQuickDropdown:build(): " + this.id.value + " => Dropdown requires at least 1 option to be present.");
                const dropdown = new discord.StringSelectMenuBuilder();
                dropdown.setCustomId(this.data.customId ?? "od:unknown-dropdown");
                dropdown.setOptions(...this.data.options);
                if (this.data.placeholder)
                    dropdown.setPlaceholder(this.data.placeholder);
                if (this.data.minValues)
                    dropdown.setMinValues(this.data.minValues);
                if (this.data.maxValues)
                    dropdown.setMaxValues(this.data.maxValues);
                if (this.data.disabled)
                    dropdown.setDisabled(this.data.disabled);
                return { id: this.id, component: dropdown };
            }
            else if (this.data.type == "user") {
                if (!this.data.users)
                    throw new base_1.ODSystemError("ODQuickDropdown:build(): " + this.id.value + " => Dropdown requires at least 1 user option to be present.");
                const dropdown = new discord.UserSelectMenuBuilder();
                dropdown.setCustomId(this.data.customId ?? "od:unknown-dropdown");
                if (this.data.users.length > 0)
                    dropdown.setDefaultUsers(...this.data.users.map((u) => u.id));
                if (this.data.placeholder)
                    dropdown.setPlaceholder(this.data.placeholder);
                if (this.data.minValues)
                    dropdown.setMinValues(this.data.minValues);
                if (this.data.maxValues)
                    dropdown.setMaxValues(this.data.maxValues);
                if (this.data.disabled)
                    dropdown.setDisabled(this.data.disabled);
                return { id: this.id, component: dropdown };
            }
            else if (this.data.type == "role") {
                if (!this.data.roles)
                    throw new base_1.ODSystemError("ODQuickDropdown:build(): " + this.id.value + " => Dropdown requires at least 1 role option to be present.");
                const dropdown = new discord.RoleSelectMenuBuilder();
                dropdown.setCustomId(this.data.customId ?? "od:unknown-dropdown");
                if (this.data.roles.length > 0)
                    dropdown.setDefaultRoles(...this.data.roles.map((r) => r.id));
                if (this.data.placeholder)
                    dropdown.setPlaceholder(this.data.placeholder);
                if (this.data.minValues)
                    dropdown.setMinValues(this.data.minValues);
                if (this.data.maxValues)
                    dropdown.setMaxValues(this.data.maxValues);
                if (this.data.disabled)
                    dropdown.setDisabled(this.data.disabled);
                return { id: this.id, component: dropdown };
            }
            else if (this.data.type == "channel") {
                if (!this.data.channels)
                    throw new base_1.ODSystemError("ODQuickDropdown:build(): " + this.id.value + " => Dropdown requires at least 1 channel option to be present.");
                const dropdown = new discord.ChannelSelectMenuBuilder();
                dropdown.setCustomId(this.data.customId ?? "od:unknown-dropdown");
                if (this.data.channels.length > 0)
                    dropdown.setDefaultChannels(...this.data.channels.map((c) => c.id));
                if (this.data.placeholder)
                    dropdown.setPlaceholder(this.data.placeholder);
                if (this.data.minValues)
                    dropdown.setMinValues(this.data.minValues);
                if (this.data.maxValues)
                    dropdown.setMaxValues(this.data.maxValues);
                if (this.data.disabled)
                    dropdown.setDisabled(this.data.disabled);
                return { id: this.id, component: dropdown };
            }
            else if (this.data.type == "mentionable") {
                if (!this.data.mentionables)
                    throw new base_1.ODSystemError("ODQuickDropdown:build(): " + this.id.value + " => Dropdown requires at least 1 mentionable option to be present.");
                const dropdown = new discord.MentionableSelectMenuBuilder();
                const values = [];
                this.data.mentionables.forEach((m) => {
                    if (m instanceof discord.User) {
                        values.push({ type: discord.SelectMenuDefaultValueType.User, id: m.id });
                    }
                    else {
                        values.push({ type: discord.SelectMenuDefaultValueType.Role, id: m.id });
                    }
                });
                dropdown.setCustomId(this.data.customId ?? "od:unknown-dropdown");
                if (this.data.mentionables.length > 0)
                    dropdown.setDefaultValues(...values);
                if (this.data.placeholder)
                    dropdown.setPlaceholder(this.data.placeholder);
                if (this.data.minValues)
                    dropdown.setMinValues(this.data.minValues);
                if (this.data.maxValues)
                    dropdown.setMaxValues(this.data.maxValues);
                if (this.data.disabled)
                    dropdown.setDisabled(this.data.disabled);
                return { id: this.id, component: dropdown };
            }
            else {
                throw new Error("Tried to build an ODQuickDropdown with unknown type!");
            }
        }
        catch (err) {
            process.emit("uncaughtException", new base_1.ODSystemError("ODQuickDropdown:build(\"" + this.id.value + "\") => Major Error (see next error)"));
            process.emit("uncaughtException", err);
            return { id: this.id, component: null };
        }
    }
}
exports.ODQuickDropdown = ODQuickDropdown;
/**## ODFileManager `class`
 * This is an Open Ticket file manager.
 *
 * It contains all Open Ticket file builders. Here, you can add your own files or edit existing ones!
 *
 * It's recommended to use this system in combination with all the other Open Ticket builders!
 */
class ODFileManager extends base_1.ODManagerWithSafety {
    constructor(debug) {
        super(() => {
            return new ODFile("opendiscord:unknown-file", (instance, params, source, cancel) => {
                instance.setName("openticket_unknown-file.txt");
                instance.setDescription("❌ <ODError:Unknown File>");
                instance.setContents("Couldn't find file in registery `opendiscord.builders.files`");
                cancel();
            });
        }, debug, "file");
    }
}
exports.ODFileManager = ODFileManager;
/**## ODFileInstance `class`
 * This is an Open Ticket file instance.
 *
 * It contains all properties & functions to build a file!
 */
class ODFileInstance {
    /**The current data of this file */
    data = {
        file: "",
        name: "file.txt",
        description: null,
        spoiler: false
    };
    /**Set the file path of this attachment */
    setFile(file) {
        this.data.file = file;
        return this;
    }
    /**Set the file contents of this attachment */
    setContents(contents) {
        this.data.file = (typeof contents == "string") ? Buffer.from(contents) : contents;
        return this;
    }
    /**Set the name of this attachment */
    setName(name) {
        this.data.name = name;
        return this;
    }
    /**Set the description of this attachment */
    setDescription(description) {
        this.data.description = description;
        return this;
    }
    /**Set this attachment to show as a spoiler */
    setSpoiler(spoiler) {
        this.data.spoiler = spoiler;
        return this;
    }
}
exports.ODFileInstance = ODFileInstance;
/**## ODFile `class`
 * This is an Open Ticket file builder.
 *
 * With this class, you can create a file to use in a message.
 * The only difference with normal files is that this one can be edited by Open Ticket plugins!
 *
 * This is possible by using "workers" or multiple functions that will be executed in priority order!
 */
class ODFile extends ODBuilderImplementation {
    /**Build this attachment & compile it for discord.js */
    async build(source, params) {
        if (this.didCache && this.cache && this.allowCache)
            return this.cache;
        try {
            //create instance
            const instance = new ODFileInstance();
            //wait for workers to finish
            await this.workers.executeWorkers(instance, source, params);
            //create the discord.js attachment
            const file = new discord.AttachmentBuilder(instance.data.file);
            file.setName(instance.data.name ? instance.data.name : "file.txt");
            if (instance.data.description)
                file.setDescription(instance.data.description);
            if (instance.data.spoiler)
                file.setSpoiler(instance.data.spoiler);
            this.cache = { id: this.id, file };
            this.didCache = true;
            return { id: this.id, file };
        }
        catch (err) {
            process.emit("uncaughtException", new base_1.ODSystemError("ODFile:build(\"" + this.id.value + "\") => Major Error (see next error)"));
            process.emit("uncaughtException", err);
            return { id: this.id, file: null };
        }
    }
}
exports.ODFile = ODFile;
/**## ODQuickFile `class`
 * This is an Open Ticket quick file builder.
 *
 * With this class, you can quickly create a file to use in a message.
 * This quick file can be used by Open Ticket plugins instead of the normal builders to speed up the process!
 *
 * Because of the quick functionality, these files are less customisable by other plugins.
 */
class ODQuickFile {
    /**The id of this file. */
    id;
    /**The current data of this file */
    data;
    constructor(id, data) {
        this.id = new base_1.ODId(id);
        this.data = data;
    }
    /**Build this attachment & compile it for discord.js */
    async build() {
        try {
            //create the discord.js attachment
            const file = new discord.AttachmentBuilder(this.data.file ?? "<empty-file>");
            file.setName(this.data.name ? this.data.name : "file.txt");
            if (this.data.description)
                file.setDescription(this.data.description);
            if (this.data.spoiler)
                file.setSpoiler(this.data.spoiler);
            return { id: this.id, file };
        }
        catch (err) {
            process.emit("uncaughtException", new base_1.ODSystemError("ODQuickFile:build(\"" + this.id.value + "\") => Major Error (see next error)"));
            process.emit("uncaughtException", err);
            return { id: this.id, file: null };
        }
    }
}
exports.ODQuickFile = ODQuickFile;
/**## ODEmbedManager `class`
 * This is an Open Ticket embed manager.
 *
 * It contains all Open Ticket embed builders. Here, you can add your own embeds or edit existing ones!
 *
 * It's recommended to use this system in combination with all the other Open Ticket builders!
 */
class ODEmbedManager extends base_1.ODManagerWithSafety {
    constructor(debug) {
        super(() => {
            return new ODEmbed("opendiscord:unknown-embed", (instance, params, source, cancel) => {
                instance.setFooter("opendiscord:unknown-embed");
                instance.setColor("#ff0000");
                instance.setTitle("❌ <ODError:Unknown Embed>");
                instance.setDescription("Couldn't find embed in registery `opendiscord.builders.embeds`");
                cancel();
            });
        }, debug, "embed");
    }
}
exports.ODEmbedManager = ODEmbedManager;
/**## ODEmbedInstance `class`
 * This is an Open Ticket embed instance.
 *
 * It contains all properties & functions to build an embed!
 */
class ODEmbedInstance {
    /**The current data of this embed */
    data = {
        title: null,
        color: null,
        url: null,
        description: null,
        authorText: null,
        authorImage: null,
        authorUrl: null,
        footerText: null,
        footerImage: null,
        image: null,
        thumbnail: null,
        fields: [],
        timestamp: null
    };
    /**Set the title of this embed */
    setTitle(title) {
        this.data.title = title;
        return this;
    }
    /**Set the color of this embed */
    setColor(color) {
        this.data.color = color;
        return this;
    }
    /**Set the url of this embed */
    setUrl(url) {
        this.data.url = url;
        return this;
    }
    /**Set the description of this embed */
    setDescription(description) {
        this.data.description = description;
        return this;
    }
    /**Set the author of this embed */
    setAuthor(text, image, url) {
        this.data.authorText = text;
        this.data.authorImage = image ?? null;
        this.data.authorUrl = url ?? null;
        return this;
    }
    /**Set the footer of this embed */
    setFooter(text, image) {
        this.data.footerText = text;
        this.data.footerImage = image ?? null;
        return this;
    }
    /**Set the image of this embed */
    setImage(image) {
        this.data.image = image;
        return this;
    }
    /**Set the thumbnail of this embed */
    setThumbnail(thumbnail) {
        this.data.thumbnail = thumbnail;
        return this;
    }
    /**Set the fields of this embed */
    setFields(fields) {
        //TEMP CHECKS
        fields.forEach((field, index) => {
            if (field.value.length >= 1024)
                throw new base_1.ODSystemError("ODEmbed:setFields() => field " + index + " reached 1024 character limit!");
            if (field.name.length >= 256)
                throw new base_1.ODSystemError("ODEmbed:setFields() => field " + index + " reached 256 name character limit!");
        });
        this.data.fields = fields;
        return this;
    }
    /**Add fields to this embed */
    addFields(...fields) {
        //TEMP CHECKS
        fields.forEach((field, index) => {
            if (field.value.length >= 1024)
                throw new base_1.ODSystemError("ODEmbed:addFields() => field " + index + " reached 1024 character limit!");
            if (field.name.length >= 256)
                throw new base_1.ODSystemError("ODEmbed:addFields() => field " + index + " reached 256 name character limit!");
        });
        this.data.fields.push(...fields);
        return this;
    }
    /**Clear all fields from this embed */
    clearFields() {
        this.data.fields = [];
        return this;
    }
    /**Set the timestamp of this embed */
    setTimestamp(timestamp) {
        this.data.timestamp = timestamp;
        return this;
    }
}
exports.ODEmbedInstance = ODEmbedInstance;
/**## ODEmbed `class`
 * This is an Open Ticket embed builder.
 *
 * With this class, you can create a embed to use in a message.
 * The only difference with normal embeds is that this one can be edited by Open Ticket plugins!
 *
 * This is possible by using "workers" or multiple functions that will be executed in priority order!
 */
class ODEmbed extends ODBuilderImplementation {
    /**Build this embed & compile it for discord.js */
    async build(source, params) {
        if (this.didCache && this.cache && this.allowCache)
            return this.cache;
        try {
            //create instance
            const instance = new ODEmbedInstance();
            //wait for workers to finish
            await this.workers.executeWorkers(instance, source, params);
            //create the discord.js embed
            const embed = new discord.EmbedBuilder();
            if (instance.data.title)
                embed.setTitle(instance.data.title);
            if (instance.data.color)
                embed.setColor(instance.data.color);
            if (instance.data.url)
                embed.setURL(instance.data.url);
            if (instance.data.description)
                embed.setDescription(instance.data.description);
            if (instance.data.authorText)
                embed.setAuthor({
                    name: instance.data.authorText,
                    iconURL: instance.data.authorImage ?? undefined,
                    url: instance.data.authorUrl ?? undefined
                });
            if (instance.data.footerText)
                embed.setFooter({
                    text: instance.data.footerText,
                    iconURL: instance.data.footerImage ?? undefined,
                });
            if (instance.data.image)
                embed.setImage(instance.data.image);
            if (instance.data.thumbnail)
                embed.setThumbnail(instance.data.thumbnail);
            if (instance.data.timestamp)
                embed.setTimestamp(instance.data.timestamp);
            if (instance.data.fields.length > 0)
                embed.setFields(instance.data.fields);
            this.cache = { id: this.id, embed };
            this.didCache = true;
            return { id: this.id, embed };
        }
        catch (err) {
            process.emit("uncaughtException", new base_1.ODSystemError("ODEmbed:build(\"" + this.id.value + "\") => Major Error (see next error)"));
            process.emit("uncaughtException", err);
            return { id: this.id, embed: null };
        }
    }
}
exports.ODEmbed = ODEmbed;
/**## ODQuickEmbed `class`
 * This is an Open Ticket quick embed builder.
 *
 * With this class, you can quickly create a embed to use in a message.
 * This quick embed can be used by Open Ticket plugins instead of the normal builders to speed up the process!
 *
 * Because of the quick functionality, these embeds are less customisable by other plugins.
 */
class ODQuickEmbed {
    /**The id of this embed. */
    id;
    /**The current data of this embed */
    data;
    constructor(id, data) {
        this.id = new base_1.ODId(id);
        this.data = data;
    }
    /**Build this embed & compile it for discord.js */
    async build() {
        try {
            //create the discord.js embed
            const embed = new discord.EmbedBuilder();
            if (this.data.title)
                embed.setTitle(this.data.title);
            if (this.data.color)
                embed.setColor(this.data.color);
            if (this.data.url)
                embed.setURL(this.data.url);
            if (this.data.description)
                embed.setDescription(this.data.description);
            if (this.data.authorText)
                embed.setAuthor({
                    name: this.data.authorText,
                    iconURL: this.data.authorImage ?? undefined,
                    url: this.data.authorUrl ?? undefined
                });
            if (this.data.footerText)
                embed.setFooter({
                    text: this.data.footerText,
                    iconURL: this.data.footerImage ?? undefined,
                });
            if (this.data.image)
                embed.setImage(this.data.image);
            if (this.data.thumbnail)
                embed.setThumbnail(this.data.thumbnail);
            if (this.data.timestamp)
                embed.setTimestamp(this.data.timestamp);
            if (this.data.fields && this.data.fields.length > 0)
                embed.setFields(this.data.fields);
            return { id: this.id, embed };
        }
        catch (err) {
            process.emit("uncaughtException", new base_1.ODSystemError("ODQuickEmbed:build(\"" + this.id.value + "\") => Major Error (see next error)"));
            process.emit("uncaughtException", err);
            return { id: this.id, embed: null };
        }
    }
}
exports.ODQuickEmbed = ODQuickEmbed;
/**## ODMessageManager `class`
 * This is an Open Ticket message manager.
 *
 * It contains all Open Ticket message builders. Here, you can add your own messages or edit existing ones!
 *
 * It's recommended to use this system in combination with all the other Open Ticket builders!
 */
class ODMessageManager extends base_1.ODManagerWithSafety {
    constructor(debug) {
        super(() => {
            return new ODMessage("opendiscord:unknown-message", (instance, params, source, cancel) => {
                instance.setContent("**❌ <ODError:Unknown Message>**\nCouldn't find message in registery `opendiscord.builders.messages`");
                cancel();
            });
        }, debug, "message");
    }
}
exports.ODMessageManager = ODMessageManager;
/**## ODMessageInstance `class`
 * This is an Open Ticket message instance.
 *
 * It contains all properties & functions to build a message!
 */
class ODMessageInstance {
    /**The current data of this message */
    data = {
        content: null,
        poll: null,
        ephemeral: false,
        embeds: [],
        components: [],
        files: [],
        additionalOptions: {}
    };
    /**Set the content of this message */
    setContent(content) {
        this.data.content = content;
        return this;
    }
    /**Set the poll of this message */
    setPoll(poll) {
        this.data.poll = poll;
        return this;
    }
    /**Make this message ephemeral when possible */
    setEphemeral(ephemeral) {
        this.data.ephemeral = ephemeral;
        return this;
    }
    /**Set the embeds of this message */
    setEmbeds(...embeds) {
        this.data.embeds = embeds;
        return this;
    }
    /**Add an embed to this message! */
    addEmbed(embed) {
        this.data.embeds.push(embed);
        return this;
    }
    /**Remove an embed from this message */
    removeEmbed(id) {
        const index = this.data.embeds.findIndex((embed) => embed.id.value === new base_1.ODId(id).value);
        if (index > -1)
            this.data.embeds.splice(index, 1);
        return this;
    }
    /**Get an embed from this message */
    getEmbed(id) {
        const embed = this.data.embeds.find((embed) => embed.id.value === new base_1.ODId(id).value);
        if (embed)
            return embed.embed;
        else
            return null;
    }
    /**Set the components of this message */
    setComponents(...components) {
        this.data.components = components;
        return this;
    }
    /**Add a component to this message! */
    addComponent(component) {
        this.data.components.push(component);
        return this;
    }
    /**Remove a component from this message */
    removeComponent(id) {
        const index = this.data.components.findIndex((component) => component.id.value === new base_1.ODId(id).value);
        if (index > -1)
            this.data.components.splice(index, 1);
        return this;
    }
    /**Get a component from this message */
    getComponent(id) {
        const component = this.data.components.find((component) => component.id.value === new base_1.ODId(id).value);
        if (component)
            return component.component;
        else
            return null;
    }
    /**Set the files of this message */
    setFiles(...files) {
        this.data.files = files;
        return this;
    }
    /**Add a file to this message! */
    addFile(file) {
        this.data.files.push(file);
        return this;
    }
    /**Remove a file from this message */
    removeFile(id) {
        const index = this.data.files.findIndex((file) => file.id.value === new base_1.ODId(id).value);
        if (index > -1)
            this.data.files.splice(index, 1);
        return this;
    }
    /**Get a file from this message */
    getFile(id) {
        const file = this.data.files.find((file) => file.id.value === new base_1.ODId(id).value);
        if (file)
            return file.file;
        else
            return null;
    }
}
exports.ODMessageInstance = ODMessageInstance;
/**## ODMessage `class`
 * This is an Open Ticket message builder.
 *
 * With this class, you can create a message to send in a discord channel.
 * The only difference with normal messages is that this one can be edited by Open Ticket plugins!
 *
 * This is possible by using "workers" or multiple functions that will be executed in priority order!
 */
class ODMessage extends ODBuilderImplementation {
    /**Build this message & compile it for discord.js */
    async build(source, params) {
        if (this.didCache && this.cache && this.allowCache)
            return this.cache;
        //create instance
        const instance = new ODMessageInstance();
        //wait for workers to finish
        await this.workers.executeWorkers(instance, source, params);
        //create the discord.js message
        const componentArray = [];
        let currentRow = new discord.ActionRowBuilder();
        instance.data.components.forEach((c) => {
            //return when component crashed
            if (c.component == null)
                return;
            else if (c.component == "\n") {
                //create new current row when required
                if (currentRow.components.length > 0) {
                    componentArray.push(currentRow);
                    currentRow = new discord.ActionRowBuilder();
                }
            }
            else if (c.component instanceof discord.BaseSelectMenuBuilder) {
                //push current row when not empty
                if (currentRow.components.length > 0) {
                    componentArray.push(currentRow);
                    currentRow = new discord.ActionRowBuilder();
                }
                currentRow.addComponents(c.component);
                //create new current row after dropdown
                componentArray.push(currentRow);
                currentRow = new discord.ActionRowBuilder();
            }
            else {
                //push button to current row
                currentRow.addComponents(c.component);
            }
            //create new row when 5 rows in length
            if (currentRow.components.length == 5) {
                componentArray.push(currentRow);
                currentRow = new discord.ActionRowBuilder();
            }
        });
        //push final row to array
        if (currentRow.components.length > 0)
            componentArray.push(currentRow);
        const filteredEmbeds = instance.data.embeds.map((e) => e.embed).filter((e) => e instanceof discord.EmbedBuilder);
        const filteredFiles = instance.data.files.map((f) => f.file).filter((f) => f instanceof discord.AttachmentBuilder);
        const message = {
            content: instance.data.content ?? "",
            poll: instance.data.poll ?? undefined,
            embeds: filteredEmbeds,
            components: componentArray,
            files: filteredFiles
        };
        let result = { id: this.id, message, ephemeral: instance.data.ephemeral };
        Object.assign(result.message, instance.data.additionalOptions);
        this.cache = result;
        this.didCache = true;
        return result;
    }
}
exports.ODMessage = ODMessage;
/**## ODQuickMessage `class`
 * This is an Open Ticket quick message builder.
 *
 * With this class, you can quickly create a message to send in a discord channel.
 * This quick message can be used by Open Ticket plugins instead of the normal builders to speed up the process!
 *
 * Because of the quick functionality, these messages are less customisable by other plugins.
 */
class ODQuickMessage {
    /**The id of this message. */
    id;
    /**The current data of this message. */
    data;
    constructor(id, data) {
        this.id = new base_1.ODId(id);
        this.data = data;
    }
    /**Build this message & compile it for discord.js */
    async build() {
        //create the discord.js message
        const componentArray = [];
        let currentRow = new discord.ActionRowBuilder();
        this.data.components?.forEach((c) => {
            //return when component crashed
            if (c.component == null)
                return;
            else if (c.component == "\n") {
                //create new current row when required
                if (currentRow.components.length > 0) {
                    componentArray.push(currentRow);
                    currentRow = new discord.ActionRowBuilder();
                }
            }
            else if (c.component instanceof discord.BaseSelectMenuBuilder) {
                //push current row when not empty
                if (currentRow.components.length > 0) {
                    componentArray.push(currentRow);
                    currentRow = new discord.ActionRowBuilder();
                }
                currentRow.addComponents(c.component);
                //create new current row after dropdown
                componentArray.push(currentRow);
                currentRow = new discord.ActionRowBuilder();
            }
            else {
                //push button to current row
                currentRow.addComponents(c.component);
            }
            //create new row when 5 rows in length
            if (currentRow.components.length == 5) {
                componentArray.push(currentRow);
                currentRow = new discord.ActionRowBuilder();
            }
        });
        //push final row to array
        if (currentRow.components.length > 0)
            componentArray.push(currentRow);
        const filteredEmbeds = this.data.embeds?.map((e) => e.embed).filter((e) => e instanceof discord.EmbedBuilder) ?? [];
        const filteredFiles = this.data.files?.map((f) => f.file).filter((f) => f instanceof discord.AttachmentBuilder) ?? [];
        const message = {
            content: this.data.content ?? "",
            poll: this.data.poll ?? undefined,
            embeds: filteredEmbeds,
            components: componentArray,
            files: filteredFiles
        };
        let result = { id: this.id, message, ephemeral: this.data.ephemeral ?? false };
        Object.assign(result.message, this.data.additionalOptions);
        return result;
    }
}
exports.ODQuickMessage = ODQuickMessage;
/**## ODModalManager `class`
 * This is an Open Ticket modal manager.
 *
 * It contains all Open Ticket modal builders. Here, you can add your own modals or edit existing ones!
 *
 * It's recommended to use this system in combination with all the other Open Ticket builders!
 */
class ODModalManager extends base_1.ODManagerWithSafety {
    constructor(debug) {
        super(() => {
            return new ODModal("opendiscord:unknown-modal", (instance, params, source, cancel) => {
                instance.setCustomId("od:unknown-modal");
                instance.setTitle("❌ <ODError:Unknown Modal>");
                instance.setQuestions({
                    style: "short",
                    customId: "error",
                    label: "error",
                    placeholder: "Contact the bot creator for more info!"
                });
                cancel();
            });
        }, debug, "modal");
    }
}
exports.ODModalManager = ODModalManager;
/**## ODModalInstance `class`
 * This is an Open Ticket modal instance.
 *
 * It contains all properties & functions to build a modal!
 */
class ODModalInstance {
    /**The current data of this modal */
    data = {
        customId: "",
        title: null,
        questions: []
    };
    /**Set the custom id of this modal */
    setCustomId(customId) {
        this.data.customId = customId;
        return this;
    }
    /**Set the title of this modal */
    setTitle(title) {
        this.data.title = title;
        return this;
    }
    /**Set the questions of this modal */
    setQuestions(...questions) {
        this.data.questions = questions;
        return this;
    }
    /**Add a question to this modal! */
    addQuestion(question) {
        this.data.questions.push(question);
        return this;
    }
    /**Remove a question from this modal */
    removeQuestion(customId) {
        const index = this.data.questions.findIndex((question) => question.customId === customId);
        if (index > -1)
            this.data.questions.splice(index, 1);
        return this;
    }
    /**Get a question from this modal */
    getQuestion(customId) {
        const question = this.data.questions.find((question) => question.customId === customId);
        if (question)
            return question;
        else
            return null;
    }
}
exports.ODModalInstance = ODModalInstance;
/**## ODModal `class`
 * This is an Open Ticket modal builder.
 *
 * With this class, you can create a modal to use as response in interactions.
 * The only difference with normal modals is that this one can be edited by Open Ticket plugins!
 *
 * This is possible by using "workers" or multiple functions that will be executed in priority order!
 */
class ODModal extends ODBuilderImplementation {
    /**Build this modal & compile it for discord.js */
    async build(source, params) {
        if (this.didCache && this.cache && this.allowCache)
            return this.cache;
        //create instance
        const instance = new ODModalInstance();
        //wait for workers to finish
        await this.workers.executeWorkers(instance, source, params);
        //create the discord.js modal
        const modal = new discord.ModalBuilder();
        modal.setCustomId(instance.data.customId);
        if (instance.data.title)
            modal.setTitle(instance.data.title);
        else
            modal.setTitle(instance.data.customId);
        instance.data.questions.forEach((question) => {
            const input = new discord.TextInputBuilder()
                .setStyle(question.style == "paragraph" ? discord.TextInputStyle.Paragraph : discord.TextInputStyle.Short)
                .setCustomId(question.customId)
                .setLabel(question.label ? question.label : question.customId)
                .setRequired(question.required ? true : false);
            if (question.minLength)
                input.setMinLength(question.minLength);
            if (question.maxLength)
                input.setMaxLength(question.maxLength);
            if (question.value)
                input.setValue(question.value);
            if (question.placeholder)
                input.setPlaceholder(question.placeholder);
            modal.addComponents(new discord.ActionRowBuilder()
                .addComponents(input));
        });
        this.cache = { id: this.id, modal };
        this.didCache = true;
        return { id: this.id, modal };
    }
}
exports.ODModal = ODModal;
