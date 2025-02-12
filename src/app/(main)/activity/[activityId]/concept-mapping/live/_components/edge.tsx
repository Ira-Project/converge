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
        <p 
          className="text-xs text-muted-foreground max-w-24 text-center bg-white" 
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