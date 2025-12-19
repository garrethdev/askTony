import { AnalysisResult } from './types';

export const mapAnalysisToStorage = (result: AnalysisResult) => {
  const contractFields = {
    metabolicScore: result.metabolic_score,
    tagKeys: result.tag_keys,
    explanationShort: result.explanation_short
  };
  const analysisPayload = {
    headline: result.headline,
    getsRight: result.gets_right,
    thingsToWatch: result.things_to_watch,
    confidence: result.confidence,
    modelVersion: result.model_version
  };
  return { contractFields, analysisPayload };
};

