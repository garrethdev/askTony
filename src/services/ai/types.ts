export interface LlmClient {
  chatJson(input: {
    system: string;
    user: string;
    images?: { url: string }[];
  }): Promise<string>;
}

export interface AnalysisResult {
  headline: string;
  metabolic_score: number;
  tag_keys: string[];
  gets_right: string[];
  things_to_watch: string[];
  explanation_short: string;
  confidence: number;
  model_version: string;
}

