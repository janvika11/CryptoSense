import { useState } from "react";
import axios from "axios";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, RadialBarChart, RadialBar
} from "recharts";

const C = {
  bg: "#080b14",
  surface: "#0d1120",
  border: "#1a2040",
  gold: "#f0a500",
  green: "#00e676",
  red: "#ff3d57",
  yellow: "#ffd740",
  muted: "#3a4060",
  text: "#c8d0e8",
  dim: "#5a6080",
};

const Tag = ({ children, color }) => (
  <span style={{
    padding: "3px 10px", borderRadius: "3px", fontSize: "11px",
    letterSpacing: "0.12em", fontWeight: "bold", textTransform: "uppercase",
    background: color + "22", color, border: `1px solid ${color}44`
  }}>{children}</span>
);

const Card = ({ label, value, sub, color = C.gold }) => (
  <div style={{
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: "8px", padding: "24px 28px", flex: 1
  }}>
    <div style={{ fontSize: "10px", letterSpacing: "0.25em", color: C.dim, textTransform: "uppercase", marginBottom: "10px" }}>{label}</div>
    <div style={{ fontSize: "26px", color, fontFamily: "'Georgia', serif", marginBottom: "4px" }}>{value}</div>
    {sub && <div style={{ fontSize: "12px", color: C.dim }}>{sub}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "10px 14px" }}>
        <div style={{ color: C.dim, fontSize: "11px", marginBottom: "4px" }}>{label}</div>
        <div style={{ color: C.gold, fontSize: "15px", fontFamily: "'Georgia', serif" }}>
          ${Number(payload[0].value).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      </div>
    );
  }
  return null;
};

export default function App() {
  const [coin, setCoin] = useState("bitcoin");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/analyze/${coin}`);
      if (res.data.error) { setError(res.data.error); setData(null); }
      else setData(res.data);
    } catch { setError("Cannot connect to backend. Is it running?"); }
    setLoading(false);
  };

  const decisionColor = data?.decision === "BUY" ? C.green : data?.decision === "SELL" ? C.red : C.yellow;
  const sentColor = data?.sentiment === "BULLISH" ? C.green : C.red;

  const riskData = data ? [{ name: "risk", value: data.risk_score * 10, fill: data.risk_score > 6 ? C.red : data.risk_score > 4 ? C.yellow : C.green }] : [];

  const priceChange = data ? ((data.lstm_prediction - data.current_price) / data.current_price * 100).toFixed(2) : null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Georgia', serif" }}>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "18px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surface }}>
        <div>
          <span style={{ fontSize: "22px", letterSpacing: "0.08em", color: C.text }}>CRYPTO</span>
          <span style={{ fontSize: "22px", letterSpacing: "0.08em", color: C.gold }}>SENSE</span>
          <div style={{ fontSize: "10px", color: C.dim, letterSpacing: "0.25em", textTransform: "uppercase", marginTop: "2px" }}>AI Intelligence Platform</div>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <select value={coin} onChange={e => setCoin(e.target.value)} style={{
            padding: "10px 16px", background: C.bg, color: C.text,
            border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "13px",
            cursor: "pointer", outline: "none", letterSpacing: "0.05em"
          }}>
            <option value="bitcoin">Bitcoin — BTC</option>
            <option value="ethereum">Ethereum — ETH</option>
            <option value="solana">Solana — SOL</option>
          </select>
          <button onClick={analyze} disabled={loading} style={{
            padding: "10px 28px", background: loading ? C.muted : C.gold,
            color: "#000", border: "none", borderRadius: "6px", fontSize: "12px",
            fontWeight: "bold", letterSpacing: "0.15em", textTransform: "uppercase",
            cursor: loading ? "not-allowed" : "pointer"
          }}>
            {loading ? "Analyzing..." : "Run Analysis"}
          </button>
        </div>
      </div>

      <div style={{ padding: "32px 40px" }}>
        {error && (
          <div style={{ background: C.red + "22", border: `1px solid ${C.red}44`, borderRadius: "8px", padding: "16px 20px", color: C.red, marginBottom: "24px" }}>
            {error}
          </div>
        )}

        {!data && !error && (
          <div style={{ textAlign: "center", padding: "80px 0", color: C.dim }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
            <div style={{ fontSize: "14px", letterSpacing: "0.2em", textTransform: "uppercase" }}>Select a coin and run analysis</div>
          </div>
        )}

        {data && (
          <>
            {/* Top stat cards */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
              <Card label="Current Price" value={`$${data.current_price.toLocaleString()}`} sub={`${data.coin.toUpperCase()}/USD`} />
              <Card
                label="7-Day LSTM Forecast"
                value={`$${data.lstm_prediction.toLocaleString()}`}
                sub={`${priceChange > 0 ? "▲" : "▼"} ${Math.abs(priceChange)}% projected`}
                color={priceChange > 0 ? C.green : C.red}
              />
              <Card label="Market Sentiment" value={data.sentiment} sub="FinBERT · 20 headlines" color={sentColor} />
              <Card label="RF Signal" value={data.rf_signal} sub="Random Forest · 70% accuracy" color={C.yellow} />
            </div>

            {/* Chart + Decision row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "16px", marginBottom: "24px" }}>

              {/* Price chart */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: C.dim, textTransform: "uppercase" }}>Price History</div>
                    <div style={{ fontSize: "14px", color: C.text, marginTop: "4px" }}>Last 30 Days</div>
                  </div>
                  <Tag color={C.gold}>LSTM Trained</Tag>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={data.chart_data}>
                    <defs>
                      <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.gold} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={C.gold} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: C.dim }} tickLine={false} axisLine={false} interval={4} />
                    <YAxis tick={{ fontSize: 10, fill: C.dim }} tickLine={false} axisLine={false}
                      tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} domain={["auto", "auto"]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="price" stroke={C.gold} strokeWidth={2} fill="url(#priceGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Decision panel */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "28px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: "10px", letterSpacing: "0.25em", color: C.dim, textTransform: "uppercase", marginBottom: "8px" }}>AI Signal</div>
                <div style={{ width: "40px", height: "2px", background: C.gold, marginBottom: "20px" }}></div>
                <div style={{ fontSize: "52px", color: decisionColor, fontFamily: "'Georgia', serif", letterSpacing: "0.05em", marginBottom: "8px" }}>
                  {data.decision}
                </div>
                <div style={{ fontSize: "12px", color: C.dim, marginBottom: "24px" }}>
                  Confidence — {(data.confidence * 100).toFixed(0)}%
                </div>

                {/* Risk radial */}
                <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: C.dim, textTransform: "uppercase", marginBottom: "8px" }}>Risk Score</div>
                <RadialBarChart width={120} height={120} cx={60} cy={60} innerRadius={35} outerRadius={55} data={riskData} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={6} background={{ fill: C.border }} />
                </RadialBarChart>
                <div style={{ fontSize: "24px", color: riskData[0]?.fill, marginTop: "8px", fontFamily: "'Georgia', serif" }}>
                  {data.risk_score}<span style={{ fontSize: "14px", color: C.dim }}>/10</span>
                </div>
              </div>
            </div>

            {/* Model weights */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "24px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: C.dim, textTransform: "uppercase", marginBottom: "20px" }}>Ensemble Weights</div>
              <div style={{ display: "flex", gap: "0", borderRadius: "6px", overflow: "hidden", height: "36px" }}>
                {[
                  { label: "LSTM", pct: 40, color: C.gold },
                  { label: "FinBERT", pct: 30, color: "#7c6af5" },
                  { label: "Random Forest", pct: 30, color: C.green },
                ].map(m => (
                  <div key={m.label} style={{ width: `${m.pct}%`, background: m.color + "33", borderRight: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: m.color }}></div>
                    <span style={{ fontSize: "11px", color: m.color, letterSpacing: "0.1em" }}>{m.label} {m.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}