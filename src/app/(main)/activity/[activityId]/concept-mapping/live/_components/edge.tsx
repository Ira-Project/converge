import { BaseEdge, EdgeLabelRenderer, getStraightPath } from '@xyflow/react';
 
export default function CustomEdge({ id, sourceX, sourceY, targetX, targetY, data }: { id: string, sourceX: number, sourceY: number, targetX: number, targetY: number, data: { label: string } }) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
 
  return (
    <>
      <BaseEdge 
        id={id} 
        path={edgePath} 
        className="stroke-2"
        markerEnd={`url(#${id}-arrow)`}
      />
      <EdgeLabelRenderer>
        <p 
          className="text-muted-foreground max-w-24 text-center bg-white" 
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
        >{data.label}</p>
      </EdgeLabelRenderer>
    </>
  );
}