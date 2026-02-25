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
exports.registerCommandResponders = void 0;
///////////////////////////////////////
//STATS COMMAND
///////////////////////////////////////
const index_1 = require("../index");
const discord = __importStar(require("discord.js"));
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const registerCommandResponders = async () => {
    //PANEL COMMAND RESPONDER
    index_1.opendiscord.responders.commands.add(new index_1.api.ODCommandResponder("opendiscord:panel", generalConfig.data.prefix, /^panel/));
    index_1.opendiscord.responders.commands.get("opendiscord:panel").workers.add([
        new index_1.api.ODWorker("opendiscord:panel", 0, async (instance, params, source, cancel) => {
            const { guild, channel, user, member } = instance;
            //check permissions
            const permsResult = await index_1.opendiscord.permissions.checkCommandPerms(generalConfig.data.system.permissions.panel, "support", user, member, channel, guild);
            if (!permsResult.hasPerms) {
                if (permsResult.reason == "not-in-server")
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                else
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build(source, { guild, channel, user, permissions: ["support"] }));
                return cancel();
            }
            //check is in guild/server
            if (!guild || instance.channel.type == discord.ChannelType.GroupDM) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build(source, { channel: instance.channel, user: instance.user }));
                return cancel();
            }
            //get panel data
            const id = instance.options.getString("id", true);
            const panel = index_1.opendiscord.panels.get(id);
            if (!panel) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-panel-unknown").build(source, { guild, channel, user }));
                return cancel();
            }
            await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:panel-ready").build(source, { guild, channel, user, panel }));
            const panelMessage = await instance.channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:panel").build(source, { guild, channel, user, panel })).message);
            //add panel to database (this way, the bot knows where all panels are located)
            const globalDatabase = index_1.opendiscord.databases.get("opendiscord:global");
            await globalDatabase.set("opendiscord:panel-message", panelMessage.channel.id + "_" + panelMessage.id, panel.id.value);
            //add panel to database for auto-update
            if (instance.options.getBoolean("auto-update", false)) {
                await globalDatabase.set("opendiscord:panel-update", panelMessage.channel.id + "_" + panelMessage.id, panel.id.value);
            }
        }),
        new index_1.api.ODWorker("opendiscord:logs", -1, (instance, params, source, cancel) => {
            index_1.opendiscord.log(instance.user.displayName + " used the 'panel' command!", "info", [
                { key: "user", value: instance.user.username },
                { key: "userid", value: instance.user.id, hidden: true },
                { key: "channelid", value: instance.channel.id, hidden: true },
                { key: "method", value: source }
            ]);
        })
    ]);
};
exports.registerCommandResponders = registerCommandResponders;
