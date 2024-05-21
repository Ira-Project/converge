export type CleanConceptGraph = {
  nodes: string[];
  edges: {
    source: string;
    target: string;
  }[];
  roots: string[]
}

export type ConceptWithSimilarConcepts = {
  id: string;
  similarConcepts: string[]
}


function createAdjacencyDict(edges: { source: string, target: string }[]) {
  const adjacencyDict: Record<string, string[]> = {};

  for (const edge of edges) {
    if (!adjacencyDict[edge.source]) {
      adjacencyDict[edge.source] = [];
    }
    adjacencyDict[edge.source]?.push(edge.target);
  }

  return adjacencyDict;
}

function createReverseAdjacencyDict(edges: { source: string, target: string }[]) {
  const reverseAdjacencyDict: Record<string, string[]> = {};

  for (const edge of edges) {
    if (!reverseAdjacencyDict[edge.target]) {
      reverseAdjacencyDict[edge.target] = [];
    }
    reverseAdjacencyDict[edge.target]?.push(edge.source);
  }
  return reverseAdjacencyDict;

}

export function getValidAndIsolatedNodes(
  conceptIds: string[],
  conceptGraph: CleanConceptGraph,
) : {  validNodes: string[],  isolatedNodes: string[] }
{
  const validNodes:string[] = [];
  const isolatedNodes: string[] = [...conceptIds];
  
  // Handle case where no roots are present

  let rootsPresent = false;
  for (const root of conceptGraph.roots) {
    if(conceptIds.includes(root)) {
      rootsPresent = true;
      break;
    }
  }

  if (!rootsPresent) {
    return {
      validNodes: validNodes,
      isolatedNodes: isolatedNodes,
    }
  }

  // Traversing the tree to get the valid nodes

  const adjacencyDict = createAdjacencyDict(conceptGraph.edges);
  const reverseAdjacencyDict = createReverseAdjacencyDict(conceptGraph.edges);

  const nodesVisited = new Set();
  const stack = [...conceptGraph.roots];

  while(stack.length > 0) {
    const currentNode = stack.shift()!;    
    if (isolatedNodes.includes(currentNode)) {
      validNodes.push(...isolatedNodes.splice(isolatedNodes.indexOf(currentNode), 1));
      if (adjacencyDict.hasOwnProperty(currentNode)) {
        const childNodes = adjacencyDict[currentNode]!;
        for (const childNode of childNodes) {
          if (!nodesVisited.has(childNode)) {
            if(reverseAdjacencyDict[childNode]?.length === 1) {
              stack.push(childNode);
              nodesVisited.add(childNode);
            } else {
              const remainingParents = reverseAdjacencyDict[childNode]?.filter((parent) => parent !== currentNode) ?? [];
              let allParentsValid = true;
              for (const parent of remainingParents) {
                if (!validNodes.includes(parent)) {
                  allParentsValid = false;
                  break;
                }
              } 
              if (allParentsValid) {
                stack.push(childNode);
                nodesVisited.add(childNode);
              }
            }
          }
        }
      }
    }
  }

  return {
    validNodes: validNodes,
    isolatedNodes: isolatedNodes,
  }
}

export function getMissingParentsFromIsolatedNodes(
  isolatedNodes: string[],
  conceptGraph: CleanConceptGraph,
) : string[] {
  
  const missingParents: string[] = [];

  const adjacencyDict = createAdjacencyDict(conceptGraph.edges);

  const nodesVisited = new Set();
  const stack = [...conceptGraph.roots];

  while(stack.length > 0) {
    const currentNode = stack.shift()!;
    if(isolatedNodes.includes(currentNode)) {
      break;
    } else {
      missingParents.push(currentNode);
    }
    if (adjacencyDict.hasOwnProperty(currentNode)) {
      const childNodes = adjacencyDict[currentNode]!;
      for (const childNode of childNodes) {
        if (!nodesVisited.has(childNode)) {
          stack.push(childNode);
          nodesVisited.add(childNode);
        }
      }
    }
  }

  return missingParents

}


export function getConceptQuestions(
  conceptIds: string[],
  separatorString: string,
  concepts: ConceptWithSimilarConcepts[],
  conceptDictionary: Record<string, string>
) : string[]
{
  const conceptQuestions: string[] = [];
  const similarConceptSet = new Set();
  for (const conceptId of conceptIds) {
    if (similarConceptSet.has(conceptId)) {
      continue;
    }
    const concept = concepts.find(({ id }) => id === conceptId);
    const conceptText = conceptDictionary[conceptId];
    concept?.similarConcepts.forEach((id) => similarConceptSet.add(id));
    const singleConceptStringList = [conceptText, ...concept?.similarConcepts.map((id) => conceptDictionary[id]) ?? []];
    conceptQuestions.push(singleConceptStringList.join(separatorString));  
  }

  return conceptQuestions;
}
