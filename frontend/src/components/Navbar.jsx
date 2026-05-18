// Navbar.jsx - ThreatInk Navigation Bar
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Button, IconButton,
  Drawer, List, ListItem, ListItemText, Box, useMediaQuery, useTheme, Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SecurityIcon from "@mui/icons-material/Security";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

const navLinks = [
  { label: "Home",      path: "/" },
  { label: "Detector",  path: "/detector" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "About",     path: "/about" },
];

export default function Navbar({ isDarkMode, onToggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <AppBar position="sticky" sx={{
        background: isDarkMode
          ? "rgba(18,18,26,0.95)"
          : "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: isDarkMode
          ? "1px solid rgba(239,83,80,0.2)"
          : "1px solid rgba(239,83,80,0.3)",
        boxShadow: isDarkMode
          ? "0 2px 8px rgba(0,0,0,0.3)"
          : "0 2px 8px rgba(0,0,0,0.1)",
      }}>
        <Toolbar>
          {/* Logo */}
          <SecurityIcon sx={{ color: "primary.main", mr: 1 }} />
          <Typography variant="h6" fontWeight={700} sx={{
            flexGrow: 1, cursor: "pointer", color: theme.palette.text.primary
          }} onClick={() => navigate("/")}>
            Threat<span style={{ color: "#ef5350" }}>Ink</span>
          </Typography>

          {/* Desktop nav */}
          {!isMobile && navLinks.map((link) => (
            <Button
              key={link.path}
              onClick={() => navigate(link.path)}
              sx={{
                color: location.pathname === link.path ? "primary.main" : "inherit",
                fontWeight: location.pathname === link.path ? 700 : 400,
                borderBottom: location.pathname === link.path ? "2px solid #ef5350" : "2px solid transparent",
                borderRadius: 0,
                mx: 1,
                opacity: location.pathname === link.path ? 1 : 0.7,
                transition: "all 0.3s ease",
                "&:hover": {
                  opacity: 1,
                  color: "primary.main",
                },
              }}
            >
              {link.label}
            </Button>
          ))}

          {/* Theme Toggle Button */}
          <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <IconButton
              onClick={onToggleTheme}
              sx={{
                ml: 2,
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

          {/* Mobile menu */}
          {isMobile && (
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 220, bgcolor: "background.paper", height: "100%" }}>
          <List>
            {navLinks.map((link) => (
              <ListItem
                button
                key={link.path}
                onClick={() => { navigate(link.path); setDrawerOpen(false); }}
                sx={{ color: location.pathname === link.path ? "primary.main" : "inherit" }}
              >
                <ListItemText primary={link.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}