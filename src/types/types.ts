export type MistralModel =
  | 'mistral-small-latest'
  | 'mistral-medium-latest'
  | 'mistral-large-latest';

export interface ChatBody {
  inputCode: string;
  model: MistralModel;
  apiKey?: string | undefined | null;
}
