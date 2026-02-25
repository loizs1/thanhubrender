import { api } from "../../index";
export declare const loadVersionMigrationSystem: () => Promise<false | api.ODVersion>;
/**Execute all version migration functions which are handled in the normal startup sequence. */
export declare function loadAllAfterInitVersionMigrations(lastVersion: api.ODVersion): Promise<void>;
