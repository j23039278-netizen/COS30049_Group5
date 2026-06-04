// Dashboard.jsx - ThreatInk Data Visualization Dashboard
import { useState, useEffect } from "react";
import {
  Box, Container, Typography, Card, CardContent,
  CircularProgress, Alert, useTheme,
} from "@mui/material";
import * as d3 from "d3";
import { getStats } from "../services/api";
import { initializeGlobalTooltip } from "../components/charts/chartUtils";
import D3PieChart     from "../components/charts/D3PieChart";
import D3BarChart     from "../components/charts/D3BarChart";
import D3KeywordChart from "../components/charts/D3KeywordChart";
import D3RadarChart   from "../components/charts/D3RadarChart";

export default function Dashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const cardBg     = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)";
  const cardBorder = isDark ? "1px solid rgba(255,107,122,0.15)" : "1px solid rgba(227,57,70,0.1)";

  useEffect(() => {
    initializeGlobalTooltip();
    return () => { d3.select("#d3-tooltip").remove(); };
  }, []);

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
    <Container sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>
  );

  const classData = [
    { name: "Ham (Legitimate)", value: stats.class_distribution.ham,  fill: "#57b849" },
    { name: "Spam",             value: stats.class_distribution.spam, fill: "#e63946" },
  ];

  const modelData = Object.entries(stats.model_performance).map(([name, m]) => ({
    name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    Accuracy: m.accuracy, F1: m.f1, "ROC-AUC": m.roc_auc,
  }));

  const keywordData = stats.top_spam_keywords.map((k) => ({
    keyword: k.keyword, Spam: k.spam, Ham: k.ham,
  }));

  const radarData = Object.entries(stats.model_performance).map(([name, m]) => ({
    model:    name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).split(" ")[0],
    Accuracy: +(m.accuracy * 100).toFixed(1),
    F1:       +(m.f1 * 100).toFixed(1),
    ROCAUC:   +(m.roc_auc * 100).toFixed(1),
  }));

  return (
    <Box sx={{
      minHeight: "100vh",
      background: isDark
        ? "linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #0f0f1e 100%)"
        : "linear-gradient(135deg, #f5f0e8 0%, #faf7f2 50%, #ffffff 100%)",
      transition: "background 0.3s ease",
      py: 4,
    }}>
      <Container maxWidth="lg">

        <Typography variant="h4" fontWeight={800} textAlign="center" sx={{
          mb: 1,
          fontSize: { xs: "1.5rem", md: "2.125rem" },
          background: "linear-gradient(135deg, #e63946 0%, #457b9d 100%)",
          backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Analytics Dashboard
        </Typography>
        <Typography variant="body1" color={isDark ? "grey.400" : "grey.600"} textAlign="center" sx={{ mb: 1 }}>
          Dataset statistics and model performance visualizations.
        </Typography>
        <Typography variant="body2" color={isDark ? "grey.500" : "grey.500"} textAlign="center" sx={{ mb: 4 }}>
          Trained on 94,298 combined email and SMS records from Kaggle and UCI datasets.
          45,917 spam and 48,381 ham messages, achieving best accuracy of 97.46% with Random Forest.
        </Typography>

        {/* Summary Cards */}
        <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
          {[
            { label: "Total Records", value: stats.class_distribution.total.toLocaleString(), color: "#42a5f5" },
            { label: "Spam Messages", value: stats.class_distribution.spam.toLocaleString(),  color: "#ef5350" },
            { label: "Ham Messages",  value: stats.class_distribution.ham.toLocaleString(),   color: "#66bb6a" },
            { label: "Best Accuracy", value: "97.46%",                                        color: "#ffa726" },
          ].map((s) => (
            <Card key={s.label} sx={{
              flex: "1 1 calc(50% - 8px)", textAlign: "center", py: 2,
              bgcolor: cardBg, border: cardBorder,
              "@media (min-width:1200px)": { flex: "1 1 calc(25% - 8px)" },
              "&:hover": { transform: "translateY(-4px)", boxShadow: isDark ? "0 8px 20px rgba(0,0,0,0.3)" : "0 8px 20px rgba(0,0,0,0.1)" },
              transition: "all 0.3s ease",
            }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="caption" color={isDark ? "grey.400" : "grey.600"}>{s.label}</Typography>
            </Card>
          ))}
        </Box>

        {/* Chart Cards */}
        <Card sx={{ bgcolor: cardBg, border: cardBorder, mb: 3, maxWidth: 900, mx: "auto" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Class Distribution</Typography>
            <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"} sx={{ mb: 2 }}>
              Shows the proportion of Spam vs Ham messages in the 94,298-record training dataset.
              Nearly balanced at 48.7% spam and 51.3% ham, ensuring unbiased model training.
              Hover over each slice for exact counts.
            </Typography>
            <D3PieChart data={classData} isDark={isDark} />
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: cardBg, border: cardBorder, mb: 3, maxWidth: 900, mx: "auto" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Model Performance Comparison</Typography>
            <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"} sx={{ mb: 2 }}>
              Compares Accuracy, F1 Score, and ROC-AUC across all four trained models.
              Random Forest achieved the best performance with 97.46% accuracy.
              Hover over each bar for precise values and ranking.
            </Typography>
            <D3BarChart data={modelData} isDark={isDark} />
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: cardBg, border: cardBorder, mb: 3, maxWidth: 900, mx: "auto" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Top Spam Keywords</Typography>
            <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"} sx={{ mb: 2 }}>
              Displays how often spam-related keywords appear in spam vs ham messages.
              Keywords like "win", "offer", and "free" appear far more in spam — strong detection signals.
              Hover for exact counts and percentage breakdown.
            </Typography>
            <D3KeywordChart data={keywordData} isDark={isDark} />
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: cardBg, border: cardBorder, mb: 4, maxWidth: 900, mx: "auto" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Model Performance Radar</Typography>
            <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"} sx={{ mb: 2 }}>
              Visualizes multi-metric performance of all four models on a single radar chart.
              Larger area coverage indicates stronger overall performance.
              Hover over each point for precise metric values.
            </Typography>
            <D3RadarChart data={radarData} isDark={isDark} />
          </CardContent>
        </Card>

      </Container>
    </Box>
  );
}
