import { QuestionStatus } from "@/lib/constants";
import { type RouterOutputs } from "@/trpc/shared";

export type AttemptState = {
  conceptGraph: {
    graph: RouterOutputs["assignmentTemplate"]["get"]["conceptGraphs"],
    validNodes: string[],
    loading: boolean,
  };
  questions: QuestionState[];
}

export type QuestionState = {
  id: string;
  status: QuestionStatus;
  questionText: string;
  answerText: string
  working?: string;
  workingComplete?: boolean;
};

export enum ActionType {
  SET_LOADING = 'Set Loading',
  UPDATE_CONCEPT_GRAPH = 'Update Concept Graph',
  UPDATE_EXPLANATION = 'Update Explanation',
  UPDATE_STATUS = 'Update Question Status',
}

export type QuestionStatusActions = 
  | { 
      type: ActionType.SET_LOADING; 
    }
  | {
      type: ActionType.UPDATE_CONCEPT_GRAPH;
      payload: { 
        validNodes: string[] 
      }
    }
  | {
      type: ActionType.UPDATE_EXPLANATION;
      payload: { 
        explanation: string,
        questionId: string
        isLast: boolean 
      }
    }
  | {
      type: ActionType.UPDATE_STATUS;
      payload: { 
        questionId: string, 
        newStatus: QuestionStatus, 
      }
    }


export const questionReducer = (
  state: AttemptState,
  action: QuestionStatusActions
) => {
  switch (action.type) {

    case ActionType.SET_LOADING:
      const newQuestionState = state.questions.map((question) => {
        return {
          ...question,
          status: QuestionStatus.LOADING,
        };
      });

      return {
        questions: newQuestionState,
        conceptGraph: {
          ...state.conceptGraph,
          loading: true,
        },
      };

    case ActionType.UPDATE_CONCEPT_GRAPH:
      return {
        ...state,
        conceptGraph: {
          ...state.conceptGraph,
          validNodes: action.payload.validNodes,
          loading: false,
        },
      };

    case ActionType.UPDATE_EXPLANATION:
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
      
    case ActionType.UPDATE_STATUS:
      return {
        ...state,
        questions: state.questions.map((question) => {
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