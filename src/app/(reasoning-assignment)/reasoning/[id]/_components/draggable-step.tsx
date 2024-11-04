import React from 'react';
import { motion } from 'framer-motion';
import FormattedText from '@/components/formatted-text';

interface DraggableStepProps {
  step: string;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, step: string, index: number | null) => void;
}

const DraggableStep: React.FC<DraggableStepProps> = ({ step, onDragStart }) => (
  <motion.div
    className="bg-white p-3 rounded-lg shadow-md cursor-move border border-gray-200
              transform transition-transform hover:translate-y-[-2px]
              relative before:absolute before:inset-x-0 before:bottom-0 before:h-1 before:bg-gray-100 before:rounded-b-lg"
    whileHover={{ scale: 1.02 }}
    whileDrag={{ scale: 1.05, opacity: 0.8 }}
    style={{
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }}
    draggable
    onDragStartCapture={(e: React.DragEvent<HTMLDivElement>) => onDragStart(e, step, null)}
  >
    <FormattedText text={step} />
  </motion.div>
);

export default DraggableStep; 