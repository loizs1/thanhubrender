"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAllPriorityLevels = void 0;
const index_1 = require("../../index");
const lang = index_1.opendiscord.languages;
const loadAllPriorityLevels = async () => {
    index_1.opendiscord.priorities.add(new index_1.api.ODPriorityLevel("opendiscord:urgent", 5, "urgent", lang.getTranslation("priorities.urgent"), "🔴", "🔴"));
    index_1.opendiscord.priorities.add(new index_1.api.ODPriorityLevel("opendiscord:very-high", 4, "very-high", lang.getTranslation("priorities.veryHigh"), "🟠", "🟠"));
    index_1.opendiscord.priorities.add(new index_1.api.ODPriorityLevel("opendiscord:high", 3, "high", lang.getTranslation("priorities.high"), "🟡", "🟡"));
    index_1.opendiscord.priorities.add(new index_1.api.ODPriorityLevel("opendiscord:normal", 2, "normal", lang.getTranslation("priorities.normal"), "🟢", "🟢"));
    index_1.opendiscord.priorities.add(new index_1.api.ODPriorityLevel("opendiscord:low", 1, "low", lang.getTranslation("priorities.low"), "🔵", "🔵"));
    index_1.opendiscord.priorities.add(new index_1.api.ODPriorityLevel("opendiscord:very-low", 0, "very-low", lang.getTranslation("priorities.veryLow"), "⚪", "⚪"));
    index_1.opendiscord.priorities.add(new index_1.api.ODPriorityLevel("opendiscord:none", -1, "none", lang.getTranslation("priorities.none"), null, null));
};
exports.loadAllPriorityLevels = loadAllPriorityLevels;
