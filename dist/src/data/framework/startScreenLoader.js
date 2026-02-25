"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAllStartScreenComponents = void 0;
const index_1 = require("../../index");
const ansis_1 = __importDefault(require("ansis"));
const loadAllStartScreenComponents = async () => {
    //LOGO
    index_1.opendiscord.startscreen.add(new index_1.api.ODStartScreenLogoComponent("opendiscord:logo", 1000, [
        "   ██████╗ ██████╗ ███████╗███╗   ██╗    ████████╗██╗ ██████╗██╗  ██╗███████╗████████╗  ",
        "  ██╔═══██╗██╔══██╗██╔════╝████╗  ██║    ╚══██╔══╝██║██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝  ",
        "  ██║   ██║██████╔╝█████╗  ██╔██╗ ██║       ██║   ██║██║     █████╔╝ █████╗     ██║     ",
        "  ██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║       ██║   ██║██║     ██╔═██╗ ██╔══╝     ██║     ",
        "  ╚██████╔╝██║     ███████╗██║ ╚████║       ██║   ██║╚██████╗██║  ██╗███████╗   ██║     ",
        "   ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝       ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝     "
    ], true, false));
    //HEADER
    const currentLanguageMetadata = index_1.opendiscord.languages.getLanguageMetadata();
    index_1.opendiscord.startscreen.add(new index_1.api.ODStartScreenHeaderComponent("opendiscord:header", 999, [
        { key: "Version", value: index_1.opendiscord.versions.get("opendiscord:version").toString() },
        { key: "Support", value: "https://discord.dj-dj.be" },
        { key: "Language", value: (currentLanguageMetadata ? currentLanguageMetadata.language : "Unknown") }
    ], "  -  ", {
        align: "center",
        width: index_1.opendiscord.startscreen.get("opendiscord:logo")
    }));
    //FLAGS
    index_1.opendiscord.startscreen.add(new index_1.api.ODStartScreenFlagsCategoryComponent("opendiscord:flags", 4, index_1.opendiscord.flags.getAll()));
    //PLUGINS
    index_1.opendiscord.startscreen.add(new index_1.api.ODStartScreenPluginsCategoryComponent("opendiscord:plugins", 3, index_1.opendiscord.plugins.getAll(), index_1.opendiscord.plugins.unknownCrashedPlugins));
    //STATS
    index_1.opendiscord.startscreen.add(new index_1.api.ODStartScreenPropertiesCategoryComponent("opendiscord:stats", 2, "startup info", [
        { key: "status", value: ansis_1.default.bold(index_1.opendiscord.client.activity.getStatusType()) + index_1.opendiscord.client.activity.text + " (" + index_1.opendiscord.client.activity.mode + ")" },
        { key: "options", value: "loaded " + ansis_1.default.bold(index_1.opendiscord.options.getLength().toString()) + " options!" },
        { key: "panels", value: "loaded " + ansis_1.default.bold(index_1.opendiscord.panels.getLength().toString()) + " panels!" },
        { key: "tickets", value: "loaded " + ansis_1.default.bold(index_1.opendiscord.tickets.getLength().toString()) + " tickets!" },
        { key: "roles", value: "loaded " + ansis_1.default.bold(index_1.opendiscord.roles.getLength().toString()) + " roles!" },
        { key: "help", value: ansis_1.default.bold(index_1.opendiscord.configs.get("opendiscord:general").data.prefix + "help") + " or " + ansis_1.default.bold("/help") }
    ]));
    //LIVESTATUS
    index_1.opendiscord.startscreen.add(new index_1.api.ODStartScreenLiveStatusCategoryComponent("opendiscord:livestatus", 1, index_1.opendiscord.livestatus));
    //LOGS
    index_1.opendiscord.startscreen.add(new index_1.api.ODStartScreenLogCategoryComponent("opendiscord:logs", 0));
};
exports.loadAllStartScreenComponents = loadAllStartScreenComponents;
