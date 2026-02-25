"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODEventManager = exports.ODEvent = void 0;
///////////////////////////////////////
//EVENT MODULE
///////////////////////////////////////
const base_1 = require("./base");
const console_1 = require("./console");
/**## ODEvent `class`
 * This is an Open Ticket event.
 *
 * This class is made to work with the `ODEventManager` to handle events.
 * The function of this specific class is to manage all listeners for a specifc event!
 */
class ODEvent extends base_1.ODManagerData {
    /**Alias to Open Ticket debugger. */
    #debug;
    /**The list of permanent listeners. */
    listeners = [];
    /**The list of one-time listeners. List is cleared every time the event is emitted. */
    oncelisteners = [];
    /**The max listener limit before a possible memory leak will be announced */
    listenerLimit = 25;
    /**Use the Open Ticket debugger in this manager for logs*/
    useDebug(debug) {
        this.#debug = debug ?? undefined;
    }
    /**Get a collection of listeners combined from both types. Also clears the one-time listeners array! */
    #getCurrentListeners() {
        const final = [];
        this.oncelisteners.forEach((l) => final.push(l));
        this.listeners.forEach((l) => final.push(l));
        this.oncelisteners = [];
        return final;
    }
    /**Edit the listener limit */
    setListenerLimit(limit) {
        this.listenerLimit = limit;
    }
    /**Add a permanent callback to this event. This will stay as long as the bot is running! */
    listen(callback) {
        this.listeners.push(callback);
        if (this.listeners.length > this.listenerLimit) {
            if (this.#debug)
                this.#debug.console.log(new console_1.ODConsoleWarningMessage("Possible event memory leak detected!", [
                    { key: "event", value: this.id.value },
                    { key: "listeners", value: this.listeners.length.toString() }
                ]));
        }
    }
    /**Add a one-time-only callback to this event. This will only trigger the callback once! */
    listenOnce(callback) {
        this.oncelisteners.push(callback);
    }
    /**Wait until this event is fired! Be carefull with it, because it could block the entire bot when wrongly used! */
    async wait() {
        return new Promise((resolve, reject) => {
            this.oncelisteners.push((...args) => { resolve(args); });
        });
    }
    /**Emit this event to all listeners. You are required to provide all parameters of the event! */
    async emit(params) {
        for (const listener of this.#getCurrentListeners()) {
            try {
                await listener(...params);
            }
            catch (err) {
                process.emit("uncaughtException", err);
            }
        }
    }
}
exports.ODEvent = ODEvent;
/**## ODEventManager `class`
 * This is an Open Ticket event manager.
 *
 * This class is made to manage all events in the bot. You can compare it with the built-in node.js `EventEmitter`
 *
 * It's not recommended to create this class yourself. Plugin events should be registered in their `plugin.json` file instead.
 * All events are available in the `opendiscord.events` global!
 */
class ODEventManager extends base_1.ODManager {
    /**Reference to the Open Ticket debugger */
    #debug;
    constructor(debug) {
        super(debug, "event");
        this.#debug = debug;
    }
    add(data, overwrite) {
        data.useDebug(this.#debug);
        return super.add(data, overwrite);
    }
    remove(id) {
        const data = super.remove(id);
        if (data)
            data.useDebug(null);
        return data;
    }
}
exports.ODEventManager = ODEventManager;
