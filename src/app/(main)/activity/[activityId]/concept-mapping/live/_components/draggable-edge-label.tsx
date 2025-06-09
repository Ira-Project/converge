import React from 'react';
import { motion } from 'framer-motion';
import FormattedText from '@/components/formatted-text';

interface DraggableEdgeLabelProps {
  label: string;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, label: string, index: number | null) => void;
  onSelect?: () => void;
  isSelected?: boolean;
  isMobile?: boolean;
}

const DraggableEdgeLabel: React.FC<DraggableEdgeLabelProps> = ({ 
  label, 
  onDragStart, 
  onSelect, 
  isSelected = false, 
  isMobile = false 
}) => {
  const handleInteraction = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isMobile && onSelect) {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <motion.div
      className={`px-3 py-2 md:px-4 md:py-2 my-auto min-h-10 md:min-h-8 flex items-center justify-center touch-manipulation transition-all ${
        isMobile 
          ? `cursor-pointer ${isSelected ? 'bg-blue-200 border-2 border-blue-500 text-blue-800 font-medium' : 'text-muted-foreground border-2 border-transparent'}` 
          : 'cursor-move text-muted-foreground'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      whileDrag={isMobile ? {} : { scale: 1.05, opacity: 0.8 }}
      draggable={!isMobile}
      onDragStartCapture={!isMobile ? (e: React.DragEvent<HTMLDivElement>) => onDragStart(e, label, null) : undefined}
      onClick={handleInteraction}
      onTouchEnd={handleInteraction}
    >
      <div className="mx-auto text-center w-full text-sm md:text-base">
        <FormattedText text={label} />
      </div>
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
      )}
    </motion.div>
  );
};

export default DraggableEdgeLabel; 