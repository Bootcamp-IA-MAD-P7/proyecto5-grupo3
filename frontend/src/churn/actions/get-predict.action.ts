import { predictApi } from '../api/predict.api';
import type { PredictResponse } from '../types/predict.response';

export const getPredictAction = async () => {
  const { data } = await predictApi.get<PredictResponse>('/predict');

  return data;
};