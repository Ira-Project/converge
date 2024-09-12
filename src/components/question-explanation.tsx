'use client'

import { AnimatedSpinner } from "./icons";
import dynamic from 'next/dynamic';

const FormattedText = dynamic(() => import('./formatted-text'), { ssr: false });

interface QuestionExplanationProps {
  workingText: string;
  workingComplete: boolean;
}

export function QuestionExplanation({ workingComplete, workingText } : QuestionExplanationProps) {
  workingText = workingText.replace(/\n/g, "<br />");

  return (
    <div className="flex flex-row gap-4">
      {/* <Image
        unoptimized
        src={"https://source.boringavatars.com/marble/60/Ira"}
        alt="Avatar"
        className="block h-8 w-8 rounded-full leading-none"
        width={64}
        height={64}
      /> */}
        <div>
          <FormattedText text={workingText} />
          {
            !workingComplete && 
            <div className="flex flex-row justify-center mt-2">
              <AnimatedSpinner />
            </div>
          }
        </div>
      </div>
  );
}

