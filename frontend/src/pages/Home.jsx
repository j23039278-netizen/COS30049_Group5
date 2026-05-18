// Home.jsx - ThreatInk Landing Page
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Container, Grid, Card, CardContent,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import ShieldIcon from "@mui/icons-material/Shield";

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

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)" }}>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", py: { xs: 8, md: 14 } }}>
          <Typography variant="h2" fontWeight={800} sx={{ mb: 2, fontSize: { xs: "2.2rem", md: "3.5rem" } }}>
            Detect Spam with{" "}
            <span style={{ color: "#ef5350" }}>AI Precision</span>
          </Typography>
          <Typography variant="h6" sx={{ color: "grey.400", mb: 4, maxWidth: 600, mx: "auto" }}>
            ThreatInk uses machine learning to classify messages as spam or legitimate,
            providing confidence scores and risk assessments in real time.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={() => navigate("/detector")}
              sx={{ px: 4, py: 1.5, fontWeight: 700, fontSize: "1rem" }}
            >
              Try Detector
            </Button>
            <Button
              variant="outlined"
              size="large"
              color="secondary"
              onClick={() => navigate("/dashboard")}
              sx={{ px: 4, py: 1.5, fontWeight: 700, fontSize: "1rem" }}
            >
              View Dashboard
            </Button>
          </Box>
        </Box>

        {/* Stats Bar */}
        <Grid container spacing={3} sx={{ mb: 10 }}>
          {stats.map((stat) => (
            <Grid item xs={6} md={3} key={stat.label}>
              <Card sx={{ textAlign: "center", py: 3, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(239,83,80,0.2)" }}>
                <Typography variant="h4" fontWeight={800} color="primary">{stat.value}</Typography>
                <Typography variant="body2" color="grey.400">{stat.label}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Features */}
        <Typography variant="h4" fontWeight={700} textAlign="center" sx={{ mb: 4 }}>
          Why ThreatInk?
        </Typography>
        <Grid container spacing={3} sx={{ pb: 10 }}>
          {features.map((f) => (
            <Grid item xs={12} sm={6} md={3} key={f.title}>
              <Card sx={{ height: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", p: 1 }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>{f.icon}</Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{f.title}</Typography>
                  <Typography variant="body2" color="grey.400">{f.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}