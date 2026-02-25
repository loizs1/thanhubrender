"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTicketOptionCooldown = exports.loadAllCooldowns = void 0;
const index_1 = require("../../index");
const loadAllCooldowns = async () => {
    await index_1.opendiscord.options.loopAll((option) => {
        if (!(option instanceof index_1.api.ODTicketOption))
            return;
        (0, exports.loadTicketOptionCooldown)(option);
    });
};
exports.loadAllCooldowns = loadAllCooldowns;
const loadTicketOptionCooldown = (option) => {
    if (option.get("opendiscord:cooldown-enabled").value) {
        //option has cooldown
        const minutes = option.get("opendiscord:cooldown-minutes").value;
        const milliseconds = minutes * 60000;
        index_1.opendiscord.cooldowns.add(new index_1.api.ODTimeoutCooldown("opendiscord:option-cooldown_" + option.id.value, milliseconds));
    }
};
exports.loadTicketOptionCooldown = loadTicketOptionCooldown;
