import { ODDiscordIdType, ODId, ODManager, ODManagerData, ODValidId, ODValidJsonType } from "./base";
import { ODConfig } from "./config";
import { ODLanguageManager } from "./language";
import { ODDebugger } from "./console";
/**## ODCheckerResult `interface`
 * This interface is the result from a config checker check() function.
 */
export interface ODCheckerResult {
    valid: boolean;
    messages: ODCheckerMessage[];
}
/**## ODCheckerManager `class`
 * This is an Open Ticket checker manager.
 *
 * It manages all config checkers in the bot and allows plugins to access config checkers from Open Ticket & other plugins!
 *
 * You can use this class to get/add a config checker (`ODChecker`) in your plugin!
 */
export declare class ODCheckerManager extends ODManager<ODChecker> {
    /**The global temporary storage shared between all config checkers. */
    storage: ODCheckerStorage;
    /**The class responsible for rendering the config checker report. */
    renderer: ODCheckerRenderer;
    /**The class responsible for translating the config checker report. */
    translation: ODCheckerTranslationRegister;
    /**Final functions are global functions executed just before the report is created. */
    functions: ODCheckerFunctionManager;
    /**A variable containing the last result returned from `checkAll()` */
    lastResult: ODCheckerResult | null;
    constructor(debug: ODDebugger, storage: ODCheckerStorage, renderer: ODCheckerRenderer, translation: ODCheckerTranslationRegister, functions: ODCheckerFunctionManager);
    /**Check all config checkers registered in this manager.*/
    checkAll(sort: boolean): ODCheckerResult;
    /**Create temporary and unlisted `ODConfig`, `ODChecker` & `ODCheckerStorage` classes. This will help you use a `ODCheckerStructure` validator without officially registering it in `opendiscord.checkers`. */
    createTemporaryCheckerEnvironment(): ODChecker;
}
/**## ODCheckerStorage `class`
 * This is an Open Ticket checker storage.
 *
 * It stores temporary data to share between config checkers!
 * (e.g. The `messages.json` needs to access the `"id"` from `options.json`)
 *
 *
 * You can use this class when you create your own config checker implementation! (not required for using the built-in config checker)
 */
export declare class ODCheckerStorage {
    /**This is the array that stores all the data. ❌ **(don't edit unless really needed!)***/
    storage: {
        source: ODId;
        key: string;
        value: any;
    }[];
    /**Get data from the database (`source` => id of `ODChecker`) */
    get(source: ODValidId, key: string): any | null;
    /**Add data to the database (`source` => id of `ODChecker`). This function also overwrites existing data!*/
    set(source: ODValidId, key: string, value: any): boolean;
    /**Delete data from the database (`source` => id of `ODChecker`) */
    delete(source: ODValidId, key: string): boolean;
    /**Reset the entire database */
    reset(): void;
}
/**## ODCheckerRenderer `class`
 * This is an Open Ticket checker renderer.
 *
 * It's responsible for rendering the config checker result in the console.
 * This class doesn't provide any components! You need to create them by extending this class
 *
 * You can use this class if you want to change how the config checker looks!
 */
export declare class ODCheckerRenderer {
    /**Get all components */
    getComponents(compact: boolean, renderEmpty: boolean, translation: ODCheckerTranslationRegister, data: ODCheckerResult): string[];
    /**Render all components */
    render(components: string[]): void;
}
/**## ODCheckerTranslationRegister `class`
 * This is an Open Ticket checker translation register.
 *
 * It's used to store & manage the translation for each message from the config checker!
 * Most translations are stored by message id, but there are some exceptions like the additional text on the checker report.
 *
 * You can use this class if you want to translate your config checker messages! **This is optional & isn't required for the checker to work!**
 */
export declare class ODCheckerTranslationRegister {
    #private;
    /**Get the translation from a config checker message/sentence */
    get(type: "message" | "other", id: string): string | null;
    /**Set the translation for a config checker message/sentence. This function also overwrites existing translations!*/
    set(type: "message" | "other", id: string, translation: string): boolean;
    /**Delete the translation for a config checker message/sentence. */
    delete(type: "message" | "other", id: string): boolean;
    /**Get all translations */
    getAll(): {
        type: "message" | "other";
        id: string;
        translation: string;
    }[];
    /**Insert the translation params into the text. */
    insertTranslationParams(text: string, translationParams: string[]): string;
    /**A shortcut to copy translations from the `ODLanguageManager` to `ODCheckerTranslationRegister` */
    quickTranslate(manager: ODLanguageManager, translationId: string, type: "other" | "message", id: string): void;
}
/**## ODCheckerFunctionCallback `type`
 * This is the function used in the `ODCheckerFunction` class.
 */
export type ODCheckerFunctionCallback = (manager: ODCheckerManager, functions: ODCheckerFunctionManager) => ODCheckerResult;
/**## ODCheckerFunction `class`
 * This is an Open Ticket config checker function.
 *
 * It is a global function that will be executed after all config checkers. It can do additional checks for invalid/missing configurations.
 * It's mostly used for things that need to be checked globally!
 */
export declare class ODCheckerFunction extends ODManagerData {
    /**The function which will be executed globally after all config checkers. */
    func: ODCheckerFunctionCallback;
    constructor(id: ODValidId, func: ODCheckerFunctionCallback);
}
/**## ODCheckerFunctionManager `class`
 * This is an Open Ticket config checker function manager.
 *
 * It manages all `ODCheckerFunction`'s and it has some extra shortcuts for frequently used methods.
 */
export declare class ODCheckerFunctionManager extends ODManager<ODCheckerFunction> {
    constructor(debug: ODDebugger);
    /**A shortcut to create a warning, info or error message */
    createMessage(checkerId: ODValidId, id: ODValidId, filepath: string, type: "info" | "warning" | "error", message: string, locationTrace: ODCheckerLocationTrace, docs: string | null, translationParams: string[], locationId: ODId, locationDocs: string | null): ODCheckerMessage;
    /**Create a string from the location trace (path)*/
    locationTraceToString(trace: ODCheckerLocationTrace): string;
    /**De-reference the locationTrace array. Use this before adding a value to the array*/
    locationTraceDeref(trace: ODCheckerLocationTrace): ODCheckerLocationTrace;
}
/**## ODCheckerLocationTrace `type`
 * This type is an array of strings & numbers which represents the location trace from the config checker.
 * It's used to generate a path to the error (e.g. `"abc"."efg".1."something"`)
 */
export type ODCheckerLocationTrace = (string | number)[];
/**## ODCheckerOptions `interface`
 * This interface contains all optional properties to customise in the `ODChecker` class.
 */
export interface ODCheckerOptions {
    /**The name of this config in the Interactive Setup CLI. */
    cliDisplayName?: string;
    /**The description of this config in the Interactive Setup CLI. */
    cliDisplayDescription?: string;
}
/**## ODChecker `class`
 * This is an Open Ticket config checker.
 *
 * It checks a specific config file for invalid/missing configurations. This data can then be used to show to the user what's wrong!
 * You can check for example if a string is longer/shorter than a certain amount of characters & more!
 *
 * You can use this class when you create your own custom config file & you want to check it for syntax errors.
 */
export declare class ODChecker extends ODManagerData {
    #private;
    /**The storage of this checker (reference for `ODCheckerManager.storage`) */
    storage: ODCheckerStorage;
    /**The higher the priority, the faster it gets checked! */
    priority: number;
    /**The config file that needs to be checked */
    config: ODConfig;
    /**The structure of the config file */
    structure: ODCheckerStructure;
    /**Temporary storage for all error messages from the check() method (not recommended to use) */
    messages: ODCheckerMessage[];
    /**Temporary storage for the quit status from the check() method (not recommended to use) */
    quit: boolean;
    /**All additional properties of this config checker. */
    options: ODCheckerOptions;
    constructor(id: ODValidId, storage: ODCheckerStorage, priority: number, config: ODConfig, structure: ODCheckerStructure, options?: ODCheckerOptions);
    /**Run this checker. Returns all errors*/
    check(): ODCheckerResult;
    /**Create a string from the location trace/path in a human readable format. */
    locationTraceToString(trace: ODCheckerLocationTrace): string;
    /**De-reference the locationTrace array. Use this before adding a value to the array*/
    locationTraceDeref(trace: ODCheckerLocationTrace): ODCheckerLocationTrace;
    /**A shortcut to create a warning, info or error message */
    createMessage(id: ODValidId, type: "info" | "warning" | "error", message: string, locationTrace: ODCheckerLocationTrace, docs: string | null, translationParams: string[], locationId: ODId, locationDocs: string | null): void;
}
/**## ODCheckerMessage `interface`
 * This interface is an object which has all variables required for a config checker message!
 */
export interface ODCheckerMessage {
    checkerId: ODId;
    messageId: ODId;
    locationId: ODId;
    type: "info" | "warning" | "error";
    message: string;
    path: string;
    filepath: string;
    translationParams: string[];
    messageDocs: string | null;
    locationDocs: string | null;
}
/**## ODCheckerStructureOptions `interface`
 * This interface has the basic options for the `ODCheckerStructure`!
 */
export interface ODCheckerStructureOptions {
    /**Add a custom checker function. Returns `true` when valid. */
    custom?: (checker: ODChecker, value: ODValidJsonType, locationTrace: ODCheckerLocationTrace, locationId: ODId, locationDocs: string | null) => boolean;
    /**Set the url to the documentation of this variable. */
    docs?: string;
    /**The name of this config in the Interactive Setup CLI. */
    cliDisplayName?: string;
    /**The description of this config in the Interactive Setup CLI. */
    cliDisplayDescription?: string;
    /**Hide the description of this config in the Interactive Setup CLI parent view/list. */
    cliHideDescriptionInParent?: boolean;
    /**The default value of this variable when creating it in the Interactive Setup CLI. When not specified, the user will be asked to insert a value. */
    cliInitDefaultValue?: ODValidJsonType;
}
/**## ODCheckerStructure `class`
 * This is an Open Ticket config checker structure.
 *
 * This class will check for a single variable in a config file, customise it in the settings!
 * If you want prebuilt checkers (for strings, booleans, numbers, ...), check the other `ODCheckerStructure`'s!
 *
 * **Not recommended to use!** It's recommended to extend from another `ODConfigCheckerStructure` class!
 */
export declare class ODCheckerStructure {
    /**The id of this checker structure */
    id: ODId;
    /**The options for this checker structure */
    options: ODCheckerStructureOptions;
    constructor(id: ODValidId, options: ODCheckerStructureOptions);
    /**Check a variable if it matches all settings in this checker. This function is automatically executed by Open Ticket! */
    check(checker: ODChecker, value: ODValidJsonType, locationTrace: ODCheckerLocationTrace): boolean;
}
/**## ODCheckerObjectStructureOptions `interface`
 * This interface has the options for `ODCheckerObjectStructure`!
 */
export interface ODCheckerObjectStructureOptions extends ODCheckerStructureOptions {
    /**Add a checker for a property in an object (can also be optional) */
    children: {
        key: string;
        priority?: number;
        optional?: boolean;
        cliHideInEditMode?: boolean;
        checker: ODCheckerStructure;
    }[];
    /**A list of keys to skip when creating this object with the Interactive Setup CLI. The default value of these properties will be used instead. */
    cliInitSkipKeys?: string[];
    /**The key of a (primitive) property in this object to show the value of in the Interactive Setup CLI when listed in an array. */
    cliDisplayKeyInParentArray?: string;
    /**A list of additional (primitive) property keys in this object to show the value of in the Interactive Setup CLI when listed in an array. */
    cliDisplayAdditionalKeysInParentArray?: string[];
}
/**## ODCheckerObjectStructure `class`
 * This is an Open Ticket config checker structure.
 *
 * This class will check for an object variable in a config file, customise it in the settings!
 * A checker for the children can be set in the settings.
 */
export declare class ODCheckerObjectStructure extends ODCheckerStructure {
    options: ODCheckerObjectStructureOptions;
    constructor(id: ODValidId, options: ODCheckerObjectStructureOptions);
    check(checker: ODChecker, value: object, locationTrace: ODCheckerLocationTrace): boolean;
}
/**## ODCheckerStringStructureOptions `interface`
 * This interface has the options for `ODCheckerStringStructure`!
 */
export interface ODCheckerStringStructureOptions extends ODCheckerStructureOptions {
    /**The minimum length of this string */
    minLength?: number;
    /**The maximum length of this string */
    maxLength?: number;
    /**Set the required length of this string */
    length?: number;
    /**This string needs to start with ... */
    startsWith?: string;
    /**This string needs to end with ... */
    endsWith?: string;
    /**This string needs to contain ... */
    contains?: string;
    /**This string is not allowed to contain ... */
    invertedContains?: string;
    /**You need to choose between ... */
    choices?: string[];
    /**This string needs to be in lowercase. */
    lowercaseOnly?: boolean;
    /**This string needs to be in uppercase. */
    uppercaseOnly?: boolean;
    /**This string shouldn't contain any special characters (allowed: A-Z, a-z, 0-9, space, a few punctuation marks, ...). */
    noSpecialCharacters?: boolean;
    /**Do not allow any spaces in this string. */
    withoutSpaces?: boolean;
    /**Give a warning when a sentence doesn't start with a capital letter. Or require every word to start with a capital letter. (Ignores numbers, unicode characters, ...) */
    capitalLetterWarning?: false | "sentence" | "word";
    /**Give a warning when a sentence doesn't end with a punctuation letter (.,?!) */
    punctuationWarning?: boolean;
    /**The string needs to match this regex */
    regex?: RegExp;
    /**Provide an optional list for autocomplete when using the Interactive Setup CLI. Defaults to the `choices` option. */
    cliAutocompleteList?: string[];
    /**Dynamically provide a list for autocomplete items when using the Interactive Setup CLI. */
    cliAutocompleteFunc?: () => Promise<string[] | null>;
}
/**## ODCheckerStringStructure `class`
 * This is an Open Ticket config checker structure.
 *
 * This class will check for a string variable in a config file, customise it in the settings!
 */
export declare class ODCheckerStringStructure extends ODCheckerStructure {
    options: ODCheckerStringStructureOptions;
    constructor(id: ODValidId, options: ODCheckerStringStructureOptions);
    check(checker: ODChecker, value: string, locationTrace: ODCheckerLocationTrace): boolean;
}
/**## ODCheckerNumberStructureOptions `interface`
 * This interface has the options for `ODCheckerNumberStructure`!
 */
export interface ODCheckerNumberStructureOptions extends ODCheckerStructureOptions {
    /**Is `NaN` (not a number) allowed? (`false` by default) */
    nanAllowed?: boolean;
    /**The minimum length of this number */
    minLength?: number;
    /**The maximum length of this number */
    maxLength?: number;
    /**Set the required length of this number */
    length?: number;
    /**The minimum value of this number */
    min?: number;
    /**The maximum value of this number */
    max?: number;
    /**This number is required to match the value */
    is?: number;
    /**Only allow a multiple of ... starting at `this.offset` or 0 */
    step?: number;
    /**The offset for the step function. */
    offset?: number;
    /**This number needs to start with ... */
    startsWith?: string;
    /**This number needs to end with ... */
    endsWith?: string;
    /**This number needs to contain ... */
    contains?: string;
    /**This number is not allowed to contain ... */
    invertedContains?: string;
    /**You need to choose between ... */
    choices?: number[];
    /**Are numbers with a decimal value allowed? */
    floatAllowed?: boolean;
    /**Are negative numbers allowed (without zero) */
    negativeAllowed?: boolean;
    /**Are positive numers allowed (without zero) */
    positiveAllowed?: boolean;
    /**Is zero allowed? */
    zeroAllowed?: boolean;
}
/**## ODCheckerNumberStructure `class`
 * This is an Open Ticket config checker structure.
 *
 * This class will check for a number variable in a config file, customise it in the settings!
 */
export declare class ODCheckerNumberStructure extends ODCheckerStructure {
    options: ODCheckerNumberStructureOptions;
    constructor(id: ODValidId, options: ODCheckerNumberStructureOptions);
    check(checker: ODChecker, value: number, locationTrace: ODCheckerLocationTrace): boolean;
}
/**## ODCheckerBooleanStructureOptions `interface`
 * This interface has the options for `ODCheckerBooleanStructure`!
 */
export interface ODCheckerBooleanStructureOptions extends ODCheckerStructureOptions {
    /**Is `true` allowed? */
    trueAllowed?: boolean;
    /**Is `false` allowed? */
    falseAllowed?: boolean;
}
/**## ODCheckerBooleanStructure `class`
 * This is an Open Ticket config checker structure.
 *
 * This class will check for a boolean variable in a config file, customise it in the settings!
 */
export declare class ODCheckerBooleanStructure extends ODCheckerStructure {
    options: ODCheckerBooleanStructureOptions;
    constructor(id: ODValidId, options: ODCheckerBooleanStructureOptions);
    check(checker: ODChecker, value: boolean, locationTrace: ODCheckerLocationTrace): boolean;
}
/**## ODCheckerArrayStructureOptions `interface`
 * This interface has the options for `ODCheckerArrayStructure`!
 */
export interface ODCheckerArrayStructureOptions extends ODCheckerStructureOptions {
    /**The checker for all the properties in this array */
    propertyChecker?: ODCheckerStructure;
    /**Don't allow this array to be empty */
    disableEmpty?: boolean;
    /**This array is required to be empty */
    emptyRequired?: boolean;
    /**The minimum length of this array */
    minLength?: number;
    /**The maximum length of this array */
    maxLength?: number;
    /**The length of the array needs to be the same as this value */
    length?: number;
    /**Allow double values (only for `string`, `number` & `boolean`) */
    allowDoubles?: boolean;
    /**Only allow these types in the array (for multi-type propertyCheckers) */
    allowedTypes?: ("string" | "number" | "boolean" | "null" | "array" | "object" | "other")[];
    /**The name of the properties inside this array. Used in the GUI of the Interactive Setup CLI. */
    cliDisplayPropertyName?: string;
}
/**## ODCheckerArrayStructure `class`
 * This is an Open Ticket config checker structure.
 *
 * This class will check for an array variable in a config file, customise it in the settings!
 */
export declare class ODCheckerArrayStructure extends ODCheckerStructure {
    #private;
    options: ODCheckerArrayStructureOptions;
    constructor(id: ODValidId, options: ODCheckerArrayStructureOptions);
    check(checker: ODChecker, value: Array<any>, locationTrace: ODCheckerLocationTrace): boolean;
}
/**## ODCheckerNullStructureOptions `interface`
 * This interface has the options for `ODCheckerNullStructure`!
 */
export interface ODCheckerNullStructureOptions extends ODCheckerStructureOptions {
    /**Is the value allowed to be null */
    nullAllowed?: boolean;
}
/**## ODCheckerNullStructure `class`
 * This is an Open Ticket config checker structure.
 *
 * This class will check for a null variable in a config file, customise it in the settings!
 */
export declare class ODCheckerNullStructure extends ODCheckerStructure {
    options: ODCheckerNullStructureOptions;
    constructor(id: ODValidId, options: ODCheckerNullStructureOptions);
    check(checker: ODChecker, value: null, locationTrace: ODCheckerLocationTrace): boolean;
}
/**## ODCheckerTypeSwitchStructureOptions `interface`
 * This interface has the options for `ODCheckerTypeSwitchStructure`!
 */
export interface ODCheckerTypeSwitchStructureOptions extends ODCheckerStructureOptions {
    /**A checker that will always run (replaces all other checkers) */
    all?: ODCheckerStructure;
    /**A checker when the property is a string */
    string?: ODCheckerStringStructure;
    /**A checker when the property is a number */
    number?: ODCheckerNumberStructure;
    /**A checker when the property is a boolean */
    boolean?: ODCheckerBooleanStructure;
    /**A checker when the property is null */
    null?: ODCheckerNullStructure;
    /**A checker when the property is an array */
    array?: ODCheckerArrayStructure;
    /**A checker when the property is an object */
    object?: ODCheckerObjectStructure;
    /**A checker when the property is something else */
    other?: ODCheckerStructure;
    /**A list of allowed types */
    allowedTypes: ("string" | "number" | "boolean" | "null" | "array" | "object" | "other")[];
}
/**## ODCheckerTypeSwitchStructure `class`
 * This is an Open Ticket config checker structure.
 *
 * This class will switch checkers based on the type of the variable in a config file, customise it in the settings!
 */
export declare class ODCheckerTypeSwitchStructure extends ODCheckerStructure {
    options: ODCheckerTypeSwitchStructureOptions;
    constructor(id: ODValidId, options: ODCheckerTypeSwitchStructureOptions);
    check(checker: ODChecker, value: any, locationTrace: ODCheckerLocationTrace): boolean;
}
/**## ODCheckerObjectSwitchStructureOptions `interface`
 * This interface has the options for `ODCheckerObjectSwitchStructure`!
 */
export interface ODCheckerObjectSwitchStructureOptions extends ODCheckerStructureOptions {
    /**An array of object checkers with their name, properties & priority. */
    objects: {
        /**The properties to match for this checker to be used. */
        properties: {
            key: string;
            value: boolean | string | number;
        }[];
        /**The name for this object type (used in rendering) */
        name: string;
        /**The higher the priority, the earlier this checker will be tested. */
        priority: number;
        /**The object checker used once the properties have been matched. */
        checker: ODCheckerObjectStructure;
    }[];
}
/**## ODCheckerObjectSwitchStructure `class`
 * This is an Open Ticket config checker structure.
 *
 * This class will switch object checkers based on a variable match in one of the objects, customise it in the settings!
 */
export declare class ODCheckerObjectSwitchStructure extends ODCheckerStructure {
    options: ODCheckerObjectSwitchStructureOptions;
    constructor(id: ODValidId, options: ODCheckerObjectSwitchStructureOptions);
    check(checker: ODChecker, value: object, locationTrace: ODCheckerLocationTrace): boolean;
}
/**## ODCheckerEnabledObjectStructureOptions `interface`
 * This interface has the options for `ODCheckerEnabledObjectStructure`!
 */
export interface ODCheckerEnabledObjectStructureOptions extends ODCheckerStructureOptions {
    /**The name of the property to match the `enabledValue`. */
    property: string;
    /**The value of the property to be enabled. (e.g. `true`) */
    enabledValue: boolean | string | number;
    /**The object checker to use once the property has been matched. */
    checker: ODCheckerObjectStructure;
}
/**## ODCheckerEnabledObjectStructure `class`
 * This is an Open Ticket config checker structure.
 *
 * This class will enable an object checker based on a variable match in the object, customise it in the settings!
 */
export declare class ODCheckerEnabledObjectStructure extends ODCheckerStructure {
    options: ODCheckerEnabledObjectStructureOptions;
    constructor(id: ODValidId, options: ODCheckerEnabledObjectStructureOptions);
    check(checker: ODChecker, value: object, locationTrace: ODCheckerLocationTrace): boolean;
}
/**## ODCheckerCustomStructure_DiscordId `class`
 * This is an Open Ticket custom checker structure.
 *
 * This class extends a primitive config checker & adds another layer of checking in the `custom` function.
 * You can compare it to a blueprint for a specific checker.
 *
 * **This custom checker is made for discord ids (channel, user, role, ...)**
 */
export declare class ODCheckerCustomStructure_DiscordId extends ODCheckerStringStructure {
    /**The type of id (used in rendering) */
    readonly type: ODDiscordIdType;
    /**Is this id allowed to be empty */
    readonly emptyAllowed: boolean;
    /**Extra matches (value will also be valid when one of these options match) */
    readonly extraOptions: string[];
    constructor(id: ODValidId, type: ODDiscordIdType, emptyAllowed: boolean, extraOptions: string[], options?: ODCheckerStringStructureOptions);
}
/**## ODCheckerCustomStructure_DiscordIdArray `class`
 * This is an Open Ticket custom checker structure.
 *
 * This class extends a primitive config checker & adds another layer of checking in the `custom` function.
 * You can compare it to a blueprint for a specific checker.
 *
 * **This custom checker is made for discord id arrays (channel, user, role, ...)**
 */
export declare class ODCheckerCustomStructure_DiscordIdArray extends ODCheckerArrayStructure {
    /**The type of id (used in rendering) */
    readonly type: ODDiscordIdType;
    /**Extra matches (value will also be valid when one of these options match) */
    readonly extraOptions: string[];
    constructor(id: ODValidId, type: ODDiscordIdType, extraOptions: string[], options?: ODCheckerArrayStructureOptions, idOptions?: ODCheckerStringStructureOptions);
}
/**## ODCheckerCustomStructure_DiscordToken `class`
 * This is an Open Ticket custom checker structure.
 *
 * This class extends a primitive config checker & adds another layer of checking in the `custom` function.
 * You can compare it to a blueprint for a specific checker.
 *
 * **This custom checker is made for a discord (auth) token**
 */
export declare class ODCheckerCustomStructure_DiscordToken extends ODCheckerStringStructure {
    constructor(id: ODValidId, options?: ODCheckerStringStructureOptions);
}
/**## ODCheckerCustomStructure_DiscordToken `class`
 * This is an Open Ticket custom checker structure.
 *
 * This class extends a primitive config checker & adds another layer of checking in the `custom` function.
 * You can compare it to a blueprint for a specific checker.
 *
 * **This custom checker is made for a hex color**
 */
export declare class ODCheckerCustomStructure_HexColor extends ODCheckerStringStructure {
    /**When enabled, you are also allowed to use `#fff` instead of `#ffffff` */
    readonly allowShortForm: boolean;
    /**Allow this hex color to be empty. */
    readonly emptyAllowed: boolean;
    constructor(id: ODValidId, allowShortForm: boolean, emptyAllowed: boolean, options?: ODCheckerStringStructureOptions);
}
/**## ODCheckerCustomStructure_EmojiString `class`
 * This is an Open Ticket custom checker structure.
 *
 * This class extends a primitive config checker & adds another layer of checking in the `custom` function.
 * You can compare it to a blueprint for a specific checker.
 *
 * **This custom checker is made for an emoji (string)**
 */
export declare class ODCheckerCustomStructure_EmojiString extends ODCheckerStringStructure {
    /**The minimum amount of emojis required (0 to allow empty) */
    readonly minLength: number;
    /**The maximum amount of emojis allowed */
    readonly maxLength: number;
    /**Allow custom discord emoji ids (`<:12345678910:emoji_name>`) */
    readonly allowCustomDiscordEmoji: boolean;
    constructor(id: ODValidId, minLength: number, maxLength: number, allowCustomDiscordEmoji: boolean, options?: ODCheckerStringStructureOptions);
}
/**## ODCheckerCustomStructureOptions_UrlString `interface`
 * This interface has the options for `ODCheckerCustomStructure_UrlString`!
 */
export interface ODCheckerCustomStructureOptions_UrlString {
    /**Allow urls with `http://` instead of `https://` */
    allowHttp?: boolean;
    /**Allowed hostnames (string or regex) => will match domain + subdomain */
    allowedHostnames?: (string | RegExp)[];
    /**Allowed extentions (string) => will match the end of the url (`.png`,`.svg`,...) */
    allowedExtensions?: string[];
    /**Allowed paths (string or regex) => will match path + extension (not domain + subdomain) */
    allowedPaths?: (string | RegExp)[];
    /**A regex that will be executed on the entire url (including search params, protcol, domain, ...) */
    regex?: RegExp;
}
/**## ODCheckerCustomStructure_UrlString `class`
 * This is an Open Ticket custom checker structure.
 *
 * This class extends a primitive config checker & adds another layer of checking in the `custom` function.
 * You can compare it to a blueprint for a specific checker.
 *
 * **This custom checker is made for a URL (string)**
 */
export declare class ODCheckerCustomStructure_UrlString extends ODCheckerStringStructure {
    #private;
    /**The settings for this url */
    readonly urlSettings: ODCheckerCustomStructureOptions_UrlString;
    /**Is this url allowed to be empty? */
    readonly emptyAllowed: boolean;
    constructor(id: ODValidId, emptyAllowed: boolean, urlSettings: ODCheckerCustomStructureOptions_UrlString, options?: ODCheckerStringStructureOptions);
}
/**## ODCheckerCustomStructure_UniqueId `class`
 * This is an Open Ticket custom checker structure.
 *
 * This class extends a primitive config checker & adds another layer of checking in the `custom` function.
 * You can compare it to a blueprint for a specific checker.
 *
 * **This custom checker is made for a unique id (per source & scope)**
 */
export declare class ODCheckerCustomStructure_UniqueId extends ODCheckerStringStructure {
    /**The source of this unique id (generally the plugin name or `openticket`) */
    readonly source: string;
    /**The scope of this unique id (id needs to be unique in this scope) */
    readonly scope: string;
    constructor(id: ODValidId, source: string, scope: string, options?: ODCheckerStringStructureOptions);
}
/**## ODCheckerCustomStructure_UniqueIdArray `class`
 * This is an Open Ticket custom checker structure.
 *
 * This class extends a primitive config checker & adds another layer of checking in the `custom` function.
 * You can compare it to a blueprint for a specific checker.
 *
 * **This custom checker is made for a unique id array (per source & scope)**
 */
export declare class ODCheckerCustomStructure_UniqueIdArray extends ODCheckerArrayStructure {
    /**The source to read unique ids (generally the plugin name or `openticket`) */
    readonly source: string;
    /**The scope to read unique ids (id needs to be unique in this scope) */
    readonly scope: string;
    /**The scope to push unique ids when used in this array! */
    readonly usedScope: string | null;
    constructor(id: ODValidId, source: string, scope: string, usedScope?: string, options?: ODCheckerArrayStructureOptions, idOptions?: Omit<ODCheckerStringStructureOptions, "minLength" | "custom">);
}
