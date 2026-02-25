import { ODManager, ODManagerData, ODValidId } from "./base";
/**## ODWorkerCallback `type`
 * This is the callback used in `ODWorker`!
 */
export type ODWorkerCallback<Instance, Source extends string, Params> = (instance: Instance, params: Params, source: Source, cancel: () => void) => void | Promise<void>;
/**## ODWorker `class`
 * This is an Open Ticket worker.
 *
 * You can compare it with a normal javascript callback, but slightly more advanced!
 *
 * - It has an `id` for identification of the function
 * - A `priority` to know when to execute this callback (related to others)
 * - It knows who called this callback (`source`)
 * - And much more!
 */
export declare class ODWorker<Instance, Source extends string, Params> extends ODManagerData {
    /**The priority of this worker */
    priority: number;
    /**The main callback of this worker */
    callback: ODWorkerCallback<Instance, Source, Params>;
    constructor(id: ODValidId, priority: number, callback: ODWorkerCallback<Instance, Source, Params>);
}
/**## ODWorker `class`
 * This is an Open Ticket worker manager.
 *
 * It manages & executes `ODWorker`'s in the correct order.
 *
 * You can register a custom worker in this class to create a message or button.
 */
export declare class ODWorkerManager<Instance, Source extends string, Params> extends ODManager<ODWorker<Instance, Source, Params>> {
    #private;
    /**The backup worker will be executed when one of the workers fails or cancels execution. */
    backupWorker: ODWorker<{
        reason: "error" | "cancel";
    }, Source, Params> | null;
    constructor(priorityOrder: "ascending" | "descending");
    /**Get all workers in sorted order. */
    getSortedWorkers(priority: "ascending" | "descending"): ODWorker<Instance, Source, Params>[];
    /**Execute all workers on an instance using the given source & parameters. */
    executeWorkers(instance: Instance, source: Source, params: Params): Promise<void>;
}
