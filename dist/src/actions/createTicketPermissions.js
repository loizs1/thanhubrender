"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerActions = void 0;
///////////////////////////////////////
//TICKET CREATION SYSTEM
///////////////////////////////////////
const index_1 = require("../index");
const registerActions = async () => {
    index_1.opendiscord.actions.add(new index_1.api.ODAction("opendiscord:create-ticket-permissions"));
    index_1.opendiscord.actions.get("opendiscord:create-ticket-permissions").workers.add([
        new index_1.api.ODWorker("opendiscord:check-roles", 5, async (instance, params, source, cancel) => {
            if (!params.option.exists("opendiscord:roles"))
                return;
            const rolesData = params.option.get("opendiscord:roles");
            if (!rolesData)
                return;
            const optionRoles = rolesData.value;
            if (optionRoles.length === 0)
                return;
            // Fetch guild member to get their roles
            const member = await params.guild.members.fetch(params.user.id).catch(() => null);
            if (!member)
                return;
            const userRoleIds = member.roles.cache.map(r => r.id);
            const hideRoles = optionRoles.filter(r => r.startsWith("!"));
            const requiredRoles = optionRoles.filter(r => !r.startsWith("!"));
            // If user has any of the hide roles, deny access
            if (hideRoles.length > 0) {
                const hideRoleIds = hideRoles.map(r => r.substring(1));
                const hasHiddenRole = hideRoleIds.some(roleId => userRoleIds.includes(roleId));
                if (hasHiddenRole) {
                    instance.valid = false;
                    instance.reason = "custom";
                    instance.customReason = "You don't have the required roles to create this ticket!";
                    index_1.opendiscord.log(params.user.displayName + " tried to create a ticket but doesn't have the required roles!", "info", [
                        { key: "user", value: params.user.username },
                        { key: "userid", value: params.user.id, hidden: true },
                        { key: "option", value: params.option.id.value },
                        { key: "reason", value: "hide-role" }
                    ]);
                    return cancel();
                }
            }
            // If required roles are set and user doesn't have any, deny access
            if (requiredRoles.length > 0) {
                const hasAccess = requiredRoles.some(roleId => userRoleIds.includes(roleId));
                if (!hasAccess) {
                    instance.valid = false;
                    instance.reason = "custom";
                    instance.customReason = "You don't have the required roles to create this ticket!";
                    index_1.opendiscord.log(params.user.displayName + " tried to create a ticket but doesn't have the required roles!", "info", [
                        { key: "user", value: params.user.username },
                        { key: "userid", value: params.user.id, hidden: true },
                        { key: "option", value: params.option.id.value },
                        { key: "reason", value: "required-role" }
                    ]);
                    return cancel();
                }
            }
        }),
        new index_1.api.ODWorker("opendiscord:check-blacklist", 4, (instance, params, source, cancel) => {
            if (!params.option.get("opendiscord:allow-blacklisted-users").value && index_1.opendiscord.blacklist.exists(params.user.id)) {
                instance.valid = false;
                instance.reason = "blacklist";
                index_1.opendiscord.log(params.user.displayName + " tried to create a ticket but is blacklisted!", "info", [
                    { key: "user", value: params.user.username },
                    { key: "userid", value: params.user.id, hidden: true },
                    { key: "option", value: params.option.id.value }
                ]);
                return cancel();
            }
        }),
        new index_1.api.ODWorker("opendiscord:check-cooldown", 3, (instance, params, source, cancel) => {
            const cooldown = index_1.opendiscord.cooldowns.get("opendiscord:option-cooldown_" + params.option.id.value);
            if (cooldown && cooldown instanceof index_1.api.ODTimeoutCooldown && cooldown.use(params.user.id)) {
                instance.valid = false;
                instance.reason = "cooldown";
                const remaining = cooldown.remaining(params.user.id) ?? 0;
                instance.cooldownUntil = new Date(new Date().getTime() + remaining);
                index_1.opendiscord.log(params.user.displayName + " tried to create a ticket but is on cooldown!", "info", [
                    { key: "user", value: params.user.username },
                    { key: "userid", value: params.user.id, hidden: true },
                    { key: "option", value: params.option.id.value },
                    { key: "remaining", value: (remaining / 1000).toString() + "sec" }
                ]);
                return cancel();
            }
        }),
        new index_1.api.ODWorker("opendiscord:check-global-limits", 2, (instance, params, source, cancel) => {
            const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
            if (!generalConfig.data.system.limits.enabled)
                return;
            const allTickets = index_1.opendiscord.tickets.getAll();
            const globalTicketCount = allTickets.length;
            const userTickets = index_1.opendiscord.tickets.getFiltered((ticket) => ticket.exists("opendiscord:opened-by") && (ticket.get("opendiscord:opened-by").value == params.user.id));
            const userTicketCount = userTickets.length;
            if (globalTicketCount >= generalConfig.data.system.limits.globalMaximum) {
                instance.valid = false;
                instance.reason = "global-limit";
                index_1.opendiscord.log(params.user.displayName + " tried to create a ticket but reached the limit!", "info", [
                    { key: "user", value: params.user.username },
                    { key: "userid", value: params.user.id, hidden: true },
                    { key: "option", value: params.option.id.value },
                    { key: "limit", value: "global" }
                ]);
                return cancel();
            }
            else if (userTicketCount >= generalConfig.data.system.limits.userMaximum) {
                instance.valid = false;
                instance.reason = "global-user-limit";
                index_1.opendiscord.log(params.user.displayName + " tried to create a ticket, but reached the limit!", "info", [
                    { key: "user", value: params.user.username },
                    { key: "userid", value: params.user.id, hidden: true },
                    { key: "option", value: params.option.id.value },
                    { key: "limit", value: "global-user" }
                ]);
                return cancel();
            }
        }),
        new index_1.api.ODWorker("opendiscord:check-option-limits", 1, (instance, params, source, cancel) => {
            if (!params.option.exists("opendiscord:limits-enabled") || !params.option.get("opendiscord:limits-enabled").value)
                return;
            const allTickets = index_1.opendiscord.tickets.getFiltered((ticket) => ticket.option.id.value == params.option.id.value);
            const globalTicketCount = allTickets.length;
            const userTickets = index_1.opendiscord.tickets.getFiltered((ticket) => ticket.option.id.value == params.option.id.value && ticket.exists("opendiscord:opened-by") && (ticket.get("opendiscord:opened-by").value == params.user.id));
            const userTicketCount = userTickets.length;
            if (globalTicketCount >= params.option.get("opendiscord:limits-maximum-global").value) {
                instance.valid = false;
                instance.reason = "option-limit";
                index_1.opendiscord.log(params.user.displayName + " tried to create a ticket, but reached the limit!", "info", [
                    { key: "user", value: params.user.username },
                    { key: "userid", value: params.user.id, hidden: true },
                    { key: "option", value: params.option.id.value },
                    { key: "limit", value: "option" }
                ]);
                return cancel();
            }
            else if (userTicketCount >= params.option.get("opendiscord:limits-maximum-user").value) {
                instance.valid = false;
                instance.reason = "option-user-limit";
                index_1.opendiscord.log(params.user.displayName + " tried to create a ticket, but reached the limit!", "info", [
                    { key: "user", value: params.user.username },
                    { key: "userid", value: params.user.id, hidden: true },
                    { key: "option", value: params.option.id.value },
                    { key: "limit", value: "option-user" }
                ]);
                return cancel();
            }
        }),
        new index_1.api.ODWorker("opendiscord:valid", 0, (instance, params, source, cancel) => {
            instance.valid = true;
            instance.reason = null;
            cancel();
        })
    ]);
};
exports.registerActions = registerActions;
