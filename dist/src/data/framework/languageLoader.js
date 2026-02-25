"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAllLanguages = void 0;
const index_1 = require("../../index");
/** (CONTRIBUTOR GUIDE) HOW TO ADD NEW LANGUAGES?
 * - Add the file to (./languages/) and make sure the metadata is valid.
 * - Register the language in loadAllLanguages() in (./src/data/framework/languageLoader.ts).
 * - Add autocomplete for the language in ODLanguageManagerIds_Default in (./src/core/api/defaults/language.ts).
 * - Update the language list in the README.md translator list.
 * - Update the 2 language counters in the README.md features list.
 * - Update the Open Ticket Documentation.
 */
const loadAllLanguages = async () => {
    //register languages
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:custom", "custom.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:english", "english.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:dutch", "dutch.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:portuguese", "portuguese.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:czech", "czech.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:german", "german.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:catalan", "catalan.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:hungarian", "hungarian.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:spanish", "spanish.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:romanian", "romanian.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:ukrainian", "ukrainian.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:indonesian", "indonesian.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:italian", "italian.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:estonian", "estonian.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:finnish", "finnish.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:danish", "danish.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:thai", "thai.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:turkish", "turkish.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:french", "french.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:arabic", "arabic.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:hindi", "hindi.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:lithuanian", "lithuanian.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:polish", "polish.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:latvian", "latvian.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:norwegian", "norwegian.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:russian", "russian.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:swedish", "swedish.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:vietnamese", "vietnamese.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:persian", "persian.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:bengali", "bengali.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:greek", "greek.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:japanese", "japanese.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:korean", "korean.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:kurdish", "kurdish.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:simplified-chinese", "simplified-chinese.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:slovenian", "slovenian.json"));
    index_1.opendiscord.languages.add(new index_1.api.ODJsonLanguage("opendiscord:tamil", "tamil.json"));
};
exports.loadAllLanguages = loadAllLanguages;
