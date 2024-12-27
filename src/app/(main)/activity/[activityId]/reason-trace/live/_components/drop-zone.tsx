import React from 'react';
import { motion } from 'framer-motion';
import FormattedText from '@/components/formatted-text';
import { ReasoningPathwayStepResult } from '@/lib/constants';

export const getPathwayStepColor = (result: ReasoningPathwayStepResult): string => {
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
    variants={{
      idle: { border: "2px solid #e5e7eb", scale: 1 },
      hover: { border: "2px solid #9ca3af", scale: 1.02 }
    }}
    initial="idle"
    animate={isDragging ? "hover" : "idle"}
    className={`
      min-h-[60px]
      p-3
      rounded-lg
      border-2
      border-dashed
      transition-all
      flex
      items-center
      text-sm
      ${getPathwayStepColor(status)}
      ${isDragging ? 'border-gray-400 bg-gray-100' : 'border-gray-300'}
      ${step 
        ? 'bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_6px_rgba(0,0,0,0.05)] translate-y-[-1px]' 
        : 'bg-gray-50 shadow-inner'
      }
      hover:border-gray-400
      cursor-pointer
      relative
      before:absolute
      before:inset-0
      before:rounded-lg
      ${!step && 'before:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'}
    `}
    onDragOver={onDragOver}
    onDrop={(e) => onDrop(e, index)}
    draggable={!!step}
    onDragStartCapture={(e: React.DragEvent<HTMLDivElement>) => step && onDragStart(e, step, index)}
  >
    <FormattedText text={step?.text ??''} />
  </motion.div>
);

export default DropZone; 