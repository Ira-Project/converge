'use client'

import { AnimatedSpinner } from "./icons";
import dynamic from 'next/dynamic';

const FormattedText = dynamic(() => import('./formatted-text'), { ssr: false });

interface QuestionExplanationProps {
  workingText: string;
  workingComplete: boolean;
}

export function QuestionExplanation({ workingComplete, workingText } : QuestionExplanationProps) {
  const workingTextList = workingText.split("\n");
  workingText = workingText.replace(/\n/g, "<br />");

  return (
    <>
      {
        workingTextList.map((line, index) => {
          return (
            <div key={index} className="flex flex-row gap-4">
              <FormattedText text={line} />
              {
                !workingComplete && 
                <div className="flex flex-row justify-center mt-2">
                  <AnimatedSpinner />
                </div>
              }
            </div>
          );
        })
      }
    </>
  );
}

