"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODPost = exports.ODPostManager = void 0;
///////////////////////////////////////
//POST MODULE
///////////////////////////////////////
const base_1 = require("./base");
/**## ODPostManager `class`
 * This is an Open Ticket post manager.
 *
 * It manages `ODPosts`'s for you.
 *
 * You can use this to get the logs channel of the bot (or some other static channel/category).
 */
class ODPostManager extends base_1.ODManager {
    /**A reference to the main server of the bot */
    #guild = null;
    constructor(debug) {
        super(debug, "post");
    }
    add(data, overwrite) {
        if (this.#guild)
            data.useGuild(this.#guild);
        return super.add(data, overwrite);
    }
    /**Initialize the post manager & all posts. */
    async init(guild) {
        this.#guild = guild;
        for (const post of this.getAll()) {
            post.useGuild(guild);
            await post.init();
        }
    }
}
exports.ODPostManager = ODPostManager;
/**## ODPost `class`
 * This is an Open Ticket post class.
 *
 * A post is just a shortcut to a static discord channel or category.
 * This can be used to get a specific channel over and over again!
 *
 * This class also contains utilities for sending messages via the Open Ticket builders.
 */
class ODPost extends base_1.ODManagerData {
    /**A reference to the main server of the bot */
    #guild = null;
    /**Is this post already initialized? */
    ready = false;
    /**The discord.js channel */
    channel = null;
    /**The discord channel id */
    channelId;
    constructor(id, channelId) {
        super(id);
        this.channelId = channelId;
    }
    /**Use a specific guild in this class for fetching the channel*/
    useGuild(guild) {
        this.#guild = guild;
    }
    /**Change the channel id to another channel! */
    setChannelId(id) {
        this.channelId = id;
    }
    /**Initialize the discord.js channel of this post. */
    async init() {
        if (this.ready)
            return;
        if (!this.#guild)
            return this.channel = null;
        try {
            this.channel = await this.#guild.channels.fetch(this.channelId);
        }
        catch {
            this.channel = null;
        }
        this.ready = true;
    }
    /**Send a message to this channel using the Open Ticket builder system */
    async send(msg) {
        if (!this.channel || !this.channel.isTextBased())
            return { success: false, message: null };
        try {
            const sent = await this.channel.send(msg.message);
            return { success: true, message: sent };
        }
        catch {
            return { success: false, message: null };
        }
    }
}
exports.ODPost = ODPost;
