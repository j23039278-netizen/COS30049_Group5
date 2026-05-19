// Home.jsx - ThreatInk Landing Page
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Container, Grid, Card, CardContent, useTheme,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import ShieldIcon from "@mui/icons-material/Shield";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const features = [
  {
    icon: <SecurityIcon sx={{ fontSize: 40, color: "#e63946" }} />,
    title: "AI-Powered Detection",
    desc: "Uses Random Forest, Logistic Regression, Naive Bayes, and Linear SVM to classify spam messages with up to 97.46% accuracy.",
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 40, color: "#457b9d" }} />,
    title: "Real-Time Analysis",
    desc: "Get instant spam classification results with confidence scores and risk levels within milliseconds.",
  },
  {
    icon: <AnalyticsIcon sx={{ fontSize: 40, color: "#57b849" }} />,
    title: "Data Visualization",
    desc: "Explore interactive charts showing model performance, spam patterns, and keyword frequency analysis.",
  },
  {
    icon: <ShieldIcon sx={{ fontSize: 40, color: "#f59e0b" }} />,
    title: "Risk Scoring",
    desc: "Beyond binary classification — get a continuous spam risk score from 0.0 to 1.0 for nuanced threat assessment.",
  },
];

const stats = [
  { value: "97.46%", label: "Detection Accuracy" },
  { value: "94,298", label: "Training Records" },
  { value: "4",      label: "ML Models" },
  { value: "0.9965", label: "ROC-AUC Score" },
];

export default function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{
      minHeight: "100vh",
      background: isDark
        ? "linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #0f0f1e 100%)"
        : "linear-gradient(135deg, #f1f4f8 0%, #e8f1fa 50%, #f1f4f8 100%)",
      transition: "background 0.3s ease",
      pb: 8,
    }}>
      <Container maxWidth="lg">

        {/* ── Hero ── */}
        <Box sx={{ textAlign: "center", pt: { xs: 8, md: 12 }, pb: 6 }}>
          <Typography variant="h2" fontWeight={800} sx={{
            mb: 2,
            fontSize: { xs: "2rem", md: "3.4rem" },
            background: "linear-gradient(135deg, #e63946 0%, #457b9d 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "fadeIn 0.8s ease-in",
          }}>
            Detect Spam with AI Precision
          </Typography>

          <Typography variant="h6" sx={{
            color: isDark ? "grey.400" : "grey.600",
            mb: 5, maxWidth: 600, mx: "auto", fontWeight: 400,
            fontSize: { xs: "0.95rem", md: "1.1rem" },
            animation: "fadeIn 1s ease-in 0.2s both",
          }}>
            ThreatInk uses machine learning to classify messages as spam or legitimate,
            providing confidence scores and risk assessments in real time.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap", animation: "fadeIn 1.2s ease-in 0.4s both" }}>
            <Button
              variant="contained" size="large"
              onClick={() => navigate("/detector")}
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 4, py: 1.5, fontWeight: 700, fontSize: "1rem",
                background: "linear-gradient(135deg, #e63946 0%, #d62828 100%)",
                boxShadow: "0 8px 16px rgba(230, 57, 70, 0.3)",
                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 24px rgba(230, 57, 70, 0.4)" },
                transition: "all 0.3s ease",
              }}
            >
              Try Detector
            </Button>
            <Button
              variant="outlined" size="large"
              onClick={() => navigate("/dashboard")}
              sx={{
                px: 4, py: 1.5, fontWeight: 700, fontSize: "1rem",
                borderColor: "primary.main", color: "primary.main",
                "&:hover": {
                  backgroundColor: isDark ? "rgba(230, 57, 70, 0.1)" : "rgba(230, 57, 70, 0.08)",
                  transform: "translateY(-4px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              View Dashboard
            </Button>
          </Box>
        </Box>

        {/* ── Stats Bar ── */}
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: { xs: 1, sm: 2, md: 2 },
          mb: 8,
          animation: "fadeIn 1.4s ease-in 0.6s both",
          flexWrap: "wrap",
        }}>
          {stats.map((stat) => (
            <Card
              key={stat.label}
              sx={{
                flex: "1 1 calc(50% - 8px)",
                "@media (min-width: 600px)": {
                  flex: "1 1 calc(50% - 8px)",
                },
                textAlign: "center",
                py: { xs: 2.5, md: 3 },
                px: { xs: 2, md: 3 },
                background: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.7)",
                border: isDark ? "1px solid rgba(255, 107, 122, 0.15)" : "1px solid rgba(227, 57, 70, 0.1)",
                minWidth: 0,
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: isDark ? "0 12px 24px rgba(0,0,0,0.3)" : "0 12px 24px rgba(0,0,0,0.1)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <Typography variant="h4" fontWeight={800} sx={{ color: "#ef5350", fontSize: { xs: "1.75rem", md: "2rem" } }}>{stat.value}</Typography>
              <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"}>{stat.label}</Typography>
            </Card>
          ))}
        </Box>

        {/* ── Features ── */}
        <Typography variant="h4" fontWeight={700} textAlign="center" sx={{
          mb: 6,
          color: isDark ? "white" : "text.primary",
          fontSize: { xs: "1.8rem", md: "2.2rem" },
        }}>
          Why <span style={{ color: "#ef5350" }}>ThreatInk</span>?
        </Typography>

        <Box sx={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          justifyContent: "space-between",
          pb: 10,
        }}>
          {features.map((f, index) => (
            <Box
              key={f.title}
              sx={{
                flex: "1 1 calc(100% - 12px)",
                "@media (min-width: 600px)": {
                  flex: "1 1 calc(50% - 12px)",
                },
                "@media (min-width: 1200px)": {
                  flex: "1 1 calc(25% - 12px)",
                },
                minWidth: "auto",
                animation: `fadeIn 0.6s ease-in ${0.8 + index * 0.1}s both`,
              }}
            >
              <Card sx={{
                height: "100%",
                minHeight: 340,
                background: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.7)",
                border: isDark ? "1px solid rgba(255, 107, 122, 0.15)" : "1px solid rgba(227, 57, 70, 0.1)",
                transition: "all 0.3s ease",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                "&:hover": {
                  transform: "translateY(-12px)",
                  boxShadow: isDark ? "0 16px 32px rgba(255, 107, 122, 0.2)" : "0 16px 32px rgba(230, 57, 70, 0.15)",
                  borderColor: isDark ? "rgba(255, 107, 122, 0.5)" : "rgba(230, 57, 70, 0.3)",
                },
              }}>
                <CardContent sx={{ textAlign: "center", p: 4, flex: 1, display: "flex", flexDirection: "column" }}>
                  <Box sx={{ mb: 3, fontSize: "2.5rem" }}>{f.icon}</Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{f.title}</Typography>
                  <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"} sx={{ flex: 1 }}>{f.desc}</Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

      </Container>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
}