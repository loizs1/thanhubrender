"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultOptionsDatabase = exports.defaultUsersDatabase = exports.defaultTicketsDatabase = exports.defaultStatsDatabase = exports.defaultGlobalDatabase = exports.defaultLeaderboardDatabase = exports.loadAllDatabases = void 0;
const index_1 = require("../../index");
const fjs = __importStar(require("formatted-json-stringify"));
const devdatabaseFlag = index_1.opendiscord.flags.get("opendiscord:dev-database");
const isDevdatabase = devdatabaseFlag ? devdatabaseFlag.value : false;
const loadAllDatabases = async () => {
    index_1.opendiscord.databases.add(exports.defaultGlobalDatabase);
    index_1.opendiscord.databases.add(exports.defaultStatsDatabase);
    index_1.opendiscord.databases.add(exports.defaultTicketsDatabase);
    index_1.opendiscord.databases.add(exports.defaultUsersDatabase);
    index_1.opendiscord.databases.add(exports.defaultOptionsDatabase);
    index_1.opendiscord.databases.add(exports.defaultLeaderboardDatabase);
};
exports.loadAllDatabases = loadAllDatabases;
const defaultInlineFormatter = new fjs.ArrayFormatter(null, true, new fjs.ObjectFormatter(null, false, [
    new fjs.PropertyFormatter("category"),
    new fjs.PropertyFormatter("key"),
    new fjs.DefaultFormatter("value", false)
]));
const defaultTicketFormatter = new fjs.ArrayFormatter(null, true, new fjs.ObjectFormatter(null, true, [
    new fjs.PropertyFormatter("category"),
    new fjs.PropertyFormatter("key"),
    new fjs.ObjectFormatter("value", true, [
        new fjs.PropertyFormatter("id"),
        new fjs.PropertyFormatter("option"),
        new fjs.PropertyFormatter("version"),
        new fjs.ArrayFormatter("data", true, new fjs.ObjectFormatter(null, false, [
            new fjs.PropertyFormatter("id"),
            new fjs.DefaultFormatter("value", false)
        ]))
    ])
]));
const defaultOptionFormatter = new fjs.ArrayFormatter(null, true, new fjs.ObjectFormatter(null, true, [
    new fjs.PropertyFormatter("category"),
    new fjs.PropertyFormatter("key"),
    new fjs.ObjectFormatter("value", true, [
        new fjs.PropertyFormatter("id"),
        new fjs.PropertyFormatter("type"),
        new fjs.PropertyFormatter("version"),
        new fjs.ArrayFormatter("data", true, new fjs.ObjectFormatter(null, false, [
            new fjs.PropertyFormatter("id"),
            new fjs.DefaultFormatter("value", false)
        ]))
    ])
]));
exports.defaultLeaderboardDatabase = new index_1.api.ODJsonDatabase("opendiscord:leaderboard", "leaderboard.json", (isDevdatabase) ? "./devdatabase/" : "./database/");
exports.defaultGlobalDatabase = new index_1.api.ODFormattedJsonDatabase("opendiscord:global", "global.json", defaultInlineFormatter, (isDevdatabase) ? "./devdatabase/" : "./database/");
exports.defaultStatsDatabase = new index_1.api.ODFormattedJsonDatabase("opendiscord:stats", "stats.json", defaultInlineFormatter, (isDevdatabase) ? "./devdatabase/" : "./database/");
exports.defaultTicketsDatabase = new index_1.api.ODFormattedJsonDatabase("opendiscord:tickets", "tickets.json", defaultTicketFormatter, (isDevdatabase) ? "./devdatabase/" : "./database/");
exports.defaultUsersDatabase = new index_1.api.ODFormattedJsonDatabase("opendiscord:users", "users.json", defaultInlineFormatter, (isDevdatabase) ? "./devdatabase/" : "./database/");
exports.defaultOptionsDatabase = new index_1.api.ODFormattedJsonDatabase("opendiscord:options", "options.json", defaultOptionFormatter, (isDevdatabase) ? "./devdatabase/" : "./database/");
