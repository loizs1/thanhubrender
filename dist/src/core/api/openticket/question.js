"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODParagraphQuestion = exports.ODShortQuestion = exports.ODQuestionData = exports.ODQuestion = exports.ODQuestionManager = void 0;
///////////////////////////////////////
//OPENTICKET OPTION MODULE
///////////////////////////////////////
const base_1 = require("../modules/base");
/**## ODQuestionManager `class`
 * This is an Open Ticket question manager.
 *
 * This class manages all registered questions in the bot. Only questions which are available in this manager can be used in options.
 *
 * Questions are not stored in the database and will be parsed from the config every startup.
 */
class ODQuestionManager extends base_1.ODManager {
    /**A reference to the Open Ticket debugger. */
    #debug;
    constructor(debug) {
        super(debug, "question");
        this.#debug = debug;
    }
    add(data, overwrite) {
        data.useDebug(this.#debug, "question data");
        return super.add(data, overwrite);
    }
}
exports.ODQuestionManager = ODQuestionManager;
/**## ODQuestion `class`
 * This is an Open Ticket question.
 *
 * This class contains all data related to this question (parsed from the config).
 *
 * Use `ODShortQuestion` or `ODParagraphQuestion` instead!
 */
class ODQuestion extends base_1.ODManager {
    /**The id of this question. (from the config) */
    id;
    /**The type of this question (e.g. `opendiscord:short` or `opendiscord:paragraph`) */
    type;
    constructor(id, type, data) {
        super();
        this.id = new base_1.ODId(id);
        this.type = type;
        data.forEach((data) => {
            this.add(data);
        });
    }
    /**Convert this question to a JSON object for storing this question in the database. */
    toJson(version) {
        const data = this.getAll().map((data) => {
            return {
                id: data.id.toString(),
                value: data.value
            };
        });
        return {
            id: this.id.toString(),
            type: this.type,
            version: version.toString(),
            data
        };
    }
    /**Create a question from a JSON object in the database. */
    static fromJson(json) {
        return new ODQuestion(json.id, json.type, json.data.map((data) => new ODQuestionData(data.id, data.value)));
    }
}
exports.ODQuestion = ODQuestion;
/**## ODQuestionData `class`
 * This is Open Ticket question data.
 *
 * This class contains a single property for a question. (string, number, boolean, object, array, null)
 *
 * When this property is edited, the database will be updated automatically.
 */
class ODQuestionData extends base_1.ODManagerData {
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
    /**Refresh the database. Is only required to be used when updating `ODQuestionData` with an object/array as value. */
    refreshDatabase() {
        this._change();
    }
}
exports.ODQuestionData = ODQuestionData;
/**## ODShortQuestion `class`
 * This is an Open Ticket short question.
 *
 * This class contains all data related to an Open Ticket short question (parsed from the config).
 *
 * Use this question in an option to add a short text field to the modal!
 */
class ODShortQuestion extends ODQuestion {
    type = "opendiscord:short";
    constructor(id, data) {
        super(id, "opendiscord:short", data);
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
    static fromJson(json) {
        return new ODShortQuestion(json.id, json.data.map((data) => new ODQuestionData(data.id, data.value)));
    }
}
exports.ODShortQuestion = ODShortQuestion;
/**## ODParagraphQuestion `class`
 * This is an Open Ticket paragraph question.
 *
 * This class contains all data related to an Open Ticket paragraph question (parsed from the config).
 *
 * Use this question in an option to add a paragraph text field to the modal!
 */
class ODParagraphQuestion extends ODQuestion {
    type = "opendiscord:paragraph";
    constructor(id, data) {
        super(id, "opendiscord:paragraph", data);
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
    static fromJson(json) {
        return new ODParagraphQuestion(json.id, json.data.map((data) => new ODQuestionData(data.id, data.value)));
    }
}
exports.ODParagraphQuestion = ODParagraphQuestion;
