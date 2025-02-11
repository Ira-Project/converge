import FormattedText from '@/components/formatted-text';
import { Cross1Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { type HandleType, type Position } from '@xyflow/react';
import { Handle } from '@xyflow/react';
import { motion } from 'framer-motion';

export default function InputNode({ data, id, onDrop, onReturn }: { 
  data: { 
    label: string, 
    handles: { type: string, id: string, position: Position }[], 
  },
  onDrop?: (id: string, text: string) => void,
  onReturn?: (id: string, text: string) => void,
  id: string 
}) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedItem = JSON.parse(e.dataTransfer.getData('text/plain')) as { id: string, text: string };
    if (onDrop) {
      onDrop(id, droppedItem.text);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleReturn = () => {
    if (onReturn && data.label) {
      onReturn(id, data.label);
    }
  };
  
  return (
    <>
      <motion.div
        initial="idle"
        className={`
          relative
          px-4 
          py-2 
          my-auto 
          rounded-3xl 
          text-sm
          min-h-8 
          flex 
          items-center 
          justify-center
          ${data.label ? 'bg-fuchsia-50 cursor-move' : 'bg-fuchsia-100 cursor-pointer'}
        `}
        style={{
          boxShadow: data.label 
            ? '4px 4px 8px rgba(247, 232, 233, 100), -4px -4px 8px rgba(255, 255, 255, 100)'
            : '0px 2px 4px rgba(0, 0, 0, 25%) inset',
          border: data.label ? 'none' : '1px solid #d9d9d9',
          width: '200px',
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="mx-auto text-center w-full line-clamp-2">
          <FormattedText text={data.label} />
        </div>
        {data.label && (
          <Button
            variant="ghost"
            onClick={handleReturn}
            className="absolute -top-2 -right-2 p-1 bg-fuchsia-200 rounded-full hover:bg-fuchsia-200 h-6 w-6"
          >
            <Cross1Icon className="w-2 h-2 text-muted-foreground" />
          </Button>
        )}
        {data.handles.map((handle) => (
          <Handle
            key={handle.id}
            type={handle.type as HandleType}
            position={handle.position}
            id={handle.id}
            isConnectable={true}
          />
        ))}
      </motion.div>
    </>
  );
}