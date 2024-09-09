import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { QuestionCard } from "./question-card";
import { type QuestionStatus } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Separator } from "./ui/separator";
import { QuestionExplanation } from "./question-explanation";
import Image from "next/image";

interface QuestionAccordionProps {
  id: string;
  status: QuestionStatus;
  questionText: string;
  // answerText: string;
  workingText?: string;
  image?: string;
  questionImage?: string;
  workingComplete: boolean;
  computedAnswerText: string;
}

export function QuestionAccordionItem({ 
  id, 
  status, 
  questionText, 
  image,
  questionImage,
  // answerText, 
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
              // answerText={answerText} 
              questionImage={questionImage}
              computedAnswer={computedAnswerText} />
          </AccordionTrigger>
          <AccordionContent>
            <Separator className="my-4"/>
            <QuestionExplanation workingText={workingText} workingComplete={workingComplete} />
            {
              image && 
              <Image
                className="mt-2 mx-auto flex"
                width={150}
                height={150}
                src={`data:image/svg+xml;base64,${btoa(image)}`} 
                alt="Working SVG" />
            }
          </AccordionContent>
        </AccordionItem>
      </>
      :
        <AccordionItem value={id.toString()}>
          <QuestionCard 
            status={status} 
            questionText={questionText} 
            questionImage={questionImage}
            // answerText={answerText} 
            computedAnswer={computedAnswerText} />
        </AccordionItem>
      }
    </Card>
  );
}


