"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODEvent_Default = exports.ODEventManager_Default = void 0;
const event_1 = require("../modules/event");
/**## ODEventManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODEvent class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.events`!
 */
class ODEventManager_Default extends event_1.ODEventManager {
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
exports.ODEventManager_Default = ODEventManager_Default;
/**## ODEventManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODEvent class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.events`!
 */
class ODEvent_Default extends event_1.ODEvent {
    listen(callback) {
        return super.listen(callback);
    }
    listenOnce(callback) {
        return super.listenOnce(callback);
    }
    wait() {
        return super.wait();
    }
    emit(params) {
        return super.emit(params);
    }
}
exports.ODEvent_Default = ODEvent_Default;
