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
    label: string;
    onLabelDrop?: (edgeId: string, label: string) => void;
    onLabelReturn?: (edgeId: string, label: string) => void;
    onEdgeRemove?: (edgeId: string) => void;
  };
}

export default function InputEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
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
    data?.onLabelDrop?.(id, droppedItem.text);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleReturn = () => {
    if(data?.label && data.onLabelReturn) {
      data.onLabelReturn(id, data.label);
    }
  };

  const handleRemove = () => {
    if(data?.label) {
      handleReturn();
    }
    data?.onEdgeRemove?.(id);
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={`url(#${id}-arrow)`} />
      <defs> 
        <marker
          id={`${id}-arrow`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerUnits="strokeWidth"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
          className="fill-black"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <EdgeLabelRenderer>
        <motion.div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`
            relative
            text-xs
            text-center
            max-w-24
            pr-4
            ${data?.label ? '' : 'w-24 h-4' }
            ${data?.label ? 'bg-white' : 'bg-gray-100'}
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
          <p className="text-xs text-muted-foreground max-w-24 text-center bg-white">
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