"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAutocompleteResponders = void 0;
///////////////////////////////////////
//AUTOCOMPLETE COMMAND UTILS
///////////////////////////////////////
const index_1 = require("../index");
const registerAutocompleteResponders = async () => {
    //PANEL ID AUTOCOMPLETE
    index_1.opendiscord.responders.autocomplete.add(new index_1.api.ODAutocompleteResponder("opendiscord:panel-id", "panel", "id"));
    index_1.opendiscord.responders.autocomplete.get("opendiscord:panel-id").workers.add(new index_1.api.ODWorker("opendiscord:panel-id", 0, async (instance, params, source, cancel) => {
        //create panel choices
        const panelChoices = [];
        index_1.opendiscord.configs.get("opendiscord:panels").data.forEach((panel) => {
            panelChoices.push({ name: panel.name, value: panel.id });
        });
        await instance.filteredAutocomplete(panelChoices);
    }));
    //OPTION ID AUTOCOMPLETE
    index_1.opendiscord.responders.autocomplete.add(new index_1.api.ODAutocompleteResponder("opendiscord:option-id", /ticket|move/, "id"));
    index_1.opendiscord.responders.autocomplete.get("opendiscord:option-id").workers.add(new index_1.api.ODWorker("opendiscord:option-id", 0, async (instance, params, source, cancel) => {
        //create ticket choices
        const ticketChoices = [];
        index_1.opendiscord.configs.get("opendiscord:options").data.forEach((option) => {
            if (option.type != "ticket")
                return;
            ticketChoices.push({ name: option.name, value: option.id });
        });
        instance.filteredAutocomplete(ticketChoices);
    }));
};
exports.registerAutocompleteResponders = registerAutocompleteResponders;
