"use client";
import type { RouterOutputs } from "@/trpc/shared";
import { useEffect, useRef } from "react";
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';

interface Props {
  assignmentTemplate: RouterOutputs["assignmentTemplate"]["get"];
}


export const ConceptGraph = (
  { assignmentTemplate } : Props
) => {

  const graphRef = useRef<ForceGraphMethods>();
  
  useEffect(() => {
    graphRef.current?.zoom(0.9, 1000)
  }, [])

  const nodes = assignmentTemplate?.conceptGraphs?.concepts.map((concept) => ({ 
    id: concept.id.toString(), 
    name: concept.conceptQuestions?.[0]?.text ?? "",
  })) ?? []

  const links = assignmentTemplate?.conceptGraphs?.conceptGraphEdges.map((edge) => ({ source: edge.parent?.toString(), target: edge.child?.toString() })) ?? []

  const data = {
    nodes: nodes,
    links: links
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-semibold"> Concept Graph </p>
        <div className="w-[336px] h-48 border p-2 rounded-md">
          <ForceGraph2D
            ref={graphRef}
            graphData={data}
            minZoom={0.5}
            width={320}
            height={176}
            nodeRelSize={4}
            nodeLabel={
              (node) => {
                return nodes.find(n => n.id === node.id)?.name ?? "No Name";
              }
            }
            nodeColor={() => '#0F172A'}
            linkWidth={2}
          />
        </div>
    </div>
  )
}

