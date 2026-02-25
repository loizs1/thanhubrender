import { api } from "../../index";
export declare const loadAllQuestions: () => Promise<void>;
export declare const loadShortQuestion: (option: api.ODJsonConfig_DefaultShortQuestionType) => api.ODShortQuestion;
export declare const loadParagraphQuestion: (option: api.ODJsonConfig_DefaultParagraphQuestionType) => api.ODParagraphQuestion;
