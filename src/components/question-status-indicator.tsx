import { AnimatedSpinner } from "@/components/icons";
import { QuestionStatus } from "@/lib/constants";

export function QuestionStatusIndicator({ status } : { status: QuestionStatus }) {
  return (
    <>
      {
        status === QuestionStatus.UNANSWERED &&
          <div className="min-w-4 min-h-4 rounded-full bg-slate-200" /> 
      }
      {
        status === QuestionStatus.CORRECT && 
          <div className="min-w-4 min-h-4 rounded-full bg-green-400" />
      }
      {
        status === QuestionStatus.INCORRECT && 
          <div className="min-w-4 min-h-4 rounded-full bg-red-400" />
      }
      {
        status === QuestionStatus.LOADING && 
          <AnimatedSpinner className="w-4 h-4" />
      }
    </>
  )
};