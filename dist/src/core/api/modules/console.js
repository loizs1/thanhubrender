"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODLiveStatusRenderer = exports.ODLiveStatusManager = exports.ODLiveStatusUrlSource = exports.ODLiveStatusFileSource = exports.ODLiveStatusSource = exports.ODDebugger = exports.ODDebugFileManager = exports.ODConsoleManager = exports.ODError = exports.ODConsoleErrorMessage = exports.ODConsoleWarningMessage = exports.ODConsoleDebugMessage = exports.ODConsolePluginMessage = exports.ODConsoleSystemMessage = exports.ODConsoleInfoMessage = exports.ODConsoleMessage = void 0;
///////////////////////////////////////
//CONSOLE MODULE
///////////////////////////////////////
const base_1 = require("./base");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ansis_1 = __importDefault(require("ansis"));
/**## ODConsoleMessage `class`
 * This is an Open Ticket console message.
 *
 * It is used to create beautiful & styled logs in the console with a prefix, message & parameters.
 * It also has full color support using `ansis` and parameters are parsed for you!
 */
class ODConsoleMessage {
    /**The main message sent in the console */
    message;
    /**An array of all the parameters in this message */
    params;
    /**The prefix of this message (!uppercase recommended!) */
    prefix;
    /**The color of the prefix of this message */
    color;
    constructor(message, prefix, color, params) {
        this.message = message;
        this.params = params ? params : [];
        this.prefix = prefix;
        if (["white", "red", "yellow", "green", "blue", "gray", "cyan", "magenta"].includes(color)) {
            this.color = color;
        }
        else {
            this.color = "white";
        }
    }
    /**Render this message to the console using `console.log`! Returns `false` when something went wrong. */
    render() {
        try {
            const prefixcolor = ansis_1.default[this.color];
            const paramsstring = " " + this.createParamsString("gray");
            const message = prefixcolor("[" + this.prefix + "] ") + this.message;
            console.log(message + paramsstring);
            return true;
        }
        catch {
            return false;
        }
    }
    /**Create a more-detailed, non-colored version of this message to store it in the `otdebug.txt` file! */
    toDebugString() {
        const pstrings = [];
        this.params.forEach((p) => {
            pstrings.push(p.key + ": " + p.value);
        });
        const pstring = (pstrings.length > 0) ? " (" + pstrings.join(", ") + ")" : "";
        const date = new Date();
        const dstring = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        return `[${dstring} ${this.prefix}] ${this.message}${pstring}`;
    }
    /**Render the parameters of this message in a specific color. */
    createParamsString(color) {
        let validcolor = "white";
        if (["white", "red", "yellow", "green", "blue", "gray", "cyan", "magenta"].includes(color)) {
            validcolor = color;
        }
        const pstrings = [];
        this.params.forEach((p) => {
            if (!p.hidden)
                pstrings.push(p.key + ": " + p.value);
        });
        return (pstrings.length > 0) ? ansis_1.default[validcolor](" (" + pstrings.join(", ") + ")") : "";
    }
    /**Set the message */
    setMessage(message) {
        this.message = message;
        return this;
    }
    /**Set the params */
    setParams(params) {
        this.params = params;
        return this;
    }
    /**Set the prefix */
    setPrefix(prefix) {
        this.prefix = prefix;
        return this;
    }
    /**Set the prefix color */
    setColor(color) {
        if (["white", "red", "yellow", "green", "blue", "gray", "cyan", "magenta"].includes(color)) {
            this.color = color;
        }
        else {
            this.color = "white";
        }
        return this;
    }
}
exports.ODConsoleMessage = ODConsoleMessage;
/**## ODConsoleInfoMessage `class`
 * This is an Open Ticket console info message.
 *
 * It is the same as a normal `ODConsoleMessage`, but it has a predefined prefix & color scheme for the "INFO" messages!
 */
class ODConsoleInfoMessage extends ODConsoleMessage {
    constructor(message, params) {
        super(message, "INFO", "blue", params);
    }
}
exports.ODConsoleInfoMessage = ODConsoleInfoMessage;
/**## ODConsoleSystemMessage `class`
 * This is an Open Ticket console system message.
 *
 * It is the same as a normal `ODConsoleMessage`, but it has a predefined prefix & color scheme for the "SYSTEM" messages!
 */
class ODConsoleSystemMessage extends ODConsoleMessage {
    constructor(message, params) {
        super(message, "SYSTEM", "green", params);
    }
}
exports.ODConsoleSystemMessage = ODConsoleSystemMessage;
/**## ODConsolePluginMessage `class`
 * This is an Open Ticket console plugin message.
 *
 * It is the same as a normal `ODConsoleMessage`, but it has a predefined prefix & color scheme for the "PLUGIN" messages!
 */
class ODConsolePluginMessage extends ODConsoleMessage {
    constructor(message, params) {
        super(message, "PLUGIN", "magenta", params);
    }
}
exports.ODConsolePluginMessage = ODConsolePluginMessage;
/**## ODConsoleDebugMessage `class`
 * This is an Open Ticket console debug message.
 *
 * It is the same as a normal `ODConsoleMessage`, but it has a predefined prefix & color scheme for the "DEBUG" messages!
 */
class ODConsoleDebugMessage extends ODConsoleMessage {
    constructor(message, params) {
        super(message, "DEBUG", "cyan", params);
    }
}
exports.ODConsoleDebugMessage = ODConsoleDebugMessage;
/**## ODConsoleWarningMessage `class`
 * This is an Open Ticket console warning message.
 *
 * It is the same as a normal `ODConsoleMessage`, but it has a predefined prefix & color scheme for the "WARNING" messages!
 */
class ODConsoleWarningMessage extends ODConsoleMessage {
    constructor(message, params) {
        super(message, "WARNING", "yellow", params);
    }
}
exports.ODConsoleWarningMessage = ODConsoleWarningMessage;
/**## ODConsoleErrorMessage `class`
 * This is an Open Ticket console error message.
 *
 * It is the same as a normal `ODConsoleMessage`, but it has a predefined prefix & color scheme for the "ERROR" messages!
 */
class ODConsoleErrorMessage extends ODConsoleMessage {
    constructor(message, params) {
        super(message, "ERROR", "red", params);
    }
}
exports.ODConsoleErrorMessage = ODConsoleErrorMessage;
/**## ODError `class`
 * This is an Open Ticket error.
 *
 * It is used to render and log Node.js errors & crashes in a styled way to the console & `otdebug.txt` file!
 */
class ODError {
    /**The original error that this class wraps around */
    error;
    /**The origin of the original error */
    origin;
    constructor(error, origin) {
        this.error = error;
        this.origin = origin;
    }
    /**Render this error to the console using `console.log`! Returns `false` when something went wrong. */
    render() {
        try {
            let prefix = (this.error["_ODErrorType"] == "plugin") ? "PLUGIN ERROR" : ((this.error["_ODErrorType"] == "system") ? "OPENTICKET ERROR" : "UNKNOWN ERROR");
            //title
            console.log(ansis_1.default.red("[" + prefix + "]: ") + this.error.message + " | origin: " + this.origin);
            //stack trace
            if (this.error.stack)
                console.log(ansis_1.default.gray(this.error.stack));
            //additional message
            if (this.error["_ODErrorType"] == "plugin")
                console.log(ansis_1.default.red.bold("\nPlease report this error to the plugin developer and help us create a more stable plugin!"));
            else
                console.log(ansis_1.default.red.bold("\nPlease report this error to our discord server and help us create a more stable ticket bot!"));
            console.log(ansis_1.default.red("Also send the " + ansis_1.default.cyan.bold("otdebug.txt") + " file! It would help a lot!\n"));
            return true;
        }
        catch {
            return false;
        }
    }
    /**Create a more-detailed, non-colored version of this error to store it in the `otdebug.txt` file! */
    toDebugString() {
        return "[UNKNOWN OD ERROR]: " + this.error.message + " | origin: " + this.origin + "\n" + this.error.stack;
    }
}
exports.ODError = ODError;
/**## ODConsoleManager `class`
 * This is the Open Ticket console manager.
 *
 * It handles the entire console system of Open Ticket. It's also the place where you need to log `ODConsoleMessage`'s.
 * This manager keeps a short history of messages sent to the console which is configurable by plugins.
 *
 * The debug file (`otdebug.txt`) is handled in a sub-manager!
 */
class ODConsoleManager {
    /**The history of `ODConsoleMessage`'s and `ODError`'s since startup */
    history = [];
    /**The max length of the history. The oldest messages will be removed when over the limit */
    historylength = 100;
    /**An alias to the debugfile manager. (`otdebug.txt`) */
    debugfile;
    /**Is silent mode enabled? */
    silent = false;
    constructor(historylength, debugfile) {
        this.historylength = historylength;
        this.debugfile = debugfile;
    }
    log(message, type, params) {
        if (message instanceof ODConsoleMessage) {
            if (!this.silent)
                message.render();
            if (this.debugfile)
                this.debugfile.writeConsoleMessage(message);
            this.history.push(message);
        }
        else if (message instanceof ODError) {
            if (!this.silent)
                message.render();
            if (this.debugfile)
                this.debugfile.writeErrorMessage(message);
            this.history.push(message);
        }
        else if (["string", "number", "boolean", "object"].includes(typeof message)) {
            let newMessage;
            if (type == "info")
                newMessage = new ODConsoleInfoMessage(message, params);
            else if (type == "system")
                newMessage = new ODConsoleSystemMessage(message, params);
            else if (type == "plugin")
                newMessage = new ODConsolePluginMessage(message, params);
            else if (type == "debug")
                newMessage = new ODConsoleDebugMessage(message, params);
            else if (type == "warning")
                newMessage = new ODConsoleWarningMessage(message, params);
            else if (type == "error")
                newMessage = new ODConsoleErrorMessage(message, params);
            else
                newMessage = new ODConsoleSystemMessage(message, params);
            if (!this.silent)
                newMessage.render();
            if (this.debugfile)
                this.debugfile.writeConsoleMessage(newMessage);
            this.history.push(newMessage);
        }
        this.#purgeHistory();
    }
    /**Shorten the history when it exceeds the max history length! */
    #purgeHistory() {
        if (this.history.length > this.historylength)
            this.history.shift();
    }
}
exports.ODConsoleManager = ODConsoleManager;
/**## ODDebugFileManager `class`
 * This is the Open Ticket debug file manager.
 *
 * It manages the Open Ticket debug file (`otdebug.txt`) which keeps a history of all system logs.
 * There are even internal logs that aren't logged to the console which are available in this file!
 *
 * Using this class, you can change the max length of this file and some other cool things!
 */
class ODDebugFileManager {
    /**The path to the debugfile (`./otdebug.txt` by default) */
    path;
    /**The filename of the debugfile (`otdebug.txt` by default) */
    filename;
    /**The current version of the bot used in the debug file. */
    version;
    /**The max length of the debug file. */
    maxlines;
    constructor(path, filename, maxlines, version) {
        this.path = path_1.default.join(path, filename);
        this.filename = filename;
        this.version = version;
        this.maxlines = maxlines;
        this.#writeStartupStats();
    }
    /**Check if the debug file exists */
    #existsDebugFile() {
        return fs_1.default.existsSync(this.path);
    }
    /**Read from the debug file */
    #readDebugFile() {
        if (this.#existsDebugFile()) {
            try {
                return fs_1.default.readFileSync(this.path).toString();
            }
            catch {
                return false;
            }
        }
        else {
            return false;
        }
    }
    /**Write to the debug file and shorten it when needed. */
    #writeDebugFile(text) {
        const currenttext = this.#readDebugFile();
        if (currenttext) {
            const splitted = currenttext.split("\n");
            if (splitted.length + text.split("\n").length > this.maxlines) {
                splitted.splice(7, (text.split("\n").length));
            }
            splitted.push(text);
            fs_1.default.writeFileSync(this.path, splitted.join("\n"));
        }
        else {
            //write new file:
            const newtext = this.#createStatsText() + text;
            fs_1.default.writeFileSync(this.path, newtext);
        }
    }
    /**Generate the stats/header of the debug file (containing the version) */
    #createStatsText() {
        const date = new Date();
        const dstring = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        return [
            "=========================",
            "OPEN TICKET DEBUG FILE:",
            "version: " + this.version.toString(),
            "last startup: " + dstring,
            "=========================\n\n"
        ].join("\n");
    }
    /**Write the stats/header to the debug file on startup */
    #writeStartupStats() {
        const currenttext = this.#readDebugFile();
        if (currenttext) {
            //edit previous file:
            const splitted = currenttext.split("\n");
            splitted.splice(0, 7);
            if (splitted.length + 11 > this.maxlines) {
                splitted.splice(0, ((splitted.length + 11) - this.maxlines));
            }
            splitted.unshift(this.#createStatsText());
            splitted.push("\n---------------------------------------------------------------------\n---------------------------------------------------------------------\n");
            fs_1.default.writeFileSync(this.path, splitted.join("\n"));
        }
        else {
            //write new file:
            const newtext = this.#createStatsText();
            fs_1.default.writeFileSync(this.path, newtext);
        }
    }
    /**Write an `ODConsoleMessage` to the debug file */
    writeConsoleMessage(message) {
        this.#writeDebugFile(message.toDebugString());
    }
    /**Write an `ODError` to the debug file */
    writeErrorMessage(error) {
        this.#writeDebugFile(error.toDebugString());
    }
    /**Write custom text to the debug file */
    writeText(text) {
        this.#writeDebugFile(text);
    }
    /**Write a custom note to the debug file (starting with `[NOTE]:`) */
    writeNote(text) {
        this.#writeDebugFile("[NOTE]: " + text);
    }
}
exports.ODDebugFileManager = ODDebugFileManager;
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
class ODDebugger {
    /**An alias to the Open Ticket console manager. */
    console;
    /**When enabled, debug logs are also shown in the console. */
    visible = false;
    constructor(console) {
        this.console = console;
    }
    /**Create a debug message. This will always be logged to `otdebug.txt` & sometimes to the console (when enabled). Returns `true` when visible */
    debug(message, params) {
        if (this.visible) {
            this.console.log(new ODConsoleDebugMessage(message, params));
            return true;
        }
        else {
            this.console.debugfile.writeConsoleMessage(new ODConsoleDebugMessage(message, params));
            return false;
        }
    }
}
exports.ODDebugger = ODDebugger;
/**## ODLiveStatusSource `class`
 * This is the Open Ticket livestatus source.
 *
 * It is an empty template for a livestatus source.
 * By default, you should use `ODLiveStatusUrlSource` or `ODLiveStatusFileSource`,
 * unless you want to create one on your own!
 *
 * This class doesn't do anything on it's own! It's just a template!
 */
class ODLiveStatusSource extends base_1.ODManagerData {
    /**The raw data of this source */
    data;
    constructor(id, data) {
        super(id);
        this.data = data;
    }
    /**Change the current data using this method! */
    setData(data) {
        this.data = data;
    }
    /**Get all messages relevant to the bot based on some parameters. */
    async getMessages(main) {
        const validMessages = [];
        //parse data from ODMain
        const currentVersion = main.versions.get("opendiscord:version").toString(true);
        const usingSlashCommands = main.configs.get("opendiscord:general").data.slashCommands;
        const usingTranscripts = false; //TODO
        const currentLanguage = main.languages.getCurrentLanguageId();
        const usingPlugins = (main.plugins.getLength() > 0);
        //check data for each message
        this.data.forEach((msg) => {
            const { active } = msg;
            const correctVersion = active.versions.includes(currentVersion);
            const correctSlashMode = (usingSlashCommands && active.usingSlashCommands) || (!usingSlashCommands && active.notUsingSlashCommands);
            const correctTranscriptMode = (usingTranscripts == "text" && active.usingTextTranscripts) || (usingTranscripts == "html" && active.usingHtmlTranscripts) || (!usingTranscripts && active.notUsingTranscripts);
            const correctLanguage = active.languages.includes(currentLanguage) || active.allLanguages;
            const correctPlugins = (usingPlugins && active.usingPlugins) || (!usingPlugins && active.notUsingPlugins);
            if (correctVersion && correctLanguage && correctPlugins && correctSlashMode && correctTranscriptMode)
                validMessages.push(msg);
        });
        //return the valid messages
        return validMessages;
    }
}
exports.ODLiveStatusSource = ODLiveStatusSource;
/**## ODLiveStatusFileSource `class`
 * This is the Open Ticket livestatus file source.
 *
 * It is a LiveStatus source that will read the data from a local file.
 *
 * This can be used for testing/extending the LiveStatus system!
 */
class ODLiveStatusFileSource extends ODLiveStatusSource {
    /**The path to the source file */
    path;
    constructor(id, path) {
        if (fs_1.default.existsSync(path)) {
            super(id, JSON.parse(fs_1.default.readFileSync(path).toString()));
        }
        else
            throw new base_1.ODSystemError("LiveStatus source file doesn't exist!");
        this.path = path;
    }
}
exports.ODLiveStatusFileSource = ODLiveStatusFileSource;
/**## ODLiveStatusUrlSource `class`
 * This is the Open Ticket livestatus url source.
 *
 * It is a LiveStatus source that will read the data from a http URL (json file).
 *
 * This is the default way of receiving LiveStatus messages!
 */
class ODLiveStatusUrlSource extends ODLiveStatusSource {
    /**The url used in the request */
    url;
    /**The `ODHTTPGetRequest` helper to fetch the url! */
    request;
    constructor(id, url) {
        super(id, []);
        this.url = url;
        this.request = new base_1.ODHTTPGetRequest(url, false);
    }
    async getMessages(main) {
        //additional setup
        this.request.url = this.url;
        const rawRes = await this.request.run();
        if (rawRes.status != 200)
            throw new base_1.ODSystemError("ODLiveStatusUrlSource => Request Failed!");
        try {
            this.setData(JSON.parse(rawRes.body));
        }
        catch {
            throw new base_1.ODSystemError("ODLiveStatusUrlSource => Request Failed!");
        }
        //default
        return super.getMessages(main);
    }
}
exports.ODLiveStatusUrlSource = ODLiveStatusUrlSource;
/**## ODLiveStatusManager `class`
 * This is the Open Ticket livestatus manager.
 *
 * It manages all LiveStatus sources and has the renderer for all LiveStatus messages.
 *
 * You can use this to customise or add stuff to the LiveStatus system.
 * Access it in the global `opendiscord.startscreen.livestatus` variable!
 */
class ODLiveStatusManager extends base_1.ODManager {
    /**The class responsible for rendering the livestatus messages. */
    renderer;
    /**A reference to the ODMain or "openticket" global variable */
    #main;
    constructor(debug, main) {
        super(debug, "livestatus source");
        this.renderer = new ODLiveStatusRenderer(main.console);
        this.#main = main;
    }
    /**Get the messages from all sources combined! */
    async getAllMessages() {
        const messages = [];
        for (const source of this.getAll()) {
            try {
                messages.push(...(await source.getMessages(this.#main)));
            }
            catch { }
        }
        return messages;
    }
}
exports.ODLiveStatusManager = ODLiveStatusManager;
/**## ODLiveStatusRenderer `class`
 * This is the Open Ticket livestatus renderer.
 *
 * It's responsible for rendering all LiveStatus messages to the console.
 */
class ODLiveStatusRenderer {
    /**A reference to the ODConsoleManager or "opendiscord.console" global variable */
    #console;
    constructor(console) {
        this.#console = console;
    }
    /**Render all messages */
    render(messages) {
        try {
            //process data
            const final = [];
            messages.forEach((msg) => {
                const titleColor = msg.message.titleColor;
                const title = "[" + msg.message.title + "] ";
                const descriptionColor = msg.message.descriptionColor;
                const description = msg.message.description.split("\n").map((text, row) => {
                    //first row row doesn't need prefix
                    if (row < 1)
                        return text;
                    //other rows do need a prefix
                    let text2 = text;
                    for (const i of title) {
                        text2 = " " + text2;
                    }
                    return text2;
                }).join("\n");
                if (!["red", "yellow", "green", "blue", "gray", "magenta", "cyan"].includes(titleColor))
                    var finalTitle = ansis_1.default.white(title);
                else
                    var finalTitle = ansis_1.default[titleColor](title);
                if (!["red", "yellow", "green", "blue", "gray", "magenta", "cyan"].includes(descriptionColor))
                    var finalDescription = ansis_1.default.white(description);
                else
                    var finalDescription = ansis_1.default[descriptionColor](description);
                final.push(finalTitle + finalDescription);
            });
            //return all messages
            return final.join("\n");
        }
        catch {
            this.#console.log("Failed to render LiveStatus messages!", "error");
            return "";
        }
    }
}
exports.ODLiveStatusRenderer = ODLiveStatusRenderer;
