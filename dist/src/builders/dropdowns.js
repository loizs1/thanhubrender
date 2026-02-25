"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAllDropdowns = void 0;
///////////////////////////////////////
//DROPDOWN BUILDERS
///////////////////////////////////////
const index_1 = require("../index");
const dropdowns = index_1.opendiscord.builders.dropdowns;
const registerAllDropdowns = async () => {
    panelDropdowns();
};
exports.registerAllDropdowns = registerAllDropdowns;
const panelDropdowns = () => {
    //TICKET OPTION
    dropdowns.add(new index_1.api.ODDropdown("opendiscord:panel-dropdown-tickets"));
    dropdowns.get("opendiscord:panel-dropdown-tickets").workers.add(new index_1.api.ODWorker("opendiscord:panel-dropdown-tickets", 0, async (instance, params) => {
        const { panel, options } = params;
        const parsedOptions = options.map((option) => {
            const label = option.get("opendiscord:button-label").value.substring(0, 100);
            const desc = option.get("opendiscord:description").value.substring(0, 100);
            const emoji = option.get("opendiscord:button-emoji").value;
            return {
                label: (label.length > 0) ? label : "<no-label-provided>",
                value: "od:ticket-option_" + panel.id.value + "_" + option.id.value,
                emoji: (emoji.length > 0) ? emoji : undefined,
                description: (desc.length > 0) ? desc : undefined,
                default: false
            };
        });
        instance.setCustomId("od:panel-dropdown_" + panel.id.value);
        instance.setType("string");
        instance.setMaxValues(1);
        instance.setMinValues(0);
        instance.setPlaceholder(panel.get("opendiscord:dropdown-placeholder").value);
        instance.setOptions(parsedOptions);
    }));
};
