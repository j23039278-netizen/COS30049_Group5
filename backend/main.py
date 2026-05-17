"""
main.py - ThreatInk FastAPI Backend
Spam Detection API Server
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import pandas as pd
import os
from predict import predict, MODEL_MAP

# ─── App Setup ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="ThreatInk Spam Detection API",
    description="API for detecting spam messages using machine learning",
    version="1.0.0"
)

# Allow React frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Request / Response Models ────────────────────────────────────────────────
class PredictRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Message text to classify")
    model: Optional[str] = Field("random_forest", description="Model to use for prediction")

class PredictResponse(BaseModel):
    label: str
    is_spam: bool
    confidence: float
    risk_score: float
    cluster: int
    model_used: str
    features: dict
    clean_text: str

class BatchPredictRequest(BaseModel):
    texts: list[str] = Field(..., min_length=1, max_length=50)
    model: Optional[str] = "random_forest"

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "app": "ThreatInk Spam Detection API",
        "version": "1.0.0"
    }

@app.get("/models")
def get_models():
    """GET - Returns list of available ML models"""
    return {
        "models": list(MODEL_MAP.keys()),
        "default": "random_forest"
    }

@app.post("/predict", response_model=PredictResponse)
def predict_single(request: PredictRequest):
    """POST - Predict if a single message is spam or ham"""
    # Validate model name
    if request.model not in MODEL_MAP:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid model '{request.model}'. Available: {list(MODEL_MAP.keys())}"
        )
    # Validate text
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    try:
        result = predict(request.text, request.model)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict/batch")
def predict_batch(request: BatchPredictRequest):
    """POST - Predict multiple messages at once (max 50)"""
    if not request.texts:
        raise HTTPException(status_code=400, detail="No texts provided.")
    if request.model not in MODEL_MAP:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid model. Available: {list(MODEL_MAP.keys())}"
        )
    results = []
    for text in request.texts:
        if not text.strip():
            results.append({"error": "Empty text", "text": text})
            continue
        try:
            result = predict(text, request.model)
            result["original_text"] = text
            results.append(result)
        except Exception as e:
            results.append({"error": str(e), "text": text})

    spam_count = sum(1 for r in results if r.get("is_spam"))
    return {
        "total": len(results),
        "spam_count": spam_count,
        "ham_count": len(results) - spam_count,
        "results": results
    }

@app.get("/stats")
def get_stats():
    """GET - Returns dataset statistics for dashboard charts"""
    try:
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(BASE_DIR, "..", "data", "spam_processed.csv")
        df = pd.read_csv(data_path)

        # Class distribution
        class_dist = df["spam"].value_counts().to_dict()

        # Average feature stats by class
        feature_cols = ["char_count", "word_count", "exclaim_count",
                        "dollar_count", "upper_ratio", "url_count",
                        "avg_word_len", "spam_keyword_count"]

        available_cols = [c for c in feature_cols if c in df.columns]
        avg_features = {}
        if available_cols:
            avg_features = df.groupby("spam")[available_cols].mean().round(3).to_dict()

        # Top spam keywords (static from training)
        top_keywords = [
            {"keyword": "win",    "spam": 28500, "ham": 800},
            {"keyword": "offer",  "spam": 22000, "ham": 1200},
            {"keyword": "free",   "spam": 20000, "ham": 1500},
            {"keyword": "click",  "spam": 18000, "ham": 900},
            {"keyword": "deal",   "spam": 15000, "ham": 700},
            {"keyword": "claim",  "spam": 14000, "ham": 400},
            {"keyword": "cash",   "spam": 12000, "ham": 300},
            {"keyword": "credit", "spam": 10000, "ham": 600},
        ]

        return {
            "class_distribution": {
                "ham":  int(class_dist.get(0, 0)),
                "spam": int(class_dist.get(1, 0)),
                "total": len(df)
            },
            "avg_features_by_class": avg_features,
            "top_spam_keywords": top_keywords,
            "model_performance": {
                "naive_bayes":          {"accuracy": 0.9341, "f1": 0.9335, "roc_auc": 0.9868},
                "logistic_regression":  {"accuracy": 0.9651, "f1": 0.9643, "roc_auc": 0.9950},
                "linear_svm":           {"accuracy": 0.9691, "f1": 0.9683, "roc_auc": 0.9956},
                "random_forest":        {"accuracy": 0.9746, "f1": 0.9740, "roc_auc": 0.9965},
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stats error: {str(e)}")

@app.delete("/cache")
def clear_cache():
    """DELETE - Simulated cache clear endpoint"""
    return {"status": "success", "message": "Cache cleared successfully."}