// Dashboard.jsx - ThreatInk Data Visualization Dashboard
import { useState, useEffect } from "react";
import {
  Box, Container, Typography, Grid, Card, CardContent,
  CircularProgress, Alert, ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line,
} from "recharts";
import { getStats } from "../services/api";

const COLORS = ["#66bb6a", "#ef5350", "#42a5f5", "#ffa726", "#ab47bc"];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: "#1e1e2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, p: 1.5 }}>
        <Typography variant="caption" color="grey.300">{label}</Typography>
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeChart, setActiveChart] = useState("keywords");

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
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
          Analytics <span style={{ color: "#ef5350" }}>Dashboard</span>
        </Typography>
        <Typography variant="body1" color="grey.400" sx={{ mb: 4 }}>
          Dataset statistics and model performance visualizations.
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { label: "Total Records", value: stats.class_distribution.total.toLocaleString(), color: "#42a5f5" },
            { label: "Spam Messages", value: stats.class_distribution.spam.toLocaleString(), color: "#ef5350" },
            { label: "Ham Messages", value: stats.class_distribution.ham.toLocaleString(), color: "#66bb6a" },
            { label: "Best Accuracy", value: "97.46%", color: "#ffa726" },
          ].map((s) => (
            <Grid item xs={6} md={3} key={s.label}>
              <Card sx={{ bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center", py: 2 }}>
                <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                <Typography variant="caption" color="grey.400">{s.label}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Chart 1: Pie - Class Distribution */}
          <Grid item xs={12} md={5}>
            <Card sx={{ bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 380 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Class Distribution</Typography>
                <ResponsiveContainer width="100%" height={290}>
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
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Chart 2: Bar - Model Performance */}
          <Grid item xs={12} md={7}>
            <Card sx={{ bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 380 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Model Performance Comparison</Typography>
                <ResponsiveContainer width="100%" height={290}>
                  <BarChart data={modelData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: "#aaa", fontSize: 10 }} />
                    <YAxis domain={[0.9, 1]} tick={{ fill: "#aaa", fontSize: 11 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="Accuracy" fill="#42a5f5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="F1" fill="#66bb6a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ROC-AUC" fill="#ffa726" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Chart 3: Bar - Spam Keyword Frequency */}
          <Grid item xs={12} md={8}>
            <Card sx={{ bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 380 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Top Spam Keywords</Typography>
                <ResponsiveContainer width="100%" height={290}>
                  <BarChart data={keywordData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" tick={{ fill: "#aaa", fontSize: 11 }} />
                    <YAxis dataKey="keyword" type="category" tick={{ fill: "#aaa", fontSize: 12 }} width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="Spam" fill="#ef5350" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Ham" fill="#66bb6a" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Chart 4: Radar - Model Comparison */}
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 380 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Model Radar</Typography>
                <ResponsiveContainer width="100%" height={290}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="model" tick={{ fill: "#aaa", fontSize: 11 }} />
                    <PolarRadiusAxis domain={[90, 100]} tick={{ fill: "#aaa", fontSize: 9 }} />
                    <Radar name="Accuracy" dataKey="Accuracy" stroke="#42a5f5" fill="#42a5f5" fillOpacity={0.2} />
                    <Radar name="F1" dataKey="F1" stroke="#66bb6a" fill="#66bb6a" fillOpacity={0.2} />
                    <Radar name="ROC-AUC" dataKey="ROCAUC" stroke="#ffa726" fill="#ffa726" fillOpacity={0.2} />
                    <Legend />
                    <Tooltip content={<CustomTooltip />} />
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