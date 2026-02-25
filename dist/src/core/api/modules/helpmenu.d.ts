import { ODId, ODManager, ODManagerData, ODValidId } from "./base";
import { ODDebugger } from "./console";
/**## ODHelpMenuComponentRenderer `type`
 * This is the callback of the help menu component renderer. It also contains information about how & where it is rendered.
 */
export type ODHelpMenuComponentRenderer = (page: number, category: number, location: number, mode: "slash" | "text") => string | Promise<string>;
/**## ODHelpMenuComponent `class`
 * This is an Open Ticket help menu component.
 *
 * It can render something on the Open Ticket help menu.
 */
export declare class ODHelpMenuComponent extends ODManagerData {
    /**The priority of this component. The higher, the earlier it will appear in the help menu. */
    priority: number;
    /**The render function for this component. */
    render: ODHelpMenuComponentRenderer;
    constructor(id: ODValidId, priority: number, render: ODHelpMenuComponentRenderer);
}
/**## ODHelpMenuTextComponent `class`
 * This is an Open Ticket help menu text component.
 *
 * It can render a static piece of text on the Open Ticket help menu.
 */
export declare class ODHelpMenuTextComponent extends ODHelpMenuComponent {
    constructor(id: ODValidId, priority: number, text: string);
}
/**## ODHelpMenuCommandComponentOption `interface`
 * This interface contains a command option for the `ODHelpMenuCommandComponent`.
 */
export interface ODHelpMenuCommandComponentOption {
    /**The name of this option. */
    name: string;
    /**Is this option optional? */
    optional: boolean;
}
/**## ODHelpMenuCommandComponentSettings `interface`
 * This interface contains the settings for the `ODHelpMenuCommandComponent`.
 */
export interface ODHelpMenuCommandComponentSettings {
    /**The name of this text command. */
    textName?: string;
    /**The name of this slash command. */
    slashName?: string;
    /**Options available in the text command. */
    textOptions?: ODHelpMenuCommandComponentOption[];
    /**Options available in the slash command. */
    slashOptions?: ODHelpMenuCommandComponentOption[];
    /**The description for the text command. */
    textDescription?: string;
    /**The description for the slash command. */
    slashDescription?: string;
}
/**## ODHelpMenuCommandComponent `class`
 * This is an Open Ticket help menu command component.
 *
 * It contains a useful helper to render a command in the Open Ticket help menu.
 */
export declare class ODHelpMenuCommandComponent extends ODHelpMenuComponent {
    #private;
    constructor(id: ODValidId, priority: number, settings: ODHelpMenuCommandComponentSettings);
}
/**## ODHelpMenuCategory `class`
 * This is an Open Ticket help menu category.
 *
 * Every category in the help menu is an embed field by default.
 * Try to limit the amount of components per category.
 */
export declare class ODHelpMenuCategory extends ODManager<ODHelpMenuComponent> {
    /**The id of this category. */
    id: ODId;
    /**The priority of this category. The higher, the earlier it will appear in the menu. */
    priority: number;
    /**The name of this category. (can include emoji's) */
    name: string;
    /**When enabled, it automatically starts this category on a new page. */
    newPage: boolean;
    constructor(id: ODValidId, priority: number, name: string, newPage?: boolean);
    /**Render this category and it's components. */
    render(page: number, category: number, mode: "slash" | "text"): Promise<string>;
}
/**## ODHelpMenuRenderResult `type`
 * This is the array returned when the help menu has been rendered successfully.
 *
 * It contains a list of pages, which contain categories by name & value (content).
 */
export type ODHelpMenuRenderResult = {
    name: string;
    value: string;
}[][];
/**## ODHelpMenuManager `class`
 * This is an Open Ticket help menu manager.
 *
 * It is responsible for rendering the entire help menu content.
 * You are also able to configure the amount of categories per page here.
 *
 * Fewer Categories == More Clean Menu
 */
export declare class ODHelpMenuManager extends ODManager<ODHelpMenuCategory> {
    #private;
    /**The amount of categories per-page. */
    categoriesPerPage: number;
    constructor(debug: ODDebugger);
    add(data: ODHelpMenuCategory, overwrite?: boolean): boolean;
    /**Render this entire help menu & return a `ODHelpMenuRenderResult`. */
    render(mode: "slash" | "text"): Promise<ODHelpMenuRenderResult>;
}
