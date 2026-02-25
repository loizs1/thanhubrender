import { ODManager, ODManagerData, ODValidId } from "./base";
import { ODMessageBuildResult, ODMessageBuildSentResult } from "./builder";
import { ODDebugger } from "./console";
import * as discord from "discord.js";
/**## ODPostManager `class`
 * This is an Open Ticket post manager.
 *
 * It manages `ODPosts`'s for you.
 *
 * You can use this to get the logs channel of the bot (or some other static channel/category).
 */
export declare class ODPostManager extends ODManager<ODPost<discord.GuildBasedChannel>> {
    #private;
    constructor(debug: ODDebugger);
    add(data: ODPost<discord.GuildBasedChannel>, overwrite?: boolean): boolean;
    /**Initialize the post manager & all posts. */
    init(guild: discord.Guild): Promise<void>;
}
/**## ODPost `class`
 * This is an Open Ticket post class.
 *
 * A post is just a shortcut to a static discord channel or category.
 * This can be used to get a specific channel over and over again!
 *
 * This class also contains utilities for sending messages via the Open Ticket builders.
 */
export declare class ODPost<ChannelType extends discord.GuildBasedChannel> extends ODManagerData {
    #private;
    /**Is this post already initialized? */
    ready: boolean;
    /**The discord.js channel */
    channel: ChannelType | null;
    /**The discord channel id */
    channelId: string;
    constructor(id: ODValidId, channelId: string);
    /**Use a specific guild in this class for fetching the channel*/
    useGuild(guild: discord.Guild | null): void;
    /**Change the channel id to another channel! */
    setChannelId(id: string): void;
    /**Initialize the discord.js channel of this post. */
    init(): Promise<null | undefined>;
    /**Send a message to this channel using the Open Ticket builder system */
    send(msg: ODMessageBuildResult): Promise<ODMessageBuildSentResult<true>>;
}
