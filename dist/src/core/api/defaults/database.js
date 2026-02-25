"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODFormattedJsonDatabase_DefaultOptions = exports.ODFormattedJsonDatabase_DefaultUsers = exports.ODFormattedJsonDatabase_DefaultTickets = exports.ODFormattedJsonDatabase_DefaultGlobal = exports.ODDatabaseManager_Default = void 0;
const database_1 = require("../modules/database");
/**## ODDatabaseManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODDatabaseManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.databases`!
 */
class ODDatabaseManager_Default extends database_1.ODDatabaseManager {
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
exports.ODDatabaseManager_Default = ODDatabaseManager_Default;
/**## ODFormattedJsonDatabase_DefaultGlobal `default_class`
 * This is a special class that adds type definitions & typescript to the ODFormattedJsonDatabase class.
 * It doesn't add any extra features!
 *
 * This default class is made for the `global.json` database!
 */
class ODFormattedJsonDatabase_DefaultGlobal extends database_1.ODFormattedJsonDatabase {
    set(category, key, value) {
        return super.set(category, key, value);
    }
    get(category, key) {
        return super.get(category, key);
    }
    delete(category, key) {
        return super.delete(category, key);
    }
    exists(category, key) {
        return super.exists(category, key);
    }
    getCategory(category) {
        return super.getCategory(category);
    }
}
exports.ODFormattedJsonDatabase_DefaultGlobal = ODFormattedJsonDatabase_DefaultGlobal;
/**## ODFormattedJsonDatabase_DefaultTickets `default_class`
 * This is a special class that adds type definitions & typescript to the ODFormattedJsonDatabase class.
 * It doesn't add any extra features!
 *
 * This default class is made for the `tickets.json` database!
 */
class ODFormattedJsonDatabase_DefaultTickets extends database_1.ODFormattedJsonDatabase {
    set(category, key, value) {
        return super.set(category, key, value);
    }
    get(category, key) {
        return super.get(category, key);
    }
    delete(category, key) {
        return super.delete(category, key);
    }
    exists(category, key) {
        return super.exists(category, key);
    }
    getCategory(category) {
        return super.getCategory(category);
    }
}
exports.ODFormattedJsonDatabase_DefaultTickets = ODFormattedJsonDatabase_DefaultTickets;
/**## ODFormattedJsonDatabase_DefaultUsers `default_class`
 * This is a special class that adds type definitions & typescript to the ODFormattedJsonDatabase class.
 * It doesn't add any extra features!
 *
 * This default class is made for the `users.json` database!
 */
class ODFormattedJsonDatabase_DefaultUsers extends database_1.ODFormattedJsonDatabase {
    set(category, key, value) {
        return super.set(category, key, value);
    }
    get(category, key) {
        return super.get(category, key);
    }
    delete(category, key) {
        return super.delete(category, key);
    }
    exists(category, key) {
        return super.exists(category, key);
    }
    getCategory(category) {
        return super.getCategory(category);
    }
}
exports.ODFormattedJsonDatabase_DefaultUsers = ODFormattedJsonDatabase_DefaultUsers;
/**## ODFormattedJsonDatabase_DefaultOptions `default_class`
 * This is a special class that adds type definitions & typescript to the ODFormattedJsonDatabase class.
 * It doesn't add any extra features!
 *
 * This default class is made for the `options.json` database!
 */
class ODFormattedJsonDatabase_DefaultOptions extends database_1.ODFormattedJsonDatabase {
    set(category, key, value) {
        return super.set(category, key, value);
    }
    get(category, key) {
        return super.get(category, key);
    }
    delete(category, key) {
        return super.delete(category, key);
    }
    exists(category, key) {
        return super.exists(category, key);
    }
    getCategory(category) {
        return super.getCategory(category);
    }
}
exports.ODFormattedJsonDatabase_DefaultOptions = ODFormattedJsonDatabase_DefaultOptions;
