// Detector.jsx - ThreatInk Spam Detection Page
import { useState } from "react";
import {
  Box, Container, Typography, TextField, Button, Card, CardContent,
  Grid, Chip, CircularProgress, Select, MenuItem, FormControl,
  InputLabel, LinearProgress, Divider, Tooltip, IconButton, useTheme,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
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
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [text, setText] = useState("");
  const [model, setModel] = useState("random_forest");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const handlePredict = async () => {
    if (!text.trim()) { setError("Please enter a message to analyze."); return; }
    if (text.trim().length < 5) { setError("Message is too short. Please enter at least 5 characters."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const res = await predictMessage(text, model);
      setResult(res.data);
      setHistory((prev) => [
        { text: text.slice(0, 60) + (text.length > 60 ? "..." : ""), label: res.data.label, confidence: res.data.confidence, timestamp: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError(err.response?.data?.detail || "Connection error. Make sure the backend is running.");
    } finally { setLoading(false); }
  };

  const handleClear = () => { setText(""); setResult(null); setError(""); };

  const handleExport = () => {
    if (!result) return;
    const data = JSON.stringify({ input: text, result, timestamp: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "threatink_result.json"; a.click();
  };

  const getRiskColor = (score) => score >= 0.7 ? "#ef5350" : score >= 0.4 ? "#ffa726" : "#66bb6a";
  const getRiskLabel = (score) => score >= 0.7 ? "High Risk" : score >= 0.4 ? "Medium Risk" : "Low Risk";

  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)";
  const cardBorder = isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(239,83,80,0.1)";

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
        <Typography variant="h4" fontWeight={800} sx={{
          mb: 1,
          background: "linear-gradient(135deg, #ef5350 0%, #42a5f5 100%)",
          backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Spam Detector
        </Typography>
        <Typography variant="body1" color={isDark ? "grey.400" : "grey.600"} sx={{ mb: 4 }}>
          Enter any message or email to analyze it for spam content.
        </Typography>

        {/* Two equal columns using flexbox */}
        <Box sx={{ display: "flex", gap: 3, alignItems: "stretch" }}>

          {/* ── Left: Input ── */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
            <Card sx={{ bgcolor: cardBg, border: cardBorder, flex: 1 }}>
              <CardContent sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
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
                  fullWidth multiline rows={8}
                  placeholder="Paste your message here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  error={!!error}
                  helperText={error || `${text.length} characters`}
                  sx={{
                    mb: 2, flex: 1,
                    "& .MuiOutlinedInput-root": {
                      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.5)",
                    },
                  }}
                />

                {/* Sample messages */}
                <Typography variant="caption" color={isDark ? "grey.500" : "grey.600"} sx={{ mb: 1, display: "block" }}>
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
                      sx={{ cursor: "pointer", transition: "all 0.3s ease" }}
                    />
                  ))}
                </Box>

                {/* Buttons */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="contained" fullWidth
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                    onClick={handlePredict}
                    disabled={loading}
                    sx={{
                      py: 1.2, fontWeight: 700,
                      background: "linear-gradient(135deg, #ef5350 0%, #e84a3d 100%)",
                      "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 16px rgba(239,83,80,0.3)" },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {loading ? "Analyzing..." : "Analyze Message"}
                  </Button>
                  <Tooltip title="Clear">
                    <IconButton onClick={handleClear}><DeleteIcon /></IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>

            {/* History */}
            {history.length > 0 && (
              <Card sx={{ bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)", border: cardBorder }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Recent Analyses</Typography>
                  {history.map((h, i) => (
                    <Box key={i} sx={{
                      display: "flex", alignItems: "center", gap: 2, py: 1,
                      borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
                    }}>
                      <Chip label={h.label} color={h.label === "spam" ? "error" : "success"} size="small" />
                      <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"} sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {h.text}
                      </Typography>
                      <Typography variant="caption" color="grey.500">{h.timestamp}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}
          </Box>

          {/* ── Right: Results ── */}
          <Box sx={{ flex: 1 }}>
            {!result && !loading && (
              <Card sx={{
                bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.4)",
                border: isDark ? "1px dashed rgba(255,255,255,0.1)" : "1px dashed rgba(239,83,80,0.2)",
                height: "100%", minHeight: 400,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Typography color={isDark ? "grey.600" : "grey.500"} textAlign="center">
                  Results will appear here after analysis
                </Typography>
              </Card>
            )}

            {loading && (
              <Card sx={{ bgcolor: cardBg, border: cardBorder, height: "100%", minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }}>
                <CircularProgress color="primary" />
                <Typography color={isDark ? "grey.400" : "grey.600"}>Analyzing message...</Typography>
              </Card>
            )}

            {result && (
              <Card sx={{
                height: "100%",
                background: result.is_spam
                  ? isDark ? "rgba(239,83,80,0.08)" : "rgba(239,83,80,0.06)"
                  : isDark ? "rgba(102,187,106,0.08)" : "rgba(102,187,106,0.06)",
                border: `1px solid ${result.is_spam
                  ? isDark ? "rgba(239,83,80,0.4)" : "rgba(239,83,80,0.2)"
                  : isDark ? "rgba(102,187,106,0.4)" : "rgba(102,187,106,0.2)"}`,
              }}>
                <CardContent sx={{ p: 3 }}>
                  {/* Verdict */}
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    {result.is_spam
                      ? <WarningAmberIcon sx={{ fontSize: 56, color: "#ef5350" }} />
                      : <CheckCircleIcon sx={{ fontSize: 56, color: "#66bb6a" }} />
                    }
                    <Typography variant="h4" fontWeight={800} color={result.is_spam ? "error" : "success.main"}>
                      {result.is_spam ? "SPAM" : "LEGITIMATE"}
                    </Typography>
                    <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"}>
                      Model: {result.model_used.replace(/_/g, " ")}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Confidence */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"}>Confidence</Typography>
                      <Typography variant="body2" fontWeight={700}>{(result.confidence * 100).toFixed(1)}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={result.confidence * 100}
                      color={result.is_spam ? "error" : "success"} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>

                  {/* Risk Score */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"}>Risk Score</Typography>
                      <Chip label={getRiskLabel(result.risk_score)} size="small"
                        sx={{ bgcolor: getRiskColor(result.risk_score), color: "white", fontWeight: 700 }} />
                    </Box>
                    <LinearProgress variant="determinate" value={result.risk_score * 100}
                      sx={{ height: 8, borderRadius: 4, "& .MuiLinearProgress-bar": { bgcolor: getRiskColor(result.risk_score) } }} />
                    <Typography variant="caption" color="grey.500">{result.risk_score.toFixed(4)}</Typography>
                  </Box>

                  {/* Feature Analysis */}
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Feature Analysis</Typography>
                  <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
                    {[
                      { label: "Words",         value: result.features.word_count },
                      { label: "URLs",           value: result.features.url_count },
                      { label: "Spam Keywords",  value: result.features.spam_keyword_count },
                      { label: "Exclamations",   value: result.features.exclaim_count },
                    ].map((f) => (
                      <Box key={f.label} sx={{
                        flex: 1, minWidth: 80,
                        bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.6)",
                        borderRadius: 2, p: 1.5, textAlign: "center",
                      }}>
                        <Typography variant="h6" fontWeight={700}>{Math.round(f.value)}</Typography>
                        <Typography variant="caption" color={isDark ? "grey.400" : "grey.600"}>{f.label}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Typography variant="caption" color="grey.500">
                    Cluster: {result.cluster === 0 ? "Group A" : "Group B"} · Processed {result.clean_text.split(" ").length} tokens
                  </Typography>

                  {/* Export */}
                  <Box sx={{ mt: 2 }}>
                    <Button fullWidth variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport} size="small"
                      sx={{ "&:hover": { transform: "translateY(-2px)" }, transition: "all 0.3s ease" }}>
                      Export Result (JSON)
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}