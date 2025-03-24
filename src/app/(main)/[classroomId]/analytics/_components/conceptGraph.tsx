'use client';
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d";
import { type RouterOutputs } from "@/trpc/shared";
import { useEffect, useRef } from "react";

interface ConceptGraphProps {
  concepts: RouterOutputs["analytics"]["getConceptTracking"]["concepts"];
  edges: RouterOutputs["analytics"]["getConceptTracking"]["edges"];
  trackedConcepts: RouterOutputs["analytics"]["getConceptTracking"]["trackedConcepts"];
  numberOfStudents: number;
  selectedTopics: string[];
}

export const ConceptGraph = ({ concepts, edges, trackedConcepts, numberOfStudents, selectedTopics }: ConceptGraphProps) => {

  const fgRef = useRef<ForceGraphMethods>();

  useEffect(() => {
    if (fgRef.current) {
      const fg = fgRef.current;
      // Adjust force parameters
      // eslint-disable-next-line 
      fg.d3Force('charge')?.distanceMax(100);
      fg.zoom(0.62)
    }
  }, [])

  let filteredConcepts = concepts;
  if(selectedTopics.length > 0) {
    console.log('Selected Topics:', selectedTopics);
    console.log('Before filtering:', concepts);
    filteredConcepts = concepts.filter(concept => {
      const hasMatchingTopic = concept.conceptsToTopics.some(ctt => {
        console.log('Checking topic:', ctt.topicId);
        return selectedTopics.includes(ctt.topicId ?? "")
      });
      return hasMatchingTopic;
    });
    console.log('After filtering:', filteredConcepts);
  }

  console.log(filteredConcepts);

  const filteredConceptIds = filteredConcepts.map(concept => concept.id);

  let filteredEdges = edges;
  if(selectedTopics.length > 0) {
    filteredEdges = edges.filter(edge => filteredConceptIds.includes(edge.conceptId ?? "") && filteredConceptIds.includes(edge.relatedConceptId ?? ""));
  }
  // Transform the data into the format expected by ForceGraph2D
  const graphData = {
    nodes: filteredConcepts.map(concept => {
      
      const conceptTrackings = trackedConcepts.filter(t => t.conceptId === concept.id);

      const numberOfStudentsAttempting = new Set(trackedConcepts.map((tracking) => tracking.userId)).size;
      const participationRate = numberOfStudentsAttempting / numberOfStudents;
      
      // Calculate color based on accuracy and participation
      let color;
      if (conceptTrackings.length === 0) {
        // No attempts - use grey
        color = "rgba(180, 180, 180, 0.3)";
      } else {
        const correct = conceptTrackings.filter(t => t.isCorrect).length;
        const accuracy = correct / conceptTrackings.length;
        
        // Calculate RGB values for red-orange-green gradient
        let red, green;
        if (accuracy < 0.5) {
          // Red to Orange (0-50%)
          red = 255;
          green = Math.round(128 * (accuracy * 2)); // Max green will be 128 for orange
        } else {
          // Orange to Green (50-100%)
          red = Math.round(255 * (2 - (accuracy * 2))); // Decrease red
          green = Math.round(128 + (127 * (accuracy - 0.5) * 2)); // Increase green from 128 to 255
        }
        
        // Use participation rate for opacity (0.3 to 1)
        const opacity = 0.3 + (participationRate * 0.7);
        
        color = `rgba(${red}, ${green}, 0, ${opacity})`;
      }

      return {
        id: concept.id,
        name: concept.text,
        color: color,
      };
    }),
    links: filteredEdges.map(edge => ({
      source: edge.conceptId ?? "",
      target: edge.relatedConceptId ?? "",
      color: "#000",
    })),
  };

  return (
    <div className="bg-white rounded-lg px-4 py-2 mx-auto border border-muted h-full flex flex-col justify-center">
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="name"
        width={1000}
        height={600}
        linkDirectionalArrowLength={0}
        linkCurvature={0.1}
        linkWidth={0.5}
        linkColor="#000"
        nodeRelSize={3}
        nodeColor="color"
        ref={fgRef}
      />
    </div>
  );
};
