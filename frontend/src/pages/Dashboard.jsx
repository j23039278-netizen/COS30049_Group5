// Dashboard.jsx - ThreatInk Data Visualization Dashboard
import { useState, useEffect } from "react";
import {
  Box, Container, Typography, Grid, Card, CardContent,
  CircularProgress, Alert, useTheme,
} from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { getStats } from "../services/api";

const COLORS = ["#66bb6a", "#ef5350", "#42a5f5", "#ffa726", "#ab47bc"];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{
        bgcolor: isDark ? "#1e1e2e" : "#ffffff",
        border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
        borderRadius: 2,
        p: 1.5,
        boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.1)",
      }}>
        <Typography variant="caption" color={isDark ? "grey.300" : "grey.700"}>{label}</Typography>
        {payload.map((p, i) => (
          <Typography key={i} variant="body2" sx={{ color: p.color, fontWeight: 700 }}>
            {p.name}: {typeof p.value === "number" && p.value < 2 ? (p.value * 100).toFixed(1) + "%" : p.value.toLocaleString()}
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

  // Prepare chart data
  const classData = [
    { name: "Ham (Legitimate)", value: stats.class_distribution.ham, fill: "#66bb6a" },
    { name: "Spam", value: stats.class_distribution.spam, fill: "#ef5350" },
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
      bgcolor: "background.default",
      background: isDark
        ? "linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)"
        : "linear-gradient(180deg, #f5f7fa 0%, #e8eef7 100%)",
      py: 4,
      transition: "background 0.3s ease",
    }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={800} sx={{
          mb: 1,
          textAlign: "center",
          background: "linear-gradient(135deg, #ef5350 0%, #42a5f5 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Analytics Dashboard
        </Typography>
        <Typography variant="body1" color={isDark ? "grey.400" : "grey.600"} sx={{
          mb: 4,
          textAlign: "center",
        }}>
          Dataset statistics and model performance visualizations.
        </Typography>

        {/* Summary Cards */}
        <Box sx={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 4,
        }}>
          {[
            { label: "Total Records", value: stats.class_distribution.total.toLocaleString(), color: "#42a5f5" },
            { label: "Spam Messages", value: stats.class_distribution.spam.toLocaleString(), color: "#ef5350" },
            { label: "Ham Messages", value: stats.class_distribution.ham.toLocaleString(), color: "#66bb6a" },
            { label: "Best Accuracy", value: "97.46%", color: "#ffa726" },
          ].map((s) => (
            <Card
              key={s.label}
              sx={{
                bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.6)",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(239,83,80,0.1)",
                textAlign: "center",
                py: 2,
                px: 3,
                flex: "1 1 auto",
                minWidth: { xs: "calc(50% - 8px)", sm: "calc(50% - 8px)", md: "auto" },
                maxWidth: { md: 200 },
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: isDark
                    ? "0 12px 24px rgba(0,0,0,0.3)"
                    : "0 12px 24px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="caption" color={isDark ? "grey.400" : "grey.600"}>{s.label}</Typography>
            </Card>
          ))}
        </Box>

        <Grid container spacing={4}>
          {/* Chart 1: Pie - Class Distribution */}
          <Grid item xs={12} md={6}>
            <Card sx={{
              bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.6)",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(239,83,80,0.1)",
              height: 480,
              display: "flex",
              flexDirection: "column",
            }}>
              <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Class Distribution</Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={classData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      dataKey="value"
                      label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(1)}%`}
                      labelLine={false}
                    >
                      {classData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Chart 2: Bar - Model Performance */}
          <Grid item xs={12} md={6}>
            <Card sx={{
              bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.6)",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(239,83,80,0.1)",
              height: 480,
              display: "flex",
              flexDirection: "column",
            }}>
              <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Model Performance Comparison</Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={modelData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis domain={[0.9, 1]} tick={{ fill: textColor, fontSize: 11 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                    <Legend wrapperStyle={{ color: textColor }} />
                    <Bar dataKey="Accuracy" fill="#42a5f5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="F1" fill="#66bb6a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ROC-AUC" fill="#ffa726" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Chart 3: Bar - Spam Keyword Frequency */}
          <Grid item xs={12}>
            <Card sx={{
              bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.6)",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(239,83,80,0.1)",
              height: 480,
              display: "flex",
              flexDirection: "column",
            }}>
              <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Top Spam Keywords</Typography>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={keywordData} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis type="number" tick={{ fill: textColor, fontSize: 11 }} />
                    <YAxis dataKey="keyword" type="category" tick={{ fill: textColor, fontSize: 12 }} width={110} />
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                    <Legend wrapperStyle={{ color: textColor }} />
                    <Bar dataKey="Spam" fill="#ef5350" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Ham" fill="#66bb6a" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Chart 4: Radar - Model Comparison */}
          <Grid item xs={12}>
            <Card sx={{
              bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.6)",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(239,83,80,0.1)",
              height: 480,
              display: "flex",
              flexDirection: "column",
            }}>
              <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Model Performance Radar</Typography>
                <ResponsiveContainer width="100%" height={360}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke={gridColor} />
                    <PolarAngleAxis dataKey="model" tick={{ fill: textColor, fontSize: 12 }} />
                    <PolarRadiusAxis domain={[90, 100]} tick={{ fill: textColor, fontSize: 10 }} />
                    <Radar name="Accuracy" dataKey="Accuracy" stroke="#42a5f5" fill="#42a5f5" fillOpacity={0.2} />
                    <Radar name="F1" dataKey="F1" stroke="#66bb6a" fill="#66bb6a" fillOpacity={0.2} />
                    <Radar name="ROC-AUC" dataKey="ROCAUC" stroke="#ffa726" fill="#ffa726" fillOpacity={0.2} />
                    <Legend wrapperStyle={{ color: textColor }} />
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}