"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerButtonResponders = void 0;
///////////////////////////////////////
//VERIFYBAR SYSTEM
///////////////////////////////////////
const index_1 = require("../index");
const registerButtonResponders = async () => {
    //VERIFYBAR SUCCESS
    index_1.opendiscord.responders.buttons.add(new index_1.api.ODButtonResponder("opendiscord:verifybar-success", /^od:verifybar-success_([^_]+)/));
    index_1.opendiscord.responders.buttons.get("opendiscord:verifybar-success").workers.add(new index_1.api.ODWorker("opendiscord:handle-verifybar", 0, async (instance, params, source, cancel) => {
        const id = instance.interaction.customId.split("_")[1];
        const customData = instance.interaction.customId.split("_")[2];
        const verifybar = index_1.opendiscord.verifybars.get(id);
        if (!verifybar)
            return;
        if (verifybar.success)
            await verifybar.success.executeWorkers(instance, "verifybar", { data: customData ?? null, verifybarMessage: instance.message });
    }));
    //VERIFYBAR FAILURE
    index_1.opendiscord.responders.buttons.add(new index_1.api.ODButtonResponder("opendiscord:verifybar-failure", /^od:verifybar-failure_([^_]+)/));
    index_1.opendiscord.responders.buttons.get("opendiscord:verifybar-failure").workers.add(new index_1.api.ODWorker("opendiscord:handle-verifybar", 0, async (instance, params, source, cancel) => {
        const id = instance.interaction.customId.split("_")[1];
        const customData = instance.interaction.customId.split("_")[2];
        const verifybar = index_1.opendiscord.verifybars.get(id);
        if (!verifybar)
            return;
        if (verifybar.failure)
            await verifybar.failure.executeWorkers(instance, "verifybar", { data: customData ?? null, verifybarMessage: instance.message });
    }));
};
exports.registerButtonResponders = registerButtonResponders;
