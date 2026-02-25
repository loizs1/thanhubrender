"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODVerifyBarManager = exports.ODVerifyBar = void 0;
///////////////////////////////////////
//VERIFYBAR MODULE
///////////////////////////////////////
const base_1 = require("./base");
const worker_1 = require("./worker");
/**## ODVerifyBar `class`
 * This is an Open Ticket verifybar.
 *
 * It is contains 2 sets of workers and a lot of utilities for the (✅ ❌) verifybars in the bot.
 *
 * It doesn't contain the code which activates or spawns the verifybars!
 */
class ODVerifyBar extends base_1.ODManagerData {
    /**All workers that will run when the verifybar is accepted. */
    success;
    /**All workers that will run when the verifybar is stopped. */
    failure;
    /**The message that will be built wen activating this verifybar. */
    message;
    /**When disabled, it will skip the verifybar and instantly fire the `success` workers. */
    enabled;
    constructor(id, message, enabled) {
        super(id);
        this.success = new worker_1.ODWorkerManager("descending");
        this.failure = new worker_1.ODWorkerManager("descending");
        this.message = message;
        this.enabled = enabled ?? true;
    }
    /**Build the message and reply to a button with this verifybar. */
    async activate(responder) {
        if (this.enabled) {
            //show verifybar
            const { guild, channel, user, message } = responder;
            await responder.update(await this.message.build("verifybar", { guild, channel, user, verifybar: this, originalMessage: message }));
        }
        else {
            //instant success
            if (this.success)
                await this.success.executeWorkers(responder, "verifybar", { data: null, verifybarMessage: null });
        }
    }
}
exports.ODVerifyBar = ODVerifyBar;
/**## ODVerifyBarManager `class`
 * This is an Open Ticket verifybar manager.
 *
 * It contains all (✅ ❌) verifybars in the bot.
 * The `ODVerifyBar` classes contain `ODWorkerManager`'s that will be fired when the continue/stop buttons are pressed.
 *
 * It doesn't contain the code which activates the verifybars! This should be implemented by your own.
 */
class ODVerifyBarManager extends base_1.ODManager {
    constructor(debug) {
        super(debug, "verifybar");
    }
}
exports.ODVerifyBarManager = ODVerifyBarManager;
