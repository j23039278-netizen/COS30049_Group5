// App.jsx - ThreatInk Main Router
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline, Box, useMediaQuery } from "@mui/material";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Detector from "./pages/Detector";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#e63946" },
    secondary: { main: "#457b9d" },
    background: { default: "#f1f4f8", paper: "#ffffff" },
    text: { primary: "#1a1a1a", secondary: "#5a5a5a" },
    divider: "rgba(227, 57, 70, 0.12)",
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.01em" },
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    body1: { lineHeight: 1.6 },
  },
  shape: { borderRadius: 16 },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#ff6b7a" },
    secondary: { main: "#5dade2" },
    background: { default: "#0f0f1e", paper: "#1a1a2e" },
    text: { primary: "#f0f1f3", secondary: "#a8aab0" },
    divider: "rgba(255, 107, 122, 0.15)",
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.01em" },
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    body1: { lineHeight: 1.6 },
  },
  shape: { borderRadius: 16 },
});

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Navbar isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/detector" element={<Detector />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;