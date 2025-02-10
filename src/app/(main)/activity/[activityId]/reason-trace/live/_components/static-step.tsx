import React from 'react';
import FormattedText from '@/components/formatted-text';
import { ReasoningPathwayStepResult } from '@/lib/constants';

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
    min-h-[56px]
    flex
    items-center
    text-sm
    px-4 py-2 
    my-auto 
    rounded-3xl
    ${getPathwayStepColor(status)}
  `}>
    <div className="mx-auto w-full text-center line-clamp-2">
      <FormattedText text={text ??''} />
    </div>
  </div>
);

export default StaticStep;
