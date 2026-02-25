"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAllBlacklistedUsers = void 0;
const index_1 = require("../../index");
const loadAllBlacklistedUsers = async () => {
    const userDatabase = index_1.opendiscord.databases.get("opendiscord:users");
    if (!userDatabase)
        return;
    const users = await userDatabase.getCategory("opendiscord:blacklist") ?? [];
    users.forEach((user) => {
        if (typeof user.value == "string" || user.value === null)
            index_1.opendiscord.blacklist.add(new index_1.api.ODBlacklist(user.key, user.value));
    });
};
exports.loadAllBlacklistedUsers = loadAllBlacklistedUsers;
