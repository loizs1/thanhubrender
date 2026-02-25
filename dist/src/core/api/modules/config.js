"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODJsonConfig = exports.ODConfig = exports.ODConfigManager = void 0;
///////////////////////////////////////
//CONFIG MODULE
///////////////////////////////////////
const base_1 = require("./base");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const fjs = __importStar(require("formatted-json-stringify"));
/**## ODConfigManager `class`
 * This is an Open Ticket config manager.
 *
 * It manages all config files in the bot and allows plugins to access config files from Open Ticket & other plugins!
 *
 * You can use this class to get/change/add a config file (`ODConfig`) in your plugin!
 */
class ODConfigManager extends base_1.ODManager {
    /**Alias to Open Ticket debugger. */
    #debug;
    constructor(debug) {
        super(debug, "config");
        this.#debug = debug;
    }
    add(data, overwrite) {
        if (Array.isArray(data))
            data.forEach((d) => d.useDebug(this.#debug));
        else
            data.useDebug(this.#debug);
        return super.add(data, overwrite);
    }
    /**Init all config files. */
    async init() {
        for (const config of this.getAll()) {
            try {
                await config.init();
            }
            catch (err) {
                process.emit("uncaughtException", new base_1.ODSystemError(err));
            }
        }
    }
}
exports.ODConfigManager = ODConfigManager;
/**## ODConfig `class`
 * This is an Open Ticket config helper.
 * This class doesn't do anything at all, it just gives a template & basic methods for a config. Use `ODJsonConfig` instead!
 *
 * You can use this class if you want to create your own config implementation (e.g. `yml`, `xml`,...)!
 */
class ODConfig extends base_1.ODManagerData {
    /**The name of the file with extension. */
    file = "";
    /**The path to the file relative to the main directory. */
    path = "";
    /**An object/array of the entire config file! Variables inside it can be edited while the bot is running! */
    data;
    /**Is this config already initiated? */
    initiated = false;
    /**An array of listeners to run when the config gets reloaded. These are not executed on the initial loading. */
    reloadListeners = [];
    /**Alias to Open Ticket debugger. */
    debug = null;
    constructor(id, data) {
        super(id);
        this.data = data;
    }
    /**Use the Open Ticket debugger for logs. */
    useDebug(debug) {
        this.debug = debug;
    }
    /**Init the config. */
    init() {
        this.initiated = true;
        if (this.debug)
            this.debug.debug("Initiated config '" + this.file + "' in ODConfigManager.", [{ key: "id", value: this.id.value }]);
        //please implement this feature in your own config extension & extend this function.
    }
    /**Reload the config. Be aware that this doesn't update the config data everywhere in the bot! */
    reload() {
        if (this.debug)
            this.debug.debug("Reloaded config '" + this.file + "' in ODConfigManager.", [{ key: "id", value: this.id.value }]);
        //please implement this feature in your own config extension & extend this function.
    }
    /**Save the edited config to the filesystem. This is used by the Interactive Setup CLI. It's not recommended to use this while the bot is running. */
    save() {
        if (this.debug)
            this.debug.debug("Saved config '" + this.file + "' in ODConfigManager.", [{ key: "id", value: this.id.value }]);
        //please implement this feature in your own config extension & extend this function.
    }
    /**Listen for a reload of this JSON file! */
    onReload(cb) {
        this.reloadListeners.push(cb);
    }
    /**Remove all reload listeners. Not recommended! */
    removeAllReloadListeners() {
        this.reloadListeners = [];
    }
}
exports.ODConfig = ODConfig;
/**## ODJsonConfig `class`
 * This is an Open Ticket JSON config.
 * You can use this class to get & edit variables from the config files or to create your own JSON config!
 * @example
 * //create a config from: ./config/test.json with the id "some-config"
 * const config = new api.ODJsonConfig("some-config","test.json")
 *
 * //create a config with custom dir: ./plugins/testplugin/test.json
 * const config = new api.ODJsonConfig("plugin-config","test.json","./plugins/testplugin/")
 */
class ODJsonConfig extends ODConfig {
    formatter;
    constructor(id, file, customPath, formatter) {
        super(id, {});
        this.file = (file.endsWith(".json")) ? file : file + ".json";
        this.path = customPath ? path_1.default.join("./", customPath, this.file) : path_1.default.join("./config/", this.file);
        this.formatter = formatter ?? new fjs.DefaultFormatter(null, true, "    ");
    }
    /**Init the config. */
    init() {
        if (!fs_1.default.existsSync(this.path))
            throw new base_1.ODSystemError("Unable to parse config \"" + path_1.default.join("./", this.path) + "\", the file doesn't exist!");
        try {
            this.data = JSON.parse(fs_1.default.readFileSync(this.path).toString());
            super.init();
        }
        catch (err) {
            process.emit("uncaughtException", err);
            throw new base_1.ODSystemError("Unable to parse config \"" + path_1.default.join("./", this.path) + "\"!");
        }
    }
    /**Reload the config. Be aware that this doesn't update the config data everywhere in the bot! */
    reload() {
        if (!this.initiated)
            throw new base_1.ODSystemError("Unable to reload config \"" + path_1.default.join("./", this.path) + "\", the file hasn't been initiated yet!");
        if (!fs_1.default.existsSync(this.path))
            throw new base_1.ODSystemError("Unable to reload config \"" + path_1.default.join("./", this.path) + "\", the file doesn't exist!");
        try {
            this.data = JSON.parse(fs_1.default.readFileSync(this.path).toString());
            super.reload();
            this.reloadListeners.forEach((cb) => {
                try {
                    cb();
                }
                catch (err) {
                    process.emit("uncaughtException", err);
                }
            });
        }
        catch (err) {
            process.emit("uncaughtException", err);
            throw new base_1.ODSystemError("Unable to reload config \"" + path_1.default.join("./", this.path) + "\"!");
        }
    }
    /**Save the edited config to the filesystem. This is used by the Interactive Setup CLI. It's not recommended to use this while the bot is running. */
    save() {
        if (!this.initiated)
            throw new base_1.ODSystemError("Unable to save config \"" + path_1.default.join("./", this.path) + "\", the file hasn't been initiated yet!");
        try {
            const contents = this.formatter.stringify(this.data);
            fs_1.default.writeFileSync(this.path, contents);
            super.save();
        }
        catch (err) {
            process.emit("uncaughtException", err);
            throw new base_1.ODSystemError("Unable to save config \"" + path_1.default.join("./", this.path) + "\"!");
        }
    }
}
exports.ODJsonConfig = ODJsonConfig;
