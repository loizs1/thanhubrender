"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODPluginClassManager_Default = exports.ODPluginManager_Default = void 0;
const plugin_1 = require("../modules/plugin");
/**## ODPluginManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODPluginManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.plugins`!
 */
class ODPluginManager_Default extends plugin_1.ODPluginManager {
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
exports.ODPluginManager_Default = ODPluginManager_Default;
/**## ODPluginClassManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODPluginClassManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.plugins.classes`!
 */
class ODPluginClassManager_Default extends plugin_1.ODPluginClassManager {
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
exports.ODPluginClassManager_Default = ODPluginClassManager_Default;
