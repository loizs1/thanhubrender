"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderQuickSetup = renderQuickSetup;
const index_1 = require("../../index");
const terminal_kit_1 = require("terminal-kit");
const ansis_1 = __importDefault(require("ansis"));
const discord = __importStar(require("discord.js"));
const crypto_1 = __importDefault(require("crypto"));
const cli_1 = require("./cli");
function generateUniqueIdFromName(name) {
    //id only allows a-z, 0-9 & dash characters (& replace spaces with dashes)
    const filteredChars = name.toLowerCase().replaceAll(" ", "-").split("").filter((ch) => /^[a-zA-Z0-9-]{1}$/.test(ch));
    const randomSuffix = "-" + crypto_1.default.randomBytes(4).toString("hex");
    return filteredChars.join("") + randomSuffix;
}
const stepCount = (count) => "(Step " + count + "/24) ";
const quickSetupStorage = { ticketOptions: [], optionIdStorage: [] };
const autoCompleteMenuOpts = {
    style: terminal_kit_1.terminal.white,
    selectedStyle: terminal_kit_1.terminal.bgBlue.white
};
const presetColors = new Map([
    ["dark red", "#992d22"],
    ["red", "#ff0000"],
    ["light red", "#f06c6c"],
    ["dark orange", "#ed510e"],
    ["orange", "#ed6f0e"],
    ["light orange", "#f0b06c"],
    ["openticket", "#f8ba00"],
    ["dark yellow", "#deb100"],
    ["yellow", "#ffff00"],
    ["light yellow", "#ffff8c"],
    ["banana", "#ffe896"],
    ["lime", "#a8e312"],
    ["dark green", "#009600"],
    ["green", "#00ff00"],
    ["light green", "#76f266"],
    ["dark cyan", "#00abab"],
    ["cyan", "#00ffff"],
    ["light cyan", "#63ffff"],
    ["aquamarine", "#7fffd4"],
    ["dark skyblue", "#006bc9"],
    ["skyblue", "#0095ff"],
    ["light skyblue", "#40bfff"],
    ["dark blue", "#00006e"],
    ["blue", "#0000ff"],
    ["light blue", "#5353fc"],
    ["blurple", "#5865F2"],
    ["dark purple", "#3f009e"],
    ["purple", "#8000ff"],
    ["light purple", "#9257eb"],
    ["dark pink", "#b82ab0"],
    ["pink", "#ff6bf8"],
    ["light pink", "#ff9cfa"],
    ["magenta", "#ff00ff"],
    ["black", "#000000"],
    ["brown", "#806050"],
    ["dark gray", "#4f4f4f"],
    ["gray", "#808080"],
    ["light gray", "#b3b3b3"],
    ["white", "#ffffff"],
    ["invisible", "#393A41"]
]);
async function renderQuickSetup(backFn) {
    if (quickSetupRequiresReset())
        await renderQuickSetupWarning(backFn);
    else
        await renderQuickSetupWelcome(backFn);
}
function quickSetupRequiresReset() {
    const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
    if (generalConfig.data.token != "your bot token here! (or leave empty when using 'tokenFromENV')")
        return true;
    if (generalConfig.data.mainColor != "#f8ba00")
        return true;
    if (generalConfig.data.language != "english")
        return true;
    if (generalConfig.data.prefix != "!ticket ")
        return true;
    if (generalConfig.data.serverId != "discord server id")
        return true;
    return false;
}
async function renderQuickSetupWarning(backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Warning");
    terminal_kit_1.terminal.bold(ansis_1.default.yellow("WARNING! ") + ansis_1.default.red("By using the 'Quick Setup' feature, your current config will be completely resetted!"));
    terminal_kit_1.terminal.gray("\nAre you sure you want to continue?\n");
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        ansis_1.default.green("✅ No, take me back."),
        ansis_1.default.red("🚨 Yes, continue and reset the config.")
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled || answer.selectedIndex == 0)
        return await backFn();
    if (answer.selectedIndex == 1)
        await renderQuickSetupWelcome(async () => { await renderQuickSetupWarning(backFn); });
}
async function renderQuickSetupWelcome(backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Introduction");
    terminal_kit_1.terminal.bold.underline.blue("Open Ticket: Quick Setup\n");
    terminal_kit_1.terminal.gray([
        "Hi there! Thank you for downloading and installing Open Ticket.",
        "You have chosen to configure the bot using the 'Quick Setup CLI'.",
        "",
        "This tool will help you with configuring Open Ticket using a step-by-step method.",
        ansis_1.default.gray("You can " + ansis_1.default.red.bold("navigate using the arrow-keys") + " and " + ansis_1.default.red.bold("go back using ESC") + "."),
        "",
        ansis_1.default.magenta("The configuration should normally only take around 6 minutes."),
        ansis_1.default.magenta("Once you've completed the form, the bot is ready for usage!")
    ].join("\n") + "\n\n");
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        ansis_1.default.green("Press 'Enter' to start!")
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return await backFn();
    else if (answer.selectedIndex == 0)
        await renderQuickSetupDevPortal(async () => { await renderQuickSetupWelcome(backFn); });
}
async function renderQuickSetupDevPortal(backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Discord Bot & Developer Portal");
    terminal_kit_1.terminal.bold.blue(stepCount(1) + "Have you already created a Discord bot you can use for Open Ticket?\n");
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        "✅ Yes I have, and it has been invited to the server.",
        "❓ No not yet, I don't know how to create one.",
        "👶 I've never seen a Discord bot before.",
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return await backFn();
    else if (answer.selectedIndex == 0)
        await renderQuickSetupBotToken(async () => { await renderQuickSetupDevPortal(backFn); });
    else if (answer.selectedIndex == 1)
        await renderQuickSetupDevPortalGuide(0, async () => { await renderQuickSetupDevPortal(backFn); });
    else if (answer.selectedIndex == 2)
        await renderQuickSetupDevPortalGuide(1, async () => { await renderQuickSetupDevPortal(backFn); });
}
async function renderQuickSetupDevPortalGuide(variation, backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Discord Bot & Developer Portal");
    if (variation == 0) {
        terminal_kit_1.terminal.bold.blue(stepCount(1.1) + "You've mentioned that you don't know how to create a Discord bot.\n\n");
        terminal_kit_1.terminal.gray("Please visit the following URL for a step-by-step guide on how to create a Discord bot.\nIf it still doesn't work, join our Discord server and we will help you further!\n" + ansis_1.default.magenta("=> https://otdocs.dj-dj.be/docs/guides/get-started#bot\n\n"));
    }
    else {
        terminal_kit_1.terminal.bold.blue(stepCount(1.2) + "You've mentioned that you've never seen Discord bot before.\n\n");
        terminal_kit_1.terminal.gray("How did you even download Open Ticket 🤪? But all jokes aside, we have a step-by-step guide on how to create a Discord bot.\nIf it still doesn't work, join our Discord server and we will help you further!\n" + ansis_1.default.magenta("=> https://otdocs.dj-dj.be/docs/guides/get-started#bot\n\n"));
    }
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        ansis_1.default.green("✅ Alright, I've made the bot. Take me back please!")
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    return await backFn();
}
async function quickSetupLogin(token) {
    const client = new index_1.api.ODClientManager(index_1.opendiscord.debug);
    client.token = token;
    client.intents.push("Guilds", "GuildMessages", "DirectMessages", "GuildEmojisAndStickers", "GuildMembers", "MessageContent", "GuildWebhooks", "GuildInvites");
    client.privileges.push("MessageContent", "GuildMembers");
    client.partials.push("Channel", "Message");
    client.permissions.push("AddReactions", "AttachFiles", "CreatePrivateThreads", "CreatePublicThreads", "EmbedLinks", "ManageChannels", "ManageGuild", "ManageMessages", "ChangeNickname", "ManageRoles", "ManageThreads", "ManageWebhooks", "MentionEveryone", "ReadMessageHistory", "SendMessages", "SendMessagesInThreads", "UseApplicationCommands", "UseExternalEmojis", "ViewAuditLog", "ViewChannel");
    client.initClient();
    //client login
    return new Promise(async (resolve) => {
        try {
            client.readyListener = async () => {
                client.activity.setStatus("custom", "Configuring Open Ticket...", "idle", "", true);
                resolve(client);
            };
            const success = await client.login(true);
            if (!success)
                resolve(null);
        }
        catch (err) {
            resolve(null);
        }
    });
}
async function renderQuickSetupBotToken(backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Bot Token");
    terminal_kit_1.terminal.bold.blue(stepCount(2) + "Please insert the token of your discord bot.\n");
    terminal_kit_1.terminal.gray("This is used to configure the bot and is then stored securely in the './config/general.json' file.\n\n> ");
    const answer = await terminal_kit_1.terminal.inputField({
        style: terminal_kit_1.terminal.white,
        hintStyle: terminal_kit_1.terminal.gray,
        cancelable: true
    }).promise;
    if (typeof answer != "string")
        return await backFn();
    else {
        const result = await quickSetupLogin(answer);
        if (!result) {
            //login failure
            terminal_kit_1.terminal.red.bold("\n\n❌ Something went wrong with logging into the bot.\n");
            terminal_kit_1.terminal.gray("Please try again and check your token for any mistakes.\nAlso make sure the permissions and priviliged gateaway intents are configured correctly in the developer panel.");
            await index_1.utilities.timer(3000);
            //retry
            await renderQuickSetupBotToken(backFn);
        }
        else {
            //login success
            terminal_kit_1.terminal.green.bold("\n\n✅ Succesfully logged into the bot.\n");
            terminal_kit_1.terminal.gray("Your bot should be online with the status 'Configuring Open Ticket...'.");
            await index_1.utilities.timer(3000);
            //continue
            quickSetupStorage.client = result;
            await renderQuickSetupServer(async () => { await renderQuickSetupBotToken(backFn); });
        }
    }
}
async function renderQuickSetupServer(backFn) {
    const { client } = quickSetupStorage;
    if (!client)
        return;
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Discord Server");
    terminal_kit_1.terminal.bold.blue(stepCount(3) + "Please select a Discord Server to use.\n");
    terminal_kit_1.terminal.gray("The bot will only work in this server.\n\n");
    const guilds = await client.getGuilds();
    const nameList = guilds.map((g) => g.name);
    const longestName = index_1.utilities.getLongestLength(nameList);
    const guildList = guilds.map((g) => g.name.padEnd(longestName + 5, " ") + ansis_1.default.gray(" (" + g.id + ")"));
    const answer = await terminal_kit_1.terminal.singleColumnMenu([ansis_1.default.green("🔄 <Refresh List>"), ...guildList], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return backFn();
    if (answer.selectedIndex == 0)
        return await renderQuickSetupServer(backFn);
    const server = guilds[answer.selectedIndex - 1];
    quickSetupStorage.guild = server;
    await renderQuickSetupAdminRoles([], async () => { await renderQuickSetupServer(backFn); });
}
async function renderQuickSetupAdminRoles(selectedAdmins, backFn, cachedRoles) {
    const { client, guild } = quickSetupStorage;
    if (!client || !guild)
        return;
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Admin Roles");
    terminal_kit_1.terminal.bold.blue(stepCount(4) + "Please select all 'Global Admins' roles to use.\n");
    terminal_kit_1.terminal.gray("Users with one of these roles will be able to access & interact with all tickets.\n\n");
    const roles = cachedRoles ?? (await guild.roles.fetch()).toJSON().sort((a, b) => b.position - a.position);
    const nameList = roles.map((r) => r.name);
    const longestName = index_1.utilities.getLongestLength(nameList);
    const roleList = roles.map((r) => selectedAdmins.includes(r.id) ? ansis_1.default.green("(✅) " + r.name.padEnd(longestName + 5, " ") + ansis_1.default.gray(" (" + r.id + ")")) : r.name.padEnd(longestName + 5, " ") + ansis_1.default.gray(" (" + r.id + ")"));
    const answer = await terminal_kit_1.terminal.singleColumnMenu([ansis_1.default.green("🔄 <Refresh List>"), ansis_1.default.green("🆗 <Continue>"), ...roleList], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return backFn();
    if (answer.selectedIndex == 0)
        return await renderQuickSetupAdminRoles(selectedAdmins, backFn);
    if (answer.selectedIndex == 1) {
        quickSetupStorage.globalAdmins = selectedAdmins;
        return await renderQuickSetupColorPicker(async () => { await renderQuickSetupAdminRoles(selectedAdmins, backFn, cachedRoles); });
    }
    const adminRole = roles[answer.selectedIndex - 2];
    const index = selectedAdmins.findIndex((r) => r == adminRole.id);
    if (index > -1)
        selectedAdmins.splice(index, 1);
    else
        selectedAdmins.push(adminRole.id);
    return await renderQuickSetupAdminRoles(selectedAdmins, backFn, roles);
}
async function renderQuickSetupColorPicker(backFn) {
    const { client, guild, globalAdmins } = quickSetupStorage;
    if (!client || !guild || !globalAdmins)
        return;
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Main Color");
    terminal_kit_1.terminal.bold.blue(stepCount(5) + "Please insert a valid hex-color to use in all embeds.\n");
    terminal_kit_1.terminal.gray("You can also choose from existing presets. (e.g. red, green, blue, ...)\n\n> ");
    const answer = await terminal_kit_1.terminal.inputField({
        style: terminal_kit_1.terminal.white,
        hintStyle: terminal_kit_1.terminal.gray,
        cancelable: true,
        autoComplete: Array.from(presetColors.keys()),
        autoCompleteHint: true,
        autoCompleteMenu: autoCompleteMenuOpts
    }).promise;
    if (typeof answer != "string")
        return await backFn();
    else {
        if (!Array.from(presetColors.keys()).includes(answer) && !/^#[0-9a-f]{6}$/.test(answer)) {
            terminal_kit_1.terminal.red.bold("\n\n❌ Please insert a valid hex-color or a color from the list. (TIP: use tab for autocomplete)\n");
            await index_1.utilities.timer(2000);
            return await renderQuickSetupColorPicker(backFn);
        }
        let color;
        if (Array.from(presetColors.keys()).includes(answer)) {
            color = presetColors.get(answer);
        }
        else {
            color = answer;
        }
        quickSetupStorage.mainColor = color;
        return await renderQuickSetupLanguage(async () => { await renderQuickSetupColorPicker(backFn); });
    }
}
async function renderQuickSetupLanguage(backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Language");
    terminal_kit_1.terminal.bold.blue(stepCount(6) + "What language would you like to use in the bot?\n");
    terminal_kit_1.terminal.gray("View a list of available languages here: https://otgithub.dj-dj.be#-translators\n\n> ");
    const answer = await terminal_kit_1.terminal.inputField({
        style: terminal_kit_1.terminal.white,
        hintStyle: terminal_kit_1.terminal.gray,
        cancelable: true,
        autoComplete: index_1.opendiscord.defaults.getDefault("languageList"),
        autoCompleteHint: true,
        autoCompleteMenu: autoCompleteMenuOpts
    }).promise;
    if (typeof answer != "string")
        return await backFn();
    else {
        if (!index_1.opendiscord.defaults.getDefault("languageList").includes(answer.toLowerCase())) {
            terminal_kit_1.terminal.red.bold("\n\n❌ Please insert an available language from the list. (TIP: use tab for autocomplete)\n");
            await index_1.utilities.timer(2000);
            return await renderQuickSetupLanguage(backFn);
        }
        quickSetupStorage.language = answer.toLowerCase();
        return await renderQuickSetupCommandTypes(async () => { await renderQuickSetupLanguage(backFn); });
    }
}
async function renderQuickSetupCommandTypes(backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Command Types");
    terminal_kit_1.terminal.bold.blue(stepCount(7) + "Would you like to use slash commands, text commands or both?\n");
    terminal_kit_1.terminal.gray("Slash commands are recommended.\n\n");
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        "Use Slash Commands",
        "Use Text Commands",
        "Use Both Slash & Text Commands",
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return await backFn();
    else if (answer.selectedIndex == 0) {
        quickSetupStorage.slashCommands = true;
        quickSetupStorage.textCommands = false;
    }
    else if (answer.selectedIndex == 1) {
        quickSetupStorage.slashCommands = false;
        quickSetupStorage.textCommands = true;
    }
    else if (answer.selectedIndex == 2) {
        quickSetupStorage.slashCommands = true;
        quickSetupStorage.textCommands = true;
    }
    return await renderQuickSetupStatusType(async () => { await renderQuickSetupCommandTypes(backFn); });
}
async function renderQuickSetupStatusType(backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Status Type");
    terminal_kit_1.terminal.bold.blue(stepCount(8) + "Please select the type of status you want to use.\n");
    terminal_kit_1.terminal.gray("The status will be shown below the bot name in the userlist.\n\n");
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        "Disabled",
        "Custom",
        "Listening To ...",
        "Watching ...",
        "Playing ..."
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return await backFn();
    else if (answer.selectedIndex == 0)
        quickSetupStorage.status = { enabled: false, mode: "online", type: "custom", text: "", state: "" };
    else if (answer.selectedIndex == 1)
        quickSetupStorage.status = { enabled: true, mode: "online", type: "custom", text: "", state: "" };
    else if (answer.selectedIndex == 2)
        quickSetupStorage.status = { enabled: true, mode: "online", type: "listening", text: "", state: "" };
    else if (answer.selectedIndex == 3)
        quickSetupStorage.status = { enabled: true, mode: "online", type: "watching", text: "", state: "" };
    else if (answer.selectedIndex == 4)
        quickSetupStorage.status = { enabled: true, mode: "online", type: "playing", text: "", state: "" };
    if (answer.selectedIndex == 0)
        return await renderQuickSetupLogs(async () => { await renderQuickSetupStatusType(backFn); });
    else
        return await renderQuickSetupStatusText(async () => { await renderQuickSetupStatusType(backFn); });
}
async function renderQuickSetupStatusText(backFn) {
    const { status } = quickSetupStorage;
    if (!status)
        return;
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Status Text");
    terminal_kit_1.terminal.bold.blue(stepCount(8.1) + "What text would you like to display in the status?\n");
    terminal_kit_1.terminal.gray("This will be appended after the type you have chosen in the previous question.\n\n> ");
    terminal_kit_1.terminal.gray(status.type == "listening" ? "Listening To " : (status.type == "playing" ? "Playing " : (status.type == "watching" ? "Watching " : "")));
    const answer = await terminal_kit_1.terminal.inputField({
        style: terminal_kit_1.terminal.white,
        hintStyle: terminal_kit_1.terminal.gray,
        cancelable: true
    }).promise;
    if (typeof answer != "string")
        return await backFn();
    else {
        status.text = answer;
        return await renderQuickSetupLogs(async () => { await renderQuickSetupStatusText(backFn); });
    }
}
async function renderQuickSetupLogs(backFn) {
    const { client, guild } = quickSetupStorage;
    if (!client || !guild)
        return;
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Channel Logs");
    terminal_kit_1.terminal.bold.blue(stepCount(9) + "Please select the 'Text Channel' to use for logs.\n");
    terminal_kit_1.terminal.gray("All logs of the bot will be sent here. Make sure only admins can access this channel.\n\n");
    const rawChannels = (await guild.channels.fetch()).toJSON().filter((c) => c !== null && c.isTextBased());
    const channels = rawChannels.sort((a, b) => (a.position + 50 * ((a.parent?.position ?? -1) + 1)) - (b.position + 50 * ((b.parent?.position ?? -1) + 1)));
    const nameList = channels.map((r) => (r.parent ? r.parent.name + " > " : "") + r.name);
    const longestName = index_1.utilities.getLongestLength(nameList);
    const channelList = channels.map((r) => ((r.parent ? r.parent.name + " > " : "") + r.name).padEnd(longestName + 5, " ") + ansis_1.default.gray(" (" + r.id + ")"));
    const answer = await terminal_kit_1.terminal.singleColumnMenu([ansis_1.default.green("🔄 <Refresh List>"), ansis_1.default.red("❌ <Disable Logs>"), ...channelList], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return backFn();
    else if (answer.selectedIndex == 0)
        return await renderQuickSetupLogs(backFn);
    else if (answer.selectedIndex == 1) {
        quickSetupStorage.logChannel = null;
        return await renderQuickSetupTicketCategory(async () => { await renderQuickSetupLogs(backFn); });
    }
    else {
        const logChannel = channels[answer.selectedIndex - 2];
        quickSetupStorage.logChannel = logChannel.id;
        return await renderQuickSetupTicketCategory(async () => { await renderQuickSetupLogs(backFn); });
    }
}
async function renderQuickSetupTicketCategory(backFn) {
    const { client, guild } = quickSetupStorage;
    if (!client || !guild)
        return;
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Ticket Category");
    terminal_kit_1.terminal.bold.blue(stepCount(10) + "Please select which 'Category' you would like tickets to be created in.\n");
    terminal_kit_1.terminal.gray("When no category is selected, tickets will appear at the top of the channel list.\n\n");
    const rawCategories = (await guild.channels.fetch()).toJSON().filter((c) => c !== null && c.type == discord.ChannelType.GuildCategory);
    const categories = rawCategories.sort((a, b) => a.position - b.position);
    const nameList = categories.map((r) => r.name);
    const longestName = index_1.utilities.getLongestLength(nameList);
    const categoryList = categories.map((r) => r.name.padEnd(longestName + 5, " ") + ansis_1.default.gray(" (" + r.id + ")"));
    const answer = await terminal_kit_1.terminal.singleColumnMenu([ansis_1.default.green("🔄 <Refresh List>"), ansis_1.default.red("❌ <Without Category>"), ...categoryList], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return backFn();
    else if (answer.selectedIndex == 0)
        return await renderQuickSetupTicketCategory(backFn);
    else if (answer.selectedIndex == 1) {
        quickSetupStorage.ticketCategory = null;
        return await renderQuickSetupTicketCount(async () => { await renderQuickSetupTicketCategory(backFn); });
    }
    else {
        const ticketCategory = categories[answer.selectedIndex - 2];
        quickSetupStorage.ticketCategory = ticketCategory.id;
        return await renderQuickSetupTicketCount(async () => { await renderQuickSetupTicketCategory(backFn); });
    }
}
async function renderQuickSetupTicketCount(backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Ticket Configuration");
    terminal_kit_1.terminal.bold.blue(stepCount(11) + "How many ticket options/types would you like to create?\n");
    terminal_kit_1.terminal.gray("You can always add more ticket options/types in the config afterwards.\n\n");
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        "1️⃣ 1 Ticket Option",
        "2️⃣ 2 Ticket Options",
        "3️⃣ 3 Ticket Options",
        "4️⃣ 4 Ticket Options",
        "5️⃣ 5 Ticket Options",
        "6️⃣ 6 Ticket Options",
        "7️⃣ 7 Ticket Options",
        "8️⃣ 8 Ticket Options",
        "9️⃣ 9 Ticket Options",
        "🔟 10 Ticket Options",
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return await backFn();
    else {
        const ticketCount = answer.selectedIndex + 1;
        quickSetupStorage.ticketOptions = [];
        for (let i = 0; i < ticketCount; i++) {
            quickSetupStorage.ticketOptions.push(null);
        }
        return await renderQuickSetupCreateTicketName(0, ticketCount, async () => { await renderQuickSetupTicketCount(backFn); });
    }
}
async function renderQuickSetupCreateTicketName(ticketIndex, requiredTickets, backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Ticket Configuration (Ticket " + (ticketIndex + 1) + "/" + requiredTickets + ")");
    terminal_kit_1.terminal.bold.blue("(" + index_1.utilities.ordinalNumber(ticketIndex + 1) + " Ticket) Please insert the name of this ticket option.\n");
    terminal_kit_1.terminal.gray("Recommendation: Clean, short, obvious name, not more than ±30 characters.\n\n> ");
    const answer = await terminal_kit_1.terminal.inputField({
        style: terminal_kit_1.terminal.white,
        hintStyle: terminal_kit_1.terminal.gray,
        cancelable: true,
    }).promise;
    if (typeof answer != "string") {
        //delete option ticket from list when going back to menu or previous ticket settings
        quickSetupStorage.ticketOptions[ticketIndex] = null;
        return await backFn();
    }
    else if (answer.length == 0) {
        terminal_kit_1.terminal.red.bold("\n\n❌ Please insert a valid ticket option name.\n");
        await index_1.utilities.timer(2000);
        return await renderQuickSetupCreateTicketName(ticketIndex, requiredTickets, backFn);
    }
    else {
        quickSetupStorage.ticketOptions[ticketIndex] = {
            name: answer,
            description: "",
            buttonType: "label",
            buttonEmoji: null,
            buttonColor: "gray",
            channelPrefix: "ticket-",
            channelSuffix: "user-name"
        };
        return await renderQuickSetupCreateTicketDescription(ticketIndex, requiredTickets, async () => { await renderQuickSetupCreateTicketName(ticketIndex, requiredTickets, backFn); });
    }
}
async function renderQuickSetupCreateTicketDescription(ticketIndex, requiredTickets, backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Ticket Configuration (Ticket " + (ticketIndex + 1) + "/" + requiredTickets + ")");
    terminal_kit_1.terminal.bold.blue("(" + index_1.utilities.ordinalNumber(ticketIndex + 1) + " Ticket) Please insert the description of this ticket option.\n");
    terminal_kit_1.terminal.gray("Recommendation: Use '\\n' (backslash-n) for a newline.\n\n> ");
    const answer = await terminal_kit_1.terminal.inputField({
        style: terminal_kit_1.terminal.white,
        hintStyle: terminal_kit_1.terminal.gray,
        cancelable: true,
    }).promise;
    if (typeof answer != "string")
        return await backFn();
    else {
        const ticketOption = quickSetupStorage.ticketOptions[ticketIndex];
        if (ticketOption)
            ticketOption.description = answer.replaceAll("\\n", "\n");
        return await renderQuickSetupCreateTicketButtonType(ticketIndex, requiredTickets, async () => { await renderQuickSetupCreateTicketDescription(ticketIndex, requiredTickets, backFn); });
    }
}
async function renderQuickSetupCreateTicketButtonType(ticketIndex, requiredTickets, backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Ticket Configuration (Ticket " + (ticketIndex + 1) + "/" + requiredTickets + ")");
    terminal_kit_1.terminal.bold.blue("(" + index_1.utilities.ordinalNumber(ticketIndex + 1) + " Ticket) How would you like to display the ticket name in the button/dropdown?\n");
    terminal_kit_1.terminal.gray("You will be able to choose between dropdown/buttons when configuring panels.\n\n");
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        "Emoji + Label/Name",
        "Label/Name Only",
        "Emoji Only"
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return await backFn();
    else {
        const ticketOption = quickSetupStorage.ticketOptions[ticketIndex];
        if (ticketOption)
            ticketOption.buttonType = (answer.selectedIndex == 0) ? "label-emoji" : ((answer.selectedIndex == 1) ? "label" : "emoji");
        if (answer.selectedIndex == 0 || answer.selectedIndex == 2) {
            return await renderQuickSetupCreateTicketButtonEmoji(ticketIndex, requiredTickets, async () => { await renderQuickSetupCreateTicketButtonType(ticketIndex, requiredTickets, backFn); });
        }
        else {
            return await renderQuickSetupCreateTicketButtonColor(ticketIndex, requiredTickets, async () => { await renderQuickSetupCreateTicketButtonType(ticketIndex, requiredTickets, backFn); });
        }
    }
}
async function renderQuickSetupCreateTicketButtonEmoji(ticketIndex, requiredTickets, backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Ticket Configuration (Ticket " + (ticketIndex + 1) + "/" + requiredTickets + ")");
    terminal_kit_1.terminal.bold.blue("(" + index_1.utilities.ordinalNumber(ticketIndex + 1) + " Ticket) Please insert the button emoji of this ticket option.\n");
    terminal_kit_1.terminal.gray("Only 1 emoji allowed. Tip: Insert custom emoji's via the following syntax: <:12345678910:emoji_name>\n\n> ");
    const answer = await terminal_kit_1.terminal.inputField({
        style: terminal_kit_1.terminal.white,
        hintStyle: terminal_kit_1.terminal.gray,
        cancelable: true,
    }).promise;
    if (typeof answer != "string")
        return await backFn();
    else {
        //check emoji using a local config checker instance
        const isEmojiValid = (new index_1.api.ODCheckerCustomStructure_EmojiString("opendiscord:emoji-checker", 1, 1, true)).check(index_1.opendiscord.checkers.createTemporaryCheckerEnvironment(), answer, ["emoji"]);
        if (!isEmojiValid) {
            terminal_kit_1.terminal.red.bold("\n\n❌ Please insert a valid emoji.\n");
            await index_1.utilities.timer(2000);
            return await renderQuickSetupCreateTicketButtonEmoji(ticketIndex, requiredTickets, backFn);
        }
        const ticketOption = quickSetupStorage.ticketOptions[ticketIndex];
        if (ticketOption)
            ticketOption.buttonEmoji = answer;
        return await renderQuickSetupCreateTicketButtonColor(ticketIndex, requiredTickets, async () => { await renderQuickSetupCreateTicketButtonEmoji(ticketIndex, requiredTickets, backFn); });
    }
}
async function renderQuickSetupCreateTicketButtonColor(ticketIndex, requiredTickets, backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Ticket Configuration (Ticket " + (ticketIndex + 1) + "/" + requiredTickets + ")");
    terminal_kit_1.terminal.bold.blue("(" + index_1.utilities.ordinalNumber(ticketIndex + 1) + " Ticket) What color would you like the button to be?\n");
    terminal_kit_1.terminal.gray("This will not apply when choosing 'dropdown' mode in the panel configuration.\n\n");
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        "Gray (Default)",
        "Blue",
        "Red",
        "Green"
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return await backFn();
    else {
        const ticketOption = quickSetupStorage.ticketOptions[ticketIndex];
        if (ticketOption)
            ticketOption.buttonColor = (answer.selectedIndex == 0) ? "gray" : ((answer.selectedIndex == 1) ? "blue" : ((answer.selectedIndex == 2) ? "red" : "green"));
        return await renderQuickSetupCreateTicketChannelPrefix(ticketIndex, requiredTickets, async () => { await renderQuickSetupCreateTicketButtonType(ticketIndex, requiredTickets, backFn); });
    }
}
async function renderQuickSetupCreateTicketChannelPrefix(ticketIndex, requiredTickets, backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Ticket Configuration (Ticket " + (ticketIndex + 1) + "/" + requiredTickets + ")");
    terminal_kit_1.terminal.bold.blue("(" + index_1.utilities.ordinalNumber(ticketIndex + 1) + " Ticket) Please insert the channel prefix of this ticket option.\n");
    terminal_kit_1.terminal.gray("Examples: 'ticket-', 'question-', 'test-channel-', ...\n\n> ");
    const answer = await terminal_kit_1.terminal.inputField({
        style: terminal_kit_1.terminal.white,
        hintStyle: terminal_kit_1.terminal.gray,
        cancelable: true,
    }).promise;
    if (typeof answer != "string")
        return await backFn();
    else if (answer.length == 0) {
        terminal_kit_1.terminal.red.bold("\n\n❌ Please insert a valid ticket option channel prefix.\n");
        await index_1.utilities.timer(2000);
        return await renderQuickSetupCreateTicketChannelPrefix(ticketIndex, requiredTickets, backFn);
    }
    else {
        const ticketOption = quickSetupStorage.ticketOptions[ticketIndex];
        if (ticketOption)
            ticketOption.channelPrefix = answer;
        return await renderQuickSetupCreateTicketChannelSuffix(ticketIndex, requiredTickets, async () => { await renderQuickSetupCreateTicketChannelPrefix(ticketIndex, requiredTickets, backFn); });
    }
}
async function renderQuickSetupCreateTicketChannelSuffix(ticketIndex, requiredTickets, backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Ticket Configuration (Ticket " + (ticketIndex + 1) + "/" + requiredTickets + ")");
    terminal_kit_1.terminal.bold.blue("(" + index_1.utilities.ordinalNumber(ticketIndex + 1) + " Ticket) Please select the channel suffix mode of this ticket option.\n");
    terminal_kit_1.terminal.gray("The suffix is appended after the prefix and will be generated on ticket creation.\n\n");
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        "Username            " + ansis_1.default.gray("(e.g. #ticket-DJj123dj, #question-wumpus)"),
        "User Id             " + ansis_1.default.gray("(e.g. #ticket-123456789, #question-01020304)"),
        "Random Number       " + ansis_1.default.gray("(e.g. #ticket-1234, #question-1411)"),
        "Random Hex          " + ansis_1.default.gray("(e.g. #ticket-f8ba, #question-01f3)"),
        "Dynamic Counter     " + ansis_1.default.gray("(e.g. #ticket-1, #question-23)"),
        "Fixed Counter       " + ansis_1.default.gray("(e.g. #ticket-0001, #question-0023)")
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return await backFn();
    else {
        const ticketOption = quickSetupStorage.ticketOptions[ticketIndex];
        if (ticketOption) {
            if (answer.selectedIndex == 0)
                ticketOption.channelSuffix = "user-name";
            else if (answer.selectedIndex == 1)
                ticketOption.channelSuffix = "user-id";
            else if (answer.selectedIndex == 2)
                ticketOption.channelSuffix = "random-number";
            else if (answer.selectedIndex == 3)
                ticketOption.channelSuffix = "random-hex";
            else if (answer.selectedIndex == 4)
                ticketOption.channelSuffix = "counter-dynamic";
            else if (answer.selectedIndex == 5)
                ticketOption.channelSuffix = "counter-fixed";
        }
        //create next ticket
        if (ticketIndex + 1 < requiredTickets)
            return await renderQuickSetupCreateTicketName(ticketIndex + 1, requiredTickets, async () => { await renderQuickSetupCreateTicketChannelSuffix(ticketIndex, requiredTickets, backFn); });
        else
            return await renderQuickSetupAutoclose(async () => { await renderQuickSetupCreateTicketChannelSuffix(ticketIndex, requiredTickets, backFn); });
    }
}
async function renderQuickSetupAutoclose(backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Ticket Autoclose");
    terminal_kit_1.terminal.bold.blue(stepCount(12) + "Would you like to enable autoclosing tickets?\n");
    terminal_kit_1.terminal.gray("Applies to all created tickets. You can always change/disable autoclose per ticket-option in the config afterwards.\n\n");
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        ansis_1.default.red("❌ <Disable Autoclose>"),
        "1 Hour Inactivity",
        "2 Hours Inactivity",
        "4 Hours Inactivity",
        "8 Hours Inactivity",
        "12 Hours Inactivity",
        "1 Day Inactivity",
        "2 Days Inactivity",
        "3 Days Inactivity",
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return await backFn();
    else {
        if (answer.selectedIndex == 0)
            quickSetupStorage.autocloseHours = null;
        else
            quickSetupStorage.autocloseHours = [1, 2, 4, 8, 12, 24, 48, 72][answer.selectedIndex - 1];
        return await renderQuickSetupCooldown(async () => { await renderQuickSetupAutoclose(backFn); });
    }
}
async function renderQuickSetupCooldown(backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Ticket Cooldown");
    terminal_kit_1.terminal.bold.blue(stepCount(13) + "Would you like to enable ticket creation cooldown?\n");
    terminal_kit_1.terminal.gray("Applies to all created tickets. You can always change/disable cooldown per ticket-option in the config afterwards.\n\n");
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        ansis_1.default.red("❌ <Disable Cooldown>"),
        "1 Minute Cooldown",
        "2 Minutes Cooldown",
        "5 Minutes Cooldown",
        "10 Minutes Cooldown",
        "15 Minutes Cooldown",
        "30 Minutes Cooldown",
        "1 Hour Cooldown",
        "2 Hours Cooldown",
        "3 Hours Cooldown",
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return await backFn();
    else {
        if (answer.selectedIndex == 0)
            quickSetupStorage.cooldownMinutes = null;
        else
            quickSetupStorage.cooldownMinutes = [1, 2, 5, 10, 15, 30, 60, 120, 180][answer.selectedIndex - 1];
        return await renderQuickSetupLimits(async () => { await renderQuickSetupCooldown(backFn); });
    }
}
async function renderQuickSetupLimits(backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Ticket Limits");
    terminal_kit_1.terminal.bold.blue(stepCount(14) + "Would you like to enable user ticket creation limits?\n");
    terminal_kit_1.terminal.gray("Applies to all created tickets. You can always change/disable limits globally or per ticket-option in the config afterwards.\n\n");
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        ansis_1.default.red("❌ <Disable Ticket Limits>"),
        "Max 1 Ticket/Person",
        "Max 2 Tickets/Person",
        "Max 3 Tickets/Person",
        "Max 5 Tickets/Person",
        "Max 10 Tickets/Person",
        "Max 20 Tickets/Person"
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return await backFn();
    else {
        if (answer.selectedIndex == 0)
            quickSetupStorage.globalUserLimit = null;
        else
            quickSetupStorage.globalUserLimit = [1, 2, 3, 5, 10, 20][answer.selectedIndex - 1];
        return await renderQuickSetupCloseParticipants(async () => { await renderQuickSetupLimits(backFn); });
    }
}
async function renderQuickSetupCloseParticipants(backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Ticket Close Configuration");
    terminal_kit_1.terminal.bold.blue(stepCount(15) + "Would you like to remove all ticket participants when closing the ticket?\n");
    terminal_kit_1.terminal.gray("When a ticket is closed, only admins can read/write in the ticket. Reopen ticket to restore read/write perms.\n\n");
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        "❌ No, don't remove ticket participants on close",
        "✅ Yes, remove ticket participants on close",
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return await backFn();
    else {
        quickSetupStorage.removeParticipantsOnClose = (answer.selectedIndex == 1);
        return await renderQuickSetupTicketMessageLayout(async () => { await renderQuickSetupCloseParticipants(backFn); });
    }
}
async function renderQuickSetupTicketMessageLayout(backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Ticket Message Configuration");
    terminal_kit_1.terminal.bold.blue(stepCount(16) + "How would you like the (initial) ticket message to be displayed?\n");
    terminal_kit_1.terminal.gray("This message is sent by the bot when creating a ticket and contains buttons like closing, claiming & deleting.\n\n");
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        "📋 Embed Message " + ansis_1.default.gray("(Default)"),
        "💬 Raw Text Message",
        ansis_1.default.red("❌ No Message (Not Recommended)")
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return await backFn();
    else {
        quickSetupStorage.ticketMessageLayout = (answer.selectedIndex == 0) ? "embed" : (answer.selectedIndex == 1) ? "text" : null;
        return await renderQuickSetupEmojiStyle(async () => { await renderQuickSetupTicketMessageLayout(backFn); });
    }
}
async function renderQuickSetupEmojiStyle(backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Emoji Style");
    terminal_kit_1.terminal.bold.blue(stepCount(17) + "How would you like emojis to be displayed in messages?\n");
    terminal_kit_1.terminal.gray("This will affect emojis in all messages of the bot, but does not apply to buttons & dropdowns.\n\n");
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        "✅  Before  ❌ (Default)   " + ansis_1.default.gray("(e.g. 🎫 Ticket Created)"),
        "❌  After   ✅             " + ansis_1.default.gray("(e.g. Ticket Created 🎫)"),
        "✅  Double  ✅             " + ansis_1.default.gray("(e.g. 🎫 Ticket Created 🎫)"),
        "❌ Disabled ❌             " + ansis_1.default.gray("(e.g. Ticket Created)"),
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return await backFn();
    else {
        quickSetupStorage.emojiStyle = (answer.selectedIndex == 0) ? "before" : (answer.selectedIndex == 1) ? "after" : (answer.selectedIndex == 2) ? "double" : "disabled";
        return await renderQuickSetupPanelName(async () => { await renderQuickSetupEmojiStyle(backFn); });
    }
}
async function renderQuickSetupPanelName(backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Panel Name");
    terminal_kit_1.terminal.bold.blue(stepCount(18) + "Please insert the name of the ticket panel.\n");
    terminal_kit_1.terminal.gray("This will be shown as the title of the panel message where all tickets are located.\n\n> ");
    const answer = await terminal_kit_1.terminal.inputField({
        style: terminal_kit_1.terminal.white,
        hintStyle: terminal_kit_1.terminal.gray,
        cancelable: true
    }).promise;
    if (typeof answer != "string")
        return await backFn();
    else if (answer.length == 0) {
        terminal_kit_1.terminal.red.bold("\n\n❌ Please insert a valid panel name.\n");
        await index_1.utilities.timer(2000);
        return await renderQuickSetupPanelName(backFn);
    }
    else {
        quickSetupStorage.panelName = answer;
        return await renderQuickSetupPanelDescription(async () => { await renderQuickSetupPanelName(backFn); });
    }
}
async function renderQuickSetupPanelDescription(backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Panel Description");
    terminal_kit_1.terminal.bold.blue(stepCount(19) + "Please insert the description of the ticket panel.\n");
    terminal_kit_1.terminal.gray("Shown below the title. Can be used to explain some info/rules about the ticket system.\n\n> ");
    const answer = await terminal_kit_1.terminal.inputField({
        style: terminal_kit_1.terminal.white,
        hintStyle: terminal_kit_1.terminal.gray,
        cancelable: true
    }).promise;
    if (typeof answer != "string")
        return await backFn();
    else {
        quickSetupStorage.panelDescription = answer;
        return await renderQuickSetupPanelDropdown(async () => { await renderQuickSetupPanelDescription(backFn); });
    }
}
async function renderQuickSetupPanelDropdown(backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Panel Mode");
    terminal_kit_1.terminal.bold.blue(stepCount(20) + "Do you want to show the tickets as buttons or a dropdown?\n");
    terminal_kit_1.terminal.gray("Dropdown doesn't support colors and cannot contain option types other than 'tickets' (e.g. website/url or reaction roles).\n\n");
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        "Use Buttons  " + ansis_1.default.gray("(Recommended with 2 or less ticket options)"),
        "Use Dropdown " + ansis_1.default.gray("(Recommended with 3 or more ticket options)"),
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return await backFn();
    else {
        quickSetupStorage.panelDropdown = (answer.selectedIndex == 1);
        return await renderQuickSetupPanelLayout(async () => { await renderQuickSetupPanelDropdown(backFn); });
    }
}
async function renderQuickSetupPanelLayout(backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Panel Layout");
    terminal_kit_1.terminal.bold.blue(stepCount(21) + "How would you like the panel message to be displayed?\n");
    terminal_kit_1.terminal.gray("Most of the time embeds are used. But for a simpler solution, you can choose the text layout.\n\n");
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        "📋 Embed Message " + ansis_1.default.gray("(Default)"),
        "💬 Raw Text Message",
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return await backFn();
    else {
        quickSetupStorage.panelLayout = (answer.selectedIndex == 0) ? "embed" : "text";
        return await renderQuickSetupPanelDescribeOptions(async () => { await renderQuickSetupPanelLayout(backFn); });
    }
}
async function renderQuickSetupPanelDescribeOptions(backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Panel Option Descriptions");
    terminal_kit_1.terminal.bold.blue(stepCount(22) + "Would you like the panel to have auto-generated (ticket-)option descriptions?\n");
    terminal_kit_1.terminal.gray("It will use the 'name' & 'description' of each ticket option and displays it below the panel description.\n\n");
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        ansis_1.default.red("❌ <Disable Option Descriptions>"),
        "🟢 Use Simple Option Descriptions",
        "🟠 Use Normal Option Descriptions " + ansis_1.default.gray("(Default)"),
        "🔴 Use Detailed Option Descriptions",
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return await backFn();
    else {
        quickSetupStorage.panelDescribeOptions = (answer.selectedIndex == 0) ? null : (answer.selectedIndex == 1) ? "simple" : (answer.selectedIndex == 2) ? "normal" : "detailed";
        return await renderQuickSetupPanelMaxTicketsWarning(async () => { await renderQuickSetupPanelDescribeOptions(backFn); });
    }
}
async function renderQuickSetupPanelMaxTicketsWarning(backFn) {
    (0, cli_1.renderHeader)("⏱️ Open Ticket Quick Setup: Ticket Close Configuration");
    terminal_kit_1.terminal.bold.blue(stepCount(23) + "Would you like to show the maximum amount of tickets a user can create in the panel?\n");
    terminal_kit_1.terminal.gray("This will show the amount of tickets a user can create at the same time when limits are enabled.\n\n");
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        "❌ No, don't show the max tickets warning in the panel",
        "✅ Yes, show the max tickets warning in the panel",
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    if (answer.canceled)
        return await backFn();
    else {
        quickSetupStorage.panelMaxTicketsWarning = (answer.selectedIndex == 1);
        return await renderQuickSetupReady(async () => { await renderQuickSetupPanelMaxTicketsWarning(backFn); });
    }
}
async function renderQuickSetupReady(backFn) {
    (0, cli_1.renderHeader)("😎 Open Ticket Quick Setup: Overview");
    terminal_kit_1.terminal.bold.blue(stepCount(24) + "This is the overview of your ticket bot configuration!\n");
    terminal_kit_1.terminal.gray("Press 'Enter' to save the result to the config.\n\n");
    const commands = ((quickSetupStorage.slashCommands && quickSetupStorage.textCommands) ? "Slash & Text" : (quickSetupStorage.slashCommands) ? "Slash Only" : "Text Only");
    const statusText = (quickSetupStorage.status?.type == "listening" ? "Listening To " : (quickSetupStorage.status?.type == "playing" ? "Playing " : (quickSetupStorage.status?.type == "watching" ? "Watching " : ""))) + quickSetupStorage.status?.text;
    const status = (quickSetupStorage.status?.enabled) ? statusText : "Disabled";
    (0, terminal_kit_1.terminal)([
        ansis_1.default.bold.hex("#f8ba00")("Client: ") + (quickSetupStorage.client?.client.user.displayName ?? "?"),
        ansis_1.default.bold.hex("#f8ba00")("Status: ") + status,
        ansis_1.default.bold.hex("#f8ba00")("Server: ") + (quickSetupStorage.guild?.name ?? "?"),
        ansis_1.default.bold.hex("#f8ba00")("Admins: ") + (quickSetupStorage.globalAdmins?.length ?? "?") + " Admins",
        ansis_1.default.bold.hex("#f8ba00")("Color: ") + (quickSetupStorage.mainColor ?? "?"),
        ansis_1.default.bold.hex("#f8ba00")("Language: ") + (quickSetupStorage.language ?? "?"),
        ansis_1.default.bold.hex("#f8ba00")("Commands: ") + commands,
        ansis_1.default.bold.hex("#f8ba00")("Options: ") + quickSetupStorage.ticketOptions.length + " Tickets",
        ansis_1.default.bold.hex("#f8ba00")("Autoclose: ") + (quickSetupStorage.autocloseHours ? quickSetupStorage.autocloseHours + " Hours" : "Disabled"),
        ansis_1.default.bold.hex("#f8ba00")("Cooldown: ") + (quickSetupStorage.cooldownMinutes ? quickSetupStorage.cooldownMinutes + " Minutes" : "Disabled"),
        ansis_1.default.bold.hex("#f8ba00")("Limits: ") + (quickSetupStorage.globalUserLimit ? quickSetupStorage.globalUserLimit + " Tickets/Person" : "Disabled"),
        ansis_1.default.bold.gray("+ 13 More Settings ..."),
    ].join("\n") + "\n\n");
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        ansis_1.default.green("Press 'Enter' to save configuration!")
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    //save configuration
    if (answer.canceled)
        return await backFn();
    else if (answer.selectedIndex == 0) {
        await saveQuickSetupConfig();
        return await renderQuickSetupFinished();
    }
}
async function renderQuickSetupFinished() {
    (0, cli_1.renderHeader)("✅ Open Ticket Quick Setup: Ready");
    terminal_kit_1.terminal.bold.green("The config has been saved succesfully and the bot is now ready for usage!\n");
    terminal_kit_1.terminal.gray("Press 'Enter' to exit the Quick Setup CLI.\n\n");
    (0, terminal_kit_1.terminal)(ansis_1.default.gray([
        "Start the bot using the following command:",
        ansis_1.default.blue("------------------------------"),
        ansis_1.default.magenta.bold("> npm start"),
        ansis_1.default.blue("------------------------------"),
        "",
        "Edit the existing config in the CLI or directly in the (./config/) directory:",
        ansis_1.default.blue("------------------------------"),
        ansis_1.default.magenta.bold("> npm run setup"),
        ansis_1.default.blue("------------------------------"),
        "",
        ansis_1.default.yellow.bold("⭐ Don't forget to star our Github repository when you enjoy using the bot! ⭐"),
        ansis_1.default.gray("Join our discord server " + ansis_1.default.hex("#5865F2").bold.underline("https://discord.dj-dj.be") + " when you need help with troubleshooting."),
    ].join("\n")) + "\n\n");
    await terminal_kit_1.terminal.singleColumnMenu([
        ansis_1.default.green("Press 'Enter' to exit Quick Setup CLI!")
    ], {
        leftPadding: "> ",
        style: terminal_kit_1.terminal.cyan,
        selectedStyle: terminal_kit_1.terminal.bgDefaultColor.bold,
        submittedStyle: terminal_kit_1.terminal.bgBlue,
        extraLines: 2,
        cancelable: true
    }).promise;
    //stop CLI
    return await (0, cli_1.terminate)();
}
async function saveQuickSetupConfig() {
    //GENERAL CONFIG
    const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
    const generalConfigData = {
        _INFO: {
            support: "https://otdocs.dj-dj.be",
            discord: "https://discord.dj-dj.be",
            version: "open-ticket-" + index_1.opendiscord.versions.get("opendiscord:version").toString()
        },
        token: quickSetupStorage.client?.token ?? "<unknown-token>",
        tokenFromENV: false,
        mainColor: quickSetupStorage.mainColor ?? "#f8ba00",
        language: quickSetupStorage.language ?? "english",
        prefix: "!ticket ",
        serverId: quickSetupStorage.guild?.id ?? "<unknown-guild>",
        globalAdmins: quickSetupStorage.globalAdmins ?? [],
        slashCommands: quickSetupStorage.slashCommands ?? false,
        textCommands: quickSetupStorage.textCommands ?? false,
        status: quickSetupStorage.status ?? { enabled: false, mode: "online", type: "custom", text: "", state: "" },
        system: {
            preferSlashOverText: quickSetupStorage.slashCommands ?? false,
            sendErrorOnUnknownCommand: true,
            questionFieldsInCodeBlock: true,
            displayFieldsWithQuestions: false,
            showGlobalAdminsInPanelRoles: false,
            disableVerifyBars: false,
            useRedErrorEmbeds: true,
            alwaysShowReason: false,
            emojiStyle: quickSetupStorage.emojiStyle ?? "before",
            pinEmoji: "📌",
            replyOnTicketCreation: false,
            replyOnReactionRole: true,
            askPriorityOnTicketCreation: false,
            removeParticipantsOnClose: quickSetupStorage.removeParticipantsOnClose ?? false,
            disableAutocloseAfterReopen: true,
            autodeleteRequiresClosedTicket: true,
            adminOnlyDeleteWithoutTranscript: true,
            allowCloseBeforeMessage: false,
            allowCloseBeforeAdminMessage: true,
            useTranslatedConfigChecker: true,
            pinFirstTicketMessage: false,
            enableTicketClaimButtons: true,
            enableTicketCloseButtons: true,
            enableTicketPinButtons: true,
            enableTicketDeleteButtons: true,
            enableTicketActionWithReason: true,
            enableDeleteWithoutTranscript: true,
            logs: {
                enabled: (typeof quickSetupStorage.logChannel == "string"),
                channel: quickSetupStorage.logChannel ?? ""
            },
            limits: {
                enabled: (typeof quickSetupStorage.globalUserLimit == "number"),
                globalMaximum: 100,
                userMaximum: quickSetupStorage.globalUserLimit ?? 3
            },
            channelTopic: {
                showOptionName: true,
                showOptionDescription: false,
                showOptionTopic: true,
                showPriority: false,
                showClosed: true,
                showClaimed: false,
                showPinned: false,
                showCreator: false,
                showParticipants: false
            },
            permissions: {
                help: "everyone",
                panel: "admin",
                ticket: "everyone",
                close: "admin",
                delete: "admin",
                reopen: "admin",
                claim: "admin",
                unclaim: "admin",
                pin: "admin",
                unpin: "admin",
                move: "admin",
                rename: "admin",
                add: "admin",
                remove: "admin",
                blacklist: "admin",
                stats: "everyone",
                clear: "admin",
                autoclose: "admin",
                autodelete: "admin",
                transfer: "admin",
                topic: "admin",
                priority: "admin",
                leaderboard: "admin",
            },
            messages: {
                creation: { dm: true, logs: true },
                closing: { dm: true, logs: true },
                deleting: { dm: true, logs: true },
                reopening: { dm: false, logs: true },
                claiming: { dm: false, logs: true },
                pinning: { dm: false, logs: true },
                adding: { dm: false, logs: true },
                removing: { dm: false, logs: true },
                renaming: { dm: false, logs: true },
                moving: { dm: true, logs: true },
                blacklisting: { dm: true, logs: true },
                transferring: { dm: true, logs: true },
                topicChange: { dm: false, logs: true },
                priorityChange: { dm: false, logs: true },
                reactionRole: { dm: false, logs: true }
            }
        }
    };
    generalConfig.data = generalConfigData;
    await generalConfig.save();
    //QUESTIONS CONFIG => no configuration needed (coming soonTM)
    const questionsConfig = index_1.opendiscord.configs.get("opendiscord:questions");
    const questionsConfigData = [
        {
            id: "example-question-1",
            name: "Example Question 1",
            type: "short",
            required: true,
            placeholder: "Insert your short answer here!",
            length: {
                enabled: false,
                min: 0,
                max: 1000
            }
        },
        {
            id: "example-question-2",
            name: "Example Question 2",
            type: "paragraph",
            required: false,
            placeholder: "Insert your long answer here!",
            length: {
                enabled: false,
                min: 0,
                max: 1000
            }
        }
    ];
    questionsConfig.data = questionsConfigData;
    await questionsConfig.save();
    //OPTIONS CONFIG
    const optionsConfig = index_1.opendiscord.configs.get("opendiscord:options");
    const optionsConfigData = quickSetupStorage.ticketOptions.filter((ticket) => ticket !== null).map((ticket) => {
        const id = generateUniqueIdFromName(ticket.name);
        quickSetupStorage.optionIdStorage.push(id);
        return {
            id: id,
            name: ticket.name,
            description: ticket.description,
            type: "ticket",
            button: {
                emoji: (ticket.buttonType == "label") ? "" : (ticket.buttonEmoji ?? ""),
                label: (ticket.buttonType == "emoji") ? "" : ticket.name,
                color: ticket.buttonColor ?? "gray"
            },
            ticketAdmins: [],
            readonlyAdmins: [],
            allowCreationByBlacklistedUsers: false,
            questions: [],
            roles: [],
            channel: {
                prefix: ticket.channelPrefix,
                suffix: ticket.channelSuffix,
                category: quickSetupStorage.ticketCategory ?? "",
                closedCategory: "",
                backupCategory: "",
                claimedCategory: [],
                topic: ticket.description
            },
            dmMessage: {
                enabled: false,
                text: "",
                embed: {
                    enabled: false,
                    title: "",
                    description: "",
                    customColor: "",
                    image: "",
                    thumbnail: "",
                    fields: [],
                    timestamp: false
                }
            },
            ticketMessage: {
                enabled: true,
                text: "",
                embed: {
                    enabled: true,
                    title: ticket.name,
                    description: ticket.description,
                    customColor: "",
                    image: "",
                    thumbnail: "",
                    fields: [],
                    timestamp: true
                },
                ping: {
                    "@here": true,
                    "@everyone": false,
                    custom: []
                }
            },
            autoclose: {
                enableInactiveHours: (typeof quickSetupStorage.autocloseHours == "number"),
                inactiveHours: quickSetupStorage.autocloseHours ?? 24,
                enableUserLeave: true,
                disableOnClaim: false
            },
            autodelete: {
                enableInactiveDays: false,
                inactiveDays: 7,
                enableUserLeave: false,
                disableOnClaim: false
            },
            cooldown: {
                enabled: (typeof quickSetupStorage.cooldownMinutes == "number"),
                cooldownMinutes: quickSetupStorage.cooldownMinutes ?? 10
            },
            limits: {
                enabled: false,
                globalMaximum: 20,
                userMaximum: 3
            },
            slowMode: {
                enabled: false,
                slowModeSeconds: 20
            }
        };
    });
    optionsConfig.data = optionsConfigData;
    await optionsConfig.save();
    //PANELS CONFIG
    const panelsConfig = index_1.opendiscord.configs.get("opendiscord:panels");
    const panelsConfigData = [
        {
            id: generateUniqueIdFromName(quickSetupStorage.panelName ?? "ticket-panel"),
            name: quickSetupStorage.panelName ?? "Ticket Panel",
            dropdown: quickSetupStorage.panelDropdown ?? false,
            options: quickSetupStorage.optionIdStorage,
            text: (quickSetupStorage.panelLayout == "text") ? (quickSetupStorage.panelDescription ?? "") : "",
            embed: {
                enabled: true,
                title: quickSetupStorage.panelName ?? "Ticket Panel",
                description: (quickSetupStorage.panelLayout == "embed") ? (quickSetupStorage.panelDescription ?? "") : "",
                customColor: "",
                url: "",
                image: "",
                thumbnail: "",
                footer: quickSetupStorage.guild?.name ?? "",
                fields: [],
                timestamp: false
            },
            settings: {
                dropdownPlaceholder: "Open a ticket",
                enableMaxTicketsWarningInText: (quickSetupStorage.panelLayout == "text" && (quickSetupStorage.panelMaxTicketsWarning ?? false)),
                enableMaxTicketsWarningInEmbed: (quickSetupStorage.panelLayout == "embed" && (quickSetupStorage.panelMaxTicketsWarning ?? false)),
                describeOptionsLayout: quickSetupStorage.panelDescribeOptions ?? "normal",
                describeOptionsCustomTitle: "",
                describeOptionsInText: (quickSetupStorage.panelLayout == "text" && typeof quickSetupStorage.panelDescribeOptions == "string"),
                describeOptionsInEmbedFields: (quickSetupStorage.panelLayout == "embed" && typeof quickSetupStorage.panelDescribeOptions == "string"),
                describeOptionsInEmbedDescription: false
            }
        }
    ];
    panelsConfig.data = panelsConfigData;
    await panelsConfig.save();
    //TRANSCRIPTS CONFIG => no configuration needed (coming soonTM)
    const transcriptsConfig = index_1.opendiscord.configs.get("opendiscord:transcripts");
    const transcriptsConfigData = {
        general: {
            enabled: (typeof quickSetupStorage.logChannel == "string"),
            enableChannel: true,
            enableCreatorDM: true,
            enableParticipantDM: false,
            enableActiveAdminDM: false,
            enableEveryAdminDM: false,
            channel: quickSetupStorage.logChannel ?? "",
            mode: "html"
        },
        embedSettings: {
            customColor: "",
            listAllParticipants: false,
            includeTicketStats: false
        },
        textTranscriptStyle: {
            layout: "normal",
            includeStats: true,
            includeIds: false,
            includeEmbeds: true,
            includeFiles: true,
            includeBotMessages: true,
            fileMode: "channel-name",
            customFileName: "transcript"
        },
        htmlTranscriptStyle: {
            background: {
                enableCustomBackground: false,
                backgroundColor: "",
                backgroundImage: ""
            },
            header: {
                enableCustomHeader: false,
                backgroundColor: "#202225",
                decoColor: "#f8ba00",
                textColor: "#ffffff"
            },
            stats: {
                enableCustomStats: false,
                backgroundColor: "#202225",
                keyTextColor: "#737373",
                valueTextColor: "#ffffff",
                hideBackgroundColor: "#40444a",
                hideTextColor: "#ffffff"
            },
            favicon: {
                enableCustomFavicon: false,
                imageUrl: "https://t.dj-dj.be/favicon.png"
            }
        }
    };
    transcriptsConfig.data = transcriptsConfigData;
    await transcriptsConfig.save();
}
