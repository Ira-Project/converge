import React from 'react';
import FormattedText from '@/components/formatted-text';
import { ReasoningPathwayStepResult } from '@/lib/constants';

const getPathwayStepColor = (result: ReasoningPathwayStepResult): string => {
  switch (result) {
    case ReasoningPathwayStepResult.CORRECT:
      return '!bg-green-100 !border-green-500';
    case ReasoningPathwayStepResult.WRONG:
      return '!bg-red-100 !border-red-500';
    case ReasoningPathwayStepResult.WRONG_POSITION:
      return '!bg-yellow-100 !border-yellow-500';
    case ReasoningPathwayStepResult.PENDING:
    default:
      return '!bg-gray-50 !border-gray-300';
  }
};

const StaticStep: React.FC<{ text: string; status: ReasoningPathwayStepResult }> = ({ text, status }) => (
  <div className={`
    min-h-[60px]
    p-3
    rounded-lg
    flex
    items-center
    text-sm
    ${getPathwayStepColor(status)}
  `}>
    <FormattedText text={text ?? ''} />
  </div>
);

export default StaticStep;
