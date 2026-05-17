"""
predict.py - ThreatInk Spam Detection
Handles model loading and prediction logic
"""

import joblib
import os
import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize
import numpy as np
from scipy.sparse import hstack, csr_matrix

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")

# ─── Load Models ──────────────────────────────────────────────────────────────
print("Loading models...")

tfidf       = joblib.load(os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl"))
clf_rf      = joblib.load(os.path.join(MODELS_DIR, "classifier_rf.pkl"))
clf_lr      = joblib.load(os.path.join(MODELS_DIR, "classifier_lr.pkl"))
clf_nb      = joblib.load(os.path.join(MODELS_DIR, "classifier_nb.pkl"))
clf_svm     = joblib.load(os.path.join(MODELS_DIR, "classifier_svm.pkl"))
regressor   = joblib.load(os.path.join(MODELS_DIR, "regressor.pkl"))
scaler      = joblib.load(os.path.join(MODELS_DIR, "scaler.pkl"))
kmeans      = joblib.load(os.path.join(MODELS_DIR, "kmeans.pkl"))
svd_lsa     = joblib.load(os.path.join(MODELS_DIR, "svd_lsa.pkl"))

print("All models loaded successfully!")

# ─── Text Preprocessing ───────────────────────────────────────────────────────
stop_words = set(stopwords.words("english"))
stemmer    = PorterStemmer()

SPAM_KEYWORDS = [
    "free", "win", "winner", "cash", "prize", "claim", "offer",
    "urgent", "guaranteed", "congratulations", "click", "subscribe",
    "unlimited", "bonus", "discount", "deal", "credit", "loan", "earn"
]

def preprocess_text(text: str) -> str:
    """Clean and preprocess input text."""
    text = str(text).lower()
    text = re.sub(r"subject\s*:", "", text)          # remove email subject prefix
    text = re.sub(r"<[^>]+>", " ", text)             # strip HTML tags
    text = re.sub(r"http\S+|www\.\S+", " url ", text) # replace URLs
    text = re.sub(r"\$+", " dollar ", text)           # replace $ signs
    text = re.sub(r"\b\d+\b", " number ", text)       # replace numbers
    text = text.translate(str.maketrans("", "", string.punctuation))
    tokens = word_tokenize(text)
    tokens = [stemmer.stem(t) for t in tokens if t not in stop_words and len(t) > 1]
    return " ".join(tokens)

def extract_features(text: str) -> list:
    """Extract engineered numerical features from raw text."""
    words = text.split()
    return [
        len(text),                                                        # char_count
        len(words),                                                       # word_count
        text.count("!"),                                                  # exclaim_count
        text.count("$"),                                                  # dollar_count
        sum(1 for c in text if c.isupper()) / max(len(text), 1),         # upper_ratio
        text.lower().count("http") + text.lower().count("www"),          # url_count
        np.mean([len(w) for w in words]) if words else 0,                # avg_word_len
        sum(1 for kw in SPAM_KEYWORDS if kw in text.lower()),            # spam_keyword_count
    ]

# ─── Prediction ───────────────────────────────────────────────────────────────
MODEL_MAP = {
    "random_forest":     clf_rf,
    "logistic_regression": clf_lr,
    "naive_bayes":       clf_nb,
    "linear_svm":        clf_svm,
}

def predict(text: str, model_name: str = "random_forest") -> dict:
    """
    Run spam detection on input text.
    Returns label, confidence, risk_score, cluster, and feature stats.
    """
    # 1. Preprocess
    clean = preprocess_text(text)

    # 2. TF-IDF vectorization
    tfidf_vec = tfidf.transform([clean])

    # 3. Engineered features (scaled)
    num_features = np.array(extract_features(text)).reshape(1, -1)
    num_scaled   = scaler.transform(num_features)

    # 4. Combined feature matrix
    X_combined = hstack([tfidf_vec, csr_matrix(num_scaled)])

    # 5. Classification
    clf = MODEL_MAP.get(model_name, clf_rf)
    prediction = int(clf.predict(X_combined)[0])
    label = "spam" if prediction == 1 else "ham"

    # 6. Confidence score
    if hasattr(clf, "predict_proba"):
        proba = clf.predict_proba(X_combined)[0]
        confidence = float(round(max(proba), 4))
    else:
        # LinearSVC uses decision_function
        score = clf.decision_function(X_combined)[0]
        confidence = float(round(1 / (1 + np.exp(-abs(score))), 4))

    # 7. Risk score from regressor
    risk_score = float(round(float(regressor.predict(num_scaled)[0]), 4))
    risk_score = max(0.0, min(1.0, risk_score))

    # 8. Cluster assignment
    lsa_vec = svd_lsa.transform(tfidf_vec)
    cluster = int(kmeans.predict(lsa_vec)[0])

    # 9. Feature breakdown (for frontend display)
    raw_features = extract_features(text)
    feature_names = [
        "char_count", "word_count", "exclaim_count", "dollar_count",
        "upper_ratio", "url_count", "avg_word_len", "spam_keyword_count"
    ]
    features_dict = {feature_names[i]: raw_features[i] for i in range(len(feature_names))}

    return {
        "label":       label,
        "is_spam":     prediction == 1,
        "confidence":  confidence,
        "risk_score":  risk_score,
        "cluster":     cluster,
        "model_used":  model_name,
        "features":    features_dict,
        "clean_text":  clean,
    }