"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODStatScope_DefaultMessages = exports.ODStatScope_DefaultParticipants = exports.ODStatScope_DefaultTicket = exports.ODStatScope_DefaultUser = exports.ODStatGlobalScope_DefaultSystem = exports.ODStatGlobalScope_DefaultGlobal = exports.ODStatsManager_Default = void 0;
const stat_1 = require("../modules/stat");
/**## ODStatsManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODStatsManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.stats`!
 */
class ODStatsManager_Default extends stat_1.ODStatsManager {
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
exports.ODStatsManager_Default = ODStatsManager_Default;
/**## ODStatGlobalScope_DefaultGlobal `default_class`
 * This is a special class that adds type definitions & typescript to the ODStatsManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the `opendiscord:global` category in `opendiscord.stats`!
 */
class ODStatGlobalScope_DefaultGlobal extends stat_1.ODStatGlobalScope {
    get(id) {
        return super.get(id);
    }
    remove(id) {
        return super.remove(id);
    }
    exists(id) {
        return super.exists(id);
    }
    getStat(id) {
        return super.getStat(id);
    }
    getAllStats(id) {
        return super.getAllStats(id);
    }
    setStat(id, value, mode) {
        return super.setStat(id, value, mode);
    }
    resetStat(id) {
        return super.resetStat(id);
    }
}
exports.ODStatGlobalScope_DefaultGlobal = ODStatGlobalScope_DefaultGlobal;
/**## ODStatGlobalScope_DefaultSystem `default_class`
 * This is a special class that adds type definitions & typescript to the ODStatsManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the `opendiscord:system` category in `opendiscord.stats`!
 */
class ODStatGlobalScope_DefaultSystem extends stat_1.ODStatGlobalScope {
    get(id) {
        return super.get(id);
    }
    remove(id) {
        return super.remove(id);
    }
    exists(id) {
        return super.exists(id);
    }
    getStat(id) {
        return super.getStat(id);
    }
    getAllStats(id) {
        return super.getAllStats(id);
    }
    setStat(id, value, mode) {
        return super.setStat(id, value, mode);
    }
    resetStat(id) {
        return super.resetStat(id);
    }
}
exports.ODStatGlobalScope_DefaultSystem = ODStatGlobalScope_DefaultSystem;
/**## ODStatScope_DefaultUser `default_class`
 * This is a special class that adds type definitions & typescript to the ODStatsManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the `opendiscord:user` category in `opendiscord.stats`!
 */
class ODStatScope_DefaultUser extends stat_1.ODStatScope {
    get(id) {
        return super.get(id);
    }
    remove(id) {
        return super.remove(id);
    }
    exists(id) {
        return super.exists(id);
    }
    getStat(id, scopeId) {
        return super.getStat(id, scopeId);
    }
    getAllStats(id) {
        return super.getAllStats(id);
    }
    setStat(id, scopeId, value, mode) {
        return super.setStat(id, scopeId, value, mode);
    }
    resetStat(id, scopeId) {
        return super.resetStat(id, scopeId);
    }
}
exports.ODStatScope_DefaultUser = ODStatScope_DefaultUser;
/**## ODStatScope_DefaultTicket `default_class`
 * This is a special class that adds type definitions & typescript to the ODStatsManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the `opendiscord:ticket` category in `opendiscord.stats`!
 */
class ODStatScope_DefaultTicket extends stat_1.ODStatScope {
    get(id) {
        return super.get(id);
    }
    remove(id) {
        return super.remove(id);
    }
    exists(id) {
        return super.exists(id);
    }
    getStat(id, scopeId) {
        return super.getStat(id, scopeId);
    }
    getAllStats(id) {
        return super.getAllStats(id);
    }
    setStat(id, scopeId, value, mode) {
        return super.setStat(id, scopeId, value, mode);
    }
    resetStat(id, scopeId) {
        return super.resetStat(id, scopeId);
    }
}
exports.ODStatScope_DefaultTicket = ODStatScope_DefaultTicket;
/**## ODStatScope_DefaultParticipants `default_class`
 * This is a special class that adds type definitions & typescript to the ODStatsManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the `opendiscord:participants` category in `opendiscord.stats`!
 */
class ODStatScope_DefaultParticipants extends stat_1.ODStatScope {
    get(id) {
        return super.get(id);
    }
    remove(id) {
        return super.remove(id);
    }
    exists(id) {
        return super.exists(id);
    }
    getStat(id, scopeId) {
        return super.getStat(id, scopeId);
    }
    getAllStats(id) {
        return super.getAllStats(id);
    }
    setStat(id, scopeId, value, mode) {
        return super.setStat(id, scopeId, value, mode);
    }
    resetStat(id, scopeId) {
        return super.resetStat(id, scopeId);
    }
}
exports.ODStatScope_DefaultParticipants = ODStatScope_DefaultParticipants;
/**## ODStatScope_DefaultMessages `default_class`
 * This is a special class that adds type definitions & typescript to the ODStatsManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the `opendiscord:participants` category in `opendiscord.stats`!
 */
class ODStatScope_DefaultMessages extends stat_1.ODStatScope {
    get(id) {
        return super.get(id);
    }
    remove(id) {
        return super.remove(id);
    }
    exists(id) {
        return super.exists(id);
    }
    getStat(id, scopeId) {
        return super.getStat(id, scopeId);
    }
    getAllStats(id) {
        return super.getAllStats(id);
    }
    setStat(id, scopeId, value, mode) {
        return super.setStat(id, scopeId, value, mode);
    }
    resetStat(id, scopeId) {
        return super.resetStat(id, scopeId);
    }
}
exports.ODStatScope_DefaultMessages = ODStatScope_DefaultMessages;
