"use strict";
/*
   ██████╗ ██████╗ ███████╗███╗   ██╗    ████████╗██╗ ██████╗██╗  ██╗███████╗████████╗
  ██╔═══██╗██╔══██╗██╔════╝████╗  ██║    ╚══██╔══╝██║██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝
  ██║   ██║██████╔╝█████╗  ██╔██╗ ██║       ██║   ██║██║     █████╔╝ █████╗     ██║
  ██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║       ██║   ██║██║     ██╔═██╗ ██╔══╝     ██║
  ╚██████╔╝██║     ███████╗██║ ╚████║       ██║   ██║╚██████╗██║  ██╗███████╗   ██║
   ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝       ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝
                                                                       
    > Hey! We are looking for you!
    > Do you speak a language that isn't yet in our /languages directory?
    > Or do you speak one that isn't up-to-date anymore?
    > Open Ticket needs translators for lots of different languages!
    > Feel free to join our translator team and help us improve Open Ticket!
    
    SUGGESTIONS:
    =====================
    Did you know that almost 70% of all Open Ticket features were requested by the community?
    Feel free to suggest new ideas in our discord server or via github issues!
    They are always welcome!

    INFORMATION:
    ============
    Open Ticket v4.1.3 - © DJdj Development

    support us: https://github.com/sponsors/DJj123dj
    discord: https://discord.dj-dj.be
    website: https://openticket.dj-dj.be
    github: https://otgithub.dj-dj.be
    documentation: https://otdocs.dj-dj.be

    Config files:
    ./config/....json

    Send ./otdebug.txt to us when there is an error!
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.utilities = exports.opendiscord = exports.api = void 0;
//initialize API & check npm libraries
const init_1 = require("./core/startup/init");
var init_2 = require("./core/startup/init");
Object.defineProperty(exports, "api", { enumerable: true, get: function () { return init_2.api; } });
Object.defineProperty(exports, "opendiscord", { enumerable: true, get: function () { return init_2.opendiscord; } });
Object.defineProperty(exports, "utilities", { enumerable: true, get: function () { return init_2.utilities; } });
const ansis_1 = __importDefault(require("ansis"));
/**The main sequence of Open Ticket. Runs `async` */
const main = async () => {
    //load all events
    (await import("./data/framework/eventLoader.js")).loadAllEvents();
    //error handling system
    process.on("uncaughtException", async (error, origin) => {
        try {
            await init_1.opendiscord.events.get("onErrorHandling").emit([error, origin]);
            if (init_1.opendiscord.defaults.getDefault("errorHandling")) {
                //custom error messages for known errors
                if (error.message.toLowerCase().includes("used disallowed intents")) {
                    //invalid intents
                    init_1.opendiscord.log("Open Ticket doesn't work without Privileged Gateway Intents enabled!", "error");
                    init_1.opendiscord.log("Enable them in the discord developer portal!", "info");
                    console.log("\n");
                    process.exit(1);
                }
                else if (error.message.toLowerCase().includes("invalid discord bot token provided")) {
                    //invalid token
                    init_1.opendiscord.log("An invalid discord auth token was provided!", "error");
                    init_1.opendiscord.log("Check the config if you have inserted the bot token correctly!", "info");
                    console.log("\n");
                    process.exit(1);
                }
                else {
                    //unknown error
                    const errmsg = new init_1.api.ODError(error, origin);
                    init_1.opendiscord.log(errmsg);
                    if (init_1.opendiscord.defaults.getDefault("crashOnError"))
                        process.exit(1);
                    await init_1.opendiscord.events.get("afterErrorHandling").emit([error, origin, errmsg]);
                }
            }
        }
        catch (err) {
            console.log("[ERROR HANDLER ERROR]:", err);
        }
    });
    //handle data migration (PART 1)
    const lastVersion = await (await import("./core/startup/manageMigration.js")).loadVersionMigrationSystem();
    //load plugins
    if (init_1.opendiscord.defaults.getDefault("pluginLoading")) {
        await (await import("./core/startup/pluginLauncher.js")).loadAllPlugins();
    }
    await init_1.opendiscord.events.get("afterPluginsLoaded").emit([init_1.opendiscord.plugins]);
    //load plugin classes
    init_1.opendiscord.log("Loading plugin classes...", "system");
    if (init_1.opendiscord.defaults.getDefault("pluginClassLoading")) {
    }
    await init_1.opendiscord.events.get("onPluginClassLoad").emit([init_1.opendiscord.plugins.classes, init_1.opendiscord.plugins]);
    await init_1.opendiscord.events.get("afterPluginClassesLoaded").emit([init_1.opendiscord.plugins.classes, init_1.opendiscord.plugins]);
    //load flags
    init_1.opendiscord.log("Loading flags...", "system");
    if (init_1.opendiscord.defaults.getDefault("flagLoading")) {
        await (await import("./data/framework/flagLoader.js")).loadAllFlags();
    }
    await init_1.opendiscord.events.get("onFlagLoad").emit([init_1.opendiscord.flags]);
    await init_1.opendiscord.events.get("afterFlagsLoaded").emit([init_1.opendiscord.flags]);
    //initiate flags
    await init_1.opendiscord.events.get("onFlagInit").emit([init_1.opendiscord.flags]);
    if (init_1.opendiscord.defaults.getDefault("flagInitiating")) {
        await init_1.opendiscord.flags.init();
        init_1.opendiscord.debugfile.writeText("\n[ENABLED FLAGS]:\n" + init_1.opendiscord.flags.getFiltered((flag) => (flag.value == true)).map((flag) => flag.id.value).join("\n") + "\n");
        await init_1.opendiscord.events.get("afterFlagsInitiated").emit([init_1.opendiscord.flags]);
    }
    //load debug
    if (init_1.opendiscord.defaults.getDefault("debugLoading")) {
        const debugFlag = init_1.opendiscord.flags.get("opendiscord:debug");
        init_1.opendiscord.debug.visible = (debugFlag) ? debugFlag.value : false;
    }
    //load silent mode
    if (init_1.opendiscord.defaults.getDefault("silentLoading")) {
        const silentFlag = init_1.opendiscord.flags.get("opendiscord:silent");
        init_1.opendiscord.console.silent = (silentFlag) ? silentFlag.value : false;
        if (init_1.opendiscord.console.silent) {
            init_1.opendiscord.console.silent = false;
            init_1.opendiscord.log("Silent mode is active! Logs won't be shown in the console.", "warning");
            init_1.opendiscord.console.silent = true;
        }
    }
    //load progress bar renderers
    init_1.opendiscord.log("Loading progress bars...", "system");
    if (init_1.opendiscord.defaults.getDefault("progressBarRendererLoading")) {
        await (await import("./data/framework/progressBarLoader.js")).loadAllProgressBarRenderers();
    }
    await init_1.opendiscord.events.get("onProgressBarRendererLoad").emit([init_1.opendiscord.progressbars.renderers]);
    await init_1.opendiscord.events.get("afterProgressBarRenderersLoaded").emit([init_1.opendiscord.progressbars.renderers]);
    //load progress bars
    if (init_1.opendiscord.defaults.getDefault("progressBarLoading")) {
        await (await import("./data/framework/progressBarLoader.js")).loadAllProgressBars();
    }
    await init_1.opendiscord.events.get("onProgressBarLoad").emit([init_1.opendiscord.progressbars]);
    await init_1.opendiscord.events.get("afterProgressBarsLoaded").emit([init_1.opendiscord.progressbars]);
    //load config
    init_1.opendiscord.log("Loading configs...", "system");
    if (init_1.opendiscord.defaults.getDefault("configLoading")) {
        await (await import("./data/framework/configLoader.js")).loadAllConfigs();
    }
    await init_1.opendiscord.events.get("onConfigLoad").emit([init_1.opendiscord.configs]);
    await init_1.opendiscord.events.get("afterConfigsLoaded").emit([init_1.opendiscord.configs]);
    //initiate config
    await init_1.opendiscord.events.get("onConfigInit").emit([init_1.opendiscord.configs]);
    if (init_1.opendiscord.defaults.getDefault("configInitiating")) {
        await init_1.opendiscord.configs.init();
        await init_1.opendiscord.events.get("afterConfigsInitiated").emit([init_1.opendiscord.configs]);
    }
    //UTILITY CONFIG
    const generalConfig = init_1.opendiscord.configs.get("opendiscord:general");
    if (init_1.opendiscord.defaults.getDefault("emojiTitleStyleLoading")) {
        //set emoji style based on config
        init_1.opendiscord.defaults.setDefault("emojiTitleStyle", generalConfig.data.system.emojiStyle);
    }
    //load database
    init_1.opendiscord.log("Loading databases...", "system");
    if (init_1.opendiscord.defaults.getDefault("databaseLoading")) {
        await (await import("./data/framework/databaseLoader.js")).loadAllDatabases();
    }
    await init_1.opendiscord.events.get("onDatabaseLoad").emit([init_1.opendiscord.databases]);
    await init_1.opendiscord.events.get("afterDatabasesLoaded").emit([init_1.opendiscord.databases]);
    //initiate database
    await init_1.opendiscord.events.get("onDatabaseInit").emit([init_1.opendiscord.databases]);
    if (init_1.opendiscord.defaults.getDefault("databaseInitiating")) {
        await init_1.opendiscord.databases.init();
        await init_1.opendiscord.events.get("afterDatabasesInitiated").emit([init_1.opendiscord.databases]);
    }
    //load sessions
    init_1.opendiscord.log("Loading sessions...", "system");
    if (init_1.opendiscord.defaults.getDefault("sessionLoading")) {
    }
    await init_1.opendiscord.events.get("onSessionLoad").emit([init_1.opendiscord.sessions]);
    await init_1.opendiscord.events.get("afterSessionsLoaded").emit([init_1.opendiscord.sessions]);
    //load language
    init_1.opendiscord.log("Loading languages...", "system");
    if (init_1.opendiscord.defaults.getDefault("languageLoading")) {
        await (await import("./data/framework/languageLoader.js")).loadAllLanguages();
    }
    await init_1.opendiscord.events.get("onLanguageLoad").emit([init_1.opendiscord.languages]);
    await init_1.opendiscord.events.get("afterLanguagesLoaded").emit([init_1.opendiscord.languages]);
    //initiate language
    await init_1.opendiscord.events.get("onLanguageInit").emit([init_1.opendiscord.languages]);
    if (init_1.opendiscord.defaults.getDefault("languageInitiating")) {
        await init_1.opendiscord.languages.init();
        await init_1.opendiscord.events.get("afterLanguagesInitiated").emit([init_1.opendiscord.languages]);
        //add available languages to list for config checker
        const languageList = init_1.opendiscord.defaults.getDefault("languageList");
        const languageIds = init_1.opendiscord.languages.getIds().map((id) => {
            if (id.value.startsWith("opendiscord:")) {
                //is open ticket language => return without prefix
                return id.value.split("opendiscord:")[1];
            }
            else
                return id.value;
        });
        languageList.push(...languageIds);
        init_1.opendiscord.defaults.setDefault("languageList", languageList);
    }
    //select language
    await init_1.opendiscord.events.get("onLanguageSelect").emit([init_1.opendiscord.languages]);
    if (init_1.opendiscord.defaults.getDefault("languageSelection")) {
        //set current language
        const languageId = (generalConfig?.data?.language) ? generalConfig.data.language : "english";
        if (languageId.includes(":")) {
            init_1.opendiscord.languages.setCurrentLanguage(languageId);
        }
        else {
            init_1.opendiscord.languages.setCurrentLanguage("opendiscord:" + languageId);
        }
        //set backup language
        const backupLanguageId = init_1.opendiscord.defaults.getDefault("backupLanguage");
        if (init_1.opendiscord.languages.exists(backupLanguageId)) {
            init_1.opendiscord.languages.setBackupLanguage(backupLanguageId);
        }
        else
            throw new init_1.api.ODSystemError("Unknown backup language '" + backupLanguageId + "'!");
        await init_1.opendiscord.events.get("afterLanguagesSelected").emit([init_1.opendiscord.languages.get(languageId), init_1.opendiscord.languages.get(backupLanguageId), init_1.opendiscord.languages]);
    }
    //handle data migration (PART 2)
    if (lastVersion)
        await (await import("./core/startup/manageMigration.js")).loadAllAfterInitVersionMigrations(lastVersion);
    //load config checker
    init_1.opendiscord.log("Loading config checker...", "system");
    if (init_1.opendiscord.defaults.getDefault("checkerLoading")) {
        await (await import("./data/framework/checkerLoader.js")).loadAllConfigCheckers();
    }
    await init_1.opendiscord.events.get("onCheckerLoad").emit([init_1.opendiscord.checkers]);
    await init_1.opendiscord.events.get("afterCheckersLoaded").emit([init_1.opendiscord.checkers]);
    //load config checker functions
    if (init_1.opendiscord.defaults.getDefault("checkerFunctionLoading")) {
        await (await import("./data/framework/checkerLoader.js")).loadAllConfigCheckerFunctions();
    }
    await init_1.opendiscord.events.get("onCheckerFunctionLoad").emit([init_1.opendiscord.checkers.functions, init_1.opendiscord.checkers]);
    await init_1.opendiscord.events.get("afterCheckerFunctionsLoaded").emit([init_1.opendiscord.checkers.functions, init_1.opendiscord.checkers]);
    //execute config checker
    await init_1.opendiscord.events.get("onCheckerExecute").emit([init_1.opendiscord.checkers]);
    if (init_1.opendiscord.defaults.getDefault("checkerExecution")) {
        const result = init_1.opendiscord.checkers.checkAll(true);
        await init_1.opendiscord.events.get("afterCheckersExecuted").emit([result, init_1.opendiscord.checkers]);
    }
    //load config checker translations
    if (init_1.opendiscord.defaults.getDefault("checkerTranslationLoading")) {
        await (await import("./data/framework/checkerLoader.js")).loadAllConfigCheckerTranslations();
    }
    await init_1.opendiscord.events.get("onCheckerTranslationLoad").emit([init_1.opendiscord.checkers.translation, ((generalConfig && generalConfig.data.system && generalConfig.data.system.useTranslatedConfigChecker) ? generalConfig.data.system.useTranslatedConfigChecker : false), init_1.opendiscord.checkers]);
    await init_1.opendiscord.events.get("afterCheckerTranslationsLoaded").emit([init_1.opendiscord.checkers.translation, init_1.opendiscord.checkers]);
    //render config checker
    const advancedCheckerFlag = init_1.opendiscord.flags.get("opendiscord:checker");
    const disableCheckerFlag = init_1.opendiscord.flags.get("opendiscord:no-checker");
    const useCliFlag = init_1.opendiscord.flags.get("opendiscord:cli");
    await init_1.opendiscord.events.get("onCheckerRender").emit([init_1.opendiscord.checkers.renderer, init_1.opendiscord.checkers]);
    if (init_1.opendiscord.defaults.getDefault("checkerRendering") && !(disableCheckerFlag ? disableCheckerFlag.value : false) && !(useCliFlag ? useCliFlag.value : false)) {
        //check if there is a result (otherwise throw minor error)
        const result = init_1.opendiscord.checkers.lastResult;
        if (!result)
            return init_1.opendiscord.log("Failed to render Config Checker! (couldn't fetch result)", "error");
        //get components & check if full mode enabled
        const components = init_1.opendiscord.checkers.renderer.getComponents(!(advancedCheckerFlag ? advancedCheckerFlag.value : false), init_1.opendiscord.defaults.getDefault("checkerRenderEmpty"), init_1.opendiscord.checkers.translation, result);
        //render
        init_1.opendiscord.debugfile.writeText("\n[CONFIG CHECKER RESULT]:\n" + ansis_1.default.strip(components.join("\n")) + "\n");
        init_1.opendiscord.checkers.renderer.render(components);
        //wait 5 seconds when there are warnings (not for errors & info)
        if (result.messages.length > 0 && result.messages.some((msg) => msg.type == "warning") && result.messages.every((msg) => msg.type != "error"))
            await init_1.utilities.timer(5000);
        await init_1.opendiscord.events.get("afterCheckersRendered").emit([init_1.opendiscord.checkers.renderer, init_1.opendiscord.checkers]);
    }
    //quit config checker (when required)
    if (init_1.opendiscord.checkers.lastResult && !init_1.opendiscord.checkers.lastResult.valid && !(disableCheckerFlag ? disableCheckerFlag.value : false) && !(useCliFlag ? useCliFlag.value : false)) {
        await init_1.opendiscord.events.get("onCheckerQuit").emit([init_1.opendiscord.checkers]);
        if (init_1.opendiscord.defaults.getDefault("checkerQuit")) {
            process.exit(1);
            //there is no afterCheckerQuitted event :)
        }
    }
    //switch to CLI context instead of running the bot
    if (useCliFlag && useCliFlag.value) {
        await (await (import("./core/cli/cli.js"))).execute();
        await init_1.utilities.timer(1000);
        console.log("\n\n" + ansis_1.default.red("❌ Something went wrong in the Interactive Setup CLI. Please try again or report a bug in our discord server."));
        process.exit(0);
    }
    //plugin loading before client
    await init_1.opendiscord.events.get("onPluginBeforeClientLoad").emit([]);
    await init_1.opendiscord.events.get("afterPluginBeforeClientLoaded").emit([]);
    //client configuration
    init_1.opendiscord.log("Loading client...", "system");
    if (init_1.opendiscord.defaults.getDefault("clientLoading")) {
        //add intents (for basic permissions)
        init_1.opendiscord.client.intents.push("Guilds", "GuildMessages", "DirectMessages", "GuildEmojisAndStickers", "GuildMembers", "MessageContent", "GuildWebhooks", "GuildInvites");
        //add privileged intents (required for transcripts)
        init_1.opendiscord.client.privileges.push("MessageContent", "GuildMembers");
        //add partials (required for DM messages)
        init_1.opendiscord.client.partials.push("Channel", "Message");
        //add permissions (not required when Administrator)
        init_1.opendiscord.client.permissions.push("AddReactions", "AttachFiles", "CreatePrivateThreads", "CreatePublicThreads", "EmbedLinks", "ManageChannels", "ManageGuild", "ManageMessages", "ChangeNickname", "ManageRoles", "ManageThreads", "ManageWebhooks", "MentionEveryone", "ReadMessageHistory", "SendMessages", "SendMessagesInThreads", "UseApplicationCommands", "UseExternalEmojis", "ViewAuditLog", "ViewChannel");
        //get token from config or env
        const configToken = init_1.opendiscord.configs.get("opendiscord:general").data.token ? init_1.opendiscord.configs.get("opendiscord:general").data.token : "";
        const envToken = init_1.opendiscord.env.getVariable("TOKEN") ? init_1.opendiscord.env.getVariable("TOKEN") : "";
        const token = init_1.opendiscord.configs.get("opendiscord:general").data.tokenFromENV ? envToken : configToken;
        init_1.opendiscord.client.token = token;
    }
    await init_1.opendiscord.events.get("onClientLoad").emit([init_1.opendiscord.client]);
    await init_1.opendiscord.events.get("afterClientLoaded").emit([init_1.opendiscord.client]);
    //client ready
    init_1.opendiscord.client.readyListener = async () => {
        init_1.opendiscord.log("Loading client setup...", "system");
        await init_1.opendiscord.events.get("onClientReady").emit([init_1.opendiscord.client]);
        if (init_1.opendiscord.defaults.getDefault("clientReady")) {
            const client = init_1.opendiscord.client;
            //check if all servers are valid
            const botServers = await client.getGuilds();
            const generalConfig = init_1.opendiscord.configs.get("opendiscord:general");
            const serverId = generalConfig.data.serverId ? generalConfig.data.serverId : "";
            if (!serverId)
                throw new init_1.api.ODSystemError("Server Id Missing!");
            const mainServer = botServers.find((g) => g.id == serverId);
            client.mainServer = mainServer ?? null;
            //throw if bot isn't member of main server
            if (!mainServer || !client.checkBotInGuild(mainServer)) {
                console.log("\n");
                init_1.opendiscord.log("The bot isn't a member of the server provided in the config!", "error");
                init_1.opendiscord.log("Please invite your bot to this server!", "info");
                console.log("\n");
                process.exit(1);
            }
            //throw if bot doesn't have permissions in main server
            if (!client.checkGuildPerms(mainServer)) {
                console.log("\n");
                init_1.opendiscord.log("The bot doesn't have the correct permissions in the server provided in the config!", "error");
                init_1.opendiscord.log("Please give the bot \"Administrator\" permissions or visit the documentation!", "info");
                console.log("\n");
                process.exit(1);
            }
            if (init_1.opendiscord.defaults.getDefault("clientMultiGuildWarning")) {
                //warn if bot is in multiple servers
                if (botServers.length > 1) {
                    init_1.opendiscord.log("This bot is part of multiple servers, but Open Ticket doesn't provide support for this!", "warning");
                    init_1.opendiscord.log("As a result, the bot may crash & glitch when used in the additional servers!", "info");
                }
                botServers.forEach((server) => {
                    //warn if bot doesn't have permissions in multiple servers
                    if (!client.checkGuildPerms(server))
                        init_1.opendiscord.log(`The bot doesn't have the correct permissions in the server "${server.name}"!`, "warning");
                });
            }
            //load client activity
            init_1.opendiscord.log("Loading client activity...", "system");
            if (init_1.opendiscord.defaults.getDefault("clientActivityLoading")) {
                //load config status
                if (generalConfig.data.status && generalConfig.data.status.enabled)
                    init_1.opendiscord.client.activity.setStatus(generalConfig.data.status.type, generalConfig.data.status.text, generalConfig.data.status.mode, generalConfig.data.status.state);
            }
            await init_1.opendiscord.events.get("onClientActivityLoad").emit([init_1.opendiscord.client.activity, init_1.opendiscord.client]);
            await init_1.opendiscord.events.get("afterClientActivityLoaded").emit([init_1.opendiscord.client.activity, init_1.opendiscord.client]);
            //initiate client activity
            await init_1.opendiscord.events.get("onClientActivityInit").emit([init_1.opendiscord.client.activity, init_1.opendiscord.client]);
            if (init_1.opendiscord.defaults.getDefault("clientActivityInitiating")) {
                init_1.opendiscord.client.activity.initStatus();
                await init_1.opendiscord.events.get("afterClientActivityInitiated").emit([init_1.opendiscord.client.activity, init_1.opendiscord.client]);
            }
            //load priority levels
            init_1.opendiscord.log("Loading prioritiy levels...", "system");
            if (init_1.opendiscord.defaults.getDefault("priorityLoading")) {
                await (await import("./data/openticket/priorityLoader.js")).loadAllPriorityLevels();
            }
            await init_1.opendiscord.events.get("onPriorityLoad").emit([init_1.opendiscord.priorities]);
            await init_1.opendiscord.events.get("afterPrioritiesLoaded").emit([init_1.opendiscord.priorities]);
            //load slash commands
            init_1.opendiscord.log("Loading slash commands...", "system");
            if (init_1.opendiscord.defaults.getDefault("slashCommandLoading")) {
                await (await import("./data/framework/commandLoader.js")).loadAllSlashCommands();
            }
            await init_1.opendiscord.events.get("onSlashCommandLoad").emit([init_1.opendiscord.client.slashCommands, init_1.opendiscord.client]);
            await init_1.opendiscord.events.get("afterSlashCommandsLoaded").emit([init_1.opendiscord.client.slashCommands, init_1.opendiscord.client]);
            //register slash commands (create, update & remove)
            if (init_1.opendiscord.defaults.getDefault("forceSlashCommandRegistration"))
                init_1.opendiscord.log("Forcing all slash commands to be re-registered...", "system");
            init_1.opendiscord.log("Registering slash commands... (this can take up to 2 minutes)", "system");
            await init_1.opendiscord.events.get("onSlashCommandRegister").emit([init_1.opendiscord.client.slashCommands, init_1.opendiscord.client]);
            if (init_1.opendiscord.defaults.getDefault("slashCommandRegistering")) {
                //get all commands that are already registered in the bot
                const cmds = await init_1.opendiscord.client.slashCommands.getAllRegisteredCommands();
                const removableCmds = cmds.unused.map((cmd) => cmd.cmd);
                const newCmds = cmds.unregistered.map((cmd) => cmd.instance);
                const updatableCmds = cmds.registered.filter((cmd) => cmd.requiresUpdate || init_1.opendiscord.defaults.getDefault("forceSlashCommandRegistration")).map((cmd) => cmd.instance);
                //init progress bars
                const removeProgress = init_1.opendiscord.progressbars.get("opendiscord:slash-command-remove");
                const createProgress = init_1.opendiscord.progressbars.get("opendiscord:slash-command-create");
                const updateProgress = init_1.opendiscord.progressbars.get("opendiscord:slash-command-update");
                //remove unused cmds, create new cmds & update existing cmds
                if (init_1.opendiscord.defaults.getDefault("allowSlashCommandRemoval"))
                    await init_1.opendiscord.client.slashCommands.removeUnusedCommands(removableCmds, undefined, removeProgress);
                await init_1.opendiscord.client.slashCommands.createNewCommands(newCmds, createProgress);
                await init_1.opendiscord.client.slashCommands.updateExistingCommands(updatableCmds, updateProgress);
                await init_1.opendiscord.events.get("afterSlashCommandsRegistered").emit([init_1.opendiscord.client.slashCommands, init_1.opendiscord.client]);
            }
            //load context menus
            init_1.opendiscord.log("Loading context menus...", "system");
            if (init_1.opendiscord.defaults.getDefault("contextMenuLoading")) {
                await (await import("./data/framework/commandLoader.js")).loadAllContextMenus();
            }
            await init_1.opendiscord.events.get("onContextMenuLoad").emit([init_1.opendiscord.client.contextMenus, init_1.opendiscord.client]);
            await init_1.opendiscord.events.get("afterContextMenusLoaded").emit([init_1.opendiscord.client.contextMenus, init_1.opendiscord.client]);
            //register context menus (create, update & remove)
            if (init_1.opendiscord.defaults.getDefault("forceContextMenuRegistration"))
                init_1.opendiscord.log("Forcing all context menus to be re-registered...", "system");
            init_1.opendiscord.log("Registering context menus... (this can take up to a minute)", "system");
            await init_1.opendiscord.events.get("onContextMenuRegister").emit([init_1.opendiscord.client.contextMenus, init_1.opendiscord.client]);
            if (init_1.opendiscord.defaults.getDefault("contextMenuRegistering")) {
                //get all context menus that are already registered in the bot
                const menus = await init_1.opendiscord.client.contextMenus.getAllRegisteredMenus();
                const removableMenus = menus.unused.map((menu) => menu.menu);
                const newMenus = menus.unregistered.map((menu) => menu.instance);
                const updatableMenus = menus.registered.filter((menu) => menu.requiresUpdate || init_1.opendiscord.defaults.getDefault("forceContextMenuRegistration")).map((menu) => menu.instance);
                //init progress bars
                const removeProgress = init_1.opendiscord.progressbars.get("opendiscord:context-menu-remove");
                const createProgress = init_1.opendiscord.progressbars.get("opendiscord:context-menu-create");
                const updateProgress = init_1.opendiscord.progressbars.get("opendiscord:context-menu-update");
                //remove unused menus, create new menus & update existing menus
                if (init_1.opendiscord.defaults.getDefault("allowContextMenuRemoval"))
                    await init_1.opendiscord.client.contextMenus.removeUnusedMenus(removableMenus, undefined, removeProgress);
                await init_1.opendiscord.client.contextMenus.createNewMenus(newMenus, createProgress);
                await init_1.opendiscord.client.contextMenus.updateExistingMenus(updatableMenus, updateProgress);
                await init_1.opendiscord.events.get("afterContextMenusRegistered").emit([init_1.opendiscord.client.contextMenus, init_1.opendiscord.client]);
            }
            //load text commands
            init_1.opendiscord.log("Loading text commands...", "system");
            if (init_1.opendiscord.defaults.getDefault("allowDumpCommand")) {
                (await import("./core/startup/dump.js")).loadDumpCommand();
            }
            if (init_1.opendiscord.defaults.getDefault("textCommandLoading")) {
                await (await import("./data/framework/commandLoader.js")).loadAllTextCommands();
            }
            await init_1.opendiscord.events.get("onTextCommandLoad").emit([init_1.opendiscord.client.textCommands, init_1.opendiscord.client]);
            await init_1.opendiscord.events.get("afterTextCommandsLoaded").emit([init_1.opendiscord.client.textCommands, init_1.opendiscord.client]);
            //client ready
            await init_1.opendiscord.events.get("afterClientReady").emit([init_1.opendiscord.client]);
        }
    };
    //client init (login)
    init_1.opendiscord.log("Logging in...", "system");
    await init_1.opendiscord.events.get("onClientInit").emit([init_1.opendiscord.client]);
    if (init_1.opendiscord.defaults.getDefault("clientInitiating")) {
        //init client
        init_1.opendiscord.client.initClient();
        await init_1.opendiscord.events.get("afterClientInitiated").emit([init_1.opendiscord.client]);
        //client login
        await init_1.opendiscord.client.login().catch((reason) => process.emit("uncaughtException", new init_1.api.ODSystemError(reason)));
        init_1.opendiscord.log("discord.js client ready!", "info");
    }
    //plugin loading before managers
    await init_1.opendiscord.events.get("onPluginBeforeManagerLoad").emit([]);
    await init_1.opendiscord.events.get("afterPluginBeforeManagerLoaded").emit([]);
    //load questions
    init_1.opendiscord.log("Loading questions...", "system");
    if (init_1.opendiscord.defaults.getDefault("questionLoading")) {
        await (await import("./data/openticket/questionLoader.js")).loadAllQuestions();
    }
    await init_1.opendiscord.events.get("onQuestionLoad").emit([init_1.opendiscord.questions]);
    await init_1.opendiscord.events.get("afterQuestionsLoaded").emit([init_1.opendiscord.questions]);
    //load options
    init_1.opendiscord.log("Loading options...", "system");
    if (init_1.opendiscord.defaults.getDefault("optionLoading")) {
        await (await import("./data/openticket/optionLoader.js")).loadAllOptions();
    }
    await init_1.opendiscord.events.get("onOptionLoad").emit([init_1.opendiscord.options]);
    await init_1.opendiscord.events.get("afterOptionsLoaded").emit([init_1.opendiscord.options]);
    //load panels
    init_1.opendiscord.log("Loading panels...", "system");
    if (init_1.opendiscord.defaults.getDefault("panelLoading")) {
        await (await import("./data/openticket/panelLoader.js")).loadAllPanels();
    }
    await init_1.opendiscord.events.get("onPanelLoad").emit([init_1.opendiscord.panels]);
    await init_1.opendiscord.events.get("afterPanelsLoaded").emit([init_1.opendiscord.panels]);
    //load tickets
    init_1.opendiscord.log("Loading tickets...", "system");
    if (init_1.opendiscord.defaults.getDefault("ticketLoading")) {
        init_1.opendiscord.tickets.useGuild(init_1.opendiscord.client.mainServer);
        await (await import("./data/openticket/ticketLoader.js")).loadAllTickets();
    }
    await init_1.opendiscord.events.get("onTicketLoad").emit([init_1.opendiscord.tickets]);
    await init_1.opendiscord.events.get("afterTicketsLoaded").emit([init_1.opendiscord.tickets]);
    //load roles
    init_1.opendiscord.log("Loading roles...", "system");
    if (init_1.opendiscord.defaults.getDefault("roleLoading")) {
        await (await import("./data/openticket/roleLoader.js")).loadAllRoles();
    }
    await init_1.opendiscord.events.get("onRoleLoad").emit([init_1.opendiscord.roles]);
    await init_1.opendiscord.events.get("afterRolesLoaded").emit([init_1.opendiscord.roles]);
    //load blacklist
    init_1.opendiscord.log("Loading blacklist...", "system");
    if (init_1.opendiscord.defaults.getDefault("blacklistLoading")) {
        await (await import("./data/openticket/blacklistLoader.js")).loadAllBlacklistedUsers();
    }
    await init_1.opendiscord.events.get("onBlacklistLoad").emit([init_1.opendiscord.blacklist]);
    await init_1.opendiscord.events.get("afterBlacklistLoaded").emit([init_1.opendiscord.blacklist]);
    //load transcript compilers
    init_1.opendiscord.log("Loading transcripts...", "system");
    if (init_1.opendiscord.defaults.getDefault("transcriptCompilerLoading")) {
        await (await import("./data/openticket/transcriptLoader.js")).loadAllTranscriptCompilers();
    }
    await init_1.opendiscord.events.get("onTranscriptCompilerLoad").emit([init_1.opendiscord.transcripts]);
    await init_1.opendiscord.events.get("afterTranscriptCompilersLoaded").emit([init_1.opendiscord.transcripts]);
    //load transcript history
    if (init_1.opendiscord.defaults.getDefault("transcriptHistoryLoading")) {
        await (await import("./data/openticket/transcriptLoader.js")).loadTranscriptHistory();
    }
    await init_1.opendiscord.events.get("onTranscriptHistoryLoad").emit([init_1.opendiscord.transcripts]);
    await init_1.opendiscord.events.get("afterTranscriptHistoryLoaded").emit([init_1.opendiscord.transcripts]);
    //plugin loading before builders
    await init_1.opendiscord.events.get("onPluginBeforeBuilderLoad").emit([]);
    await init_1.opendiscord.events.get("afterPluginBeforeBuilderLoaded").emit([]);
    //load button builders
    init_1.opendiscord.log("Loading buttons...", "system");
    if (init_1.opendiscord.defaults.getDefault("buttonBuildersLoading")) {
        await (await import("./builders/buttons.js")).registerAllButtons();
    }
    await init_1.opendiscord.events.get("onButtonBuilderLoad").emit([init_1.opendiscord.builders.buttons, init_1.opendiscord.builders, init_1.opendiscord.actions]);
    await init_1.opendiscord.events.get("afterButtonBuildersLoaded").emit([init_1.opendiscord.builders.buttons, init_1.opendiscord.builders, init_1.opendiscord.actions]);
    //load dropdown builders
    init_1.opendiscord.log("Loading dropdowns...", "system");
    if (init_1.opendiscord.defaults.getDefault("dropdownBuildersLoading")) {
        await (await import("./builders/dropdowns.js")).registerAllDropdowns();
    }
    await init_1.opendiscord.events.get("onDropdownBuilderLoad").emit([init_1.opendiscord.builders.dropdowns, init_1.opendiscord.builders, init_1.opendiscord.actions]);
    await init_1.opendiscord.events.get("afterDropdownBuildersLoaded").emit([init_1.opendiscord.builders.dropdowns, init_1.opendiscord.builders, init_1.opendiscord.actions]);
    //load file builders
    init_1.opendiscord.log("Loading files...", "system");
    if (init_1.opendiscord.defaults.getDefault("fileBuildersLoading")) {
        await (await import("./builders/files.js")).registerAllFiles();
    }
    await init_1.opendiscord.events.get("onFileBuilderLoad").emit([init_1.opendiscord.builders.files, init_1.opendiscord.builders, init_1.opendiscord.actions]);
    await init_1.opendiscord.events.get("afterFileBuildersLoaded").emit([init_1.opendiscord.builders.files, init_1.opendiscord.builders, init_1.opendiscord.actions]);
    //load embed builders
    init_1.opendiscord.log("Loading embeds...", "system");
    if (init_1.opendiscord.defaults.getDefault("embedBuildersLoading")) {
        await (await import("./builders/embeds.js")).registerAllEmbeds();
    }
    await init_1.opendiscord.events.get("onEmbedBuilderLoad").emit([init_1.opendiscord.builders.embeds, init_1.opendiscord.builders, init_1.opendiscord.actions]);
    await init_1.opendiscord.events.get("afterEmbedBuildersLoaded").emit([init_1.opendiscord.builders.embeds, init_1.opendiscord.builders, init_1.opendiscord.actions]);
    //load message builders
    init_1.opendiscord.log("Loading messages...", "system");
    if (init_1.opendiscord.defaults.getDefault("messageBuildersLoading")) {
        await (await import("./builders/messages.js")).registerAllMessages();
    }
    await init_1.opendiscord.events.get("onMessageBuilderLoad").emit([init_1.opendiscord.builders.messages, init_1.opendiscord.builders, init_1.opendiscord.actions]);
    await init_1.opendiscord.events.get("afterMessageBuildersLoaded").emit([init_1.opendiscord.builders.messages, init_1.opendiscord.builders, init_1.opendiscord.actions]);
    //load modal builders
    init_1.opendiscord.log("Loading modals...", "system");
    if (init_1.opendiscord.defaults.getDefault("modalBuildersLoading")) {
        await (await import("./builders/modals.js")).registerAllModals();
    }
    await init_1.opendiscord.events.get("onModalBuilderLoad").emit([init_1.opendiscord.builders.modals, init_1.opendiscord.builders, init_1.opendiscord.actions]);
    await init_1.opendiscord.events.get("afterModalBuildersLoaded").emit([init_1.opendiscord.builders.modals, init_1.opendiscord.builders, init_1.opendiscord.actions]);
    //plugin loading before responders
    await init_1.opendiscord.events.get("onPluginBeforeResponderLoad").emit([]);
    await init_1.opendiscord.events.get("afterPluginBeforeResponderLoaded").emit([]);
    //load command responders
    init_1.opendiscord.log("Loading command responders...", "system");
    if (init_1.opendiscord.defaults.getDefault("commandRespondersLoading")) {
        await (await import("./commands/help.js")).registerCommandResponders();
        await (await import("./commands/stats.js")).registerCommandResponders();
        await (await import("./commands/panel.js")).registerCommandResponders();
        await (await import("./commands/ticket.js")).registerCommandResponders();
        await (await import("./commands/blacklist.js")).registerCommandResponders();
        await (await import("./commands/close.js")).registerCommandResponders();
        await (await import("./commands/reopen.js")).registerCommandResponders();
        await (await import("./commands/delete.js")).registerCommandResponders();
        await (await import("./commands/claim.js")).registerCommandResponders();
        await (await import("./commands/unclaim.js")).registerCommandResponders();
        await (await import("./commands/pin.js")).registerCommandResponders();
        await (await import("./commands/unpin.js")).registerCommandResponders();
        await (await import("./commands/rename.js")).registerCommandResponders();
        await (await import("./commands/move.js")).registerCommandResponders();
        await (await import("./commands/add.js")).registerCommandResponders();
        await (await import("./commands/remove.js")).registerCommandResponders();
        await (await import("./commands/clear.js")).registerCommandResponders();
        await (await import("./commands/autoclose.js")).registerCommandResponders();
        await (await import("./commands/autodelete.js")).registerCommandResponders();
        await (await import("./commands/topic.js")).registerCommandResponders();
        await (await import("./commands/priority.js")).registerCommandResponders();
        await (await import("./commands/transfer.js")).registerCommandResponders();
        await (await import("./commands/leaderboard.js")).registerCommandResponders();
    }
    await init_1.opendiscord.events.get("onCommandResponderLoad").emit([init_1.opendiscord.responders.commands, init_1.opendiscord.responders, init_1.opendiscord.actions]);
    await init_1.opendiscord.events.get("afterCommandRespondersLoaded").emit([init_1.opendiscord.responders.commands, init_1.opendiscord.responders, init_1.opendiscord.actions]);
    //load button responders
    init_1.opendiscord.log("Loading button responders...", "system");
    if (init_1.opendiscord.defaults.getDefault("buttonRespondersLoading")) {
        await (await import("./actions/handleVerifyBar.js")).registerButtonResponders();
        await (await import("./actions/handleTranscriptErrors.js")).registerButtonResponders();
        await (await import("./commands/help.js")).registerButtonResponders();
        await (await import("./commands/ticket.js")).registerButtonResponders();
        await (await import("./commands/close.js")).registerButtonResponders();
        await (await import("./commands/reopen.js")).registerButtonResponders();
        await (await import("./commands/delete.js")).registerButtonResponders();
        await (await import("./commands/claim.js")).registerButtonResponders();
        await (await import("./commands/unclaim.js")).registerButtonResponders();
        await (await import("./commands/pin.js")).registerButtonResponders();
        await (await import("./commands/unpin.js")).registerButtonResponders();
        await (await import("./commands/role.js")).registerButtonResponders();
        await (await import("./commands/clear.js")).registerButtonResponders();
    }
    await init_1.opendiscord.events.get("onButtonResponderLoad").emit([init_1.opendiscord.responders.buttons, init_1.opendiscord.responders, init_1.opendiscord.actions]);
    await init_1.opendiscord.events.get("afterButtonRespondersLoaded").emit([init_1.opendiscord.responders.buttons, init_1.opendiscord.responders, init_1.opendiscord.actions]);
    //load dropdown responders
    init_1.opendiscord.log("Loading dropdown responders...", "system");
    if (init_1.opendiscord.defaults.getDefault("dropdownRespondersLoading")) {
        await (await import("./commands/ticket.js")).registerDropdownResponders();
    }
    await init_1.opendiscord.events.get("onDropdownResponderLoad").emit([init_1.opendiscord.responders.dropdowns, init_1.opendiscord.responders, init_1.opendiscord.actions]);
    await init_1.opendiscord.events.get("afterDropdownRespondersLoaded").emit([init_1.opendiscord.responders.dropdowns, init_1.opendiscord.responders, init_1.opendiscord.actions]);
    //load modal responders
    init_1.opendiscord.log("Loading modal responders...", "system");
    if (init_1.opendiscord.defaults.getDefault("modalRespondersLoading")) {
        await (await import("./commands/ticket.js")).registerModalResponders();
        await (await import("./commands/close.js")).registerModalResponders();
        await (await import("./commands/reopen.js")).registerModalResponders();
        await (await import("./commands/delete.js")).registerModalResponders();
        await (await import("./commands/claim.js")).registerModalResponders();
        await (await import("./commands/unclaim.js")).registerModalResponders();
        await (await import("./commands/pin.js")).registerModalResponders();
        await (await import("./commands/unpin.js")).registerModalResponders();
    }
    await init_1.opendiscord.events.get("onModalResponderLoad").emit([init_1.opendiscord.responders.modals, init_1.opendiscord.responders, init_1.opendiscord.actions]);
    await init_1.opendiscord.events.get("afterModalRespondersLoaded").emit([init_1.opendiscord.responders.modals, init_1.opendiscord.responders, init_1.opendiscord.actions]);
    //load context menu responders
    init_1.opendiscord.log("Loading context menu responders...", "system");
    if (init_1.opendiscord.defaults.getDefault("contextMenuRespondersLoading")) {
        //TODO!!
    }
    await init_1.opendiscord.events.get("onContextMenuResponderLoad").emit([init_1.opendiscord.responders.contextMenus, init_1.opendiscord.responders, init_1.opendiscord.actions]);
    await init_1.opendiscord.events.get("afterContextMenuRespondersLoaded").emit([init_1.opendiscord.responders.contextMenus, init_1.opendiscord.responders, init_1.opendiscord.actions]);
    //load autocomplete responders
    init_1.opendiscord.log("Loading autocomplete responders...", "system");
    if (init_1.opendiscord.defaults.getDefault("autocompleteRespondersLoading")) {
        await (await import("./commands/autocomplete.js")).registerAutocompleteResponders();
    }
    await init_1.opendiscord.events.get("onAutocompleteResponderLoad").emit([init_1.opendiscord.responders.autocomplete, init_1.opendiscord.responders, init_1.opendiscord.actions]);
    await init_1.opendiscord.events.get("afterAutocompleteRespondersLoaded").emit([init_1.opendiscord.responders.autocomplete, init_1.opendiscord.responders, init_1.opendiscord.actions]);
    //plugin loading before finalizations
    await init_1.opendiscord.events.get("onPluginBeforeFinalizationLoad").emit([]);
    await init_1.opendiscord.events.get("afterPluginBeforeFinalizationLoaded").emit([]);
    //load actions
    init_1.opendiscord.log("Loading actions...", "system");
    if (init_1.opendiscord.defaults.getDefault("actionsLoading")) {
        await (await import("./actions/createTicketPermissions.js")).registerActions();
        await (await import("./actions/createTranscript.js")).registerActions();
        await (await import("./actions/createTicket.js")).registerActions();
        await (await import("./actions/closeTicket.js")).registerActions();
        await (await import("./actions/deleteTicket.js")).registerActions();
        await (await import("./actions/reopenTicket.js")).registerActions();
        await (await import("./actions/claimTicket.js")).registerActions();
        await (await import("./actions/unclaimTicket.js")).registerActions();
        await (await import("./actions/pinTicket.js")).registerActions();
        await (await import("./actions/unpinTicket.js")).registerActions();
        await (await import("./actions/renameTicket.js")).registerActions();
        await (await import("./actions/moveTicket.js")).registerActions();
        await (await import("./actions/addTicketUser.js")).registerActions();
        await (await import("./actions/removeTicketUser.js")).registerActions();
        await (await import("./actions/reactionRole.js")).registerActions();
        await (await import("./actions/clearTickets.js")).registerActions();
        await (await import("./actions/updateTicketTopic.js")).registerActions();
        await (await import("./actions/updateTicketPriority.js")).registerActions();
        await (await import("./actions/transferTicket.js")).registerActions();
    }
    await init_1.opendiscord.events.get("onActionLoad").emit([init_1.opendiscord.actions]);
    await init_1.opendiscord.events.get("afterActionsLoaded").emit([init_1.opendiscord.actions]);
    //load verifybars
    init_1.opendiscord.log("Loading verifybars...", "system");
    if (init_1.opendiscord.defaults.getDefault("verifyBarsLoading")) {
        await (await import("./actions/closeTicket.js")).registerVerifyBars();
        await (await import("./actions/deleteTicket.js")).registerVerifyBars();
        await (await import("./actions/reopenTicket.js")).registerVerifyBars();
        await (await import("./actions/claimTicket.js")).registerVerifyBars();
        await (await import("./actions/unclaimTicket.js")).registerVerifyBars();
        await (await import("./actions/pinTicket.js")).registerVerifyBars();
        await (await import("./actions/unpinTicket.js")).registerVerifyBars();
    }
    await init_1.opendiscord.events.get("onVerifyBarLoad").emit([init_1.opendiscord.verifybars]);
    await init_1.opendiscord.events.get("afterVerifyBarsLoaded").emit([init_1.opendiscord.verifybars]);
    //load permissions
    init_1.opendiscord.log("Loading permissions...", "system");
    if (init_1.opendiscord.defaults.getDefault("permissionsLoading")) {
        await (await import("./data/framework/permissionLoader.js")).loadAllPermissions();
    }
    await init_1.opendiscord.events.get("onPermissionLoad").emit([init_1.opendiscord.permissions]);
    await init_1.opendiscord.events.get("afterPermissionsLoaded").emit([init_1.opendiscord.permissions]);
    //load posts
    init_1.opendiscord.log("Loading posts...", "system");
    if (init_1.opendiscord.defaults.getDefault("postsLoading")) {
        await (await import("./data/framework/postLoader.js")).loadAllPosts();
    }
    await init_1.opendiscord.events.get("onPostLoad").emit([init_1.opendiscord.posts]);
    await init_1.opendiscord.events.get("afterPostsLoaded").emit([init_1.opendiscord.posts]);
    //init posts
    await init_1.opendiscord.events.get("onPostInit").emit([init_1.opendiscord.posts]);
    if (init_1.opendiscord.defaults.getDefault("postsInitiating")) {
        if (init_1.opendiscord.client.mainServer)
            init_1.opendiscord.posts.init(init_1.opendiscord.client.mainServer);
        await init_1.opendiscord.events.get("afterPostsInitiated").emit([init_1.opendiscord.posts]);
    }
    //load cooldowns
    init_1.opendiscord.log("Loading cooldowns...", "system");
    if (init_1.opendiscord.defaults.getDefault("cooldownsLoading")) {
        await (await import("./data/framework/cooldownLoader.js")).loadAllCooldowns();
    }
    await init_1.opendiscord.events.get("onCooldownLoad").emit([init_1.opendiscord.cooldowns]);
    await init_1.opendiscord.events.get("afterCooldownsLoaded").emit([init_1.opendiscord.cooldowns]);
    //init cooldowns
    await init_1.opendiscord.events.get("onCooldownInit").emit([init_1.opendiscord.cooldowns]);
    if (init_1.opendiscord.defaults.getDefault("cooldownsInitiating")) {
        await init_1.opendiscord.cooldowns.init();
        await init_1.opendiscord.events.get("afterCooldownsInitiated").emit([init_1.opendiscord.cooldowns]);
    }
    //load help menu categories
    init_1.opendiscord.log("Loading help menu...", "system");
    if (init_1.opendiscord.defaults.getDefault("helpMenuCategoryLoading")) {
        await (await import("./data/framework/helpMenuLoader.js")).loadAllHelpMenuCategories();
    }
    await init_1.opendiscord.events.get("onHelpMenuCategoryLoad").emit([init_1.opendiscord.helpmenu]);
    await init_1.opendiscord.events.get("afterHelpMenuCategoriesLoaded").emit([init_1.opendiscord.helpmenu]);
    //load help menu components
    if (init_1.opendiscord.defaults.getDefault("helpMenuComponentLoading")) {
        await (await import("./data/framework/helpMenuLoader.js")).loadAllHelpMenuComponents();
    }
    await init_1.opendiscord.events.get("onHelpMenuComponentLoad").emit([init_1.opendiscord.helpmenu]);
    await init_1.opendiscord.events.get("afterHelpMenuComponentsLoaded").emit([init_1.opendiscord.helpmenu]);
    //load stat scopes
    init_1.opendiscord.log("Loading stats...", "system");
    if (init_1.opendiscord.defaults.getDefault("statScopesLoading")) {
        init_1.opendiscord.stats.useDatabase(init_1.opendiscord.databases.get("opendiscord:stats"));
        await (await import("./data/framework/statLoader.js")).loadAllStatScopes();
    }
    await init_1.opendiscord.events.get("onStatScopeLoad").emit([init_1.opendiscord.stats]);
    await init_1.opendiscord.events.get("afterStatScopesLoaded").emit([init_1.opendiscord.stats]);
    //load stats
    if (init_1.opendiscord.defaults.getDefault("statLoading")) {
        await (await import("./data/framework/statLoader.js")).loadAllStats();
    }
    await init_1.opendiscord.events.get("onStatLoad").emit([init_1.opendiscord.stats]);
    await init_1.opendiscord.events.get("afterStatsLoaded").emit([init_1.opendiscord.stats]);
    //init stats
    await init_1.opendiscord.events.get("onStatInit").emit([init_1.opendiscord.stats]);
    if (init_1.opendiscord.defaults.getDefault("statInitiating")) {
        await init_1.opendiscord.stats.init();
        await init_1.opendiscord.events.get("afterStatsInitiated").emit([init_1.opendiscord.stats]);
    }
    //plugin loading before code
    await init_1.opendiscord.events.get("onPluginBeforeCodeLoad").emit([]);
    await init_1.opendiscord.events.get("afterPluginBeforeCodeLoaded").emit([]);
    //load code
    init_1.opendiscord.log("Loading code...", "system");
    if (init_1.opendiscord.defaults.getDefault("codeLoading")) {
        await (await import("./data/framework/codeLoader.js")).loadAllCode();
    }
    await init_1.opendiscord.events.get("onCodeLoad").emit([init_1.opendiscord.code]);
    await init_1.opendiscord.events.get("afterCodeLoaded").emit([init_1.opendiscord.code]);
    //execute code
    await init_1.opendiscord.events.get("onCodeExecute").emit([init_1.opendiscord.code]);
    if (init_1.opendiscord.defaults.getDefault("codeExecution")) {
        await init_1.opendiscord.code.execute();
        await init_1.opendiscord.events.get("afterCodeExecuted").emit([init_1.opendiscord.code]);
    }
    //finish setup
    init_1.opendiscord.log("Setup complete!", "info");
    //load livestatus sources
    init_1.opendiscord.log("Loading livestatus...", "system");
    if (init_1.opendiscord.defaults.getDefault("liveStatusLoading")) {
        await (await import("./data/framework/liveStatusLoader.js")).loadAllLiveStatusSources();
    }
    await init_1.opendiscord.events.get("onLiveStatusSourceLoad").emit([init_1.opendiscord.livestatus]);
    await init_1.opendiscord.events.get("afterLiveStatusSourcesLoaded").emit([init_1.opendiscord.livestatus]);
    //load startscreen
    init_1.opendiscord.log("Loading startscreen...", "system");
    if (init_1.opendiscord.defaults.getDefault("startScreenLoading")) {
        await (await import("./data/framework/startScreenLoader.js")).loadAllStartScreenComponents();
    }
    await init_1.opendiscord.events.get("onStartScreenLoad").emit([init_1.opendiscord.startscreen]);
    await init_1.opendiscord.events.get("afterStartScreensLoaded").emit([init_1.opendiscord.startscreen]);
    //render startscreen
    await init_1.opendiscord.events.get("onStartScreenRender").emit([init_1.opendiscord.startscreen]);
    if (init_1.opendiscord.defaults.getDefault("startScreenRendering")) {
        await init_1.opendiscord.startscreen.renderAllComponents();
        if (init_1.opendiscord.languages.getLanguageMetadata(false)?.automated) {
            console.log("===================");
            init_1.opendiscord.log("You are using a language which has been translated using Google Translate or AI!", "warning");
            init_1.opendiscord.log("Please help us improve the translation by contributing to our project!", "warning");
            console.log("===================");
        }
        if (init_1.opendiscord.console.silent) {
            init_1.opendiscord.console.silent = false;
            init_1.opendiscord.log("Silent mode is active! Logs won't be shown in the console.", "warning");
            init_1.opendiscord.console.silent = true;
        }
        await init_1.opendiscord.events.get("afterStartScreensRendered").emit([init_1.opendiscord.startscreen]);
    }
    //YIPPPIE!!
    //The startup of Open Ticket is completed :)
    await init_1.opendiscord.events.get("beforeReadyForUsage").emit([]);
    init_1.opendiscord.readyStartupDate = new Date();
    await init_1.opendiscord.events.get("onReadyForUsage").emit([]);
};
main();
