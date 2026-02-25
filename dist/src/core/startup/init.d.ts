import * as api from "../api/api";
export * as api from "../api/api";
export declare const opendiscord: api.ODMain;
export interface ODUtilities {
    /**## project `utility variable`
     * This is the name of the project you are currently in.
     *
     * Developers can use this to create a multi-plugin compatible with all bots supporting the `open-discord` framework!
     */
    project: "openticket";
    /**## isBeta `utility variable`
     * Check if you're running a beta version of Open Ticket.
     */
    isBeta: boolean;
    /**## moduleInstalled `utility function`
     * Use this function to check if an npm package is installed or not!
     * @example utilities.moduleInstalled("discord.js") //check if discord.js is installed
     */
    moduleInstalled(id: string): boolean;
    /**## timer `utility function`
     * Use this to wait for a certain amount of milliseconds. This only works when using `await`
     * @example await utilities.timer(1000) //wait 1sec
     */
    timer(ms: number): Promise<void>;
    /**## emojiTitle `utility function`
     * Use this function to create a title with an emoji before/after the text. The style & divider are set in `opendiscord.defaults`
     * @example utilities.emojiTitle("📎","Links") //create a title with an emoji based on the bot emoji style
     */
    emojiTitle(emoji: string, text: string): string;
    /**## runAsync `utility function`
     * Use this function to run a snippet of code asyncronous without creating a separate function for it!
     */
    runAsync(func: () => Promise<void>): void;
    /**## timedAwait `utility function`
     * Use this function to await a promise but reject after the certain timeout has been reached.
     */
    timedAwait<ReturnValue extends Promise<any>>(promise: ReturnValue, timeout: number, onError: (err: Error) => void): ReturnValue;
    /**## dateString `utility function`
     * Use this function to create a short date string in the following format: `DD/MM/YYYY HH:MM:SS`
     */
    dateString(date: Date): string;
    /**## asyncReplace `utility function`
     * Same as `string.replace(search, value)` but with async compatibility
     */
    asyncReplace(text: string, regex: RegExp, func: (value: string, ...args: any[]) => Promise<string>): Promise<string>;
    /**## getLongestLength `utility function`
     * Get the length of the longest string in the array.
     */
    getLongestLength(text: string[]): number;
    /**## easterEggs `utility object`
     * Object containing data for Open Ticket easter eggs.
     */
    easterEggs: api.ODEasterEggs;
    /**## ODVersionMigration `utility class`
     * This class is used to manage data migration between Open Ticket versions.
     *
     * It shouldn't be used by plugins because this is an internal API feature!
     */
    ODVersionMigration: new (version: api.ODVersion, func: () => void | Promise<void>, afterInitFunc: () => void | Promise<void>) => ODVersionMigration;
    /**## ordinalNumber `utility function`
     * Get a human readable ordinal number (e.g. 1st, 2nd, 3rd, 4th, ...) from a Javascript number.
     */
    ordinalNumber(num: number): string;
    /**## trimEmojis `utility function`
     * Trim/remove all emoji's from a Javascript string.
     */
    trimEmojis(text: string): string;
}
/**## ODVersionMigration `utility class`
 * This class is used to manage data migration between Open Ticket versions.
 *
 * It shouldn't be used by plugins because this is an internal API feature!
 */
export declare class ODVersionMigration {
    #private;
    /**The version to migrate data to */
    version: api.ODVersion;
    constructor(version: api.ODVersion, func: () => void | Promise<void>, afterInitFunc: () => void | Promise<void>);
    /**Run this version migration as a plugin. Returns `false` when something goes wrong. */
    migrate(): Promise<boolean>;
    /**Run this version migration as a plugin (after other plugins have loaded). Returns `false` when something goes wrong. */
    migrateAfterInit(): Promise<boolean>;
}
export declare const utilities: ODUtilities;
