import { TRPCClientError } from "@trpc/client"
import { DEFAULT_TEMPERATURE, DEFAULT_TOP_P, IRRELEVANT_EXPLANATION_RESPONSES, NO_EXPLANATION_RESPONSES } from "../aiConstants"
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

export function getIrrelevantExplanationResponse() {
  const randomInteger = Math.floor(Math.random() * IRRELEVANT_EXPLANATION_RESPONSES.length);
  return IRRELEVANT_EXPLANATION_RESPONSES[randomInteger];
}

export async function createAssistant(
  {
    modelName,
    assistantName,
    assistantInstructions,
    temperature = DEFAULT_TEMPERATURE,
    isJson = false, 
    topP = DEFAULT_TOP_P
  } : {
    modelName: string,
    assistantName: string,
    assistantInstructions: string,
    temperature?: number,
    isJson?: boolean
    topP?: number
  }
) {
  const assistant = await openai.beta.assistants.create({
    model: modelName,
    name: assistantName,
    instructions: assistantInstructions,
    temperature: temperature,
    response_format: isJson ? { "type": "json_object" } : "auto",
    top_p: topP,
  });
  
  return assistant;
}

export async function createThread(
  messages : {
    role: "user" | "assistant",
    content: string
  }[]
) {
  const thread = await openai.beta.threads.create({
    messages: messages
  });
  return thread;
}

export async function getTextResponseFromThread(
  threadId: string,
  assistantId: string
): Promise<string> {

  let run = await openai.beta.threads.runs.createAndPoll(
    threadId, 
    {
      assistant_id: assistantId,
    }
  )

  while (['queued', 'in_progress', 'cancelling'].includes(run.status)) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 seconds
    run = await openai.beta.threads.runs.retrieve(
      run.thread_id,
      run.id
    );
  }

  if (run.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(threadId);
    const response = messages.data[0]?.content[0];
    if(response?.type === "text") {
      return response.text.value;
    } else {
      throw new TRPCClientError("Error: Response is not text");
    }
  }

  throw new TRPCClientError("Error: Thread run failed");

}

export async function getJsonResponseFromThread(
  threadId: string,
  assistantId: string,
): Promise<JSON> {

  let run = await openai.beta.threads.runs.createAndPoll(
    threadId, 
    {
      assistant_id: assistantId,
    }
  )

  while (['queued', 'in_progress', 'cancelling'].includes(run.status)) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 seconds
    run = await openai.beta.threads.runs.retrieve(
      run.thread_id,
      run.id
    );
  }

  if (run.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(threadId);
    const response = messages.data[0]?.content[0];
    if(response?.type === "text") {
      const responseJson = JSON.parse(response.text.value) as JSON;
      return responseJson
    } else {
      throw new TRPCClientError("Error: Response is not text");
    }
  }

  throw new TRPCClientError("Error: Thread run failed");

}

export async function deleteAssistant(
  assistantId: string,
) {
  await openai.beta.assistants.del(assistantId);
}