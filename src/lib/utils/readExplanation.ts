import { openai } from "../openai"
import { groq } from "../openai"

const readExplanationModel = "llama3-70b-8192" //"gpt-4o"
const readExplanationInstructions = "You take the role of a thinker. I need you to carefully read over an explanation and verify some information for me. Your response should be a valid jsonlist called 'verifications' where each json object has 'verification_question' and 'verification_answer' attributes. The verification_answer can only be 'Yes', 'No', or 'Unknown'. The verification_questions are given as follows:\n"
const readExplanationPromptPre = "Based on the given explanation, answer each verification_question. You can NOT use any information that is not given in the explanation. \nExplanation: "

type ReadExplanationJSONResponse = {
  verifications: {
      verification_question: string,
      verification_answer: string
  }[]
}

export async function readExplanation(conceptQuestions:string[], explanation: string) {
    const response = await groq.chat.completions.create({
        model:readExplanationModel,
        messages:[
            {"role": "system", "content": readExplanationInstructions + conceptQuestions.join("\n")},
            {"role": "user", "content": readExplanationPromptPre + explanation},
        ],
        response_format:{"type": "json_object"},
        temperature:0.5
    })
    if(response?.choices[0]?.message.content == null) {
        console.log(response)
        throw new Error("No response content")
    }
    const responseJson = JSON.parse(response.choices[0].message.content) as ReadExplanationJSONResponse
    return responseJson
}