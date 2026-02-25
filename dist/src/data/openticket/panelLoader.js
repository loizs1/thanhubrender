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
exports.loadPanel = exports.loadAllPanels = void 0;
exports.describePanelOptions = describePanelOptions;
const index_1 = require("../../index");
const discord = __importStar(require("discord.js"));
const lang = index_1.opendiscord.languages;
const loadAllPanels = async () => {
    const panelConfig = index_1.opendiscord.configs.get("opendiscord:panels");
    if (!panelConfig)
        return;
    panelConfig.data.forEach((panel) => {
        index_1.opendiscord.panels.add((0, exports.loadPanel)(panel));
    });
    //update panels on config reload
    panelConfig.onReload(async () => {
        //clear previous panels
        await index_1.opendiscord.panels.loopAll((data, id) => { index_1.opendiscord.panels.remove(id); });
        //add new panels
        panelConfig.data.forEach((panel) => {
            index_1.opendiscord.panels.add((0, exports.loadPanel)(panel));
        });
    });
};
exports.loadAllPanels = loadAllPanels;
const loadPanel = (panel) => {
    return new index_1.api.ODPanel(panel.id, [
        new index_1.api.ODPanelData("opendiscord:name", panel.name),
        new index_1.api.ODPanelData("opendiscord:options", panel.options),
        new index_1.api.ODPanelData("opendiscord:dropdown", panel.dropdown),
        new index_1.api.ODPanelData("opendiscord:text", panel.text),
        new index_1.api.ODPanelData("opendiscord:embed", panel.embed),
        new index_1.api.ODPanelData("opendiscord:dropdown-placeholder", panel.settings.dropdownPlaceholder),
        new index_1.api.ODPanelData("opendiscord:enable-max-tickets-warning-text", panel.settings.enableMaxTicketsWarningInText),
        new index_1.api.ODPanelData("opendiscord:enable-max-tickets-warning-embed", panel.settings.enableMaxTicketsWarningInEmbed),
        new index_1.api.ODPanelData("opendiscord:describe-options-layout", panel.settings.describeOptionsLayout),
        new index_1.api.ODPanelData("opendiscord:describe-options-custom-title", panel.settings.describeOptionsCustomTitle),
        new index_1.api.ODPanelData("opendiscord:describe-options-in-text", panel.settings.describeOptionsInText),
        new index_1.api.ODPanelData("opendiscord:describe-options-in-embed-fields", panel.settings.describeOptionsInEmbedFields),
        new index_1.api.ODPanelData("opendiscord:describe-options-in-embed-description", panel.settings.describeOptionsInEmbedDescription),
    ]);
};
exports.loadPanel = loadPanel;
function describePanelOptions(mode, panel) {
    const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
    const layout = panel.get("opendiscord:describe-options-layout").value;
    const dropdownMode = panel.get("opendiscord:dropdown").value;
    const options = [];
    let hasTicket = false;
    let hasWebsite = false;
    let hasRole = false;
    let ticketOnly = true;
    let websiteOnly = true;
    let roleOnly = true;
    panel.get("opendiscord:options").value.forEach((id) => {
        const opt = index_1.opendiscord.options.get(id);
        if (opt) {
            if (opt instanceof index_1.api.ODTicketOption) {
                options.push(opt);
                hasTicket = true;
                roleOnly = false;
                websiteOnly = false;
            }
            else if (!dropdownMode && opt instanceof index_1.api.ODWebsiteOption) {
                options.push(opt);
                hasWebsite = true;
                ticketOnly = false;
                roleOnly = false;
            }
            else if (!dropdownMode && opt instanceof index_1.api.ODRoleOption) {
                options.push(opt);
                hasRole = true;
                ticketOnly = false;
                websiteOnly = false;
            }
        }
    });
    const autotitle = (hasTicket && ticketOnly) ? lang.getTranslation("panel.selectTicket") + ":" : ((hasRole && roleOnly) ? lang.getTranslation("panel.selectRole") + ":" : lang.getTranslation("panel.selectOption") + ":");
    const title = (panel.get("opendiscord:describe-options-custom-title").value.length < 1) ? "__" + autotitle + "__\n" : "__" + panel.get("opendiscord:describe-options-custom-title").value + "__\n";
    if (mode == "fields")
        return options.map((opt) => {
            if (opt instanceof index_1.api.ODTicketOption) {
                //ticket option
                const emoji = opt.exists("opendiscord:button-emoji") ? opt.get("opendiscord:button-emoji").value : "";
                const name = opt.exists("opendiscord:name") ? opt.get("opendiscord:name").value : "`<unnamed-ticket>`";
                let description = opt.exists("opendiscord:description") ? opt.get("opendiscord:description").value : "`<no-description>`";
                if (layout == "normal" || layout == "detailed") {
                    if (opt.exists("opendiscord:cooldown-enabled") && opt.get("opendiscord:cooldown-enabled").value)
                        description = description + "\n" + lang.getTranslation("params.uppercase.cooldown") + ": `" + opt.get("opendiscord:cooldown-minutes").value + " min`";
                    if (opt.exists("opendiscord:limits-enabled") && opt.get("opendiscord:limits-enabled").value)
                        description = description + "\n" + lang.getTranslation("params.uppercase.maxTickets") + ": `" + opt.get("opendiscord:limits-maximum-user").value + "`";
                }
                if (layout == "detailed") {
                    const optionAdmins = [...opt.get("opendiscord:admins").value];
                    if (generalConfig.data.system.showGlobalAdminsInPanelRoles) {
                        for (const admin of generalConfig.data.globalAdmins) {
                            if (!optionAdmins.includes(admin))
                                optionAdmins.push(admin);
                        }
                    }
                    if (opt.exists("opendiscord:admins"))
                        description = description + "\n" + lang.getTranslation("params.uppercase.admins") + ": " + optionAdmins.map((admin) => discord.roleMention(admin)).join(", ");
                }
                if (description == "")
                    description = "`<no-description>`";
                return { name: index_1.utilities.emojiTitle(emoji, name), value: description };
            }
            else if (opt instanceof index_1.api.ODWebsiteOption) {
                //website option
                const emoji = opt.exists("opendiscord:button-emoji") ? opt.get("opendiscord:button-emoji").value : "";
                const name = opt.exists("opendiscord:name") ? opt.get("opendiscord:name").value : "`<unnamed-website>`";
                let description = opt.exists("opendiscord:description") ? opt.get("opendiscord:description").value : "`<no-description>`";
                if (description == "")
                    description = "`<no-description>`";
                return { name: index_1.utilities.emojiTitle(emoji, name), value: description };
            }
            else if (opt instanceof index_1.api.ODRoleOption) {
                //role option
                const emoji = opt.exists("opendiscord:button-emoji") ? opt.get("opendiscord:button-emoji").value : "";
                const name = opt.exists("opendiscord:name") ? opt.get("opendiscord:name").value : "`<unnamed-role>`";
                let description = opt.exists("opendiscord:description") ? opt.get("opendiscord:description").value : "`<no-description>`";
                if (layout == "normal" || layout == "detailed") {
                    if (opt.exists("opendiscord:roles"))
                        description = description + "\n" + lang.getTranslation("params.uppercase.roles") + ": " + opt.get("opendiscord:roles").value.map((admin) => discord.roleMention(admin)).join(", ");
                }
                if (description == "")
                    description = "`<no-description>`";
                return { name: index_1.utilities.emojiTitle(emoji, name), value: description };
            }
            else {
                //auto-generated plugin option
                const emoji = opt.get("opendiscord:button-emoji");
                const name = opt.get("opendiscord:name");
                const description = opt.get("opendiscord:description");
                return { name: index_1.utilities.emojiTitle((emoji ? emoji.value : ""), (name ? name.value : "`" + opt.id + "`")), value: ((description && description.value) ? description.value : "`<no-description>`") };
            }
        });
    else if (mode == "text")
        return title + options.map((opt) => {
            if (opt instanceof index_1.api.ODTicketOption) {
                //ticket option
                const emoji = opt.exists("opendiscord:button-emoji") ? opt.get("opendiscord:button-emoji").value : "";
                const name = opt.exists("opendiscord:name") ? opt.get("opendiscord:name").value : "`<unnamed-ticket>`";
                let description = opt.exists("opendiscord:description") ? opt.get("opendiscord:description").value : "`<no-description>`";
                if (layout == "normal" || layout == "detailed") {
                    if (opt.exists("opendiscord:cooldown-enabled") && opt.get("opendiscord:cooldown-enabled").value)
                        description = description + "\n" + lang.getTranslation("params.uppercase.cooldown") + ": `" + opt.get("opendiscord:cooldown-minutes").value + " min`";
                    if (opt.exists("opendiscord:limits-enabled") && opt.get("opendiscord:limits-enabled").value)
                        description = description + "\n" + lang.getTranslation("params.uppercase.maxTickets") + ": `" + opt.get("opendiscord:limits-maximum-user").value + "`";
                }
                if (layout == "detailed") {
                    const optionAdmins = [...opt.get("opendiscord:admins").value];
                    if (generalConfig.data.system.showGlobalAdminsInPanelRoles) {
                        for (const admin of generalConfig.data.globalAdmins) {
                            if (!optionAdmins.includes(admin))
                                optionAdmins.push(admin);
                        }
                    }
                    if (opt.exists("opendiscord:admins"))
                        description = description + "\n" + lang.getTranslation("params.uppercase.admins") + ": " + optionAdmins.map((admin) => discord.roleMention(admin)).join(", ");
                }
                if (layout == "simple")
                    return "**" + index_1.utilities.emojiTitle(emoji, name) + ":** " + description;
                else
                    return "**" + index_1.utilities.emojiTitle(emoji, name) + "**\n" + description;
            }
            else if (opt instanceof index_1.api.ODWebsiteOption) {
                //website option
                const emoji = opt.exists("opendiscord:button-emoji") ? opt.get("opendiscord:button-emoji").value : "";
                const name = opt.exists("opendiscord:name") ? opt.get("opendiscord:name").value : "`<unnamed-website>`";
                let description = opt.exists("opendiscord:description") ? opt.get("opendiscord:description").value : "`<no-description>`";
                if (layout == "simple")
                    return "**" + index_1.utilities.emojiTitle(emoji, name) + ":** " + description;
                else
                    return "**" + index_1.utilities.emojiTitle(emoji, name) + "**\n" + description;
            }
            else if (opt instanceof index_1.api.ODRoleOption) {
                //role option
                const emoji = opt.exists("opendiscord:button-emoji") ? opt.get("opendiscord:button-emoji").value : "";
                const name = opt.exists("opendiscord:name") ? opt.get("opendiscord:name").value : "`<unnamed-role>`";
                let description = opt.exists("opendiscord:description") ? opt.get("opendiscord:description").value : "`<no-description>`";
                if (layout == "normal" || layout == "detailed") {
                    if (opt.exists("opendiscord:roles"))
                        description = description + "\n" + lang.getTranslation("params.uppercase.roles") + ": " + opt.get("opendiscord:roles").value.map((admin) => discord.roleMention(admin)).join(", ");
                }
                if (layout == "simple")
                    return "**" + index_1.utilities.emojiTitle(emoji, name) + ":** " + description;
                else
                    return "**" + index_1.utilities.emojiTitle(emoji, name) + "**\n" + description;
            }
            else {
                //auto-generated plugin option
                const emoji = opt.get("opendiscord:button-emoji");
                const name = opt.get("opendiscord:name");
                const description = opt.get("opendiscord:description");
                if (layout == "simple")
                    return "**" + index_1.utilities.emojiTitle((emoji ? emoji.value : ""), (name ? name.value : "`" + opt.id + "`")) + ":** " + (description ? description.value : "`<no-description>`");
                else
                    return "**" + index_1.utilities.emojiTitle((emoji ? emoji.value : ""), (name ? name.value : "`" + opt.id + "`")) + "**\n" + (description ? description.value : "`<no-description>`");
            }
        }).join("\n\n");
    else
        throw new index_1.api.ODSystemError("Unknown panel generation mode, choose 'text' or 'fields'");
}
