"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODJsonLanguage = exports.ODLanguage = exports.ODLanguageManager = void 0;
///////////////////////////////////////
//LANGUAGE MODULE
///////////////////////////////////////
const base_1 = require("./base");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/**## ODLanguageManager `class`
 * This is an Open Ticket language manager.
 *
 * It manages all languages in the bot and manages translation for you!
 * Get a translation via the `getTranslation()` or `getTranslationWithParams()` methods.
 *
 * Add new languages using the `ODlanguage` class in your plugin!
 */
class ODLanguageManager extends base_1.ODManager {
    /**The currently selected language. */
    current = null;
    /**The currently selected backup language. (used when translation missing in current language) */
    backup = null;
    /**An alias to Open Ticket debugger. */
    #debug;
    constructor(debug, presets) {
        super(debug, "language");
        if (presets)
            this.add(new ODLanguage("english", "english.json"));
        this.current = presets ? new ODLanguage("english", "english.json") : null;
        this.backup = presets ? new ODLanguage("english", "english.json") : null;
        this.#debug = debug;
    }
    /**Set the current language by providing the ID of a language which is registered in this manager. */
    setCurrentLanguage(id) {
        this.current = this.get(id);
        const languageId = this.current?.id.value ?? "<unknown-id>";
        const languageAutomated = this.current?.metadata?.automated.toString() ?? "<unknown-metadata>";
        this.#debug.debug("Selected current language", [
            { key: "id", value: languageId },
            { key: "automated", value: languageAutomated },
        ]);
    }
    /**Get the current language (same as `this.current`) */
    getCurrentLanguage() {
        return (this.current) ? this.current : null;
    }
    /**Set the backup language by providing the ID of a language which is registered in this manager. */
    setBackupLanguage(id) {
        this.backup = this.get(id);
        const languageId = this.backup?.id.value ?? "<unknown-id>";
        const languageAutomated = this.backup?.metadata?.automated.toString() ?? "<unknown-metadata>";
        this.#debug.debug("Selected backup language", [
            { key: "id", value: languageId },
            { key: "automated", value: languageAutomated },
        ]);
    }
    /**Get the backup language (same as `this.backup`) */
    getBackupLanguage() {
        return (this.backup) ? this.backup : null;
    }
    /**Get the metadata of the current/backup language. */
    getLanguageMetadata(frombackup) {
        if (frombackup)
            return (this.backup) ? this.backup.metadata : null;
        return (this.current) ? this.current.metadata : null;
    }
    /**Get the ID (string) of the current language. (Not backup language) */
    getCurrentLanguageId() {
        return (this.current) ? this.current.id.value : "";
    }
    /**Get a translation string by JSON location. (e.g. `"checker.system.typeError"`) */
    getTranslation(id) {
        if (!this.current)
            return this.#getBackupTranslation(id);
        const splitted = id.split(".");
        let currentObject = this.current.data;
        let result = false;
        splitted.forEach((id) => {
            if (typeof currentObject[id] == "object") {
                currentObject = currentObject[id];
            }
            else if (typeof currentObject[id] == "string") {
                result = currentObject[id];
            }
        });
        if (typeof result == "string")
            return result;
        else
            return this.#getBackupTranslation(id);
    }
    /**Get a backup  translation string by JSON location. (system only) */
    #getBackupTranslation(id) {
        if (!this.backup)
            return null;
        const splitted = id.split(".");
        let currentObject = this.backup.data;
        let result = false;
        splitted.forEach((id) => {
            if (typeof currentObject[id] == "object") {
                currentObject = currentObject[id];
            }
            else if (typeof currentObject[id] == "string") {
                result = currentObject[id];
            }
        });
        if (typeof result == "string")
            return result;
        else
            return null;
    }
    /**Get a backup translation string by JSON location and replace `{0}`,`{1}`,`{2}`,... with the provided parameters. */
    getTranslationWithParams(id, params) {
        let translation = this.getTranslation(id);
        if (!translation)
            return translation;
        params.forEach((value, index) => {
            if (!translation)
                return;
            translation = translation.replace(`{${index}}`, value);
        });
        return translation;
    }
    /**Init all language files. */
    async init() {
        for (const language of this.getAll()) {
            try {
                await language.init();
            }
            catch (err) {
                process.emit("uncaughtException", new base_1.ODSystemError(err));
            }
        }
    }
}
exports.ODLanguageManager = ODLanguageManager;
/**## ODLanguage `class`
 * This is an Open Ticket language file.
 *
 * It contains metadata and all translation strings available in this language.
 * Register this class to an `ODLanguageManager` to use it!
 *
 * JSON languages should be created using the `ODJsonLanguage` class instead!
 */
class ODLanguage extends base_1.ODManagerData {
    /**The name of the file with extension. */
    file = "";
    /**The path to the file relative to the main directory. */
    path = "";
    /**The raw object data of the translation. */
    data;
    /**The metadata of the language if available. */
    metadata = null;
    constructor(id, data) {
        super(id);
        this.data = data;
    }
    /**Init the language. */
    init() {
        //nothing
    }
}
exports.ODLanguage = ODLanguage;
/**## ODJsonLanguage `class`
 * This is an Open Ticket JSON language file.
 *
 * It contains metadata and all translation strings from a certain JSON file (in `./languages/`).
 * Register this class to an `ODLanguageManager` to use it!
 *
 * Use the `ODLanguage` class to use translations from non-JSON files!
 */
class ODJsonLanguage extends ODLanguage {
    constructor(id, file, customPath) {
        super(id, {});
        this.file = (file.endsWith(".json")) ? file : file + ".json";
        this.path = customPath ? path_1.default.join("./", customPath, this.file) : path_1.default.join("./languages/", this.file);
    }
    /**Init the langauge. */
    init() {
        if (!fs_1.default.existsSync(this.path))
            throw new base_1.ODSystemError("Unable to parse language \"" + path_1.default.join("./", this.path) + "\", the file doesn't exist!");
        try {
            this.data = JSON.parse(fs_1.default.readFileSync(this.path).toString());
        }
        catch (err) {
            process.emit("uncaughtException", err);
            throw new base_1.ODSystemError("Unable to parse language \"" + path_1.default.join("./", this.path) + "\"!");
        }
        if (this.data["_TRANSLATION"])
            this.metadata = this.data["_TRANSLATION"];
    }
}
exports.ODJsonLanguage = ODJsonLanguage;
