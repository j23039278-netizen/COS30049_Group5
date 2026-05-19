import { Box, Typography, useTheme } from "@mui/material";

export default function Footer() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{
      background: isDark
        ? "linear-gradient(to bottom, rgba(26,26,46,0.98), rgba(15,15,30,0.98))"
        : "linear-gradient(to bottom, rgba(255,255,255,0.98), rgba(241,244,248,0.98))",
      borderTop: isDark
        ? "1px solid rgba(255, 107, 122, 0.15)"
        : "1px solid rgba(227, 57, 70, 0.12)",
      backdropFilter: "blur(10px)",
      py: 3,
      mt: 4,
      textAlign: "center",
    }}>
      <Typography variant="body2" sx={{ 
        color: isDark ? "grey.400" : "grey.600",
        letterSpacing: "0.02em",
      }}>
         <span style={{ color: isDark ? "#ff6b7a" : "#e63946", fontWeight: 700 }}>@ ThreatInk - 2026  |  COS30049 Group 05  |  Swinburne University of Technology</span>
      </Typography>
    </Box>
  );
}
