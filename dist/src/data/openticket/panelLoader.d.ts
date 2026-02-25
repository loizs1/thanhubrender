import { api } from "../../index";
export declare const loadAllPanels: () => Promise<void>;
export declare const loadPanel: (panel: api.ODJsonConfig_DefaultPanelType) => api.ODPanel;
export declare function describePanelOptions(mode: "fields", panel: api.ODPanel): {
    name: string;
    value: string;
}[];
export declare function describePanelOptions(mode: "text", panel: api.ODPanel): string;
