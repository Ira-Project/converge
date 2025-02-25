import { ActivityType, Paths } from "@/lib/constants"

export function getMetaDataFromActivityType(activityType?: ActivityType, id?: string): 
{
  id: string;
  url: string;
  iconImage: string;
  title: string;
  tutorialUrl: string;
  tags: string[];
  description: string;
  descriptionLong: string;
  citations: string[];
  colour: string;
  isActive: boolean;
} {

  switch(activityType) {
    case ActivityType.LearnByTeaching:
      return {
        id: "learn-by-teaching",
        url: `${Paths.Activity}${id}${Paths.LearnByTeaching}`,
        iconImage: "/images/learn-by-teaching.png",
        title: "Learn by Teaching",
        tutorialUrl: "https://www.loom.com/embed/e07673e5101d48d9bd12ff88259e7de3?sid=f3cd2e10-1062-4bc1-bf1a-d31035554101",
        tags: ["Memory", "Understanding"],
        colour: "amber",
        description: "Learn by teaching Ira, iterating on your explanation until Ira is able to answer a set of questions correctly. This assignment is designed to help you understand concepts and improve your communication skills.",
        descriptionLong: "In this innovative learning activity, students have to teach an AI instead of solving a set of questions. For a given topic, they have to explain concepts and provide corresponding formulas (if required) to the AI. The AI then uses this explanation to attempt a set of questions and responds with it’s solution and working. The students have to iterate on their explanations till the AI is able to solve all the given questions. We ensure that the AI's response serves as scaffolding to guide the learners to the correct explanation rather than providing it directly. \nThis activity leverages the Feynman method of learning, which posits that teaching others is one of the most effective ways to learn [1, 2, 3, 4, 5]. There is no penalization for incorrect explanations and the students are encouraged to iteratively improve their understanding of the topic, develop communication skills, build metacognition, and hone their organizational abilities.",
        citations: [
          "Ronnel Ian A Ambion, Rainier Santi C De Leon, Alfonso Pio Angelo R Mendoza, and Reinier M Navarro. The utilization of the feynman technique in paired team teaching towards enhancing grade 10 anhs students’ academic achievement in science. In 2020 IEEE Integrated STEM Education Conference (ISEC), pages 1–3. IEEE, 2020.",
          "Tzu-Chieh Yu, Nichola C Wilson, Primal P Singh, Daniel P Lemanu, Susan J Hawken, and Andrew G Hill. Medical students-as-teachers: a systematic review of peer-assisted teaching during medical school. Advances in medical education and practice, pages 157–172, 2011.",
          "Englevert P Reyes, Ron Mhel Francis L Blanco, Defanee Rose L Doroon, Jay Lord B Limana, and Ana Marie A Torcende. Feynman technique as a heutagogical learning strategy for independent and remote learning. Recoletos Multidisciplinary Research Journal, 9(2):1–13, 2021.",
          "Kristiana Nathalia Wea, Yohanes Sudarmo Dua, and Agustina Elizabeth. An exploratory study to investigate the implementation of feynman learning method in a physics classroom setting. Journal of Innovative Science Education, 12(3):331–339, 2023.",
          "Brett Williams and Priya Reddy. Does peer-assisted learning improve academic performance? a scoping review. Nurse education today, 42:23–29, 2016.",
        ],
        isActive: true,
      }
    case ActivityType.ReasonTrace:
        return {
          id: "reason-trace",
          url: `${Paths.Activity}${id}${Paths.ReasonTrace}`,
          iconImage: "/images/reason-trace.png",
          title: "Reason Trace",
          tutorialUrl: "https://www.loom.com/embed/07854dffdd974dc3b4de0a2754fe1f56?sid=41fd0084-22cc-4e8d-9b17-675d99ebd8c8",
          tags: ["Reasoning", "Evaluation"],
          colour: "rose",
          description: "A spin on the popular 'Wordle' game. Spot the flaw in Ira's reasoning and correct it.",
          descriptionLong: "This is a 2-step activity that starts by presenting the students with a question and it’s answer which has been computed incorrectly by an AI. The AI is designed to avoid any numerical mistakes while computing an answer to ensure that the incorrect answer is a result of an error in reasoning rather than an error in calculation. In the first step, the students have to identify the exact order of reasoning that the AI used to arrive at that incorrect answer. In the second step, they have to correct the reasoning of the AI so that it is able to solve the question.\nTo complete this activity, students have to use divergent thinking [1] to generate and explore multiple different reasoning pathways for a single question. This method of thinking is often contrasted with convergent thinking, which focuses solely on arriving at a single, correct solution to a problem. As divergent thinking has been shown to be a valid indicator for creative thought [2, 3], this activity allows the students to build creativity.",
          citations: [
            "Joy P Guilford. Creativity: Yesterday, today and tomorrow. The Journal of Creative Behavior, 1(1):3–14, 1967",
            "Mathias Benedek, Tanja Könen, and Aljoscha C Neubauer. Associative abilities underlying creativity. Psychology of Aesthetics, Creativity, and the Arts, 6(3):273, 2012.",
            "Sietske W Kleibeuker, Carsten KW De Dreu, and Eveline A Crone. Creativity development in adolescence: Insight from behavior, brain, and training studies. New directions for child and adolescent development, 2016(151):73–84, 2016.",
          ],
          isActive: true,
        }
    case ActivityType.KnowledgeZap:
      return {
        id: "knowledge-zap",
        url: `${Paths.Activity}${id}${Paths.KnowledgeZap}`,
        iconImage: "/images/knowledge-zap.png",
        title: "Knowledge Zap",
        tutorialUrl: "https://www.loom.com/embed/01e2912f75044398babbab0cd9b59aae?sid=c8b00065-c416-4f5c-8823-933b93e42866",
        tags: ["Memory"],
        colour: "lime",
        description: "Test your knowledge on a topic by answering questions.",
        descriptionLong: "This activity is a derivative of standard assessments involving multiple-choice questions (MCQs). For any given topic, students have to correctly answer a set of questions that span three possible formats - MCQs, match-the-following questions, and arrange-in-order questions. If the student provides an incorrect answer, the corresponding question (along with it’s options) is automatically rephrased and added to the end of set. The activity is completed when the student answers the entire set of questions correctly.\nThis activity aims to leverage the concept of spaced repetition and interleaving. Spaced repetition is a learning technique that involves increasing the time intervals between reviewing the same piece of information and has been shown to significantly enhance retention and recall of information [1, 2, 3]. Interleaving involves mixing different types of problems or sub-topics during a learning session and has been shown to enhance long-term retention and understanding of material and promote better discernment between concepts [4, 3, 5].",
        citations: [
          "Paul Smolen, Yili Zhang, and John H Byrne. The right time to learn: mechanisms and optimization of spaced learning. Nature Reviews Neuroscience, 17(2):77–88, 2016.",
          "David P Ausubel and Mohamed Youssef. The effect of spaced repetition on meaningful retention. The Journal of General Psychology, 73(1):147–150, 1965.",
          "Shana K Carpenter, Steven C Pan, and Andrew C Butler. The science of effective learning with spacing and retrieval practice. Nature Reviews Psychology, 1(9):496–511, 2022.",
          "Doug Rohrer. Interleaving helps students distinguish among similar concepts. Educational Psychology Review, 24:355–367, 2012.",
          "Gregory M Donoghue and John AC Hattie. A meta-analysis of ten learning techniques. In Frontiers in Education, volume 6, page 581216. Frontiers Media SA, 2021.",
        ],
        isActive: true,
      }
    case ActivityType.StepSolve:
      return {
        id: "step-solve",
        url: `${Paths.Activity}${id}${Paths.StepSolve}`,
        iconImage: "/images/step-solve.png",
        title: "Step Solve",
        tutorialUrl: "https://www.loom.com/embed/990069f4e68e4e8eabece6a7a6a7be2d?sid=4884f49b-7e78-4387-b766-9bcd529a7694",
        tags: ["Reasoning", "Evaluation"],
        colour: "teal",
        description: "Learn how to problem solve by solving a question step by step.",
        descriptionLong: "In this activity, students solve a given question by computing answers to intermediate steps. The steps are presented sequentially and students can only proceed to the next step after correctly completing the previous step. By demonstrating the step-by-step process of solving a problem, this activity leverages the worked example effect [1] which states that learning outcomes are improved when students are provided with worked examples. It also provides a scaffold for students, guiding them through the process and reducing the cognitive effort required. \n Breaking down a problem into smaller steps is also supported by the cognitive load theory [2]. This theory emphasizes that our working memory, where we process information, has limited capacity. Complex problems can easily overload this capacity, hindering learning. By breaking a problem into smaller, manageable steps, we reduce the cognitive load, thus allowing us to learn each part effectively",
        citations: [
          "John Sweller. The worked example effect and human cognition. Learning and instruction, 2006.",
          "John Sweller. Cognitive load during problem solving: Effects on learning. Cognitive science, 12(2):257–285,1988."
        ],
        isActive: true,
      }
    case ActivityType.ReadAndRelay:
      return {
        id: "read-and-relay",
        url: `${Paths.Activity}${id}${Paths.ReadAndRelay}`,
        iconImage: "/images/read-and-relay.png",
        title: "Read and Relay",
        tutorialUrl: "",
        tags: ["Comprehension", "Reading"],
        colour: "blue",
        description: "",
        descriptionLong: "",
        citations: [],
        isActive: false,
      }
    case ActivityType.ConceptMapping:
      return {
        id: "concept-mapping",
        url: `${Paths.Activity}${id}${Paths.ConceptMapping}`,
        iconImage: "/images/concept-mapping.png",
        title: "Concept Mapping",
        tutorialUrl: "https://www.loom.com/embed/30a109cfe50944f69230037fad476767?sid=47c0846f-775a-49af-b8a9-e72f2fbd01cd",
        tags: ["Creativity", "Understanding"],
        colour: "fuchsia",
        description: "A mindmapping activity to help you make relevant connections between concepts and develop your understanding.",
        descriptionLong: "",
        citations: [],
        isActive: false,
      }
    default:
      return {
        id: "",
        url: "",
        iconImage: "",
        title: "",
        tutorialUrl: "",
        tags: [],
        description: "",
        descriptionLong: "",
        citations: [],
        colour: "gray",
        isActive: false,
      }
  }

}