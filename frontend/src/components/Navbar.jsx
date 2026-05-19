// Navbar.jsx - ThreatInk Navigation Bar (Left Sidebar)
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer, List, ListItem, ListItemButton, ListItemText, Box, useMediaQuery, useTheme, Tooltip,
  IconButton, Typography, Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import SecurityIcon from "@mui/icons-material/Security";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

const navLinks = [
  { label: "Home",      path: "/" },
  { label: "Detector",  path: "/detector" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "About",     path: "/about" },
];

const DRAWER_WIDTH = 260;

export default function Navbar({ isDarkMode, onToggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const drawerContent = (
    <Box sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: isDarkMode
        ? "linear-gradient(to bottom, rgba(26,26,46,0.98), rgba(15,15,30,0.98))"
        : "linear-gradient(to bottom, rgba(255,255,255,0.98), rgba(241,244,248,0.98))",
      backdropFilter: "blur(10px)",
    }}>
      {/* Logo Section */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SecurityIcon sx={{ color: "primary.main", fontSize: 28 }} />
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ cursor: "pointer" }}
            onClick={() => {
              navigate("/");
              if (isMobile) setDrawerOpen(false);
            }}
          >
            Threat<span style={{ color: "#ef5350" }}>Ink</span>
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: isDarkMode ? "rgba(255, 107, 122, 0.15)" : "rgba(227, 57, 70, 0.12)" }} />

      {/* Navigation Links */}
      <List sx={{ flex: 1, py: 2 }}>
        {navLinks.map((link) => (
          <ListItem key={link.path} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(link.path);
                if (isMobile) setDrawerOpen(false);
              }}
              sx={{
                py: 1.5,
                px: 2,
                mx: 1,
                borderRadius: 2,
                color: location.pathname === link.path ? "primary.main" : "inherit",
                fontWeight: location.pathname === link.path ? 700 : 500,
                backgroundColor: location.pathname === link.path
                  ? isDarkMode
                    ? "rgba(255, 107, 122, 0.12)"
                    : "rgba(227, 57, 70, 0.08)"
                  : "transparent",
                borderLeft: location.pathname === link.path ? "3px solid" : "3px solid transparent",
                borderLeftColor: location.pathname === link.path ? "primary.main" : "transparent",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: isDarkMode
                    ? "rgba(255, 107, 122, 0.15)"
                    : "rgba(227, 57, 70, 0.1)",
                  color: "primary.main",
                },
              }}
            >
              <ListItemText
                primary={link.label}
                sx={{
                  "& .MuiTypography-root": {
                    fontSize: "1rem",
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Theme Toggle */}
      <Divider sx={{ borderColor: isDarkMode ? "rgba(255, 107, 122, 0.15)" : "rgba(227, 57, 70, 0.12)" }} />
      <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
        <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          <IconButton
            onClick={onToggleTheme}
            sx={{
              color: "primary.main",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "rotate(180deg)",
              },
            }}
          >
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  // Desktop: Permanent Drawer
  if (!isMobile) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: isDarkMode
              ? "1px solid rgba(255, 107, 122, 0.15)"
              : "1px solid rgba(227, 57, 70, 0.12)",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // Mobile: Temporary Drawer with Menu Button
  return (
    <>
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
        background: isDarkMode
          ? "linear-gradient(to bottom, rgba(26,26,46,0.98), rgba(15,15,30,0.98))"
          : "linear-gradient(to bottom, rgba(255,255,255,0.98), rgba(241,244,248,0.98))",
        borderBottom: isDarkMode
          ? "1px solid rgba(255, 107, 122, 0.15)"
          : "1px solid rgba(227, 57, 70, 0.12)",
        backdropFilter: "blur(10px)",
      }}>
        <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
          <MenuIcon />
        </IconButton>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SecurityIcon sx={{ color: "primary.main" }} />
          <Typography variant="h6" fontWeight={700}>
            Threat<span style={{ color: "#ef5350" }}>Ink</span>
          </Typography>
        </Box>
        <Box sx={{ width: 40 }} />
      </Box>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        {drawerContent}
      </Drawer>
    </>
  );
}