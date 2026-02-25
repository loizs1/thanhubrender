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
exports.registerActions = void 0;
///////////////////////////////////////
//TICKET TOPIC SYSTEM
///////////////////////////////////////
const index_1 = require("../index");
const discord = __importStar(require("discord.js"));
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const registerActions = async () => {
    index_1.opendiscord.actions.add(new index_1.api.ODAction("opendiscord:update-ticket-priority"));
    index_1.opendiscord.actions.get("opendiscord:update-ticket-priority").workers.add([
        new index_1.api.ODWorker("opendiscord:update-ticket-priority", 2, async (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, newPriority, reason } = params;
            if (channel.isThread() || !(channel instanceof discord.TextChannel))
                throw new index_1.api.ODSystemError("Unable to set priority of ticket! Open Ticket doesn't support threads!");
            const oldPriority = index_1.opendiscord.priorities.getFromPriorityLevel(ticket.get("opendiscord:priority").value);
            await index_1.opendiscord.events.get("onTicketPriorityChange").emit([ticket, user, channel, oldPriority, newPriority, reason]);
            //update ticket
            ticket.get("opendiscord:busy").value = true;
            if (newPriority)
                ticket.get("opendiscord:priority").value = newPriority.priority;
            //rename channel (and give error when crashed)
            const pinEmoji = ticket.get("opendiscord:pinned").value ? generalConfig.data.system.pinEmoji : "";
            const priorityEmoji = newPriority.channelEmoji ?? "";
            const originalName = channel.name;
            const newName = pinEmoji + priorityEmoji + index_1.utilities.trimEmojis(channel.name);
            try {
                await index_1.utilities.timedAwait(channel.setName(newName), 2500, (err) => {
                    index_1.opendiscord.log("Failed to rename channel on ticket priority update", "error");
                });
            }
            catch (err) {
                await channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-channel-rename").build("ticket-priority", { guild, channel, user, originalName, newName })).message);
            }
            //reply with new message
            if (params.sendMessage)
                await channel.send((await index_1.opendiscord.builders.messages.getSafe("opendiscord:priority-set").build(source, { guild, channel, user, ticket, priority: newPriority, reason })).message);
            ticket.get("opendiscord:busy").value = false;
            await index_1.opendiscord.events.get("afterTicketPriorityChanged").emit([ticket, user, channel, oldPriority, newPriority, reason]);
            //update channel topic
            await index_1.opendiscord.actions.get("opendiscord:update-ticket-topic").run("ticket-action", { guild, channel, user, ticket, sendMessage: false, newTopic: null });
        }),
        new index_1.api.ODWorker("opendiscord:discord-logs", 1, async (instance, params, source, cancel) => {
            const { guild, channel, user, ticket } = params;
        }),
        new index_1.api.ODWorker("opendiscord:logs", 0, (instance, params, source, cancel) => {
            const { guild, channel, user, ticket, newPriority } = params;
            index_1.opendiscord.log(user.displayName + " changed the priority of a ticket!", "info", [
                { key: "user", value: user.username },
                { key: "userid", value: user.id, hidden: true },
                { key: "channel", value: "#" + channel.name },
                { key: "channelid", value: channel.id, hidden: true },
                { key: "priority", value: newPriority.id.value },
                { key: "method", value: source }
            ]);
        })
    ]);
    index_1.opendiscord.actions.get("opendiscord:update-ticket-priority").workers.backupWorker = new index_1.api.ODWorker("opendiscord:cancel-busy", 0, (instance, params) => {
        //set busy to false in case of crash or cancel
        params.ticket.get("opendiscord:busy").value = false;
    });
};
exports.registerActions = registerActions;
