import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { QuestionCard } from "./question-card";
import { type QuestionStatus } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Separator } from "./ui/separator";
import { QuestionExplanation } from "./question-explanation";

interface QuestionAccordionProps {
  id: string;
  status: QuestionStatus;
  questionText: string;
  answerText: string;
  workingText?: string;
  workingComplete: boolean;
  computedAnswerText: string;
}

export function QuestionAccordionItem({ 
  id, 
  status, 
  questionText, 
  answerText, 
  workingText, 
  computedAnswerText, 
  workingComplete 
} : QuestionAccordionProps) {

  return (
    <Card className="p-4 mb-4">
    {
      workingText ?
      <>
        <AccordionItem value={id.toString()}>
          <AccordionTrigger className="p-0 m-0">
            <QuestionCard 
              status={status} 
              questionText={questionText} 
              answerText={answerText} 
              computedAnswer={computedAnswerText} />
          </AccordionTrigger>
          <AccordionContent>
            <Separator className="my-4"/>
            <QuestionExplanation workingText={workingText} workingComplete={workingComplete} />
          </AccordionContent>
        </AccordionItem>
      </>
      :
        <AccordionItem value={id.toString()}>
          <QuestionCard 
            status={status} 
            questionText={questionText} 
            answerText={answerText} 
            computedAnswer={computedAnswerText} />
        </AccordionItem>
      }
    </Card>
  );
}


