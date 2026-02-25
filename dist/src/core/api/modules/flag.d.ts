import { ODValidId, ODManager, ODManagerData } from "./base";
import { ODDebugger } from "./console";
/**## ODFlag `class`
 * This is an Open Ticket flag.
 *
 * A flag is a boolean that can be specified by a parameter in the console.
 * It's useful for small settings that are only required once in a while.
 *
 * Flags can also be enabled manually by plugins!
 */
export declare class ODFlag extends ODManagerData {
    /**The method that has been used to set the value of this flag. (`null` when not set) */
    method: "param" | "manual" | null;
    /**The name of this flag. Visible to the user. */
    name: string;
    /**The description of this flag. Visible to the user. */
    description: string;
    /**The name of the parameter in the console. (e.g. `--test`) */
    param: string;
    /**A list of aliases for the parameter in the console. */
    aliases: string[];
    /**The value of this flag. */
    value: boolean;
    constructor(id: ODValidId, name: string, description: string, param: string, aliases?: string[], initialValue?: boolean);
    /**Set the value of this flag. */
    setValue(value: boolean, method?: "param" | "manual"): void;
    /**Detect if the process contains the param or aliases & set the value. Use `force` to overwrite a manually set value. */
    detectProcessParams(force?: boolean): void;
}
/**## ODFlagManager `class`
 * This is an Open Ticket flag manager.
 *
 * This class is responsible for managing & initiating all flags of the bot.
 * It also contains a shortcut for initiating all flags.
 */
export declare class ODFlagManager extends ODManager<ODFlag> {
    constructor(debug: ODDebugger);
    /**Set all flags to their `process.argv` value. */
    init(): Promise<void>;
}
