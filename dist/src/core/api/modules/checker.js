"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODCheckerCustomStructure_UniqueIdArray = exports.ODCheckerCustomStructure_UniqueId = exports.ODCheckerCustomStructure_UrlString = exports.ODCheckerCustomStructure_EmojiString = exports.ODCheckerCustomStructure_HexColor = exports.ODCheckerCustomStructure_DiscordToken = exports.ODCheckerCustomStructure_DiscordIdArray = exports.ODCheckerCustomStructure_DiscordId = exports.ODCheckerEnabledObjectStructure = exports.ODCheckerObjectSwitchStructure = exports.ODCheckerTypeSwitchStructure = exports.ODCheckerNullStructure = exports.ODCheckerArrayStructure = exports.ODCheckerBooleanStructure = exports.ODCheckerNumberStructure = exports.ODCheckerStringStructure = exports.ODCheckerObjectStructure = exports.ODCheckerStructure = exports.ODChecker = exports.ODCheckerFunctionManager = exports.ODCheckerFunction = exports.ODCheckerTranslationRegister = exports.ODCheckerRenderer = exports.ODCheckerStorage = exports.ODCheckerManager = void 0;
///////////////////////////////////////
//CONFIG CHECKER MODULE
///////////////////////////////////////
const base_1 = require("./base");
const config_1 = require("./config");
/**## ODCheckerManager `class`
 * This is an Open Ticket checker manager.
 *
 * It manages all config checkers in the bot and allows plugins to access config checkers from Open Ticket & other plugins!
 *
 * You can use this class to get/add a config checker (`ODChecker`) in your plugin!
 */
class ODCheckerManager extends base_1.ODManager {
    /**The global temporary storage shared between all config checkers. */
    storage;
    /**The class responsible for rendering the config checker report. */
    renderer;
    /**The class responsible for translating the config checker report. */
    translation;
    /**Final functions are global functions executed just before the report is created. */
    functions;
    /**A variable containing the last result returned from `checkAll()` */
    lastResult = null;
    constructor(debug, storage, renderer, translation, functions) {
        super(debug, "config checker");
        this.storage = storage;
        this.renderer = renderer;
        this.translation = translation;
        this.functions = functions;
    }
    /**Check all config checkers registered in this manager.*/
    checkAll(sort) {
        this.storage.reset();
        let isValid = true;
        const final = [];
        const checkers = this.getAll();
        checkers.sort((a, b) => b.priority - a.priority);
        checkers.forEach((checker) => {
            const res = checker.check();
            final.push(...res.messages);
            if (!res.valid)
                isValid = false;
        });
        this.functions.getAll().forEach((func) => {
            const res = func.func(this, this.functions);
            final.push(...res.messages);
            if (!res.valid)
                isValid = false;
        });
        //sort messages => (info, warning, error)
        if (sort)
            final.sort((a, b) => {
                const typeA = (a.type == "error") ? 2 : (a.type == "warning") ? 1 : 0;
                const typeB = (b.type == "error") ? 2 : (b.type == "warning") ? 1 : 0;
                return typeA - typeB;
            });
        this.lastResult = {
            valid: isValid,
            messages: final
        };
        return {
            valid: isValid,
            messages: final
        };
    }
    /**Create temporary and unlisted `ODConfig`, `ODChecker` & `ODCheckerStorage` classes. This will help you use a `ODCheckerStructure` validator without officially registering it in `opendiscord.checkers`. */
    createTemporaryCheckerEnvironment() {
        return new ODChecker("opendiscord:temporary-environment", new ODCheckerStorage(), 0, new config_1.ODConfig("opendiscord:temporary-environment", {}), new ODCheckerStructure("opendiscord:temporary-environment", {}));
    }
}
exports.ODCheckerManager = ODCheckerManager;
/**## ODCheckerStorage `class`
 * This is an Open Ticket checker storage.
 *
 * It stores temporary data to share between config checkers!
 * (e.g. The `messages.json` needs to access the `"id"` from `options.json`)
 *
 *
 * You can use this class when you create your own config checker implementation! (not required for using the built-in config checker)
 */
class ODCheckerStorage {
    /**This is the array that stores all the data. ❌ **(don't edit unless really needed!)***/
    storage = [];
    /**Get data from the database (`source` => id of `ODChecker`) */
    get(source, key) {
        const result = this.storage.find(d => (d.source.value == new base_1.ODId(source).value) && (d.key == key));
        return (result) ? result.value : null;
    }
    /**Add data to the database (`source` => id of `ODChecker`). This function also overwrites existing data!*/
    set(source, key, value) {
        const index = this.storage.findIndex(d => (d.source.value == new base_1.ODId(source).value) && (d.key == key));
        if (index > -1) {
            //overwrite
            this.storage[index] = {
                source: new base_1.ODId(source),
                key, value
            };
            return true;
        }
        else {
            this.storage.push({
                source: new base_1.ODId(source),
                key, value
            });
            return false;
        }
    }
    /**Delete data from the database (`source` => id of `ODChecker`) */
    delete(source, key) {
        const index = this.storage.findIndex(d => (d.source.value == new base_1.ODId(source).value) && (d.key == key));
        if (index > -1) {
            //delete
            this.storage.splice(index, 1);
            return true;
        }
        else
            return false;
    }
    /**Reset the entire database */
    reset() {
        this.storage = [];
    }
}
exports.ODCheckerStorage = ODCheckerStorage;
/**## ODCheckerRenderer `class`
 * This is an Open Ticket checker renderer.
 *
 * It's responsible for rendering the config checker result in the console.
 * This class doesn't provide any components! You need to create them by extending this class
 *
 * You can use this class if you want to change how the config checker looks!
 */
class ODCheckerRenderer {
    /**Get all components */
    getComponents(compact, renderEmpty, translation, data) {
        return [];
    }
    /**Render all components */
    render(components) {
        if (components.length < 1)
            return;
        console.log("\n");
        components.forEach((c) => {
            console.log(c);
        });
        console.log("\n");
    }
}
exports.ODCheckerRenderer = ODCheckerRenderer;
/**## ODCheckerTranslationRegister `class`
 * This is an Open Ticket checker translation register.
 *
 * It's used to store & manage the translation for each message from the config checker!
 * Most translations are stored by message id, but there are some exceptions like the additional text on the checker report.
 *
 * You can use this class if you want to translate your config checker messages! **This is optional & isn't required for the checker to work!**
 */
class ODCheckerTranslationRegister {
    /**This is the array that stores all the data. ❌ **(don't edit unless really needed!)***/
    #translations = [];
    /**Get the translation from a config checker message/sentence */
    get(type, id) {
        const result = this.#translations.find(d => (d.id == id) && (d.type == type));
        return (result) ? result.translation : null;
    }
    /**Set the translation for a config checker message/sentence. This function also overwrites existing translations!*/
    set(type, id, translation) {
        const index = this.#translations.findIndex(d => (d.id == id) && (d.type == type));
        if (index > -1) {
            //overwrite
            this.#translations[index] = { type, id, translation };
            return true;
        }
        else {
            this.#translations.push({ type, id, translation });
            return false;
        }
    }
    /**Delete the translation for a config checker message/sentence. */
    delete(type, id) {
        const index = this.#translations.findIndex(d => (d.id == id) && (d.type == type));
        if (index > -1) {
            //delete
            this.#translations.splice(index, 1);
            return true;
        }
        else
            return false;
    }
    /**Get all translations */
    getAll() {
        return this.#translations;
    }
    /**Insert the translation params into the text. */
    insertTranslationParams(text, translationParams) {
        translationParams.forEach((value, index) => {
            text = text.replace(`{${index}}`, value);
        });
        return text;
    }
    /**A shortcut to copy translations from the `ODLanguageManager` to `ODCheckerTranslationRegister` */
    quickTranslate(manager, translationId, type, id) {
        const translation = manager.getTranslation(translationId);
        if (translation)
            this.set(type, id, translation);
    }
}
exports.ODCheckerTranslationRegister = ODCheckerTranslationRegister;
/**## ODCheckerFunction `class`
 * This is an Open Ticket config checker function.
 *
 * It is a global function that will be executed after all config checkers. It can do additional checks for invalid/missing configurations.
 * It's mostly used for things that need to be checked globally!
 */
class ODCheckerFunction extends base_1.ODManagerData {
    /**The function which will be executed globally after all config checkers. */
    func;
    constructor(id, func) {
        super(id);
        this.func = func;
    }
}
exports.ODCheckerFunction = ODCheckerFunction;
/**## ODCheckerFunctionManager `class`
 * This is an Open Ticket config checker function manager.
 *
 * It manages all `ODCheckerFunction`'s and it has some extra shortcuts for frequently used methods.
 */
class ODCheckerFunctionManager extends base_1.ODManager {
    constructor(debug) {
        super(debug, "config checker function");
    }
    /**A shortcut to create a warning, info or error message */
    createMessage(checkerId, id, filepath, type, message, locationTrace, docs, translationParams, locationId, locationDocs) {
        return {
            checkerId: new base_1.ODId(checkerId),
            messageId: new base_1.ODId(id),
            locationId,
            type, message,
            path: this.locationTraceToString(locationTrace),
            filepath,
            translationParams,
            messageDocs: docs,
            locationDocs
        };
    }
    /**Create a string from the location trace (path)*/
    locationTraceToString(trace) {
        const final = [];
        trace.forEach((t) => {
            if (typeof t == "number") {
                final.push(`:${t}`);
            }
            else {
                final.push(`."${t}"`);
            }
        });
        return final.join("").substring(1);
    }
    /**De-reference the locationTrace array. Use this before adding a value to the array*/
    locationTraceDeref(trace) {
        return JSON.parse(JSON.stringify(trace));
    }
}
exports.ODCheckerFunctionManager = ODCheckerFunctionManager;
/**## ODChecker `class`
 * This is an Open Ticket config checker.
 *
 * It checks a specific config file for invalid/missing configurations. This data can then be used to show to the user what's wrong!
 * You can check for example if a string is longer/shorter than a certain amount of characters & more!
 *
 * You can use this class when you create your own custom config file & you want to check it for syntax errors.
 */
class ODChecker extends base_1.ODManagerData {
    /**The storage of this checker (reference for `ODCheckerManager.storage`) */
    storage;
    /**The higher the priority, the faster it gets checked! */
    priority;
    /**The config file that needs to be checked */
    config;
    /**The structure of the config file */
    structure;
    /**Temporary storage for all error messages from the check() method (not recommended to use) */
    messages = [];
    /**Temporary storage for the quit status from the check() method (not recommended to use) */
    quit = false;
    /**All additional properties of this config checker. */
    options;
    constructor(id, storage, priority, config, structure, options) {
        super(id);
        this.storage = storage;
        this.priority = priority;
        this.config = config;
        this.structure = structure;
        this.options = options ?? {};
    }
    /**Get a human-readable number string. */
    #ordinalNumber(num) {
        const i = Math.abs(Math.round(num));
        const cent = i % 100;
        if (cent >= 10 && cent <= 20)
            return i + 'th';
        const dec = i % 10;
        if (dec === 1)
            return i + 'st';
        if (dec === 2)
            return i + 'nd';
        if (dec === 3)
            return i + 'rd';
        return i + 'th';
    }
    /**Run this checker. Returns all errors*/
    check() {
        this.messages = [];
        this.quit = false;
        this.structure.check(this, this.config.data, []);
        return {
            valid: !this.quit,
            messages: this.messages
        };
    }
    /**Create a string from the location trace/path in a human readable format. */
    locationTraceToString(trace) {
        const final = [];
        trace.forEach((t) => {
            if (typeof t == "number") {
                final.push(`:(${this.#ordinalNumber(t + 1)})`);
            }
            else {
                final.push(`."${t}"`);
            }
        });
        return final.join("").substring(1);
    }
    /**De-reference the locationTrace array. Use this before adding a value to the array*/
    locationTraceDeref(trace) {
        return JSON.parse(JSON.stringify(trace));
    }
    /**A shortcut to create a warning, info or error message */
    createMessage(id, type, message, locationTrace, docs, translationParams, locationId, locationDocs) {
        if (type == "error")
            this.quit = true;
        this.messages.push({
            checkerId: this.id,
            messageId: new base_1.ODId(id),
            locationId,
            type, message,
            path: this.locationTraceToString(locationTrace),
            filepath: this.config.path,
            translationParams,
            messageDocs: docs,
            locationDocs
        });
    }
}
exports.ODChecker = ODChecker;
/**## ODCheckerStructure `class`
 * This is an Open Ticket config checker structure.
 *
 * This class will check for a single variable in a config file, customise it in the settings!
 * If you want prebuilt checkers (for strings, booleans, numbers, ...), check the other `ODCheckerStructure`'s!
 *
 * **Not recommended to use!** It's recommended to extend from another `ODConfigCheckerStructure` class!
 */
class ODCheckerStructure {
    /**The id of this checker structure */
    id;
    /**The options for this checker structure */
    options;
    constructor(id, options) {
        this.id = new base_1.ODId(id);
        this.options = options;
    }
    /**Check a variable if it matches all settings in this checker. This function is automatically executed by Open Ticket! */
    check(checker, value, locationTrace) {
        if (typeof this.options.custom != "undefined") {
            return this.options.custom(checker, value, locationTrace, this.id, (this.options.docs ?? null));
        }
        else
            return true;
    }
}
exports.ODCheckerStructure = ODCheckerStructure;
/**## ODCheckerObjectStructure `class`
 * This is an Open Ticket config checker structure.
 *
 * This class will check for an object variable in a config file, customise it in the settings!
 * A checker for the children can be set in the settings.
 */
class ODCheckerObjectStructure extends ODCheckerStructure {
    constructor(id, options) {
        super(id, options);
    }
    check(checker, value, locationTrace) {
        const lt = checker.locationTraceDeref(locationTrace);
        //check type & options
        if (typeof value != "object") {
            checker.createMessage("opendiscord:invalid-type", "error", "This property needs to be the type: object!", lt, null, ["object"], this.id, (this.options.docs ?? null));
            return false;
        }
        //sort children
        if (typeof this.options.children == "undefined")
            return super.check(checker, value, locationTrace);
        const sortedChildren = this.options.children.sort((a, b) => {
            if ((a.priority ?? 0) < (b.priority ?? 0))
                return -1;
            else if ((a.priority ?? 0) > (b.priority ?? 0))
                return 1;
            else
                return 0;
        });
        //check children
        let localQuit = false;
        sortedChildren.forEach((child) => {
            const localLt = checker.locationTraceDeref(lt);
            localLt.push(child.key);
            if (typeof value[child.key] == "undefined") {
                if (!child.optional) {
                    localQuit = true;
                    checker.createMessage("opendiscord:property-missing", "error", `The property "${child.key}" is mising from this object!`, lt, null, [`"${child.key}"`], this.id, (this.options.docs ?? null));
                }
                else {
                    checker.createMessage("opendiscord:property-optional", "info", `The property "${child.key}" is optional in this object!`, lt, null, [`"${child.key}"`], this.id, (this.options.docs ?? null));
                }
            }
            else if (!child.checker.check(checker, value[child.key], localLt))
                localQuit = true;
        });
        //do local quit or check custom function
        if (localQuit)
            return false;
        else
            return super.check(checker, value, locationTrace);
    }
}
exports.ODCheckerObjectStructure = ODCheckerObjectStructure;
/**## ODCheckerStringStructure `class`
 * This is an Open Ticket config checker structure.
 *
 * This class will check for a string variable in a config file, customise it in the settings!
 */
class ODCheckerStringStructure extends ODCheckerStructure {
    constructor(id, options) {
        super(id, options);
    }
    check(checker, value, locationTrace) {
        const lt = checker.locationTraceDeref(locationTrace);
        //check type & options
        if (typeof value != "string") {
            checker.createMessage("opendiscord:invalid-type", "error", "This property needs to be the type: string!", lt, null, ["string"], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.minLength != "undefined" && value.length < this.options.minLength) {
            checker.createMessage("opendiscord:string-too-short", "error", `This string can't be shorter than ${this.options.minLength} characters!`, lt, null, [this.options.minLength.toString()], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.maxLength != "undefined" && value.length > this.options.maxLength) {
            checker.createMessage("opendiscord:string-too-long", "error", `This string can't be longer than ${this.options.maxLength} characters!`, lt, null, [this.options.maxLength.toString()], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.length != "undefined" && value.length !== this.options.length) {
            checker.createMessage("opendiscord:string-length-invalid", "error", `This string needs to be ${this.options.length} characters long!`, lt, null, [this.options.length.toString()], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.startsWith != "undefined" && !value.startsWith(this.options.startsWith)) {
            checker.createMessage("opendiscord:string-starts-with", "error", `This string needs to start with "${this.options.startsWith}"!`, lt, null, [`"${this.options.startsWith}"`], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.endsWith != "undefined" && !value.endsWith(this.options.endsWith)) {
            checker.createMessage("opendiscord:string-ends-with", "error", `This string needs to end with "${this.options.endsWith}"!`, lt, null, [`"${this.options.endsWith}"`], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.contains != "undefined" && !value.includes(this.options.contains)) {
            checker.createMessage("opendiscord:string-contains", "error", `This string needs to contain "${this.options.contains}"!`, lt, null, [`"${this.options.contains}"`], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.invertedContains != "undefined" && value.includes(this.options.invertedContains)) {
            checker.createMessage("opendiscord:string-inverted-contains", "error", `This string is not allowed to contain "${this.options.invertedContains}"!`, lt, null, [`"${this.options.invertedContains}"`], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.choices != "undefined" && !this.options.choices.includes(value)) {
            checker.createMessage("opendiscord:string-choices", "error", `This string can only be one of the following values: "${this.options.choices.join(`", "`)}"!`, lt, null, [`"${this.options.choices.join(`", "`)}"`], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (this.options.lowercaseOnly && value !== value.toLowerCase()) {
            checker.createMessage("opendiscord:string-lowercase", "error", `This string must be written in lowercase only!`, lt, null, [], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (this.options.uppercaseOnly && value !== value.toUpperCase()) {
            checker.createMessage("opendiscord:string-uppercase", "error", `This string must be written in uppercase only!`, lt, null, [], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (this.options.noSpecialCharacters && !/^[A-Za-z0-9 ]*$/.test(value)) {
            checker.createMessage("opendiscord:string-special-characters", "error", `This string is not allowed to contain any special characters! (a-z, 0-9 & space only)`, lt, null, [], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (this.options.withoutSpaces && value.includes(" ")) {
            checker.createMessage("opendiscord:string-no-spaces", "error", `This string is not allowed to contain spaces!`, lt, null, [], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.regex != "undefined" && !this.options.regex.test(value)) {
            checker.createMessage("opendiscord:string-regex", "error", "This string is invalid!", lt, null, [], this.id, (this.options.docs ?? null));
            return false;
        }
        else {
            //warnings
            if ((this.options.capitalLetterWarning == "word" && !value.split(" ").every((word) => word.length == 0 || /^[^a-z].*/.test(word))))
                checker.createMessage("opendiscord:string-capital-word", "warning", `It's recommended that each word in this string starts with a capital letter!`, lt, null, [], this.id, (this.options.docs ?? null));
            if ((this.options.capitalLetterWarning == "sentence" && !value.split(/ *[.?!] */).every((sentence) => sentence.length == 0 || /^[^a-z].*/.test(sentence))))
                checker.createMessage("opendiscord:string-capital-sentence", "warning", `It looks like some sentences in this string don't start with a capital letter!`, lt, null, [], this.id, (this.options.docs ?? null));
            if (this.options.punctuationWarning && value.length > 0 && (!value.endsWith(".") && !value.endsWith("?") && !value.endsWith("!") && !value.endsWith("'") && !value.endsWith('"') && !value.endsWith(",") && !value.endsWith(";") && !value.endsWith(":") && !value.endsWith("=")))
                checker.createMessage("opendiscord:string-punctuation", "warning", `It looks like the sentence in this string doesn't end with a punctuation mark!`, lt, null, [], this.id, (this.options.docs ?? null));
            return super.check(checker, value, locationTrace);
        }
    }
}
exports.ODCheckerStringStructure = ODCheckerStringStructure;
/**## ODCheckerNumberStructure `class`
 * This is an Open Ticket config checker structure.
 *
 * This class will check for a number variable in a config file, customise it in the settings!
 */
class ODCheckerNumberStructure extends ODCheckerStructure {
    constructor(id, options) {
        super(id, options);
    }
    check(checker, value, locationTrace) {
        const lt = checker.locationTraceDeref(locationTrace);
        //offset for step
        const stepOffset = (typeof this.options.offset != "undefined") ? this.options.offset : 0;
        //check type & options
        if (typeof value != "number") {
            checker.createMessage("opendiscord:invalid-type", "error", "This property needs to be the type: number!", lt, null, ["number"], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (!this.options.nanAllowed && isNaN(value)) {
            checker.createMessage("opendiscord:number-nan", "error", `This number can't be NaN (Not A Number)!`, lt, null, [], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.minLength != "undefined" && value.toString().length < this.options.minLength) {
            checker.createMessage("opendiscord:number-too-short", "error", `This number can't be shorter than ${this.options.minLength} characters!`, lt, null, [this.options.minLength.toString()], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.maxLength != "undefined" && value.toString().length > this.options.maxLength) {
            checker.createMessage("opendiscord:number-too-long", "error", `This number can't be longer than ${this.options.maxLength} characters!`, lt, null, [this.options.maxLength.toString()], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.length != "undefined" && value.toString().length !== this.options.length) {
            checker.createMessage("opendiscord:number-length-invalid", "error", `This number needs to be ${this.options.length} characters long!`, lt, null, [this.options.length.toString()], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.min != "undefined" && value < this.options.min) {
            checker.createMessage("opendiscord:number-too-small", "error", `This number needs to be at least ${this.options.min}!`, lt, null, [this.options.min.toString()], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.max != "undefined" && value > this.options.max) {
            checker.createMessage("opendiscord:number-too-large", "error", `This number needs to be at most ${this.options.max}!`, lt, null, [this.options.max.toString()], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.is != "undefined" && value == this.options.is) {
            checker.createMessage("opendiscord:number-not-equal", "error", `This number needs to be ${this.options.is}!`, lt, null, [this.options.is.toString()], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.step != "undefined" && ((value - stepOffset) % this.options.step) !== 0) {
            if (stepOffset > 0)
                checker.createMessage("opendiscord:number-step-offset", "error", `This number needs to be a multiple of ${this.options.step} starting with ${stepOffset}!`, lt, null, [this.options.step.toString(), stepOffset.toString()], this.id, (this.options.docs ?? null));
            else
                checker.createMessage("opendiscord:number-step", "error", `This number needs to be a multiple of ${this.options.step}!`, lt, null, [this.options.step.toString()], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.startsWith != "undefined" && !value.toString().startsWith(this.options.startsWith)) {
            checker.createMessage("opendiscord:number-starts-with", "error", `This number needs to start with "${this.options.startsWith}"!`, lt, null, [`"${this.options.startsWith}"`], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.endsWith != "undefined" && !value.toString().endsWith(this.options.endsWith)) {
            checker.createMessage("opendiscord:number-ends-with", "error", `This number needs to end with "${this.options.endsWith}"!`, lt, null, [`"${this.options.endsWith}"`], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.contains != "undefined" && !value.toString().includes(this.options.contains)) {
            checker.createMessage("opendiscord:number-contains", "error", `This number needs to contain "${this.options.contains}"!`, lt, null, [`"${this.options.contains}"`], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.invertedContains != "undefined" && value.toString().includes(this.options.invertedContains)) {
            checker.createMessage("opendiscord:number-inverted-contains", "error", `This number is not allowed to contain "${this.options.invertedContains}"!`, lt, null, [`"${this.options.invertedContains}"`], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.choices != "undefined" && !this.options.choices.includes(value)) {
            checker.createMessage("opendiscord:number-choices", "error", `This number can only be one of the following values: "${this.options.choices.join(`", "`)}"!`, lt, null, [`"${this.options.choices.join(`", "`)}"`], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.floatAllowed != "undefined" && !this.options.floatAllowed && (value % 1) !== 0) {
            checker.createMessage("opendiscord:number-float", "error", "This number can't be a decimal!", lt, null, [], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.negativeAllowed != "undefined" && !this.options.negativeAllowed && value < 0) {
            checker.createMessage("opendiscord:number-negative", "error", "This number can't be negative!", lt, null, [], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.positiveAllowed != "undefined" && !this.options.positiveAllowed && value > 0) {
            checker.createMessage("opendiscord:number-positive", "error", "This number can't be positive!", lt, null, [], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.zeroAllowed != "undefined" && !this.options.zeroAllowed && value === 0) {
            checker.createMessage("opendiscord:number-zero", "error", "This number can't be zero!", lt, null, [], this.id, (this.options.docs ?? null));
            return false;
        }
        else
            return super.check(checker, value, locationTrace);
    }
}
exports.ODCheckerNumberStructure = ODCheckerNumberStructure;
/**## ODCheckerBooleanStructure `class`
 * This is an Open Ticket config checker structure.
 *
 * This class will check for a boolean variable in a config file, customise it in the settings!
 */
class ODCheckerBooleanStructure extends ODCheckerStructure {
    constructor(id, options) {
        super(id, options);
    }
    check(checker, value, locationTrace) {
        const lt = checker.locationTraceDeref(locationTrace);
        //check type & options
        if (typeof value != "boolean") {
            checker.createMessage("opendiscord:invalid-type", "error", "This property needs to be the type: boolean!", lt, null, ["boolean"], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.trueAllowed != "undefined" && !this.options.trueAllowed && value == true) {
            checker.createMessage("opendiscord:boolean-true", "error", "This boolean can't be true!", lt, null, [], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.falseAllowed != "undefined" && !this.options.falseAllowed && value == false) {
            checker.createMessage("opendiscord:boolean-false", "error", "This boolean can't be false!", lt, null, [], this.id, (this.options.docs ?? null));
            return false;
        }
        else
            return super.check(checker, value, locationTrace);
    }
}
exports.ODCheckerBooleanStructure = ODCheckerBooleanStructure;
/**## ODCheckerArrayStructure `class`
 * This is an Open Ticket config checker structure.
 *
 * This class will check for an array variable in a config file, customise it in the settings!
 */
class ODCheckerArrayStructure extends ODCheckerStructure {
    constructor(id, options) {
        super(id, options);
    }
    check(checker, value, locationTrace) {
        const lt = checker.locationTraceDeref(locationTrace);
        if (!Array.isArray(value)) {
            checker.createMessage("opendiscord:invalid-type", "error", "This property needs to be the type: array!", lt, null, ["array"], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.disableEmpty != "undefined" && this.options.disableEmpty && value.length == 0) {
            checker.createMessage("opendiscord:array-empty-disabled", "error", "This array isn't allowed to be empty!", lt, null, [], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.emptyRequired != "undefined" && this.options.emptyRequired && value.length != 0) {
            checker.createMessage("opendiscord:array-empty-required", "error", "This array is required to be empty!", lt, null, [], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.minLength != "undefined" && value.length < this.options.minLength) {
            checker.createMessage("opendiscord:array-too-short", "error", `This array needs to have a length of at least ${this.options.minLength}!`, lt, null, [this.options.minLength.toString()], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.maxLength != "undefined" && value.length > this.options.maxLength) {
            checker.createMessage("opendiscord:array-too-long", "error", `This array needs to have a length of at most ${this.options.maxLength}!`, lt, null, [this.options.maxLength.toString()], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.length != "undefined" && value.length == this.options.length) {
            checker.createMessage("opendiscord:array-length-invalid", "error", `This array needs to have a length of ${this.options.length}!`, lt, null, [this.options.length.toString()], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.allowedTypes != "undefined" && !this.#arrayAllowedTypesCheck(value, this.options.allowedTypes)) {
            checker.createMessage("opendiscord:array-invalid-types", "error", `This array can only contain the following types: ${this.options.allowedTypes.join(", ")}!`, lt, null, [this.options.allowedTypes.join(", ").toString()], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (typeof this.options.allowDoubles != "undefined" && !this.options.allowDoubles && this.#arrayHasDoubles(value)) {
            checker.createMessage("opendiscord:array-double", "error", "This array doesn't allow the same value twice!", lt, null, [], this.id, (this.options.docs ?? null));
            return false;
        }
        else {
            //check all properties
            let localQuit = false;
            if (this.options.propertyChecker)
                value.forEach((property, index) => {
                    if (!this.options.propertyChecker)
                        return;
                    const localLt = checker.locationTraceDeref(lt);
                    localLt.push(index);
                    if (!this.options.propertyChecker.check(checker, property, localLt))
                        localQuit = true;
                });
            //return false if invalid properties
            if (localQuit) {
                checker.quit = true;
                return false;
            }
            else
                return super.check(checker, value, locationTrace);
        }
    }
    /**Check this array for the allowed types */
    #arrayAllowedTypesCheck(array, allowedTypes) {
        //return TRUE if ALL values are valid
        return !array.some((value) => {
            if (allowedTypes.includes("string") && typeof value == "string") {
                return false; //this value is valid
            }
            else if (allowedTypes.includes("number") && typeof value == "number") {
                return false; //this value is valid
            }
            else if (allowedTypes.includes("boolean") && typeof value == "boolean") {
                return false; //this value is valid
            }
            else if (allowedTypes.includes("object") && typeof value == "object") {
                return false; //this value is valid
            }
            else if (allowedTypes.includes("array") && Array.isArray(value)) {
                return false; //this value is valid
            }
            else if (allowedTypes.includes("null") && value === null) {
                return false; //this value is valid
            }
            else if (allowedTypes.includes("other")) {
                return false; //this value is valid
            }
            else {
                return true; //this value is invalid
            }
        });
    }
    /**Check this array for doubles */
    #arrayHasDoubles(array) {
        const alreadyFound = [];
        let hasDoubles = false;
        array.forEach((value) => {
            if (alreadyFound.includes(value))
                hasDoubles = true;
            else
                alreadyFound.push(value);
        });
        return hasDoubles;
    }
}
exports.ODCheckerArrayStructure = ODCheckerArrayStructure;
/**## ODCheckerNullStructure `class`
 * This is an Open Ticket config checker structure.
 *
 * This class will check for a null variable in a config file, customise it in the settings!
 */
class ODCheckerNullStructure extends ODCheckerStructure {
    constructor(id, options) {
        super(id, options);
    }
    check(checker, value, locationTrace) {
        const lt = checker.locationTraceDeref(locationTrace);
        //check type & options
        if (typeof this.options.nullAllowed != "undefined" && !this.options.nullAllowed && value == null) {
            checker.createMessage("opendiscord:null-invalid", "error", "This property can't be null!", lt, null, [], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (value !== null) {
            checker.createMessage("opendiscord:invalid-type", "error", "This property needs to be the type: null!", lt, null, ["null"], this.id, (this.options.docs ?? null));
            return false;
        }
        else
            return super.check(checker, value, locationTrace);
    }
}
exports.ODCheckerNullStructure = ODCheckerNullStructure;
/**## ODCheckerTypeSwitchStructure `class`
 * This is an Open Ticket config checker structure.
 *
 * This class will switch checkers based on the type of the variable in a config file, customise it in the settings!
 */
class ODCheckerTypeSwitchStructure extends ODCheckerStructure {
    constructor(id, options) {
        super(id, options);
    }
    check(checker, value, locationTrace) {
        const lt = checker.locationTraceDeref(locationTrace);
        if (this.options.all) {
            return this.options.all.check(checker, value, lt);
        }
        else if (this.options.string && typeof value == "string") {
            return this.options.string.check(checker, value, lt);
        }
        else if (this.options.number && typeof value == "number") {
            return this.options.number.check(checker, value, lt);
        }
        else if (this.options.boolean && typeof value == "boolean") {
            return this.options.boolean.check(checker, value, lt);
        }
        else if (this.options.array && Array.isArray(value)) {
            return this.options.array.check(checker, value, lt);
        }
        else if (this.options.null && value === null) {
            return this.options.null.check(checker, value, lt);
        }
        else if (this.options.object && typeof value == "object") {
            return this.options.object.check(checker, value, lt);
        }
        else if (this.options.other) {
            return this.options.other.check(checker, value, lt);
        }
        else if (this.options.allowedTypes && this.options.allowedTypes.length > 0) {
            checker.createMessage("opendiscord:switch-invalid-type", "error", `This needs to be one of the following types: ${this.options.allowedTypes.join(", ")}!`, lt, null, [this.options.allowedTypes.join(", ")], this.id, (this.options.docs ?? null));
            return false;
        }
        else
            return super.check(checker, value, locationTrace);
    }
}
exports.ODCheckerTypeSwitchStructure = ODCheckerTypeSwitchStructure;
/**## ODCheckerObjectSwitchStructure `class`
 * This is an Open Ticket config checker structure.
 *
 * This class will switch object checkers based on a variable match in one of the objects, customise it in the settings!
 */
class ODCheckerObjectSwitchStructure extends ODCheckerStructure {
    constructor(id, options) {
        super(id, options);
    }
    check(checker, value, locationTrace) {
        const lt = checker.locationTraceDeref(locationTrace);
        if (this.options.objects) {
            //check type & options
            if (typeof value != "object") {
                checker.createMessage("opendiscord:invalid-type", "error", "This property needs to be the type: object!", lt, null, ["object"], this.id, (this.options.docs ?? null));
                return false;
            }
            //sort objects
            const sortedObjects = this.options.objects.sort((a, b) => {
                if (a.priority < b.priority)
                    return -1;
                else if (a.priority > b.priority)
                    return 1;
                else
                    return 0;
            });
            //check objects
            let localQuit = false;
            let didSelectObject = false;
            sortedObjects.forEach((obj) => {
                if (!obj.properties.some((p) => value[p.key] !== p.value)) {
                    didSelectObject = true;
                    if (!obj.checker.check(checker, value, lt))
                        localQuit = true;
                }
            });
            //do local quit or check custom function
            if (!didSelectObject) {
                checker.createMessage("opendiscord:object-switch-invalid-type", "error", `This object needs to be one of the following types: ${this.options.objects.map((obj) => obj.name).join(", ")}!`, lt, null, [this.options.objects.map((obj) => obj.name).join(", ")], this.id, (this.options.docs ?? null));
                return false;
            }
            else if (localQuit) {
                return false;
            }
            else
                return super.check(checker, value, locationTrace);
        }
        else
            return super.check(checker, value, locationTrace);
    }
}
exports.ODCheckerObjectSwitchStructure = ODCheckerObjectSwitchStructure;
/**## ODCheckerEnabledObjectStructure `class`
 * This is an Open Ticket config checker structure.
 *
 * This class will enable an object checker based on a variable match in the object, customise it in the settings!
 */
class ODCheckerEnabledObjectStructure extends ODCheckerStructure {
    constructor(id, options) {
        super(id, options);
    }
    check(checker, value, locationTrace) {
        const lt = checker.locationTraceDeref(locationTrace);
        if (typeof value != "object") {
            //value isn't an object
            checker.createMessage("opendiscord:invalid-type", "error", "This property needs to be the type: object!", lt, null, ["object"], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (this.options.property && typeof value[this.options.property] == "undefined") {
            //property doesn't exist
            checker.createMessage("opendiscord:property-missing", "error", `The property "${this.options.property}" is mising from this object!`, lt, null, [`"${this.options.property}"`], this.id, (this.options.docs ?? null));
            return false;
        }
        else if (this.options.property && value[this.options.property] === (typeof this.options.enabledValue == "undefined" ? true : this.options.enabledValue)) {
            //this object is enabled
            if (this.options.checker)
                return this.options.checker.check(checker, value, lt);
            else
                return super.check(checker, value, locationTrace);
        }
        else {
            //this object is disabled
            if (this.options.property)
                checker.createMessage("opendiscord:object-disabled", "info", `This object is disabled, enable it using "${this.options.property}"!`, lt, null, [`"${this.options.property}"`], this.id, (this.options.docs ?? null));
            return super.check(checker, value, locationTrace);
        }
    }
}
exports.ODCheckerEnabledObjectStructure = ODCheckerEnabledObjectStructure;
/**## ODCheckerCustomStructure_DiscordId `class`
 * This is an Open Ticket custom checker structure.
 *
 * This class extends a primitive config checker & adds another layer of checking in the `custom` function.
 * You can compare it to a blueprint for a specific checker.
 *
 * **This custom checker is made for discord ids (channel, user, role, ...)**
 */
class ODCheckerCustomStructure_DiscordId extends ODCheckerStringStructure {
    /**The type of id (used in rendering) */
    type;
    /**Is this id allowed to be empty */
    emptyAllowed;
    /**Extra matches (value will also be valid when one of these options match) */
    extraOptions;
    constructor(id, type, emptyAllowed, extraOptions, options) {
        //add premade custom structure checker
        const newOptions = options ?? {};
        newOptions.custom = (checker, value, locationTrace, locationId, locationDocs) => {
            const lt = checker.locationTraceDeref(locationTrace);
            if (typeof value != "string")
                return false;
            // Allow empty value if emptyAllowed
            if (emptyAllowed && value.trim().length == 0)
                return true;
            // Check if it's one of the extra options (exact full-value match)
            if (extraOptions.length > 0 && extraOptions.some((opt) => opt == value))
                return true;
            // Support comma-separated role IDs — split and validate each individually
            const ids = value.split(",").map(id => id.trim()).filter(id => id.length > 0);
            if (ids.length === 0) {
                if (emptyAllowed)
                    return true;
                if (extraOptions.length > 0)
                    checker.createMessage("opendiscord:discord-invalid-id-options", "error", `This is an invalid discord ${type} id! You can also use one of these: ${extraOptions.join(", ")}!`, lt, null, [type, extraOptions.join(", ")], this.id, (this.options.docs ?? null));
                else
                    checker.createMessage("opendiscord:discord-invalid-id", "error", `This is an invalid discord ${type} id!`, lt, null, [type], this.id, (this.options.docs ?? null));
                return false;
            }
            for (const id of ids) {
                // Allow individual id to be one of the extra options
                if (extraOptions.length > 0 && extraOptions.some((opt) => opt == id))
                    continue;
                // Validate as a Discord snowflake ID (15-50 digits)
                if (id.length < 15 || id.length > 50 || !/^[0-9]+$/.test(id)) {
                    if (extraOptions.length > 0)
                        checker.createMessage("opendiscord:discord-invalid-id-options", "error", `This is an invalid discord ${type} id! You can also use one of these: ${extraOptions.join(", ")}!`, lt, null, [type, extraOptions.join(", ")], this.id, (this.options.docs ?? null));
                    else
                        checker.createMessage("opendiscord:discord-invalid-id", "error", `This is an invalid discord ${type} id!`, lt, null, [type], this.id, (this.options.docs ?? null));
                    return false;
                }
            }
            return true;
        };
        super(id, newOptions);
        this.type = type;
        this.emptyAllowed = emptyAllowed;
        this.extraOptions = extraOptions;
    }
}
exports.ODCheckerCustomStructure_DiscordId = ODCheckerCustomStructure_DiscordId;
/**## ODCheckerCustomStructure_DiscordIdArray `class`
 * This is an Open Ticket custom checker structure.
 *
 * This class extends a primitive config checker & adds another layer of checking in the `custom` function.
 * You can compare it to a blueprint for a specific checker.
 *
 * **This custom checker is made for discord id arrays (channel, user, role, ...)**
 */
class ODCheckerCustomStructure_DiscordIdArray extends ODCheckerArrayStructure {
    /**The type of id (used in rendering) */
    type;
    /**Extra matches (value will also be valid when one of these options match) */
    extraOptions;
    constructor(id, type, extraOptions, options, idOptions) {
        //add premade custom structure checker
        const newOptions = options ?? {};
        newOptions.propertyChecker = new ODCheckerCustomStructure_DiscordId(id, type, false, extraOptions, idOptions);
        super(id, newOptions);
        this.type = type;
        this.extraOptions = extraOptions;
    }
}
exports.ODCheckerCustomStructure_DiscordIdArray = ODCheckerCustomStructure_DiscordIdArray;
/**## ODCheckerCustomStructure_DiscordToken `class`
 * This is an Open Ticket custom checker structure.
 *
 * This class extends a primitive config checker & adds another layer of checking in the `custom` function.
 * You can compare it to a blueprint for a specific checker.
 *
 * **This custom checker is made for a discord (auth) token**
 */
class ODCheckerCustomStructure_DiscordToken extends ODCheckerStringStructure {
    constructor(id, options) {
        //add premade custom structure checker
        const newOptions = options ?? {};
        newOptions.custom = (checker, value, locationTrace, locationId, locationDocs) => {
            const lt = checker.locationTraceDeref(locationTrace);
            if (typeof value != "string" || !/^[A-Za-z0-9-_\.]+$/.test(value)) {
                checker.createMessage("opendiscord:discord-invalid-token", "error", "This is an invalid discord token (syntactically)!", lt, null, [], this.id, (this.options.docs ?? null));
                return false;
            }
            return true;
        };
        super(id, newOptions);
    }
}
exports.ODCheckerCustomStructure_DiscordToken = ODCheckerCustomStructure_DiscordToken;
/**## ODCheckerCustomStructure_DiscordToken `class`
 * This is an Open Ticket custom checker structure.
 *
 * This class extends a primitive config checker & adds another layer of checking in the `custom` function.
 * You can compare it to a blueprint for a specific checker.
 *
 * **This custom checker is made for a hex color**
 */
class ODCheckerCustomStructure_HexColor extends ODCheckerStringStructure {
    /**When enabled, you are also allowed to use `#fff` instead of `#ffffff` */
    allowShortForm;
    /**Allow this hex color to be empty. */
    emptyAllowed;
    constructor(id, allowShortForm, emptyAllowed, options) {
        //add premade custom structure checker
        const newOptions = options ?? {};
        newOptions.custom = (checker, value, locationTrace, locationId, locationDocs) => {
            const lt = checker.locationTraceDeref(locationTrace);
            if (typeof value != "string")
                return false;
            else if (emptyAllowed && value.length == 0) {
                return true;
            }
            else if ((!allowShortForm && !/^#[a-fA-F0-9]{6}$/.test(value)) || (allowShortForm && !/^#[a-fA-F0-9]{6}$/.test(value) && !/^#[a-fA-F0-9]{3}$/.test(value))) {
                checker.createMessage("opendiscord:color-invalid", "error", "This is an invalid hex color!", lt, null, [], this.id, (this.options.docs ?? null));
                return false;
            }
            else
                return true;
        };
        super(id, newOptions);
        this.allowShortForm = allowShortForm;
        this.emptyAllowed = emptyAllowed;
    }
}
exports.ODCheckerCustomStructure_HexColor = ODCheckerCustomStructure_HexColor;
/**## ODCheckerCustomStructure_EmojiString `class`
 * This is an Open Ticket custom checker structure.
 *
 * This class extends a primitive config checker & adds another layer of checking in the `custom` function.
 * You can compare it to a blueprint for a specific checker.
 *
 * **This custom checker is made for an emoji (string)**
 */
class ODCheckerCustomStructure_EmojiString extends ODCheckerStringStructure {
    /**The minimum amount of emojis required (0 to allow empty) */
    minLength;
    /**The maximum amount of emojis allowed */
    maxLength;
    /**Allow custom discord emoji ids (`<:12345678910:emoji_name>`) */
    allowCustomDiscordEmoji;
    constructor(id, minLength, maxLength, allowCustomDiscordEmoji, options) {
        //add premade custom structure checker
        const newOptions = options ?? {};
        newOptions.custom = (checker, value, locationTrace, locationId, locationDocs) => {
            const lt = checker.locationTraceDeref(locationTrace);
            if (typeof value != "string")
                return false;
            const discordEmojiSplitter = /(?:<a?:[^:]*:[0-9]+>)/g;
            const splitted = value.split(discordEmojiSplitter);
            const discordEmojiAmount = splitted.length - 1;
            const unicodeEmojiAmount = [...new Intl.Segmenter().segment(splitted.join(""))].length;
            const emojiAmount = discordEmojiAmount + unicodeEmojiAmount;
            if (emojiAmount < minLength) {
                checker.createMessage("opendiscord:emoji-too-short", "error", `This string needs to have at least ${minLength} emoji's!`, lt, null, [maxLength.toString()], this.id, (this.options.docs ?? null));
                return false;
            }
            else if (emojiAmount > maxLength) {
                checker.createMessage("opendiscord:emoji-too-long", "error", `This string needs to have at most ${maxLength} emoji's!`, lt, null, [maxLength.toString()], this.id, (this.options.docs ?? null));
                return false;
            }
            else if (!allowCustomDiscordEmoji && /<a?:[^:]*:[0-9]+>/.test(value)) {
                checker.createMessage("opendiscord:emoji-custom", "error", `This emoji can't be a custom discord emoji!`, lt, null, [], this.id, (this.options.docs ?? null));
                return false;
            }
            else if (!/^(?:\p{Emoji}|\p{Emoji_Component}|(?:<a?:[^:]*:[0-9]+>))*$/u.test(value)) {
                checker.createMessage("opendiscord:emoji-invalid", "error", "This is an invalid emoji!", lt, null, [], this.id, (this.options.docs ?? null));
                return false;
            }
            return true;
        };
        super(id, newOptions);
        this.minLength = minLength;
        this.maxLength = maxLength;
        this.allowCustomDiscordEmoji = allowCustomDiscordEmoji;
    }
}
exports.ODCheckerCustomStructure_EmojiString = ODCheckerCustomStructure_EmojiString;
/**## ODCheckerCustomStructure_UrlString `class`
 * This is an Open Ticket custom checker structure.
 *
 * This class extends a primitive config checker & adds another layer of checking in the `custom` function.
 * You can compare it to a blueprint for a specific checker.
 *
 * **This custom checker is made for a URL (string)**
 */
class ODCheckerCustomStructure_UrlString extends ODCheckerStringStructure {
    /**The settings for this url */
    urlSettings;
    /**Is this url allowed to be empty? */
    emptyAllowed;
    constructor(id, emptyAllowed, urlSettings, options) {
        //add premade custom structure checker
        const newOptions = options ?? {};
        newOptions.custom = (checker, value, locationTrace, locationId, locationDocs) => {
            const lt = checker.locationTraceDeref(locationTrace);
            if (typeof value != "string")
                return false;
            else if (emptyAllowed && value.length == 0) {
                return true;
            }
            else if (!this.#urlIsValid(value)) {
                checker.createMessage("opendiscord:url-invalid", "error", "This url is invalid!", lt, null, [], this.id, (this.options.docs ?? null));
                return false;
            }
            else if (typeof this.urlSettings.allowHttp != "undefined" && !this.urlSettings.allowHttp && !/^(https:\/\/)/.test(value)) {
                checker.createMessage("opendiscord:url-invalid-http", "error", "This url can only use the https:// protocol!", lt, null, [], this.id, (this.options.docs ?? null));
                return false;
            }
            else if (!/^(http(s)?:\/\/)/.test(value)) {
                checker.createMessage("opendiscord:url-invalid-protocol", "error", "This url can only use the http:// & https:// protocols!", lt, null, [], this.id, (this.options.docs ?? null));
                return false;
            }
            else if (typeof this.urlSettings.allowedHostnames != "undefined" && !this.#urlHasValidHostname(value, this.urlSettings.allowedHostnames)) {
                checker.createMessage("opendiscord:url-invalid-hostname", "error", "This url has a disallowed hostname!", lt, null, [], this.id, (this.options.docs ?? null));
                return false;
            }
            else if (typeof this.urlSettings.allowedExtensions != "undefined" && !this.#urlHasValidExtension(value, this.urlSettings.allowedExtensions)) {
                checker.createMessage("opendiscord:url-invalid-extension", "error", `This url has an invalid extension! Choose between: ${this.urlSettings.allowedExtensions.join(", ")}!"`, lt, null, [this.urlSettings.allowedExtensions.join(", ")], this.id, (this.options.docs ?? null));
                return false;
            }
            else if (typeof this.urlSettings.allowedPaths != "undefined" && !this.#urlHasValidPath(value, this.urlSettings.allowedPaths)) {
                checker.createMessage("opendiscord:url-invalid-path", "error", "This url has an invalid path!", lt, null, [], this.id, (this.options.docs ?? null));
                return false;
            }
            else if (typeof this.urlSettings.regex != "undefined" && !this.urlSettings.regex.test(value)) {
                checker.createMessage("opendiscord:url-invalid", "error", "This url is invalid!", lt, null, [], this.id, (this.options.docs ?? null));
                return false;
            }
            else
                return true;
        };
        super(id, newOptions);
        this.urlSettings = urlSettings;
        this.emptyAllowed = emptyAllowed;
    }
    /**Check for the hostname */
    #urlHasValidHostname(url, hostnames) {
        try {
            const hostname = new URL(url).hostname;
            return hostnames.some((rule) => {
                if (typeof rule == "string") {
                    return rule == hostname;
                }
                else {
                    return rule.test(hostname);
                }
            });
        }
        catch {
            return false;
        }
    }
    /**Check for the extension */
    #urlHasValidExtension(url, extensions) {
        try {
            const path = new URL(url).pathname;
            return extensions.some((rule) => {
                return path.endsWith(rule);
            });
        }
        catch {
            return false;
        }
    }
    /**Check for the path */
    #urlHasValidPath(url, paths) {
        try {
            const path = new URL(url).pathname;
            return paths.some((rule) => {
                if (typeof rule == "string") {
                    return rule == path;
                }
                else {
                    return rule.test(path);
                }
            });
        }
        catch {
            return false;
        }
    }
    /**Do general syntax check on url */
    #urlIsValid(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.ODCheckerCustomStructure_UrlString = ODCheckerCustomStructure_UrlString;
/**## ODCheckerCustomStructure_UniqueId `class`
 * This is an Open Ticket custom checker structure.
 *
 * This class extends a primitive config checker & adds another layer of checking in the `custom` function.
 * You can compare it to a blueprint for a specific checker.
 *
 * **This custom checker is made for a unique id (per source & scope)**
 */
class ODCheckerCustomStructure_UniqueId extends ODCheckerStringStructure {
    /**The source of this unique id (generally the plugin name or `openticket`) */
    source;
    /**The scope of this unique id (id needs to be unique in this scope) */
    scope;
    constructor(id, source, scope, options) {
        //add premade custom structure checker
        const newOptions = options ?? {};
        newOptions.custom = (checker, value, locationTrace, locationId, locationDocs) => {
            const lt = checker.locationTraceDeref(locationTrace);
            if (typeof value != "string")
                return false;
            const uniqueArray = (checker.storage.get(source, scope) === null) ? [] : checker.storage.get(source, scope);
            if (uniqueArray.includes(value)) {
                //unique id already exists => throw error
                checker.createMessage("opendiscord:id-not-unique", "error", "This id isn't unique, use another id instead!", lt, null, [], this.id, (this.options.docs ?? null));
                return false;
            }
            else {
                //unique id doesn't exists => add to list
                uniqueArray.push(value);
                checker.storage.set(source, scope, uniqueArray);
                return true;
            }
        };
        super(id, newOptions);
        this.source = source;
        this.scope = scope;
    }
}
exports.ODCheckerCustomStructure_UniqueId = ODCheckerCustomStructure_UniqueId;
/**## ODCheckerCustomStructure_UniqueIdArray `class`
 * This is an Open Ticket custom checker structure.
 *
 * This class extends a primitive config checker & adds another layer of checking in the `custom` function.
 * You can compare it to a blueprint for a specific checker.
 *
 * **This custom checker is made for a unique id array (per source & scope)**
 */
class ODCheckerCustomStructure_UniqueIdArray extends ODCheckerArrayStructure {
    /**The source to read unique ids (generally the plugin name or `openticket`) */
    source;
    /**The scope to read unique ids (id needs to be unique in this scope) */
    scope;
    /**The scope to push unique ids when used in this array! */
    usedScope;
    constructor(id, source, scope, usedScope, options, idOptions) {
        //add premade custom structure checker
        const newOptions = options ?? {};
        newOptions.propertyChecker = new ODCheckerStringStructure("opendiscord:unique-id", { ...(idOptions ?? {}), minLength: 1, custom: (checker, value, locationTrace, locationId, locationDocs) => {
                if (typeof value != "string")
                    return false;
                const localLt = checker.locationTraceDeref(locationTrace);
                localLt.pop();
                const uniqueArray = checker.storage.get(source, scope) ?? [];
                if (uniqueArray.includes(value)) {
                    //exists
                    if (usedScope) {
                        const current = checker.storage.get(source, usedScope) ?? [];
                        current.push(value);
                        checker.storage.set(source, usedScope, current);
                    }
                    return true;
                }
                else {
                    //doesn't exist
                    checker.createMessage("opendiscord:id-non-existent", "error", `The id "${value}" doesn't exist!`, localLt, null, [`"${value}"`], locationId, locationDocs);
                    return false;
                }
            } });
        super(id, newOptions);
        this.source = source;
        this.scope = scope;
        this.usedScope = usedScope ?? null;
    }
}
exports.ODCheckerCustomStructure_UniqueIdArray = ODCheckerCustomStructure_UniqueIdArray;
/*TEMPLATE!!!!
export interface ODCheckerTemplateStructureOptions extends ODCheckerStructureOptions {
    
}
export class ODCheckerTemplateStructure extends ODCheckerStructure {
    declare options: ODCheckerTemplateStructureOptions

    constructor(id:ODValidId, options:ODCheckerTemplateStructureOptions){
        super(id,options)
    }

    check(checker:ODChecker, value:any, locationTrace:ODCheckerLocationTrace): boolean {
        const lt = checker.locationTraceDeref(locationTrace)
        
        return super.check(checker,value,locationTrace)
    }
}
*/
/*CUSTOM TEMPLATE!!!!
export class ODCheckerCustomStructure_Template extends ODCheckerTemplateStructure {
    idk: string

    constructor(id:ODValidId, idk:string, options?:ODCheckerStringStructureOptions){
        //add premade custom structure checker
        const newOptions = options ?? {}
        newOptions.custom = (checker,value,locationTrace,locationId,locationDocs) => {
            const lt = checker.locationTraceDeref(locationTrace)

            //do custom check & push error message. Return true if correct
            return boolean
        }
        super(id,newOptions)
        this.idk = idk
    }
}
*/
