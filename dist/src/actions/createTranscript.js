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
exports.registerActions = void 0;
///////////////////////////////////////
//TRANSCRIPT CREATION SYSTEM
///////////////////////////////////////
const index_1 = require("../index");
const discord = __importStar(require("discord.js"));
const transcriptConfig = index_1.opendiscord.configs.get("opendiscord:transcripts");
const registerActions = async () => {
    index_1.opendiscord.actions.add(new index_1.api.ODAction("opendiscord:create-transcript"));
    index_1.opendiscord.actions.get("opendiscord:create-transcript").workers.add([
        new index_1.api.ODWorker("opendiscord:select-compiler", 4, async (instance, params, source, cancel) => {
            const { channel, user, ticket } = params;
            if (channel.type != discord.ChannelType.GuildText)
                return cancel();
            if (!transcriptConfig.data.general.enabled)
                return cancel();
            await index_1.opendiscord.events.get("onTranscriptCreate").emit([index_1.opendiscord.transcripts, ticket, channel, user]);
            instance.errorReason = null;
            const participants = await index_1.opendiscord.tickets.getAllTicketParticipants(params.ticket);
            if (!participants) {
                instance.pendingMessage = null;
                instance.errorReason = "Unable to fetch ticket channel participants!";
                throw new index_1.api.ODSystemError("ODAction(ot:create-transcript) => Unable to fetch ticket channel participants!");
            }
            instance.participants = participants;
            //select transcript compiler
            if (transcriptConfig.data.general.mode == "text")
                instance.compiler = index_1.opendiscord.transcripts.get("opendiscord:text-compiler");
            else if (transcriptConfig.data.general.mode == "html")
                instance.compiler = index_1.opendiscord.transcripts.get("opendiscord:html-compiler");
        }),
        new index_1.api.ODWorker("opendiscord:init-transcript", 3, async (instance, params, source, cancel) => {
            const { channel, user, ticket } = params;
            if (channel.type != discord.ChannelType.GuildText)
                return cancel();
            if (!transcriptConfig.data.general.enabled)
                return cancel();
            //run transcript compiler init()
            await index_1.opendiscord.events.get("onTranscriptInit").emit([index_1.opendiscord.transcripts, ticket, channel, user]);
            if (instance.compiler.init) {
                try {
                    instance.initData = null;
                    const result = await instance.compiler.init(ticket, channel, user);
                    instance.initData = result.initData;
                    if (result.success && result.pendingMessage && transcriptConfig.data.general.enableChannel) {
                        //send init message to channel
                        const post = index_1.opendiscord.posts.get("opendiscord:transcripts");
                        if (post) {
                            instance.pendingMessage = await post.send(result.pendingMessage);
                        }
                    }
                    else if (!result.success) {
                        instance.pendingMessage = null;
                        instance.errorReason = result.errorReason;
                        throw new index_1.api.ODSystemError("ODAction(ot:create-transcript) => Known Init Error => " + result.errorReason);
                    }
                    else {
                        instance.pendingMessage = null;
                    }
                }
                catch (err) {
                    instance.success = false;
                    cancel();
                    process.emit("uncaughtException", err);
                    throw new index_1.api.ODSystemError("ODAction(ot:create-transcript) => Failed transcript compiler init()! (see error above)");
                }
            }
            await index_1.opendiscord.events.get("afterTranscriptInitiated").emit([index_1.opendiscord.transcripts, ticket, channel, user]);
        }),
        new index_1.api.ODWorker("opendiscord:compile-transcript", 2, async (instance, params, source, cancel) => {
            const { channel, user, ticket } = params;
            if (channel.type != discord.ChannelType.GuildText)
                return cancel();
            if (!instance.compiler) {
                instance.success = false;
                cancel();
                throw new index_1.api.ODSystemError("ODAction(ot:create-transcript):ODWorker(ot:compile-transcript) => Instance is missing transcript compiler!");
            }
            //run transcript compiler compile()
            await index_1.opendiscord.events.get("onTranscriptCompile").emit([index_1.opendiscord.transcripts, ticket, channel, user]);
            if (instance.compiler.compile) {
                try {
                    const result = await instance.compiler.compile(ticket, channel, user, instance.initData);
                    if (!result.success) {
                        instance.errorReason = result.errorReason;
                        throw new index_1.api.ODSystemError("ODAction(ot:create-transcript) => Known Compiler Error => " + result.errorReason);
                    }
                    else {
                        instance.result = result;
                        instance.success = true;
                    }
                }
                catch (err) {
                    instance.success = false;
                    cancel();
                    process.emit("uncaughtException", err);
                    throw new index_1.api.ODSystemError("ODAction(ot:create-transcript) => Failed transcript compiler compile()! (see error above)");
                }
            }
            await index_1.opendiscord.events.get("afterTranscriptCompiled").emit([index_1.opendiscord.transcripts, ticket, channel, user]);
        }),
        new index_1.api.ODWorker("opendiscord:ready-transcript", 1, async (instance, params, source, cancel) => {
            if (!instance.result) {
                instance.success = false;
                cancel();
                throw new index_1.api.ODSystemError("ODAction(ot:create-transcript):ODWorker(ot:ready-transcript) => Instance is missing transcript result!");
            }
            //run transcript compiler ready()
            index_1.utilities.runAsync(async () => {
                await index_1.opendiscord.events.get("onTranscriptReady").emit([index_1.opendiscord.transcripts, instance.result.ticket, instance.result.channel, instance.result.user]);
                if (instance.compiler.ready) {
                    try {
                        const { channelMessage, creatorDmMessage, participantDmMessage, activeAdminDmMessage, everyAdminDmMessage } = await instance.compiler.ready(instance.result);
                        //send channel message
                        if (transcriptConfig.data.general.enableChannel && channelMessage) {
                            if (instance.pendingMessage && instance.pendingMessage.message && instance.pendingMessage.success) {
                                //edit "pending" message to be the "ready" message
                                instance.pendingMessage.message.edit(channelMessage.message);
                            }
                            else {
                                //send ready message to channel
                                const post = index_1.opendiscord.posts.get("opendiscord:transcripts");
                                if (post)
                                    await post.send(channelMessage);
                            }
                        }
                        //send dm mesages
                        if (instance.participants) {
                            for (const p of instance.participants) {
                                if (p.role == "creator" && transcriptConfig.data.general.enableCreatorDM && creatorDmMessage) {
                                    //send creator dm message
                                    await index_1.opendiscord.client.sendUserDm(p.user, creatorDmMessage);
                                }
                                else if (p.role == "participant" && transcriptConfig.data.general.enableParticipantDM && participantDmMessage) {
                                    //send participant dm message
                                    await index_1.opendiscord.client.sendUserDm(p.user, participantDmMessage);
                                }
                                else if (p.role == "admin" && transcriptConfig.data.general.enableActiveAdminDM && instance.result.success && instance.result.messages && instance.result.messages.some((msg) => msg.author.id == p.user.id) && activeAdminDmMessage) {
                                    //send active admin dm message
                                    await index_1.opendiscord.client.sendUserDm(p.user, activeAdminDmMessage);
                                }
                                else if (p.role == "admin" && transcriptConfig.data.general.enableEveryAdminDM && everyAdminDmMessage) {
                                    //send every admin dm message
                                    await index_1.opendiscord.client.sendUserDm(p.user, everyAdminDmMessage);
                                }
                            }
                        }
                    }
                    catch (err) {
                        instance.success = false;
                        cancel();
                        process.emit("uncaughtException", err);
                        throw new index_1.api.ODSystemError("ODAction(ot:create-transcript) => Failed transcript compiler ready()! (see error above)");
                    }
                }
                await index_1.opendiscord.events.get("afterTranscriptReady").emit([index_1.opendiscord.transcripts, instance.result.ticket, instance.result.channel, instance.result.user]);
            });
            //update stats
            await index_1.opendiscord.stats.get("opendiscord:global").setStat("opendiscord:transcripts-created", 1, "increase");
            await index_1.opendiscord.stats.get("opendiscord:user").setStat("opendiscord:transcripts-created", params.user.id, 1, "increase");
            await index_1.opendiscord.events.get("afterTranscriptCreated").emit([index_1.opendiscord.transcripts, instance.result.ticket, instance.result.channel, instance.result.user]);
        }),
        new index_1.api.ODWorker("opendiscord:logs", 0, (instance, params, source, cancel) => {
            const { user, channel, ticket } = params;
            index_1.opendiscord.log(user.displayName + " created a transcript!", "info", [
                { key: "user", value: user.username },
                { key: "userid", value: user.id, hidden: true },
                { key: "channel", value: "#" + channel.name },
                { key: "channelid", value: channel.id, hidden: true },
                { key: "option", value: ticket.option.id.value },
                { key: "method", value: source, hidden: true },
                { key: "compiler", value: instance.compiler.id.value },
            ]);
        })
    ]);
};
exports.registerActions = registerActions;
