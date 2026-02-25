"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODProgressBarManager_Default = exports.ODProgressBarRendererManager_Default = exports.ODProgressBarRenderer_Default = void 0;
const progressbar_1 = require("../modules/progressbar");
const ansis_1 = __importDefault(require("ansis"));
class ODProgressBarRenderer_Default extends progressbar_1.ODProgressBarRenderer {
    constructor(id, settings) {
        super(id, (settings, min, max, value, rawPrefix, rawSuffix) => {
            const percentage = (value - min) / (max - min);
            const barLevel = Math.round(percentage * settings.barWidth);
            const borderAnsis = (settings.borderColor == "openticket") ? ansis_1.default.hex("#f8ba00") : ansis_1.default[settings.borderColor];
            const filledBarAnsis = (settings.filledBarColor == "openticket") ? ansis_1.default.hex("#f8ba00") : ansis_1.default[settings.filledBarColor];
            const emptyBarAnsis = (settings.emptyBarColor == "openticket") ? ansis_1.default.hex("#f8ba00") : ansis_1.default[settings.emptyBarColor];
            const labelAnsis = (settings.labelColor == "openticket") ? ansis_1.default.hex("#f8ba00") : ansis_1.default[settings.labelColor];
            const prefixAnsis = (settings.prefixColor == "openticket") ? ansis_1.default.hex("#f8ba00") : ansis_1.default[settings.prefixColor];
            const suffixAnsis = (settings.suffixColor == "openticket") ? ansis_1.default.hex("#f8ba00") : ansis_1.default[settings.suffixColor];
            const leftBorder = (settings.showBorder) ? borderAnsis(settings.leftBorderChar) : "";
            const rightBorder = (settings.showBorder) ? borderAnsis(settings.rightBorderChar) : "";
            const bar = (settings.showBar) ? filledBarAnsis(settings.filledBarChar.repeat(barLevel)) + emptyBarAnsis(settings.emptyBarChar.repeat(settings.barWidth - barLevel)) : "";
            const prefix = (rawPrefix) ? prefixAnsis(rawPrefix) + " " : "";
            const suffix = (rawSuffix) ? " " + suffixAnsis(rawSuffix) : "";
            let label;
            if (!settings.showLabel)
                label = "";
            if (settings.labelType == "fraction")
                label = labelAnsis(value + "/" + max);
            else if (settings.labelType == "percentage")
                label = labelAnsis(Math.round(percentage * 100) + "%");
            else if (settings.labelType == "time-ms")
                label = labelAnsis(value + "ms");
            else if (settings.labelType == "time-sec")
                label = labelAnsis(Math.round(value * 10) / 10 + "sec");
            else if (settings.labelType == "time-min")
                label = labelAnsis(Math.round(value * 10) / 10 + "min");
            else
                label = labelAnsis(value.toString());
            const labelWithPrefixAndSuffix = prefix + label + suffix;
            return (settings.labelPosition == "start") ? labelWithPrefixAndSuffix + " " + leftBorder + bar + rightBorder : leftBorder + bar + rightBorder + " " + labelWithPrefixAndSuffix;
        }, settings);
    }
}
exports.ODProgressBarRenderer_Default = ODProgressBarRenderer_Default;
/**## ODProgressBarRendererManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODProgressBarRendererManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.progressbars.renderers`!
 */
class ODProgressBarRendererManager_Default extends progressbar_1.ODProgressBarRendererManager {
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
exports.ODProgressBarRendererManager_Default = ODProgressBarRendererManager_Default;
/**## ODProgressBarManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODProgressBarManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.progressbars`!
 */
class ODProgressBarManager_Default extends progressbar_1.ODProgressBarManager {
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
exports.ODProgressBarManager_Default = ODProgressBarManager_Default;
