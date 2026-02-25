import { ODManager, ODManagerData, ODValidId } from "./base";
import { ODDebugger } from "./console";
/**## ODSessionManager `class`
 * This is an Open Ticket session manager.
 *
 * It contains all sessions in Open Ticket. Sessions are a sort of temporary storage which will be cleared when the bot stops.
 * Data in sessions have a randomly generated key which will always be unique.
 *
 * Visit the `ODSession` class for more info
 */
export declare class ODSessionManager extends ODManager<ODSession> {
    constructor(debug: ODDebugger);
}
/**## ODSessionInstance `interface`
 * This interface represents a single session instance. It contains an id, data & some dates.
 */
export interface ODSessionInstance {
    /**The id of this session instance. */
    id: string;
    /**The creation date of this session instance. */
    creation: number;
    /**The custom amount of minutes before this session expires. */
    timeout: number | null;
    /**This is the data from this session instance */
    data: any;
}
/**## ODSessionTimeoutCallback `type`
 * This is the callback used for session timeout listeners.
 */
export type ODSessionTimeoutCallback = (id: string, timeout: "default" | "custom", data: any, creation: Date) => void;
/**## ODSession `class`
 * This is an Open Ticket session.
 *
 * It can be used to create 100% unique id's for usage in the bot. An id can also store additional data which isn't saved to the filesystem.
 * You can almost compare it to the PHP session system.
 */
export declare class ODSession extends ODManagerData {
    #private;
    /**An array of all the currently active session instances. */
    sessions: ODSessionInstance[];
    /**The default amount of minutes before a session automatically stops. */
    timeoutMinutes: number;
    constructor(id: ODValidId, intervalSeconds?: number);
    /**Stop the global interval that automatically deletes timed-out sessions. (This action can't be reverted!) */
    stopAutoTimeout(): void;
    /**Start a session instance with data. Returns the unique id required to access the session. */
    start(data?: any): string;
    /**Get the data of a session instance. Returns `null` when not found. */
    data(id: string): any | null;
    /**Stop & delete a session instance. Returns `true` when sucessful. */
    stop(id: string): boolean;
    /**Update the data of a session instance. Returns `true` when sucessful. */
    update(id: string, data: any): boolean;
    /**Change the global or session timeout minutes. Returns `true` when sucessful. */
    setTimeout(min: number, id?: string): boolean;
    /**Listen for a session timeout (default or custom) */
    onTimeout(callback: ODSessionTimeoutCallback): void;
}
