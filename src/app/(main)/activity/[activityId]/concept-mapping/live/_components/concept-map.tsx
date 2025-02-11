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
  Position,
} from '@xyflow/react';
 
import '@xyflow/react/dist/style.css';
import StaticNode from './static-node';
import InputNode from './input-node';
import CustomEdge from './edge';
import InputEdge from './input-edge';


export const enum NodeType {
  DropZone = 'dropZone',
  Static = 'static',
}

const edgeTypes = {
  'custom-edge': CustomEdge,
  'input-edge': InputEdge
}


const initialNodes = [
  { id: '1', position: { x: 13, y: 20 }, data: { label: '', handles: [
    {
      type: 'source',
      id: '1a',
      position: Position.Bottom,
    },
    {
      type: 'target',
      id: '1b',
      position: Position.Bottom,
    },
    {
      type: 'target',
      id: '1c',
      position: Position.Right,
    },
    {
      type: 'source',
      id: '1d',
      position: Position.Right,
    },
  ] }, type: NodeType.DropZone },
  { id: '2', position: { x: 703, y: 10 }, data: { label: 'Power', handles: [
    {
      type: 'source',
      id: '2a',
      position: Position.Bottom,
    },
    {
      type: 'target',
      id: '2b',
      position: Position.Bottom,
    },
  ] }, type: NodeType.Static },
  { id: '3', position: { x: 380, y: 50 }, data: { label: '', handles: [
    {
      type: 'source',
      id: '3a',
      position: Position.Bottom,
    },
    {
      type: 'target',
      id: '3b',
      position: Position.Bottom,
    },
    {
      type: 'source',
      id: '3c',
      position: Position.Bottom,
    },
  ] }, type: NodeType.DropZone },
  { id: '4', position: { x: 7, y: 162 }, data: { label: 'Joules', handles: [
    {
      type: 'source',
      id: '4a',
      position: Position.Top,
    },
    {
      type: 'source',
      id: '4b',
      position: Position.Bottom,
    },
    {
      type: 'target',
      id: '4c',
      position: Position.Bottom,
    },
    {
      type: 'source',
      id: '4d',
      position: Position.Bottom,
    },
  ] }, type: NodeType.Static },
  { id: '5', position: { x: 370, y: 200 }, data: { label: 'Energy', handles: [
    {
      type: 'source',
      id: '5a',
      position: Position.Top,
    },
    {
      type: 'target',
      id: '5b',
      position: Position.Bottom,
    },
    {
      type: 'source',
      id: '5c',
      position: Position.Bottom,
    },
  ] }, type: NodeType.Static },
  { id: '6', position: { x: 715, y: 180 }, data: { label: 'Force', handles: [
    {
      type: 'source',
      id: '6a',
      position: Position.Top,
    },
    {
      type: 'source',
      id: '6b',
      position: Position.Bottom,
    },
    {
      type: 'target',
      id: '6c',
      position: Position.Top,
    },
    {
      type: 'target',
      id: '6d',
      position: Position.Bottom,
    },
    
  ] }, type: NodeType.Static },
  { id: '8', position: { x: 461, y: 386 }, data: { label: '', handles: [
    {
      type: 'source',
      id: '8a',
      position: Position.Top,
    },
    {
      type: 'target',
      id: '8b',
      position: Position.Top,
    },
  ] }, type: NodeType.DropZone },
  { id: '9', position: { x: 720, y: 317 }, data: { label: '', handles: [
    {
      type: 'source',
      id: '9a',
      position: Position.Top,
    },
    {
      type: 'target',
      id: '9b',
      position: Position.Top,
    },
  ] }, type: NodeType.DropZone },
  { id: '10', position: { x: 88, y: 415 }, data: { label: '= mgΔh', handles: [
    {
      type: 'source',
      id: '10a',
      position: Position.Top,
    },
    {
      type: 'target',
      id: '10b',
      position: Position.Top,
    },
  ] }, type: NodeType.Static },
  { id: '7', position: { x: 50, y: 296 }, data: { label: 'Kinetic Energy', handles: [
    {
      type: 'source',
      id: '7a',
      position: Position.Top,
    },
    {
      type: 'target',
      id: '7b',
      position: Position.Top,
    },
  ] }, type: NodeType.Static },
];
const initialEdges = [
  { id: 'e4-1', type: "custom-edge", source: '4', target: '1', data: { label: 'Usually measured in food with this unit' }, targetHandle: "1b" },
  { id: 'e3-4', type: "custom-edge", source: '3', target: '4', data: { label: 'SI Unit is' } },
  { id: 'e5-3', type: "custom-edge", source: '5', target: '3', data: { label: 'the ability to do' } },
  { id: 'e3-6', type: "custom-edge", source: '3', target: '6', data: { label: 'is done when' } },
  { id: 'e6-2', type: "custom-edge", source: '6', target: '2', data: { label: 'x Constant Velocity =' } },
  { id: 'e6-9', type: "custom-edge", source: '6', target: '9', data: { label: 'acts through' }, sourceHandle: "6b" },
  { id: 'e5-7', type: "custom-edge", source: '5', target: '7', data: { label: 'can be of type' }, sourceHandle: "5c",  },
  { id: 'e5-8', type: "custom-edge", source: '5', target: '8', data: { label: 'can be of type' }, sourceHandle: "5c",},
];

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

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params, 
        type: "input-edge",
        data: {
          label: '',
          onLabelDrop: handleEdgeLabelDrop,
          onLabelReturn: handleEdgeLabelReturn,
        },
      }
      setEdges((eds) => addEdge(edge, eds) as { id: string; type: string; source: string; target: string; data: { label: string } }[]);
    },
    [setEdges, handleEdgeLabelDrop, handleEdgeLabelReturn],
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