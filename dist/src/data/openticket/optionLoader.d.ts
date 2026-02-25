import { api } from "../../index";
export declare const loadAllOptions: () => Promise<void>;
export declare const loadTicketOption: (option: api.ODJsonConfig_DefaultOptionTicketType) => api.ODTicketOption;
export declare const loadWebsiteOption: (opt: api.ODJsonConfig_DefaultOptionWebsiteType) => api.ODWebsiteOption;
export declare const loadRoleOption: (opt: api.ODJsonConfig_DefaultOptionRoleType) => api.ODRoleOption;
export declare const loadTicketOptionSuffix: (option: api.ODTicketOption) => api.ODOptionSuffix;
