import React from 'react';
import FormattedText from '@/components/formatted-text';
import { PathwayStepResult } from '@/server/api/routers/reasoning/reasoning.service';

const getPathwayStepColor = (result: PathwayStepResult): string => {
  switch (result) {
    case PathwayStepResult.CORRECT:
      return '!bg-green-100 !border-green-500';
    case PathwayStepResult.WRONG:
      return '!bg-red-100 !border-red-500';
    case PathwayStepResult.WRONG_POSITION:
      return '!bg-yellow-100 !border-yellow-500';
    case PathwayStepResult.PENDING:
    default:
      return '!bg-gray-50 !border-gray-300';
  }
};

const StaticStep: React.FC<{ text: string; status: PathwayStepResult }> = ({ text, status }) => (
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
