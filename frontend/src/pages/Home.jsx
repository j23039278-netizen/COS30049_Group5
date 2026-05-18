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
    icon: <SecurityIcon sx={{ fontSize: 40, color: "#ef5350" }} />,
    title: "AI-Powered Detection",
    desc: "Uses Random Forest, Logistic Regression, Naive Bayes, and Linear SVM to classify spam messages with up to 97.46% accuracy.",
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 40, color: "#42a5f5" }} />,
    title: "Real-Time Analysis",
    desc: "Get instant spam classification results with confidence scores and risk levels within milliseconds.",
  },
  {
    icon: <AnalyticsIcon sx={{ fontSize: 40, color: "#66bb6a" }} />,
    title: "Data Visualization",
    desc: "Explore interactive charts showing model performance, spam patterns, and keyword frequency analysis.",
  },
  {
    icon: <ShieldIcon sx={{ fontSize: 40, color: "#ffa726" }} />,
    title: "Risk Scoring",
    desc: "Beyond binary classification — get a continuous spam risk score from 0.0 to 1.0 for nuanced threat assessment.",
  },
];

const stats = [
  { value: "97.46%", label: "Detection Accuracy" },
  { value: "94,298", label: "Training Records" },
  { value: "4", label: "ML Models" },
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
        ? "linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)"
        : "linear-gradient(180deg, #f5f7fa 0%, #e8eef7 100%)",
      transition: "background 0.3s ease",
      pt: { xs: 4, md: 8 },
      pb: 8,
    }}>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", py: { xs: 6, md: 12 } }}>
          <Typography variant="h2" fontWeight={800} sx={{
            mb: 2,
            fontSize: { xs: "2.2rem", md: "3.5rem" },
            background: "linear-gradient(135deg, #ef5350 0%, #42a5f5 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "fadeIn 0.8s ease-in",
          }}>
            Detect Spam with AI Precision
          </Typography>
          <Typography variant="h6" sx={{
            color: isDark ? "grey.400" : "grey.600",
            mb: 4,
            maxWidth: 600,
            mx: "auto",
            fontSize: { xs: "0.95rem", md: "1.1rem" },
            fontWeight: 500,
            animation: "fadeIn 1s ease-in 0.2s both",
          }}>
            ThreatInk uses machine learning to classify messages as spam or legitimate,
            providing confidence scores and risk assessments in real time.
          </Typography>
          <Box sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
            animation: "fadeIn 1.2s ease-in 0.4s both",
          }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={() => navigate("/detector")}
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 700,
                fontSize: "1rem",
                background: "linear-gradient(135deg, #ef5350 0%, #e84a3d 100%)",
                boxShadow: "0 8px 16px rgba(239, 83, 80, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 24px rgba(239, 83, 80, 0.4)",
                },
              }}
            >
              Try Detector
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/dashboard")}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 700,
                fontSize: "1rem",
                borderColor: "primary.main",
                color: "primary.main",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: isDark ? "rgba(239, 83, 80, 0.1)" : "rgba(239, 83, 80, 0.08)",
                  transform: "translateY(-4px)",
                },
              }}
            >
              View Dashboard
            </Button>
          </Box>
        </Box>

        {/* Stats Bar */}
        <Grid container spacing={3} sx={{ mb: 10, animation: "fadeIn 1.4s ease-in 0.6s both" }}>
          {stats.map((stat) => (
            <Grid item xs={6} md={3} key={stat.label}>
              <Card sx={{
                textAlign: "center",
                py: 3,
                background: isDark
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(255,255,255,0.5)",
                border: isDark
                  ? "1px solid rgba(239,83,80,0.2)"
                  : "1px solid rgba(239,83,80,0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: isDark
                    ? "0 8px 16px rgba(0,0,0,0.3)"
                    : "0 8px 16px rgba(0,0,0,0.1)",
                },
              }}>
                <Typography variant="h4" fontWeight={800} color="primary">{stat.value}</Typography>
                <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"}>{stat.label}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Features */}
        <Typography variant="h4" fontWeight={700} textAlign="center" sx={{
          mb: 6,
          fontSize: { xs: "1.8rem", md: "2.2rem" },
          color: isDark ? "white" : "text.primary",
        }}>
          Why ThreatInk?
        </Typography>
        <Grid container spacing={3} sx={{ pb: 10 }}>
          {features.map((f, index) => (
            <Grid item xs={12} sm={6} md={3} key={f.title} sx={{
              animation: `fadeIn 0.6s ease-in ${0.8 + index * 0.1}s both`,
            }}>
              <Card sx={{
                height: "100%",
                background: isDark
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(255,255,255,0.6)",
                border: isDark
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "1px solid rgba(239,83,80,0.1)",
                p: 3,
                transition: "all 0.3s ease",
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: isDark
                    ? "0 12px 24px rgba(239,83,80,0.15)"
                    : "0 12px 24px rgba(239,83,80,0.1)",
                  background: isDark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(255,255,255,0.8)",
                  borderColor: "primary.main",
                },
              }}>
                <Box sx={{
                  mb: 2,
                  display: "flex",
                  justifyContent: "center",
                  transition: "transform 0.3s ease",
                  "$:hover &": {
                    transform: "scale(1.1)",
                  },
                }}>{f.icon}</Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{f.title}</Typography>
                <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"}>{f.desc}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Box>
  );
}