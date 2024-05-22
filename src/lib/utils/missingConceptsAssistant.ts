import { createAssistant, createThread, deleteAssistant, getTextResponseFromThread } from "./aiUtils";
import { convertStringArrayToNumberedList } from "./promptUtils";

const MISSING_CONCEPTS_ASSISTANT_NAME = "Missing Concepts"
const MISSING_CONCEPTS_ASSISTANT_MODEL = "gpt-4-turbo"
const MISSING_CONCEPTS_ASSISTANTS_PRE = "You will be given an explanation by the user on the topic of probability. After reading that explanation, you could not understand the following concepts:\n"
const MISSING_CONCEPTS_ASSISTANTS_POST = "Convey to the user that you couldn't understand the above concepts or concept. Make sure to use the terms or keywords mentioned by the user in their explanation. Do not thank the user for providing an explanation. Your response should be concise. Do not include bullet points or numbering."

export async function getResponseForMissingConcepts(
  missingConcepts: string[],
  inputExplanation: string
) : Promise<string> 
{ 
  
  const missingConceptString = convertStringArrayToNumberedList(missingConcepts);
  const instructions = `${MISSING_CONCEPTS_ASSISTANTS_PRE}${missingConceptString}${MISSING_CONCEPTS_ASSISTANTS_POST}`;
  
  const assistant = await createAssistant({
    modelName: MISSING_CONCEPTS_ASSISTANT_MODEL, 
    assistantName: MISSING_CONCEPTS_ASSISTANT_NAME, 
    assistantInstructions: instructions
  })  

  const thread = await createThread([{ role: "user", content: inputExplanation }]);
  const response = await getTextResponseFromThread(thread.id, assistant.id);
  void deleteAssistant(assistant.id);
  return response;
}