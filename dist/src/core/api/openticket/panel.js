"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODPanelData = exports.ODPanel = exports.ODPanelManager = void 0;
const base_1 = require("../modules/base");
/**## ODPanelManager `class`
 * This is an Open Ticket panel manager.
 *
 * This class manages all registered panels in the bot. Only panels which are available in this manager can be auto-updated.
 *
 * Panels are not stored in the database and will be parsed from the config every startup.
 */
class ODPanelManager extends base_1.ODManager {
    /**A reference to the Open Ticket debugger. */
    #debug;
    constructor(debug) {
        super(debug, "option");
        this.#debug = debug;
    }
    add(data, overwrite) {
        data.useDebug(this.#debug, "option data");
        return super.add(data, overwrite);
    }
}
exports.ODPanelManager = ODPanelManager;
/**## ODPanel `class`
 * This is an Open Ticket panel.
 *
 * This class contains all data related to this panel (parsed from the config).
 */
class ODPanel extends base_1.ODManager {
    /**The id of this panel. (from the config) */
    id;
    constructor(id, data) {
        super();
        this.id = new base_1.ODId(id);
        data.forEach((data) => {
            this.add(data);
        });
    }
    /**Convert this panel to a JSON object for storing this panel in the database. */
    toJson(version) {
        const data = this.getAll().map((data) => {
            return {
                id: data.id.toString(),
                value: data.value
            };
        });
        return {
            id: this.id.toString(),
            version: version.toString(),
            data
        };
    }
    /**Create a panel from a JSON object in the database. */
    static fromJson(json) {
        return new ODPanel(json.id, json.data.map((data) => new ODPanelData(data.id, data.value)));
    }
    get(id) {
        return super.get(id);
    }
    remove(id) {
        return super.remove(id);
    }
    exists(id) {
        return super.exists(id);
    }
}
exports.ODPanel = ODPanel;
/**## ODPanelData `class`
 * This is Open Ticket panel data.
 *
 * This class contains a single property for a panel. (string, number, boolean, object, array, null)
 *
 * When this property is edited, the database will be updated automatically.
 */
class ODPanelData extends base_1.ODManagerData {
    /**The value of this property. */
    #value;
    constructor(id, value) {
        super(id);
        this.#value = value;
    }
    /**The value of this property. */
    set value(value) {
        this.#value = value;
        this._change();
    }
    get value() {
        return this.#value;
    }
    /**Refresh the database. Is only required to be used when updating `ODPanelData` with an object/array as value. */
    refreshDatabase() {
        this._change();
    }
}
exports.ODPanelData = ODPanelData;
