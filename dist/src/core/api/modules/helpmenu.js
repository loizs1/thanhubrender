"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODHelpMenuManager = exports.ODHelpMenuCategory = exports.ODHelpMenuCommandComponent = exports.ODHelpMenuTextComponent = exports.ODHelpMenuComponent = void 0;
///////////////////////////////////////
//HELP MODULE
///////////////////////////////////////
const base_1 = require("./base");
/**## ODHelpMenuComponent `class`
 * This is an Open Ticket help menu component.
 *
 * It can render something on the Open Ticket help menu.
 */
class ODHelpMenuComponent extends base_1.ODManagerData {
    /**The priority of this component. The higher, the earlier it will appear in the help menu. */
    priority;
    /**The render function for this component. */
    render;
    constructor(id, priority, render) {
        super(id);
        this.priority = priority;
        this.render = render;
    }
}
exports.ODHelpMenuComponent = ODHelpMenuComponent;
/**## ODHelpMenuTextComponent `class`
 * This is an Open Ticket help menu text component.
 *
 * It can render a static piece of text on the Open Ticket help menu.
 */
class ODHelpMenuTextComponent extends ODHelpMenuComponent {
    constructor(id, priority, text) {
        super(id, priority, () => {
            return text;
        });
    }
}
exports.ODHelpMenuTextComponent = ODHelpMenuTextComponent;
/**## ODHelpMenuCommandComponent `class`
 * This is an Open Ticket help menu command component.
 *
 * It contains a useful helper to render a command in the Open Ticket help menu.
 */
class ODHelpMenuCommandComponent extends ODHelpMenuComponent {
    constructor(id, priority, settings) {
        super(id, priority, (page, category, location, mode) => {
            if (mode == "slash" && settings.slashName) {
                return `\`${settings.slashName}${(settings.slashOptions) ? this.#renderOptions(settings.slashOptions) : ""}\` ➜ ${settings.slashDescription ?? ""}`;
            }
            else if (mode == "text" && settings.textName) {
                return `\`${settings.textName}${(settings.textOptions) ? this.#renderOptions(settings.textOptions) : ""}\` ➜ ${settings.textDescription ?? ""}`;
            }
            else
                return "";
        });
    }
    /**Utility function to render all command options. */
    #renderOptions(options) {
        return " " + options.map((opt) => (opt.optional) ? `[${opt.name}]` : `<${opt.name}>`).join(" ");
    }
}
exports.ODHelpMenuCommandComponent = ODHelpMenuCommandComponent;
/**## ODHelpMenuCategory `class`
 * This is an Open Ticket help menu category.
 *
 * Every category in the help menu is an embed field by default.
 * Try to limit the amount of components per category.
 */
class ODHelpMenuCategory extends base_1.ODManager {
    /**The id of this category. */
    id;
    /**The priority of this category. The higher, the earlier it will appear in the menu. */
    priority;
    /**The name of this category. (can include emoji's) */
    name;
    /**When enabled, it automatically starts this category on a new page. */
    newPage;
    constructor(id, priority, name, newPage) {
        super();
        this.id = new base_1.ODId(id);
        this.priority = priority;
        this.name = name;
        this.newPage = newPage ?? false;
    }
    /**Render this category and it's components. */
    async render(page, category, mode) {
        //sort from high priority to low
        const derefArray = [...this.getAll()];
        derefArray.sort((a, b) => {
            return b.priority - a.priority;
        });
        const result = [];
        let i = 0;
        for (const component of derefArray) {
            try {
                result.push(await component.render(page, category, i, mode));
            }
            catch (err) {
                process.emit("uncaughtException", err);
            }
            i++;
        }
        //only return the non-empty components
        return result.filter((component) => component !== "").join("\n\n");
    }
}
exports.ODHelpMenuCategory = ODHelpMenuCategory;
/**## ODHelpMenuManager `class`
 * This is an Open Ticket help menu manager.
 *
 * It is responsible for rendering the entire help menu content.
 * You are also able to configure the amount of categories per page here.
 *
 * Fewer Categories == More Clean Menu
 */
class ODHelpMenuManager extends base_1.ODManager {
    /**Alias to Open Ticket debugger. */
    #debug;
    /**The amount of categories per-page. */
    categoriesPerPage = 3;
    constructor(debug) {
        super(debug, "help menu category");
        this.#debug = debug;
    }
    add(data, overwrite) {
        data.useDebug(this.#debug, "help menu component");
        return super.add(data, overwrite);
    }
    /**Render this entire help menu & return a `ODHelpMenuRenderResult`. */
    async render(mode) {
        //sort from high priority to low
        const derefArray = [...this.getAll()];
        derefArray.sort((a, b) => {
            return b.priority - a.priority;
        });
        const result = [];
        let currentPage = [];
        for (const category of derefArray) {
            try {
                const renderedCategory = await category.render(result.length, currentPage.length, mode);
                if (renderedCategory !== "") {
                    //create new page when category wants to
                    if (currentPage.length > 0 && category.newPage) {
                        result.push(currentPage);
                        currentPage = [];
                    }
                    currentPage.push({
                        name: category.name,
                        value: renderedCategory
                    });
                    //create new page when page is full
                    if (currentPage.length >= this.categoriesPerPage) {
                        result.push(currentPage);
                        currentPage = [];
                    }
                }
            }
            catch (err) {
                process.emit("uncaughtException", err);
            }
        }
        //push current page when not-empty
        if (currentPage.length > 0)
            result.push(currentPage);
        return result;
    }
}
exports.ODHelpMenuManager = ODHelpMenuManager;
