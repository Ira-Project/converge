export const APP_TITLE = "Ira Project";
export const DATABASE_PREFIX = "ira_project";
export const EMAIL_SENDER = 'contact@iraproject.com';

export const LATEX_DELIMITER = "$!$";

export enum Paths {
  Home = "/",
  Login = "/login",
  Signup = "/signup",
  Onboarding = '/onboarding',
  VerifyEmail = "/verify-email",
  ResetPassword = "/reset-password",
  GoogleLogin = "/login/google",
  Classroom = "/classroom/",
  LearnByTeaching = "/learn-by-teaching/",
  ReasoningPathway = "/reasoning-pathway/",
  CreateAssignment = "/create-assignment/",
  CreateClassroom = "/create-classroom/",
  JoinClassroom = "/join-classroom/",
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
  image: string;
  imageHeight?: number;
  imageWidth?: number;
  questionImage?: string | null;
  // answerText: string
  computedAnswerText: string;
  working: string;
  workingComplete: boolean;
};

export enum AssignmentUpdateActionType {
  SET_LOADING = 'Set Loading',
  UPDATE_EXPLANATION = 'Update Explanation',
  UPDATE_STATUS = 'Update Question Status',
  UPDATE_EXPLANATION_AND_STATUS = 'Update Explanation and Status',
  UPDATE_VALID_NODES = 'Update Valid Nodes',
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
        computedAnswer?: string,
        isLast: boolean
      }
    }
  | {
      type: AssignmentUpdateActionType.UPDATE_EXPLANATION_AND_STATUS;
      payload: { 
        questionId: string, 
        newStatus: QuestionStatus, 
        explanation: string,
        computedAnswer?: string,
        image?: string,
        imageWidth?: number,
        imageHeight?: number,
      }
    }
  | {
      type: AssignmentUpdateActionType.UPDATE_VALID_NODES;
      payload: { 
        validNodeIds: string[],
      }
    }

export enum ConceptStatus {
  CORRECT = "Yes",
  INCORRECT = "No",
  NOT_PRESENT = "Unknown"
}

export enum ReasoningPathwayStepResult {
  CORRECT = "correct",
  WRONG = "wrong",
  WRONG_POSITION = "wrong_position",
  PENDING = "pending"
}

export enum ActivityType {
  LearnByTeaching = "Learn By Teaching",
  ReasonTrace = "Reason Trace",
  ReadAndRelay = "Read and Relay",
  KnowledgeZap = "Knowledge Zap",
  StepSolve = "Step Solve",
  HumanVsAI = "Human vs AI",
}

export const GradesOptions = [
  {
    value: "9",
    label: "9",
    locked: true,
  },
  {
    value: "10",
    label: "10",
    locked: true,
  },
  {
    value: "11",
    label: "11",
    locked: false,
  },
  {
    value: "12",
    label: "12",
    locked: false,
  },
]