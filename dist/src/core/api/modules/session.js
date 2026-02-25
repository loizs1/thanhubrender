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
exports.ODSession = exports.ODSessionManager = void 0;
///////////////////////////////////////
//SESSION MODULE
///////////////////////////////////////
const base_1 = require("./base");
const crypto = __importStar(require("crypto"));
/**## ODSessionManager `class`
 * This is an Open Ticket session manager.
 *
 * It contains all sessions in Open Ticket. Sessions are a sort of temporary storage which will be cleared when the bot stops.
 * Data in sessions have a randomly generated key which will always be unique.
 *
 * Visit the `ODSession` class for more info
 */
class ODSessionManager extends base_1.ODManager {
    constructor(debug) {
        super(debug, "session");
    }
}
exports.ODSessionManager = ODSessionManager;
/**## ODSession `class`
 * This is an Open Ticket session.
 *
 * It can be used to create 100% unique id's for usage in the bot. An id can also store additional data which isn't saved to the filesystem.
 * You can almost compare it to the PHP session system.
 */
class ODSession extends base_1.ODManagerData {
    /**The history of previously generated instance ids. Used to reduce the risk of generating the same id twice. */
    #idHistory = [];
    /**The max length of the instance id history. */
    #maxIdHistoryLength = 500;
    /**An array of all the currently active session instances. */
    sessions = [];
    /**The default amount of minutes before a session automatically stops. */
    timeoutMinutes = 30;
    /**The id of the auto-timeout session checker interval */
    #intervalId;
    /**Listeners for when a session times-out. */
    #timeoutListeners = [];
    constructor(id, intervalSeconds) {
        super(id);
        //create the auto-timeout session checker
        this.#intervalId = setInterval(() => {
            const deletableSessions = [];
            //collect all deletable sessions
            this.sessions.forEach((session) => {
                if (session.timeout && (new Date().getTime() - session.creation) > session.timeout * 60000) {
                    //stop session => custom timeout
                    deletableSessions.push({ instance: session, reason: "custom" });
                }
                else if (!session.timeout && (new Date().getTime() - session.creation) > this.timeoutMinutes * 60000) {
                    //stop session => default timeout
                    deletableSessions.push({ instance: session, reason: "default" });
                }
            });
            //permanently delete sessions
            deletableSessions.forEach((session) => {
                const index = this.sessions.findIndex((s) => s.id === session.instance.id);
                this.sessions.splice(index, 1);
                //emit timeout listeners
                this.#timeoutListeners.forEach((cb) => cb(session.instance.id, session.reason, session.instance.data, new Date(session.instance.creation)));
            });
        }, ((intervalSeconds) ? (intervalSeconds * 1000) : 60000));
    }
    /**Create a unique hex id of 8 characters and add it to the instance id history */
    #createUniqueId() {
        const hex = crypto.randomBytes(4).toString("hex");
        if (this.#idHistory.includes(hex)) {
            return this.#createUniqueId();
        }
        else {
            this.#idHistory.push(hex);
            if (this.#idHistory.length > this.#maxIdHistoryLength)
                this.#idHistory.shift();
            return hex;
        }
    }
    /**Stop the global interval that automatically deletes timed-out sessions. (This action can't be reverted!) */
    stopAutoTimeout() {
        clearInterval(this.#intervalId);
    }
    /**Start a session instance with data. Returns the unique id required to access the session. */
    start(data) {
        const id = this.#createUniqueId();
        this.sessions.push({
            id, data,
            creation: new Date().getTime(),
            timeout: null
        });
        return id;
    }
    /**Get the data of a session instance. Returns `null` when not found. */
    data(id) {
        const session = this.sessions.find((session) => session.id === id);
        if (!session)
            return null;
        return session.data;
    }
    /**Stop & delete a session instance. Returns `true` when sucessful. */
    stop(id) {
        const index = this.sessions.findIndex((session) => session.id === id);
        if (index < 0)
            return false;
        this.sessions.splice(index, 1);
        return true;
    }
    /**Update the data of a session instance. Returns `true` when sucessful. */
    update(id, data) {
        const session = this.sessions.find((session) => session.id === id);
        if (!session)
            return false;
        session.data = data;
        return true;
    }
    /**Change the global or session timeout minutes. Returns `true` when sucessful. */
    setTimeout(min, id) {
        if (!id) {
            //change global timeout minutes
            this.timeoutMinutes = min;
            return true;
        }
        else {
            //change session instance timeout minutes
            const session = this.sessions.find((session) => session.id === id);
            if (!session)
                return false;
            session.timeout = min;
            return true;
        }
    }
    /**Listen for a session timeout (default or custom) */
    onTimeout(callback) {
        this.#timeoutListeners.push(callback);
    }
}
exports.ODSession = ODSession;
