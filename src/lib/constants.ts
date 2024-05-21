export const APP_TITLE = "Ira Project";
export const DATABASE_PREFIX = "ira_project";
export const EMAIL_SENDER = 'contact@iraproject.com';

export enum Paths {
  Home = "/",
  Login = "/login",
  Signup = "/signup",
  VerifyEmail = "/verify-email",
  ResetPassword = "/reset-password",
  Classroom = "/classroom/",
  Assignment = "/assignment/",
  CreateAssignment = "/create-assignment/",
}

export enum Roles {
  Student = "student",
  Teacher = "teacher",
}

export enum QuestionStatus {
  CORRECT = "correct",
  INCORRECT = "incorrect",
  UNANSWERED = "unanswered",
  LOADING = "loading"
}

export type AssignmentState = {
  questions: QuestionState[];
  validNodeIds: string[];
}

export type QuestionState = {
  id: string;
  status: QuestionStatus;
  questionText: string;
  answerText: string
  working: string;
  workingComplete: boolean;
};

export enum AssignmentUpdateActionType {
  SET_LOADING = 'Set Loading',
  UPDATE_EXPLANATION = 'Update Explanation',
  UPDATE_STATUS = 'Update Question Status',
  UPDATE_EXPLANATION_AND_STATUS = 'Update Explanation and Status',
}

export type AssignmentUpdateActions = 
  | { 
      type: AssignmentUpdateActionType.SET_LOADING; 
    }
  | {
      type: AssignmentUpdateActionType.UPDATE_EXPLANATION;
      payload: { 
        explanation: string,
        questionId: string
        isLast: boolean 
      }
    }
  | {
      type: AssignmentUpdateActionType.UPDATE_STATUS;
      payload: { 
        questionId: string, 
        newStatus: QuestionStatus, 
      }
    }
  | {
    type: AssignmentUpdateActionType.UPDATE_EXPLANATION_AND_STATUS;
    payload: { 
      questionId: string, 
      newStatus: QuestionStatus, 
      explanation: string,
    }
  }