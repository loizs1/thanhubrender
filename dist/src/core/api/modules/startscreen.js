"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODStartScreenLogCategoryComponent = exports.ODStartScreenLiveStatusCategoryComponent = exports.ODStartScreenPluginsCategoryComponent = exports.ODStartScreenFlagsCategoryComponent = exports.ODStartScreenPropertiesCategoryComponent = exports.ODStartScreenCategoryComponent = exports.ODStartScreenHeaderComponent = exports.ODStartScreenLogoComponent = exports.ODStartScreenComponent = exports.ODStartScreenManager = void 0;
///////////////////////////////////////
//STARTSCREEN MODULE
///////////////////////////////////////
const base_1 = require("./base");
const console_1 = require("./console");
const ansis_1 = __importDefault(require("ansis"));
/**## ODStartScreenManager `class`
 * This is an Open Ticket startscreen manager.
 *
 * This class is responsible for managing & rendering the startscreen of the bot.
 * The startscreen is the part you see when the bot has started up successfully. (e.g. the Open Ticket logo, logs, livestatus, flags, ...)
 */
class ODStartScreenManager extends base_1.ODManager {
    /**Alias to the Open Ticket debugger. */
    #debug;
    /**Alias to the livestatus manager. */
    livestatus;
    constructor(debug, livestatus) {
        super(debug, "startscreen component");
        this.#debug = debug;
        this.livestatus = livestatus;
    }
    /**Get all components in sorted order. */
    getSortedComponents(priority) {
        return this.getAll().sort((a, b) => {
            if (priority == "ascending")
                return a.priority - b.priority;
            else
                return b.priority - a.priority;
        });
    }
    /**Render all startscreen components in priority order. */
    async renderAllComponents() {
        const components = this.getSortedComponents("descending");
        let location = 0;
        for (const component of components) {
            try {
                const renderedText = await component.renderAll(location);
                console.log(renderedText);
                this.#debug.console.debugfile.writeText("[STARTSCREEN] Component: \"" + component.id + "\"\n" + ansis_1.default.strip(renderedText));
            }
            catch (e) {
                this.#debug.console.log("Unable to render \"" + component.id + "\" startscreen component!", "error");
                this.#debug.console.debugfile.writeErrorMessage(new console_1.ODError(e, "uncaughtException"));
            }
            location++;
        }
    }
}
exports.ODStartScreenManager = ODStartScreenManager;
/**## ODStartScreenComponent `class`
 * This is an Open Ticket startscreen component.
 *
 * This component can be rendered to the start screen of the bot.
 * An optional priority can be specified to choose the location of the component.
 *
 * It's recommended to use pre-built components except if you really need a custom one.
 */
class ODStartScreenComponent extends base_1.ODManagerData {
    /**The priority of this component. */
    priority;
    /**An optional render function which will be inserted before the default renderer. */
    renderBefore = null;
    /**The render function which will render the contents of this component. */
    render;
    /**An optional render function which will be inserted behind the default renderer. */
    renderAfter = null;
    constructor(id, priority, render) {
        super(id);
        this.priority = priority;
        this.render = render;
    }
    /**Render this component and combine it with the `renderBefore` & `renderAfter` contents. */
    async renderAll(location) {
        const textBefore = (this.renderBefore) ? await this.renderBefore(location) : "";
        const text = await this.render(location);
        const textAfter = (this.renderAfter) ? await this.renderAfter(location) : "";
        return (textBefore ? textBefore + "\n" : "") + text + (textAfter ? "\n" + textAfter : "");
    }
}
exports.ODStartScreenComponent = ODStartScreenComponent;
/**## ODStartScreenLogoComponent `class`
 * This is an Open Ticket startscreen logo component.
 *
 * This component will render an ASCII art logo (from an array) to the startscreen. Every property in the array is another row.
 * An optional priority can be specified to choose the location of the component.
 */
class ODStartScreenLogoComponent extends ODStartScreenComponent {
    /**The ASCII logo contents. */
    logo;
    /**When enabled, the component will add a new line above the logo. */
    topPadding;
    /**When enabled, the component will add a new line below the logo. */
    bottomPadding;
    /**The color of the logo in hex format. */
    logoHexColor;
    constructor(id, priority, logo, topPadding, bottomPadding, logoHexColor) {
        super(id, priority, () => {
            const renderedTop = (this.topPadding ? "\n" : "");
            const renderedLogo = this.logo.join("\n");
            const renderedBottom = (this.bottomPadding ? "\n" : "");
            return ansis_1.default.hex(this.logoHexColor)(renderedTop + renderedLogo + renderedBottom);
        });
        this.logo = logo;
        this.topPadding = topPadding ?? false;
        this.bottomPadding = bottomPadding ?? false;
        this.logoHexColor = logoHexColor ?? "#f8ba00";
    }
}
exports.ODStartScreenLogoComponent = ODStartScreenLogoComponent;
/**## ODStartScreenHeaderComponent `class`
 * This is an Open Ticket startscreen header component.
 *
 * This component will render a header to the startscreen. Properties can be aligned left, right or centered.
 * An optional priority can be specified to choose the location of the component.
 */
class ODStartScreenHeaderComponent extends ODStartScreenComponent {
    /**All properties of this header component. */
    properties;
    /**The spacer used between properties. */
    spacer;
    /**The alignment settings of this header component. */
    align;
    constructor(id, priority, properties, spacer, align) {
        super(id, priority, async () => {
            const renderedProperties = ansis_1.default.bold(this.properties.map((prop) => prop.key + ": " + prop.value).join(this.spacer));
            if (!this.align || this.align.align == "left") {
                return renderedProperties;
            }
            else if (this.align.align == "right") {
                const width = (typeof this.align.width == "number") ? this.align.width : (ansis_1.default.strip(await this.align.width.renderAll(0)).split("\n").map((row) => row.length).reduce((prev, curr) => {
                    if (prev < curr)
                        return curr;
                    else
                        return prev;
                }, 0));
                const offset = width - ansis_1.default.strip(renderedProperties).length;
                if (offset < 0)
                    return renderedProperties;
                else {
                    return (" ".repeat(offset) + renderedProperties);
                }
            }
            else if (this.align.align == "center") {
                const width = (typeof this.align.width == "number") ? this.align.width : (ansis_1.default.strip(await this.align.width.renderAll(0)).split("\n").map((row) => row.length).reduce((prev, curr) => {
                    if (prev < curr)
                        return curr;
                    else
                        return prev;
                }));
                const offset = Math.round((width - ansis_1.default.strip(renderedProperties).length) / 2);
                if (offset < 0)
                    return renderedProperties;
                else {
                    return (" ".repeat(offset) + renderedProperties);
                }
            }
            return renderedProperties;
        });
        this.properties = properties;
        this.spacer = spacer ?? "  -  ";
        this.align = align ?? null;
    }
}
exports.ODStartScreenHeaderComponent = ODStartScreenHeaderComponent;
/**## ODStartScreenCategoryComponent `class`
 * This is an Open Ticket startscreen category component.
 *
 * This component will render a category to the startscreen. This will only render the category name. You'll need to provide your own renderer for the contents.
 * An optional priority can be specified to choose the location of the component.
 */
class ODStartScreenCategoryComponent extends ODStartScreenComponent {
    /**The name of this category. */
    name;
    /**When enabled, this category will still be rendered when the contents are empty. (enabled by default) */
    renderIfEmpty;
    constructor(id, priority, name, render, renderIfEmpty) {
        super(id, priority, async (location) => {
            const contents = await render(location);
            if (contents != "" || this.renderIfEmpty) {
                return ansis_1.default.bold.underline("\n" + name.toUpperCase() + (contents != "" ? ":\n" : ":")) + contents;
            }
            else
                return "";
        });
        this.name = name;
        this.renderIfEmpty = renderIfEmpty ?? true;
    }
}
exports.ODStartScreenCategoryComponent = ODStartScreenCategoryComponent;
/**## ODStartScreenPropertiesCategoryComponent `class`
 * This is an Open Ticket startscreen properties category component.
 *
 * This component will render a properties category to the startscreen. This will list the properties in the category.
 * An optional priority can be specified to choose the location of the component.
 */
class ODStartScreenPropertiesCategoryComponent extends ODStartScreenCategoryComponent {
    /**The properties of this category component. */
    properties;
    /**The hex color for the key/name of all the properties. */
    propertyHexColor;
    constructor(id, priority, name, properties, propertyHexColor, renderIfEmpty) {
        super(id, priority, name, () => {
            return this.properties.map((prop) => ansis_1.default.hex(this.propertyHexColor)(prop.key + ": ") + prop.value).join("\n");
        }, renderIfEmpty);
        this.properties = properties;
        this.propertyHexColor = propertyHexColor ?? "#f8ba00";
    }
}
exports.ODStartScreenPropertiesCategoryComponent = ODStartScreenPropertiesCategoryComponent;
/**## ODStartScreenFlagsCategoryComponent `class`
 * This is an Open Ticket startscreen flags category component.
 *
 * This component will render a flags category to the startscreen. This will list the enabled flags in the category.
 * An optional priority can be specified to choose the location of the component.
 */
class ODStartScreenFlagsCategoryComponent extends ODStartScreenCategoryComponent {
    /**A list of all flags to render. */
    flags;
    constructor(id, priority, flags) {
        super(id, priority, "flags", () => {
            return this.flags.filter((flag) => (flag.value == true)).map((flag) => ansis_1.default.blue("[" + flag.name + "] " + flag.description)).join("\n");
        }, false);
        this.flags = flags;
    }
}
exports.ODStartScreenFlagsCategoryComponent = ODStartScreenFlagsCategoryComponent;
/**## ODStartScreenPluginsCategoryComponent `class`
 * This is an Open Ticket startscreen plugins category component.
 *
 * This component will render a plugins category to the startscreen. This will list the enabled, disabled & crashed plugins in the category.
 * An optional priority can be specified to choose the location of the component.
 */
class ODStartScreenPluginsCategoryComponent extends ODStartScreenCategoryComponent {
    /**A list of all plugins to render. */
    plugins;
    /**A list of all crashed plugins to render. */
    unknownCrashedPlugins;
    constructor(id, priority, plugins, unknownCrashedPlugins) {
        super(id, priority, "plugins", () => {
            const disabledPlugins = this.plugins.filter((plugin) => !plugin.enabled);
            const renderedActivePlugins = this.plugins.filter((plugin) => plugin.enabled && plugin.executed).sort((a, b) => b.priority - a.priority).map((plugin) => ansis_1.default.green("✅ [" + plugin.name + "] " + plugin.details.shortDescription));
            const renderedCrashedPlugins = this.plugins.filter((plugin) => plugin.enabled && plugin.crashed).sort((a, b) => b.priority - a.priority).map((plugin) => ansis_1.default.red("❌ [" + plugin.name + "] " + plugin.details.shortDescription));
            const renderedDisabledPlugins = (disabledPlugins.length > 4) ? [ansis_1.default.gray("💤 (+" + disabledPlugins.length + " disabled plugins)")] : disabledPlugins.sort((a, b) => b.priority - a.priority).map((plugin) => ansis_1.default.gray("💤 [" + plugin.name + "] " + plugin.details.shortDescription));
            const renderedUnknownPlugins = unknownCrashedPlugins.map((plugin) => ansis_1.default.red("❌ [" + plugin.name + "] " + plugin.description));
            return [
                ...renderedActivePlugins,
                ...renderedDisabledPlugins,
                ...renderedCrashedPlugins,
                ...renderedUnknownPlugins
            ].join("\n");
        }, false);
        this.plugins = plugins;
        this.unknownCrashedPlugins = unknownCrashedPlugins;
    }
}
exports.ODStartScreenPluginsCategoryComponent = ODStartScreenPluginsCategoryComponent;
/**## ODStartScreenLiveStatusCategoryComponent `class`
 * This is an Open Ticket startscreen livestatus category component.
 *
 * This component will render a livestatus category to the startscreen. This will list the livestatus messages in the category.
 * An optional priority can be specified to choose the location of the component.
 */
class ODStartScreenLiveStatusCategoryComponent extends ODStartScreenCategoryComponent {
    /**A reference to the Open Ticket livestatus manager. */
    livestatus;
    constructor(id, priority, livestatus) {
        super(id, priority, "livestatus", async () => {
            const messages = await this.livestatus.getAllMessages();
            return this.livestatus.renderer.render(messages);
        }, false);
        this.livestatus = livestatus;
    }
}
exports.ODStartScreenLiveStatusCategoryComponent = ODStartScreenLiveStatusCategoryComponent;
/**## ODStartScreenLogsCategoryComponent `class`
 * This is an Open Ticket startscreen logs category component.
 *
 * This component will render a logs category to the startscreen. This will only render the logs category name.
 * An optional priority can be specified to choose the location of the component.
 */
class ODStartScreenLogCategoryComponent extends ODStartScreenCategoryComponent {
    constructor(id, priority) {
        super(id, priority, "logs", () => "", true);
    }
}
exports.ODStartScreenLogCategoryComponent = ODStartScreenLogCategoryComponent;
