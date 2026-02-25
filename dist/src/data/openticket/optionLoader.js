"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTicketOptionSuffix = exports.loadRoleOption = exports.loadWebsiteOption = exports.loadTicketOption = exports.loadAllOptions = void 0;
const index_1 = require("../../index");
const loadAllOptions = async () => {
    const optionConfig = index_1.opendiscord.configs.get("opendiscord:options");
    if (!optionConfig)
        return;
    optionConfig.data.forEach((option) => {
        if (option.type == "ticket") {
            const loadedOption = (0, exports.loadTicketOption)(option);
            index_1.opendiscord.options.add(loadedOption);
            index_1.opendiscord.options.suffix.add((0, exports.loadTicketOptionSuffix)(loadedOption));
        }
        else if (option.type == "website") {
            index_1.opendiscord.options.add((0, exports.loadWebsiteOption)(option));
        }
        else if (option.type == "role") {
            index_1.opendiscord.options.add((0, exports.loadRoleOption)(option));
        }
    });
    //update options on config reload
    optionConfig.onReload(async () => {
        //clear previous options & suffixes
        await index_1.opendiscord.options.loopAll((data, id) => { index_1.opendiscord.options.remove(id); });
        await index_1.opendiscord.options.suffix.loopAll((data, id) => { index_1.opendiscord.options.suffix.remove(id); });
        //add new options
        optionConfig.data.forEach((option) => {
            if (option.type == "ticket") {
                const loadedOption = (0, exports.loadTicketOption)(option);
                index_1.opendiscord.options.add(loadedOption);
                index_1.opendiscord.options.suffix.add((0, exports.loadTicketOptionSuffix)(loadedOption));
            }
            else if (option.type == "website") {
                index_1.opendiscord.options.add((0, exports.loadWebsiteOption)(option));
            }
            else if (option.type == "role") {
                index_1.opendiscord.options.add((0, exports.loadRoleOption)(option));
            }
        });
        //update options in tickets
        await index_1.opendiscord.tickets.loopAll((ticket) => {
            const optionId = ticket.option.id;
            const option = index_1.opendiscord.options.get(optionId);
            if (option && option instanceof index_1.api.ODTicketOption)
                ticket.option = option;
            else {
                index_1.opendiscord.log("Unable to move ticket to unexisting option due to config reload!", "warning", [
                    { key: "channelid", value: ticket.id.value },
                    { key: "option", value: optionId.value }
                ]);
            }
        });
        //update roles on config reload
        await index_1.opendiscord.roles.loopAll((data, id) => { index_1.opendiscord.roles.remove(id); });
        await (await import("./roleLoader.js")).loadAllRoles();
    });
};
exports.loadAllOptions = loadAllOptions;
const loadTicketOption = (option) => {
    return new index_1.api.ODTicketOption(option.id, [
        new index_1.api.ODOptionData("opendiscord:name", option.name),
        new index_1.api.ODOptionData("opendiscord:description", option.description),
        new index_1.api.ODOptionData("opendiscord:button-emoji", option.button.emoji),
        new index_1.api.ODOptionData("opendiscord:button-label", option.button.label),
        new index_1.api.ODOptionData("opendiscord:button-color", option.button.color),
        new index_1.api.ODOptionData("opendiscord:admins", option.ticketAdmins),
        new index_1.api.ODOptionData("opendiscord:admins-readonly", option.readonlyAdmins),
        new index_1.api.ODOptionData("opendiscord:allow-blacklisted-users", option.allowCreationByBlacklistedUsers),
        new index_1.api.ODOptionData("opendiscord:questions", option.questions),
        new index_1.api.ODOptionData("opendiscord:roles", option.roles),
        new index_1.api.ODOptionData("opendiscord:channel-prefix", option.channel.prefix),
        new index_1.api.ODOptionData("opendiscord:channel-suffix", option.channel.suffix),
        new index_1.api.ODOptionData("opendiscord:channel-category", option.channel.category),
        new index_1.api.ODOptionData("opendiscord:channel-category-closed", option.channel.closedCategory),
        new index_1.api.ODOptionData("opendiscord:channel-category-backup", option.channel.backupCategory),
        new index_1.api.ODOptionData("opendiscord:channel-categories-claimed", option.channel.claimedCategory),
        new index_1.api.ODOptionData("opendiscord:channel-topic", option.channel.topic),
        new index_1.api.ODOptionData("opendiscord:dm-message-enabled", option.dmMessage.enabled),
        new index_1.api.ODOptionData("opendiscord:dm-message-text", option.dmMessage.text),
        new index_1.api.ODOptionData("opendiscord:dm-message-embed", option.dmMessage.embed),
        new index_1.api.ODOptionData("opendiscord:ticket-message-enabled", option.ticketMessage.enabled),
        new index_1.api.ODOptionData("opendiscord:ticket-message-text", option.ticketMessage.text),
        new index_1.api.ODOptionData("opendiscord:ticket-message-embed", option.ticketMessage.embed),
        new index_1.api.ODOptionData("opendiscord:ticket-message-ping", option.ticketMessage.ping),
        new index_1.api.ODOptionData("opendiscord:autoclose-enable-hours", option.autoclose.enableInactiveHours),
        new index_1.api.ODOptionData("opendiscord:autoclose-enable-leave", option.autoclose.enableUserLeave),
        new index_1.api.ODOptionData("opendiscord:autoclose-disable-claim", option.autoclose.disableOnClaim),
        new index_1.api.ODOptionData("opendiscord:autoclose-hours", option.autoclose.inactiveHours),
        new index_1.api.ODOptionData("opendiscord:autodelete-enable-days", option.autodelete.enableInactiveDays),
        new index_1.api.ODOptionData("opendiscord:autodelete-enable-leave", option.autodelete.enableUserLeave),
        new index_1.api.ODOptionData("opendiscord:autodelete-disable-claim", option.autodelete.disableOnClaim),
        new index_1.api.ODOptionData("opendiscord:autodelete-days", option.autodelete.inactiveDays),
        new index_1.api.ODOptionData("opendiscord:cooldown-enabled", option.cooldown.enabled),
        new index_1.api.ODOptionData("opendiscord:cooldown-minutes", option.cooldown.cooldownMinutes),
        new index_1.api.ODOptionData("opendiscord:limits-enabled", option.limits.enabled),
        new index_1.api.ODOptionData("opendiscord:limits-maximum-global", option.limits.globalMaximum),
        new index_1.api.ODOptionData("opendiscord:limits-maximum-user", option.limits.userMaximum),
        new index_1.api.ODOptionData("opendiscord:slowmode-enabled", option.slowMode.enabled),
        new index_1.api.ODOptionData("opendiscord:slowmode-seconds", option.slowMode.slowModeSeconds)
    ]);
};
exports.loadTicketOption = loadTicketOption;
const loadWebsiteOption = (opt) => {
    return new index_1.api.ODWebsiteOption(opt.id, [
        new index_1.api.ODOptionData("opendiscord:name", opt.name),
        new index_1.api.ODOptionData("opendiscord:description", opt.description),
        new index_1.api.ODOptionData("opendiscord:button-emoji", opt.button.emoji),
        new index_1.api.ODOptionData("opendiscord:button-label", opt.button.label),
        new index_1.api.ODOptionData("opendiscord:url", opt.url)
    ]);
};
exports.loadWebsiteOption = loadWebsiteOption;
const loadRoleOption = (opt) => {
    return new index_1.api.ODRoleOption(opt.id, [
        new index_1.api.ODOptionData("opendiscord:name", opt.name),
        new index_1.api.ODOptionData("opendiscord:description", opt.description),
        new index_1.api.ODOptionData("opendiscord:button-emoji", opt.button.emoji),
        new index_1.api.ODOptionData("opendiscord:button-label", opt.button.label),
        new index_1.api.ODOptionData("opendiscord:button-color", opt.button.color),
        new index_1.api.ODOptionData("opendiscord:roles", opt.roles),
        new index_1.api.ODOptionData("opendiscord:mode", opt.mode),
        new index_1.api.ODOptionData("opendiscord:remove-roles-on-add", opt.removeRolesOnAdd),
        new index_1.api.ODOptionData("opendiscord:add-on-join", opt.addOnMemberJoin)
    ]);
};
exports.loadRoleOption = loadRoleOption;
const loadTicketOptionSuffix = (option) => {
    const mode = option.get("opendiscord:channel-suffix").value;
    const globalDatabase = index_1.opendiscord.databases.get("opendiscord:global");
    if (mode == "user-name")
        return new index_1.api.ODOptionUserNameSuffix(option.id.value, option);
    else if (mode == "user-nickname")
        return new index_1.api.ODOptionUserNicknameSuffix(option.id.value, option);
    else if (mode == "random-number")
        return new index_1.api.ODOptionRandomNumberSuffix(option.id.value, option, globalDatabase);
    else if (mode == "random-hex")
        return new index_1.api.ODOptionRandomHexSuffix(option.id.value, option, globalDatabase);
    else if (mode == "counter-fixed")
        return new index_1.api.ODOptionCounterFixedSuffix(option.id.value, option, globalDatabase);
    else if (mode == "counter-dynamic")
        return new index_1.api.ODOptionCounterDynamicSuffix(option.id.value, option, globalDatabase);
    else
        return new index_1.api.ODOptionUserIdSuffix(option.id.value, option);
};
exports.loadTicketOptionSuffix = loadTicketOptionSuffix;
