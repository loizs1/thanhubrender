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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.utilities = exports.ODVersionMigration = exports.opendiscord = exports.api = void 0;
const fs = __importStar(require("fs"));
let tempErrors = [];
const tempError = () => {
    if (tempErrors.length > 0) {
        console.log("\n\n==============================\n[OPEN TICKET ERROR]: " + tempErrors.join("\n[OPEN TICKET ERROR]: ") + "\n==============================\n\n");
        process.exit(1);
    }
    tempErrors = [];
};
const nodev = process.versions.node.split(".");
if (Number(nodev[0]) < 18) {
    tempErrors.push("Invalid node.js version. Open Ticket requires node.js v18 or above!");
}
tempError();
const moduleInstalled = (id, throwError) => {
    try {
        require.resolve(id);
        return true;
    }
    catch {
        if (throwError)
            tempErrors.push("npm module \"" + id + "\" is not installed! Install it via 'npm install " + id + "'");
        return false;
    }
};
moduleInstalled("@discordjs/rest", true);
moduleInstalled("discord.js", true);
moduleInstalled("ansis", true);
moduleInstalled("formatted-json-stringify", true);
moduleInstalled("typescript", true);
moduleInstalled("terminal-kit", true);
tempError();
//init API
const api = __importStar(require("../api/api")); //import for local use
exports.api = __importStar(require("../api/api")); //export to other parts of bot
const ansis_1 = __importDefault(require("ansis")); //import ansis for usage in initialization
exports.opendiscord = new api.ODMain();
console.log("\n--------------------------- OPEN TICKET STARTUP ---------------------------");
exports.opendiscord.log("Logging system activated!", "system");
exports.opendiscord.debug.debug("Using Node.js " + process.version + "!");
try {
    const packageJson = JSON.parse(fs.readFileSync("./package.json").toString());
    exports.opendiscord.debug.debug("Using discord.js " + packageJson.dependencies["discord.js"] + "!");
    exports.opendiscord.debug.debug("Using @discordjs/rest " + packageJson.dependencies["@discordjs/rest"] + "!");
    exports.opendiscord.debug.debug("Using ansis " + packageJson.dependencies["ansis"] + "!");
    exports.opendiscord.debug.debug("Using formatted-json-stringify " + packageJson.dependencies["formatted-json-stringify"] + "!");
    exports.opendiscord.debug.debug("Using terminal-kit " + packageJson.dependencies["terminal-kit"] + "!");
    exports.opendiscord.debug.debug("Using typescript " + packageJson.dependencies["typescript"] + "!");
}
catch {
    exports.opendiscord.debug.debug("Failed to fetch module versions!");
}
const timer = (ms) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
};
/**## ODVersionMigration `utility class`
 * This class is used to manage data migration between Open Ticket versions.
 *
 * It shouldn't be used by plugins because this is an internal API feature!
 */
class ODVersionMigration {
    /**The version to migrate data to */
    version;
    /**The migration function */
    #func;
    /**The migration function */
    #afterInitFunc;
    constructor(version, func, afterInitFunc) {
        this.version = version;
        this.#func = func;
        this.#afterInitFunc = afterInitFunc;
    }
    /**Run this version migration as a plugin. Returns `false` when something goes wrong. */
    async migrate() {
        try {
            await this.#func();
            return true;
        }
        catch (err) {
            process.emit("uncaughtException", err);
            return false;
        }
    }
    /**Run this version migration as a plugin (after other plugins have loaded). Returns `false` when something goes wrong. */
    async migrateAfterInit() {
        try {
            await this.#afterInitFunc();
            return true;
        }
        catch (err) {
            process.emit("uncaughtException", err);
            return false;
        }
    }
}
exports.ODVersionMigration = ODVersionMigration;
exports.utilities = {
    project: "openticket",
    isBeta: false,
    moduleInstalled: (id) => {
        return moduleInstalled(id, false);
    },
    timer,
    emojiTitle(emoji, text) {
        const style = exports.opendiscord.defaults.getDefault("emojiTitleStyle");
        const divider = exports.opendiscord.defaults.getDefault("emojiTitleDivider");
        if (style == "disabled")
            return text;
        else if (style == "before")
            return emoji + divider + text;
        else if (style == "after")
            return text + divider + emoji;
        else if (style == "double")
            return emoji + divider + text + divider + emoji;
        else
            return text;
    },
    runAsync(func) {
        func();
    },
    timedAwait(promise, timeout, onError) {
        let allowResolve = true;
        return new Promise(async (resolve, reject) => {
            //set timeout & stop if it is before the promise resolved
            setTimeout(() => {
                allowResolve = false;
                reject("utilities.timedAwait() => Promise Timeout");
            }, timeout);
            //get promise result & return if not already rejected
            try {
                const res = await promise;
                if (allowResolve)
                    resolve(res);
            }
            catch (err) {
                onError(err);
            }
            return promise;
        });
    },
    dateString(date) {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    },
    async asyncReplace(text, regex, func) {
        const promises = [];
        text.replace(regex, (match, ...args) => {
            promises.push(func(match, ...args));
            return match;
        });
        const data = await Promise.all(promises);
        const result = text.replace(regex, (match) => {
            const replaceResult = data.shift();
            return replaceResult ?? match;
        });
        return result;
    },
    getLongestLength(texts) {
        return Math.max(...texts.map((t) => ansis_1.default.strip(t).length));
    },
    easterEggs: {
        /* THANK YOU TO ALL OUR CONTRIBUTORS!!! */
        creator: "779742674932072469", //DJj123dj
        translators: [
            "779742674932072469", //DJj123dj
            "574172558006681601", //Sanke
            "540639725300613136", //Guillee.3
            "547231585368539136", //Mods HD
            "664934139954331649", //SpyEye
            "498055992962187264", //Redactado
            "912052735950618705", //T0miiis
            "366673202610569227", //johusens
            "360780292853858306", //David.3
            "950611418389024809", //Sarcastic
            "461603955517161473", //Maurizo
            "465111430274875402", //The_Gamer
            "586376952470831104", //Erxg
            "226695254433202176", //Mkevas
            "437695615095275520", //NoOneNook
            "530047191222583307", //Anderskiy
            "719072181631320145", //ToStam
            "1172870906377408512", //Stragar
            "1084794575945744445", //Sasanwm
            "449613814049275905", //Benzorich
            "905373133085741146", //Ronalds
            "918504977369018408", //Palestinian
            "807970841035145216", //Kornel0706
            "1198883915826475080", //Nova
            "669988226819162133", //Danoglez
            "1313597620996018271", //Fraden1
            "547809968145956884", //TsgIndrius
            "264120132660363267", //Quiradon
            "1272034143777329215", //NotMega
            "LOREMIPSUM", //TODO
        ]
    },
    ODVersionMigration,
    ordinalNumber(num) {
        const i = Math.abs(Math.round(num));
        const cent = i % 100;
        if (cent >= 10 && cent <= 20)
            return i + 'th';
        const dec = i % 10;
        if (dec === 1)
            return i + 'st';
        if (dec === 2)
            return i + 'nd';
        if (dec === 3)
            return i + 'rd';
        return i + 'th';
    },
    trimEmojis(text) {
        return text.replace(/(\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?)*)/gu, "");
    },
};
