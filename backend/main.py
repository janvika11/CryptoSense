from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pandas as pd
import os
import requests as req
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")

app = FastAPI(title="CryptoSense API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "CryptoSense API is running!"}

@app.get("/analyze/{coin}")
def analyze(coin: str = "bitcoin"):
    filename = f"../data/{coin}_365days.csv"

    if not os.path.exists(filename):
        url = f"https://api.coingecko.com/api/v3/coins/{coin}/market_chart"
        params = {"vs_currency": "usd", "days": 365}
        response = req.get(url, params=params).json()

        if "error" in response:
            return {"error": "Rate limited! Try again in 2 mins"}

        prices = response["prices"]
        df = pd.DataFrame(prices, columns=["timestamp", "price"])
        df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
        df.to_csv(filename, index=False)
        print(f"Saved {coin} data!")
    else:
        df = pd.read_csv(filename)
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        print(f"Loaded {coin} from file!")

    current_price = df["price"].iloc[-1]

    # last 30 days for chart
    chart_data = df.tail(30)[["timestamp", "price"]].copy()
    chart_data["timestamp"] = chart_data["timestamp"].dt.strftime("%b %d")
    chart_list = chart_data.to_dict(orient="records")

    return {
        "coin": coin,
        "current_price": round(current_price, 2),
        "lstm_prediction": round(current_price * 0.97, 2),
        "sentiment": "BEARISH",
        "sentiment_score": -0.15,
        "rf_signal": "HOLD",
        "decision": "SELL",
        "risk_score": 6,
        "confidence": 0.70,
        "chart_data": chart_list
    }