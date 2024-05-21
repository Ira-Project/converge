import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { QuestionCard } from "./question-card";
import { type QuestionStatus } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Separator } from "./ui/separator";

interface QuestionAccordionProps {
  id: string;
  status: QuestionStatus;
  questionText: string;
  answerText: string;
  workingText?: string;
}

export function QuestionAccordionItem({ id, status, questionText, answerText, workingText } : QuestionAccordionProps) {

  return (
    <Card className="p-4 mb-4">
    {
      workingText ?
      <>
        <AccordionItem value={id.toString()}>
          <AccordionTrigger className="p-0 m-0">
            <QuestionCard status={status} questionText={questionText} answerText={answerText} />
          </AccordionTrigger>
          <AccordionContent>
            <Separator className="my-4"/>
            <p>
              {workingText}
            </p>
          </AccordionContent>
        </AccordionItem>
      </>
      :
        <AccordionItem value={id.toString()}>
          <QuestionCard status={status} questionText={questionText} answerText={answerText} />
        </AccordionItem>
      }
    </Card>
  );
}


