"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadVersionMigrationSystem = void 0;
exports.loadAllAfterInitVersionMigrations = loadAllAfterInitVersionMigrations;
const index_1 = require("../../index");
const fs_1 = __importDefault(require("fs"));
/**Check if migration is required. Returns the last version used in the database. */
async function isMigrationRequired() {
    const rawVersion = await index_1.opendiscord.databases.get("opendiscord:global").get("opendiscord:last-version", "opendiscord:version");
    if (!rawVersion)
        return false;
    const version = index_1.api.ODVersion.fromString("opendiscord:last-version", rawVersion);
    if (index_1.opendiscord.versions.get("opendiscord:version").compare(version) == "higher") {
        return version;
    }
    else
        return false;
}
/**Save all versions in `opendiscord.versions` to the global database. */
async function saveAllVersionsToDatabase() {
    const globalDatabase = index_1.opendiscord.databases.get("opendiscord:global");
    await index_1.opendiscord.versions.loopAll(async (version, id) => {
        await globalDatabase.set("opendiscord:last-version", id.value, version.toString());
    });
}
const loadVersionMigrationSystem = async () => {
    //ENTER MIGRATION CONTEXT
    await preloadMigrationContext();
    const lastVersion = await isMigrationRequired();
    //save last version to database (OR set to current version if no migration is required)
    index_1.opendiscord.versions.add(lastVersion ? lastVersion : index_1.api.ODVersion.fromString("opendiscord:last-version", index_1.opendiscord.versions.get("opendiscord:version").toString()));
    if (lastVersion && !index_1.opendiscord.flags.get("opendiscord:no-migration").value) {
        //MIGRATION IS REQUIRED
        index_1.opendiscord.log("Detected old data!", "info");
        index_1.opendiscord.log("Starting closed API context...", "debug");
        await index_1.utilities.timer(600);
        index_1.opendiscord.log("Migrating data to new version...", "debug");
        await loadAllVersionMigrations(lastVersion);
        index_1.opendiscord.log("Stopping closed API context...", "debug");
        await index_1.utilities.timer(400);
        index_1.opendiscord.log("All data is now up to date!", "info");
        await index_1.utilities.timer(200);
        console.log("---------------------------------------------------------------------");
    }
    saveAllVersionsToDatabase();
    //DEFAULT FLAGS
    if (index_1.opendiscord.flags.exists("opendiscord:no-plugins") && index_1.opendiscord.flags.get("opendiscord:no-plugins").value)
        index_1.opendiscord.defaults.setDefault("pluginLoading", false);
    if (index_1.opendiscord.flags.exists("opendiscord:soft-plugins") && index_1.opendiscord.flags.get("opendiscord:soft-plugins").value)
        index_1.opendiscord.defaults.setDefault("softPluginLoading", true);
    if (index_1.opendiscord.flags.exists("opendiscord:crash") && index_1.opendiscord.flags.get("opendiscord:crash").value)
        index_1.opendiscord.defaults.setDefault("crashOnError", true);
    if (index_1.opendiscord.flags.exists("opendiscord:force-slash-update") && index_1.opendiscord.flags.get("opendiscord:force-slash-update").value) {
        index_1.opendiscord.defaults.setDefault("forceSlashCommandRegistration", true);
        index_1.opendiscord.defaults.setDefault("forceContextMenuRegistration", true);
    }
    if (index_1.opendiscord.flags.exists("opendiscord:silent") && index_1.opendiscord.flags.get("opendiscord:silent").value)
        index_1.opendiscord.console.silent = true;
    //LEAVE MIGRATION CONTEXT
    await unloadMigrationContext();
    return lastVersion;
};
exports.loadVersionMigrationSystem = loadVersionMigrationSystem;
/**Initialize the migration context by loading the built-in flags, configs & databases. */
async function preloadMigrationContext() {
    index_1.opendiscord.debug.debug("-- MIGRATION CONTEXT START --");
    await (await import("../../data/framework/flagLoader.js")).loadAllFlags();
    await index_1.opendiscord.flags.init();
    await (await import("../../data/framework/configLoader.js")).loadAllConfigs();
    await index_1.opendiscord.configs.init();
    await (await import("../../data/framework/databaseLoader.js")).loadAllDatabases();
    await index_1.opendiscord.databases.init();
    index_1.opendiscord.debug.visible = true;
}
/**Unload the migration context to start the bot normally. */
async function unloadMigrationContext() {
    index_1.opendiscord.debug.visible = false;
    await index_1.opendiscord.databases.loopAll((database, id) => { index_1.opendiscord.databases.remove(id); });
    await index_1.opendiscord.configs.loopAll((config, id) => { index_1.opendiscord.configs.remove(id); });
    await index_1.opendiscord.flags.loopAll((flag, id) => { index_1.opendiscord.flags.remove(id); });
    index_1.opendiscord.debug.debug("-- MIGRATION CONTEXT END --");
}
/**Create a backup of the (dev)config & database before migrating. */
function createMigrationBackup() {
    if (fs_1.default.existsSync("./.backup/"))
        fs_1.default.rmSync("./.backup/", { force: true, recursive: true });
    fs_1.default.mkdirSync("./.backup/");
    const devconfigFlag = index_1.opendiscord.flags.get("opendiscord:dev-config");
    const isDevConfig = devconfigFlag ? devconfigFlag.value : false;
    const devDatabaseFlag = index_1.opendiscord.flags.get("opendiscord:dev-database");
    const isDevDatabase = devDatabaseFlag ? devDatabaseFlag.value : false;
    if (isDevConfig)
        fs_1.default.cpSync("./devconfig/", "./.backup/devconfig/", { force: true, recursive: true });
    else
        fs_1.default.cpSync("./config/", "./.backup/config/", { force: true, recursive: true });
    if (isDevDatabase)
        fs_1.default.cpSync("./devdatabase/", "./.backup/devdatabase/", { force: true, recursive: true });
    else
        fs_1.default.cpSync("./database/", "./.backup/database/", { force: true, recursive: true });
}
/**Execute all version migration functions which are handled in the restricted migration context. */
async function loadAllVersionMigrations(lastVersion) {
    const migrations = (await import("./migration.js")).migrations;
    migrations.sort((a, b) => {
        const comparison = a.version.compare(b.version);
        if (comparison == "equal")
            return 0;
        else if (comparison == "higher")
            return 1;
        else
            return -1;
    });
    if (migrations.length > 0) {
        //create backup of config & database
        createMigrationBackup();
    }
    for (const migration of migrations) {
        if (migration.version.compare(lastVersion) == "higher") {
            const success = await migration.migrate();
            if (success)
                index_1.opendiscord.log("Migrated data to " + migration.version.toString() + "!", "debug", [
                    { key: "success", value: success ? "true" : "false" },
                    { key: "afterInit", value: "false" }
                ]);
            else
                throw new index_1.api.ODSystemError("Migration Error: Unable to migrate database & config to the new version of the bot.");
        }
    }
}
/**Execute all version migration functions which are handled in the normal startup sequence. */
async function loadAllAfterInitVersionMigrations(lastVersion) {
    const migrations = (await import("./migration.js")).migrations;
    migrations.sort((a, b) => {
        const comparison = a.version.compare(b.version);
        if (comparison == "equal")
            return 0;
        else if (comparison == "higher")
            return 1;
        else
            return -1;
    });
    if (migrations.length > 0) {
        //create backup of config & database
        createMigrationBackup();
    }
    for (const migration of migrations) {
        if (migration.version.compare(lastVersion) == "higher") {
            const success = await migration.migrateAfterInit();
            if (success)
                index_1.opendiscord.log("Migrated data to " + migration.version.toString() + "!", "debug", [
                    { key: "success", value: success ? "true" : "false" },
                    { key: "afterInit", value: "true" }
                ]);
            else
                throw new index_1.api.ODSystemError("Migration Error: Unable to migrate database & config to the new version of the bot.");
        }
    }
}
