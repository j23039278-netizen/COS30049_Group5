// App.jsx - ThreatInk Main Router
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Detector from "./pages/Detector";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#ef5350" },
    secondary: { main: "#42a5f5" },
    background: { default: "#f5f7fa", paper: "#ffffff" },
    text: { primary: "#1a1a1a", secondary: "#555555" },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#ef5350" },
    secondary: { main: "#42a5f5" },
    background: { default: "#0a0a0f", paper: "#12121a" },
    text: { primary: "#ffffff", secondary: "#b0b0b0" },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
});

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detector" element={<Detector />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;