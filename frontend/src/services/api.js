// api.js - ThreatInk API Service
// Handles all HTTP requests to the FastAPI backend

import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// GET - Check API status
export const checkHealth = () => api.get("/");

// GET - Get available models
export const getModels = () => api.get("/models");

// GET - Get dashboard statistics
export const getStats = () => api.get("/stats");

// POST - Predict single message
export const predictMessage = (text, model = "random_forest") =>
  api.post("/predict", { text, model });

// POST - Predict multiple messages
export const predictBatch = (texts, model = "random_forest") =>
  api.post("/predict/batch", { texts, model });

// DELETE - Clear cache
export const clearCache = () => api.delete("/cache");

export default api;