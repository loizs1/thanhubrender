import { ODManager, ODManagerData, ODOptionalPromise, ODPromiseVoid, ODValidId, ODValidJsonType } from "./base";
import { ODDebugger } from "./console";
import * as fjs from "formatted-json-stringify";
/**## ODDatabaseManager `class`
 * This is an Open Ticket database manager.
 *
 * It manages all databases in the bot and allows to permanently store data from the bot!
 *
 * You can use this class to get/add a database (`ODDatabase`) in your plugin!
 */
export declare class ODDatabaseManager extends ODManager<ODDatabase> {
    constructor(debug: ODDebugger);
    /**Init all database files. */
    init(): Promise<void>;
}
/**## ODDatabase `class`
 * This is an Open Ticket database template.
 * This class doesn't do anything at all, it just gives a template & basic methods for a database. Use `ODJsonDatabase` instead!
 *
 * You can use this class if you want to create your own database implementation (e.g. `mongodb`, `mysql`,...)!
 */
export declare class ODDatabase extends ODManagerData {
    /**The name of the file with extension. */
    file: string;
    /**The path to the file relative to the main directory. */
    path: string;
    /**Init the database. */
    init(): ODPromiseVoid;
    /**Add/Overwrite a specific category & key in the database. Returns `true` when overwritten. */
    set(category: string, key: string, value: ODValidJsonType): ODOptionalPromise<boolean>;
    /**Get a specific category & key in the database */
    get(category: string, key: string): ODOptionalPromise<ODValidJsonType | undefined>;
    /**Delete a specific category & key in the database */
    delete(category: string, key: string): ODOptionalPromise<boolean>;
    /**Check if a specific category & key exists in the database */
    exists(category: string, key: string): ODOptionalPromise<boolean>;
    /**Get a specific category in the database */
    getCategory(category: string): ODOptionalPromise<{
        key: string;
        value: ODValidJsonType;
    }[] | undefined>;
    /**Get all values in the database */
    getAll(): ODOptionalPromise<ODJsonDatabaseStructure>;
}
/**## ODJsonDatabaseStructure `type`
 * This is the structure of how a JSON database file!
 */
export type ODJsonDatabaseStructure = {
    category: string;
    key: string;
    value: ODValidJsonType;
}[];
/**## ODJsonDatabase `class`
 * This is an Open Ticket JSON database.
 * It stores data in a `json` file as a large `Array` using the `category`, `key`, `value` strategy.
 * You can store the following types: `string`, `number`, `boolean`, `array`, `object` & `null`!
 *
 * You can use this class if you want to add your own database or to use an existing one!
 */
export declare class ODJsonDatabase extends ODDatabase {
    #private;
    constructor(id: ODValidId, file: string, customPath?: string);
    /**Init the database. */
    init(): ODPromiseVoid;
    /**Set/overwrite the value of `category` & `key`. Returns `true` when overwritten!
     * @example
     * const didOverwrite = database.setData("category","key","value") //value can be any of the valid types
     * //You need an ODJsonDatabase class named "database" for this example to work!
     */
    set(category: string, key: string, value: ODValidJsonType): ODOptionalPromise<boolean>;
    /**Get the value of `category` & `key`. Returns `undefined` when non-existent!
     * @example
     * const data = database.getData("category","key") //data will be the value
     * //You need an ODJsonDatabase class named "database" for this example to work!
     */
    get(category: string, key: string): ODOptionalPromise<ODValidJsonType | undefined>;
    /**Remove the value of `category` & `key`. Returns `undefined` when non-existent!
     * @example
     * const didExist = database.deleteData("category","key") //delete this value
     * //You need an ODJsonDatabase class named "database" for this example to work!
     */
    delete(category: string, key: string): ODOptionalPromise<boolean>;
    /**Check if a value of `category` & `key` exists. Returns `false` when non-existent! */
    exists(category: string, key: string): ODOptionalPromise<boolean>;
    /**Get all values in `category`. Returns `undefined` when non-existent! */
    getCategory(category: string): ODOptionalPromise<{
        key: string;
        value: ODValidJsonType;
    }[] | undefined>;
    /**Get all values in `category`. */
    getAll(): ODOptionalPromise<ODJsonDatabaseStructure>;
}
/**## ODFormattedJsonDatabase `class`
 * This is an Open Ticket Formatted JSON database.
 * It stores data in a `json` file as a large `Array` using the `category`, `key`, `value` strategy.
 * You can store the following types: `string`, `number`, `boolean`, `array`, `object` & `null`!
 *
 * This one is exactly the same as `ODJsonDatabase`, but it has a formatter from the `formatted-json-stringify` package.
 * This can help you organise it a little bit better!
 */
export declare class ODFormattedJsonDatabase extends ODDatabase {
    #private;
    /**The formatter to use on the database array */
    formatter: fjs.ArrayFormatter;
    constructor(id: ODValidId, file: string, formatter: fjs.ArrayFormatter, customPath?: string);
    /**Init the database. */
    init(): ODPromiseVoid;
    /**Set/overwrite the value of `category` & `key`. Returns `true` when overwritten!
     * @example
     * const didOverwrite = database.setData("category","key","value") //value can be any of the valid types
     * //You need an ODFormattedJsonDatabase class named "database" for this example to work!
     */
    set(category: string, key: string, value: ODValidJsonType): ODOptionalPromise<boolean>;
    /**Get the value of `category` & `key`. Returns `undefined` when non-existent!
     * @example
     * const data = database.getData("category","key") //data will be the value
     * //You need an ODFormattedJsonDatabase class named "database" for this example to work!
     */
    get(category: string, key: string): ODOptionalPromise<ODValidJsonType | undefined>;
    /**Remove the value of `category` & `key`. Returns `undefined` when non-existent!
     * @example
     * const didExist = database.deleteData("category","key") //delete this value
     * //You need an ODFormattedJsonDatabase class named "database" for this example to work!
     */
    delete(category: string, key: string): ODOptionalPromise<boolean>;
    /**Check if a value of `category` & `key` exists. Returns `false` when non-existent! */
    exists(category: string, key: string): ODOptionalPromise<boolean>;
    /**Get all values in `category`. Returns `undefined` when non-existent! */
    getCategory(category: string): ODOptionalPromise<{
        key: string;
        value: ODValidJsonType;
    }[] | undefined>;
    /**Get all values in `category`. */
    getAll(): ODOptionalPromise<ODJsonDatabaseStructure>;
}
