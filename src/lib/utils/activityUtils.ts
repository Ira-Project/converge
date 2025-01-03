import { ActivityType, Paths } from "@/lib/constants"

export function getMetaDataFromActivityType(activityType?: ActivityType, id?: string): 
{
  url: string;
  iconImage: string;
  title: string;
  helpUrl: string;
  tags: string[];
  description: string;
  colour: string;
} {

  switch(activityType) {
    case ActivityType.LearnByTeaching:
      return {
        url: `${Paths.Activity}${id}/${Paths.LearnByTeaching}`,
        iconImage: "/images/learn-by-teaching.png",
        title: "Learn by Teaching",
        helpUrl: "",
        tags: ["Communication", "Understanding"],
        colour: "amber",
        description: "Learn by teaching ira, iterating on your explanation until Ira is able to answer a set of questions correctly. This assignment is designed to help you understand concepts and improve your communication skills.",
      }
    case ActivityType.ReasonTrace:
        return {
          url: `${Paths.Activity}${id}${Paths.ReasonTrace}`,
          iconImage: "/images/reason-trace.png",
          title: "Reason Trace",
          helpUrl: "",
          tags: ["Reasoning", "Evaluation"],
          colour: "rose",
          description: "A spin on the popular 'Wordle' game. Spot the flaw in Ira's reasoning and correct it.",
        }
    case ActivityType.KnowledgeZap:
      return {
        url: `${Paths.Activity}${id}/${Paths.KnowledgeZap}`,
        iconImage: "/images/knowledge-zap.png",
        title: "Knowledge Zap",
        helpUrl: "",
        tags: ["Knowledge", "Evaluation"],
        colour: "lime",
        description: "Test your knowledge on a topic by answering questions.",
      }
    default:
      return {
        url: "",
        iconImage: "",
        title: "",
        helpUrl: "",
        tags: [],
        description: "",
        colour: "gray",
      }
  }

}