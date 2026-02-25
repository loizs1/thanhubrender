import { ODManager, ODManagerData, ODValidId } from "./base";
import { ODDebugger } from "./console";
/**## ODProgressBarRendererManager `class`
 * This is an Open Ticket progress bar renderer manager.
 *
 * It is responsible for managing all console progress bar renderers in Open Ticket.
 *
 * A renderer is a function which will try to visualize the progress bar in the console.
 */
export declare class ODProgressBarRendererManager extends ODManager<ODProgressBarRenderer<{}>> {
    constructor(debug: ODDebugger);
}
/**## ODProgressBarManager `class`
 * This is an Open Ticket progress bar manager.
 *
 * It is responsible for managing all console progress bars in Open Ticket. An example of this is the slash command registration progress bar.
 *
 * There are many types of progress bars available, but you can also create your own!
 */
export declare class ODProgressBarManager extends ODManager<ODProgressBar> {
    renderers: ODProgressBarRendererManager;
    constructor(debug: ODDebugger);
}
/**## ODProgressBarRenderFunc `type`
 * This is the render function for an Open Ticket console progress bar.
 */
export type ODProgressBarRenderFunc<Settings extends {}> = (settings: Settings, min: number, max: number, value: number, prefix: string | null, suffix: string | null) => string;
/**## ODProgressBarRenderer `class`
 * This is an Open Ticket console progress bar renderer.
 *
 * It is used to render a progress bar in the console of the bot.
 *
 * There are already a lot of default options available if you just want an easy progress bar!
 */
export declare class ODProgressBarRenderer<Settings extends {}> extends ODManagerData {
    #private;
    settings: Settings;
    constructor(id: ODValidId, render: ODProgressBarRenderFunc<Settings>, settings: Settings);
    /**Render a progress bar using this renderer. */
    render(min: number, max: number, value: number, prefix: string | null, suffix: string | null): string;
    withAdditionalSettings(settings: Partial<Settings>): ODProgressBarRenderer<Settings>;
}
/**## ODProgressBar `class`
 * This is an Open Ticket console progress bar.
 *
 * It is used to create a simple or advanced progress bar in the console of the bot.
 * These progress bars are not visible in the `otdebug.txt` file and should only be used as extra visuals.
 *
 * Use other classes as existing templates or create your own progress bar from scratch using this class.
 */
export declare class ODProgressBar extends ODManagerData {
    #private;
    /**The renderer of this progress bar. */
    renderer: ODProgressBarRenderer<{}>;
    /**The current value of the progress bar. */
    protected value: number;
    /**The minimum value of the progress bar. */
    min: number;
    /**The maximum value of the progress bar. */
    max: number;
    /**The initial value of the progress bar. */
    initialValue: number;
    /**The prefix displayed in the progress bar. */
    prefix: string | null;
    /**The prefix displayed in the progress bar. */
    suffix: string | null;
    /**Enable automatic stopping when reaching `min` or `max`. */
    autoStop: null | "min" | "max";
    constructor(id: ODValidId, renderer: ODProgressBarRenderer<{}>, min: number, max: number, value: number, autoStop: null | "min" | "max", prefix: string | null, suffix: string | null);
    /**Start showing this progress bar in the console. */
    start(): boolean;
    /**Update this progress bar while active. (will automatically update the progress bar in the console) */
    protected update(value: number, stop?: boolean): boolean;
    /**Wait for the progress bar to finish. */
    finished(): Promise<void>;
}
/**## ODTimedProgressBar `class`
 * This is an Open Ticket timed console progress bar.
 *
 * It is used to create a simple timed progress bar in the console.
 * You can set a fixed duration (milliseconds) in the constructor.
 */
export declare class ODTimedProgressBar extends ODProgressBar {
    #private;
    /**The time in milliseconds. */
    time: number;
    /**The mode of the timer. */
    mode: "increasing" | "decreasing";
    constructor(id: ODValidId, renderer: ODProgressBarRenderer<{}>, time: number, mode: "increasing" | "decreasing", prefix: string | null, suffix: string | null);
    start(): boolean;
}
/**## ODManualProgressBar `class`
 * This is an Open Ticket manual console progress bar.
 *
 * It is used to create a simple manual progress bar in the console.
 * You can update the progress manually using `update()`.
 */
export declare class ODManualProgressBar extends ODProgressBar {
    constructor(id: ODValidId, renderer: ODProgressBarRenderer<{}>, amount: number, autoStop: null | "min" | "max", prefix: string | null, suffix: string | null);
    /**Set the value of the progress bar. */
    set(value: number, stop?: boolean): void;
    /**Get the current value of the progress bar. */
    get(): number;
    /**Increase the value of the progress bar. */
    increase(amount: number, stop?: boolean): void;
    /**Decrease the value of the progress bar. */
    decrease(amount: number, stop?: boolean): void;
}
