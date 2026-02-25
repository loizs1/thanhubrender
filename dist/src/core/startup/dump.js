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
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadDumpCommand = void 0;
const index_1 = require("../../index");
const discord = __importStar(require("discord.js"));
const fs = __importStar(require("fs"));
/** WHAT IS THIS??
 * This is the '!OPENTICKET:dump' command.
 * It's a utility command which can only be used by the creator of Open Ticket or the owner of the bot.
 * This command will send the `otdebug.txt` file in DM. It's not dangerous as the `otdebug.txt` file doesn't contain any sensitive data (only logs).
 *
 * WHY DOES IT EXIST??
 * This command can be used to quickly get the `otdebug.txt` file without having access to the hosting
 * in case you're helping someone with setting up (or debugging) Open Ticket.
 *
 * CAN I DISABLE IT??
 * If you want to turn it off, you can always do it below this message!
 */
///////// DISABLE DUMP COMMAND /////////
const disableDumpCommand = false;
////////////////////////////////////////
const loadDumpCommand = () => {
    if (disableDumpCommand)
        return;
    index_1.opendiscord.client.textCommands.add(new index_1.api.ODTextCommand("opendiscord:dump", {
        allowBots: false,
        guildPermission: true,
        dmPermission: true,
        name: "dump",
        prefix: "!OPENTICKET:"
    }));
    index_1.opendiscord.client.textCommands.onInteraction("!OPENTICKET:", "dump", async (msg) => {
        if (msg.author.id == "779742674932072469" || index_1.opendiscord.permissions.hasPermissions("developer", await index_1.opendiscord.permissions.getPermissions(msg.author, msg.channel, null))) {
            //user is bot owner OR creator of Open Ticket :)
            index_1.opendiscord.log("Dumped otdebug.txt!", "system", [
                { key: "user", value: msg.author.username },
                { key: "id", value: msg.author.id }
            ]);
            const debug = fs.readFileSync("./otdebug.txt");
            if (msg.channel.type != discord.ChannelType.GroupDM)
                msg.channel.send({ content: "## The `otdebug.txt` dump is available!", files: [
                        new discord.AttachmentBuilder(debug)
                            .setName("otdebug.txt")
                            .setDescription("The Open Ticket debug dump!")
                    ] });
        }
    });
};
exports.loadDumpCommand = loadDumpCommand;
