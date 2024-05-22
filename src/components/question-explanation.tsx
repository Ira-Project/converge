import { AnimatedSpinner } from "./icons";
import Image from "next/image";

interface QuestionExplanationProps {
  workingText: string;
  workingComplete: boolean;
}

export function QuestionExplanation({ workingComplete, workingText } : QuestionExplanationProps) {

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
      <p>
        {workingText}
        {
          !workingComplete && 
          <div className="flex flex-row justify-center mt-2">
            <AnimatedSpinner />
          </div>
        }
      </p>
    </div>
  );
}

