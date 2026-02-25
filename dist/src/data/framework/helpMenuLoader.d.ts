/** (CONTRIBUTOR GUIDE) HOW TO ADD NEW COMMANDS?
 * - Register the command in loadAllSlashCommands() & loadAllTextCommands() in (./src/data/framework/commandLoader.ts)
 * - Add autocomplete for the command in OD(Slash/Text)CommandManagerIds_Default in (./src/core/api/defaults/client.ts)
 * - Add the command to the help menu in (./src/data/framework/helpMenuLoader.ts)
 * - If required, new config variables should be added (incl. logs, dm-logs & permissions).
 * - Update the Open Ticket Documentation.
 * - If the command contains complex logic or can be executed from a button/dropdown, it should be placed inside an `ODAction`.
 * - Check all files, test the bot carefully & try a lot of different scenario's with different settings.
 */
export declare const loadAllHelpMenuCategories: () => Promise<void>;
export declare const loadAllHelpMenuComponents: () => Promise<void>;
