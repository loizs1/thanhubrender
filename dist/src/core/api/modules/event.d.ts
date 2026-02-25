import { ODManagerData, ODManager, ODValidId } from "./base";
import { ODDebugger } from "./console";
/**## ODEvent `class`
 * This is an Open Ticket event.
 *
 * This class is made to work with the `ODEventManager` to handle events.
 * The function of this specific class is to manage all listeners for a specifc event!
 */
export declare class ODEvent extends ODManagerData {
    #private;
    /**The list of permanent listeners. */
    listeners: Function[];
    /**The list of one-time listeners. List is cleared every time the event is emitted. */
    oncelisteners: Function[];
    /**The max listener limit before a possible memory leak will be announced */
    listenerLimit: number;
    /**Use the Open Ticket debugger in this manager for logs*/
    useDebug(debug: ODDebugger | null): void;
    /**Edit the listener limit */
    setListenerLimit(limit: number): void;
    /**Add a permanent callback to this event. This will stay as long as the bot is running! */
    listen(callback: Function): void;
    /**Add a one-time-only callback to this event. This will only trigger the callback once! */
    listenOnce(callback: Function): void;
    /**Wait until this event is fired! Be carefull with it, because it could block the entire bot when wrongly used! */
    wait(): Promise<any[]>;
    /**Emit this event to all listeners. You are required to provide all parameters of the event! */
    emit(params: any[]): Promise<void>;
}
/**## ODEventManager `class`
 * This is an Open Ticket event manager.
 *
 * This class is made to manage all events in the bot. You can compare it with the built-in node.js `EventEmitter`
 *
 * It's not recommended to create this class yourself. Plugin events should be registered in their `plugin.json` file instead.
 * All events are available in the `opendiscord.events` global!
 */
export declare class ODEventManager extends ODManager<ODEvent> {
    #private;
    constructor(debug: ODDebugger);
    add(data: ODEvent, overwrite?: boolean): boolean;
    remove(id: ODValidId): ODEvent | null;
}
