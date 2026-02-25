/** (CONTRIBUTOR GUIDE) HOW TO ADD NEW LANGUAGES?
 * - Add the file to (./languages/) and make sure the metadata is valid.
 * - Register the language in loadAllLanguages() in (./src/data/framework/languageLoader.ts).
 * - Add autocomplete for the language in ODLanguageManagerIds_Default in (./src/core/api/defaults/language.ts).
 * - Update the language list in the README.md translator list.
 * - Update the 2 language counters in the README.md features list.
 * - Update the Open Ticket Documentation.
 */
export declare const loadAllLanguages: () => Promise<void>;
