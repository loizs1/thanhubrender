"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAllProgressBars = exports.loadAllProgressBarRenderers = void 0;
const index_1 = require("../../index");
const loadAllProgressBarRenderers = async () => {
    const defaultSettings = {
        borderColor: "gray",
        filledBarColor: "openticket",
        emptyBarColor: "gray",
        prefixColor: "white",
        suffixColor: "white",
        labelColor: "white",
        leftBorderChar: "[",
        rightBorderChar: "]",
        filledBarChar: "█",
        emptyBarChar: "▒",
        labelType: "value",
        labelPosition: "end",
        barWidth: 50,
        showBar: true,
        showLabel: true,
        showBorder: true,
    };
    //VALUE RENDERER
    const valueRendererSettings = { ...defaultSettings };
    valueRendererSettings.labelType = "value";
    index_1.opendiscord.progressbars.renderers.add(new index_1.api.ODProgressBarRenderer_Default("opendiscord:value-renderer", valueRendererSettings));
    //FRACTION RENDERER
    const fractionRendererSettings = { ...defaultSettings };
    fractionRendererSettings.labelType = "fraction";
    index_1.opendiscord.progressbars.renderers.add(new index_1.api.ODProgressBarRenderer_Default("opendiscord:fraction-renderer", fractionRendererSettings));
    //PERCENTAGE RENDERER
    const percentageRendererSettings = { ...defaultSettings };
    percentageRendererSettings.labelType = "percentage";
    index_1.opendiscord.progressbars.renderers.add(new index_1.api.ODProgressBarRenderer_Default("opendiscord:percentage-renderer", percentageRendererSettings));
    //TIME MS RENDERER
    const timeMsRendererSettings = { ...defaultSettings };
    timeMsRendererSettings.labelType = "time-ms";
    index_1.opendiscord.progressbars.renderers.add(new index_1.api.ODProgressBarRenderer_Default("opendiscord:time-ms-renderer", timeMsRendererSettings));
    //TIME SEC RENDERER
    const timeSecRendererSettings = { ...defaultSettings };
    timeSecRendererSettings.labelType = "time-sec";
    index_1.opendiscord.progressbars.renderers.add(new index_1.api.ODProgressBarRenderer_Default("opendiscord:time-sec-renderer", timeSecRendererSettings));
    //TIME MIN RENDERER
    const timeMinRendererSettings = { ...defaultSettings };
    timeMinRendererSettings.labelType = "time-min";
    index_1.opendiscord.progressbars.renderers.add(new index_1.api.ODProgressBarRenderer_Default("opendiscord:time-min-renderer", timeMinRendererSettings));
};
exports.loadAllProgressBarRenderers = loadAllProgressBarRenderers;
const loadAllProgressBars = async () => {
    const fractRenderer = index_1.opendiscord.progressbars.renderers.get("opendiscord:fraction-renderer");
    //SLASH COMMAND REMOVE (doesn't have correct amount yet)
    index_1.opendiscord.progressbars.add(new index_1.api.ODManualProgressBar("opendiscord:slash-command-remove", fractRenderer.withAdditionalSettings({ filledBarColor: "red" }), 0, "max", null, "Commands Removed"));
    //SLASH COMMAND CREATE (doesn't have correct amount yet)
    index_1.opendiscord.progressbars.add(new index_1.api.ODManualProgressBar("opendiscord:slash-command-create", fractRenderer.withAdditionalSettings({ filledBarColor: "green" }), 0, "max", null, "Commands Created"));
    //SLASH COMMAND UPDATE (doesn't have correct amount yet)
    index_1.opendiscord.progressbars.add(new index_1.api.ODManualProgressBar("opendiscord:slash-command-update", fractRenderer.withAdditionalSettings({ filledBarColor: "openticket" }), 0, "max", null, "Commands Updated"));
    //CONTEXT MENU REMOVE (doesn't have correct amount yet)
    index_1.opendiscord.progressbars.add(new index_1.api.ODManualProgressBar("opendiscord:context-menu-remove", fractRenderer.withAdditionalSettings({ filledBarColor: "red" }), 0, "max", null, "Context Menus Removed"));
    //CONTEXT MENU CREATE (doesn't have correct amount yet)
    index_1.opendiscord.progressbars.add(new index_1.api.ODManualProgressBar("opendiscord:context-menu-create", fractRenderer.withAdditionalSettings({ filledBarColor: "green" }), 0, "max", null, "Context Menus Created"));
    //CONTEXT MENU UPDATE (doesn't have correct amount yet)
    index_1.opendiscord.progressbars.add(new index_1.api.ODManualProgressBar("opendiscord:context-menu-update", fractRenderer.withAdditionalSettings({ filledBarColor: "openticket" }), 0, "max", null, "Context Menus Updated"));
};
exports.loadAllProgressBars = loadAllProgressBars;
