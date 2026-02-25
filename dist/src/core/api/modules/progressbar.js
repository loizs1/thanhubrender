"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODManualProgressBar = exports.ODTimedProgressBar = exports.ODProgressBar = exports.ODProgressBarRenderer = exports.ODProgressBarManager = exports.ODProgressBarRendererManager = void 0;
///////////////////////////////////////
//PROGRESS BAR MODULE
///////////////////////////////////////
const base_1 = require("./base");
const readline_1 = __importDefault(require("readline"));
/**## ODProgressBarRendererManager `class`
 * This is an Open Ticket progress bar renderer manager.
 *
 * It is responsible for managing all console progress bar renderers in Open Ticket.
 *
 * A renderer is a function which will try to visualize the progress bar in the console.
 */
class ODProgressBarRendererManager extends base_1.ODManager {
    constructor(debug) {
        super(debug, "progress bar renderer");
    }
}
exports.ODProgressBarRendererManager = ODProgressBarRendererManager;
/**## ODProgressBarManager `class`
 * This is an Open Ticket progress bar manager.
 *
 * It is responsible for managing all console progress bars in Open Ticket. An example of this is the slash command registration progress bar.
 *
 * There are many types of progress bars available, but you can also create your own!
 */
class ODProgressBarManager extends base_1.ODManager {
    renderers;
    constructor(debug) {
        super(debug, "progress bar");
        this.renderers = new ODProgressBarRendererManager(debug);
    }
}
exports.ODProgressBarManager = ODProgressBarManager;
/**## ODProgressBarRenderer `class`
 * This is an Open Ticket console progress bar renderer.
 *
 * It is used to render a progress bar in the console of the bot.
 *
 * There are already a lot of default options available if you just want an easy progress bar!
 */
class ODProgressBarRenderer extends base_1.ODManagerData {
    settings;
    #render;
    constructor(id, render, settings) {
        super(id);
        this.#render = render;
        this.settings = settings;
    }
    /**Render a progress bar using this renderer. */
    render(min, max, value, prefix, suffix) {
        try {
            return this.#render(this.settings, min, max, value, prefix, suffix);
        }
        catch (err) {
            process.emit("uncaughtException", err);
            return "<PROGRESS-BAR-ERROR>";
        }
    }
    withAdditionalSettings(settings) {
        const newSettings = { ...this.settings };
        for (const key of Object.keys(settings)) {
            if (typeof settings[key] != "undefined")
                newSettings[key] = settings[key];
        }
        return new ODProgressBarRenderer(this.id, this.#render, newSettings);
    }
}
exports.ODProgressBarRenderer = ODProgressBarRenderer;
/**## ODProgressBar `class`
 * This is an Open Ticket console progress bar.
 *
 * It is used to create a simple or advanced progress bar in the console of the bot.
 * These progress bars are not visible in the `otdebug.txt` file and should only be used as extra visuals.
 *
 * Use other classes as existing templates or create your own progress bar from scratch using this class.
 */
class ODProgressBar extends base_1.ODManagerData {
    /**The renderer of this progress bar. */
    renderer;
    /**Is this progress bar currently active? */
    #active = false;
    /**A list of listeners when the progress bar stops. */
    #stopListeners = [];
    /**The current value of the progress bar. */
    value;
    /**The minimum value of the progress bar. */
    min;
    /**The maximum value of the progress bar. */
    max;
    /**The initial value of the progress bar. */
    initialValue;
    /**The prefix displayed in the progress bar. */
    prefix;
    /**The prefix displayed in the progress bar. */
    suffix;
    /**Enable automatic stopping when reaching `min` or `max`. */
    autoStop;
    constructor(id, renderer, min, max, value, autoStop, prefix, suffix) {
        super(id);
        this.renderer = renderer;
        this.min = min;
        this.max = max;
        this.initialValue = this.#parseValue(value);
        this.value = this.#parseValue(value);
        this.autoStop = autoStop;
        this.prefix = prefix;
        this.suffix = suffix;
    }
    /**Parse a value in such a way that it doesn't go below/above the min/max limits. */
    #parseValue(value) {
        if (value > this.max)
            return this.max;
        else if (value < this.min)
            return this.min;
        else
            return value;
    }
    /**Render progress bar to the console. */
    #renderStdout() {
        if (!this.#active)
            return;
        readline_1.default.clearLine(process.stdout, 0);
        readline_1.default.cursorTo(process.stdout, 0);
        process.stdout.write(this.renderer.render(this.min, this.max, this.value, this.prefix, this.suffix));
    }
    /**Start showing this progress bar in the console. */
    start() {
        if (this.#active)
            return false;
        this.value = this.#parseValue(this.initialValue);
        this.#active = true;
        this.#renderStdout();
        return true;
    }
    /**Update this progress bar while active. (will automatically update the progress bar in the console) */
    update(value, stop) {
        if (!this.#active)
            return false;
        this.value = this.#parseValue(value);
        this.#renderStdout();
        if (stop || (this.autoStop == "max" && this.value == this.max) || (this.autoStop == "min" && this.value == this.min)) {
            process.stdout.write("\n");
            this.#active = false;
            this.#stopListeners.forEach((cb) => cb());
            this.#stopListeners = [];
        }
        return true;
    }
    /**Wait for the progress bar to finish. */
    finished() {
        return new Promise((resolve) => {
            this.#stopListeners.push(resolve);
        });
    }
}
exports.ODProgressBar = ODProgressBar;
/**## ODTimedProgressBar `class`
 * This is an Open Ticket timed console progress bar.
 *
 * It is used to create a simple timed progress bar in the console.
 * You can set a fixed duration (milliseconds) in the constructor.
 */
class ODTimedProgressBar extends ODProgressBar {
    /**The time in milliseconds. */
    time;
    /**The mode of the timer. */
    mode;
    constructor(id, renderer, time, mode, prefix, suffix) {
        super(id, renderer, 0, time, 0, (mode == "increasing") ? "max" : "min", prefix, suffix);
        this.time = time;
        this.mode = mode;
    }
    /**The timer which is used. */
    async #timer(ms) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }
    /**Run the timed progress bar. */
    async #execute() {
        let i = 0;
        const fragment = this.time / 100;
        while (i < 100) {
            await this.#timer(fragment);
            i++;
            super.update((this.mode == "increasing") ? (i * fragment) : this.time - (i * fragment));
        }
    }
    start() {
        const res = super.start();
        if (!res)
            return false;
        this.#execute();
        return true;
    }
}
exports.ODTimedProgressBar = ODTimedProgressBar;
/**## ODManualProgressBar `class`
 * This is an Open Ticket manual console progress bar.
 *
 * It is used to create a simple manual progress bar in the console.
 * You can update the progress manually using `update()`.
 */
class ODManualProgressBar extends ODProgressBar {
    constructor(id, renderer, amount, autoStop, prefix, suffix) {
        super(id, renderer, 0, amount, 0, autoStop, prefix, suffix);
    }
    /**Set the value of the progress bar. */
    set(value, stop) {
        super.update(value, stop);
    }
    /**Get the current value of the progress bar. */
    get() {
        return this.value;
    }
    /**Increase the value of the progress bar. */
    increase(amount, stop) {
        super.update(this.value + amount, stop);
    }
    /**Decrease the value of the progress bar. */
    decrease(amount, stop) {
        super.update(this.value - amount, stop);
    }
}
exports.ODManualProgressBar = ODManualProgressBar;
