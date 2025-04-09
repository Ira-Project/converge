import { type KnowledgeZapQuestionType } from "@/lib/constants";

export interface MultipleChoiceOption {
  id: string;
  option: string;
  imageUrl?: string | null;
}

export interface MultipleChoiceVariant {
  id: string;
  question: string;
  imageUrl?: string | null;
  options: MultipleChoiceOption[];
}

export interface MatchingVariant {
  id: string;
  question: string;
  imageUrl?: string | null;
  optionAs: string[];
  optionBs: string[];
}

export interface OrderingVariant {
  id: string;
  question: string;
  options: MultipleChoiceOption[];
  isDescending: boolean;
  topLabel: string;
  bottomLabel: string;
}

export type KnowledgeZapQuestionObjects = {
  id: string;
  type: KnowledgeZapQuestionType.MULTIPLE_CHOICE;
  variants: MultipleChoiceVariant[];
} | {
  id: string;
  type: KnowledgeZapQuestionType.MATCHING;
  variants: MatchingVariant[];
} | {
  id: string;
  type: KnowledgeZapQuestionType.ORDERING;
  variants: OrderingVariant[];
}

export interface Match {
  optionA: string;
  optionB: string;
}
