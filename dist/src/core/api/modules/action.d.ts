import { ODManager, ODValidId, ODManagerData } from "./base";
import { ODWorkerManager, ODWorkerCallback } from "./worker";
import { ODDebugger } from "./console";
/**## ODActionImplementation `class`
 * This is an Open Ticket action implementation.
 *
 * It is a basic implementation of the `ODWorkerManager` used by all `ODAction` classes.
 *
 * This class can't be used stand-alone & needs to be extended from!
 */
export declare class ODActionImplementation<Source extends string, Params extends object, Result extends object> extends ODManagerData {
    /**The manager that has all workers of this implementation */
    workers: ODWorkerManager<object, Source, Params>;
    constructor(id: ODValidId, callback?: ODWorkerCallback<object, Source, Params>, priority?: number, callbackId?: ODValidId);
    /**Execute all workers & return the result. */
    run(source: Source, params: Params): Promise<Partial<Result>>;
}
/**## ODActionManager `class`
 * This is an Open Ticket action manager.
 *
 * It contains all Open Ticket actions. You can compare actions with some sort of "procedure".
 * It's a complicated task that is divided into multiple functions.
 *
 * Some examples are `ticket-creation`, `ticket-closing`, `ticket-claiming`, ...
 *
 * It's recommended to use this system in combination with Open Ticket responders!
 */
export declare class ODActionManager extends ODManager<ODAction<string, {}, {}>> {
    constructor(debug: ODDebugger);
}
export declare class ODAction<Source extends string, Params extends object, Result extends object> extends ODActionImplementation<Source, Params, Result> {
    /**Run this action */
    run(source: Source, params: Params): Promise<Partial<Result>>;
}
