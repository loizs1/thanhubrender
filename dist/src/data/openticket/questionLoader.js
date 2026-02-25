"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadParagraphQuestion = exports.loadShortQuestion = exports.loadAllQuestions = void 0;
const index_1 = require("../../index");
const loadAllQuestions = async () => {
    const questionConfig = index_1.opendiscord.configs.get("opendiscord:questions");
    if (!questionConfig)
        return;
    questionConfig.data.forEach((question) => {
        if (question.type == "short") {
            index_1.opendiscord.questions.add((0, exports.loadShortQuestion)(question));
        }
        else if (question.type == "paragraph") {
            index_1.opendiscord.questions.add((0, exports.loadParagraphQuestion)(question));
        }
    });
    //update questions on config reload
    questionConfig.onReload(async () => {
        //clear previous questions
        await index_1.opendiscord.questions.loopAll((data, id) => { index_1.opendiscord.questions.remove(id); });
        //add new questions
        questionConfig.data.forEach((question) => {
            if (question.type == "short") {
                index_1.opendiscord.questions.add((0, exports.loadShortQuestion)(question));
            }
            else if (question.type == "paragraph") {
                index_1.opendiscord.questions.add((0, exports.loadParagraphQuestion)(question));
            }
        });
    });
};
exports.loadAllQuestions = loadAllQuestions;
const loadShortQuestion = (option) => {
    return new index_1.api.ODShortQuestion(option.id, [
        new index_1.api.ODQuestionData("opendiscord:name", option.name),
        new index_1.api.ODQuestionData("opendiscord:required", option.required),
        new index_1.api.ODQuestionData("opendiscord:placeholder", option.placeholder),
        new index_1.api.ODQuestionData("opendiscord:length-enabled", option.length.enabled),
        new index_1.api.ODQuestionData("opendiscord:length-min", option.length.min),
        new index_1.api.ODQuestionData("opendiscord:length-max", option.length.max),
    ]);
};
exports.loadShortQuestion = loadShortQuestion;
const loadParagraphQuestion = (option) => {
    return new index_1.api.ODParagraphQuestion(option.id, [
        new index_1.api.ODQuestionData("opendiscord:name", option.name),
        new index_1.api.ODQuestionData("opendiscord:required", option.required),
        new index_1.api.ODQuestionData("opendiscord:placeholder", option.placeholder),
        new index_1.api.ODQuestionData("opendiscord:length-enabled", option.length.enabled),
        new index_1.api.ODQuestionData("opendiscord:length-min", option.length.min),
        new index_1.api.ODQuestionData("opendiscord:length-max", option.length.max),
    ]);
};
exports.loadParagraphQuestion = loadParagraphQuestion;
