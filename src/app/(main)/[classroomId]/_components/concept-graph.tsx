'use client';
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d";
import { type RouterOutputs } from "@/trpc/shared";
import { useEffect, useRef } from "react";

interface ConceptGraphProps {
  concepts: RouterOutputs["analytics"]["getConceptTracking"]["concepts"];
  edges: RouterOutputs["analytics"]["getConceptTracking"]["edges"];
  trackedConcepts: RouterOutputs["analytics"]["getConceptTracking"]["trackedConcepts"];
  numberOfStudents: number;
}

export const ConceptGraph = ({ concepts, edges, trackedConcepts, numberOfStudents }: ConceptGraphProps) => {

  const fgRef = useRef<ForceGraphMethods>();

  useEffect(() => {
    if (fgRef.current) {
      const fg = fgRef.current;
      // Adjust force parameters
      // eslint-disable-next-line 
      fg.d3Force('charge')?.distanceMax(100);
    }
  }, [])


  // Transform the data into the format expected by ForceGraph2D
  const graphData = {
    nodes: concepts.map(concept => {
      
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
    links: edges.map(edge => ({
      source: edge.conceptId ?? "",
      target: edge.relatedConceptId ?? "",
      color: "#000",
    })),
  };

  return (
    <div className="bg-white rounded-lg p-4 mx-auto border h-full flex flex-col justify-center w-full max-w-full">
      <p className="text-lg font-bold mb-4">
        Concepts
      </p>
      <div className="mx-auto flex flex-row gap-8 overflow-hidden">
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="name"
          height={300}
          width={500}
          linkDirectionalArrowLength={0}
          linkCurvature={0.1}
          linkWidth={0.5}
          linkColor="#000"
          nodeRelSize={3}
          nodeColor="color"
          ref={fgRef}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 w-full">
            {graphData.nodes
              .map(node => {
                const conceptTrackings = trackedConcepts.filter(t => t.conceptId === node.id);
                const accuracy = conceptTrackings.length > 0 
                  ? conceptTrackings.filter(t => t.isCorrect).length / conceptTrackings.length 
                  : 0;
                
                return { 
                  id: node.id, 
                  name: node.name,
                  color: node.color,
                  accuracy, 
                  attempts: conceptTrackings.length 
                };
              })
              .sort((a, b) => a.accuracy - b.accuracy)
              .slice(0, 20)
              .map(concept => (
                <div key={concept.id} className="flex items-center gap-2 w-full">
                  <div className="flex-shrink-0 w-3 h-3 rounded-full" style={{ backgroundColor: concept.color }}></div>
                  <span className="text-xs truncate max-w-[150px]" title={concept.name}>
                    {concept.name}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
