import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  Controls,
  Background,
  BackgroundVariant,
  type Position,
} from '@xyflow/react';
 
import '@xyflow/react/dist/style.css';
import StaticNode from './static-node';
import InputNode from './input-node';
import CustomEdge from './edge';
import InputEdge from './input-edge';
import { initialEdges } from './data';
import { initialNodes } from './data';


export const enum NodeType {
  DropZone = 'dropZone',
  Static = 'static',
}

const edgeTypes = {
  'custom-edge': CustomEdge,
  'input-edge': InputEdge
}

interface ConceptMapProps {
  onStepUse: (step: string) => void;
  onStepReturn: (step: string) => void;
}

export default function ConceptMap({ onStepUse, onStepReturn }: ConceptMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleDrop = useCallback((nodeId: string, label: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label,
            },
          };
        }
        return node;
      })
    );
    onStepUse(label);
  }, [setNodes, onStepUse]);

  const handleReturn = useCallback((nodeId: string, label: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label: '',
            },
          };
        }
        return node;
      })
    );
    onStepReturn(label);
  }, [setNodes, onStepReturn]);

  const handleEdgeLabelDrop = useCallback((edgeId: string, label: string) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            data: {
              ...edge.data,
              label,
              onLabelDrop: handleEdgeLabelDrop,
              onLabelReturn: handleEdgeLabelReturn,
              onEdgeRemove: handleEdgeRemove,
            },
          };
        }
        return edge;
      })
    );
    onStepUse(label);
  }, [setEdges, onStepUse]);

  const handleEdgeLabelReturn = useCallback((edgeId: string, label: string) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            data: {
              ...edge.data,
              label: '',
              onLabelDrop: handleEdgeLabelDrop,
              onLabelReturn: handleEdgeLabelReturn,
            },
          };
        }
        return edge;
      })
    );
    onStepReturn(label);
  }, [setEdges, onStepReturn]);

  const handleEdgeRemove = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  }, [setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params, 
        type: "input-edge",
        data: {
          label: '',
          onLabelDrop: handleEdgeLabelDrop,
          onLabelReturn: handleEdgeLabelReturn,
          onEdgeRemove: handleEdgeRemove,
        },
      }
      setEdges((eds) => addEdge(edge, eds) as { id: string; type: string; source: string; target: string; data: { label: string } }[]);
    },
    [setEdges, handleEdgeLabelDrop, handleEdgeLabelReturn, handleEdgeRemove],
  );

  const nodeTypes = useMemo(() => ({
    dropZone: (props: React.JSX.IntrinsicAttributes & {
      id: string;
      data: {
        label: string;
        handles: { type: string; id: string; position: Position; }[];
      };
    }) => <InputNode {...props} 
      data={{ ...props.data}}
      onDrop={handleDrop}
      onReturn={handleReturn}/>,
    static: StaticNode,
  }), [handleDrop, handleReturn]);
 
  return (
    <div className="w-[60vw] h-[40vh] mx-auto my-auto">
      <ReactFlow
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        deleteKeyCode={null}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
      {/* Answer Section */}
    </div>
  );
}