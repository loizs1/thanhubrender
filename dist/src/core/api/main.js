"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODMain = void 0;
//BASE MODULES
const base_1 = require("./modules/base");
const console_1 = require("./modules/console");
const checker_1 = require("./modules/checker");
const defaults_1 = require("./modules/defaults");
//DEFAULT MODULES
const base_2 = require("./defaults/base");
const plugin_1 = require("./defaults/plugin");
const event_1 = require("./defaults/event");
const config_1 = require("./defaults/config");
const database_1 = require("./defaults/database");
const flag_1 = require("./defaults/flag");
const session_1 = require("./defaults/session");
const language_1 = require("./defaults/language");
const checker_2 = require("./defaults/checker");
const client_1 = require("./defaults/client");
const builder_1 = require("./defaults/builder");
const responder_1 = require("./defaults/responder");
const action_1 = require("./defaults/action");
const permission_1 = require("./defaults/permission");
const helpmenu_1 = require("./defaults/helpmenu");
const stat_1 = require("./defaults/stat");
const code_1 = require("./defaults/code");
const cooldown_1 = require("./defaults/cooldown");
const post_1 = require("./defaults/post");
const verifybar_1 = require("./defaults/verifybar");
const progressbar_1 = require("./defaults/progressbar");
const startscreen_1 = require("./defaults/startscreen");
const console_2 = require("./defaults/console");
//OPEN TICKET MODULES
const option_1 = require("./openticket/option");
const panel_1 = require("./openticket/panel");
const ticket_1 = require("./openticket/ticket");
const question_1 = require("./openticket/question");
const blacklist_1 = require("./openticket/blacklist");
const transcript_1 = require("./openticket/transcript");
const role_1 = require("./openticket/role");
const priority_1 = require("./openticket/priority");
/**## ODMain `class`
 * This is the main Open Ticket class.
 * It contains all managers from the entire bot & has shortcuts to the event & logging system.
 *
 * This class can't be overwritten or extended & is available as the global variable `openticket`!
 */
class ODMain {
    /**The manager that handles all versions in the bot. */
    versions;
    /**The timestamp that the (node.js) process of the bot started. */
    processStartupDate = new Date();
    /**The timestamp that the bot finished loading and is ready for usage. */
    readyStartupDate = null;
    /**The manager responsible for the debug file. (`otdebug.txt`) */
    debugfile;
    /**The manager responsible for the console system. (logs, errors, etc) */
    console;
    /**The manager responsible for sending debug logs to the debug file. (`otdebug.txt`) */
    debug;
    /**The manager containing all Open Ticket events. */
    events;
    /**The manager that handles & executes all plugins in the bot. */
    plugins;
    /**The manager that manages & checks all the console flags of the bot. (like `--debug`) */
    flags;
    /**The manager responsible for progress bars in the console. */
    progressbars;
    /**The manager that manages & contains all the config files of the bot. (like `config/general.json`) */
    configs;
    /**The manager that manages & contains all the databases of the bot. (like `database/global.json`) */
    databases;
    /**The manager that manages all the data sessions of the bot. (it's a temporary database) */
    sessions;
    /**The manager that manages all languages & translations of the bot. (but not for plugins) */
    languages;
    /**The manager that handles & executes all config checkers in the bot. (the code that checks if you have something wrong in your config) */
    checkers;
    /**The manager that manages all builders in the bot. (e.g. buttons, dropdowns, messages, modals, etc) */
    builders;
    /**The manager that manages all responders in the bot. (e.g. commands, buttons, dropdowns, modals) */
    responders;
    /**The manager that manages all actions or procedures in the bot. (e.g. ticket-creation, ticket-deletion, ticket-claiming, etc) */
    actions;
    /**The manager that manages all verify bars in the bot. (the ✅ ❌ buttons) */
    verifybars;
    /**The manager that contains all permissions for commands & actions in the bot. (use it to check if someone has admin perms or not) */
    permissions;
    /**The manager that contains all cooldowns of the bot. (e.g. ticket-cooldowns) */
    cooldowns;
    /**The manager that manages & renders the Open Ticket help menu. (not the embed, but the text) */
    helpmenu;
    /**The manager that manages, saves & renders the Open Ticket statistics. (not the embed, but the text & database) */
    stats;
    /**This manager is a place where you can put code that executes when the bot almost finishes the setup. (can be used for less important stuff that doesn't require an exact time-order) */
    code;
    /**The manager that manages all posts (static discord channels) in the bot. (e.g. (transcript) logs, etc) */
    posts;
    /**The manager responsible for everything related to the client. (e.g. status, login, slash & text commands, etc) */
    client;
    /**This manager contains A LOD of booleans. With these switches, you can turn off "default behaviours" from the bot. This is used if you want to replace the default Open Ticket code.  */
    defaults;
    /**This manager manages all the variables in the ENV. It reads from both the `.env` file & the `process.env`. (these 2 will be combined)  */
    env;
    /**The manager responsible for the livestatus system. (remote console logs) */
    livestatus;
    /**The manager responsible for the livestatus system. (remote console logs) */
    startscreen;
    //OPEN TICKET
    /**The manager that manages all the data of questions in the bot. (these are used in options & tickets) */
    questions;
    /**The manager that manages all the data of options in the bot. (these are used for panels, ticket creation, reaction roles) */
    options;
    /**The manager that manages all the data of panels in the bot. (panels contain the options) */
    panels;
    /**The manager that manages all tickets in the bot. (here, you can get & edit a lot of data from tickets) */
    tickets;
    /**The manager that manages the ticket blacklist. (people who are blacklisted can't create a ticket) */
    blacklist;
    /**The manager that manages the ticket transcripts. (both the history & compilers) */
    transcripts;
    /**The manager that manages all reaction roles in the bot. (here, you can add additional data to roles) */
    roles;
    /**The manager that manages all priority levels in the bot. (register/edit ticket priority levels) */
    priorities;
    constructor() {
        this.versions = new base_2.ODVersionManager_Default();
        this.versions.add(base_1.ODVersion.fromString("opendiscord:version", "v4.1.3"));
        this.versions.add(base_1.ODVersion.fromString("opendiscord:api", "v1.0.0"));
        this.versions.add(base_1.ODVersion.fromString("opendiscord:transcripts", "v2.1.0"));
        this.versions.add(base_1.ODVersion.fromString("opendiscord:livestatus", "v2.0.0"));
        this.debugfile = new console_1.ODDebugFileManager("./", "otdebug.txt", 5000, this.versions.get("opendiscord:version"));
        this.console = new console_1.ODConsoleManager(100, this.debugfile);
        this.debug = new console_1.ODDebugger(this.console);
        this.events = new event_1.ODEventManager_Default(this.debug);
        this.plugins = new plugin_1.ODPluginManager_Default(this.debug);
        this.flags = new flag_1.ODFlagManager_Default(this.debug);
        this.progressbars = new progressbar_1.ODProgressBarManager_Default(this.debug);
        this.configs = new config_1.ODConfigManager_Default(this.debug);
        this.databases = new database_1.ODDatabaseManager_Default(this.debug);
        this.sessions = new session_1.ODSessionManager_Default(this.debug);
        this.languages = new language_1.ODLanguageManager_Default(this.debug, false);
        this.checkers = new checker_2.ODCheckerManager_Default(this.debug, new checker_1.ODCheckerStorage(), new checker_2.ODCheckerRenderer_Default(), new checker_2.ODCheckerTranslationRegister_Default(), new checker_2.ODCheckerFunctionManager_Default(this.debug));
        this.builders = new builder_1.ODBuilderManager_Default(this.debug);
        this.client = new client_1.ODClientManager_Default(this.debug);
        this.responders = new responder_1.ODResponderManager_Default(this.debug, this.client);
        this.actions = new action_1.ODActionManager_Default(this.debug);
        this.verifybars = new verifybar_1.ODVerifyBarManager_Default(this.debug);
        this.permissions = new permission_1.ODPermissionManager_Default(this.debug, this.client);
        this.cooldowns = new cooldown_1.ODCooldownManager_Default(this.debug);
        this.helpmenu = new helpmenu_1.ODHelpMenuManager_Default(this.debug);
        this.stats = new stat_1.ODStatsManager_Default(this.debug);
        this.code = new code_1.ODCodeManager_Default(this.debug);
        this.posts = new post_1.ODPostManager_Default(this.debug);
        this.defaults = new defaults_1.ODDefaultsManager();
        this.env = new base_1.ODEnvHelper();
        this.livestatus = new console_2.ODLiveStatusManager_Default(this.debug, this);
        this.startscreen = new startscreen_1.ODStartScreenManager_Default(this.debug, this.livestatus);
        //OPEN TICKET
        this.questions = new question_1.ODQuestionManager(this.debug);
        this.options = new option_1.ODOptionManager(this.debug);
        this.panels = new panel_1.ODPanelManager(this.debug);
        this.tickets = new ticket_1.ODTicketManager(this.debug, this.client);
        this.blacklist = new blacklist_1.ODBlacklistManager(this.debug);
        this.transcripts = new transcript_1.ODTranscriptManager_Default(this.debug, this.tickets, this.client, this.permissions);
        this.roles = new role_1.ODRoleManager(this.debug);
        this.priorities = new priority_1.ODPriorityManager_Default(this.debug);
    }
    log(message, type, params) {
        if (message instanceof console_1.ODConsoleMessage)
            this.console.log(message);
        else if (message instanceof console_1.ODError)
            this.console.log(message);
        else if (["string", "number", "boolean", "object"].includes(typeof message))
            this.console.log(message, type, params);
    }
}
exports.ODMain = ODMain;
