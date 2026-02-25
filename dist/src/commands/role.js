"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerButtonResponders = void 0;
///////////////////////////////////////
//ROLE BUTTON (not command)
///////////////////////////////////////
const index_1 = require("../index");
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const registerButtonResponders = async () => {
    //ROLE OPTION BUTTON RESPONDER
    index_1.opendiscord.responders.buttons.add(new index_1.api.ODButtonResponder("opendiscord:role-option", /^od:role-option_/));
    index_1.opendiscord.responders.buttons.get("opendiscord:role-option").workers.add(new index_1.api.ODWorker("opendiscord:role-option", 0, async (instance, params, source, cancel) => {
        const { guild, channel, user } = instance;
        //check is in guild/server
        if (!guild) {
            instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build(source, { channel: instance.channel, user: instance.user }));
            return cancel();
        }
        //get option data
        const optionId = instance.interaction.customId.split("_")[2];
        const option = index_1.opendiscord.options.get(optionId);
        if (!option || !(option instanceof index_1.api.ODRoleOption)) {
            //error
            instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-option-unknown").build(source, { guild: instance.guild, channel: instance.channel, user: instance.user }));
            return cancel();
        }
        //reaction role
        await instance.defer("reply", true);
        const res = await index_1.opendiscord.actions.get("opendiscord:reaction-role").run("panel-button", { guild, user, option, overwriteMode: null });
        if (!res.result || !res.role) {
            //error
            await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error").build(source, { guild, channel: instance.channel, user, error: "Unable to receive role update data from worker!", layout: "advanced" }));
            return cancel();
        }
        if (generalConfig.data.system.replyOnReactionRole)
            await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:reaction-role").build("panel-button", { guild, user, role: res.role, result: res.result }));
    }));
};
exports.registerButtonResponders = registerButtonResponders;
