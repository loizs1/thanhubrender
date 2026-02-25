"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAllPosts = void 0;
const index_1 = require("../../index");
const loadAllPosts = async () => {
    const generalConfig = index_1.opendiscord.configs.get("opendiscord:general");
    if (!generalConfig)
        return;
    const transcriptConfig = index_1.opendiscord.configs.get("opendiscord:transcripts");
    if (!transcriptConfig)
        return;
    //LOGS CHANNEL
    if (generalConfig.data.system.logs.enabled)
        index_1.opendiscord.posts.add(new index_1.api.ODPost("opendiscord:logs", generalConfig.data.system.logs.channel));
    //TRANSCRIPTS CHANNEL
    if (transcriptConfig.data.general.enabled && transcriptConfig.data.general.enableChannel)
        index_1.opendiscord.posts.add(new index_1.api.ODPost("opendiscord:transcripts", transcriptConfig.data.general.channel));
};
exports.loadAllPosts = loadAllPosts;
