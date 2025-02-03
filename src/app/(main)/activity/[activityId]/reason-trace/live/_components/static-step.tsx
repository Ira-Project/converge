import React from 'react';
import FormattedText from '@/components/formatted-text';
import { ReasoningPathwayStepResult } from '@/lib/constants';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { TooltipArrow } from '@radix-ui/react-tooltip';

const getPathwayStepColor = (result: ReasoningPathwayStepResult): string => {
  switch (result) {
    case ReasoningPathwayStepResult.CORRECT:
      return '!bg-green-300';
    case ReasoningPathwayStepResult.WRONG:
      return '!bg-red-300';
    case ReasoningPathwayStepResult.WRONG_POSITION:
      return '!bg-yellow-300';
    case ReasoningPathwayStepResult.PENDING:
    default:
      return '';
  }
};

const StaticStep: React.FC<{ text: string; status: ReasoningPathwayStepResult }> = ({ text, status }) => (
  <div className={`
    min-h-[40px]
    flex
    items-center
    text-sm
    px-4 py-2 
    my-auto 
    rounded-3xl
    ${getPathwayStepColor(status)}
  `}>
    <Tooltip>
      <TooltipTrigger>
        <div className="mx-auto w-full text-center line-clamp-2">
          <FormattedText text={text ??''} />
        </div>
      </TooltipTrigger>
      <TooltipArrow />
      <TooltipContent className="bg-black bg-opacity-80 text-white text-xs p-2 rounded-md max-w-16">
        <div>
          <FormattedText text={text ??''} />
        </div>
      </TooltipContent>
    </Tooltip>
  </div>
);

export default StaticStep;
