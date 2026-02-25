import { ODValidId, ODManagerData } from "../modules/base";
import { ODPlugin, ODPluginClassManager, ODPluginManager } from "../modules/plugin";
/**## ODPluginManagerIds_Default `interface`
 * This interface is a list of ids available in the `ODPluginManager_Default` class.
 * It's used to generate typescript declarations for this class.
 */
export interface ODPluginManagerIds_Default {
}
/**## ODPluginManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODPluginManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.plugins`!
 */
export declare class ODPluginManager_Default extends ODPluginManager {
    classes: ODPluginClassManager_Default;
    get<PluginId extends keyof ODPluginManagerIds_Default>(id: PluginId): ODPluginManagerIds_Default[PluginId];
    get(id: ODValidId): ODPlugin | null;
    remove<PluginId extends keyof ODPluginManagerIds_Default>(id: PluginId): ODPluginManagerIds_Default[PluginId];
    remove(id: ODValidId): ODPlugin | null;
    exists(id: keyof ODPluginManagerIds_Default): boolean;
    exists(id: ODValidId): boolean;
}
/**## ODPluginClassManagerIds_Default `interface`
 * This interface is a list of ids available in the `ODPluginClassManager_Default` class.
 * It's used to generate typescript declarations for this class.
 */
export interface ODPluginClassManagerIds_Default {
}
/**## ODPluginClassManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODPluginClassManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.plugins.classes`!
 */
export declare class ODPluginClassManager_Default extends ODPluginClassManager {
    get<PluginClassId extends keyof ODPluginClassManagerIds_Default>(id: PluginClassId): ODPluginClassManagerIds_Default[PluginClassId];
    get(id: ODValidId): ODManagerData | null;
    remove<PluginClassId extends keyof ODPluginClassManagerIds_Default>(id: PluginClassId): ODPluginClassManagerIds_Default[PluginClassId];
    remove(id: ODValidId): ODManagerData | null;
    exists(id: keyof ODPluginClassManagerIds_Default): boolean;
    exists(id: ODValidId): boolean;
}
