"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAllLiveStatusSources = void 0;
const index_1 = require("../../index");
const loadAllLiveStatusSources = async () => {
    //DEFAULT DJDJ DEV
    index_1.opendiscord.livestatus.add(new index_1.api.ODLiveStatusUrlSource("opendiscord:default-djdj-dev", "https://raw.githubusercontent.com/open-discord-bots/open-ticket/refs/heads/dev/src/livestatus.json"));
};
exports.loadAllLiveStatusSources = loadAllLiveStatusSources;
