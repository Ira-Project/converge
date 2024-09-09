import { QuestionStatusIndicator } from "./question-status-indicator";
import { QuestionStatus } from "@/lib/constants";
import Image from 'next/image'

interface QuestionCardProps {
  status: QuestionStatus;
  questionText: string;
  // answerText: string;
  computedAnswer: string;
  questionImage?: string;
}

const UNANSWERED_COMPUTED_ANSWER_TEXT = "N/A"
const LOADING_COMPUTED_ANSWER_TEXT = "Pending"
const COULD_NOT_COMPUTE_ANSWER_TEXT = "Could not compute"

function getComputedAnswerText(computedAnswer:string, status: QuestionStatus) {
  if(computedAnswer !== "") {
    const computedAnswerNumber = parseFloat(computedAnswer)
    if(!isNaN(computedAnswerNumber)) {
      return parseFloat(computedAnswerNumber.toFixed(4))
    }
    return computedAnswer
  }

  if(status === QuestionStatus.CORRECT || status === QuestionStatus.INCORRECT) {
    return COULD_NOT_COMPUTE_ANSWER_TEXT
  } 

  if(status === QuestionStatus.LOADING) {
    return LOADING_COMPUTED_ANSWER_TEXT
  }

  return UNANSWERED_COMPUTED_ANSWER_TEXT

}


export function QuestionCard({ status, questionText, computedAnswer, questionImage } : QuestionCardProps) {

  return (
    <div className="flex flex-row items-center gap-4 w-full">
      <QuestionStatusIndicator status={status} />
      <div className="flex flex-col w-full text-left gap-1">
        <p className="font-normal text-md"> {questionText} </p>
        {
          questionImage && 
          <Image
            alt="Question Image"
            width={500}
            height={150}
            src={questionImage} />
        }
        <div className="flex flex-row w-full text-muted-foreground text-sm">
          <p className=""> 
            Ira's Answer: {getComputedAnswerText(computedAnswer, status)} 
          </p>
        </div>
      </div>
    </div>
  );
}

