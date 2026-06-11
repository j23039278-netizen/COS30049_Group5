# ThreatInk — Spam Messages Detection Web Application

**COS30049 Computing Technology Innovation Project**
**CI Group 05 | Section C1 | 2026 Semester 3**

|Student Name        |Swinburne ID|
|--------------------|------------|
|Yan Min Xuan Shanice|106214470   |
|Soh Way Miin        |105967029   |
|Tan Jun Xiong       |105971619   |

-----

## Project Overview

ThreatInk is a full-stack machine learning web application for real-time spam message detection. It integrates a React.js frontend with a FastAPI backend, powered by four machine learning models trained on 94,298 email and SMS records.

**Features:**

- Real-time spam/ham classification with confidence scores
- Risk scoring (0.0 – 1.0) using Gradient Boosting regressor
- Four ML models: Random Forest (97.46%), Linear SVM, Logistic Regression, Naive Bayes
- Interactive analytics dashboard with 4 D3.js chart types
- Light / Dark mode toggle
- Export results as JSON or CSV
- **Dynamic explanation** — natural-language breakdown of why a message was classified, based on confidence, risk score, keyword count, URLs, and exclamation frequency

-----

## Project Structure

```
COS30049_Group5/
├── backend/
│   ├── main.py               # FastAPI server, API endpoints, CORS config
│   ├── predict.py            # Text preprocessing + ML prediction pipeline
│   ├── requirements.txt      # Python dependencies
│   └── models/               # 9 serialized .pkl model files
│       ├── tfidf_vectorizer.pkl
│       ├── classifier_rf.pkl
│       ├── classifier_lr.pkl
│       ├── classifier_nb.pkl
│       ├── classifier_svm.pkl
│       ├── regressor.pkl
│       ├── kmeans.pkl
│       ├── scaler.pkl
│       └── svd_lsa.pkl
├── frontend/
│   ├── public/
│   │   └── threatink-logo.svg
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Detector.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── About.jsx
│   │   ├── components/
│   │   │   ├── charts/
│   │   │   │   ├── chartUtils.js     # Shared D3 tooltip helpers
│   │   │   │   ├── D3PieChart.jsx
│   │   │   │   ├── D3BarChart.jsx
│   │   │   │   ├── D3KeywordChart.jsx
│   │   │   │   └── D3RadarChart.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── services/
│   │   │   └── api.js        # Axios API service
│   │   ├── App.jsx           # Router + Theme provider
│   │   ├── index.css         # Global styles + custom scrollbar
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── data/                     # Raw training datasets (CSV)
├── notebooks/
│   ├── figures/              # Assignment 2 visualisation outputs
│   ├── data/
│   └── ThreatInk_SpamDetection.ipynb
└── ReadMe.md
```

-----

## Requirements

### Backend

- Python 3.12 (**must use 3.12 — other versions may cause dependency conflicts**)
- pip

### Frontend

- Node.js v20+
- npm 10+

-----

## Setup & Running Instructions

### 1. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install Python dependencies (must use Python 3.12)
py -3.12 -m pip install -r requirements.txt

# Download NLTK data (first time only)
py -3.12 -c "import nltk; nltk.download('stopwords'); nltk.download('punkt'); nltk.download('punkt_tab')"

# Start the backend server
py -3.12 -m uvicorn main:app --reload --host 0.0.0.0
```

> ⚠️ **Important:** Use `py -3.12` explicitly to ensure Python 3.12 is used. Running `pip` or `uvicorn` directly may invoke a different Python version and cause dependency failures.

Backend runs at: **<http://127.0.0.1:8000>**
API documentation: **<http://127.0.0.1:8000/docs>**

-----

### 2. Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install Node dependencies
npm install

# Start the frontend dev server
npm run dev
```

Frontend runs at: **<http://localhost:5173>**

> ⚠️ **Important:** Use **Google Chrome** for the best experience. Microsoft Edge may cause CORS caching issues with this application.

-----

## API Endpoints

|Method|Endpoint        |Description              |
|------|----------------|-------------------------|
|GET   |`/`             |Health check             |
|GET   |`/models`       |List available ML models |
|GET   |`/stats`        |Dashboard statistics     |
|POST  |`/predict`      |Single message prediction|
|POST  |`/predict/batch`|Batch prediction (max 50)|
|DELETE|`/cache`        |Clear server cache       |

### Example: POST /predict

**Request:**

```json
{
  "text": "Congratulations! You've won a free iPhone. Click here now!",
  "model": "random_forest"
}
```

**Response:**

```json
{
  "label": "spam",
  "is_spam": true,
  "confidence": 0.97,
  "risk_score": 0.89,
  "model_used": "random_forest",
  "cluster": 1,
  "features": {
    "word_count": 10,
    "url_count": 0,
    "exclaim_count": 1,
    "spam_keyword_count": 3
  },
  "clean_text": "congratul won free iphon click"
}
```

-----

## AI Model Integration

Models trained in Assignment 2 on 94,298 records (emails + SMS):

|Model              |Accuracy|F1 Score|ROC-AUC|
|-------------------|--------|--------|-------|
|Random Forest ⭐    |97.46%  |0.9740  |0.9965 |
|Linear SVM         |96.91%  |0.9683  |0.9956 |
|Logistic Regression|96.51%  |0.9643  |0.9950 |
|Naive Bayes        |93.41%  |0.9335  |0.9868 |

**Prediction pipeline:**

1. Lowercase, HTML removal, URL → `url` token
1. Punctuation removal, NLTK stopword filtering
1. Porter Stemmer stemming
1. TF-IDF vectorization (5,000 features)
1. Classification → label + confidence
1. Gradient Boosting → risk score
1. K-Means + LSA → cluster assignment

-----

## Tech Stack

|Layer   |Technology                                                |
|--------|----------------------------------------------------------|
|Frontend|React.js, Vite, Material UI, D3.js v7, Axios, React Router|
|Backend |FastAPI, Python 3.12, Uvicorn, Pydantic, Joblib           |
|ML      |Scikit-learn, NLTK, Pandas, NumPy                         |

-----