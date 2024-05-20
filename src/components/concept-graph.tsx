"use client";
import type { RouterOutputs } from "@/trpc/shared";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';

interface Props {
  assignmentTemplate: RouterOutputs["assignmentTemplate"]["get"];
  width?: number;
  height?: number;
  zoom?: number;
}

export const ConceptGraph = (
  { assignmentTemplate, width, height, zoom } : Props
) => {

  if(typeof window === 'undefined') return <></>;

  const theme = useTheme();
  const graphRef = useRef<ForceGraphMethods>();
  
  useEffect(() => {
    graphRef.current?.zoom(zoom ?? 0.9, 1000)
  }, [])

  const nodes = assignmentTemplate.conceptGraphs.conceptToGraphs?.map((conceptToGraphs) => ({ 
    id: conceptToGraphs.concept.id.toString(), 
    name: conceptToGraphs.concept.conceptQuestions[0]?.text ?? "No Name"
  }));

  const links = assignmentTemplate.conceptGraphs.conceptGraphEdges.map((edge) => ({ source: edge.parent.toString(), target: edge.child.toString() }));

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
            width={width ?? 320}
            height={height ?? 176}
            nodeRelSize={5}
            nodeLabel={
              (node) => {
                return nodes.find(n => n.id === node.id)?.name ?? "No Name";
              }
            }
            linkColor={() => theme.resolvedTheme === 'light' ? '#D9D9D9' : '#D9D9D9'}
            nodeColor={() => theme.resolvedTheme === 'light' ? '#0F172A' : '#FFFFFF'}
            linkWidth={2}
          />
        </div>
    </div>
  )
}

