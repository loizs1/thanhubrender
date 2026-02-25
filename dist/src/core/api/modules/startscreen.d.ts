import { ODManager, ODManagerData, ODValidId } from "./base";
import { ODDebugger, ODLiveStatusManager } from "./console";
import { ODFlag } from "./flag";
import { ODPlugin, ODUnknownCrashedPlugin } from "./plugin";
/**## ODStartScreenComponentRenderCallback `type`
 * This is the render function of a startscreen component. It also sends the location of where the component is rendered.
 */
export type ODStartScreenComponentRenderCallback = (location: number) => string | Promise<string>;
/**## ODStartScreenManager `class`
 * This is an Open Ticket startscreen manager.
 *
 * This class is responsible for managing & rendering the startscreen of the bot.
 * The startscreen is the part you see when the bot has started up successfully. (e.g. the Open Ticket logo, logs, livestatus, flags, ...)
 */
export declare class ODStartScreenManager extends ODManager<ODStartScreenComponent> {
    #private;
    /**Alias to the livestatus manager. */
    livestatus: ODLiveStatusManager;
    constructor(debug: ODDebugger, livestatus: ODLiveStatusManager);
    /**Get all components in sorted order. */
    getSortedComponents(priority: "ascending" | "descending"): ODStartScreenComponent[];
    /**Render all startscreen components in priority order. */
    renderAllComponents(): Promise<void>;
}
/**## ODStartScreenComponent `class`
 * This is an Open Ticket startscreen component.
 *
 * This component can be rendered to the start screen of the bot.
 * An optional priority can be specified to choose the location of the component.
 *
 * It's recommended to use pre-built components except if you really need a custom one.
 */
export declare class ODStartScreenComponent extends ODManagerData {
    /**The priority of this component. */
    priority: number;
    /**An optional render function which will be inserted before the default renderer. */
    renderBefore: ODStartScreenComponentRenderCallback | null;
    /**The render function which will render the contents of this component. */
    render: ODStartScreenComponentRenderCallback;
    /**An optional render function which will be inserted behind the default renderer. */
    renderAfter: ODStartScreenComponentRenderCallback | null;
    constructor(id: ODValidId, priority: number, render: ODStartScreenComponentRenderCallback);
    /**Render this component and combine it with the `renderBefore` & `renderAfter` contents. */
    renderAll(location: number): Promise<string>;
}
/**## ODStartScreenProperty `type`
 * This interface contains properties used in a few default templates of the startscreen component.
 */
export interface ODStartScreenProperty {
    /**The key or name of this property. */
    key: string;
    /**The value or contents of this property. */
    value: string;
}
/**## ODStartScreenLogoComponent `class`
 * This is an Open Ticket startscreen logo component.
 *
 * This component will render an ASCII art logo (from an array) to the startscreen. Every property in the array is another row.
 * An optional priority can be specified to choose the location of the component.
 */
export declare class ODStartScreenLogoComponent extends ODStartScreenComponent {
    /**The ASCII logo contents. */
    logo: string[];
    /**When enabled, the component will add a new line above the logo. */
    topPadding: boolean;
    /**When enabled, the component will add a new line below the logo. */
    bottomPadding: boolean;
    /**The color of the logo in hex format. */
    logoHexColor: string;
    constructor(id: ODValidId, priority: number, logo: string[], topPadding?: boolean, bottomPadding?: boolean, logoHexColor?: string);
}
/**## ODStartScreenHeaderAlignmentSettings `type`
 * This interface contains all settings used in the startscreen header component.
 */
export interface ODStartScreenHeaderAlignmentSettings {
    /**The alignment settings for this header. */
    align: "center" | "left" | "right";
    /**The width or component to use when calculating center & right alignment. */
    width: number | ODStartScreenComponent;
}
/**## ODStartScreenHeaderComponent `class`
 * This is an Open Ticket startscreen header component.
 *
 * This component will render a header to the startscreen. Properties can be aligned left, right or centered.
 * An optional priority can be specified to choose the location of the component.
 */
export declare class ODStartScreenHeaderComponent extends ODStartScreenComponent {
    /**All properties of this header component. */
    properties: ODStartScreenProperty[];
    /**The spacer used between properties. */
    spacer: string;
    /**The alignment settings of this header component. */
    align: ODStartScreenHeaderAlignmentSettings | null;
    constructor(id: ODValidId, priority: number, properties: ODStartScreenProperty[], spacer?: string, align?: ODStartScreenHeaderAlignmentSettings);
}
/**## ODStartScreenCategoryComponent `class`
 * This is an Open Ticket startscreen category component.
 *
 * This component will render a category to the startscreen. This will only render the category name. You'll need to provide your own renderer for the contents.
 * An optional priority can be specified to choose the location of the component.
 */
export declare class ODStartScreenCategoryComponent extends ODStartScreenComponent {
    /**The name of this category. */
    name: string;
    /**When enabled, this category will still be rendered when the contents are empty. (enabled by default) */
    renderIfEmpty: boolean;
    constructor(id: ODValidId, priority: number, name: string, render: ODStartScreenComponentRenderCallback, renderIfEmpty?: boolean);
}
/**## ODStartScreenPropertiesCategoryComponent `class`
 * This is an Open Ticket startscreen properties category component.
 *
 * This component will render a properties category to the startscreen. This will list the properties in the category.
 * An optional priority can be specified to choose the location of the component.
 */
export declare class ODStartScreenPropertiesCategoryComponent extends ODStartScreenCategoryComponent {
    /**The properties of this category component. */
    properties: ODStartScreenProperty[];
    /**The hex color for the key/name of all the properties. */
    propertyHexColor: string;
    constructor(id: ODValidId, priority: number, name: string, properties: ODStartScreenProperty[], propertyHexColor?: string, renderIfEmpty?: boolean);
}
/**## ODStartScreenFlagsCategoryComponent `class`
 * This is an Open Ticket startscreen flags category component.
 *
 * This component will render a flags category to the startscreen. This will list the enabled flags in the category.
 * An optional priority can be specified to choose the location of the component.
 */
export declare class ODStartScreenFlagsCategoryComponent extends ODStartScreenCategoryComponent {
    /**A list of all flags to render. */
    flags: ODFlag[];
    constructor(id: ODValidId, priority: number, flags: ODFlag[]);
}
/**## ODStartScreenPluginsCategoryComponent `class`
 * This is an Open Ticket startscreen plugins category component.
 *
 * This component will render a plugins category to the startscreen. This will list the enabled, disabled & crashed plugins in the category.
 * An optional priority can be specified to choose the location of the component.
 */
export declare class ODStartScreenPluginsCategoryComponent extends ODStartScreenCategoryComponent {
    /**A list of all plugins to render. */
    plugins: ODPlugin[];
    /**A list of all crashed plugins to render. */
    unknownCrashedPlugins: ODUnknownCrashedPlugin[];
    constructor(id: ODValidId, priority: number, plugins: ODPlugin[], unknownCrashedPlugins: ODUnknownCrashedPlugin[]);
}
/**## ODStartScreenLiveStatusCategoryComponent `class`
 * This is an Open Ticket startscreen livestatus category component.
 *
 * This component will render a livestatus category to the startscreen. This will list the livestatus messages in the category.
 * An optional priority can be specified to choose the location of the component.
 */
export declare class ODStartScreenLiveStatusCategoryComponent extends ODStartScreenCategoryComponent {
    /**A reference to the Open Ticket livestatus manager. */
    livestatus: ODLiveStatusManager;
    constructor(id: ODValidId, priority: number, livestatus: ODLiveStatusManager);
}
/**## ODStartScreenLogsCategoryComponent `class`
 * This is an Open Ticket startscreen logs category component.
 *
 * This component will render a logs category to the startscreen. This will only render the logs category name.
 * An optional priority can be specified to choose the location of the component.
 */
export declare class ODStartScreenLogCategoryComponent extends ODStartScreenCategoryComponent {
    constructor(id: ODValidId, priority: number);
}
