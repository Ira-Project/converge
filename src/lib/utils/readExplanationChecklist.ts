import { openai } from "../openai"

const readExplanationModel = "gpt-4o" //"llama3-70b-8192"
const readExplanationInstructions = "You are an automated checklist. I need you to carefully read a paragraph to check if it contains some information. Your response should be a valid jsonlist called 'information_checklist' where each json object has 'information' and 'check' attributes. The 'check' can only be 'Yes', 'No', or 'Wrong'. If the paragraph contains the information, then the 'check' should be 'Yes' and if it doesn't contain the information or the informaion is unknown, the check should be 'No'. If the paragraph contradicts the information, then the 'check' should be 'Wrong'. The list of 'information' is given as follows:\n"
const readExplanationPromptPre = "Read the given paragraph to check if it contains the information. Your 'check' should be based ONLY on the paragraph given below and can only be 'Yes', 'No', or 'Wrong'. Do NOT return 'Unknown'. \nParagraph: "

type ReadExplanationChecklistJSONResponse = {
  informationChecklist: {
      information: string,
      check: string
  }[]
}

export async function readExplanationChecklist(conceptQuestions:string[], explanation: string) {
    const response = await openai.chat.completions.create({
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
    const responseJson = JSON.parse(response.choices[0].message.content) as ReadExplanationChecklistJSONResponse
    return responseJson
}