import { BaseEdge, EdgeLabelRenderer, getStraightPath } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Cross1Icon } from '@/components/icons';
import { motion } from 'framer-motion';

interface InputEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  data?: {
    idForStatus: string;
    label: string;
    status: 'correct' | 'incorrect' | null;
  };
  onLabelDrop: (edgeId: string, label: string) => void;
  onLabelReturn: (edgeId: string, label: string) => void;
  onEdgeRemove: (edgeId: string) => void;
  onPlace?: (edgeId: string) => void;
  isMobile?: boolean;
  selectedItem?: { id: string; text: string; type: 'node' | 'edge' } | null;
}

export default function InputEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  onLabelDrop,
  onLabelReturn,
  onEdgeRemove,
  onPlace,
  isMobile,
  selectedItem,
}: InputEdgeProps) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedItem = JSON.parse(e.dataTransfer.getData('text/plain')) as { id: string; text: string };
    onLabelDrop(id, droppedItem.text);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleReturn = () => {
    if(data?.label && onLabelReturn) {
      onLabelReturn(id, data.label);
    }
  };

  const handleRemove = () => {
    if(data?.label) {
      handleReturn();
    }
    onEdgeRemove(id);
  };

  const handleMobilePlace = (e: React.MouseEvent | React.TouchEvent) => {
    if (isMobile && selectedItem && selectedItem.type === 'edge' && !data?.label && onPlace) {
      e.preventDefault();
      e.stopPropagation();
      onPlace(id);
    }
  };

  const getArrowColor = () => {
    if (!data?.label) return '#d9d9d9';
    switch (data.status) {
      case 'correct':
        return "green"
      case 'incorrect':
        return "red"
      default:
        return "#d9d9d9"
    }
  };

  const canPlace = isMobile && selectedItem && selectedItem.type === 'edge' && !data?.label;

  return (
    <>
      <BaseEdge 
        id={id} 
        path={edgePath} 
        markerEnd={`url(#${id}-arrow)`} 
        style={{
          stroke: canPlace ? '#3b82f6' : getArrowColor(),
          strokeWidth: canPlace ? 3 : 1,
        }}
      />
      <EdgeLabelRenderer>
        <motion.div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleMobilePlace}
          onTouchEnd={handleMobilePlace}
          className={`
            relative
            text-center
            max-w-24
            pr-4
            bg-white
            ${data?.label ? '' : 'w-24 h-4' }
            ${canPlace ? 'cursor-pointer' : ''}
            rounded-md
            transition-all
          `}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            boxShadow: data?.label 
              ? 'none' 
              : canPlace 
                ? '0 0 0 2px rgba(59, 130, 246, 0.5)' 
                : '0px 2px 4px rgba(0, 0, 0, 25%) inset',
            border: data?.label 
              ? 'none' 
              : canPlace 
                ? '2px solid #3b82f6' 
                : '1px solid #d9d9d9',
            backgroundColor: canPlace ? '#dbeafe' : 'white',
          }}
          whileTap={canPlace ? { scale: 0.95 } : {}}
        >
          {!data?.label && !canPlace && (
            <p className="text text-muted-foreground max-w-24 text-center bg-white">
              {data?.label}
            </p>
          )}
          <Button
            variant="ghost"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 p-1 bg-white border border-gray-200 rounded-full hover:bg-grey-200 h-6 w-6"
          >
            <Cross1Icon className="w-2 h-2 text-muted-foreground" />
          </Button>
        </motion.div>
      </EdgeLabelRenderer>
    </>
  );
} 