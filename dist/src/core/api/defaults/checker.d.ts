import { ODLanguageManager_Default } from "../api";
import { ODValidId } from "../modules/base";
import { ODCheckerManager, ODChecker, ODCheckerTranslationRegister, ODCheckerRenderer, ODCheckerFunctionManager, ODCheckerResult, ODCheckerFunction } from "../modules/checker";
/**## ODCheckerManagerIds_Default `interface`
 * This interface is a list of ids available in the `ODCheckerManager_Default` class.
 * It's used to generate typescript declarations for this class.
 */
export interface ODCheckerManagerIds_Default {
    "opendiscord:general": ODChecker;
    "opendiscord:questions": ODChecker;
    "opendiscord:options": ODChecker;
    "opendiscord:panels": ODChecker;
    "opendiscord:transcripts": ODChecker;
}
/**## ODCheckerManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODCheckerManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.checkers`!
 */
export declare class ODCheckerManager_Default extends ODCheckerManager {
    translation: ODCheckerTranslationRegister_Default;
    renderer: ODCheckerRenderer_Default;
    functions: ODCheckerFunctionManager_Default;
    get<CheckerId extends keyof ODCheckerManagerIds_Default>(id: CheckerId): ODCheckerManagerIds_Default[CheckerId];
    get(id: ODValidId): ODChecker | null;
    remove<CheckerId extends keyof ODCheckerManagerIds_Default>(id: CheckerId): ODCheckerManagerIds_Default[CheckerId];
    remove(id: ODValidId): ODChecker | null;
    exists(id: keyof ODCheckerManagerIds_Default): boolean;
    exists(id: ODValidId): boolean;
}
/**## ODCheckerRenderer_Default `default_class`
 * This is a special class that adds type definitions & features to the ODCheckerRenderer class.
 * It contains the code that renders the default config checker.
 *
 * This default class is made for the global variable `opendiscord.checkers.renderer`!
 */
export declare class ODCheckerRenderer_Default extends ODCheckerRenderer {
    #private;
    extraHeaderText: string[];
    extraFooterText: string[];
    extraTopText: string[];
    extraBottomText: string[];
    horizontalFiller: string;
    verticalFiller: string;
    descriptionSeparator: string;
    headerSeparator: string;
    footerTipPrefix: string;
    disableHeader: boolean;
    disableFooter: boolean;
    getComponents(compact: boolean, renderEmpty: boolean, translation: ODCheckerTranslationRegister_Default, data: ODCheckerResult): string[];
}
/**## ODCheckerTranslationRegisterOtherIds_Default `interface`
 * This interface is a list of ids available in the `ODCheckerTranslationRegister_Default` class.
 * It's used to generate typescript declarations for this class.
 */
export type ODCheckerTranslationRegisterOtherIds_Default = ("opendiscord:header-openticket" | "opendiscord:header-configchecker" | "opendiscord:header-description" | "opendiscord:type-error" | "opendiscord:type-warning" | "opendiscord:type-info" | "opendiscord:data-path" | "opendiscord:data-docs" | "opendiscord:data-message" | "opendiscord:compact-information" | "opendiscord:footer-error" | "opendiscord:footer-warning" | "opendiscord:footer-support");
/**## ODCheckerTranslationRegisterMessageIds_Default `interface`
 * This interface is a list of ids available in the `ODCheckerTranslationRegister_Default` class.
 * It's used to generate typescript declarations for this class.
 */
export type ODCheckerTranslationRegisterMessageIds_Default = ("opendiscord:invalid-type" | "opendiscord:property-missing" | "opendiscord:property-optional" | "opendiscord:object-disabled" | "opendiscord:null-invalid" | "opendiscord:switch-invalid-type" | "opendiscord:object-switch-invalid-type" | "opendiscord:string-too-short" | "opendiscord:string-too-long" | "opendiscord:string-length-invalid" | "opendiscord:string-starts-with" | "opendiscord:string-ends-with" | "opendiscord:string-contains" | "opendiscord:string-inverted-contains" | "opendiscord:string-choices" | "opendiscord:string-lowercase" | "opendiscord:string-uppercase" | "opendiscord:string-special-characters" | "opendiscord:string-no-spaces" | "opendiscord:string-regex" | "opendiscord:string-capital-word" | "opendiscord:string-capital-sentence" | "opendiscord:string-punctuation" | "opendiscord:number-nan" | "opendiscord:number-too-short" | "opendiscord:number-too-long" | "opendiscord:number-length-invalid" | "opendiscord:number-too-small" | "opendiscord:number-too-large" | "opendiscord:number-not-equal" | "opendiscord:number-step" | "opendiscord:number-step-offset" | "opendiscord:number-starts-with" | "opendiscord:number-ends-with" | "opendiscord:number-contains" | "opendiscord:number-inverted-contains" | "opendiscord:number-choices" | "opendiscord:number-float" | "opendiscord:number-negative" | "opendiscord:number-positive" | "opendiscord:number-zero" | "opendiscord:boolean-true" | "opendiscord:boolean-false" | "opendiscord:array-empty-disabled" | "opendiscord:array-empty-required" | "opendiscord:array-too-short" | "opendiscord:array-too-long" | "opendiscord:array-length-invalid" | "opendiscord:array-invalid-types" | "opendiscord:array-double" | "opendiscord:discord-invalid-id" | "opendiscord:discord-invalid-id-options" | "opendiscord:discord-invalid-token" | "opendiscord:color-invalid" | "opendiscord:emoji-too-short" | "opendiscord:emoji-too-long" | "opendiscord:emoji-custom" | "opendiscord:emoji-invalid" | "opendiscord:url-invalid" | "opendiscord:url-invalid-http" | "opendiscord:url-invalid-protocol" | "opendiscord:url-invalid-hostname" | "opendiscord:url-invalid-extension" | "opendiscord:url-invalid-path" | "opendiscord:id-not-unique" | "opendiscord:id-non-existent" | "opendiscord:invalid-language" | "opendiscord:invalid-button" | "opendiscord:unused-option" | "opendiscord:unused-question" | "opendiscord:dropdown-option");
/**## ODCheckerTranslationRegister_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODCheckerTranslationRegister class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.checkers.translation`!
 */
export declare class ODCheckerTranslationRegister_Default extends ODCheckerTranslationRegister {
    get(type: "other", id: ODCheckerTranslationRegisterOtherIds_Default): string;
    get(type: "message", id: ODCheckerTranslationRegisterMessageIds_Default): string;
    get(type: "message" | "other", id: string): string | null;
    set(type: "other", id: ODCheckerTranslationRegisterOtherIds_Default, translation: string): boolean;
    set(type: "message", id: ODCheckerTranslationRegisterMessageIds_Default, translation: string): boolean;
    set(type: "message" | "other", id: string, translation: string): boolean;
    delete(type: "other", id: ODCheckerTranslationRegisterOtherIds_Default): boolean;
    delete(type: "message", id: ODCheckerTranslationRegisterMessageIds_Default): boolean;
    delete(type: "message" | "other", id: string): boolean;
    quickTranslate(manager: ODLanguageManager_Default, translationId: string, type: "other" | "message", id: ODCheckerTranslationRegisterOtherIds_Default | ODCheckerTranslationRegisterMessageIds_Default): any;
    quickTranslate(manager: ODLanguageManager_Default, translationId: string, type: "other" | "message", id: string): any;
}
/**## ODCheckerFunctionManagerIds_Default `interface`
 * This interface is a list of ids available in the `ODCheckerFunctionManager_Default` class.
 * It's used to generate typescript declarations for this class.
 */
export interface ODCheckerFunctionManagerIds_Default {
    "opendiscord:unused-options": ODCheckerFunction;
    "opendiscord:unused-questions": ODCheckerFunction;
    "opendiscord:dropdown-options": ODCheckerFunction;
}
/**## ODCheckerFunctionManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODCheckerFunctionManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.checkers.functions`!
 */
export declare class ODCheckerFunctionManager_Default extends ODCheckerFunctionManager {
    get<CheckerFunctionId extends keyof ODCheckerFunctionManagerIds_Default>(id: CheckerFunctionId): ODCheckerFunctionManagerIds_Default[CheckerFunctionId];
    get(id: ODValidId): ODCheckerFunction | null;
    remove<CheckerFunctionId extends keyof ODCheckerFunctionManagerIds_Default>(id: CheckerFunctionId): ODCheckerFunctionManagerIds_Default[CheckerFunctionId];
    remove(id: ODValidId): ODCheckerFunction | null;
    exists(id: keyof ODCheckerFunctionManagerIds_Default): boolean;
    exists(id: ODValidId): boolean;
}
