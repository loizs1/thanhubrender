import { ODValidId } from "../modules/base";
import { ODSession, ODSessionManager } from "../modules/session";
/**## ODSessionManagerIds_Default `interface`
 * This interface is a list of ids available in the `ODSessionManager_Default` class.
 * It's used to generate typescript declarations for this class.
 */
export interface ODSessionManagerIds_Default {
}
/**## ODSessionManager_Default `default_class`
 * This is a special class that adds type definitions & typescript to the ODSessionManager class.
 * It doesn't add any extra features!
 *
 * This default class is made for the global variable `opendiscord.sessions`!
 */
export declare class ODSessionManager_Default extends ODSessionManager {
    get<SessionId extends keyof ODSessionManagerIds_Default>(id: SessionId): ODSessionManagerIds_Default[SessionId];
    get(id: ODValidId): ODSession | null;
    remove<SessionId extends keyof ODSessionManagerIds_Default>(id: SessionId): ODSessionManagerIds_Default[SessionId];
    remove(id: ODValidId): ODSession | null;
    exists(id: keyof ODSessionManagerIds_Default): boolean;
    exists(id: ODValidId): boolean;
}
