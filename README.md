# CryptoSense 🚀
### AI-Powered Crypto Intelligence Platform

> **"Should I Buy, Hold, or Sell?"** — CryptoSense answers this using a multi-model AI pipeline combining price prediction, real-time sentiment analysis, and technical signals.

[![Python](https://img.shields.io/badge/Python-3.14-blue?style=flat-square)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.1-green?style=flat-square)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square)](https://reactjs.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.x-EE4C2C?style=flat-square)](https://pytorch.org)

---

## 📌 What is CryptoSense?

CryptoSense is a full-stack AI platform that analyzes cryptocurrency markets using three independent ML models and combines their signals into a single, explainable **Buy / Hold / Sell** recommendation with a confidence score and risk rating.

Most crypto tools give you one signal. CryptoSense gives you **three perspectives — then intelligently combines them.**

---

## 🧠 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     DATA SOURCES                        │
│   CoinGecko API (prices)   +   NewsAPI (headlines)      │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
   ┌──────────┐ ┌─────────┐ ┌──────────────┐
   │   LSTM   │ │FinBERT  │ │Random Forest │
   │          │ │         │ │              │
   │  Price   │ │  News   │ │  Technical   │
   │  Trend   │ │Sentiment│ │   Signals    │
   └────┬─────┘ └────┬────┘ └──────┬───────┘
        │            │             │
        └────────────┼─────────────┘
                     ▼
          ┌─────────────────────┐
          │  Weighted Ensemble  │
          │  LSTM  40%          │
          │  FinBERT  30%       │
          │  Random Forest  30% │
          └──────────┬──────────┘
                     ▼
        ┌────────────────────────┐
        │  BUY / HOLD / SELL     │
        │  Confidence Score      │
        │  Risk Rating (1-10)    │
        └────────────────────────┘
```

---

## 🤖 Models

### 1. LSTM — Price Trend Prediction
- Built from scratch using **PyTorch**
- Trained on 365 days of real Bitcoin price data from CoinGecko
- Uses 30-day sliding window sequences to predict 7-day price direction
- Architecture: 2 stacked LSTM layers (64 neurons each) + Dropout regularization + Dense output
- Outputs: bullish / bearish / neutral price trend signal

### 2. FinBERT — News Sentiment Analysis
- Uses **ProsusAI/FinBERT** — a BERT model fine-tuned specifically on financial news
- Fetches 20 live crypto headlines daily via NewsAPI
- Classifies each headline as Positive / Negative / Neutral with confidence scores
- Upgraded from TextBlob after observing it incorrectly classified "Bitcoin could crash 50%" as Positive — FinBERT correctly marks it Negative (0.78 confidence)
- Outputs: overall market sentiment score

### 3. Random Forest — Technical Signal
- Trained on 5 engineered technical indicators: Daily Returns, MA7, MA21, Volatility, RSI
- **70% accuracy** on held-out test data
- Feature importance analysis revealed MA21 (long-term trend) and Volatility as strongest predictors
- 100 decision trees voting via majority ensemble
- Outputs: Buy / Hold / Sell technical signal

---

## 📊 Sample Output

```json
{
  "coin": "bitcoin",
  "current_price": 81173.32,
  "lstm_prediction": 79037.43,
  "sentiment": "BEARISH",
  "sentiment_score": -0.15,
  "rf_signal": "HOLD",
  "decision": "SELL",
  "risk_score": 6,
  "confidence": 0.70
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| ML Models | PyTorch, scikit-learn, HuggingFace Transformers |
| NLP | FinBERT (ProsusAI), TextBlob |
| Backend | FastAPI, Uvicorn, Python 3.14 |
| Frontend | React 18, Axios, Recharts |
| Data | CoinGecko API, NewsAPI |
| Dev Tools | Jupyter Notebooks, VS Code |

---

## 📁 Project Structure

```
CryptoSense/
├── data/                      → cached price CSVs
├── models/                    → saved trained models
├── notebooks/
│   ├── 01_data_fetch.ipynb    → data pipeline + LSTM training
│   ├── 02_sentiment.ipynb     → FinBERT sentiment module
│   └── 03_ensemble.ipynb      → ensemble signal + RF training
├── backend/
│   └── main.py                → FastAPI server
├── frontend/
│   └── cryptosense-ui/        → React dashboard
└── .env                       → API keys (not committed)
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- NewsAPI key (free at newsapi.org)
- CoinGecko API (free, no key needed)

### Backend Setup
```bash
git clone https://github.com/janvika11/CryptoSense.git
cd CryptoSense
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cd backend
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend/cryptosense-ui
npm install
npm start
```

### Environment Variables
Create a `.env` file in the root:
```
NEWS_API_KEY=your_newsapi_key_here
```

---

## 💡 Key Design Decisions

**Why FinBERT over TextBlob?**
During development, TextBlob classified "Bitcoin could crash 50%" as Positive. FinBERT, trained on financial language, correctly identified it as Negative with 0.78 confidence. Domain-specific models matter.

**Why ensemble over a single model?**
Crypto prices are driven by multiple independent factors — historical patterns, market sentiment, and technical signals. No single model captures all of them. Weighting three independent signals (40/30/30) produces more robust decisions than any model alone.

**Why 40% weight for LSTM?**
Price data is the most direct signal. Sentiment and technicals are supporting signals — important but secondary to what prices are actually doing.

---

## 📈 Results

| Model | Metric | Result |
|---|---|---|
| LSTM | Price trend direction | Captures long-term trend |
| FinBERT | Sentiment accuracy | High confidence (0.78-0.96) per headline |
| Random Forest | Classification accuracy | 70% on test set |
| Ensemble | Combined signal | SELL (Bitcoin, May 12 2026) |

---

## Future Improvements

- [ ] Real-time LSTM inference on every API call
- [ ] Twitter/X sentiment integration
- [ ] Support for 50+ coins
- [ ] Historical signal accuracy tracking
- [ ] Mobile responsive UI
- [ ] WebSocket for live price updates
- [ ] Backtesting module to validate signals against historical data

---

## 👩‍💻 About

Built by **Janvika N** 
