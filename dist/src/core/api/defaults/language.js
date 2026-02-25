"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODLanguageManager_Default = void 0;
const language_1 = require("../modules/language");
/**## ODLanguageManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODLanguageManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.languages`!
 */
class ODLanguageManager_Default extends language_1.ODLanguageManager {
    get(id) {
        return super.get(id);
    }
    remove(id) {
        return super.remove(id);
    }
    exists(id) {
        return super.exists(id);
    }
    getTranslation(id) {
        return super.getTranslation(id);
    }
    setCurrentLanguage(id) {
        return super.setCurrentLanguage(id);
    }
    setBackupLanguage(id) {
        return super.setBackupLanguage(id);
    }
    getTranslationWithParams(id, params) {
        return super.getTranslationWithParams(id, params);
    }
}
exports.ODLanguageManager_Default = ODLanguageManager_Default;
