import { QuestionStatusIndicator } from "./question-status-indicator";
import type { QuestionStatus } from "@/lib/constants";

interface QuestionCardProps {
  status: QuestionStatus;
  questionText: string;
  answerText: string;
}

export function QuestionCard({ status, questionText, answerText } : QuestionCardProps) {

  return (
    <div className="flex flex-row items-center gap-4">
      <QuestionStatusIndicator status={status} />
      <div className="flex flex-col w-full text-left gap-1">
        <p className="font-normal text-md"> {questionText} </p>
        <p className="text-muted-foreground text-sm"> Answer: {answerText} </p>
      </div>
    </div>
  );
}

