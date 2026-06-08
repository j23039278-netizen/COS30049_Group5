// Detector.jsx - ThreatInk Spam Detection Page
import { useState } from "react";
import {
  Box, Container, Typography, TextField, Button, Card, CardContent,
  Grid, Chip, CircularProgress, Select, MenuItem, FormControl,
  InputLabel, LinearProgress, Divider, Tooltip, IconButton, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions,
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
  "WINNER! Claim your free iPhone now at http://free-prize-claim.com/win before it expires!",
  "Here is the Zoom link for tomorrow's meeting: https://zoom.us/j/123456789. See you at 3pm!",
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
  const [selectedHistory, setSelectedHistory] = useState(null);

  const handlePredict = async () => {
    if (!text.trim()) { setError("Please enter a message to analyze."); return; }
    if (text.trim().length < 5) { setError("Message is too short. Please enter at least 5 characters."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const res = await predictMessage(text, model);
      setResult(res.data);
      setHistory((prev) => [
        {
          text: text.slice(0, 60) + (text.length > 60 ? "..." : ""),
          fullText: text,
          label: res.data.label,
          is_spam: res.data.is_spam,
          confidence: res.data.confidence,
          risk_score: res.data.risk_score,
          features: res.data.features,
          model_used: res.data.model_used,
          timestamp: new Date().toLocaleTimeString(),
        },
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

  const handleExportCSV = () => {
    if (!result) return;
    const csv = [
      ["Field", "Value"],
      ["Input Text", text.replace(/,/g, " ")],
      ["Label", result.label],
      ["Is Spam", result.is_spam],
      ["Confidence", (result.confidence * 100).toFixed(1) + "%"],
      ["Risk Score", result.risk_score.toFixed(4)],
      ["Model Used", result.model_used],
      ["Word Count", result.features.word_count],
      ["URL Count", result.features.url_count],
      ["Spam Keywords", result.features.spam_keyword_count],
      ["Exclamations", result.features.exclaim_count],
      ["Explanation", generateExplanation(result).replace(/,/g, " ")],
      ["Timestamp", new Date().toISOString()],
    ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "threatink_result.csv"; a.click();
  };

  const handleExportHistoryCSV = () => {
    if (history.length === 0) return;
    const rows = [
      ["Timestamp", "Message", "Label", "Confidence", "Risk Score", "Model Used", "Word Count", "URL Count", "Spam Keywords", "Exclamations", "Explanation"],
      ...history.map((h) => [
        h.timestamp,
        h.fullText.replace(/,/g, " "),
        h.label,
        (h.confidence * 100).toFixed(1) + "%",
        h.risk_score.toFixed(4),
        h.model_used,
        h.features.word_count,
        h.features.url_count,
        h.features.spam_keyword_count,
        h.features.exclaim_count,
        generateExplanation(h).replace(/,/g, " "),
      ]),
    ];
    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "threatink_history.csv"; a.click();
  };

  const getRiskColor = (score) => score >= 0.7 ? "#ef5350" : score >= 0.4 ? "#ffa726" : "#66bb6a";
  const getRiskLabel = (score) => score >= 0.7 ? "High Risk" : score >= 0.4 ? "Medium Risk" : "Low Risk";

  const generateExplanation = (res) => {
    const { is_spam, confidence, risk_score, features } = res;
    const pct = (confidence * 100).toFixed(1);
    const { spam_keyword_count, url_count, exclaim_count, word_count } = features;
    const parts = [];

    if (is_spam) {
      if (confidence >= 0.85)
        parts.push(`This message was flagged as spam with high confidence (${pct}%).`);
      else if (confidence >= 0.65)
        parts.push(`This message was flagged as spam with moderate confidence (${pct}%).`);
      else
        parts.push(`This message was flagged as spam, though the model shows some uncertainty (${pct}% confidence).`);
    } else {
      if (confidence >= 0.85)
        parts.push(`This message appears legitimate with high confidence (${pct}%).`);
      else if (confidence >= 0.65)
        parts.push(`This message is likely legitimate, though with moderate confidence (${pct}%).`);
      else
        parts.push(`This message was classified as legitimate, but with low confidence (${pct}%) — manual review may be helpful.`);
    }

    const obs = [];
    if (spam_keyword_count > 0)
      obs.push(is_spam
        ? `${spam_keyword_count} spam-related keyword${spam_keyword_count > 1 ? "s were" : " was"} detected`
        : `${spam_keyword_count} spam-related keyword${spam_keyword_count > 1 ? "s were" : " was"} found but the overall pattern appears legitimate`
      );
    if (url_count > 0)
      obs.push(is_spam
        ? `${url_count} URL${url_count > 1 ? "s" : ""} detected — commonly used in phishing attempts`
        : `${url_count} URL${url_count > 1 ? "s" : ""} present but appears safe`
      );
    if (exclaim_count > 2)
      obs.push(`excessive exclamation marks (${exclaim_count}) — a common spam pattern`);
    if (word_count < 8 && is_spam)
      obs.push(`unusually short message (${word_count} words)`);

    if (obs.length > 0)
      parts.push(`Key indicators: ${obs.join("; ")}.`);
    else if (!is_spam)
      parts.push("No spam indicators were detected in this message.");

    if (is_spam) {
      if (risk_score >= 0.7)
        parts.push("The risk assessment confirms a high likelihood of spam — avoid interacting with this message.");
      else if (risk_score >= 0.4)
        parts.push("The risk score indicates a moderate spam probability — proceed with caution.");
      else
        parts.push("Despite the spam classification, the risk score remains low — spam patterns were detected but overall risk is limited.");
    } else {
      if (risk_score < 0.2)
        parts.push(`The low risk score (${risk_score.toFixed(3)}) confirms this message is safe.`);
      else if (risk_score < 0.4)
        parts.push("The risk score is low, supporting the legitimate classification.");
      else
        parts.push(`Note: the risk score (${risk_score.toFixed(3)}) is somewhat elevated despite the legitimate classification — treat with care.`);
    }

    return parts.join(" ");
  };

  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)";
  const cardBorder = isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(239,83,80,0.1)";

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
        <Typography variant="h4" fontWeight={800} sx={{
          mb: 1,
          fontSize: { xs: "1.5rem", md: "2.125rem" },
          background: "linear-gradient(135deg, #e63946 0%, #457b9d 100%)",
          backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Spam Detector
        </Typography>
        <Typography variant="body1" color={isDark ? "grey.400" : "grey.600"} sx={{ mb: 4, fontSize: { xs: "0.9rem", md: "1rem" } }}>
          Enter any message or email to analyze it for spam content.
        </Typography>

        {/* Two equal columns using flexbox */}
        <Box sx={{ display: "flex", gap: 3, alignItems: "stretch", flexDirection: { xs: "column", md: "row" } }}>

          {/* ── Left: Input ── */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
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
                    "& .MuiOutlinedInput-input": {
                      fontSize: { xs: "0.9rem", md: "1rem" },
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
                    background: "linear-gradient(135deg, #e63946 0%, #d62828 100%)",
                    "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 16px rgba(230, 57, 70, 0.3)" },
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
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700}>Recent Analyses</Typography>
                    <Button
                      size="small" variant="outlined" color="secondary" startIcon={<DownloadIcon />}
                      onClick={handleExportHistoryCSV}
                      sx={{ "&:hover": { transform: "translateY(-2px)" }, transition: "all 0.3s ease" }}
                    >
                      Export CSV
                    </Button>
                  </Box>
                  {history.map((h, i) => (
                    <Box key={i} onClick={() => setSelectedHistory(h)} sx={{
                      display: "flex", alignItems: "center", gap: 2, py: 1, px: 1,
                      borderRadius: 1.5, cursor: "pointer",
                      borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
                      transition: "background 0.2s ease",
                      "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)" },
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
          <Box sx={{ flex: 1, minWidth: 0 }}>
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
                  ? isDark ? "rgba(230, 57, 70, 0.08)" : "rgba(230, 57, 70, 0.06)"
                  : isDark ? "rgba(102, 187, 106, 0.08)" : "rgba(102, 187, 106, 0.06)",
                border: `1px solid ${result.is_spam
                  ? isDark ? "rgba(230, 57, 70, 0.4)" : "rgba(230, 57, 70, 0.2)"
                  : isDark ? "rgba(102, 187, 106, 0.4)" : "rgba(102, 187, 106, 0.2)"}`,
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

                  {/* Export */}
                  <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                    <Button fullWidth variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport} size="small"
                      sx={{ "&:hover": { transform: "translateY(-2px)" }, transition: "all 0.3s ease" }}>
                      Export JSON
                    </Button>
                    <Button fullWidth variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCSV} size="small" color="secondary"
                      sx={{ "&:hover": { transform: "translateY(-2px)" }, transition: "all 0.3s ease" }}>
                      Export CSV
                    </Button>
                  </Box>

                  {/* Explanation */}
                  <Divider sx={{ mt: 3, mb: 2 }} />
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    Explanation
                  </Typography>
                  <Box sx={{
                    p: 2, borderRadius: 2,
                    bgcolor: result.is_spam
                      ? isDark ? "rgba(230,57,70,0.08)" : "rgba(230,57,70,0.06)"
                      : isDark ? "rgba(102,187,106,0.08)" : "rgba(102,187,106,0.06)",
                    border: `1px solid ${result.is_spam
                      ? isDark ? "rgba(230,57,70,0.25)" : "rgba(230,57,70,0.15)"
                      : isDark ? "rgba(102,187,106,0.25)" : "rgba(102,187,106,0.15)"}`,
                  }}>
                    <Typography variant="body2" color={isDark ? "grey.300" : "grey.700"} sx={{ lineHeight: 1.8 }}>
                      {generateExplanation(result)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      </Container>

      {/* History detail dialog */}
      <Dialog
        open={!!selectedHistory}
        onClose={() => setSelectedHistory(null)}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: isDark ? "#1a1a2e" : "#fff", backgroundImage: "none" } }}
      >
        {selectedHistory && (
          <>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {selectedHistory.is_spam
                ? <WarningAmberIcon sx={{ fontSize: 32, color: "#ef5350" }} />
                : <CheckCircleIcon sx={{ fontSize: 32, color: "#66bb6a" }} />}
              <Box>
                <Typography variant="h6" fontWeight={800} color={selectedHistory.is_spam ? "error" : "success.main"}>
                  {selectedHistory.is_spam ? "SPAM" : "LEGITIMATE"}
                </Typography>
                <Typography variant="caption" color={isDark ? "grey.400" : "grey.600"}>
                  {selectedHistory.timestamp} · Model: {selectedHistory.model_used.replace(/_/g, " ")}
                </Typography>
              </Box>
            </DialogTitle>
            <Divider />
            <DialogContent>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Message</Typography>
              <Box sx={{
                p: 2, mb: 3, borderRadius: 2,
                bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              }}>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {selectedHistory.fullText}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"}>Confidence</Typography>
                  <Typography variant="body2" fontWeight={700}>{(selectedHistory.confidence * 100).toFixed(1)}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={selectedHistory.confidence * 100}
                  color={selectedHistory.is_spam ? "error" : "success"} sx={{ height: 8, borderRadius: 4 }} />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"}>Risk Score</Typography>
                  <Chip label={getRiskLabel(selectedHistory.risk_score)} size="small"
                    sx={{ bgcolor: getRiskColor(selectedHistory.risk_score), color: "white", fontWeight: 700 }} />
                </Box>
                <LinearProgress variant="determinate" value={selectedHistory.risk_score * 100}
                  sx={{ height: 8, borderRadius: 4, "& .MuiLinearProgress-bar": { bgcolor: getRiskColor(selectedHistory.risk_score) } }} />
                <Typography variant="caption" color="grey.500">{selectedHistory.risk_score.toFixed(4)}</Typography>
              </Box>

              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Feature Analysis</Typography>
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                {[
                  { label: "Words",         value: selectedHistory.features.word_count },
                  { label: "URLs",           value: selectedHistory.features.url_count },
                  { label: "Spam Keywords",  value: selectedHistory.features.spam_keyword_count },
                  { label: "Exclamations",   value: selectedHistory.features.exclaim_count },
                ].map((f) => (
                  <Box key={f.label} sx={{
                    flex: 1, minWidth: 80,
                    bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                    borderRadius: 2, p: 1.5, textAlign: "center",
                  }}>
                    <Typography variant="h6" fontWeight={700}>{Math.round(f.value)}</Typography>
                    <Typography variant="caption" color={isDark ? "grey.400" : "grey.600"}>{f.label}</Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ mt: 3, mb: 2 }} />
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Explanation</Typography>
              <Box sx={{
                p: 2, borderRadius: 2,
                bgcolor: selectedHistory.is_spam
                  ? isDark ? "rgba(230,57,70,0.08)" : "rgba(230,57,70,0.06)"
                  : isDark ? "rgba(102,187,106,0.08)" : "rgba(102,187,106,0.06)",
                border: `1px solid ${selectedHistory.is_spam
                  ? isDark ? "rgba(230,57,70,0.25)" : "rgba(230,57,70,0.15)"
                  : isDark ? "rgba(102,187,106,0.25)" : "rgba(102,187,106,0.15)"}`,
              }}>
                <Typography variant="body2" color={isDark ? "grey.300" : "grey.700"} sx={{ lineHeight: 1.8 }}>
                  {generateExplanation(selectedHistory)}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedHistory(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}