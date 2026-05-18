// About.jsx - ThreatInk About Page
import {
  Box, Container, Typography, Grid, Card, CardContent, Chip, Divider,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import CodeIcon from "@mui/icons-material/Code";
import StorageIcon from "@mui/icons-material/Storage";
import BarChartIcon from "@mui/icons-material/BarChart";

const teamMembers = [
  { name: "Yan Min Xuan Shanice", id: "106214470", role: "Frontend Developer", tasks: ["React.js UI/UX", "Material UI", "API Integration"] },
  { name: "Soh Way Miin",         id: "105967029", role: "ML Engineer",        tasks: ["Data Processing", "Model Training", "Feature Engineering"] },
  { name: "Tan Jun Xiong",        id: "105971619", role: "Backend Developer",  tasks: ["FastAPI Backend", "API Endpoints", "Documentation"] },
];

const techStack = [
  { category: "Frontend",   icon: <CodeIcon />,     items: ["React.js", "Material UI", "Recharts", "Axios", "React Router"] },
  { category: "Backend",    icon: <StorageIcon />,  items: ["FastAPI", "Python 3.12", "Uvicorn", "Pydantic"] },
  { category: "ML Models",  icon: <BarChartIcon />, items: ["Random Forest", "Logistic Regression", "Linear SVM", "Naive Bayes", "Gradient Boosting"] },
  { category: "Libraries",  icon: <SecurityIcon />, items: ["Scikit-learn", "NLTK", "Pandas", "NumPy", "Joblib"] },
];

const modelPerf = [
  { name: "Random Forest",       accuracy: "97.46%", f1: "0.9740", roc: "0.9965", best: true },
  { name: "Linear SVM",          accuracy: "96.91%", f1: "0.9683", roc: "0.9956", best: false },
  { name: "Logistic Regression", accuracy: "96.51%", f1: "0.9643", roc: "0.9950", best: false },
  { name: "Naive Bayes",         accuracy: "93.41%", f1: "0.9335", roc: "0.9868", best: false },
];

export default function About() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
          About <span style={{ color: "#ef5350" }}>ThreatInk</span>
        </Typography>
        <Typography variant="body1" color="grey.400" sx={{ mb: 4, maxWidth: 700 }}>
          ThreatInk is a machine learning-powered spam detection system developed for
          COS30049 Computing Technology Innovation Project. It classifies messages as
          spam or legitimate using multiple ML models and provides risk scoring.
        </Typography>

        <Grid container spacing={4}>
          {/* Project Info */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Project Information</Typography>
                {[
                  { label: "Course",    value: "COS30049 Computing Technology Innovation Project" },
                  { label: "Section",   value: "C1 — Group 05" },
                  { label: "Year",      value: "2026, Semester 3" },
                  { label: "Dataset",   value: "94,298 records (emails + SMS)" },
                  { label: "Best Model", value: "Random Forest (97.46% accuracy)" },
                ].map((item) => (
                  <Box key={item.label} sx={{ display: "flex", gap: 2, mb: 1.5 }}>
                    <Typography variant="body2" color="grey.500" sx={{ minWidth: 110 }}>{item.label}</Typography>
                    <Typography variant="body2" color="grey.200">{item.value}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Team */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Team Members</Typography>
                {teamMembers.map((m) => (
                  <Box key={m.id} sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                      <Typography variant="body1" fontWeight={600}>{m.name}</Typography>
                      <Chip label={m.id} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />
                    </Box>
                    <Typography variant="caption" color="primary.main" sx={{ mb: 0.5, display: "block" }}>{m.role}</Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {m.tasks.map((t) => (
                        <Chip key={t} label={t} size="small" sx={{ bgcolor: "rgba(255,255,255,0.06)", fontSize: "0.7rem" }} />
                      ))}
                    </Box>
                    <Divider sx={{ mt: 1.5 }} />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Model Performance */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 4 }}>Model Performance</Typography>
                <Grid container spacing={3}>
                  {modelPerf.map((m) => (
                    <Grid item xs={12} sm={6} md={3} key={m.name}>
                      <Box sx={{ p: 3.5, borderRadius: 2, bgcolor: m.best ? "rgba(239,83,80,0.15)" : "rgba(255,255,255,0.05)", border: m.best ? "2px solid rgba(239,83,80,0.5)" : "1px solid rgba(255,255,255,0.15)", textAlign: "center", height: "100%" }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 3 }}>
                          <Typography variant="body1" fontWeight={700}>{m.name}</Typography>
                          {m.best && <Chip label="Best" size="small" color="error" sx={{ height: 22, fontSize: "0.7rem" }} />}
                        </Box>
                        <Box sx={{ mb: 2.5, pb: 2.5, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                          <Typography variant="caption" color="grey.400" sx={{ display: "block", mb: 1, fontSize: "0.75rem" }}>Accuracy</Typography>
                          <Typography variant="h6" fontWeight={800} sx={{ color: "#42a5f5", fontSize: "1.1rem" }}>{m.accuracy}</Typography>
                        </Box>
                        <Box sx={{ mb: 2.5 }}>
                          <Typography variant="caption" color="grey.400" sx={{ display: "block", mb: 1, fontSize: "0.75rem" }}>F1 Score</Typography>
                          <Typography variant="h6" fontWeight={800} sx={{ color: "#66bb6a", fontSize: "1.1rem" }}>{m.f1}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="grey.400" sx={{ display: "block", mb: 1, fontSize: "0.75rem" }}>ROC-AUC</Typography>
                          <Typography variant="h6" fontWeight={800} sx={{ color: "#ffa726", fontSize: "1.1rem" }}>{m.roc}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Tech Stack */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 4 }}>Tech Stack</Typography>
                <Grid container spacing={3}>
                  {techStack.map((t) => (
                    <Grid item xs={12} sm={6} md={3} key={t.category}>
                      <Box sx={{ p: 3.5, borderRadius: 2, bgcolor: "rgba(66,165,245,0.1)", border: "1px solid rgba(66,165,245,0.3)", height: "100%" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3.5 }}>
                          <Box sx={{ color: "#42a5f5", fontSize: "2rem" }}>{t.icon}</Box>
                          <Typography variant="body1" fontWeight={700}>{t.category}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {t.items.map((item) => (
                            <Chip key={item} label={item} size="small" sx={{ bgcolor: "rgba(66,165,245,0.2)", color: "#42a5f5", fontSize: "0.75rem", height: 30, fontWeight: 600 }} />
                          ))}
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}