import FormattedText from '@/components/formatted-text';
import { type HandleType, type Position } from '@xyflow/react';
import { Handle } from '@xyflow/react';
import { motion } from 'framer-motion';
 
 
export default function StaticNode({ data }: { data: { label: string, handles: { type: string, id: string, position: Position }[] } }) {
  
  return (
    <>
      <motion.div
      className="bg-fuchsia-50 px-4 py-2 my-auto rounded-3xl text-sm cursor-move min-h-8 flex items-center justify-center"
      style={{
        boxShadow: '4px 4px 8px rgba(247, 232, 233, 100), -4px -4px 8px rgba(255, 255, 255, 100)',
      }}
      draggable={false}
    >
      <div className="mx-auto text-center w-full">
        <FormattedText text={data.label} />
      </div>
      {data.handles.map((handle) => (
        <Handle
          style={{
            "background": "#e879f9"
          }}
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