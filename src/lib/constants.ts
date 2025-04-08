export const APP_TITLE = "Ira Project";
export const DATABASE_PREFIX = "ira_project";
export const EMAIL_SENDER = 'contact@iraproject.com';

export const LATEX_DELIMITER = "$!$";

export enum Paths {
  Login = "/login",
  Signup = "/signup",
  Onboarding = '/onboarding',
  VerifyEmail = "/verify-email",
  ResetPassword = "/reset-password",
  GoogleLogin = "/login/google",
  Classroom = "/",
  Activities = "/activities",
  Documentation = "/documentation",
  Leaderboard = "/leaderboard",
  Analytics = "/analytics",
  LearnByTeaching = "/learn-by-teaching/",
  ReasonTrace = "/reason-trace/",
  KnowledgeZap = "/knowledge-zap/",
  StepSolve = "/step-solve/",
  ReadAndRelay = "/read-and-relay/",
  ConceptMapping = "/concept-mapping/",
  CreateAssignment = "/create-assignment/",
  Activity = "/activity/",
  LiveActivity = "live",
}

export enum ComponentIds {
  CreateAssignment = "create-assignment",
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
        working: string,
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
  ConceptMapping = "Concept Mapping",
  // HumanVsAI = "Human vs AI",
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

export enum KnowledgeZapQuestionType {
  MULTIPLE_CHOICE = "multiple_choice",
  MATCHING = "matching",
  ORDERING = "ordering",
}

export enum SkillType {
  REMEMBERING = "Remembering",
  UNDERSTANDING = "Understanding",
  APPLYING = "Applying",
  ANALYZING = "Analyzing",
  EVALUATING = "Evaluating",
  CREATING = "Creating",
}

export const KNOWLEDGE_ZAP_ASSIGNMENT_SCORE = 10
export const REASONING_ASSIGNMENT_SCORE = 10
export const LEARN_BY_TEACHING_ASSIGNMENT_SCORE = 10
export const CONCEPT_MAPPING_ASSIGNMENT_SCORE = 10
export const STEP_SOLVE_ASSIGNMENT_SCORE = 10
export const READ_AND_RELAY_ASSIGNMENT_SCORE = 10