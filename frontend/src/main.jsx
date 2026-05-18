// main.jsx - ThreatInk App Entry Point
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import App from "./App.jsx";

// ThreatInk dark theme
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#ef5350" },
    secondary: { main: "#42a5f5" },
    background: { default: "#0a0a0f", paper: "#12121a" },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);