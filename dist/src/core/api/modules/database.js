"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODFormattedJsonDatabase = exports.ODJsonDatabase = exports.ODDatabase = exports.ODDatabaseManager = void 0;
///////////////////////////////////////
//DATABASE MODULE
///////////////////////////////////////
const base_1 = require("./base");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**## ODDatabaseManager `class`
 * This is an Open Ticket database manager.
 *
 * It manages all databases in the bot and allows to permanently store data from the bot!
 *
 * You can use this class to get/add a database (`ODDatabase`) in your plugin!
 */
class ODDatabaseManager extends base_1.ODManager {
    constructor(debug) {
        super(debug, "database");
    }
    /**Init all database files. */
    async init() {
        for (const database of this.getAll()) {
            try {
                await database.init();
            }
            catch (err) {
                process.emit("uncaughtException", new base_1.ODSystemError(err));
            }
        }
    }
}
exports.ODDatabaseManager = ODDatabaseManager;
/**## ODDatabase `class`
 * This is an Open Ticket database template.
 * This class doesn't do anything at all, it just gives a template & basic methods for a database. Use `ODJsonDatabase` instead!
 *
 * You can use this class if you want to create your own database implementation (e.g. `mongodb`, `mysql`,...)!
 */
class ODDatabase extends base_1.ODManagerData {
    /**The name of the file with extension. */
    file = "";
    /**The path to the file relative to the main directory. */
    path = "";
    /**Init the database. */
    init() {
        //nothing
    }
    /**Add/Overwrite a specific category & key in the database. Returns `true` when overwritten. */
    set(category, key, value) {
        return false;
    }
    /**Get a specific category & key in the database */
    get(category, key) {
        return undefined;
    }
    /**Delete a specific category & key in the database */
    delete(category, key) {
        return false;
    }
    /**Check if a specific category & key exists in the database */
    exists(category, key) {
        return false;
    }
    /**Get a specific category in the database */
    getCategory(category) {
        return undefined;
    }
    /**Get all values in the database */
    getAll() {
        return [];
    }
}
exports.ODDatabase = ODDatabase;
/**## ODJsonDatabase `class`
 * This is an Open Ticket JSON database.
 * It stores data in a `json` file as a large `Array` using the `category`, `key`, `value` strategy.
 * You can store the following types: `string`, `number`, `boolean`, `array`, `object` & `null`!
 *
 * You can use this class if you want to add your own database or to use an existing one!
 */
class ODJsonDatabase extends ODDatabase {
    constructor(id, file, customPath) {
        super(id);
        this.file = (file.endsWith(".json")) ? file : file + ".json";
        this.path = customPath ? path_1.default.join("./", customPath, this.file) : path_1.default.join("./database/", this.file);
    }
    /**Init the database. */
    init() {
        this.#system.getData();
    }
    /**Set/overwrite the value of `category` & `key`. Returns `true` when overwritten!
     * @example
     * const didOverwrite = database.setData("category","key","value") //value can be any of the valid types
     * //You need an ODJsonDatabase class named "database" for this example to work!
     */
    set(category, key, value) {
        const currentList = this.#system.getData();
        const currentData = currentList.find((d) => (d.category === category) && (d.key === key));
        //overwrite when already present
        if (currentData) {
            currentList[currentList.indexOf(currentData)].value = value;
        }
        else {
            currentList.push({ category, key, value });
        }
        this.#system.setData(currentList);
        return currentData ? true : false;
    }
    /**Get the value of `category` & `key`. Returns `undefined` when non-existent!
     * @example
     * const data = database.getData("category","key") //data will be the value
     * //You need an ODJsonDatabase class named "database" for this example to work!
     */
    get(category, key) {
        const currentList = this.#system.getData();
        const tempresult = currentList.find((d) => (d.category === category) && (d.key === key));
        return tempresult ? tempresult.value : undefined;
    }
    /**Remove the value of `category` & `key`. Returns `undefined` when non-existent!
     * @example
     * const didExist = database.deleteData("category","key") //delete this value
     * //You need an ODJsonDatabase class named "database" for this example to work!
     */
    delete(category, key) {
        const currentList = this.#system.getData();
        const currentData = currentList.find((d) => (d.category === category) && (d.key === key));
        if (currentData)
            currentList.splice(currentList.indexOf(currentData), 1);
        this.#system.setData(currentList);
        return currentData ? true : false;
    }
    /**Check if a value of `category` & `key` exists. Returns `false` when non-existent! */
    exists(category, key) {
        const currentList = this.#system.getData();
        const tempresult = currentList.find((d) => (d.category === category) && (d.key === key));
        return tempresult ? true : false;
    }
    /**Get all values in `category`. Returns `undefined` when non-existent! */
    getCategory(category) {
        const currentList = this.#system.getData();
        const tempresult = currentList.filter((d) => (d.category === category));
        return tempresult ? tempresult.map((data) => { return { key: data.key, value: data.value }; }) : undefined;
    }
    /**Get all values in `category`. */
    getAll() {
        return this.#system.getData();
    }
    #system = {
        /**Read parsed data from the json file */
        getData: () => {
            if (fs_1.default.existsSync(this.path)) {
                try {
                    return JSON.parse(fs_1.default.readFileSync(this.path).toString());
                }
                catch (err) {
                    process.emit("uncaughtException", err);
                    throw new base_1.ODSystemError("Unable to read database " + this.path + "! getData() read error. (see error above)");
                }
            }
            else {
                fs_1.default.writeFileSync(this.path, "[]");
                return [];
            }
        },
        /**Write parsed data to the json file */
        setData: (data) => {
            fs_1.default.writeFileSync(this.path, JSON.stringify(data, null, "\t"));
        }
    };
}
exports.ODJsonDatabase = ODJsonDatabase;
/**## ODFormattedJsonDatabase `class`
 * This is an Open Ticket Formatted JSON database.
 * It stores data in a `json` file as a large `Array` using the `category`, `key`, `value` strategy.
 * You can store the following types: `string`, `number`, `boolean`, `array`, `object` & `null`!
 *
 * This one is exactly the same as `ODJsonDatabase`, but it has a formatter from the `formatted-json-stringify` package.
 * This can help you organise it a little bit better!
 */
class ODFormattedJsonDatabase extends ODDatabase {
    /**The formatter to use on the database array */
    formatter;
    constructor(id, file, formatter, customPath) {
        super(id);
        this.file = (file.endsWith(".json")) ? file : file + ".json";
        this.path = customPath ? path_1.default.join("./", customPath, this.file) : path_1.default.join("./database/", this.file);
        this.formatter = formatter;
    }
    /**Init the database. */
    init() {
        this.#system.getData();
    }
    /**Set/overwrite the value of `category` & `key`. Returns `true` when overwritten!
     * @example
     * const didOverwrite = database.setData("category","key","value") //value can be any of the valid types
     * //You need an ODFormattedJsonDatabase class named "database" for this example to work!
     */
    set(category, key, value) {
        const currentList = this.#system.getData();
        const currentData = currentList.find((d) => (d.category === category) && (d.key === key));
        //overwrite when already present
        if (currentData) {
            currentList[currentList.indexOf(currentData)].value = value;
        }
        else {
            currentList.push({ category, key, value });
        }
        this.#system.setData(currentList);
        return currentData ? true : false;
    }
    /**Get the value of `category` & `key`. Returns `undefined` when non-existent!
     * @example
     * const data = database.getData("category","key") //data will be the value
     * //You need an ODFormattedJsonDatabase class named "database" for this example to work!
     */
    get(category, key) {
        const currentList = this.#system.getData();
        const tempresult = currentList.find((d) => (d.category === category) && (d.key === key));
        return tempresult ? tempresult.value : undefined;
    }
    /**Remove the value of `category` & `key`. Returns `undefined` when non-existent!
     * @example
     * const didExist = database.deleteData("category","key") //delete this value
     * //You need an ODFormattedJsonDatabase class named "database" for this example to work!
     */
    delete(category, key) {
        const currentList = this.#system.getData();
        const currentData = currentList.find((d) => (d.category === category) && (d.key === key));
        if (currentData)
            currentList.splice(currentList.indexOf(currentData), 1);
        this.#system.setData(currentList);
        return currentData ? true : false;
    }
    /**Check if a value of `category` & `key` exists. Returns `false` when non-existent! */
    exists(category, key) {
        const currentList = this.#system.getData();
        const tempresult = currentList.find((d) => (d.category === category) && (d.key === key));
        return tempresult ? true : false;
    }
    /**Get all values in `category`. Returns `undefined` when non-existent! */
    getCategory(category) {
        const currentList = this.#system.getData();
        const tempresult = currentList.filter((d) => (d.category === category));
        return tempresult ? tempresult.map((data) => { return { key: data.key, value: data.value }; }) : undefined;
    }
    /**Get all values in `category`. */
    getAll() {
        return this.#system.getData();
    }
    #system = {
        /**Read parsed data from the json file */
        getData: () => {
            if (fs_1.default.existsSync(this.path)) {
                return JSON.parse(fs_1.default.readFileSync(this.path).toString());
            }
            else {
                fs_1.default.writeFileSync(this.path, "[]");
                return [];
            }
        },
        /**Write parsed data to the json file */
        setData: (data) => {
            fs_1.default.writeFileSync(this.path, this.formatter.stringify(data));
        }
    };
}
exports.ODFormattedJsonDatabase = ODFormattedJsonDatabase;
