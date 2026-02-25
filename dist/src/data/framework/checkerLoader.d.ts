import { api } from "../../index";
/** (CONTRIBUTOR GUIDE) HOW TO ADD NEW CONFIG VARIABLES?
 * - Make the change to the config file in (./config/) and be aware of the following things:
 *      - The variable has a clear name and its function is obvious.
 *      - The variable is in the correct position/category of the config.
 *      - The variable contains a default placeholder to suggest the contents.
 *      - If there's a (./devconfig/), also modify this file.
 * - Register the config in loadAllConfigs() in (./src/data/framework/configLoader.ts)
 *      - The variable should be added to the "formatters" in the correct position.
 * - Add autocomplete for the variable in ODJsonConfig_Default... in (./src/core/api/defaults/config.ts)
 * - Add the variable to the config checker in (./src/data/framework/checkerLoader.ts)
 *      - Make sure the variable is compatible with the Interactive Setup CLI.
 * - The variable should be added by the migration manager (./src/core/startup/migration.ts) when missing.
 * - Update the Open Ticket Documentation.
 *
 * IF VARIABLE IS FROM questions.json, options.json OR panels.json:
 * - Check (./src/data/openticket/...) for loading/unloading of data.
 * - Check (./src/actions/createTicket.ts) and related files.
 * - Check (./src/builders), (./src/actions), (./src/data) & (./src/commands) in general in the areas that were changed.
 */
export declare const loadAllConfigCheckers: () => Promise<void>;
export declare const loadAllConfigCheckerFunctions: () => Promise<void>;
export declare const loadAllConfigCheckerTranslations: () => Promise<void>;
export declare const registerDefaultCheckerSystemTranslations: (tm: api.ODCheckerTranslationRegister_Default, lm: api.ODLanguageManager_Default) => void;
export declare const registerDefaultCheckerMessageTranslations: (tm: api.ODCheckerTranslationRegister_Default, lm: api.ODLanguageManager_Default) => void;
export declare const registerDefaultCheckerCustomTranslations: (tm: api.ODCheckerTranslationRegister_Default, lm: api.ODLanguageManager_Default) => void;
export declare const defaultGeneralStructure: api.ODCheckerObjectStructure;
export declare const defaultOptionsStructure: api.ODCheckerArrayStructure;
export declare const defaultPanelsStructure: api.ODCheckerArrayStructure;
export declare const defaultQuestionsStructure: api.ODCheckerArrayStructure;
export declare const defaultTranscriptsStructure: api.ODCheckerObjectStructure;
export declare const defaultUnusedOptionsFunction: (manager: api.ODCheckerManager, functions: api.ODCheckerFunctionManager) => api.ODCheckerResult;
export declare const defaultUnusedQuestionsFunction: (manager: api.ODCheckerManager, functions: api.ODCheckerFunctionManager) => api.ODCheckerResult;
export declare const defaultDropdownOptionsFunction: (manager: api.ODCheckerManager, functions: api.ODCheckerFunctionManager) => api.ODCheckerResult;
