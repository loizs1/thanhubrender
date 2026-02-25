import { api } from "../../index";
export declare const loadAllTickets: () => Promise<void>;
export declare const loadTicket: (ticket: api.ODTicketJson) => Promise<api.ODTicket>;
