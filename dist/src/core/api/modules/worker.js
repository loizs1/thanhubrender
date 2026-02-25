"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODWorkerManager = exports.ODWorker = void 0;
///////////////////////////////////////
//WORKER MODULE
///////////////////////////////////////
const base_1 = require("./base");
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
class ODWorker extends base_1.ODManagerData {
    /**The priority of this worker */
    priority;
    /**The main callback of this worker */
    callback;
    constructor(id, priority, callback) {
        super(id);
        this.priority = priority;
        this.callback = callback;
    }
}
exports.ODWorker = ODWorker;
/**## ODWorker `class`
 * This is an Open Ticket worker manager.
 *
 * It manages & executes `ODWorker`'s in the correct order.
 *
 * You can register a custom worker in this class to create a message or button.
 */
class ODWorkerManager extends base_1.ODManager {
    /**The order of execution for workers inside this manager. */
    #priorityOrder;
    /**The backup worker will be executed when one of the workers fails or cancels execution. */
    backupWorker = null;
    constructor(priorityOrder) {
        super();
        this.#priorityOrder = priorityOrder;
    }
    /**Get all workers in sorted order. */
    getSortedWorkers(priority) {
        const derefArray = [...this.getAll()];
        return derefArray.sort((a, b) => {
            if (priority == "ascending")
                return a.priority - b.priority;
            else
                return b.priority - a.priority;
        });
    }
    /**Execute all workers on an instance using the given source & parameters. */
    async executeWorkers(instance, source, params) {
        const derefParams = { ...params };
        const workers = this.getSortedWorkers(this.#priorityOrder);
        let didCancel = false;
        let didCrash = false;
        for (const worker of workers) {
            if (didCancel)
                break;
            try {
                await worker.callback(instance, derefParams, source, () => {
                    didCancel = true;
                });
            }
            catch (err) {
                process.emit("uncaughtException", err);
                didCrash = true;
            }
        }
        if (didCancel && this.backupWorker) {
            try {
                await this.backupWorker.callback({ reason: "cancel" }, derefParams, source, () => { });
            }
            catch (err) {
                process.emit("uncaughtException", err);
            }
        }
        else if (didCrash && this.backupWorker) {
            try {
                await this.backupWorker.callback({ reason: "error" }, derefParams, source, () => { });
            }
            catch (err) {
                process.emit("uncaughtException", err);
            }
        }
    }
}
exports.ODWorkerManager = ODWorkerManager;
