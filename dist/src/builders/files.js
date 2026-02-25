"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAllFiles = void 0;
///////////////////////////////////////
//FILE BUILDERS
///////////////////////////////////////
const index_1 = require("../index");
const files = index_1.opendiscord.builders.files;
const lang = index_1.opendiscord.languages;
const transcriptConfig = index_1.opendiscord.configs.get("opendiscord:transcripts");
const registerAllFiles = async () => {
    transcriptFiles();
};
exports.registerAllFiles = registerAllFiles;
const transcriptFiles = () => {
    //TEXT TRANSCRIPT
    files.add(new index_1.api.ODFile("opendiscord:text-transcript"));
    files.get("opendiscord:text-transcript").workers.add(new index_1.api.ODWorker("opendiscord:text-transcript", 0, async (instance, params, source) => {
        const { guild, channel, user, ticket, compiler, result } = params;
        const fileMode = transcriptConfig.data.textTranscriptStyle.fileMode;
        const customName = transcriptConfig.data.textTranscriptStyle.customFileName;
        const creatorId = ticket.get("opendiscord:opened-by").value ?? "unknown-creator-id";
        const creator = (await index_1.opendiscord.tickets.getTicketUser(ticket, "creator"));
        if (fileMode == "custom")
            instance.setName(customName.split(".")[0] + ".txt");
        else if (fileMode == "user-id")
            instance.setName(creatorId + ".txt");
        else if (fileMode == "user-name")
            instance.setName((creator ? creator.username : "unknown-creator-name") + ".txt");
        else if (fileMode == "channel-id")
            instance.setName(channel.id + ".txt");
        else if (fileMode == "channel-name")
            instance.setName(channel.name + ".txt");
        else
            instance.setName("transcript.txt");
        instance.setDescription(lang.getTranslation("transcripts.success.textFileDescription"));
        if (compiler.id.value != "opendiscord:text-compiler" || !result.data || typeof result.data.contents != "string") {
            instance.setContents("<invalid-transcript-compiler>");
            return;
        }
        instance.setContents(result.data.contents);
    }));
};
