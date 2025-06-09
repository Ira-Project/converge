'use client';
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d";
import { type RouterOutputs } from "@/trpc/shared";
import { useEffect, useRef, useState } from "react";

interface ConceptGraphProps {
  concepts: RouterOutputs["analytics"]["getConceptTracking"]["concepts"];
  edges: RouterOutputs["analytics"]["getConceptTracking"]["edges"];
  trackedConcepts: RouterOutputs["analytics"]["getConceptTracking"]["trackedConcepts"];
  numberOfStudents: number;
  selectedTopics: string[];
}

export const ConceptGraph = ({ concepts, edges, trackedConcepts, numberOfStudents, selectedTopics }: ConceptGraphProps) => {

  const fgRef = useRef<ForceGraphMethods<{ id: string; name: string; color: string }, { source: string; target: string; color: string }>>();
  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });
  const [mobileTooltip, setMobileTooltip] = useState<{
    visible: boolean;
    conceptName: string;
    x: number;
    y: number;
  }>({
    visible: false,
    conceptName: '',
    x: 0,
    y: 0
  });
  
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      const newIsMobile = window.innerWidth <= 768;
      setIsMobile(newIsMobile);
      setDimensions({
        width: Math.min(window.innerWidth - 32, 1000),
        height: Math.min(window.innerHeight * 0.6, 600)
      });
    };

    // Set initial dimensions
    updateDimensions();

    // Add resize listener
    window.addEventListener('resize', updateDimensions);

    if (fgRef.current) {
      const fg = fgRef.current;
      // Adjust force parameters
      if (isMobile) {
        // eslint-disable-next-line 
        fg.d3Force('charge')?.distanceMax(50);
      } else {
        // eslint-disable-next-line 
        fg.d3Force('charge')?.distanceMax(100);
      }
      fg.zoom(0.62);
    }

    return () => window.removeEventListener('resize', updateDimensions);
  }, [isMobile]);

  // Handle node click for mobile tooltip
  const handleNodeClick = (node: { id: string; name: string; color: string }, event: MouseEvent) => {
    // Only show tooltip on mobile/touch devices
    if (window.innerWidth <= 768) {
      setMobileTooltip({
        visible: true,
        conceptName: node.name,
        x: event.clientX,
        y: event.clientY
      });
    }
  };

  // Hide tooltip when clicking elsewhere
  const handleGraphClick = () => {
    setMobileTooltip(prev => ({ ...prev, visible: false }));
  };

  let filteredConcepts = concepts;
  if(selectedTopics.length > 0) {
    filteredConcepts = concepts.filter(concept => {
      const hasMatchingTopic = concept.conceptsToTopics.some(ctt => {
        console.log('Checking topic:', ctt.topicId);
        return selectedTopics.includes(ctt.topicId ?? "")
      });
      return hasMatchingTopic;
    });
  }

  const filteredConceptIds = filteredConcepts.map(concept => concept.id);

  let filteredEdges = edges;
  if(selectedTopics.length > 0) {
    filteredEdges = edges.filter(edge => filteredConceptIds.includes(edge.conceptId ?? "") && filteredConceptIds.includes(edge.relatedConceptId ?? ""));
  }

  // Check if there are no concepts to display (either no concepts at all or no filtered concepts)
  if (filteredConcepts.length === 0) {
    const isFiltered = selectedTopics.length > 0 && concepts.length > 0;
    
    return (
      <div className="bg-white rounded-lg px-2 md:px-4 py-2 mx-auto border border-muted h-full flex flex-col justify-center">
        <div className="flex flex-col items-center justify-center min-h-[300px] md:min-h-[600px] p-4 md:p-8 text-center">          
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
            {isFiltered ? "No Concepts for Selected Topics" : "No Concepts Assigned Yet"}
          </h3>
          
          <p className="text-gray-600 max-w-md mx-auto mb-4 md:mb-6 text-sm md:text-base">
            {isFiltered 
              ? "Try selecting different topics or clear the filter to see all available concepts."
              : "Concepts will appear here once students start completing activities that track learning objectives."
            }
          </p>
          
          <div className="text-xs md:text-sm text-gray-500">
            {isFiltered 
              ? "Concept relationships are shown based on the selected topic filters."
              : "Create and assign activities to see concept progress visualization."
            }
          </div>
        </div>
      </div>
    );
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
    <div className="bg-white rounded-lg px-2 md:px-4 py-2 mx-auto border border-muted h-full flex flex-col justify-center overflow-hidden relative">
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="name"
        width={dimensions.width}
        height={dimensions.height}
        linkDirectionalArrowLength={0}
        linkCurvature={0.1}
        linkWidth={0.5}
        linkColor="#000"
        nodeRelSize={3}
        nodeColor="color"
        onNodeClick={handleNodeClick}
        onBackgroundClick={handleGraphClick}
        ref={fgRef}
        onEngineStop={() => fgRef.current?.zoomToFit(400)}
      />
      
      {/* Mobile-only tooltip */}
      {mobileTooltip.visible && (
        <div
          className="fixed z-50 md:hidden bg-gray-800 text-white px-2 py-1 rounded text-sm shadow-lg pointer-events-none"
          style={{
            left: `${mobileTooltip.x}px`,
            top: `${mobileTooltip.y - 40}px`,
            transform: 'translateX(-50%)'
          }}
        >
          {mobileTooltip.conceptName}
        </div>
      )}
    </div>
  );
};
