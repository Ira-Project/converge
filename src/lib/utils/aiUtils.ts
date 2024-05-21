import { NO_EXPLANATION_RESPONSES } from "../aiConstants"
import { openai } from "../openai"

export function getEmbeddingThreshold(prompt: string) {

  if(prompt.length <= 100) {
    return 0.6
  } else if(prompt.length > 100 && prompt.length <= 200) {
    return 0.55
  } else if(prompt.length > 200 && prompt.length <= 250) {
    return 0.50
  } else {
    return 0.45
  }

}

export async function createEmbedding(prompt: string): Promise<number[]> {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: prompt
  })

  const embeddingVector = embedding.data[0]?.embedding;
  const embeddingArray = embeddingVector?.map((value: number) => value) ?? [];
  return embeddingArray;
}

export function cosineSimilarity(vector1: number[], vector2: number[]): number{
  if (vector1.length !== vector2.length) {
    throw new Error("Embedding vectors must be of the same length");
  }

  let dotProduct = 0;
  let vector1Magnitude = 0;
  let vector2Magnitude = 0;
  for (let i = 0; i < vector1.length; i++) {

    if(vector1[i] === undefined || vector2[i] === undefined) {
      throw new Error("Embedding vectors must be numbers");
    }
    dotProduct += (vector1[i] ?? 0) * (vector2[i] ?? 0);
    vector1Magnitude += (vector1[i] ?? 0) * (vector1[i] ?? 0);
    vector2Magnitude += (vector2[i] ?? 0) * (vector2[i] ?? 0);
  }

  const similarity = dotProduct / (Math.sqrt(vector1Magnitude) * Math.sqrt(vector2Magnitude));
  return similarity;
}

export function compareVectors(vector1: number[], vector2: number[], threshold: number): boolean {
  const similarity = cosineSimilarity(vector1, vector2);
  return similarity >= threshold;
}

export function getNoExplanationResponse() {
  const randomInteger = Math.floor(Math.random() * NO_EXPLANATION_RESPONSES.length);
  return NO_EXPLANATION_RESPONSES[randomInteger];
}