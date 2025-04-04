import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
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
import { generateId } from 'lucia/dist/crypto';
import { api } from '@/trpc/react';
import DraggableEdgeLabel from './draggable-edge-label';
import DraggableStep from './draggable-step';
import { LoadingButton } from '@/components/loading-button';

import Image from 'next/image';
import posthog from 'posthog-js';


export const enum NodeType {
  DropZone = 'dropZone',
  Static = 'static',
}

interface ConceptMapProps {
  attemptId: string;
  assignmentId: string;
  initialNodes: Node[];
  initialEdges: Edge[];
  availableNodeLabels: { id: string; label: string }[];
  availableEdgeLabels: { id: string; label: string }[];
}

export default function ConceptMap({ attemptId, assignmentId, initialNodes, initialEdges, availableNodeLabels, availableEdgeLabels }: ConceptMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [success, setSuccess] = useState<boolean>(false);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedItem, setDraggedItem] = useState<{ id: string; text: string } | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [usedSteps, setUsedSteps] = useState<string[]>([]);

  // Add new state for evaluation results
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, 'correct' | 'incorrect' | null>>({});
  const [edgeStatuses, setEdgeStatuses] = useState<Record<string, 'correct' | 'incorrect' | null>>({});

  const handleDragStart = (e: React.DragEvent, option: { id: string; text: string }, index: number | null): void => {
    setIsDragging(true);
    setDraggedItem(option);
    setDraggedIdx(index);
    e.dataTransfer.setData('text/plain', JSON.stringify(option));
  };

  const onStepUse = (step: string) => {
    posthog.capture("concept_mapping_step_used", {
      step: step,
    });
    setUsedSteps(prev => [...prev, step]);
  };

  const onStepReturn = (step: string) => {
    setUsedSteps(prev => prev.filter(s => s !== step));
  };

  const evaluateMapMutation = api.evaluateMap.evaluateMap.useMutation(); 

  const handleNodeDrop = useCallback((nodeId: string, label: string) => {
    if (success) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          // Get the previous label if it exists
          const previousLabel = node.data.label;
          
          // If there was a previous label, return it to available steps
          if (previousLabel) {
            onStepReturn(previousLabel as string);
          }
          
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
  }, [setNodes, onStepUse, onStepReturn, success]);

  const handleNodeReturn = useCallback((nodeId: string, label: string) => {
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
    if (success) return;
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            data: {
              ...edge.data,
              label,
              status: edgeStatuses[edgeId] ?? null,
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
  }, [setEdges, onStepUse, edgeStatuses, success]);

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
      if (success) return;
      const edge = {
        ...params, 
        type: "input-edge",
        data: {
          idForStatus: generateId(21),
          label: '',
          onLabelDrop: handleEdgeLabelDrop,
          onLabelReturn: handleEdgeLabelReturn,
          onEdgeRemove: handleEdgeRemove,
          status: null,
        },
      }
      setEdges((eds) => addEdge(edge, eds) as { id: string; type: string; source: string; target: string; data: { idForStatus: string; label: string } }[]);
    },
    [setEdges, handleEdgeLabelDrop, handleEdgeLabelReturn, handleEdgeRemove, success],
  );

  // Memoize the handler functions first
  const memoizedHandlers = useMemo(() => ({
    handleNodeDrop,
    handleNodeReturn,
    handleEdgeLabelDrop,
    handleEdgeLabelReturn,
    handleEdgeRemove
  }), [handleNodeDrop, handleNodeReturn, handleEdgeLabelDrop, handleEdgeLabelReturn, handleEdgeRemove]);

  // Then use the memoized handlers in nodeTypes and edgeTypes
  const nodeTypes = useMemo(() => ({
    dropZone: (props: React.JSX.IntrinsicAttributes & {
      id: string;
      data: {
        label: string;
        handles: { type: string; id: string; position: Position; }[];
      };
    }) => <InputNode {...props} 
      data={{ ...props.data, status: nodeStatuses[props.id] ?? null }}
      onDrop={memoizedHandlers.handleNodeDrop}
      onReturn={memoizedHandlers.handleNodeReturn}/>,
    static: StaticNode,
  }), [nodeStatuses, memoizedHandlers]);

  const edgeTypes = useMemo(() => ({
    'custom-edge': CustomEdge,
    'input-edge': (props: React.JSX.IntrinsicAttributes & {
      id: string;
      sourceX: number;
      sourceY: number;
      targetX: number;
      targetY: number;
      data: {
        idForStatus: string;
        label: string;
        status: 'correct' | 'incorrect' | null;
      };
    }) => 
      <InputEdge 
        {...props} 
        id={props.id}
        data={{ 
          ...props.data, 
          status: edgeStatuses[props.data.idForStatus] ?? null,
        }} 
        onLabelDrop={memoizedHandlers.handleEdgeLabelDrop}
        onLabelReturn={memoizedHandlers.handleEdgeLabelReturn}
        onEdgeRemove={memoizedHandlers.handleEdgeRemove}
        />
  }), [edgeStatuses, memoizedHandlers]);

  const handleEvaluateMap = async () => {
    posthog.capture("concept_mapping_evaluate_clicked"); 
    const result = await evaluateMapMutation.mutateAsync({
      attemptId: attemptId,
      assignmentId: assignmentId,
      conceptNodes: nodes.map((node) => ({
        id: node.id,
        label: node.data.label as string,
      })),
      conceptEdges: edges.map((edge) => ({
        id: edge.data?.idForStatus as string ?? edge.id,
        label: edge.data?.label as string,
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
      })),
    });

    // Update statuses based on evaluation result
    if (result.nodes) {
      setNodeStatuses(result.nodes.reduce((acc, node) => ({
        ...acc,
        [node.id]: node.isCorrect ? 'correct' : 'incorrect'
      }), {}));
    }
    if (result.edges) {
      setEdgeStatuses(result.edges.reduce((acc, edge) => ({
        ...acc,
        [edge.id]: edge.isCorrect ? 'correct' : 'incorrect'
      }), {}));
    }

    if(result.assignmentIsCorrect) {
      setSuccess(true);
    }
  }

  return (
    <div className="flex flex-col gap-8">
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
          <Controls showInteractive={false} />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
      {!success && (
        <>
          {/* Available Headings */}
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col">
              <p className="font-semibold text-center my-auto">
                Concepts
              </p>
            </div>
            <div className="flex flex-col">
              <p className="font-semibold text-center">
                Concept Relationships
              </p>
              <p className="text-xs text-muted-foreground text-center max-w-[300px] mx-auto">
                (Create relationships by connecting concepts. You can click on the black circles to connect them. Drag the labels after connecting.)
              </p>
            </div>
          </div>
          {/* Available Steps Section */}
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-center">
                {availableNodeLabels
                  .filter(option => !usedSteps.includes(option.label))
                  .map((option) => (
                    <DraggableStep
                      key={option.id}
                      step={option.label}
                      onDragStart={(e) => handleDragStart(e, { id: option.id, text: option.label }, null)}
                    />
                  ))}
              </div>
            </div>
            <div className="flex flex-col">          
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-center">
                {availableEdgeLabels
                  .filter(option => !usedSteps.includes(option.label))
                  .map((option) => (
                    <DraggableEdgeLabel
                      key={option.id}
                      label={option.label}
                      onDragStart={(e) => handleDragStart(e, { id: option.id, text: option.label }, null)}
                    />  
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
      {success ? (
        <div className="flex flex-col gap-4">
          <p className="text-center text-green-500">
            Congratulations! You have successfully created the concept map.
          </p>
        </div>
      ) : (
        <LoadingButton 
          disabled={evaluateMapMutation.isLoading || usedSteps.length !== (availableNodeLabels.length + availableEdgeLabels.length)} 
          loading={evaluateMapMutation.isLoading}
          onClick={handleEvaluateMap}
          variant="link"
          className="p-2 ml-auto hover:no-underline"
        >
          <div className="flex flex-row gap-2">
            <span className="my-auto font-semibold">
              Evaluate Concept Map
            </span>
            <Image 
              className="my-auto" 
              src="/images/concept-mapping.png" 
              alt="Concept Mapping" 
              width={32} 
              height={32} />
          </div>
        </LoadingButton>
      )}
    </div>
  );
}