"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerModalResponders = exports.registerDropdownResponders = exports.registerButtonResponders = exports.registerCommandResponders = void 0;
///////////////////////////////////////
//TICKET COMMAND
///////////////////////////////////////
const index_1 = require("../index");
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const lang = index_1.opendiscord.languages;
async function checkTicketCreationPerms(instance, source, guild, user, option) {
    //check ticket permissions
    const permsRes = await index_1.opendiscord.actions.get("opendiscord:create-ticket-permissions").run(source, { guild, user, option });
    if (!permsRes.valid && instance.channel) {
        //error
        const newSource = (source === "slash" || source === "text") ? source : "other";
        if (permsRes.reason == "blacklist")
            instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions-blacklisted").build(newSource, { guild: instance.guild, channel: instance.channel, user: instance.user }));
        else if (permsRes.reason == "cooldown")
            instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions-cooldown").build(newSource, { guild: instance.guild, channel: instance.channel, user: instance.user, until: permsRes.cooldownUntil }));
        else if (permsRes.reason == "global-limit")
            instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions-limits").build(newSource, { guild: instance.guild, channel: instance.channel, user: instance.user, limit: "global" }));
        else if (permsRes.reason == "global-user-limit")
            instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions-limits").build(newSource, { guild: instance.guild, channel: instance.channel, user: instance.user, limit: "global-user" }));
        else if (permsRes.reason == "option-limit")
            instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions-limits").build(newSource, { guild: instance.guild, channel: instance.channel, user: instance.user, limit: "option" }));
        else if (permsRes.reason == "option-user-limit")
            instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions-limits").build(newSource, { guild: instance.guild, channel: instance.channel, user: instance.user, limit: "option-user" }));
        else if (permsRes.reason == "custom")
            instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build(newSource, { guild: instance.guild, channel: instance.channel, user: instance.user, layout: "simple", error: permsRes.customReason ?? lang.getTranslation("errors.descriptions.unableToCreateTicket") + " `Unknown invalid_permission_reason => no reason specified by plugin`", customTitle: lang.getTranslation("errors.titles.permissionError") }));
        else
            instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build(newSource, { guild: instance.guild, channel: instance.channel, user: instance.user, error: "Unknown invalid_permission reason => calculation failed #1", layout: "advanced" }));
        return false;
    }
    else
        return true;
}
const registerCommandResponders = async () => {
    //TICKET COMMAND RESPONDER
    index_1.opendiscord.responders.commands.add(new index_1.api.ODCommandResponder("opendiscord:ticket", generalConfig.data.prefix, /^ticket/));
    index_1.opendiscord.responders.commands.get("opendiscord:ticket").workers.add([
        new index_1.api.ODWorker("opendiscord:ticket", 0, async (instance, params, source, cancel) => {
            const { user, member, channel, guild } = instance;
            //check permissions
            const permsResult = await index_1.opendiscord.permissions.checkCommandPerms(generalConfig.data.system.permissions.ticket, "support", user, member, channel, guild);
            if (!permsResult.hasPerms) {
                if (permsResult.reason == "not-in-server")
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                else
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build(source, { guild, channel, user, permissions: ["support"] }));
                return cancel();
            }
            //check is in guild/server
            if (!guild) {
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build(source, { channel: instance.channel, user: instance.user }));
                return cancel();
            }
            //get option data
            const optionId = instance.options.getString("id", true);
            const option = index_1.opendiscord.options.get(optionId);
            if (!option || !(option instanceof index_1.api.ODTicketOption)) {
                //error
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-option-unknown").build(source, { guild: instance.guild, channel: instance.channel, user: instance.user }));
                return cancel();
            }
            //start ticket creation
            if (option.exists("opendiscord:questions") && option.get("opendiscord:questions").value.length > 0) {
                //send modal
                instance.modal(await index_1.opendiscord.builders.modals.getSafe("opendiscord:ticket-questions").build(source, { guild, channel, user, option }));
            }
            else {
                //check ticket permissions
                if (!(await checkTicketCreationPerms(instance, source, guild, user, option)))
                    return cancel();
                //create ticket
                await instance.defer(true);
                const res = await index_1.opendiscord.actions.get("opendiscord:create-ticket").run(source, { guild, user, answers: [], option });
                if (!res.channel || !res.ticket) {
                    //error
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build(source, { guild, channel: instance.channel, user, error: "Unable to receive ticket or channel from callback! #1", layout: "advanced" }));
                    return cancel();
                }
                await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-created").build(source, { guild, channel: res.channel, user, ticket: res.ticket }));
            }
        }),
        new index_1.api.ODWorker("opendiscord:logs", -1, (instance, params, source, cancel) => {
            index_1.opendiscord.log(instance.user.displayName + " used the 'ticket' command!", "info", [
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
    //TICKET OPTION BUTTON RESPONDER
    index_1.opendiscord.responders.buttons.add(new index_1.api.ODButtonResponder("opendiscord:ticket-option", /^od:ticket-option_/));
    index_1.opendiscord.responders.buttons.get("opendiscord:ticket-option").workers.add(new index_1.api.ODWorker("opendiscord:ticket-option", 0, async (instance, params, source, cancel) => {
        const { guild, channel, user } = instance;
        if (!guild) {
            //error
            instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build(source, { channel: instance.channel, user: instance.user }));
            return cancel();
        }
        //get option
        const optionId = instance.interaction.customId.split("_")[2];
        const option = index_1.opendiscord.options.get(optionId);
        if (!option || !(option instanceof index_1.api.ODTicketOption)) {
            //error
            instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-option-unknown").build(source, { guild: instance.guild, channel: instance.channel, user: instance.user }));
            return cancel();
        }
        //start ticket creation
        if (option.exists("opendiscord:questions") && option.get("opendiscord:questions").value.length > 0) {
            //send modal
            instance.modal(await index_1.opendiscord.builders.modals.getSafe("opendiscord:ticket-questions").build("panel-button", { guild, channel, user, option }));
        }
        else {
            //check ticket permissions
            if (!(await checkTicketCreationPerms(instance, "panel-button", guild, user, option)))
                return cancel();
            //create ticket
            await instance.defer((generalConfig.data.system.replyOnTicketCreation) ? "reply" : "update", true);
            const res = await index_1.opendiscord.actions.get("opendiscord:create-ticket").run("panel-button", { guild, user, answers: [], option });
            if (!res.channel || !res.ticket) {
                //error
                await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build(source, { guild, channel: instance.channel, user, error: "Unable to receive ticket or channel from callback! #1", layout: "advanced" }));
                return cancel();
            }
            if (generalConfig.data.system.replyOnTicketCreation)
                await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-created").build("panel-button", { guild, channel: res.channel, user, ticket: res.ticket }));
        }
    }));
};
exports.registerButtonResponders = registerButtonResponders;
const registerDropdownResponders = async () => {
    //PANEL DROPDOWN TICKETS DROPDOWN RESPONDER
    index_1.opendiscord.responders.dropdowns.add(new index_1.api.ODDropdownResponder("opendiscord:panel-dropdown-tickets", /^od:panel-dropdown_/));
    index_1.opendiscord.responders.dropdowns.get("opendiscord:panel-dropdown-tickets").workers.add(new index_1.api.ODWorker("opendiscord:panel-dropdown-tickets", 0, async (instance, params, source, cancel) => {
        const { guild, channel, user } = instance;
        if (!guild) {
            //error
            instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build(source, { channel: instance.channel, user: instance.user }));
            return cancel();
        }
        //get option
        const optionId = instance.values.getStringValues()[0].split("_")[2];
        const option = index_1.opendiscord.options.get(optionId);
        if (!option || !(option instanceof index_1.api.ODTicketOption)) {
            //error
            instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-option-unknown").build(source, { guild: instance.guild, channel: instance.channel, user: instance.user }));
            return cancel();
        }
        //start ticket creation
        if (option.exists("opendiscord:questions") && option.get("opendiscord:questions").value.length > 0) {
            //send modal
            instance.modal(await index_1.opendiscord.builders.modals.getSafe("opendiscord:ticket-questions").build("panel-dropdown", { guild, channel, user, option }));
        }
        else {
            //check ticket permissions
            if (!(await checkTicketCreationPerms(instance, "panel-dropdown", guild, user, option)))
                return cancel();
            //create ticket
            await instance.defer((generalConfig.data.system.replyOnTicketCreation) ? "reply" : "update", true);
            const res = await index_1.opendiscord.actions.get("opendiscord:create-ticket").run("panel-dropdown", { guild, user, answers: [], option });
            if (!res.channel || !res.ticket) {
                //error
                await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build(source, { guild, channel: instance.channel, user, error: "Unable to receive ticket or channel from callback! #1", layout: "advanced" }));
                return cancel();
            }
            if (generalConfig.data.system.replyOnTicketCreation)
                await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-created").build("panel-dropdown", { guild, channel: res.channel, user, ticket: res.ticket }));
        }
        //update panel after dropdown usage (reset panel choice)
        const globalDatabase = index_1.opendiscord.databases.get("opendiscord:global");
        const rawPanelId = await globalDatabase.get("opendiscord:panel-message", instance.message.channel.id + "_" + instance.message.id);
        if (rawPanelId) {
            const panel = index_1.opendiscord.panels.get(rawPanelId);
            if (panel)
                await instance.message.edit((await index_1.opendiscord.builders.messages.getSafe("opendiscord:panel").build("auto-update", { guild, channel, user, panel })).message);
        }
    }));
};
exports.registerDropdownResponders = registerDropdownResponders;
const registerModalResponders = async () => {
    //TICKET QUESTIONS RESPONDER
    index_1.opendiscord.responders.modals.add(new index_1.api.ODModalResponder("opendiscord:ticket-questions", /^od:ticket-questions_/));
    index_1.opendiscord.responders.modals.get("opendiscord:ticket-questions").workers.add([
        new index_1.api.ODWorker("opendiscord:ticket-questions", 0, async (instance, params, source, cancel) => {
            const { guild, channel, user } = instance;
            await instance.defer((generalConfig.data.system.replyOnTicketCreation) ? "reply" : "update", true);
            if (!channel)
                throw new index_1.api.ODSystemError("The 'Ticket Questions' modal requires a channel for responding!");
            if (!guild) {
                //error
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build(source, { channel, user: instance.user }));
                return cancel();
            }
            const originalSource = instance.interaction.customId.split("_")[2];
            //get option
            const optionId = instance.interaction.customId.split("_")[1];
            const option = index_1.opendiscord.options.get(optionId);
            if (!option || !(option instanceof index_1.api.ODTicketOption)) {
                //error
                instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-option-unknown").build(source, { guild: instance.guild, channel, user: instance.user }));
                return cancel();
            }
            //get answers
            const answers = [];
            option.get("opendiscord:questions").value.forEach((id) => {
                const question = index_1.opendiscord.questions.get(id);
                if (!question)
                    return;
                if (question instanceof index_1.api.ODShortQuestion) {
                    answers.push({
                        id,
                        name: question.exists("opendiscord:name") ? question.get("opendiscord:name")?.value : id,
                        type: "short",
                        value: instance.values.getTextField(id, false)
                    });
                }
                else if (question instanceof index_1.api.ODParagraphQuestion) {
                    answers.push({
                        id,
                        name: question.exists("opendiscord:name") ? question.get("opendiscord:name")?.value : id,
                        type: "paragraph",
                        value: instance.values.getTextField(id, false)
                    });
                }
            });
            //check ticket permissions
            if (!(await checkTicketCreationPerms(instance, originalSource, guild, user, option)))
                return cancel();
            //create ticket
            const res = await index_1.opendiscord.actions.get("opendiscord:create-ticket").run(originalSource, { guild, user, answers, option });
            if (!res.channel || !res.ticket) {
                //error
                await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build(source, { guild, channel, user, error: "Unable to receive ticket or channel from callback! #2", layout: "advanced" }));
                return cancel();
            }
            if (generalConfig.data.system.replyOnTicketCreation)
                await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:ticket-created").build(originalSource, { guild, channel: res.channel, user, ticket: res.ticket }));
        })
    ]);
};
exports.registerModalResponders = registerModalResponders;
