export interface Subject {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  name: string;
  subjectId: string;
}

export interface SubTopic {
  id: string;
  name: string;
  topicId: string;
}

export interface TestConfig {
  id?: string;
  name: string;
  subjectId: string;
  topicIds: string[];
  subTopicIds: string[];
  duration: number;
  numQuestions: number;
  totalMarks: number;
  difficulty: 'easy' | 'medium' | 'difficult';
  status: 'draft' | 'live' | 'archived';
  markingScheme: {
    correct: number;
    wrong: number;
    unattempted: number;
  };
  publishSettings?: {
    publishMode: 'now' | 'schedule';
    scheduleDate?: string;
    scheduleTime?: string;
    liveUntil: 'always' | '1week' | '2weeks' | '3weeks' | '1month' | 'custom';
  };
  questionIds?: string[];
  creationDate?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  token?: string;
  jwt?: string;
}
