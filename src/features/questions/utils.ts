import { QuestionDraft } from './types';

// The schema the backend expects
export interface ApiQuestion {
  id?: string;
  type: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: string;
  subject?: string;
  topic?: string;
  sub_topic?: string;
  difficulty?: string;
  explanation?: string;
  media_url?: string;
}

export function mapDraftToApi(draft: QuestionDraft, additionalData?: Partial<ApiQuestion>): ApiQuestion {
  const apiPayload: ApiQuestion = {
    type: 'mcq', // Currently hardcoded to mcq as mock failed and mcq is required
    question: draft.stem || '',
    option1: draft.options[0]?.text || '',
    option2: draft.options[1]?.text || '',
    option3: draft.options[2]?.text || '',
    option4: draft.options[3]?.text || '',
    correct_option: draft.options.find(o => o.id === draft.correctOptionId)?.text || draft.correctOptionId || '',
    difficulty: draft.difficulty || additionalData?.difficulty || 'medium',
    explanation: draft.explanation || '',
    media_url: draft.mediaUrl || '',
  };

  const subject = additionalData?.subject;
  const topic = draft.topicId || additionalData?.topic;
  const subTopic = draft.subTopicId || additionalData?.sub_topic;

  if (subject) apiPayload.subject = subject;
  if (topic) apiPayload.topic = topic;
  if (subTopic) apiPayload.sub_topic = subTopic;

  return apiPayload;
}

export function mapApiToDraft(apiData: any): QuestionDraft {
  const options = [
    { id: '1', text: apiData.option1 || '' },
    { id: '2', text: apiData.option2 || '' },
    { id: '3', text: apiData.option3 || '' },
    { id: '4', text: apiData.option4 || '' },
  ];

  let correctOptionId = '1';
  // Attempt to match the exact text back to an option ID
  if (apiData.correct_option) {
    const matched = options.find(o => o.text === apiData.correct_option);
    if (matched) {
      correctOptionId = matched.id;
    } else {
      // Fallback in case it's actually storing the ID or something else
      const possibleId = options.find(o => o.id === apiData.correct_option || `Option ${o.id}` === apiData.correct_option);
      if (possibleId) correctOptionId = possibleId.id;
    }
  }

  return {
    stem: apiData.question || '',
    options,
    correctOptionId,
    mediaUrl: apiData.media_url || '',
    explanation: apiData.explanation || '',
    difficulty: apiData.difficulty || '',
    topicId: apiData.topic || '',
    subTopicId: apiData.sub_topic || '',
  };
}
