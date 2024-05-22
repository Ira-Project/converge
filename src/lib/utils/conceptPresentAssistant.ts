import { createThread, getJsonResponseFromThread } from "./aiUtils";

const THREAD_MESSAGE_FILLER = "According to the context provided, "

export async function checkConceptWithExplanation(
  assistantId: string,
  inputExplanation: string,
  conceptText: string,
  conceptId: string,
) : Promise<{
  answer: string,
  answerPresent: boolean,
  conceptId: string
}> 
{   
  
  const threadMessage = `Context:\n${inputExplanation}\n${THREAD_MESSAGE_FILLER}"${conceptText}"`

  const thread = await createThread([
    { role: "user", content: threadMessage }
  ]);

  const responseJson = await getJsonResponseFromThread(thread.id, assistantId) as unknown as Record<string, string>;

  return {
    answer: responseJson.Answer!,
    answerPresent: responseJson['Answer Present']?.toLowerCase().trim() === "yes",
    conceptId: conceptId,
  }
  
}