import { ODManager, ODManagerData, ODPromiseVoid, ODValidId } from "./base";
import { ODDebugger } from "./console";
/**## ODLanguageMetadata `interface`
 * This interface contains all metadata available in the language files.
 */
export interface ODLanguageMetadata {
    /**The version of Open Ticket this translation is made for. */
    otversion: string;
    /**The name of the language in english (with capital letter). */
    language: string;
    /**A list of translators (discord/github username) who've contributed to this language. */
    translators: string[];
    /**The last date that this translation has been modified (format: DD/MM/YYYY) */
    lastedited: string;
    /**When `true`, the translator made use of some sort of automation while creating the translation. (e.g. ChatGPT, Google Translate, DeepL, ...) */
    automated: boolean;
}
/**## ODLanguageManager `class`
 * This is an Open Ticket language manager.
 *
 * It manages all languages in the bot and manages translation for you!
 * Get a translation via the `getTranslation()` or `getTranslationWithParams()` methods.
 *
 * Add new languages using the `ODlanguage` class in your plugin!
 */
export declare class ODLanguageManager extends ODManager<ODLanguage> {
    #private;
    /**The currently selected language. */
    current: ODLanguage | null;
    /**The currently selected backup language. (used when translation missing in current language) */
    backup: ODLanguage | null;
    constructor(debug: ODDebugger, presets: boolean);
    /**Set the current language by providing the ID of a language which is registered in this manager. */
    setCurrentLanguage(id: ODValidId): void;
    /**Get the current language (same as `this.current`) */
    getCurrentLanguage(): ODLanguage | null;
    /**Set the backup language by providing the ID of a language which is registered in this manager. */
    setBackupLanguage(id: ODValidId): void;
    /**Get the backup language (same as `this.backup`) */
    getBackupLanguage(): ODLanguage | null;
    /**Get the metadata of the current/backup language. */
    getLanguageMetadata(frombackup?: boolean): ODLanguageMetadata | null;
    /**Get the ID (string) of the current language. (Not backup language) */
    getCurrentLanguageId(): string;
    /**Get a translation string by JSON location. (e.g. `"checker.system.typeError"`) */
    getTranslation(id: string): string | null;
    /**Get a backup translation string by JSON location and replace `{0}`,`{1}`,`{2}`,... with the provided parameters. */
    getTranslationWithParams(id: string, params: string[]): string | null;
    /**Init all language files. */
    init(): Promise<void>;
}
/**## ODLanguage `class`
 * This is an Open Ticket language file.
 *
 * It contains metadata and all translation strings available in this language.
 * Register this class to an `ODLanguageManager` to use it!
 *
 * JSON languages should be created using the `ODJsonLanguage` class instead!
 */
export declare class ODLanguage extends ODManagerData {
    /**The name of the file with extension. */
    file: string;
    /**The path to the file relative to the main directory. */
    path: string;
    /**The raw object data of the translation. */
    data: any;
    /**The metadata of the language if available. */
    metadata: ODLanguageMetadata | null;
    constructor(id: ODValidId, data: any);
    /**Init the language. */
    init(): ODPromiseVoid;
}
/**## ODJsonLanguage `class`
 * This is an Open Ticket JSON language file.
 *
 * It contains metadata and all translation strings from a certain JSON file (in `./languages/`).
 * Register this class to an `ODLanguageManager` to use it!
 *
 * Use the `ODLanguage` class to use translations from non-JSON files!
 */
export declare class ODJsonLanguage extends ODLanguage {
    constructor(id: ODValidId, file: string, customPath?: string);
    /**Init the langauge. */
    init(): ODPromiseVoid;
}
