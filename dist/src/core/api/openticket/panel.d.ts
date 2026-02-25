import { ODJsonConfig_DefaultPanelEmbedSettingsType } from "../defaults/config";
import { ODId, ODManager, ODValidJsonType, ODValidId, ODVersion, ODManagerData } from "../modules/base";
import { ODDebugger } from "../modules/console";
/**## ODPanelManager `class`
 * This is an Open Ticket panel manager.
 *
 * This class manages all registered panels in the bot. Only panels which are available in this manager can be auto-updated.
 *
 * Panels are not stored in the database and will be parsed from the config every startup.
 */
export declare class ODPanelManager extends ODManager<ODPanel> {
    #private;
    constructor(debug: ODDebugger);
    add(data: ODPanel, overwrite?: boolean): boolean;
}
/**## ODPanelDataJson `interface`
 * The JSON representatation from a single panel property.
 */
export interface ODPanelDataJson {
    /**The id of this property. */
    id: string;
    /**The value of this property. */
    value: ODValidJsonType;
}
/**## ODPanelDataJson `interface`
 * The JSON representatation from a single panel.
 */
export interface ODPanelJson {
    /**The id of this panel. */
    id: string;
    /**The version of Open Ticket used to create this panel. */
    version: string;
    /**The full list of properties/variables related to this panel. */
    data: ODPanelDataJson[];
}
/**## ODPanelIds `type`
 * This interface is a list of ids available in the `ODPanel` class.
 * It's used to generate typescript declarations for this class.
 */
export interface ODPanelIds {
    "opendiscord:name": ODPanelData<string>;
    "opendiscord:options": ODPanelData<string[]>;
    "opendiscord:dropdown": ODPanelData<boolean>;
    "opendiscord:text": ODPanelData<string>;
    "opendiscord:embed": ODPanelData<ODJsonConfig_DefaultPanelEmbedSettingsType>;
    "opendiscord:dropdown-placeholder": ODPanelData<string>;
    "opendiscord:enable-max-tickets-warning-text": ODPanelData<boolean>;
    "opendiscord:enable-max-tickets-warning-embed": ODPanelData<boolean>;
    "opendiscord:describe-options-layout": ODPanelData<"simple" | "normal" | "detailed">;
    "opendiscord:describe-options-custom-title": ODPanelData<string>;
    "opendiscord:describe-options-in-text": ODPanelData<boolean>;
    "opendiscord:describe-options-in-embed-fields": ODPanelData<boolean>;
    "opendiscord:describe-options-in-embed-description": ODPanelData<boolean>;
}
/**## ODPanel `class`
 * This is an Open Ticket panel.
 *
 * This class contains all data related to this panel (parsed from the config).
 */
export declare class ODPanel extends ODManager<ODPanelData<ODValidJsonType>> {
    /**The id of this panel. (from the config) */
    id: ODId;
    constructor(id: ODValidId, data: ODPanelData<ODValidJsonType>[]);
    /**Convert this panel to a JSON object for storing this panel in the database. */
    toJson(version: ODVersion): ODPanelJson;
    /**Create a panel from a JSON object in the database. */
    static fromJson(json: ODPanelJson): ODPanel;
    get<PanelId extends keyof ODPanelIds>(id: PanelId): ODPanelIds[PanelId];
    get(id: ODValidId): ODPanelData<ODValidJsonType> | null;
    remove<PanelId extends keyof ODPanelIds>(id: PanelId): ODPanelIds[PanelId];
    remove(id: ODValidId): ODPanelData<ODValidJsonType> | null;
    exists(id: keyof ODPanelIds): boolean;
    exists(id: ODValidId): boolean;
}
/**## ODPanelData `class`
 * This is Open Ticket panel data.
 *
 * This class contains a single property for a panel. (string, number, boolean, object, array, null)
 *
 * When this property is edited, the database will be updated automatically.
 */
export declare class ODPanelData<DataType extends ODValidJsonType> extends ODManagerData {
    #private;
    constructor(id: ODValidId, value: DataType);
    /**The value of this property. */
    set value(value: DataType);
    get value(): DataType;
    /**Refresh the database. Is only required to be used when updating `ODPanelData` with an object/array as value. */
    refreshDatabase(): void;
}
