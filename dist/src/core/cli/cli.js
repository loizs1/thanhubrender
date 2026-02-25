"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.centerText = centerText;
exports.terminate = terminate;
exports.renderHeader = renderHeader;
exports.execute = execute;
const index_1 = require("../../index");
const terminal_kit_1 = require("terminal-kit");
const ansis_1 = __importDefault(require("ansis"));
const logo = [
    "   ██████╗ ██████╗ ███████╗███╗   ██╗    ████████╗██╗ ██████╗██╗  ██╗███████╗████████╗  ",
    "  ██╔═══██╗██╔══██╗██╔════╝████╗  ██║    ╚══██╔══╝██║██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝  ",
    "  ██║   ██║██████╔╝█████╗  ██╔██╗ ██║       ██║   ██║██║     █████╔╝ █████╗     ██║     ",
    "  ██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║       ██║   ██║██║     ██╔═██╗ ██╔══╝     ██║     ",
    "  ╚██████╔╝██║     ███████╗██║ ╚████║       ██║   ██║╚██████╗██║  ██╗███████╗   ██║     ",
    "   ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝       ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝     "
];
/**A utility function to center text to a certain width. */
function centerText(text, width) {
    if (width < text.length)
        return text;
    let newWidth = width - ansis_1.default.strip(text).length + 1;
    let final = " ".repeat(newWidth / 2) + text;
    return final;
}
/**A utility function to terminate the interactive CLI. */
async function terminate() {
    terminal_kit_1.terminal.grabInput(false);
    terminal_kit_1.terminal.clear();
    terminal_kit_1.terminal.green("👋 Exited the Open Ticket Interactive Setup CLI.\n");
    process.exit(0);
}
terminal_kit_1.terminal.on("key", (name, matches, data) => {
    if (name == "CTRL_C")
        terminate();
});
/**Render the header of the interactive CLI. */
function renderHeader(path) {
    terminal_kit_1.terminal.grabInput(true);
    terminal_kit_1.terminal.clear().moveTo(1, 1);
    (0, terminal_kit_1.terminal)(ansis_1.default.hex("#f8ba00")(logo.join("\n") + "\n"));
    terminal_kit_1.terminal.bold(centerText("Interactive Setup CLI  -  Version: " + index_1.opendiscord.versions.get("opendiscord:version").toString() + "  -  Support: https://discord.dj-dj.be\n", 88));
    if (typeof path == "string")
        terminal_kit_1.terminal.cyan(centerText(path + "\n\n", 88));
    else if (path.length < 1)
        terminal_kit_1.terminal.cyan(centerText("👋 Hi! Welcome to the Open Ticket Interactive Setup CLI! 👋\n\n", 88));
    else
        terminal_kit_1.terminal.cyan(centerText("🌐 Current Location: " + path.map((v, i) => {
            if (i == 0)
                return v.toString();
            else if (typeof v == "string")
                return ".\"" + v + "\"";
            else if (typeof v == "number")
                return "." + v;
        }).join("") + "\n\n", 88));
}
async function renderCliModeSelector(backFn) {
    renderHeader([]);
    (0, terminal_kit_1.terminal)(ansis_1.default.bold.green("Please select what CLI module you want to use.\n") + ansis_1.default.italic.gray("(use arrow keys to navigate, exit using escape)\n"));
    const answer = await terminal_kit_1.terminal.singleColumnMenu([
        "✏️ Edit Config     " + ansis_1.default.gray("=> Edit the current config, add/remove new tickets/questions/panels & more!"),
        "⏱️ Quick Setup     " + ansis_1.default.gray("=> A quick and easy way of setting up the bot in your Discord server."),
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
        await (await import("./editConfig.js")).renderEditConfig(async () => { await renderCliModeSelector(backFn); });
    else if (answer.selectedIndex == 1)
        await (await import("./quickSetup.js")).renderQuickSetup(async () => { await renderCliModeSelector(backFn); });
}
async function execute() {
    if (terminal_kit_1.terminal.width < 100 || terminal_kit_1.terminal.height < 35) {
        (0, terminal_kit_1.terminal)(ansis_1.default.red.bold("\n\nMake sure your console or cmd window has a " + ansis_1.default.cyan("minimum width & height") + " of " + ansis_1.default.cyan("100x35") + " characters."));
        (0, terminal_kit_1.terminal)(ansis_1.default.red.bold("\nOtherwise the Open Ticket Interactive Setup CLI will be rendered incorrectly."));
        (0, terminal_kit_1.terminal)(ansis_1.default.red.bold("\nThe current terminal dimensions are: " + ansis_1.default.cyan(terminal_kit_1.terminal.width + "x" + terminal_kit_1.terminal.height) + "."));
    }
    else
        await renderCliModeSelector(terminate);
}
