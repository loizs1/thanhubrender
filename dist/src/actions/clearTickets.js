"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerActions = void 0;
///////////////////////////////////////
//CLEAR TICKETS SYSTEM
///////////////////////////////////////
const index_1 = require("../index");
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const registerActions = async () => {
    index_1.opendiscord.actions.add(new index_1.api.ODAction("opendiscord:clear-tickets"));
    index_1.opendiscord.actions.get("opendiscord:clear-tickets").workers.add([
        new index_1.api.ODWorker("opendiscord:clear-tickets", 2, async (instance, params, source, cancel) => {
            const { guild, channel, user, filter, list } = params;
            await index_1.opendiscord.events.get("onTicketsClear").emit([list, user, channel, filter]);
            const nameList = [];
            //split tickets into smaller groups of 10 (to decrease ratelimit chances for HTML Transcripts & discord API)
            const subGroupList = [];
            let tempSubGroup = [];
            list.forEach((ticket, index) => {
                tempSubGroup.push(ticket);
                if (tempSubGroup.length >= 10) {
                    subGroupList.push(tempSubGroup);
                    tempSubGroup = [];
                }
            });
            if (tempSubGroup.length > 0)
                subGroupList.push(tempSubGroup);
            let groupIndex = 0;
            for (const ticketGroup of subGroupList) {
                for (const ticket of ticketGroup) {
                    const ticketChannel = await index_1.opendiscord.tickets.getTicketChannel(ticket);
                    if (!ticketChannel)
                        return;
                    nameList.push("#" + ticketChannel.name);
                    await index_1.opendiscord.actions.get("opendiscord:delete-ticket").run("clear", { guild, channel: ticketChannel, user, ticket, reason: "Cleared Ticket", sendMessage: true, withoutTranscript: false });
                    await index_1.utilities.timer(2000); //wait 2sec between each deletion
                }
                if (groupIndex < subGroupList.length - 1)
                    await index_1.utilities.timer(45 * 1000); //wait 45sec between each group deletion (10 tickets)
                groupIndex++;
            }
            instance.list = nameList;
            await index_1.opendiscord.events.get("afterTicketsCleared").emit([list, user, channel, filter]);
        }),
        new index_1.api.ODWorker("opendiscord:discord-logs", 1, async (instance, params, source, cancel) => {
            const { guild, channel, user, filter, list } = params;
            //to logs
            if (generalConfig.data.system.logs.enabled && generalConfig.data.system.messages.deleting.logs) {
                const logChannel = index_1.opendiscord.posts.get("opendiscord:logs");
                if (logChannel)
                    logChannel.send(await index_1.opendiscord.builders.messages.getSafe("opendiscord:clear-logs").build(source, { guild, channel, user, filter, list: instance.list ?? [] }));
            }
        }),
        new index_1.api.ODWorker("opendiscord:logs", 0, (instance, params, source, cancel) => {
            const { guild, user, filter, list } = params;
            index_1.opendiscord.log(user.displayName + " cleared " + list.length + " tickets!", "info", [
                { key: "user", value: user.username },
                { key: "userid", value: user.id, hidden: true },
                { key: "method", value: source },
                { key: "filter", value: filter }
            ]);
        })
    ]);
};
exports.registerActions = registerActions;
