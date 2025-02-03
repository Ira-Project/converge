import React from 'react';
import { motion } from 'framer-motion';
import FormattedText from '@/components/formatted-text';
import { ReasoningPathwayStepResult } from '@/lib/constants';
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip';
import { TooltipContent } from '@radix-ui/react-tooltip';

export const getPathwayStepColor = (result: ReasoningPathwayStepResult, step: Step | null): string => {
  if (!step) {
    return '!bg-rose-100';
  }
  
  switch (result) {
    case ReasoningPathwayStepResult.CORRECT:
      return '!bg-green-300';
    case ReasoningPathwayStepResult.WRONG:
      return '!bg-red-300';
    case ReasoningPathwayStepResult.WRONG_POSITION:
      return '!bg-yellow-200';
    case ReasoningPathwayStepResult.PENDING:
    default:
      return '!bg-rose-50';
      
  }
};

// Add new interface for step structure
interface Step {
  id: string;
  text: string;
}

interface DropZoneProps {
  index: number;
  step: Step | null;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, step: Step | null, index: number) => void;
  status: ReasoningPathwayStepResult;
}

const DropZone: React.FC<DropZoneProps> = ({
  index,
  step,
  isDragging,
  onDragOver,
  onDrop,
  onDragStart,
  status,
}) => (
  <motion.div
    initial="idle"
    animate={isDragging ? "hover" : "idle"}
    className={`
      h-14
      px-3
      py-2
      rounded-3xl
      transition-all
      flex
      items-center
      text-sm
      ${getPathwayStepColor(status, step)}
      ${isDragging ? 'border-gray-400 bg-gray-100' : 'border-gray-300'}
      hover:border-gray-400
      cursor-pointer
      relative
      before:absolute
      before:inset-0
      before:rounded-lg
    `}
    style={
      step ?
      {
        boxShadow: '4px 4px 8px rgba(247, 232, 233, 100), -4px -4px 8px rgba(255, 255, 255, 100)',
      }
      : status === ReasoningPathwayStepResult.PENDING
      ? {
        border: '1px solid #d9d9d9',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 25%) inset',
      }
      : {}
    }
    onDragOver={onDragOver}
    onDrop={(e) => onDrop(e, index)}
    draggable={!!step}
    onDragStartCapture={(e: React.DragEvent<HTMLDivElement>) => step && onDragStart(e, step, index)}
  >
    <div className="mx-auto w-full text-center line-clamp-2">
      <FormattedText text={step?.text ??''} />
    </div>
  </motion.div>
);

export default DropZone; 