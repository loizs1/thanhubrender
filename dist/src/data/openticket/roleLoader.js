"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadRole = exports.loadAllRoles = void 0;
const index_1 = require("../../index");
const loadAllRoles = async () => {
    await index_1.opendiscord.options.loopAll((opt) => {
        if (opt instanceof index_1.api.ODRoleOption) {
            index_1.opendiscord.roles.add((0, exports.loadRole)(opt));
        }
    });
};
exports.loadAllRoles = loadAllRoles;
const loadRole = (option) => {
    return new index_1.api.ODRole(option.id, [
        new index_1.api.ODRoleData("opendiscord:roles", option.get("opendiscord:roles").value),
        new index_1.api.ODRoleData("opendiscord:mode", option.get("opendiscord:mode").value),
        new index_1.api.ODRoleData("opendiscord:remove-roles-on-add", option.get("opendiscord:remove-roles-on-add").value),
        new index_1.api.ODRoleData("opendiscord:add-on-join", option.get("opendiscord:add-on-join").value)
    ]);
};
exports.loadRole = loadRole;
