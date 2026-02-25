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
exports.ODTranscriptCollector = exports.ODTranscriptManager_Default = exports.ODTranscriptCompiler = exports.ODTranscriptManager = void 0;
///////////////////////////////////////
//OPENTICKET TRANSCRIPT MODULE
///////////////////////////////////////
const base_1 = require("../modules/base");
const discord = __importStar(require("discord.js"));
/**## ODTranscriptManager `class`
 * This is an Open Ticket transcript manager.
 *
 * This class manages all transcript generators in the bot.
 *
 * The 2 default built-in transcript generators are: `opendiscord:html-compiler` & `opendiscord:text-compiler`.
 */
class ODTranscriptManager extends base_1.ODManager {
    /**The manager responsible for collecting all messages in a channel. */
    collector;
    /**Alias for the client manager. */
    #client;
    constructor(debug, tickets, client, permissions) {
        super(debug, "transcript compiler");
        this.#client = client;
        this.collector = new ODTranscriptCollector(tickets, client, permissions);
    }
}
exports.ODTranscriptManager = ODTranscriptManager;
/**## ODTranscriptCompiler `class`
 * This is an Open Ticket transcript compiler.
 *
 * This class manages all functions to generate a transcript.
 *
 * These functions should be defined when creating this compiler. Existing compilers already exist for html & text transcripts.
 */
class ODTranscriptCompiler extends base_1.ODManagerData {
    /*Initialise the system every time a transcript is created. Returns optional "pending" message to display while the transcript is being compiled. */
    init;
    /*Compile or create the transcript. Returns data to give to the ready() function for message creation. */
    compile;
    /*Unload the system & create the final transcript message that will be sent. */
    ready;
    constructor(id, init, compile, ready) {
        super(id);
        this.init = init ?? null;
        this.compile = compile ?? null;
        this.ready = ready ?? null;
    }
}
exports.ODTranscriptCompiler = ODTranscriptCompiler;
/**## ODTranscriptManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODTranscriptManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.transcripts`!
 */
class ODTranscriptManager_Default extends ODTranscriptManager {
    get(id) {
        return super.get(id);
    }
    remove(id) {
        return super.remove(id);
    }
    exists(id) {
        return super.exists(id);
    }
}
exports.ODTranscriptManager_Default = ODTranscriptManager_Default;
/**## ODTranscriptCollector `class`
 * This is an Open Ticket transcript collector.
 *
 * The only goal of this class is to collect & parse all messages from a ticket channel.
 *
 * It also contains utility functions for counting all messages, calculating file sizes & more!
 */
class ODTranscriptCollector {
    /**Alias for the ticket manager. */
    #tickets;
    /**Alias for the client manager. */
    #client;
    /**Alias for the permissions manager. */
    #permissions;
    constructor(tickets, client, permissions) {
        this.#tickets = tickets;
        this.#client = client;
        this.#permissions = permissions;
    }
    /**Collect all messages from a given ticket channel. It may not include all messages depending on the ratelimit. */
    async collectAllMessages(ticket, include) {
        const newInclude = include ?? { users: true, bots: true, client: true };
        const channel = await this.#tickets.getTicketChannel(ticket);
        if (!channel)
            return null;
        const final = [];
        const limit = 2000;
        let lastId = "";
        while (true) {
            const options = { limit: 100 };
            if (lastId)
                options.before = lastId;
            const messages = await channel.messages.fetch(options);
            messages.forEach(msg => {
                if (msg.author.id == msg.client.user.id && newInclude.client)
                    final.push(msg);
                else if ((msg.author.bot || msg.author.system) && newInclude.bots)
                    final.push(msg);
                else if (newInclude.users)
                    final.push(msg);
            });
            const lastMessage = messages.last();
            if (messages.size != 100 || final.length >= limit || !lastMessage)
                break;
            else
                lastId = lastMessage.id;
        }
        return final.reverse();
    }
    /**Count all messages from a given ticket channel. It may not include all messages depending on the ratelimit. */
    async countAllMessages(ticket, include) {
        const messages = await this.collectAllMessages(ticket, include);
        if (!messages)
            return null;
        return messages.length;
    }
    /**Convert an array of discord messages to an array of `ODTranscriptMessageData`'s. This is used to simplify the process of the transcript compilers. */
    async convertMessagesToTranscriptData(messages) {
        const final = [];
        for (const msg of messages) {
            const { guild, channel, id, createdTimestamp } = msg;
            //create message author
            const author = this.#handleUserData(msg.author, msg.member);
            //create message type
            let type = "default";
            if (msg.mentions.everyone || msg.content.includes("@here"))
                type = "important";
            else if (msg.flags.has("Ephemeral"))
                type = "ephemeral";
            else if (msg.type == discord.MessageType.UserJoin)
                type = "welcome.message";
            else if (msg.type == discord.MessageType.ChannelPinnedMessage)
                type = "pinned.message";
            else if (msg.type == discord.MessageType.GuildBoost || msg.type == discord.MessageType.GuildBoostTier1 || msg.type == discord.MessageType.GuildBoostTier2 || msg.type == discord.MessageType.GuildBoostTier3)
                type = "boost.message";
            else if (msg.type == discord.MessageType.ThreadCreated)
                type = "thread.message";
            //create message embeds
            const embeds = [];
            msg.embeds.forEach((embed) => {
                embeds.push({
                    title: embed.title,
                    description: embed.description,
                    authorimg: (embed.author && embed.author.iconURL) ? embed.author.iconURL : null,
                    authortext: (embed.author) ? embed.author.name : null,
                    footerimg: (embed.footer && embed.footer.iconURL) ? embed.footer.iconURL : null,
                    footertext: (embed.footer) ? embed.footer.text : null,
                    color: embed.hexColor ?? "#000000",
                    image: (embed.image) ? embed.image.url : null,
                    thumbnail: (embed.thumbnail) ? embed.thumbnail.url : null,
                    url: embed.url,
                    fields: embed.fields.map((field) => { return { name: field.name, value: field.value, inline: field.inline ?? false }; })
                });
            });
            //create message files
            const files = [];
            msg.attachments.forEach((attachment) => {
                const { size, unit } = this.calculateFileSize(attachment.size);
                files.push({
                    type: attachment.contentType ?? "unknown",
                    size,
                    unit,
                    name: attachment.name,
                    url: attachment.url,
                    spoiler: attachment.spoiler,
                    alt: attachment.description
                });
            });
            //create message components
            const rows = [];
            msg.components.forEach((row) => {
                const components = [];
                if (row.type != discord.ComponentType.ActionRow)
                    return;
                row.components.forEach((component) => {
                    if (component.type == discord.ComponentType.Button) {
                        components.push({
                            id: component.customId,
                            disabled: component.disabled,
                            type: "button",
                            label: component.label,
                            emoji: this.#handleComponentEmoji(msg, component.emoji),
                            color: this.#handleButtonComponentStyle(component.style),
                            mode: (component.style == discord.ButtonStyle.Link) ? "url" : "button",
                            url: component.url
                        });
                    }
                    else if (component.type == discord.ComponentType.StringSelect) {
                        components.push({
                            id: component.customId,
                            disabled: component.disabled,
                            type: "dropdown",
                            placeholder: component.placeholder,
                            options: component.options.map((option) => {
                                return {
                                    id: option.value,
                                    label: option.label,
                                    description: option.description ?? null,
                                    emoji: this.#handleComponentEmoji(msg, option.emoji ?? null)
                                };
                            })
                        });
                    }
                });
                rows.push({ components });
            });
            //create message reply
            let reply = null;
            if (msg.reference && msg.reference.messageId && msg.reference.guildId) {
                //normal message reply
                try {
                    const replyChannel = await msg.client.channels.fetch(msg.reference.channelId);
                    if (replyChannel && !replyChannel.isDMBased() && replyChannel.isTextBased()) {
                        const replyMessage = await replyChannel.messages.fetch(msg.reference.messageId);
                        if (replyMessage) {
                            const replyUser = this.#handleUserData(replyMessage.author, replyMessage.member);
                            reply = {
                                type: "message",
                                guild: msg.reference.guildId,
                                channel: msg.reference.channelId,
                                id: msg.reference.messageId,
                                user: replyUser,
                                content: (replyMessage.content != "") ? replyMessage.content : null
                            };
                        }
                    }
                }
                catch { }
            }
            else if (msg.interactionMetadata) {
                try {
                    //get slash command name from undocumented property in discord REST API
                    const restMsg = await this.#client.rest.get(discord.Routes.channelMessage(msg.channelId, msg.id));
                    const commandName = restMsg.interaction_metadata.name ?? "unknown-command";
                    //slash command reply
                    let member = null;
                    try {
                        member = await msg.guild.members.fetch(msg.interactionMetadata.user.id);
                    }
                    catch { } //member not found (user left the server)
                    reply = {
                        type: "interaction",
                        name: commandName,
                        user: this.#handleUserData(msg.interactionMetadata.user, member)
                    };
                }
                catch (err) {
                    process.emit("uncaughtException", err);
                }
            }
            //create message reactions
            const reactions = [];
            msg.reactions.cache.forEach((reaction) => {
                const { count, emoji } = reaction;
                if (emoji instanceof discord.ReactionEmoji && !emoji.id && emoji.name) {
                    //build-in emoji
                    reactions.push({
                        id: null,
                        name: null,
                        custom: false,
                        animated: false,
                        emoji: emoji.name,
                        amount: count,
                        super: false //unimplemented in discord.js
                    });
                }
                else if (emoji instanceof discord.ReactionEmoji && emoji.id) {
                    //custom emoji
                    reactions.push({
                        id: emoji.id,
                        name: emoji.name,
                        custom: true,
                        animated: emoji.animated ?? false,
                        emoji: (emoji.animated ? emoji.imageURL({ extension: "gif" }) : emoji.imageURL({ extension: "png" })) ?? "❌",
                        amount: count,
                        super: false //unimplemented in discord.js
                    });
                }
            });
            //create message
            final.push({
                author,
                guild: guild.id,
                channel: channel.id,
                id,
                edited: (msg.editedAt) ? true : false,
                timestamp: createdTimestamp,
                type,
                content: (msg.content != "") ? msg.content : null,
                embeds,
                files,
                components: rows,
                reply,
                reactions
            });
        }
        return final;
    }
    /**Calculate a human-readable file size. Used in transcripts. */
    calculateFileSize(bytes) {
        if (bytes < 1024)
            return { size: Math.round(bytes), unit: "B" };
        else if (bytes < 1024 * 1024)
            return { size: Math.round(bytes / 1024), unit: "KB" };
        else if (bytes < 1024 * 1024 * 1024)
            return { size: Math.round(bytes / (1024 * 1024)), unit: "MB" };
        else if (bytes < 1024 * 1024 * 1024 * 1024)
            return { size: Math.round(bytes / (1024 * 1024 * 1024)), unit: "GB" };
        else
            return { size: Math.round(bytes / (1024 * 1024 * 1024 * 1024)), unit: "TB" };
    }
    /**Get the `ODTranscriptEmojiData` from a discord.js component emoji. */
    #handleComponentEmoji(message, rawEmoji) {
        if (!rawEmoji)
            return null;
        //return built-in emoji
        if (rawEmoji.name)
            return {
                id: null,
                name: null,
                custom: false,
                animated: false,
                emoji: rawEmoji.name
            };
        if (!rawEmoji.id)
            return null;
        const emoji = message.client.emojis.resolve(rawEmoji.id);
        if (!emoji)
            return null;
        //return custom emoji
        return {
            id: emoji.id,
            name: emoji.name,
            custom: true,
            animated: emoji.animated ?? false,
            emoji: (emoji.animated ? emoji.imageURL({ extension: "gif" }) : emoji.imageURL({ extension: "png" }))
        };
    }
    /**Create the `ODValidButtonColor` from the discord.js button style. */
    #handleButtonComponentStyle(style) {
        if (style == discord.ButtonStyle.Danger)
            return "red";
        else if (style == discord.ButtonStyle.Success)
            return "green";
        else if (style == discord.ButtonStyle.Primary)
            return "blue";
        else
            return "gray";
    }
    /**Create the `ODTranscriptUserData` from a discord.js user. */
    #handleUserData(user, member) {
        const userData = {
            id: user.id,
            username: user.username,
            displayname: user.displayName,
            pfp: user.displayAvatarURL(),
            tag: null,
            color: "#ffffff"
        };
        if (user.flags && user.flags.has("VerifiedBot"))
            userData.tag = "verified";
        else if (user.system)
            userData.tag = "system";
        else if (user.bot)
            userData.tag = "app";
        if (member)
            userData.color = member.roles.highest.hexColor.replace("#000000", "#ffffff");
        return userData;
    }
    /**Analyse the ticket for the amount of messages users & admins have sent in the ticket. */
    async ticketUserMessagesAnalysis(ticket, guild, channel) {
        const messages = await this.collectAllMessages(ticket, { bots: true, client: true, users: true });
        if (!messages)
            return null;
        const parsedMessages = await this.convertMessagesToTranscriptData(messages);
        let userMessages = 0;
        let adminMessages = 0;
        for (const msg of parsedMessages) {
            if (msg.author.tag || msg.author.id == this.#client.client.user.id)
                continue;
            const user = await this.#client.fetchUser(msg.author.id);
            if (!user)
                continue;
            const isAdmin = this.#permissions.hasPermissions("support", await this.#permissions.getPermissions(user, channel, guild));
            if (isAdmin)
                adminMessages++;
            else
                userMessages++;
        }
        return { userMessages, adminMessages, totalMessages: userMessages + adminMessages };
    }
}
exports.ODTranscriptCollector = ODTranscriptCollector;
