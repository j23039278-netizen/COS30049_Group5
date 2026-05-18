// Detector.jsx - ThreatInk Spam Detection Page
import { useState } from "react";
import {
  Box, Container, Typography, TextField, Button, Card, CardContent,
  Grid, Chip, CircularProgress, Alert, Select, MenuItem, FormControl,
  InputLabel, LinearProgress, Divider, Tooltip, IconButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { predictMessage } from "../services/api";

const MODEL_OPTIONS = [
  { value: "random_forest",       label: "Random Forest (Best - 97.46%)" },
  { value: "logistic_regression", label: "Logistic Regression (96.51%)" },
  { value: "linear_svm",          label: "Linear SVM (96.91%)" },
  { value: "naive_bayes",         label: "Naive Bayes (93.41%)" },
];

const SAMPLE_MESSAGES = [
  "Congratulations! You've won a $1,000 prize. Click here to claim your free cash reward now!",
  "Hi, just wanted to confirm our meeting tomorrow at 2pm. Let me know if you need to reschedule.",
  "URGENT: Your account will be suspended. Verify your credit card details immediately to avoid charges.",
  "Hey, are you coming to the study group tonight? We're meeting at the library at 7.",
];

export default function Detector() {
  const [text, setText] = useState("");
  const [model, setModel] = useState("random_forest");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const handlePredict = async () => {
    // Input validation
    if (!text.trim()) {
      setError("Please enter a message to analyze.");
      return;
    }
    if (text.trim().length < 5) {
      setError("Message is too short. Please enter at least 5 characters.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await predictMessage(text, model);
      setResult(res.data);
      // Add to history
      setHistory((prev) => [
        { text: text.slice(0, 60) + (text.length > 60 ? "..." : ""), label: res.data.label, confidence: res.data.confidence, timestamp: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError(err.response?.data?.detail || "Connection error. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText("");
    setResult(null);
    setError("");
  };

  const handleExport = () => {
    if (!result) return;
    const data = JSON.stringify({ input: text, result, timestamp: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "threatink_result.json";
    a.click();
  };

  const getRiskColor = (score) => {
    if (score >= 0.7) return "#ef5350";
    if (score >= 0.4) return "#ffa726";
    return "#66bb6a";
  };

  const getRiskLabel = (score) => {
    if (score >= 0.7) return "High Risk";
    if (score >= 0.4) return "Medium Risk";
    return "Low Risk";
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
          Spam <span style={{ color: "#ef5350" }}>Detector</span>
        </Typography>
        <Typography variant="body1" color="grey.400" sx={{ mb: 4 }}>
          Enter any message or email to analyze it for spam content.
        </Typography>

        <Grid container spacing={3}>
          {/* Left: Input */}
          <Grid item xs={12} md={7}>
            <Card sx={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <CardContent sx={{ p: 3 }}>
                {/* Model selector */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Model</InputLabel>
                  <Select value={model} label="Select Model" onChange={(e) => setModel(e.target.value)}>
                    {MODEL_OPTIONS.map((m) => (
                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Text input */}
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="Paste your message here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  error={!!error}
                  helperText={error || `${text.length} characters`}
                  sx={{ mb: 2 }}
                />

                {/* Sample messages */}
                <Typography variant="caption" color="grey.500" sx={{ mb: 1, display: "block" }}>
                  Try a sample:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {SAMPLE_MESSAGES.map((msg, i) => (
                    <Chip
                      key={i}
                      label={i % 2 === 0 ? `Spam Sample ${Math.floor(i / 2) + 1}` : `Ham Sample ${Math.floor(i / 2) + 1}`}
                      size="small"
                      onClick={() => { setText(msg); setError(""); }}
                      color={i % 2 === 0 ? "error" : "success"}
                      variant="outlined"
                      sx={{ cursor: "pointer" }}
                    />
                  ))}
                </Box>

                {/* Buttons */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                    onClick={handlePredict}
                    disabled={loading}
                    sx={{ flex: 1, py: 1.2, fontWeight: 700 }}
                  >
                    {loading ? "Analyzing..." : "Analyze Message"}
                  </Button>
                  <Tooltip title="Clear">
                    <IconButton onClick={handleClear} color="default">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>

            {/* History */}
            {history.length > 0 && (
              <Card sx={{ mt: 3, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Recent Analyses</Typography>
                  {history.map((h, i) => (
                    <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2, py: 1, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <Chip label={h.label} color={h.label === "spam" ? "error" : "success"} size="small" />
                      <Typography variant="body2" color="grey.400" sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {h.text}
                      </Typography>
                      <Typography variant="caption" color="grey.600">{h.timestamp}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Right: Results */}
          <Grid item xs={12} md={5}>
            {!result && !loading && (
              <Card sx={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography color="grey.600" textAlign="center">
                  Results will appear here after analysis
                </Typography>
              </Card>
            )}

            {loading && (
              <Card sx={{ background: "rgba(255,255,255,0.04)", p: 4, textAlign: "center" }}>
                <CircularProgress color="primary" sx={{ mb: 2 }} />
                <Typography color="grey.400">Analyzing message...</Typography>
              </Card>
            )}

            {result && (
              <Card sx={{
                background: result.is_spam ? "rgba(239,83,80,0.08)" : "rgba(102,187,106,0.08)",
                border: `1px solid ${result.is_spam ? "rgba(239,83,80,0.4)" : "rgba(102,187,106,0.4)"}`,
              }}>
                <CardContent sx={{ p: 3 }}>
                  {/* Main verdict */}
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    {result.is_spam
                      ? <WarningAmberIcon sx={{ fontSize: 56, color: "#ef5350" }} />
                      : <CheckCircleIcon sx={{ fontSize: 56, color: "#66bb6a" }} />
                    }
                    <Typography variant="h4" fontWeight={800} color={result.is_spam ? "error" : "success.main"}>
                      {result.is_spam ? "SPAM" : "LEGITIMATE"}
                    </Typography>
                    <Typography variant="body2" color="grey.400">
                      Model: {result.model_used.replace(/_/g, " ")}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Confidence */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2" color="grey.400">Confidence</Typography>
                      <Typography variant="body2" fontWeight={700}>{(result.confidence * 100).toFixed(1)}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={result.confidence * 100}
                      color={result.is_spam ? "error" : "success"}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* Risk Score */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2" color="grey.400">Risk Score</Typography>
                      <Chip
                        label={getRiskLabel(result.risk_score)}
                        size="small"
                        sx={{ bgcolor: getRiskColor(result.risk_score), color: "white", fontWeight: 700 }}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={result.risk_score * 100}
                      sx={{ height: 8, borderRadius: 4, "& .MuiLinearProgress-bar": { bgcolor: getRiskColor(result.risk_score) } }}
                    />
                    <Typography variant="caption" color="grey.500">{result.risk_score.toFixed(4)}</Typography>
                  </Box>

                  {/* Feature breakdown */}
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Feature Analysis</Typography>
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    {[
                      { label: "Words", value: result.features.word_count },
                      { label: "URLs", value: result.features.url_count },
                      { label: "Spam Keywords", value: result.features.spam_keyword_count },
                      { label: "Exclamations", value: result.features.exclaim_count },
                    ].map((f) => (
                      <Grid item xs={6} key={f.label}>
                        <Box sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: 2, p: 1, textAlign: "center" }}>
                          <Typography variant="h6" fontWeight={700}>{typeof f.value === "number" ? f.value.toFixed ? f.value.toFixed(0) : f.value : f.value}</Typography>
                          <Typography variant="caption" color="grey.400">{f.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Cluster */}
                  <Typography variant="caption" color="grey.500">
                    Cluster: {result.cluster === 0 ? "Group A" : "Group B"} · Processed {result.clean_text.split(" ").length} tokens
                  </Typography>

                  {/* Export button */}
                  <Box sx={{ mt: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleExport}
                      size="small"
                    >
                      Export Result (JSON)
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}