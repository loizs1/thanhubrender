import { api } from "../../index";
export declare const loadAllPermissions: () => Promise<void>;
export declare const addTicketPermissions: (ticket: api.ODTicket) => Promise<void>;
export declare const removeTicketPermissions: (ticket: api.ODTicket) => Promise<void>;
