"use strict";
///////////////////////////////////////
//DEFAULTS MODULE
///////////////////////////////////////
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODDefaultsManager = void 0;
/**## ODDefaultsManager `class`
 * This is an Open Ticket defaults manager.
 *
 * It manages all settings in Open Ticket that are not meant to be in the config.
 * Here you can disable certain default features to replace them or to specifically enable them!
 *
 * You are unable to add your own defaults, you can only edit Open Ticket defaults!
 */
class ODDefaultsManager {
    /**A list of all the defaults */
    #defaults;
    constructor() {
        this.#defaults = {
            errorHandling: true,
            crashOnError: false,
            debugLoading: true,
            silentLoading: true,
            allowDumpCommand: true,
            pluginLoading: true,
            softPluginLoading: false,
            pluginClassLoading: true,
            flagLoading: true,
            flagInitiating: true,
            progressBarRendererLoading: true,
            progressBarLoading: true,
            configLoading: true,
            configInitiating: true,
            databaseLoading: true,
            databaseInitiating: true,
            sessionLoading: true,
            languageLoading: true,
            languageInitiating: true,
            languageSelection: true,
            backupLanguage: "opendiscord:english",
            languageList: [],
            checkerLoading: true,
            checkerFunctionLoading: true,
            checkerExecution: true,
            checkerTranslationLoading: true,
            checkerRendering: true,
            checkerQuit: true,
            checkerRenderEmpty: false,
            clientLoading: true,
            clientInitiating: true,
            clientReady: true,
            clientMultiGuildWarning: true,
            clientActivityLoading: true,
            clientActivityInitiating: true,
            priorityLoading: true,
            slashCommandLoading: true,
            slashCommandRegistering: true,
            forceSlashCommandRegistration: false,
            allowSlashCommandRemoval: true,
            contextMenuLoading: true,
            contextMenuRegistering: true,
            forceContextMenuRegistration: false,
            allowContextMenuRemoval: true,
            textCommandLoading: true,
            questionLoading: true,
            optionLoading: true,
            panelLoading: true,
            ticketLoading: true,
            roleLoading: true,
            blacklistLoading: true,
            transcriptCompilerLoading: true,
            transcriptHistoryLoading: true,
            buttonBuildersLoading: true,
            dropdownBuildersLoading: true,
            fileBuildersLoading: true,
            embedBuildersLoading: true,
            messageBuildersLoading: true,
            modalBuildersLoading: true,
            commandRespondersLoading: true,
            buttonRespondersLoading: true,
            dropdownRespondersLoading: true,
            modalRespondersLoading: true,
            contextMenuRespondersLoading: true,
            autocompleteRespondersLoading: true,
            responderTimeoutMs: 2500,
            actionsLoading: true,
            verifyBarsLoading: true,
            permissionsLoading: true,
            postsLoading: true,
            postsInitiating: true,
            cooldownsLoading: true,
            cooldownsInitiating: true,
            helpMenuCategoryLoading: true,
            helpMenuComponentLoading: true,
            statScopesLoading: true,
            statLoading: true,
            statInitiating: true,
            codeLoading: true,
            codeExecution: true,
            liveStatusLoading: true,
            startScreenLoading: true,
            startScreenRendering: true,
            emojiTitleStyleLoading: true,
            emojiTitleStyle: "before",
            emojiTitleDivider: " ",
            autocloseCheckInterval: 300000, //5 minutes
            autodeleteCheckInterval: 300000 //5 minutes
        };
    }
    /**Set a default to a specific value. Remember! All plugins can edit these values, so your value could be overwritten! */
    setDefault(key, value) {
        this.#defaults[key] = value;
    }
    /**Get a default. Remember! All plugins can edit these values, so this value could be overwritten! */
    getDefault(key) {
        return this.#defaults[key];
    }
}
exports.ODDefaultsManager = ODDefaultsManager;
