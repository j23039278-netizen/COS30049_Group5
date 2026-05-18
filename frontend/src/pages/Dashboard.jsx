// Dashboard.jsx - ThreatInk Data Visualization Dashboard
import { useState, useEffect } from "react";
import {
  Box, Container, Typography, Card, CardContent,
  CircularProgress, Alert, useTheme,
} from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { getStats } from "../services/api";

const COLORS = ["#66bb6a", "#ef5350"];

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{
        bgcolor: isDark ? "#1e1e2e" : "#ffffff",
        border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
        borderRadius: 2, p: 1.5,
        boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.1)",
      }}>
        <Typography variant="caption" color={isDark ? "grey.300" : "grey.700"}>{label}</Typography>
        {payload.map((p, i) => (
          <Typography key={i} variant="body2" sx={{ color: p.color, fontWeight: 700 }}>
            {p.name}: {typeof p.value === "number" && p.value < 2
              ? (p.value * 100).toFixed(1) + "%"
              : p.value.toLocaleString()}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

export default function Dashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const textColor = isDark ? "#aaa" : "#555";
  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)";
  const cardBorder = isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(239,83,80,0.1)";

  useEffect(() => {
    getStats()
      .then((res) => setStats(res.data))
      .catch(() => setError("Failed to load stats. Make sure the backend is running."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <CircularProgress color="primary" />
    </Box>
  );

  if (error) return (
    <Container sx={{ py: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Container>
  );

  const classData = [
    { name: "Ham (Legitimate)", value: stats.class_distribution.ham, fill: "#66bb6a" },
    { name: "Spam",             value: stats.class_distribution.spam, fill: "#ef5350" },
  ];

  const modelData = Object.entries(stats.model_performance).map(([name, metrics]) => ({
    name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    Accuracy: metrics.accuracy,
    F1: metrics.f1,
    "ROC-AUC": metrics.roc_auc,
  }));

  const keywordData = stats.top_spam_keywords.map((k) => ({
    keyword: k.keyword,
    Spam: k.spam,
    Ham: k.ham,
  }));

  const radarData = Object.entries(stats.model_performance).map(([name, m]) => ({
    model: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).split(" ")[0],
    Accuracy: +(m.accuracy * 100).toFixed(1),
    F1: +(m.f1 * 100).toFixed(1),
    ROCAUC: +(m.roc_auc * 100).toFixed(1),
  }));

  return (
    <Box sx={{
      minHeight: "100vh",
      background: isDark
        ? "linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)"
        : "linear-gradient(180deg, #f5f7fa 0%, #e8eef7 100%)",
      transition: "background 0.3s ease",
      py: 4,
    }}>
      <Container maxWidth="lg">

        {/* Header */}
        <Typography variant="h4" fontWeight={800} textAlign="center" sx={{
          mb: 1,
          background: "linear-gradient(135deg, #ef5350 0%, #42a5f5 100%)",
          backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Analytics Dashboard
        </Typography>
        <Typography variant="body1" color={isDark ? "grey.400" : "grey.600"} textAlign="center" sx={{ mb: 4 }}>
          Dataset statistics and model performance visualizations.
        </Typography>

        {/* Summary Cards - flex row */}
        <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
          {[
            { label: "Total Records",  value: stats.class_distribution.total.toLocaleString(), color: "#42a5f5" },
            { label: "Spam Messages",  value: stats.class_distribution.spam.toLocaleString(),  color: "#ef5350" },
            { label: "Ham Messages",   value: stats.class_distribution.ham.toLocaleString(),   color: "#66bb6a" },
            { label: "Best Accuracy",  value: "97.46%",                                        color: "#ffa726" },
          ].map((s) => (
            <Card key={s.label} sx={{
              flex: 1, textAlign: "center", py: 2,
              bgcolor: cardBg, border: cardBorder,
              "&:hover": { transform: "translateY(-4px)", boxShadow: isDark ? "0 8px 20px rgba(0,0,0,0.3)" : "0 8px 20px rgba(0,0,0,0.1)" },
              transition: "all 0.3s ease",
            }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="caption" color={isDark ? "grey.400" : "grey.600"}>{s.label}</Typography>
            </Card>
          ))}
        </Box>

        {/* Chart 1: Class Distribution (Pie) */}
        <Card sx={{ bgcolor: cardBg, border: cardBorder, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Class Distribution</Typography>
            <ResponsiveContainer width="100%" height={380}>
              <PieChart>
                <Pie
                  data={classData}
                  cx="50%" cy="45%"
                  outerRadius={130} innerRadius={65}
                  dataKey="value"
                  label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(1)}%`}
                  labelLine
                >
                  {classData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Model Performance (Bar) */}
        <Card sx={{ bgcolor: cardBg, border: cardBorder, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Model Performance Comparison</Typography>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={modelData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} angle={-15} textAnchor="end" interval={0} />
                <YAxis domain={[0.9, 1]} tick={{ fill: textColor, fontSize: 12 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Legend verticalAlign="top" wrapperStyle={{ color: textColor }} />
                <Bar dataKey="Accuracy" fill="#42a5f5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="F1"       fill="#66bb6a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ROC-AUC" fill="#ffa726" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 3: Top Spam Keywords (Horizontal Bar) */}
        <Card sx={{ bgcolor: cardBg, border: cardBorder, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Top Spam Keywords</Typography>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={keywordData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis type="number" tick={{ fill: textColor, fontSize: 12 }} />
                <YAxis dataKey="keyword" type="category" tick={{ fill: textColor, fontSize: 13 }} width={80} />
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Legend verticalAlign="top" wrapperStyle={{ color: textColor }} />
                <Bar dataKey="Spam" fill="#ef5350" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Ham"  fill="#66bb6a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 4: Model Radar */}
        <Card sx={{ bgcolor: cardBg, border: cardBorder, mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Model Performance Radar</Typography>
            <ResponsiveContainer width="100%" height={380}>
              <RadarChart data={radarData} margin={{ top: 20, right: 40, left: 40, bottom: 20 }}>
                <PolarGrid stroke={gridColor} />
                <PolarAngleAxis dataKey="model" tick={{ fill: textColor, fontSize: 12 }} />
                <PolarRadiusAxis domain={[90, 100]} tick={{ fill: textColor, fontSize: 10 }} />
                <Radar name="Accuracy" dataKey="Accuracy" stroke="#42a5f5" fill="#42a5f5" fillOpacity={0.25} />
                <Radar name="F1 Score" dataKey="F1"       stroke="#66bb6a" fill="#66bb6a" fillOpacity={0.25} />
                <Radar name="ROC-AUC" dataKey="ROCAUC"    stroke="#ffa726" fill="#ffa726" fillOpacity={0.25} />
                <Legend verticalAlign="bottom" wrapperStyle={{ color: textColor }} />
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </Container>
    </Box>
  );
}