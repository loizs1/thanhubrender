import { ODId, ODManager, ODValidJsonType, ODValidId, ODVersion, ODManagerData } from "../modules/base";
import { ODDebugger } from "../modules/console";
/**## ODQuestionManager `class`
 * This is an Open Ticket question manager.
 *
 * This class manages all registered questions in the bot. Only questions which are available in this manager can be used in options.
 *
 * Questions are not stored in the database and will be parsed from the config every startup.
 */
export declare class ODQuestionManager extends ODManager<ODQuestion> {
    #private;
    constructor(debug: ODDebugger);
    add(data: ODQuestion, overwrite?: boolean): boolean;
}
/**## ODQuestionDataJson `interface`
 * The JSON representatation from a single question property.
 */
export interface ODQuestionDataJson {
    /**The id of this property. */
    id: string;
    /**The value of this property. */
    value: ODValidJsonType;
}
/**## ODQuestionDataJson `interface`
 * The JSON representatation from a single question.
 */
export interface ODQuestionJson {
    /**The id of this question. */
    id: string;
    /**The type of this question. */
    type: string;
    /**The version of Open Ticket used to create this question. */
    version: string;
    /**The full list of properties/variables related to this question. */
    data: ODQuestionDataJson[];
}
/**## ODQuestion `class`
 * This is an Open Ticket question.
 *
 * This class contains all data related to this question (parsed from the config).
 *
 * Use `ODShortQuestion` or `ODParagraphQuestion` instead!
 */
export declare class ODQuestion extends ODManager<ODQuestionData<ODValidJsonType>> {
    /**The id of this question. (from the config) */
    id: ODId;
    /**The type of this question (e.g. `opendiscord:short` or `opendiscord:paragraph`) */
    type: string;
    constructor(id: ODValidId, type: string, data: ODQuestionData<ODValidJsonType>[]);
    /**Convert this question to a JSON object for storing this question in the database. */
    toJson(version: ODVersion): ODQuestionJson;
    /**Create a question from a JSON object in the database. */
    static fromJson(json: ODQuestionJson): ODQuestion;
}
/**## ODQuestionData `class`
 * This is Open Ticket question data.
 *
 * This class contains a single property for a question. (string, number, boolean, object, array, null)
 *
 * When this property is edited, the database will be updated automatically.
 */
export declare class ODQuestionData<DataType extends ODValidJsonType> extends ODManagerData {
    #private;
    constructor(id: ODValidId, value: DataType);
    /**The value of this property. */
    set value(value: DataType);
    get value(): DataType;
    /**Refresh the database. Is only required to be used when updating `ODQuestionData` with an object/array as value. */
    refreshDatabase(): void;
}
/**## ODShortQuestionIds `type`
 * This interface is a list of ids available in the `ODShortQuestion` class.
 * It's used to generate typescript declarations for this class.
 */
export interface ODShortQuestionIds {
    "opendiscord:name": ODQuestionData<string>;
    "opendiscord:required": ODQuestionData<boolean>;
    "opendiscord:placeholder": ODQuestionData<string>;
    "opendiscord:length-enabled": ODQuestionData<boolean>;
    "opendiscord:length-min": ODQuestionData<number>;
    "opendiscord:length-max": ODQuestionData<number>;
}
/**## ODShortQuestion `class`
 * This is an Open Ticket short question.
 *
 * This class contains all data related to an Open Ticket short question (parsed from the config).
 *
 * Use this question in an option to add a short text field to the modal!
 */
export declare class ODShortQuestion extends ODQuestion {
    type: "opendiscord:short";
    constructor(id: ODValidId, data: ODQuestionData<ODValidJsonType>[]);
    get<QuestionId extends keyof ODShortQuestionIds>(id: QuestionId): ODShortQuestionIds[QuestionId];
    get(id: ODValidId): ODQuestionData<ODValidJsonType> | null;
    remove<QuestionId extends keyof ODShortQuestionIds>(id: QuestionId): ODShortQuestionIds[QuestionId];
    remove(id: ODValidId): ODQuestionData<ODValidJsonType> | null;
    exists(id: keyof ODShortQuestionIds): boolean;
    exists(id: ODValidId): boolean;
    static fromJson(json: ODQuestionJson): ODShortQuestion;
}
/**## ODParagraphQuestionIds `type`
 * This interface is a list of ids available in the `ODParagraphQuestion` class.
 * It's used to generate typescript declarations for this class.
 */
export interface ODParagraphQuestionIds {
    "opendiscord:name": ODQuestionData<string>;
    "opendiscord:required": ODQuestionData<boolean>;
    "opendiscord:placeholder": ODQuestionData<string>;
    "opendiscord:length-enabled": ODQuestionData<boolean>;
    "opendiscord:length-min": ODQuestionData<number>;
    "opendiscord:length-max": ODQuestionData<number>;
}
/**## ODParagraphQuestion `class`
 * This is an Open Ticket paragraph question.
 *
 * This class contains all data related to an Open Ticket paragraph question (parsed from the config).
 *
 * Use this question in an option to add a paragraph text field to the modal!
 */
export declare class ODParagraphQuestion extends ODQuestion {
    type: "opendiscord:paragraph";
    constructor(id: ODValidId, data: ODQuestionData<ODValidJsonType>[]);
    get<QuestionId extends keyof ODParagraphQuestionIds>(id: QuestionId): ODParagraphQuestionIds[QuestionId];
    get(id: ODValidId): ODQuestionData<ODValidJsonType> | null;
    remove<QuestionId extends keyof ODParagraphQuestionIds>(id: QuestionId): ODParagraphQuestionIds[QuestionId];
    remove(id: ODValidId): ODQuestionData<ODValidJsonType> | null;
    exists(id: keyof ODParagraphQuestionIds): boolean;
    exists(id: ODValidId): boolean;
    static fromJson(json: ODQuestionJson): ODParagraphQuestion;
}
