"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODWorkerManager_Default = void 0;
const worker_1 = require("../modules/worker");
/**## ODWorkerManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODWorkerManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the worker manager in actions, builders & responders!
 */
class ODWorkerManager_Default extends worker_1.ODWorkerManager {
    get(id) {
        return super.get(id);
    }
    remove(id) {
        return super.remove(id);
    }
    exists(id) {
        return super.exists(id);
    }
}
exports.ODWorkerManager_Default = ODWorkerManager_Default;
