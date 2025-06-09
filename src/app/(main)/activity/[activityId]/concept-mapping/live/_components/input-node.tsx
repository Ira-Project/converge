import FormattedText from '@/components/formatted-text';
import { Cross1Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { type HandleType, type Position } from '@xyflow/react';
import { Handle } from '@xyflow/react';
import { motion } from 'framer-motion';

export default function InputNode({ data, id, onDrop, onReturn, onPlace, isMobile, selectedItem }: { 
  data: { 
    label: string, 
    handles: { type: string, id: string, position: Position }[], 
    status: 'correct' | 'incorrect' | null
  },
  onDrop?: (id: string, text: string) => void,
  onReturn?: (id: string, text: string) => void,
  onPlace?: (id: string) => void,
  isMobile?: boolean,
  selectedItem?: { id: string; text: string; type: 'node' | 'edge' } | null,
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

  const handleMobilePlace = (e: React.MouseEvent | React.TouchEvent) => {
    if (isMobile && selectedItem && selectedItem.type === 'node' && !data.label && onPlace) {
      e.preventDefault();
      e.stopPropagation();
      onPlace(id);
    }
  };
  
  const getStatusStyles = () => {
    if (!data.label) {
      const canPlace = isMobile && selectedItem && selectedItem.type === 'node';
      return canPlace ? 'bg-blue-100 border-blue-300 border-2' : 'bg-fuchsia-100';
    }
    switch (data.status) {
      case 'correct':
        return 'bg-green-50 border-green-200';
      case 'incorrect':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-fuchsia-50';
    }
  };

  const canPlace = isMobile && selectedItem && selectedItem.type === 'node' && !data.label;

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
          h-10 
          flex 
          items-center 
          justify-center
          w-48
          ${getStatusStyles()}
          ${canPlace ? 'cursor-pointer' : ''}
          transition-all
        `}
        style={{
          boxShadow: data.label 
            ? '4px 4px 8px rgba(247, 232, 233, 100), -4px -4px 8px rgba(255, 255, 255, 100)'
            : canPlace 
              ? '0 0 0 2px rgba(59, 130, 246, 0.5)'
              : '0px 2px 4px rgba(0, 0, 0, 25%) inset',
          border: data.label ? 'none' : canPlace ? '2px solid #3b82f6' : '1px solid #d9d9d9',
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleMobilePlace}
        onTouchEnd={handleMobilePlace}
        whileTap={canPlace ? { scale: 0.95 } : {}}
      >
        <div className="mx-auto text-center w-full line-clamp-2">
          {!data.label && canPlace ? (
            <span className="text-blue-600 text-sm font-medium">
              Tap to place "{selectedItem?.text}"
            </span>
          ) : (
            <FormattedText text={data.label} />
          )}
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