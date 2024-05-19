export type Concept = {
  concept_id: number;
  concept_text: {
    question: string;
    answers: string[];
  }[];
  concept_formula: string;
  calculation_required: boolean;
  parent_concepts: number[];
};

export const map:Concept[] = [
  {
    concept_id: 1,
    concept_text: [{
      question: "What are outcomes?",
      answers: [
        "Any possible result of an experiment or a trial is an outcome.",
        "An outcome is what you might expect to happen after conducting a test or action.",
        "Outcomes are the various results that could occur following an experiment.",
        "Each possible result from performing a specific activity or experiment can be called an outcome.",
        "An outcome represents any potential occurrence that can come out of a situation or experimental setup."
      ]
    }],
    concept_formula: "",
    calculation_required: false,
    parent_concepts: []
  },
  {
    concept_id: 2,
    concept_text: [
      {
        question: "What are total outcomes?",
        answers: [
          "All possible outcomes of an experiment or a trial constitute the total outcomes.",
          "Total outcomes are every different result that could possibly occur from an action.",
          "Total outcomes refer to all the various results that can happen when an event takes place.",
          "When considering total outcomes, we count each unique possibility that might come out of a scenario.",
          "Total outcomes include all individual end-results achievable in any given situation."
        ]
      },
      {
        question: "What is the sample space?",
        answers: [
          "The set of all possible outcomes of an experiment or a trial is called the sample space.",
          "The sample space consists of every possible result that could occur.",
          "It is a collection of all potential outcomes in any given situation.",
          "Sample space refers to the complete set of possible discrete outcomes.",
          "This term describes all the different results that might happen in an experiment."
        ]
      }
    ],
    concept_formula: "",
    calculation_required: true,
    parent_concepts: [1]
  },
  {
    concept_id: 4,
    concept_text: [
      {
        question: "What are favourable outcomes?",
        answers: [
          "Given an experiment or a trial, favourable outcomes are those that we want to happen.",
          "Favourable outcomes are the results of an experiment that match our desired or intended conditions.",
          "These outcomes are the specific results we are hoping for when we perform a trial.",
          "In any given experiment, favourable outcomes are those which satisfy the objectives set before it was conducted.",
          "They represent successful results in accordance to what was anticipated or planned."
        ]
      },
      {
        question: "What are events?",
        answers: [
          "The set of favourable outcomes of an experiment or a trial is called an event.",
          "An event is a collection of outcomes that we are interested in when performing a random experiment.",
          "Events are possible results that could occur when an action with uncertain outcomes is taken.",
          "An event represents all the potential favorable results one can observe from a particular experiment.",
          "Events include those specific scenarios or outcomes you might define as successes in an activity involving chance."
        ]
      }
    ],
    concept_formula: "",
    calculation_required: true,
    parent_concepts: [1]
  },
  {
    concept_id: 6,
    concept_text: [
      {
        question: "What is probability of an event in an experiment?",
        answers: [
          "The probability of an event in an experiment is defined as the number of trials in which the event happened divided by the total number of trials.",
          "It's the fraction of times an event occurs out of the total attempts made.",
          "Probability is calculated by dividing the number of successful outcomes by the total number of attempts.",
          "To determine probability, count how many times the event you are measuring occurs and then divide it by the total number of trials or attempts.",
          "Find the probability by taking the number of times an event occurs and dividing it by the total number of trials."
        ]
      },
      {
        question: "What is the definition of probability?",
        answers: [
          "The probability of an event in defined as the number of favourable outcomes divided by the total outcomes.",
          "Probability measures how likely an event is to occur, based on the ratio of successful outcomes to all possible outcomes.",
          "It's a way to quantify the likelihood of an event, using the formula: favorable outcomes divided by total outcomes.",
          "This describes how often you can expect an event to happen compared to all possible scenarios.",
          "Probability is essentially a numerical description of how probable an event is based on favorable cases over the total number of cases."
        ]
      }
    ],
    concept_formula: "P(Event) = Number of trials in which the event happened / Total number of trials",
    calculation_required: true,
    parent_concepts: [2, 4]
  },
  {
    concept_id: 8,
    concept_text: [
      {
        question: "What are equally likely outcomes?",
        answers: [
          "If each outcome of an experiment or a trial has the same chance of occurring, the outcomes are said to be equally likely.",
          "Outcomes are considered equally likely when they all have the same probability of happening.",
          "They are called equally likely outcomes because each one is as probable as the others.",
          "When no single outcome has a greater chance of occurring than any other, these are termed equally likely outcomes.",
          "Equally likely implies that every possible result of an action has an identical likelihood of taking place."
        ]
      }
    ],
    concept_formula: "",
    calculation_required: false,
    parent_concepts: [6],
  },
  {
    concept_id: 9,
    concept_text: [
      {
        question: "What are independent events?",
        answers: [
          "Independent events are the events that are not affected by one another. Two events are said to be independent if the occurrence of one event doesn't affect the other event.",
          "Independent events occur without influencing each other's outcomes.",
          "Two events are independent if knowing the result of one does not change the probability of the other.",
          "Events are independent when the occurrence of one does not alter the likelihood of another event happening.",
          "If two events are independent, each event happens without being impacted by whether or not the other has occurred."
        ]
      }
    ],
    concept_formula: "",
    calculation_required: false,
    parent_concepts: [4],
  },
  {
    concept_id: 10,
    concept_text: [
      {
        question: "What are dependent events?",
        answers: [
          "Dependent events are the events that are affected by previous events. If the occurrence of one event affects another event, then the latter event is said to be dependent on the former one.",
          "Dependent events are influenced by the outcomes of others; one event's results can impact the probability of another occurring.",
          "In dependent events, the outcome of one can change how likely it is that another happens.",
          "If knowing something about one event gives information about another, these events are dependent.",
          "Dependent events have linked outcomes, where what happens in one event sways the likelihood of the other."
        ]
      }
    ],
    concept_formula: "",
    calculation_required: false,
    parent_concepts: [4],
  },
  {
    concept_id: 11,
    concept_text: [
      {
        question: "How to calculate the probability of independent events occurring together?",
        answers: [
          "The probability of independent events occurring together is calculated by multiplying the probabilities of each of the independent events.",
          "To find the likelihood of independent events happening simultaneously, multiply the probabilities of each event.",
          "Multiply the probability of each event occurring by itself to get the combined probability.",
          "Take the chance of each separate event happening and multiply them together to get the joint probability.",
          "To get the probability of independent events happening together, you multiply together the probabilities of all events involved."
        ]
      }
    ],
    concept_formula: "P(Event A and Event B) = P(Event A) * P(Event B)",
    calculation_required: false,
    parent_concepts: [6, 9],
  },
  {
    concept_id: 12,
    concept_text: [
      {
        question: "How to calculate the probability of dependent events occurring together?",
        answers: [
          "The probability of two dependent events occurring together is calculated by multiplying the probability of the first event with the probability of second event after the first has occurred.",
          "To find the likelihood of two linked events both happening, multiply the chance of the first event by the chance of the second event, assuming the first one already happened.",
          "Multiply the probability of occurring for event A by the probability that event B will happen given that event A has already occurred.",
          "To determine this, take the probability of your initial event and then multiply it by your subsequent event's conditional probability.",
          "Calculate it by using: Probability of Event 1 multiplied by Probability of Event 2 given that Event 1 has occurred."
        ]
      }
    ],
    concept_formula: "P(Event A and Event B) = P(Event A) * P(Event B after Event A has occurred)",
    calculation_required: true,
    parent_concepts: [6, 9], 
  },
  {
    concept_id: 13,
    concept_text: [
      {
        question: "How to calculate the probability of an event not happening?",
        answers: [
          "The probability of an event not happening is calculated by subtracting the probability of the event happening from 1.",
          "The probability of an event not happening is obtained by subtracting the probability of the event happening from 1.",
          "To find the probability of an event not occurring, subtract the event's probability from 1.",
          "The chance that something won't happen is 1 minus the chance that it will happen.",
          "You get the probability of an event not happening by taking one and subtracting the probability that it does happen."
        ]
      },
      {
        question: "What is the probability of the complement of an event?",
        answers: [
          "The probability of the complement of an event is obtained by subtracting the probability of the event happening from 1.",
          "To find the probability of the complement of an event, simply subtract the likelihood of that event from 1.",
          "If you have the probability of an event, its complement's probability is 1 minus that original probability.",
          "The complement's probability is calculated by taking 1 and subtracting the event's probability from it.",
          "You get a complement's probability by deducting the actual event's chance from one."
        ]
      }
    ],
    concept_formula: "P(Event A not happening) = 1 - P(Event A)",
    calculation_required: true,
    parent_concepts: [6],
  },
  {
    concept_id: 14,
    concept_text: [
      {
        question: "What is the complement of an event?",
        answers: [
          "The set of outcomes of an experiment or a trial in which the event does not occur is called the complement of an event.",
          "The complement of an event includes all possible outcomes that are not part of the event itself.",
          "It refers to everything that can happen except for the event in question.",
          "The complement comprises all outcomes that do not fulfill the condition of the specific event.",
          "This is the group of outcomes where the specified event fails to occur."
        ]
      }
    ],
    concept_formula: "",
    calculation_required: false,
    parent_concepts: [4],
  },
  {
    concept_id: 16,
    concept_text: [
      {
        question: "What is an impossible event?",
        answers: [
          "An impossible event is an event whose probability is 0.",
          "An impossible event is something that cannot happen.",
          "An impossible event is an outcome with no chance of occurring.",
          "An impossible event has zero likelihood of happening.",
          "If an event is impossible, it means it will never occur."
        ]
      }
    ],
    concept_formula: "",
    calculation_required: false,
    parent_concepts: [4],
  },
  {
    concept_id: 17,
    concept_text: [
      {
        question: "What is a certain event or a sure event?",
        answers: [
          "A certain event or a sure event is an event whose probability is 1.",
          "A certain event or a sure event is an event that is guaranteed to happen.",
          "A sure event is one that will definitely occur, without any doubt.",
          "An event with a probability of 1 is considered a certain or sure event.",
          "If the likelihood of an occurrence is 1, then it's termed as a certain or sure event."
        ]
      }
    ],
    concept_formula: "",
    calculation_required: false,
    parent_concepts: [4],
  },
  {
    concept_id: 18,
    concept_text: [
      {
        question: "What is the probability of total outcomes happening?",
        answers: [
          "The probability of the total outcomes of an experiment or a trial is equal to 1.",
          "The sum of all possible outcomes in an experiment is always equal to 1.",
          "When you add up all possible results of an experiment, it always equals 1.",
          "The combined probability of every potential outcome in a trial will total to 100%.",
          "Every complete set of outcomes from an event adds up to one."
        ]
      }
    ],
    concept_formula: "P(Total outcomes) = 1",
    calculation_required: false,
    parent_concepts: [2, 6],
  }
]