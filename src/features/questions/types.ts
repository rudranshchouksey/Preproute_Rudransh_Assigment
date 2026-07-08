export interface QuestionOption {
  id: string; // e.g., '1', '2', '3', '4'
  text: string;
}

export interface QuestionDraft {
  stem: string;
  options: QuestionOption[];
  correctOptionId: string;
  mediaUrl?: string;
  explanation?: string;
  difficulty?: string;
  topicId?: string;
  subTopicId?: string;
}

export interface BulkQuestionPayload {
  testId: string;
  questions: QuestionDraft[];
}
