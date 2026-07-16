// @path: frontend/src/churn/api/predict.api.ts
import axios from 'axios';
import type { SavedPrediction } from '../types/predict.interface';
import type { ModelAllResponse, PredictionsResponse } from '../types/predict.response';

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: BASE_URL,
});

export const getModelAll = () =>
    api.get<ModelAllResponse>('/model/all').then((r) => r.data);

export const getPredictions = () =>
    api.get<PredictionsResponse>('/predictions').then((r) => r.data);

export const savePrediction = (data: Record<string, unknown>) =>
    api.post<SavedPrediction>('/predict', data).then((r) => r.data);
