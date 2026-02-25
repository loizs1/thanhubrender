"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODCheckerFunctionManager_Default = exports.ODCheckerTranslationRegister_Default = exports.ODCheckerRenderer_Default = exports.ODCheckerManager_Default = void 0;
const checker_1 = require("../modules/checker");
const ansis_1 = __importDefault(require("ansis"));
/**## ODCheckerManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODCheckerManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.checkers`!
 */
class ODCheckerManager_Default extends checker_1.ODCheckerManager {
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
exports.ODCheckerManager_Default = ODCheckerManager_Default;
/**## ODCheckerRenderer_Default `default_class`
 * This is a special class that adds type definitions & features to the ODCheckerRenderer class.
 * It contains the code that renders the default config checker.
 *
 * This default class is made for the global variable `opendiscord.checkers.renderer`!
 */
class ODCheckerRenderer_Default extends checker_1.ODCheckerRenderer {
    extraHeaderText = [];
    extraFooterText = [];
    extraTopText = [];
    extraBottomText = [];
    horizontalFiller = "=";
    verticalFiller = "|";
    descriptionSeparator = " => ";
    headerSeparator = " => ";
    footerTipPrefix = "=> ";
    disableHeader = false;
    disableFooter = false;
    getComponents(compact, renderEmpty, translation, data) {
        const tm = translation;
        const t = {
            headerOpenticket: tm.get("other", "opendiscord:header-openticket") ?? "OPEN TICKET",
            headerConfigchecker: tm.get("other", "opendiscord:header-configchecker") ?? "CONFIG CHECKER",
            headerDescription: tm.get("other", "opendiscord:header-description") ?? "check for errors in your config files!",
            footerError: tm.get("other", "opendiscord:footer-error") ?? "the bot won't start until all {0}'s are fixed!",
            footerWarning: tm.get("other", "opendiscord:footer-warning") ?? "it's recommended to fix all {0}'s before starting!",
            footerSupport: tm.get("other", "opendiscord:footer-support") ?? "SUPPORT: {0} - DOCS: {1}",
            error: tm.get("other", "opendiscord:type-error") ?? "[ERROR]",
            warning: tm.get("other", "opendiscord:type-warning") ?? "[WARNING]",
            info: tm.get("other", "opendiscord:type-info") ?? "[INFO]",
            compactInfo: tm.get("other", "opendiscord:compact-information") ?? "use {0} for more information!",
            dataPath: tm.get("other", "opendiscord:data-path") ?? "path",
            dataDocs: tm.get("other", "opendiscord:data-docs") ?? "docs",
            dataMessage: tm.get("other", "opendiscord:data-message") ?? "message"
        };
        const hasErrors = data.messages.filter((m) => m.type == "error").length > 0;
        const hasWarnings = data.messages.filter((m) => m.type == "warning").length > 0;
        const hasInfo = data.messages.filter((m) => m.type == "info").length > 0;
        if (!renderEmpty && !hasErrors && !hasWarnings && (!hasInfo || compact))
            return [];
        const headerText = ansis_1.default.bold.hex("#f8ba00")(t.headerOpenticket) + " " + t.headerConfigchecker + this.headerSeparator + ansis_1.default.hex("#f8ba00")(t.headerDescription);
        const footerErrorText = (hasErrors) ? this.footerTipPrefix + ansis_1.default.gray(tm.insertTranslationParams(t.footerError, [ansis_1.default.bold.red(t.error)])) : "";
        const footerWarningText = (hasWarnings) ? this.footerTipPrefix + ansis_1.default.gray(tm.insertTranslationParams(t.footerWarning, [ansis_1.default.bold.yellow(t.warning)])) : "";
        const footerSupportText = tm.insertTranslationParams(t.footerSupport, [ansis_1.default.green("https://discord.dj-dj.be"), ansis_1.default.green("https://otdocs.dj-dj.be")]);
        const bottomCompactInfo = (compact) ? ansis_1.default.gray(tm.insertTranslationParams(t.compactInfo, [ansis_1.default.bold.green("npm start -- --checker")])) : "";
        const finalHeader = [headerText, ...this.extraHeaderText];
        const finalFooter = [footerErrorText, footerWarningText, footerSupportText, ...this.extraFooterText];
        const finalTop = [...this.extraTopText];
        const finalBottom = [bottomCompactInfo, ...this.extraBottomText];
        const borderLength = this.#getLongestLength([...finalHeader, ...finalFooter]);
        const finalComponents = [];
        //header
        if (!this.disableHeader) {
            finalHeader.forEach((text) => {
                if (text.length < 1)
                    return;
                finalComponents.push(this.#createBlockFromText(text, borderLength));
            });
        }
        finalComponents.push(this.#getHorizontalDivider(borderLength + 4));
        //top
        finalTop.forEach((text) => {
            if (text.length < 1)
                return;
            finalComponents.push(this.verticalFiller + " " + text);
        });
        finalComponents.push(this.verticalFiller);
        //messages
        if (compact) {
            //use compact messages
            data.messages.forEach((msg, index) => {
                //compact mode doesn't render info
                if (msg.type == "info")
                    return;
                //check if translation available & use it if possible
                const rawTranslation = tm.get("message", msg.messageId.value);
                const translatedMessage = (rawTranslation) ? tm.insertTranslationParams(rawTranslation, msg.translationParams) : msg.message;
                if (msg.type == "error")
                    finalComponents.push(this.verticalFiller + " " + ansis_1.default.bold.red(`${t.error} ${translatedMessage}`));
                else if (msg.type == "warning")
                    finalComponents.push(this.verticalFiller + " " + ansis_1.default.bold.yellow(`${t.warning} ${translatedMessage}`));
                const pathSplitter = msg.path ? ":" : "";
                finalComponents.push(this.verticalFiller + ansis_1.default.bold(this.descriptionSeparator) + ansis_1.default.cyan(`${ansis_1.default.magenta(msg.filepath + pathSplitter)} ${msg.path}`));
                if (index != data.messages.length - 1)
                    finalComponents.push(this.verticalFiller);
            });
        }
        else {
            //use full messages
            data.messages.forEach((msg, index) => {
                //check if translation available & use it if possible
                const rawTranslation = tm.get("message", msg.messageId.value);
                const translatedMessage = (rawTranslation) ? tm.insertTranslationParams(rawTranslation, msg.translationParams) : msg.message;
                if (msg.type == "error")
                    finalComponents.push(this.verticalFiller + " " + ansis_1.default.bold.red(`${t.error} ${translatedMessage}`));
                else if (msg.type == "warning")
                    finalComponents.push(this.verticalFiller + " " + ansis_1.default.bold.yellow(`${t.warning} ${translatedMessage}`));
                else if (msg.type == "info")
                    finalComponents.push(this.verticalFiller + " " + ansis_1.default.bold.blue(`${t.info} ${translatedMessage}`));
                const pathSplitter = msg.path ? ":" : "";
                finalComponents.push(this.verticalFiller + " " + ansis_1.default.bold((t.dataPath) + this.descriptionSeparator) + ansis_1.default.cyan(`${ansis_1.default.magenta(msg.filepath + pathSplitter)} ${msg.path}`));
                if (msg.locationDocs)
                    finalComponents.push(this.verticalFiller + " " + ansis_1.default.bold(t.dataDocs + this.descriptionSeparator) + ansis_1.default.italic.gray(msg.locationDocs));
                if (msg.messageDocs)
                    finalComponents.push(this.verticalFiller + " " + ansis_1.default.bold(t.dataMessage + this.descriptionSeparator) + ansis_1.default.italic.gray(msg.messageDocs));
                if (index != data.messages.length - 1)
                    finalComponents.push(this.verticalFiller);
            });
        }
        //bottom
        finalComponents.push(this.verticalFiller);
        finalBottom.forEach((text) => {
            if (text.length < 1)
                return;
            finalComponents.push(this.verticalFiller + " " + text);
        });
        //footer
        finalComponents.push(this.#getHorizontalDivider(borderLength + 4));
        if (!this.disableFooter) {
            finalFooter.forEach((text) => {
                if (text.length < 1)
                    return;
                finalComponents.push(this.#createBlockFromText(text, borderLength));
            });
            finalComponents.push(this.#getHorizontalDivider(borderLength + 4));
        }
        //return all components
        return finalComponents;
    }
    /**Get the length of the longest string in the array. */
    #getLongestLength(texts) {
        return Math.max(...texts.map((t) => ansis_1.default.strip(t).length));
    }
    /**Get a horizontal divider used between different parts of the config checker result. */
    #getHorizontalDivider(width) {
        if (width > 2)
            width = width - 2;
        else
            return this.verticalFiller + this.verticalFiller;
        let divider = this.verticalFiller + this.horizontalFiller.repeat(width) + this.verticalFiller;
        return divider;
    }
    /**Create a block of text with a vertical divider on the left & right side. */
    #createBlockFromText(text, width) {
        if (width < 3)
            return this.verticalFiller + this.verticalFiller;
        let newWidth = width - ansis_1.default.strip(text).length + 1;
        let final = this.verticalFiller + " " + text + " ".repeat(newWidth) + this.verticalFiller;
        return final;
    }
}
exports.ODCheckerRenderer_Default = ODCheckerRenderer_Default;
/**## ODCheckerTranslationRegister_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODCheckerTranslationRegister class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.checkers.translation`!
 */
class ODCheckerTranslationRegister_Default extends checker_1.ODCheckerTranslationRegister {
    get(type, id) {
        return super.get(type, id);
    }
    set(type, id, translation) {
        return super.set(type, id, translation);
    }
    delete(type, id) {
        return super.delete(type, id);
    }
    quickTranslate(manager, translationId, type, id) {
        super.quickTranslate(manager, translationId, type, id);
    }
}
exports.ODCheckerTranslationRegister_Default = ODCheckerTranslationRegister_Default;
/**## ODCheckerFunctionManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODCheckerFunctionManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.checkers.functions`!
 */
class ODCheckerFunctionManager_Default extends checker_1.ODCheckerFunctionManager {
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
exports.ODCheckerFunctionManager_Default = ODCheckerFunctionManager_Default;
