import React from 'react';
import { motion } from 'framer-motion';
import FormattedText from '@/components/formatted-text';

interface DraggableStepProps {
  step: string;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, step: string, index: number | null) => void;
}

const DraggableStep: React.FC<DraggableStepProps> = ({ step, onDragStart }) => (
  <motion.div
    className="bg-rose-50 px-4 py-2 my-auto rounded-3xl text-sm cursor-move min-h-[40px]"
    whileHover={{ scale: 1.02 }}
    whileDrag={{ scale: 1.05, opacity: 0.8 }}
    style={{
      boxShadow: '4px 4px 8px rgba(247, 232, 233, 100), -4px -4px 8px rgba(255, 255, 255, 100)',
    }}
    draggable
    onDragStartCapture={(e: React.DragEvent<HTMLDivElement>) => onDragStart(e, step, null)}
  >
    <div className="mx-auto text-center w-full leading-8">
      <FormattedText text={step} />
    </div>
  </motion.div>
);

export default DraggableStep; 