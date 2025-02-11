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
    if (data?.label && data.onLabelReturn) {
      data.onLabelReturn(id, data.label);
    }
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <motion.div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`
            relative
            px-4 
            py-2
            text-xs
            text-center
            max-w-24
            ${data?.label ? 'bg-white' : 'bg-gray-100'}
            rounded-md
          `}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            boxShadow: data?.label 
              ? '4px 4px 8px rgba(247, 232, 233, 100), -4px -4px 8px rgba(255, 255, 255, 100)'
              : '0px 2px 4px rgba(0, 0, 0, 25%) inset',
            border: data?.label ? 'none' : '1px solid #d9d9d9',
            width: '200px',
          }}
        >
          {data?.label && (
            <Button
              variant="ghost"
              onClick={handleReturn}
              className="absolute -top-2 -right-2 p-1 bg-fuchsia-200 rounded-full hover:bg-fuchsia-200 h-6 w-6"
            >
              <Cross1Icon className="w-2 h-2 text-muted-foreground" />
            </Button>
          )}
        </motion.div>
      </EdgeLabelRenderer>
    </>
  );
} 