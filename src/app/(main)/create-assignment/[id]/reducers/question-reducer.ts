import { QuestionStatus } from "@/lib/constants";
import { type QuestionState, type QuestionsUpdateActions, QuestionsUpdateActionType  } from "@/lib/constants";


export const questionReducer = (
  state: QuestionState[],
  action: QuestionsUpdateActions
) => {
  switch (action.type) {

    case QuestionsUpdateActionType.SET_LOADING:
      return state.map((question) => {
        return {
          ...question,
          status: QuestionStatus.LOADING,
          working: '',
          workingComplete: false,
        };
      });

    case QuestionsUpdateActionType.UPDATE_EXPLANATION:
      return {
        ...state.map((question) => {
          if (question.id === action.payload.questionId) {
            return {
              ...question,
              working: question.working + action.payload.explanation,
              workingComplete: action.payload.isLast,
            };
          }
          return question;
        }),
      };
      
    case QuestionsUpdateActionType.UPDATE_STATUS:
      return {
        ...state.map((question) => {
          if (question.id === action.payload.questionId) {
            return {
              ...question,
              status: action.payload.newStatus,
            };
          }
          return question;
        }),
      };
    
    default:
      return state;
  }
}