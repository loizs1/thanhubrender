"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerActions = void 0;
///////////////////////////////////////
//REACTION ROLE SYSTEM
///////////////////////////////////////
const index_1 = require("../index");
const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
const registerActions = async () => {
    index_1.opendiscord.actions.add(new index_1.api.ODAction("opendiscord:reaction-role"));
    index_1.opendiscord.actions.get("opendiscord:reaction-role").workers.add([
        new index_1.api.ODWorker("opendiscord:reaction-role", 2, async (instance, params, source, cancel) => {
            const { guild, user, option, overwriteMode } = params;
            const role = index_1.opendiscord.roles.get(option.id);
            if (!role)
                throw new index_1.api.ODSystemError("ODAction(ot:reaction-role) => Unknown reaction role (ODRole)");
            instance.role = role;
            const mode = (overwriteMode) ? overwriteMode : role.get("opendiscord:mode").value;
            await index_1.opendiscord.events.get("onRoleUpdate").emit([user, role]);
            //get guild member
            const member = await index_1.opendiscord.client.fetchGuildMember(guild, user.id);
            if (!member)
                throw new index_1.api.ODSystemError("ODAction(ot:reaction-role) => User isn't a member of the server!");
            //get all roles
            const roleIds = role.get("opendiscord:roles").value;
            const roles = [];
            for (const id of roleIds) {
                const r = await index_1.opendiscord.client.fetchGuildRole(guild, id);
                if (r)
                    roles.push(r);
                else
                    index_1.opendiscord.log("Unable to find role in server!", "warning", [
                        { key: "roleid", value: id }
                    ]);
            }
            //update roles of user
            const result = [];
            for (const r of roles) {
                try {
                    if (r.members.has(user.id) && (mode == "add&remove" || mode == "remove")) {
                        //user has role (remove)
                        await member.roles.remove(r);
                        result.push({ role: r, action: "removed" });
                    }
                    else if (!r.members.has(user.id) && (mode == "add&remove" || mode == "add")) {
                        //user doesn't have role (add)
                        await member.roles.add(r);
                        result.push({ role: r, action: "added" });
                    }
                    else {
                        //don't do anything
                        result.push({ role: r, action: null });
                    }
                }
                catch {
                    result.push({ role: r, action: null });
                }
            }
            //get roles to remove on add
            if (result.find((r) => r.action == "added")) {
                //get all remove roles
                const removeRoleIds = role.get("opendiscord:remove-roles-on-add").value;
                const removeRoles = [];
                for (const id of removeRoleIds) {
                    const r = await index_1.opendiscord.client.fetchGuildRole(guild, id);
                    if (r)
                        removeRoles.push(r);
                    else
                        index_1.opendiscord.log("Unable to find role in server!", "warning", [
                            { key: "roleid", value: id }
                        ]);
                }
                //remove roles from user
                for (const r of removeRoles) {
                    try {
                        if (r.members.has(user.id)) {
                            //user has role (remove)
                            await member.roles.remove(r);
                            result.push({ role: r, action: "removed" });
                        }
                    }
                    catch { }
                }
            }
            //update instance & finish event
            instance.result = result;
            await index_1.opendiscord.events.get("afterRolesUpdated").emit([user, role]);
        }),
        new index_1.api.ODWorker("opendiscord:discord-logs", 1, async (instance, params, source, cancel) => {
            const { guild, user, option, overwriteMode } = params;
            if (!instance.role || !instance.result)
                return;
            //to logs
            if (generalConfig.data.system.logs.enabled && (generalConfig.data.system.messages.reactionRole.logs)) {
                const logChannel = index_1.opendiscord.posts.get("opendiscord:logs");
                if (logChannel)
                    logChannel.send(await index_1.opendiscord.builders.messages.getSafe("opendiscord:reaction-role-logs").build(source, { guild, user, role: instance.role, result: instance.result }));
            }
            //to dm
            if (generalConfig.data.system.messages.reactionRole.dm)
                await index_1.opendiscord.client.sendUserDm(user, await index_1.opendiscord.builders.messages.getSafe("opendiscord:reaction-role-dm").build(source, { guild, user, role: instance.role, result: instance.result }));
        }),
        new index_1.api.ODWorker("opendiscord:logs", 0, (instance, params, source, cancel) => {
            const { guild, user, option } = params;
            index_1.opendiscord.log(user.displayName + " updated his roles!", "info", [
                { key: "user", value: user.username },
                { key: "userid", value: user.id, hidden: true },
                { key: "method", value: source },
                { key: "option", value: option.id.value }
            ]);
        })
    ]);
};
exports.registerActions = registerActions;
