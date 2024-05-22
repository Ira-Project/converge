import { type AssignmentState, QuestionStatus } from "@/lib/constants";
import { type AssignmentUpdateActions, AssignmentUpdateActionType  } from "@/lib/constants";

export const questionReducer = (
  state: AssignmentState,
  action: AssignmentUpdateActions
) => {
  switch (action.type) {

    case AssignmentUpdateActionType.SET_LOADING:
      const newQuestions = state.questions.map((question) => {
        return {
          ...question,
          status: QuestionStatus.LOADING,
          working: '',
          computedAnswerText: "",
          workingComplete: false,
        };
      });
      return {
        ...state,
        questions: newQuestions,

      }

    case AssignmentUpdateActionType.UPDATE_EXPLANATION:
      return {
        ...state,
        questions: state.questions.map((question) => {
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
      
    case AssignmentUpdateActionType.UPDATE_STATUS:
      return {
        ...state,
        questions: state.questions.map((question) => {
          if (question.id === action.payload.questionId) {
            return {
              ...question,
              status: action.payload.newStatus,
              computedAnswerText: action.payload.computedAnswer ?? ""
            };
          }
          return question;
        }),
      };

    case AssignmentUpdateActionType.UPDATE_EXPLANATION_AND_STATUS:
      return {
        ...state,
        questions: state.questions.map((question) => {
          if (question.id == action.payload.questionId) {
            return {
              ...question,
              status: action.payload.newStatus,
              working: question.working + action.payload.explanation,
              computedAnswerText: action.payload.computedAnswer ?? "",
              workingComplete: true,
            };
          }
          return question;
        }),
      };

    case AssignmentUpdateActionType.UPDATE_VALID_NODES:
      return {
        ...state,
        validNodeIds: action.payload.validNodeIds,
      };
    
    default:
      return state;
  }
}