import { ODManager, ODManagerData, ODPromiseVoid, ODValidId } from "./base";
import { ODDebugger } from "./console";
import * as fjs from "formatted-json-stringify";
/**## ODConfigManager `class`
 * This is an Open Ticket config manager.
 *
 * It manages all config files in the bot and allows plugins to access config files from Open Ticket & other plugins!
 *
 * You can use this class to get/change/add a config file (`ODConfig`) in your plugin!
 */
export declare class ODConfigManager extends ODManager<ODConfig> {
    #private;
    constructor(debug: ODDebugger);
    add(data: ODConfig | ODConfig[], overwrite?: boolean): boolean;
    /**Init all config files. */
    init(): Promise<void>;
}
/**## ODConfig `class`
 * This is an Open Ticket config helper.
 * This class doesn't do anything at all, it just gives a template & basic methods for a config. Use `ODJsonConfig` instead!
 *
 * You can use this class if you want to create your own config implementation (e.g. `yml`, `xml`,...)!
 */
export declare class ODConfig extends ODManagerData {
    /**The name of the file with extension. */
    file: string;
    /**The path to the file relative to the main directory. */
    path: string;
    /**An object/array of the entire config file! Variables inside it can be edited while the bot is running! */
    data: any;
    /**Is this config already initiated? */
    initiated: boolean;
    /**An array of listeners to run when the config gets reloaded. These are not executed on the initial loading. */
    protected reloadListeners: Function[];
    /**Alias to Open Ticket debugger. */
    protected debug: ODDebugger | null;
    constructor(id: ODValidId, data: any);
    /**Use the Open Ticket debugger for logs. */
    useDebug(debug: ODDebugger | null): void;
    /**Init the config. */
    init(): ODPromiseVoid;
    /**Reload the config. Be aware that this doesn't update the config data everywhere in the bot! */
    reload(): ODPromiseVoid;
    /**Save the edited config to the filesystem. This is used by the Interactive Setup CLI. It's not recommended to use this while the bot is running. */
    save(): ODPromiseVoid;
    /**Listen for a reload of this JSON file! */
    onReload(cb: Function): void;
    /**Remove all reload listeners. Not recommended! */
    removeAllReloadListeners(): void;
}
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
export declare class ODJsonConfig extends ODConfig {
    formatter: fjs.custom.BaseFormatter;
    constructor(id: ODValidId, file: string, customPath?: string, formatter?: fjs.custom.BaseFormatter);
    /**Init the config. */
    init(): ODPromiseVoid;
    /**Reload the config. Be aware that this doesn't update the config data everywhere in the bot! */
    reload(): void;
    /**Save the edited config to the filesystem. This is used by the Interactive Setup CLI. It's not recommended to use this while the bot is running. */
    save(): ODPromiseVoid;
}
