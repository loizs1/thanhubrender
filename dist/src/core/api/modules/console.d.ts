import { ODHTTPGetRequest, ODVersion, ODSystemError, ODPluginError, ODManager, ODManagerData, ODValidId } from "./base";
import { ODMain } from "../main";
/**## ODValidConsoleColor `type`
 * This is a collection of all the supported console colors within Open Ticket.
 */
export type ODValidConsoleColor = "white" | "red" | "yellow" | "green" | "blue" | "gray" | "cyan" | "magenta";
/**## ODConsoleMessageParam `type`
 * This interface contains all data required for a console log parameter within Open Ticket.
 */
export interface ODConsoleMessageParam {
    /**The key of this parameter. */
    key: string;
    /**The value of this parameter. */
    value: string;
    /**When enabled, this parameter will only be shown in the debug file. */
    hidden?: boolean;
}
/**## ODConsoleMessage `class`
 * This is an Open Ticket console message.
 *
 * It is used to create beautiful & styled logs in the console with a prefix, message & parameters.
 * It also has full color support using `ansis` and parameters are parsed for you!
 */
export declare class ODConsoleMessage {
    /**The main message sent in the console */
    message: string;
    /**An array of all the parameters in this message */
    params: ODConsoleMessageParam[];
    /**The prefix of this message (!uppercase recommended!) */
    prefix: string;
    /**The color of the prefix of this message */
    color: ODValidConsoleColor;
    constructor(message: string, prefix: string, color: ODValidConsoleColor, params?: ODConsoleMessageParam[]);
    /**Render this message to the console using `console.log`! Returns `false` when something went wrong. */
    render(): boolean;
    /**Create a more-detailed, non-colored version of this message to store it in the `otdebug.txt` file! */
    toDebugString(): string;
    /**Render the parameters of this message in a specific color. */
    createParamsString(color: ODValidConsoleColor): string;
    /**Set the message */
    setMessage(message: string): this;
    /**Set the params */
    setParams(params: ODConsoleMessageParam[]): this;
    /**Set the prefix */
    setPrefix(prefix: string): this;
    /**Set the prefix color */
    setColor(color: ODValidConsoleColor): this;
}
/**## ODConsoleInfoMessage `class`
 * This is an Open Ticket console info message.
 *
 * It is the same as a normal `ODConsoleMessage`, but it has a predefined prefix & color scheme for the "INFO" messages!
 */
export declare class ODConsoleInfoMessage extends ODConsoleMessage {
    constructor(message: string, params?: ODConsoleMessageParam[]);
}
/**## ODConsoleSystemMessage `class`
 * This is an Open Ticket console system message.
 *
 * It is the same as a normal `ODConsoleMessage`, but it has a predefined prefix & color scheme for the "SYSTEM" messages!
 */
export declare class ODConsoleSystemMessage extends ODConsoleMessage {
    constructor(message: string, params?: ODConsoleMessageParam[]);
}
/**## ODConsolePluginMessage `class`
 * This is an Open Ticket console plugin message.
 *
 * It is the same as a normal `ODConsoleMessage`, but it has a predefined prefix & color scheme for the "PLUGIN" messages!
 */
export declare class ODConsolePluginMessage extends ODConsoleMessage {
    constructor(message: string, params?: ODConsoleMessageParam[]);
}
/**## ODConsoleDebugMessage `class`
 * This is an Open Ticket console debug message.
 *
 * It is the same as a normal `ODConsoleMessage`, but it has a predefined prefix & color scheme for the "DEBUG" messages!
 */
export declare class ODConsoleDebugMessage extends ODConsoleMessage {
    constructor(message: string, params?: ODConsoleMessageParam[]);
}
/**## ODConsoleWarningMessage `class`
 * This is an Open Ticket console warning message.
 *
 * It is the same as a normal `ODConsoleMessage`, but it has a predefined prefix & color scheme for the "WARNING" messages!
 */
export declare class ODConsoleWarningMessage extends ODConsoleMessage {
    constructor(message: string, params?: ODConsoleMessageParam[]);
}
/**## ODConsoleErrorMessage `class`
 * This is an Open Ticket console error message.
 *
 * It is the same as a normal `ODConsoleMessage`, but it has a predefined prefix & color scheme for the "ERROR" messages!
 */
export declare class ODConsoleErrorMessage extends ODConsoleMessage {
    constructor(message: string, params?: ODConsoleMessageParam[]);
}
/**## ODError `class`
 * This is an Open Ticket error.
 *
 * It is used to render and log Node.js errors & crashes in a styled way to the console & `otdebug.txt` file!
 */
export declare class ODError {
    /**The original error that this class wraps around */
    error: Error | ODSystemError | ODPluginError;
    /**The origin of the original error */
    origin: NodeJS.UncaughtExceptionOrigin;
    constructor(error: Error | ODSystemError | ODPluginError, origin: NodeJS.UncaughtExceptionOrigin);
    /**Render this error to the console using `console.log`! Returns `false` when something went wrong. */
    render(): boolean;
    /**Create a more-detailed, non-colored version of this error to store it in the `otdebug.txt` file! */
    toDebugString(): string;
}
/**## ODConsoleMessageTypes `type`
 * This is a collection of all the default console message types within Open Ticket.
 */
export type ODConsoleMessageTypes = "info" | "system" | "plugin" | "debug" | "warning" | "error";
/**## ODConsoleManager `class`
 * This is the Open Ticket console manager.
 *
 * It handles the entire console system of Open Ticket. It's also the place where you need to log `ODConsoleMessage`'s.
 * This manager keeps a short history of messages sent to the console which is configurable by plugins.
 *
 * The debug file (`otdebug.txt`) is handled in a sub-manager!
 */
export declare class ODConsoleManager {
    #private;
    /**The history of `ODConsoleMessage`'s and `ODError`'s since startup */
    history: (ODConsoleMessage | ODError)[];
    /**The max length of the history. The oldest messages will be removed when over the limit */
    historylength: number;
    /**An alias to the debugfile manager. (`otdebug.txt`) */
    debugfile: ODDebugFileManager;
    /**Is silent mode enabled? */
    silent: boolean;
    constructor(historylength: number, debugfile: ODDebugFileManager);
    /**Log a message to the console ... But in the Open Ticket way :) */
    log(message: ODConsoleMessage): void;
    log(message: ODError): void;
    log(message: string, type?: ODConsoleMessageTypes, params?: ODConsoleMessageParam[]): void;
}
/**## ODDebugFileManager `class`
 * This is the Open Ticket debug file manager.
 *
 * It manages the Open Ticket debug file (`otdebug.txt`) which keeps a history of all system logs.
 * There are even internal logs that aren't logged to the console which are available in this file!
 *
 * Using this class, you can change the max length of this file and some other cool things!
 */
export declare class ODDebugFileManager {
    #private;
    /**The path to the debugfile (`./otdebug.txt` by default) */
    path: string;
    /**The filename of the debugfile (`otdebug.txt` by default) */
    filename: string;
    /**The current version of the bot used in the debug file. */
    version: ODVersion;
    /**The max length of the debug file. */
    maxlines: number;
    constructor(path: string, filename: string, maxlines: number, version: ODVersion);
    /**Write an `ODConsoleMessage` to the debug file */
    writeConsoleMessage(message: ODConsoleMessage): void;
    /**Write an `ODError` to the debug file */
    writeErrorMessage(error: ODError): void;
    /**Write custom text to the debug file */
    writeText(text: string): void;
    /**Write a custom note to the debug file (starting with `[NOTE]:`) */
    writeNote(text: string): void;
}
/**## ODDebugger `class`
 * This is the Open Ticket debugger.
 *
 * It is a simple wrapper around the `ODConsoleManager` to handle debugging (primarily for `ODManagers`).
 * Messages created using this debugger are only logged to the debug file unless specified otherwise.
 *
 * You will probably notice this class being used in the `ODManager` constructor.
 *
 * Using this system, all additions & removals inside a manager are logged to the debug file. This makes searching for errors a lot easier!
 */
export declare class ODDebugger {
    /**An alias to the Open Ticket console manager. */
    console: ODConsoleManager;
    /**When enabled, debug logs are also shown in the console. */
    visible: boolean;
    constructor(console: ODConsoleManager);
    /**Create a debug message. This will always be logged to `otdebug.txt` & sometimes to the console (when enabled). Returns `true` when visible */
    debug(message: string, params?: {
        key: string;
        value: string;
    }[]): boolean;
}
/**## ODLivestatusColor `type`
 * This is a collection of all the colors available within the LiveStatus system.
 */
export type ODLiveStatusColor = "normal" | "red" | "green" | "blue" | "yellow" | "white" | "gray" | "magenta" | "cyan";
/**## ODLiveStatusSourceData `interface`
 * This is an interface containing all raw data received from the LiveStatus system.
 */
export interface ODLiveStatusSourceData {
    /**The message to display */
    message: {
        /**The title of the message to display */
        title: string;
        /**The title color of the message to display */
        titleColor: ODLiveStatusColor;
        /**The description of the message to display */
        description: string;
        /**The description color of the message to display */
        descriptionColor: ODLiveStatusColor;
    };
    /**The message will only be shown when the bot matches all statements */
    active: {
        /**A list of versions to match */
        versions: string[];
        /**A list of languages to match */
        languages: string[];
        /**All languages should match */
        allLanguages: boolean;
        /**Match when the bot is using plugins */
        usingPlugins: boolean;
        /**Match when the bot is not using plugins */
        notUsingPlugins: boolean;
        /**Match when the bot is using slash commands */
        usingSlashCommands: boolean;
        /**Match when the bot is not using slash commands */
        notUsingSlashCommands: boolean;
        /**Match when the bot is not using transcripts */
        notUsingTranscripts: boolean;
        /**Match when the bot is using text transcripts */
        usingTextTranscripts: boolean;
        /**Match when the bot is using html transcripts */
        usingHtmlTranscripts: boolean;
    };
}
/**## ODLiveStatusSource `class`
 * This is the Open Ticket livestatus source.
 *
 * It is an empty template for a livestatus source.
 * By default, you should use `ODLiveStatusUrlSource` or `ODLiveStatusFileSource`,
 * unless you want to create one on your own!
 *
 * This class doesn't do anything on it's own! It's just a template!
 */
export declare class ODLiveStatusSource extends ODManagerData {
    /**The raw data of this source */
    data: ODLiveStatusSourceData[];
    constructor(id: ODValidId, data: ODLiveStatusSourceData[]);
    /**Change the current data using this method! */
    setData(data: ODLiveStatusSourceData[]): void;
    /**Get all messages relevant to the bot based on some parameters. */
    getMessages(main: ODMain): Promise<ODLiveStatusSourceData[]>;
}
/**## ODLiveStatusFileSource `class`
 * This is the Open Ticket livestatus file source.
 *
 * It is a LiveStatus source that will read the data from a local file.
 *
 * This can be used for testing/extending the LiveStatus system!
 */
export declare class ODLiveStatusFileSource extends ODLiveStatusSource {
    /**The path to the source file */
    path: string;
    constructor(id: ODValidId, path: string);
}
/**## ODLiveStatusUrlSource `class`
 * This is the Open Ticket livestatus url source.
 *
 * It is a LiveStatus source that will read the data from a http URL (json file).
 *
 * This is the default way of receiving LiveStatus messages!
 */
export declare class ODLiveStatusUrlSource extends ODLiveStatusSource {
    /**The url used in the request */
    url: string;
    /**The `ODHTTPGetRequest` helper to fetch the url! */
    request: ODHTTPGetRequest;
    constructor(id: ODValidId, url: string);
    getMessages(main: ODMain): Promise<ODLiveStatusSourceData[]>;
}
/**## ODLiveStatusManager `class`
 * This is the Open Ticket livestatus manager.
 *
 * It manages all LiveStatus sources and has the renderer for all LiveStatus messages.
 *
 * You can use this to customise or add stuff to the LiveStatus system.
 * Access it in the global `opendiscord.startscreen.livestatus` variable!
 */
export declare class ODLiveStatusManager extends ODManager<ODLiveStatusSource> {
    #private;
    /**The class responsible for rendering the livestatus messages. */
    renderer: ODLiveStatusRenderer;
    constructor(debug: ODDebugger, main: ODMain);
    /**Get the messages from all sources combined! */
    getAllMessages(): Promise<ODLiveStatusSourceData[]>;
}
/**## ODLiveStatusRenderer `class`
 * This is the Open Ticket livestatus renderer.
 *
 * It's responsible for rendering all LiveStatus messages to the console.
 */
export declare class ODLiveStatusRenderer {
    #private;
    constructor(console: ODConsoleManager);
    /**Render all messages */
    render(messages: ODLiveStatusSourceData[]): string;
}
