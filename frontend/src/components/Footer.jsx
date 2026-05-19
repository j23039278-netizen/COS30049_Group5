import { Box, Typography, useTheme } from "@mui/material";

export default function Footer() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{
      bgcolor: isDark
        ? "rgba(18,18,26,0.95)"
        : "rgba(223, 212, 144, 0.95)",
      borderTop: isDark
        ? "1px solid rgba(239,83,80,0.2)"
        : "1px solid rgba(239,83,80,0.3)",
      py: 2,
      mt: 4,
      textAlign: "center",
    }}>
      <Typography variant="body2" color={isDark ? "grey.500" : "grey.600"}>
        @ <span style={{ color: "#ef5350", fontWeight: 700 }}>ThreatInk</span> - 2026
      </Typography>
    </Box>
  );
}
