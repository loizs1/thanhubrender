import { ODValidId, ODManager, ODManagerData } from "./base";
import { ODDebugger } from "./console";
/**## ODCooldownManager `class`
 * This is an Open Ticket cooldown manager.
 *
 * It is responsible for managing all cooldowns in Open Ticket. An example of this is the ticket creation cooldown.
 *
 * There are many types of cooldowns available, but you can also create your own!
 */
export declare class ODCooldownManager extends ODManager<ODCooldown<object>> {
    constructor(debug: ODDebugger);
    /**Initiate all cooldowns in this manager. */
    init(): Promise<void>;
}
/**## ODCooldownData `class`
 * This is Open Ticket cooldown data.
 *
 * It contains the instance of an active cooldown (e.g. for a user). It is handled by the cooldown itself.
 */
export declare class ODCooldownData<Data extends object> extends ODManagerData {
    /**Is this cooldown active? */
    active: boolean;
    /**Additional data of this cooldown instance. (different for each cooldown type) */
    data: Data;
    constructor(id: ODValidId, active: boolean, data: Data);
}
/**## ODCooldown `class`
 * This is an Open Ticket cooldown.
 *
 * It doesn't do anything on it's own, but it provides the methods that are used to interact with a cooldown.
 * This class can be extended from to create a working cooldown.
 *
 * There are also premade cooldowns available in the bot!
 */
export declare class ODCooldown<Data extends object> extends ODManagerData {
    data: ODManager<ODCooldownData<Data>>;
    /**Is this cooldown already initialized? */
    ready: boolean;
    constructor(id: ODValidId);
    /**Check this id and start cooldown when it exeeds the limit! Returns `true` when on cooldown! */
    use(id: string): boolean;
    /**Check this id without starting or updating the cooldown. Returns `true` when on cooldown! */
    check(id: string): boolean;
    /**Remove the cooldown for an id when available.*/
    delete(id: string): void;
    /**Initialize the internal systems of this cooldown. */
    init(): Promise<void>;
}
/**## ODCounterCooldown `class`
 * This is an Open Ticket counter cooldown.
 *
 * It is is a cooldown based on a counter. When the number exceeds the limit, the cooldown is activated.
 * The number will automatically be decreased with a set amount & interval.
 */
export declare class ODCounterCooldown extends ODCooldown<{
    value: number;
}> {
    /**The cooldown will activate when exceeding this limit. */
    activeLimit: number;
    /**The cooldown will deactivate when below this limit. */
    cancelLimit: number;
    /**The amount to increase the counter with everytime the cooldown is triggered/updated. */
    increment: number;
    /**The amount to decrease the counter over time. */
    decrement: number;
    /**The interval between decrements in milliseconds. */
    invervalMs: number;
    constructor(id: ODValidId, activeLimit: number, cancelLimit: number, increment: number, decrement: number, intervalMs: number);
    use(id: string): boolean;
    check(id: string): boolean;
    delete(id: string): void;
    init(): Promise<void>;
}
/**## ODIncrementalCounterCooldown `class`
 * This is an Open Ticket incremental counter cooldown.
 *
 * It is is a cooldown based on an incremental counter. It is exactly the same as the normal counter,
 * with the only difference being that it still increments when the limit is already exeeded.
 */
export declare class ODIncrementalCounterCooldown extends ODCooldown<{
    value: number;
}> {
    /**The cooldown will activate when exceeding this limit. */
    activeLimit: number;
    /**The cooldown will deactivate when below this limit. */
    cancelLimit: number;
    /**The amount to increase the counter with everytime the cooldown is triggered/updated. */
    increment: number;
    /**The amount to decrease the counter over time. */
    decrement: number;
    /**The interval between decrements in milliseconds. */
    invervalMs: number;
    constructor(id: ODValidId, activeLimit: number, cancelLimit: number, increment: number, decrement: number, intervalMs: number);
    use(id: string): boolean;
    check(id: string): boolean;
    delete(id: string): void;
    init(): Promise<void>;
}
/**## ODTimeoutCooldown `class`
 * This is an Open Ticket timeout cooldown.
 *
 * It is a cooldown based on a timer. When triggered/updated, the cooldown is activated for the set amount of time.
 * After the timer has timed out, the cooldown will be deleted.
 */
export declare class ODTimeoutCooldown extends ODCooldown<{
    date: number;
}> {
    /**The amount of milliseconds before the cooldown times-out */
    timeoutMs: number;
    constructor(id: ODValidId, timeoutMs: number);
    use(id: string): boolean;
    check(id: string): boolean;
    delete(id: string): void;
    /**Get the remaining amount of milliseconds before the timeout stops. */
    remaining(id: string): number | null;
    init(): Promise<void>;
}
/**## ODIncrementalTimeoutCooldown `class`
 * This is an Open Ticket incremental timeout cooldown.
 *
 * It is is a cooldown based on an incremental timer. It is exactly the same as the normal timer,
 * with the only difference being that it adds additional time when triggered/updated while the cooldown is already active.
 */
export declare class ODIncrementalTimeoutCooldown extends ODCooldown<{
    date: number;
}> {
    /**The amount of milliseconds before the cooldown times-out */
    timeoutMs: number;
    /**The amount of milliseconds to add when triggered/updated while the cooldown is already active. */
    incrementMs: number;
    constructor(id: ODValidId, timeoutMs: number, incrementMs: number);
    use(id: string): boolean;
    check(id: string): boolean;
    delete(id: string): void;
    /**Get the remaining amount of milliseconds before the timeout stops. */
    remaining(id: string): number | null;
    init(): Promise<void>;
}
