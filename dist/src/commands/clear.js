"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerButtonResponders = exports.registerCommandResponders = void 0;
///////////////////////////////////////
//CLEAR COMMAND
///////////////////////////////////////
const index_1 = require("../index");
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const registerCommandResponders = async () => {
    //CLEAR COMMAND RESPONDER
    index_1.opendiscord.responders.commands.add(new index_1.api.ODCommandResponder("opendiscord:clear", generalConfig.data.prefix, "clear"));
    index_1.opendiscord.responders.commands.get("opendiscord:clear").workers.add([
        new index_1.api.ODWorker("opendiscord:clear", 0, async (instance, params, source, cancel) => {
            const { user, member, channel, guild } = instance;
            //check permissions (only allow global admins: ticket admins aren't allowed to clear tickets)
            const permsResult = await index_1.opendiscord.permissions.checkCommandPerms(generalConfig.data.system.permissions.clear, "support", user, member, channel, guild, { allowChannelUserScope: false, allowChannelRoleScope: false });
            if (!permsResult.hasPerms) {
                if (permsResult.reason == "not-in-server")
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                else
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build(source, { guild, channel, user, permissions: ["support"] }));
                return cancel();
            }
            //check is in guild/server
            if (!guild || channel.isDMBased()) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                return cancel();
            }
            const tempFilter = instance.options.getString("filter", false);
            const filter = (tempFilter) ? tempFilter.toLowerCase() : "all";
            const list = [];
            const ticketList = index_1.opendiscord.tickets.getAll().filter((ticket) => {
                if (filter == "all")
                    return true;
                else if (filter == "open" && ticket.get("opendiscord:open").value)
                    return true;
                else if (filter == "closed" && ticket.get("opendiscord:closed").value)
                    return true;
                else if (filter == "claimed" && ticket.get("opendiscord:claimed").value)
                    return true;
                else if (filter == "pinned" && ticket.get("opendiscord:pinned").value)
                    return true;
                else if (filter == "unclaimed" && !ticket.get("opendiscord:claimed").value)
                    return true;
                else if (filter == "unpinned" && !ticket.get("opendiscord:pinned").value)
                    return true;
                else if (filter == "autoclosed" && ticket.get("opendiscord:closed").value)
                    return true;
                else
                    return false;
            });
            for (const ticket of ticketList) {
                const ticketChannel = await index_1.opendiscord.tickets.getTicketChannel(ticket);
                if (ticketChannel)
                    list.push("#" + ticketChannel.name);
            }
            //reply with clear verify
            await instance.defer(true);
            await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:clear-verify-message").build(source, { guild, channel, user, filter, list }));
        }),
        new index_1.api.ODWorker("opendiscord:logs", -1, (instance, params, source, cancel) => {
            index_1.opendiscord.log(instance.user.displayName + " used the 'clear' command!", "info", [
                { key: "user", value: instance.user.username },
                { key: "userid", value: instance.user.id, hidden: true },
                { key: "channelid", value: instance.channel.id, hidden: true },
                { key: "method", value: source }
            ]);
        })
    ]);
};
exports.registerCommandResponders = registerCommandResponders;
const registerButtonResponders = async () => {
    //CLEAR CONTINUE BUTTON RESPONDER
    index_1.opendiscord.responders.buttons.add(new index_1.api.ODButtonResponder("opendiscord:clear-continue", /^od:clear-continue_/));
    index_1.opendiscord.responders.buttons.get("opendiscord:clear-continue").workers.add(new index_1.api.ODWorker("opendiscord:clear-continue", 0, async (instance, params, source, cancel) => {
        const { guild, channel, user } = instance;
        if (!guild || channel.isDMBased())
            return;
        const originalSource = instance.interaction.customId.split("_")[1];
        const filter = instance.interaction.customId.split("_")[2];
        //start ticket clear
        await instance.defer("update", true);
        const list = [];
        const ticketList = index_1.opendiscord.tickets.getAll().filter((ticket) => {
            if (filter == "all")
                return true;
            else if (filter == "open" && ticket.get("opendiscord:open").value)
                return true;
            else if (filter == "closed" && ticket.get("opendiscord:closed").value)
                return true;
            else if (filter == "claimed" && ticket.get("opendiscord:claimed").value)
                return true;
            else if (filter == "pinned" && ticket.get("opendiscord:pinned").value)
                return true;
            else if (filter == "unclaimed" && !ticket.get("opendiscord:claimed").value)
                return true;
            else if (filter == "unpinned" && !ticket.get("opendiscord:pinned").value)
                return true;
            else if (filter == "autoclosed" && ticket.get("opendiscord:closed").value)
                return true;
            else
                return false;
        });
        for (const ticket of ticketList) {
            const ticketChannel = await index_1.opendiscord.tickets.getTicketChannel(ticket);
            if (ticketChannel)
                list.push("#" + ticketChannel.name);
        }
        await index_1.opendiscord.actions.get("opendiscord:clear-tickets").run(originalSource, { guild, channel, user, filter, list: ticketList });
        await instance.update(await index_1.opendiscord.builders.messages.getSafe("opendiscord:clear-message").build(originalSource, { guild, channel, user, filter, list }));
    }));
};
exports.registerButtonResponders = registerButtonResponders;
