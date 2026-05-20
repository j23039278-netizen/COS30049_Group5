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

const COLORS = ["#57b849", "#e63946"];

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{
        bgcolor: isDark ? "rgba(26,26,46,0.6)" : "rgba(255,255,255,0.8)",
        border: isDark ? "1px solid rgba(255, 107, 122, 0.2)" : "1px solid rgba(227, 57, 70, 0.15)",
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

  const textColor = isDark ? "#a8aab0" : "#5a5a5a";
  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const cardBg = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.7)";
  const cardBorder = isDark ? "1px solid rgba(255, 107, 122, 0.15)" : "1px solid rgba(227, 57, 70, 0.1)";

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
    { name: "Ham (Legitimate)", value: stats.class_distribution.ham, fill: "#57b849" },
    { name: "Spam",             value: stats.class_distribution.spam, fill: "#e63946" },
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
        ? "linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #0f0f1e 100%)"
        : "linear-gradient(135deg, #f1f4f8 0%, #e8f1fa 50%, #f1f4f8 100%)",
      transition: "background 0.3s ease",
      py: 4,
    }}>
      <Container maxWidth="lg">

        {/* Header */}
        <Typography variant="h4" fontWeight={800} textAlign="center" sx={{
          mb: 1,
          background: "linear-gradient(135deg, #e63946 0%, #457b9d 100%)",
          backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Analytics Dashboard
        </Typography>
        <Typography variant="body1" color={isDark ? "grey.400" : "grey.600"} textAlign="center" sx={{ mb: 1 }}>
          Dataset statistics and model performance visualizations.
        </Typography>
        <Typography variant="body2" color={isDark ? "grey.500" : "grey.500"} textAlign="center" sx={{ mb: 4 }}>
          Trained on 94,298 combined email and SMS records from Kaggle and UCI datasets. 45,917 spam and 48,381 ham messages were used for model training, achieving a best accuracy of 97.46% with Random Forest.
        </Typography>

        {/* Summary Cards - flex row */}
        <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
          {[
            { label: "Total Records",  value: stats.class_distribution.total.toLocaleString(), color: "#42a5f5" },
            { label: "Spam Messages",  value: stats.class_distribution.spam.toLocaleString(),  color: "#ef5350" },
            { label: "Ham Messages",   value: stats.class_distribution.ham.toLocaleString(),   color: "#66bb6a" },
            { label: "Best Accuracy",  value: "97.46%",                                        color: "#ffa726" },
          ].map((s) => (
            <Card key={s.label} sx={{
              flex: "1 1 calc(50% - 8px)", textAlign: "center", py: 2,
              bgcolor: cardBg, border: cardBorder,
              "&:hover": { transform: "translateY(-4px)", boxShadow: isDark ? "0 8px 20px rgba(0,0,0,0.3)" : "0 8px 20px rgba(0,0,0,0.1)" },
              transition: "all 0.3s ease",
              "@media (min-width: 1200px)": {
                flex: "1 1 calc(25% - 8px)",
              },
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
            <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"} sx={{ mb: 2 }}>
              Shows the proportion of Spam vs Ham (legitimate) messages in the training dataset of 94,298 records. The dataset is nearly balanced at 48.7% spam and 51.3% ham, ensuring unbiased model training.
            </Typography>
            <ResponsiveContainer width="100%" height={380}>
              <PieChart>
                <Pie
                  data={classData}
                  cx="50%" cy="45%"
                  outerRadius={130} innerRadius={65}
                  dataKey="value"
                  label={false}
                  labelLine={false}
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
            <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"} sx={{ mb: 2 }}>
              Compares Accuracy, F1 Score, and ROC-AUC across all four trained models. Random Forest achieved the best performance with 97.46% accuracy. Higher bars indicate better model performance.
            </Typography>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={modelData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} angle={-15} textAnchor="end" interval={0} />
                <YAxis domain={[0.9, 1]} tick={{ fill: textColor, fontSize: 12 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Legend verticalAlign="top" wrapperStyle={{ color: textColor }} />
                <Bar dataKey="Accuracy" fill="#5dade2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="F1"       fill="#57b849" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ROC-AUC" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 3: Top Spam Keywords (Horizontal Bar) */}
        <Card sx={{ bgcolor: cardBg, border: cardBorder, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Top Spam Keywords</Typography>
            <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"} sx={{ mb: 2 }}>
              Displays the frequency of spam-related keywords found in spam vs ham messages from the training data. Keywords like "win", "offer", and "free" appear significantly more in spam messages, making them strong spam indicators.
            </Typography>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={keywordData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis type="number" tick={{ fill: textColor, fontSize: 12 }} />
                <YAxis dataKey="keyword" type="category" tick={{ fill: textColor, fontSize: 13 }} width={80} />
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Legend verticalAlign="top" wrapperStyle={{ color: textColor }} />
                <Bar dataKey="Spam" fill="#e63946" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Ham"  fill="#57b849" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 4: Model Radar */}
        <Card sx={{ bgcolor: cardBg, border: cardBorder, mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Model Performance Radar</Typography>
            <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"} sx={{ mb: 2 }}>
              Visualizes multi-metric performance of all four models on a single radar chart. Larger area coverage indicates stronger overall performance. All models score above 93% across all metrics.
            </Typography>
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