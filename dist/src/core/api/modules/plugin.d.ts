import { ODManager, ODManagerData, ODValidId, ODVersion } from "./base";
import { ODDebugger } from "./console";
/**## ODUnknownCrashedPlugin `interface`
 * Basic details for a plugin that crashed while loading the `plugin.json` file.
 */
export interface ODUnknownCrashedPlugin {
    /**The name of the plugin. (path when plugin crashed before `name` was loaded) */
    name: string;
    /**The description of the plugin. (when found before crashing) */
    description: string;
}
/**## ODPluginManager `class`
 * This is an Open Ticket plugin manager.
 *
 * It manages all active plugins in the bot!
 * It also contains all "plugin classes" which are managers registered by plugins.
 * These are accessible via the `opendiscord.plugins.classes` global.
 *
 * Use `isPluginLoaded()` to check if a plugin has been loaded.
 */
export declare class ODPluginManager extends ODManager<ODPlugin> {
    /**A manager for all custom managers registered by plugins. */
    classes: ODPluginClassManager;
    /**A list of basic details from all plugins that crashed while loading the `plugin.json` file. */
    unknownCrashedPlugins: ODUnknownCrashedPlugin[];
    constructor(debug: ODDebugger);
    /**Check if a plugin has been loaded successfully and is available for usage.*/
    isPluginLoaded(id: ODValidId): boolean;
}
/**## ODPluginData `interface`
 * Parsed data from the `plugin.json` file in a plugin.
 */
export interface ODPluginData {
    /**The name of this plugin (shown on startup) */
    name: string;
    /**The id of this plugin. (Must be identical to directory name) */
    id: string;
    /**The version of this plugin. */
    version: string;
    /**The location of the start file of the plugin relative to the rootDir of the plugin */
    startFile: string;
    /**A list of compatible versions. (e.g. `["OTv4.0.x", "OMv1.x.x"]`) (optional, will be required in future version)
     * - `OT` --> Open Ticket support
     * - `OM` --> Open Moderation support
     */
    supportedVersions?: string[];
    /**Is this plugin enabled? */
    enabled: boolean;
    /**The priority of this plugin. Higher priority will load before lower priority. */
    priority: number;
    /**A list of events to register to the `opendiscord.events` global before loading any plugins. This way, plugins with a higher priority are able to use events from this plugin as well! */
    events: string[];
    /**Npm dependencies which are required for this plugin to work. */
    npmDependencies: string[];
    /**Plugins which are required for this plugin to work. */
    requiredPlugins: string[];
    /**Plugins which are incompatible with this plugin. */
    incompatiblePlugins: string[];
    /**Additional details about this plugin. */
    details: ODPluginDetails;
}
/**## ODPluginDetails `interface`
 * Additional details in the `plugin.json` file from a plugin.
 */
export interface ODPluginDetails {
    /**The main author of the plugin. Additional contributors can be specified in `contributors`. */
    author: string;
    /**A list of plugin contributors. (optional, will be required in future version) */
    contributors?: string[];
    /**A short description of this plugin. */
    shortDescription: string;
    /**A large description of this plugin. */
    longDescription: string;
    /**A URL to a cover image of this plugin. (currently unused) */
    imageUrl: string;
    /**A URL to the website/project page of this plugin. (currently unused) */
    projectUrl: string;
    /**A list of tags/categories that this plugin affects. */
    tags: string[];
}
/**## ODPlugin `class`
 * This is an Open Ticket plugin.
 *
 * It represents a single plugin in the `./plugins/` directory.
 * All plugins are accessible via the `opendiscord.plugins` global.
 *
 * Don't re-execute plugins which are already enabled! It might break the bot or plugin.
 */
export declare class ODPlugin extends ODManagerData {
    #private;
    /**The name of the directory of this plugin. (same as id) */
    dir: string;
    /**All plugin data found in the `plugin.json` file. */
    data: ODPluginData;
    /**The name of this plugin. */
    name: string;
    /**The priority of this plugin. */
    priority: number;
    /**The version of this plugin. */
    version: ODVersion;
    /**The additional details of this plugin. */
    details: ODPluginDetails;
    /**Is this plugin enabled? */
    enabled: boolean;
    /**Did this plugin execute successfully?. */
    executed: boolean;
    /**Did this plugin crash? (A reason is available in the `crashReason`) */
    crashed: boolean;
    /**The reason which caused this plugin to crash. */
    crashReason: null | "incompatible.plugin" | "missing.plugin" | "missing.dependency" | "incompatible.version" | "executed";
    constructor(dir: string, jsondata: ODPluginData);
    /**Get the startfile location relative to the `./plugins/` directory. (`./dist/plugins/`) when compiled) */
    getStartFile(): string;
    /**Execute this plugin. Returns `false` on crash. */
    execute(debug: ODDebugger, force?: boolean): Promise<boolean>;
    /**Get a list of all missing npm dependencies that are required for this plugin. */
    dependenciesInstalled(): string[];
    /**Get a list of all missing plugins that are required for this plugin. */
    pluginsInstalled(manager: ODPluginManager): string[];
    /**Get a list of all enabled incompatible plugins that interfere with this plugin. */
    pluginsIncompatible(manager: ODPluginManager): string[];
    /**Get a list of all authors & contributors of this plugin. */
    getAuthors(): string[];
}
/**## ODPluginClassManager `class`
 * This is an Open Ticket plugin class manager.
 *
 * It manages all managers registered by plugins!
 * Plugins are able to register their own managers, handlers, functions, classes, ... here.
 * By doing this, other plugins are also able to make use of it.
 * This can be useful for plugins that want to extend other plugins.
 *
 * Use `isPluginLoaded()` to check if a plugin has been loaded before trying to access the manager.
 */
export declare class ODPluginClassManager extends ODManager<ODManagerData> {
    constructor(debug: ODDebugger);
}
