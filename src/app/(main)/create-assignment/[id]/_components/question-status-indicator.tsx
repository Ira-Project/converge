import { AnimatedSpinner } from "@/components/icons";
import { QuestionStatus } from "@/lib/constants";

export function QuestionStatusIndicator({ status } : { status: QuestionStatus }) {
  return (
    <>
      {
        status === QuestionStatus.UNANSWERED &&
          <div className="min-w-8 min-h-8 rounded-full bg-slate-500" /> 
      }
      {
        status === QuestionStatus.CORRECT && 
          <div className="min-w-8 min-h-8 rounded-full bg-green-600" />
      }
      {
        status === QuestionStatus.INCORRECT && 
          <div className="min-w-8 min-h-8 rounded-full bg-red-600" />
      }
      {
        status === QuestionStatus.LOADING && 
          <AnimatedSpinner className="w-8 h-8" />
      }
    </>
  )
};