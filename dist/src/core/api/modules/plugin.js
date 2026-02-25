"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODPluginClassManager = exports.ODPlugin = exports.ODPluginManager = void 0;
///////////////////////////////////////
//PLUGIN MODULE
///////////////////////////////////////
const base_1 = require("./base");
const path_1 = __importDefault(require("path"));
/**## ODPluginManager `class`
 * This is an Open Ticket plugin manager.
 *
 * It manages all active plugins in the bot!
 * It also contains all "plugin classes" which are managers registered by plugins.
 * These are accessible via the `opendiscord.plugins.classes` global.
 *
 * Use `isPluginLoaded()` to check if a plugin has been loaded.
 */
class ODPluginManager extends base_1.ODManager {
    /**A manager for all custom managers registered by plugins. */
    classes;
    /**A list of basic details from all plugins that crashed while loading the `plugin.json` file. */
    unknownCrashedPlugins = [];
    constructor(debug) {
        super(debug, "plugin");
        this.classes = new ODPluginClassManager(debug);
    }
    /**Check if a plugin has been loaded successfully and is available for usage.*/
    isPluginLoaded(id) {
        const newId = new base_1.ODId(id);
        const plugin = this.get(newId);
        return (plugin !== null && plugin.executed);
    }
}
exports.ODPluginManager = ODPluginManager;
/**## ODPlugin `class`
 * This is an Open Ticket plugin.
 *
 * It represents a single plugin in the `./plugins/` directory.
 * All plugins are accessible via the `opendiscord.plugins` global.
 *
 * Don't re-execute plugins which are already enabled! It might break the bot or plugin.
 */
class ODPlugin extends base_1.ODManagerData {
    /**The name of the directory of this plugin. (same as id) */
    dir;
    /**All plugin data found in the `plugin.json` file. */
    data;
    /**The name of this plugin. */
    name;
    /**The priority of this plugin. */
    priority;
    /**The version of this plugin. */
    version;
    /**The additional details of this plugin. */
    details;
    /**Is this plugin enabled? */
    enabled;
    /**Did this plugin execute successfully?. */
    executed;
    /**Did this plugin crash? (A reason is available in the `crashReason`) */
    crashed;
    /**The reason which caused this plugin to crash. */
    crashReason = null;
    constructor(dir, jsondata) {
        super(jsondata.id);
        this.dir = dir;
        this.data = jsondata;
        this.name = jsondata.name;
        this.priority = jsondata.priority;
        this.version = base_1.ODVersion.fromString("plugin", jsondata.version);
        this.details = jsondata.details;
        this.enabled = jsondata.enabled;
        this.executed = false;
        this.crashed = false;
    }
    /**Get the startfile location relative to the `./plugins/` directory. (`./dist/plugins/`) when compiled) */
    getStartFile() {
        const newFile = this.data.startFile.replace(/\.ts$/, ".js");
        return path_1.default.join(this.dir, newFile);
    }
    /**Execute this plugin. Returns `false` on crash. */
    async execute(debug, force) {
        if ((this.enabled && !this.crashed) || force) {
            try {
                //import relative plugin directory path (works on windows & unix based systems)
                const pluginPath = path_1.default.join("../../../../plugins/", this.getStartFile()).replaceAll("\\", "/");
                await import(pluginPath);
                debug.console.log("Plugin \"" + this.id.value + "\" loaded successfully!", "plugin");
                this.executed = true;
                return true;
            }
            catch (error) {
                this.crashed = true;
                this.crashReason = "executed";
                debug.console.log(error.message + ", canceling plugin execution...", "plugin", [
                    { key: "path", value: "./plugins/" + this.dir }
                ]);
                debug.console.log("You can see more about this error in the ./otdebug.txt file!", "info");
                debug.console.debugfile.writeText(error.stack);
                return false;
            }
        }
        else
            return true;
    }
    /**Check if a npm dependency exists. */
    #checkDependency(id) {
        try {
            require.resolve(id);
            return true;
        }
        catch {
            return false;
        }
    }
    /**Get a list of all missing npm dependencies that are required for this plugin. */
    dependenciesInstalled() {
        const missing = [];
        this.data.npmDependencies.forEach((d) => {
            if (!this.#checkDependency(d)) {
                missing.push(d);
            }
        });
        return missing;
    }
    /**Get a list of all missing plugins that are required for this plugin. */
    pluginsInstalled(manager) {
        const missing = [];
        this.data.requiredPlugins.forEach((p) => {
            const plugin = manager.get(p);
            if (!plugin || !plugin.enabled) {
                missing.push(p);
            }
        });
        return missing;
    }
    /**Get a list of all enabled incompatible plugins that interfere with this plugin. */
    pluginsIncompatible(manager) {
        const incompatible = [];
        this.data.incompatiblePlugins.forEach((p) => {
            const plugin = manager.get(p);
            if (plugin && plugin.enabled) {
                incompatible.push(p);
            }
        });
        return incompatible;
    }
    /**Get a list of all authors & contributors of this plugin. */
    getAuthors() {
        return [this.details.author, ...(this.details.contributors ?? [])];
    }
}
exports.ODPlugin = ODPlugin;
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
class ODPluginClassManager extends base_1.ODManager {
    constructor(debug) {
        super(debug, "plugin class");
    }
}
exports.ODPluginClassManager = ODPluginClassManager;
