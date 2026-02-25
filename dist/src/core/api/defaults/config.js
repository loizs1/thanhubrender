"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODJsonConfig_DefaultTranscripts = exports.ODJsonConfig_DefaultQuestions = exports.ODJsonConfig_DefaultPanels = exports.ODJsonConfig_DefaultOptions = exports.ODJsonConfig_DefaultGeneral = exports.ODConfigManager_Default = void 0;
const config_1 = require("../modules/config");
/**## ODConfigManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODConfigManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.configs`!
 */
class ODConfigManager_Default extends config_1.ODConfigManager {
    get(id) {
        return super.get(id);
    }
    remove(id) {
        return super.remove(id);
    }
    exists(id) {
        return super.exists(id);
    }
}
exports.ODConfigManager_Default = ODConfigManager_Default;
/**## ODJsonConfig_DefaultGeneral `default_class`
 * This is a special class that adds type definitions & typescript to the ODJsonConfig class.
 * It doesn't add any extra features!
 *
 * This default class is made for the `general.json` config!
 */
class ODJsonConfig_DefaultGeneral extends config_1.ODJsonConfig {
}
exports.ODJsonConfig_DefaultGeneral = ODJsonConfig_DefaultGeneral;
/**## ODJsonConfig_DefaultOptions `default_class`
 * This is a special class that adds type definitions & typescript to the ODJsonConfig class.
 * It doesn't add any extra features!
 *
 * This default class is made for the `options.json` config!
 */
class ODJsonConfig_DefaultOptions extends config_1.ODJsonConfig {
}
exports.ODJsonConfig_DefaultOptions = ODJsonConfig_DefaultOptions;
/**## ODJsonConfig_DefaultPanels `default_class`
 * This is a special class that adds type definitions & typescript to the ODJsonConfig class.
 * It doesn't add any extra features!
 *
 * This default class is made for the `panels.json` config!
 */
class ODJsonConfig_DefaultPanels extends config_1.ODJsonConfig {
}
exports.ODJsonConfig_DefaultPanels = ODJsonConfig_DefaultPanels;
/**## ODJsonConfig_DefaultQuestions `default_class`
 * This is a special class that adds type definitions & typescript to the ODJsonConfig class.
 * It doesn't add any extra features!
 *
 * This default class is made for the `questions.json` config!
 */
class ODJsonConfig_DefaultQuestions extends config_1.ODJsonConfig {
}
exports.ODJsonConfig_DefaultQuestions = ODJsonConfig_DefaultQuestions;
/**## ODJsonConfig_DefaultTranscripts `default_class`
 * This is a special class that adds type definitions & typescript to the ODJsonConfig class.
 * It doesn't add any extra features!
 *
 * This default class is made for the `transcripts.json` config!
 */
class ODJsonConfig_DefaultTranscripts extends config_1.ODJsonConfig {
}
exports.ODJsonConfig_DefaultTranscripts = ODJsonConfig_DefaultTranscripts;
