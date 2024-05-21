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
  validNodes?: string[];
  hideLabels?: boolean;
}

export const ConceptGraph = (
  { assignmentTemplate, width, height, zoom, validNodes, hideLabels } : Props
) => {

  if(typeof window === 'undefined') return <></>;

  const theme = useTheme();
  const graphRef = useRef<ForceGraphMethods>();
  
  useEffect(() => {
    graphRef.current?.zoom(zoom ?? 0.9, 1000)
  }, [])

  const nodes = assignmentTemplate.conceptGraphs?.conceptToGraphs?.map((conceptToGraphs) => ({ 
    id: conceptToGraphs.concept.id.toString(), 
    name: conceptToGraphs.concept.text,
  })) ?? [];

  const links = assignmentTemplate.conceptGraphs?.conceptGraphEdges.map((edge) => ({ source: edge.parent.toString(), target: edge.child.toString() })) ?? [];

  const data = {
    nodes: nodes,
    links: links
  }

  return (
    <ForceGraph2D
      ref={graphRef}
      linkWidth={1}
      graphData={data}
      minZoom={0.5}
      width={width ?? 320}
      height={height ?? 176}
      nodeRelSize={5}
      nodeLabel={
        (node) => {
          // TO DO: Optimise this to avoid O(n) lookup
          if(hideLabels) return "";
          return nodes.find(n => n.id === node.id)?.name ?? "No Name";
        }
      }
      linkColor={() => theme.resolvedTheme === 'light' ? '#D9D9D9' : '#D9D9D9'}
      nodeColor={
        (node) => {
          if(validNodes?.includes(node?.id as string)) {
            return '#00FF00';
          }
          return theme.resolvedTheme === 'light' ? '#0F172A' : '#FFFFFF'
        }
      }
    />
  )
}

