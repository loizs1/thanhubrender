"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAllModals = void 0;
///////////////////////////////////////
//MODAL BUILDERS
///////////////////////////////////////
const index_1 = require("../index");
const modals = index_1.opendiscord.builders.modals;
const lang = index_1.opendiscord.languages;
const registerAllModals = async () => {
    ticketModals();
};
exports.registerAllModals = registerAllModals;
const ticketModals = () => {
    //TICKET QUESTIONS
    modals.add(new index_1.api.ODModal("opendiscord:ticket-questions"));
    modals.get("opendiscord:ticket-questions").workers.add(new index_1.api.ODWorker("opendiscord:ticket-questions", 0, async (instance, params, source) => {
        const { option } = params;
        instance.setCustomId("od:ticket-questions_" + option.id.value + "_" + source);
        instance.setTitle(option.exists("opendiscord:name") ? option.get("opendiscord:name").value : option.id.value);
        const questionIds = option.get("opendiscord:questions").value;
        questionIds.forEach((id) => {
            const question = index_1.opendiscord.questions.get(id);
            if (!question)
                return;
            if (question instanceof index_1.api.ODShortQuestion)
                instance.addQuestion({
                    customId: question.id.value,
                    label: question.get("opendiscord:name").value,
                    style: "short",
                    required: question.get("opendiscord:required").value,
                    placeholder: (question.get("opendiscord:placeholder").value) ? question.get("opendiscord:placeholder").value : undefined,
                    minLength: (question.get("opendiscord:length-enabled").value) ? question.get("opendiscord:length-min").value : undefined,
                    maxLength: (question.get("opendiscord:length-enabled").value) ? question.get("opendiscord:length-max").value : undefined
                });
            else if (question instanceof index_1.api.ODParagraphQuestion)
                instance.addQuestion({
                    customId: question.id.value,
                    label: question.get("opendiscord:name").value,
                    style: "paragraph",
                    required: question.get("opendiscord:required").value,
                    placeholder: (question.get("opendiscord:placeholder").value) ? question.get("opendiscord:placeholder").value : undefined,
                    minLength: (question.get("opendiscord:length-enabled").value) ? question.get("opendiscord:length-min").value : undefined,
                    maxLength: (question.get("opendiscord:length-enabled").value) ? question.get("opendiscord:length-max").value : undefined
                });
        });
    }));
    //CLOSE TICKET REASON
    modals.add(new index_1.api.ODModal("opendiscord:close-ticket-reason"));
    modals.get("opendiscord:close-ticket-reason").workers.add(new index_1.api.ODWorker("opendiscord:close-ticket-reason", 0, async (instance, params, source) => {
        const { ticket } = params;
        instance.setCustomId("od:close-ticket-reason_" + ticket.id.value + "_" + source);
        instance.setTitle(lang.getTranslation("actions.buttons.close"));
        instance.addQuestion({
            customId: "reason",
            label: lang.getTranslation("params.uppercase.reason"),
            style: "paragraph",
            required: true,
            placeholder: lang.getTranslation("actions.modal.closePlaceholder")
        });
    }));
    //REOPEN TICKET REASON
    modals.add(new index_1.api.ODModal("opendiscord:reopen-ticket-reason"));
    modals.get("opendiscord:reopen-ticket-reason").workers.add(new index_1.api.ODWorker("opendiscord:reopen-ticket-reason", 0, async (instance, params, source) => {
        const { ticket } = params;
        instance.setCustomId("od:reopen-ticket-reason_" + ticket.id.value + "_" + source);
        instance.setTitle(lang.getTranslation("actions.buttons.reopen"));
        instance.addQuestion({
            customId: "reason",
            label: lang.getTranslation("params.uppercase.reason"),
            style: "paragraph",
            required: true,
            placeholder: lang.getTranslation("actions.modal.reopenPlaceholder")
        });
    }));
    //DELETE TICKET REASON
    modals.add(new index_1.api.ODModal("opendiscord:delete-ticket-reason"));
    modals.get("opendiscord:delete-ticket-reason").workers.add(new index_1.api.ODWorker("opendiscord:delete-ticket-reason", 0, async (instance, params, source) => {
        const { ticket } = params;
        instance.setCustomId("od:delete-ticket-reason_" + ticket.id.value + "_" + source);
        instance.setTitle(lang.getTranslation("actions.buttons.delete"));
        instance.addQuestion({
            customId: "reason",
            label: lang.getTranslation("params.uppercase.reason"),
            style: "paragraph",
            required: true,
            placeholder: lang.getTranslation("actions.modal.deletePlaceholder")
        });
    }));
    //CLAIM TICKET REASON
    modals.add(new index_1.api.ODModal("opendiscord:claim-ticket-reason"));
    modals.get("opendiscord:claim-ticket-reason").workers.add(new index_1.api.ODWorker("opendiscord:claim-ticket-reason", 0, async (instance, params, source) => {
        const { ticket } = params;
        instance.setCustomId("od:claim-ticket-reason_" + ticket.id.value + "_" + source);
        instance.setTitle(lang.getTranslation("actions.buttons.claim"));
        instance.addQuestion({
            customId: "reason",
            label: lang.getTranslation("params.uppercase.reason"),
            style: "paragraph",
            required: true,
            placeholder: lang.getTranslation("actions.modal.claimPlaceholder")
        });
    }));
    //UNCLAIM TICKET REASON
    modals.add(new index_1.api.ODModal("opendiscord:unclaim-ticket-reason"));
    modals.get("opendiscord:unclaim-ticket-reason").workers.add(new index_1.api.ODWorker("opendiscord:unclaim-ticket-reason", 0, async (instance, params, source) => {
        const { ticket } = params;
        instance.setCustomId("od:unclaim-ticket-reason_" + ticket.id.value + "_" + source);
        instance.setTitle(lang.getTranslation("actions.buttons.unclaim"));
        instance.addQuestion({
            customId: "reason",
            label: lang.getTranslation("params.uppercase.reason"),
            style: "paragraph",
            required: true,
            placeholder: lang.getTranslation("actions.modal.unclaimPlaceholder")
        });
    }));
    //PIN TICKET REASON
    modals.add(new index_1.api.ODModal("opendiscord:pin-ticket-reason"));
    modals.get("opendiscord:pin-ticket-reason").workers.add(new index_1.api.ODWorker("opendiscord:pin-ticket-reason", 0, async (instance, params, source) => {
        const { ticket } = params;
        instance.setCustomId("od:pin-ticket-reason_" + ticket.id.value + "_" + source);
        instance.setTitle(lang.getTranslation("actions.buttons.pin"));
        instance.addQuestion({
            customId: "reason",
            label: lang.getTranslation("params.uppercase.reason"),
            style: "paragraph",
            required: true,
            placeholder: lang.getTranslation("actions.modal.pinPlaceholder")
        });
    }));
    //UNPIN TICKET REASON
    modals.add(new index_1.api.ODModal("opendiscord:unpin-ticket-reason"));
    modals.get("opendiscord:unpin-ticket-reason").workers.add(new index_1.api.ODWorker("opendiscord:unpin-ticket-reason", 0, async (instance, params, source) => {
        const { ticket } = params;
        instance.setCustomId("od:unpin-ticket-reason_" + ticket.id.value + "_" + source);
        instance.setTitle(lang.getTranslation("actions.buttons.unpin"));
        instance.addQuestion({
            customId: "reason",
            label: lang.getTranslation("params.uppercase.reason"),
            style: "paragraph",
            required: true,
            placeholder: lang.getTranslation("actions.modal.unpinPlaceholder")
        });
    }));
};
