"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODPermissionManager_Default = void 0;
const permission_1 = require("../modules/permission");
/**## ODPermissionManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODPermissionManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.permissions`!
 */
class ODPermissionManager_Default extends permission_1.ODPermissionManager {
    constructor(debug, client) {
        super(debug, client, true);
    }
}
exports.ODPermissionManager_Default = ODPermissionManager_Default;
