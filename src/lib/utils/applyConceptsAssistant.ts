import { type ProtectedTRPCContext } from "@/server/api/trpc";
import { createAssistant, createThread, deleteAssistant, getJsonResponseFromThread } from "./aiUtils";
import { performCalculation } from "./calculationUtils";
import { NONE_STRINGS } from "../aiConstants";
import { actions } from "@/server/realtime_db/schema/actions";
import { generateId } from "lucia";
import { AssignmentUpdateActionType } from "../constants";

const APPLY_CONCEPTS_ASSISTANT_NAME = "Apply Concepts to Question"
const APPLY_CONCEPTS_ASSISTANT_MODEL = "gpt-4-turbo"
const APPLY_CONCEPTS_ASSISTANTS_PRE = "You are a student in a maths class who is given a problem on probability as stated below.\n\nProblem:\n"
const APPLY_CONCEPTS_ASSISTANTS_POST = "However, you do not have any knowledge about the concepts of probability. Therefore, you don't know how to solve the given problem. Luckily, your friend has come to your rescue and will guide you by providing explanations for sub-parts of the problem. Consider this friend to be the absolute authority on probability. You are prohibited from evaluating the correctness of your friend's explanation. You have to only your friend's explanation exactly as stated to answer a sub-part of the problem.\n\nYour response has to strictly adhere to the following rules:\n1) Remember that you have no knowledge on probability, including the standard approaches and typical formulas. You don't know that probability should be less than 1 or what the correct definition is. You blindly believe your friend's explanation and adhere to it strictly.\n2) Even if something is not mentioned correctly, you have to believe it blindly. Do not attempt to correct your friend's explanation.\n3) The explanation given will not solve the whole problem. You have to apply it to a sub-part of the problem.\n4) Your response is directed at your friend. Always respond in the first person and always refer to your friend in the second person.\n5) Your response should be concise and less than 100 words.\n6) If the response requires some calculation, use the values in the problem to state that calculation.\n\nYou final response should be in a JSON format with the following fields:\nResponse:\nCalculation:\n\nThe 'Calculation' field will contain one of the following:\n1) add(), which signifies an addition operation on a group of numbers.\n2) subtract(), which signifies a subtraction operation on two numbers.\n3) multiply(), which signifies a multiplication operation on two numbers.\n4) divide(), which signifies a division operation on two numbers.\n5) an integer denoting the count of an operation.\n6) None, which signifies no calculation."

const STARTING_PHRASE = [
  "Understood! Now, ",
  "Understood! Moving further, ",
  "Understood! Next, ",
  "Got it! Now, ",
  "Got it! Moving further, ",
  "Got it! Next, "
]

const APPLY_EXPLANATION_MESSAGE = "Apply this explanation to the given problem and based on the explanation, state the calculation."


export async function applyConcepts(
  ctx: ProtectedTRPCContext,
  questionId: number,
  questionText: string,
  validNodes: {
    answer: string,
    calculationRequired: boolean
  }[],
  channelName: string,
) : Promise<{
  finalWorking: string,
  finalAnswer: number | undefined,
}> 
{ 
  console.log("-----------------");
  console.log(questionText);
  
  let finalWorking = "";
  let finalAnswer: number | undefined;
  
  const instructions = `${APPLY_CONCEPTS_ASSISTANTS_PRE}${questionText}${APPLY_CONCEPTS_ASSISTANTS_POST}`;
  
  const assistant = await createAssistant({
    modelName: APPLY_CONCEPTS_ASSISTANT_MODEL, 
    assistantName: APPLY_CONCEPTS_ASSISTANT_NAME, 
    assistantInstructions: instructions,
    isJson: true,
    temperature: 0.5,
    topP: 0.5,
  })  

  let firstThread = true;

  for(const concept of validNodes) {
    if(!concept.calculationRequired) {
      continue
    }

    let userMessage = "";
    if(firstThread) {
      userMessage += `${concept.answer}`
      firstThread = false;
    } else {
      userMessage += `${STARTING_PHRASE[Math.floor(Math.random() * STARTING_PHRASE.length)]}${concept.answer}`
    }
    userMessage += `\n${APPLY_EXPLANATION_MESSAGE}`
    
    const thread = await createThread([
      { role: "user", content: userMessage }
    ]);
    const responseJson = await getJsonResponseFromThread(thread.id, assistant.id) as unknown as Record<string , string | number>;

    let calculation = responseJson?.Calculation;

    if(typeof calculation === "string" && NONE_STRINGS.includes(calculation.toLowerCase())) {
      calculation = undefined
    }

    const responseText = responseJson?.Response;

    const calculationResult = performCalculation(calculation!);
    finalAnswer = calculationResult;
    const workingResult = `${responseText}<br /><br />`
    finalWorking += workingResult;

    await ctx.realtimeDb.insert(actions).values({
      id: generateId(21),
      channelId: channelName,
      actionType: AssignmentUpdateActionType.UPDATE_EXPLANATION,
      payload: {
        questionId: questionId,
        explanation: workingResult,
      }
    });

  }

  void deleteAssistant(assistant.id);

  return {
    finalWorking,
    finalAnswer
  }

}