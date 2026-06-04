# ThreatInk — Spam Messages Detection Web Application

**COS30049 Computing Technology Innovation Project**
Section C1 · Group 05 · Swinburne University of Technology · 2026 Semester 3

| Student | ID |
|---|---|
| Yan Min Xuan Shanice | 106214470 |
| Soh Way Miin | 105967029 |
| Tan Jun Xiong | 105971619 |

---

## Overview

ThreatInk is a full-stack machine learning web application that classifies messages as spam or legitimate in real time. Users submit any message or email, choose from four ML models, and receive an instant verdict with confidence score, risk assessment, and feature breakdown.

---

## Features

- **Real-time spam detection** — powered by four pre-trained scikit-learn classifiers
- **Model selection** — Random Forest, Logistic Regression, Linear SVM, Naive Bayes
- **Risk scoring** — continuous 0–1 score from a Gradient Boosting regressor
- **Feature analysis** — word count, URL count, spam keyword count, exclamation count
- **Analytics dashboard** — four interactive D3.js charts (donut, grouped bar, horizontal bar, radar)
- **Export results** — download prediction as JSON or CSV
- **Light / Dark mode** — toggle between beige light theme and deep navy dark theme
- **Fully responsive** — works on desktop and mobile (local network access)
- **Recent analyses history** — last 10 predictions shown with timestamps

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, Material UI, D3.js v7, Axios, React Router |
| Backend | FastAPI, Python 3.12, Uvicorn, Pydantic, Joblib |
| ML Models | Scikit-learn (Random Forest, Logistic Regression, Linear SVM, Naive Bayes, Gradient Boosting), NLTK, Pandas, NumPy |

---

## Project Structure

```
COS30049_Group5/
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Detector.jsx
│       │   ├── Dashboard.jsx
│       │   └── About.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── Footer.jsx
│       ├── services/
│       │   └── api.js
│       ├── App.jsx
│       └── main.jsx
└── backend/
    ├── main.py
    ├── predict.py
    ├── requirements.txt
    └── models/
        ├── tfidf_vectorizer.pkl
        ├── classifier_rf.pkl
        ├── classifier_lr.pkl
        ├── classifier_nb.pkl
        ├── classifier_svm.pkl
        ├── regressor.pkl
        ├── kmeans.pkl
        ├── scaler.pkl
        └── svd_lsa.pkl
```

---

## Setup & Running

### Backend

```bash
cd backend
pip install -r requirements.txt
python -c "import nltk; nltk.download('stopwords'); nltk.download('punkt'); nltk.download('punkt_tab')"
uvicorn main:app --reload --host 0.0.0.0
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Access

| Platform | URL |
|---|---|
| Desktop | http://localhost:5173 |
| Mobile (same WiFi) | http://192.168.100.18:5173 |
| API documentation | http://127.0.0.1:8000/docs |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/models` | List available ML models |
| GET | `/stats` | Dashboard statistics |
| POST | `/predict` | Single message prediction |
| POST | `/predict/batch` | Batch prediction (max 50) |
| DELETE | `/cache` | Clear prediction cache |

---

## Model Performance

| Model | Accuracy | F1 Score | ROC-AUC |
|---|---|---|---|
| Random Forest *(default)* | 97.46% | 0.9740 | 0.9965 |
| Linear SVM | 96.91% | 0.9683 | 0.9956 |
| Logistic Regression | 96.51% | 0.9643 | 0.9950 |
| Naive Bayes | 93.41% | 0.9335 | 0.9868 |

Trained on 94,298 combined email and SMS records using TF-IDF vectorization with 5,000 features.
