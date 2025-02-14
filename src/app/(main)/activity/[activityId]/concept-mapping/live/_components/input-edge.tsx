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

  return (
    <>
      <BaseEdge 
        id={id} 
        path={edgePath} 
        markerEnd={`url(#${id}-arrow)`} 
        style={{
          stroke: getArrowColor()
        }}
      />
      <EdgeLabelRenderer>
        <motion.div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`
            relative
            text-center
            max-w-24
            pr-4
            bg-white
            ${data?.label ? '' : 'w-24 h-4' }
            rounded-md
          `}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            boxShadow: data?.label ? 'none' : '0px 2px 4px rgba(0, 0, 0, 25%) inset',
            border: data?.label ? 'none' : '1px solid #d9d9d9',
          }}
        >
          <p className="text text-muted-foreground max-w-24 text-center bg-white">
            {data?.label}
          </p>
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