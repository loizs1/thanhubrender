import { ODDebugger } from "./console";
/**## ODPromiseVoid `type`
 * This is a simple type to represent a callback return value that could be a promise or not.
 */
export type ODPromiseVoid = void | Promise<void>;
/**## ODOptionalPromise `type`
 * This is a simple type to represent a type as normal value or a promise value.
 */
export type ODOptionalPromise<T> = T | Promise<T>;
/**## ODValidButtonColor `type`
 * This is a collection of all the possible button colors.
 */
export type ODValidButtonColor = "gray" | "red" | "green" | "blue";
/**## ODValidId `type`
 * This is a valid Open Ticket identifier. It can be an `ODId` or `string`!
 *
 * You will see this type in many functions from Open Ticket.
 */
export type ODValidId = string | ODId;
/**## ODValidJsonType `type`
 * This is a collection of all types that can be stored in a JSON file!
 *
 * list: `string`, `number`, `boolean`, `array`, `object`, `null`
 */
export type ODValidJsonType = string | number | boolean | object | ODValidJsonType[] | null;
/**## ODInterfaceWithPartialProperty `type`
 * This is a utility type to create an interface where some properties are optional!
 */
export type ODInterfaceWithPartialProperty<Interface, Key extends keyof Interface> = Omit<Interface, Key> & Partial<Pick<Interface, Key>>;
/**## ODDiscordIdType `type`
 * A list of all available discord ID types. Used in the config checker.
 */
export type ODDiscordIdType = "role" | "server" | "channel" | "category" | "user" | "member" | "interaction" | "message";
/**## ODId `class`
 * This is an Open Ticket identifier.
 *
 * It can only contain the following characters: `a-z`, `A-Z`, `0-9`, `:`, `-` & `_`
 *
 * You can use this class to assign a unique id when creating configs, databases, languages & more!
 */
export declare class ODId {
    #private;
    /**The full value of this `ODId` as a `string`. */
    set value(id: string);
    get value(): string;
    constructor(id: ODValidId);
    /**Returns a string representation of this id. (same as `this.value`) */
    toString(): string;
    /**The namespace of the id before `:`. (e.g. `openticket` for `openticket:autoclose-enabled`) */
    getNamespace(): string;
    /**The identifier of the id after `:`. (e.g. `autoclose-enabled` for `openticket:autoclose-enabled`) */
    getIdentifier(): string;
    /**Trigger an `onChange()` event in the parent `ODManager` of this class. */
    protected _change(oldId: string, newId: string): void;
    /****(❌ SYSTEM ONLY!!)** Set the callback executed when a value inside this class changes. */
    changed(callback: ((oldId: string, newId: string) => void) | null): void;
}
/**## ODManagerChangeHelper `class`
 * This is an Open Ticket manager change helper.
 *
 * It is used to let the "onChange" event in the `ODManager` class work.
 * You can use this class when extending your own `ODManager`
 */
export declare class ODManagerChangeHelper {
    #private;
    /**Trigger an `onChange()` event in the parent `ODManager` of this class. */
    protected _change(): void;
    /****(❌ SYSTEM ONLY!!)** Set the callback executed when a value inside this class changes. */
    changed(callback: (() => void) | null): void;
}
/**## ODManagerData `class`
 * This is Open Ticket manager data.
 *
 * It provides a template for all classes that are used in the `ODManager`.
 *
 * There is an `id:ODId` property & also some events used in the manager.
 */
export declare class ODManagerData extends ODManagerChangeHelper {
    /**The id of this data. */
    id: ODId;
    constructor(id: ODValidId);
}
/**## ODManagerCallback `type`
 * This is a callback for the `onChange` and `onRemove` events in the `ODManager`
 */
export type ODManagerCallback<DataType extends ODManagerData> = (data: DataType) => void;
/**## ODManagerAddCallback `type`
 * This is a callback for the `onAdd` event in the `ODManager`
 */
export type ODManagerAddCallback<DataType extends ODManagerData> = (data: DataType, overwritten: boolean) => void;
/**## ODManager `class`
 * This is an Open Ticket manager.
 *
 * It can be used to store & manage classes based on their `ODId`.
 * It is somewhat the same as the default JS `Map()`.
 * You can extend this class when creating your own classes & managers.
 *
 * This class has many useful functions based on `ODId` (add, get, remove, getAll, getFiltered, exists, loopAll, ...)
 */
export declare class ODManager<DataType extends ODManagerData> extends ODManagerChangeHelper {
    #private;
    constructor(debug?: ODDebugger, debugname?: string);
    /**Add data to the manager. The `ODId` in the data class will be used as identifier! You can optionally select to overwrite existing data!*/
    add(data: DataType | DataType[], overwrite?: boolean): boolean;
    /**Get data that matches the `ODId`. Returns the found data.*/
    get(id: ODValidId): DataType | null;
    /**Remove data that matches the `ODId`. Returns the removed data. */
    remove(id: ODValidId): DataType | null;
    /**Check if data that matches the `ODId` exists. Returns a boolean. */
    exists(id: ODValidId): boolean;
    /**Get all data inside this manager*/
    getAll(): DataType[];
    /**Get all data that matches inside the filter function*/
    getFiltered(predicate: (value: DataType, index: number, array: DataType[]) => unknown): DataType[];
    /**Get all data where the `ODId` matches the provided RegExp. */
    getRegex(regex: RegExp): DataType[];
    /**Get the length/size/amount of the data inside this manager. */
    getLength(): number;
    /**Get a list of all the ids inside this manager*/
    getIds(): ODId[];
    /**Run an iterator over all data in this manager. This method also supports async-await behaviour!*/
    loopAll(cb: (data: DataType, id: ODId) => ODPromiseVoid): Promise<void>;
    /**Use the Open Ticket debugger in this manager for logs*/
    useDebug(debug?: ODDebugger, debugname?: string): void;
    /**Listen for when data is added to this manager. */
    onAdd(callback: ODManagerAddCallback<DataType>): void;
    /**Listen for when data is changed in this manager. */
    onChange(callback: ODManagerCallback<DataType>): void;
    /**Listen for when data is removed from this manager. */
    onRemove(callback: ODManagerCallback<DataType>): void;
}
/**## ODManagerWithSafety `class`
 * This is an Open Ticket safe manager.
 *
 * It functions exactly the same as a normal `ODManager`, but it has 1 function extra!
 * The `getSafe()` function will always return data, because when it doesn't find an id, it returns pre-configured backup data.
 */
export declare class ODManagerWithSafety<DataType extends ODManagerData> extends ODManager<DataType> {
    #private;
    constructor(backupCreator: () => DataType, debug?: ODDebugger, debugname?: string);
    /**Get data that matches the `ODId`. Returns the backup data when not found.
     *
     * ### ⚠️ This should only be used when the data doesn't need to be written/edited
    */
    getSafe(id: ODValidId): DataType;
}
/**## ODVersionManager `class`
 * A Open Ticket version manager.
 *
 * It is used to manage different `ODVersion`'s from the bot. You will use it to check which version of the bot is used.
 */
export declare class ODVersionManager extends ODManager<ODVersion> {
    constructor();
}
/**## ODVersion `class`
 * This is an Open Ticket version.
 *
 * It has many features like comparing versions & checking if they are compatible.
 *
 * You can use it in your own plugin, but most of the time you will use it to check the Open Ticket version!
 */
export declare class ODVersion extends ODManagerData {
    /**The first number of the version (example: `v1.2.3` => `1`) */
    primary: number;
    /**The second number of the version (example: `v1.2.3` => `2`) */
    secondary: number;
    /**The third number of the version (example: `v1.2.3` => `3`) */
    tertiary: number;
    constructor(id: ODValidId, primary: number, secondary: number, tertiary: number);
    /**Get the version from a string (also possible with `v` prefix)
     * @example const version = api.ODVersion.fromString("id","v1.2.3") //creates version 1.2.3
    */
    static fromString(id: ODValidId, version: string): ODVersion;
    /**Get the version as a string (`noprefix:true` => with `v` prefix)
     * @example
     * new api.ODVersion(1,0,0).toString(false) //returns "v1.0.0"
     * new api.ODVersion(1,0,0).toString(true) //returns "1.0.0"
    */
    toString(noprefix?: boolean): string;
    /**Compare this version with another version and returns the result: `higher`, `lower` or `equal`
     * @example
     * new api.ODVersion(1,0,0).compare(new api.ODVersion(1,2,0)) //returns "lower"
     * new api.ODVersion(1,3,0).compare(new api.ODVersion(1,2,0)) //returns "higher"
     * new api.ODVersion(1,2,0).compare(new api.ODVersion(1,2,0)) //returns "equal"
    */
    compare(comparator: ODVersion): "higher" | "lower" | "equal";
    /**Check if this version is included in the list
     * @example
     * const list = [
     *     new api.ODVersion(1,0,0),
     *     new api.ODVersion(1,0,1),
     *     new api.ODVersion(1,0,2)
     * ]
     * new api.ODVersion(1,0,0).compatible(list) //returns true
     * new api.ODVersion(1,0,1).compatible(list) //returns true
     * new api.ODVersion(1,0,3).compatible(list) //returns false
    */
    compatible(list: ODVersion[]): boolean;
    /**Check if this version is higher or equal to the provided `requirement`. */
    min(requirement: string | ODVersion): boolean;
    /**Check if this version is lower or equal to the provided `requirement`. */
    max(requirement: string | ODVersion): boolean;
    /**Check if this version is matches the major version (`vX.X`) of the provided `requirement`. */
    major(requirement: string | ODVersion): boolean;
    /**Check if this version is matches the minor version (`vX.X.X`) of the provided `requirement`. */
    minor(requirement: string | ODVersion): boolean;
}
/**## ODHTTPGetRequest `class`
 * This is a class that can help you with creating simple HTTP GET requests.
 *
 * It works using the native node.js fetch() method. You can configure all options in the constructor!
 * @example
 * const request = new api.ODHTTPGetRequest("https://www.example.com/abc.txt",false,{})
 *
 * const result = await request.run()
 * result.body //the response body (string)
 * result.status //the response code (number)
 * result.response //the full response (object)
 */
export declare class ODHTTPGetRequest {
    /**The url used in the request */
    url: string;
    /**The request config for additional options */
    config: RequestInit;
    /**Throw on error OR return http code 500 */
    throwOnError: boolean;
    constructor(url: string, throwOnError: boolean, config?: RequestInit);
    /**Execute the GET request.*/
    run(): Promise<{
        status: number;
        body: string;
        response?: Response;
    }>;
}
/**## ODHTTPPostRequest `class`
 * This is a class that can help you with creating simple HTTP POST requests.
 *
 * It works using the native node.js fetch() method. You can configure all options in the constructor!
 * @example
 * const request = new api.ODHTTPPostRequest("https://www.example.com/abc.txt",false,{})
 *
 * const result = await request.run()
 * result.body //the response body (string)
 * result.status //the response code (number)
 * result.response //the full response (object)
 */
export declare class ODHTTPPostRequest {
    /**The url used in the request */
    url: string;
    /**The request config for additional options */
    config: RequestInit;
    /**Throw on error OR return http code 500 */
    throwOnError: boolean;
    constructor(url: string, throwOnError: boolean, config?: RequestInit);
    /**Execute the POST request.*/
    run(): Promise<{
        status: number;
        body: string;
        response?: Response;
    }>;
}
/**## ODEnvHelper `class`
 * This is a utility class that helps you with reading the ENV.
 *
 * It has support for the built-in `process.env` & `.env` file
 * @example
 * const envHelper = new api.ODEnvHelper()
 *
 * const variableA = envHelper.getVariable("value-a")
 * const variableB = envHelper.getVariable("value-b","dotenv") //only get from .env
 * const variableA = envHelper.getVariable("value-c","env") //only get from process.env
 */
export declare class ODEnvHelper {
    #private;
    /**All variables found in the `.env` file */
    dotenv: object;
    /**All variables found in `process.env` */
    env: object;
    constructor(customEnvPath?: string);
    /**Get a variable from the env */
    getVariable(name: string, source?: "dotenv" | "env"): any | undefined;
}
/**## ODSystemError `class`
 * A wrapper for the node.js `Error` class that makes the error look better in the console!
 *
 * This wrapper is made for Open Ticket system errors! **It can only be used by Open Ticket itself!**
 */
export declare class ODSystemError extends Error {
    /**This variable gets detected by the error handling system to know how to render it */
    _ODErrorType: string;
    /**Create an `ODSystemError` directly from an `Error` class */
    static fromError(err: Error): ODSystemError;
}
/**## ODPluginError `class`
 * A wrapper for the node.js `Error` class that makes the error look better in the console!
 *
 * This wrapper is made for Open Ticket plugin errors! **It can only be used by plugins!**
 */
export declare class ODPluginError extends Error {
    /**This variable gets detected by the error handling system to know how to render it */
    _ODErrorType: string;
    /**Create an `ODPluginError` directly from an `Error` class */
    static fromError(err: Error): ODPluginError;
}
/**Oh, what could this be `¯\_(ツ)_/¯` */
export interface ODEasterEggs {
    creator: string;
    translators: string[];
}
