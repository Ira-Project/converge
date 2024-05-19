export const APP_TITLE = "Ira Project";
export const DATABASE_PREFIX = "ira_project";
export const EMAIL_SENDER = 'contact@iraproject.com';

export enum Paths {
  Home = "/",
  Login = "/login",
  Signup = "/signup",
  VerifyEmail = "/verify-email",
  ResetPassword = "/reset-password",
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