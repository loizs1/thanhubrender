"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerButtonResponders = exports.registerCommandResponders = void 0;
///////////////////////////////////////
//HELP COMMAND
///////////////////////////////////////
const index_1 = require("../index");
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const registerCommandResponders = async () => {
    //HELP COMMAND RESPONDER
    index_1.opendiscord.responders.commands.add(new index_1.api.ODCommandResponder("opendiscord:help", generalConfig.data.prefix, "help"));
    index_1.opendiscord.responders.commands.get("opendiscord:help").workers.add([
        new index_1.api.ODWorker("opendiscord:help", 0, async (instance, params, source, cancel) => {
            const { guild, channel, user, member } = instance;
            //check permissions
            const permsResult = await index_1.opendiscord.permissions.checkCommandPerms(generalConfig.data.system.permissions.help, "support", user, member, channel, guild);
            if (!permsResult.hasPerms) {
                if (permsResult.reason == "not-in-server")
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("button", { channel, user }));
                else
                    await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build(source, { guild, channel, user, permissions: ["support"] }));
                return cancel();
            }
            //calculate slash/text mode for help menu
            let mode;
            if (generalConfig.data.slashCommands && generalConfig.data.textCommands)
                mode = (generalConfig.data.system.preferSlashOverText) ? "slash" : "text";
            else if (!generalConfig.data.slashCommands)
                mode = "text";
            else
                mode = "slash";
            await instance.reply(await index_1.opendiscord.builders.messages.getSafe("opendiscord:help-menu").build(source, { mode, page: 0 }));
        }),
        new index_1.api.ODWorker("opendiscord:logs", -1, (instance, params, source, cancel) => {
            index_1.opendiscord.log(instance.user.displayName + " used the 'help' command!", "info", [
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
    //HELP MENU SWITCH BUTTON RESPONDER
    index_1.opendiscord.responders.buttons.add(new index_1.api.ODButtonResponder("opendiscord:help-menu-switch", /^od:help-menu-switch_(slash|text)/));
    index_1.opendiscord.responders.buttons.get("opendiscord:help-menu-switch").workers.add(new index_1.api.ODWorker("opendiscord:update-help-menu", 0, async (instance, params, source, cancel) => {
        const mode = instance.interaction.customId.split("_")[1];
        const pageButton = instance.getMessageComponent("button", /^od:help-menu-page_([0-9]+)/);
        const currentPage = (pageButton && pageButton.customId) ? Number(pageButton.customId.split("_")[1]) : 0;
        const newMode = (mode == "slash") ? "text" : "slash";
        const msg = await index_1.opendiscord.builders.messages.getSafe("opendiscord:help-menu").build("button", { mode: newMode, page: currentPage });
        await instance.update(msg);
    }));
    //HELP MENU PREVIOUS BUTTON RESPONDER
    index_1.opendiscord.responders.buttons.add(new index_1.api.ODButtonResponder("opendiscord:help-menu-previous", /^od:help-menu-previous/));
    index_1.opendiscord.responders.buttons.get("opendiscord:help-menu-previous").workers.add(new index_1.api.ODWorker("opendiscord:update-help-menu", 0, async (instance, params, source, cancel) => {
        const switchButton = instance.getMessageComponent("button", /^od:help-menu-switch_(slash|text)/);
        const pageButton = instance.getMessageComponent("button", /^od:help-menu-page_([0-9]+)/);
        const currentPage = (pageButton && pageButton.customId) ? Number(pageButton.customId.split("_")[1]) : 0;
        const currentMode = (switchButton && switchButton.customId) ? switchButton.customId.split("_")[1] : "slash";
        const msg = await index_1.opendiscord.builders.messages.getSafe("opendiscord:help-menu").build("button", { mode: currentMode, page: currentPage - 1 });
        await instance.update(msg);
    }));
    //HELP MENU NEXT BUTTON RESPONDER
    index_1.opendiscord.responders.buttons.add(new index_1.api.ODButtonResponder("opendiscord:help-menu-next", /^od:help-menu-next/));
    index_1.opendiscord.responders.buttons.get("opendiscord:help-menu-next").workers.add(new index_1.api.ODWorker("opendiscord:update-help-menu", 0, async (instance, params, source, cancel) => {
        const switchButton = instance.getMessageComponent("button", /^od:help-menu-switch_(slash|text)/);
        const pageButton = instance.getMessageComponent("button", /^od:help-menu-page_([0-9]+)/);
        const currentPage = (pageButton && pageButton.customId) ? Number(pageButton.customId.split("_")[1]) : 0;
        const currentMode = (switchButton && switchButton.customId) ? switchButton.customId.split("_")[1] : "slash";
        const msg = await index_1.opendiscord.builders.messages.getSafe("opendiscord:help-menu").build("button", { mode: currentMode, page: currentPage + 1 });
        await instance.update(msg);
    }));
};
exports.registerButtonResponders = registerButtonResponders;
