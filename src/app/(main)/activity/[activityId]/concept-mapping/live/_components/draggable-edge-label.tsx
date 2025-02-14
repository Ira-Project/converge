import React from 'react';
import { motion } from 'framer-motion';
import FormattedText from '@/components/formatted-text';

interface DraggableEdgeLabelProps {
  label: string;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, label: string, index: number | null) => void;
}

const DraggableEdgeLabel: React.FC<DraggableEdgeLabelProps> = ({ label, onDragStart }) => (
  <motion.div
    className="px-4 py-2 my-auto text-muted-foreground cursor-move min-h-8 flex items-center justify-center"
    whileHover={{ scale: 1.02 }}
    whileDrag={{ scale: 1.05, opacity: 0.8 }}
    draggable
    onDragStartCapture={(e: React.DragEvent<HTMLDivElement>) => onDragStart(e, label, null)}
  >
    <div className="mx-auto text-center w-full">
      <FormattedText text={label} />
    </div>
  </motion.div>
);

export default DraggableEdgeLabel; 