import { api } from "#opendiscord";
declare module "#opendiscord-types" {
    interface ODPluginManagerIds_Default {
        "example-plugin": api.ODPlugin;
    }
    interface ODConfigManagerIds_Default {
        "example-plugin:config": api.ODJsonConfig;
    }
}
