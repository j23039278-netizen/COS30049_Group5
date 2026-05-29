// Dashboard.jsx - ThreatInk Data Visualization Dashboard with D3.js
import { useState, useEffect, useRef } from "react";
import {
  Box, Container, Typography, Card, CardContent,
  CircularProgress, Alert, useTheme,
} from "@mui/material";
import * as d3 from "d3";
import { getStats } from "../services/api";

// D3.js Pie Chart Component
const D3PieChart = ({ data, isDark }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = 380;
    const radius = Math.min(width, height) / 2.5;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value((d) => d.value);
    const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius);
    const arcHover = d3.arc().innerRadius(radius * 0.5).outerRadius(radius * 1.05);

    const arcs = g
      .selectAll("arc")
      .data(pie(data))
      .enter()
      .append("g");

    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.fill)
      .attr("stroke", isDark ? "#1a1a2e" : "#f1f4f8")
      .attr("stroke-width", 2)
      .on("mouseover", function () {
        d3.select(this).transition().duration(100).attr("d", arcHover);
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(100).attr("d", arc);
      });

    // Add labels
    arcs
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("fill", isDark ? "#fff" : "#000")
      .attr("font-size", "14px")
      .attr("font-weight", "700")
      .text((d) => `${((d.data.value / d3.sum(data, (x) => x.value)) * 100).toFixed(1)}%`);

    // Add legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(20, ${height - 40})`);

    data.forEach((d, i) => {
      const lg = legend.append("g").attr("transform", `translate(${(width / 2.5) * i}, 0)`);

      lg.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", d.fill);

      lg.append("text")
        .attr("x", 25)
        .attr("y", 14)
        .attr("fill", isDark ? "#a8aab0" : "#5a5a5a")
        .attr("font-size", "12px")
        .text(d.name);
    });
  }, [data, isDark]);

  return (
    <svg
      ref={svgRef}
      style={{
        width: "100%",
        height: "auto",
        minHeight: "380px",
      }}
    />
  );
};

// D3.js Bar Chart Component for Model Performance
const D3BarChart = ({ data, isDark }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = 380;
    const margin = { top: 20, right: 30, bottom: 60, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear().domain([0.9, 1]).range([innerHeight, 0]);

    const keys = ["Accuracy", "F1", "ROC-AUC"];
    const colors = { Accuracy: "#5dade2", F1: "#57b849", "ROC-AUC": "#f59e0b" };

    const xSubScale = d3
      .scaleBand()
      .domain(keys)
      .range([0, xScale.bandwidth()])
      .padding(0.05);

    // Draw bars
    keys.forEach((key) => {
      g.selectAll(`.bar-${key}`)
        .data(data)
        .enter()
        .append("rect")
        .attr("class", `bar-${key}`)
        .attr("x", (d) => xScale(d.name) + xSubScale(key))
        .attr("y", (d) => yScale(d[key]))
        .attr("width", xSubScale.bandwidth())
        .attr("height", (d) => innerHeight - yScale(d[key]))
        .attr("fill", colors[key])
        .attr("rx", 4)
        .on("mouseover", function () {
          d3.select(this)
            .transition()
            .duration(100)
            .attr("opacity", 0.8);
        })
        .on("mouseout", function () {
          d3.select(this)
            .transition()
            .duration(100)
            .attr("opacity", 1);
        });
    });

    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .attr("color", isDark ? "#a8aab0" : "#5a5a5a")
      .selectAll("text")
      .attr("font-size", "12px")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-15)");

    // Y-axis
    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat((d) => `${(d * 100).toFixed(0)}%`))
      .attr("color", isDark ? "#a8aab0" : "#5a5a5a")
      .selectAll("text")
      .attr("font-size", "12px");

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("opacity", 0.1)
      .call(
        d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat("")
      );

    // Legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 10)`);

    keys.forEach((key, i) => {
      const lg = legend.append("g").attr("transform", `translate(${i * 140}, 0)`);

      lg.append("rect")
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", colors[key]);

      lg.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .attr("fill", isDark ? "#a8aab0" : "#5a5a5a")
        .attr("font-size", "12px")
        .text(key);
    });
  }, [data, isDark]);

  return (
    <svg
      ref={svgRef}
      style={{
        width: "100%",
        height: "auto",
        minHeight: "380px",
      }}
    />
  );
};

// D3.js Horizontal Bar Chart for Keywords
const D3KeywordChart = ({ data, isDark }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = 380;
    const margin = { top: 20, right: 30, bottom: 30, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.keyword))
      .range([0, innerHeight])
      .padding(0.2);

    const xScale = d3.scaleLinear().domain([0, d3.max(data, (d) => Math.max(d.Spam, d.Ham))]).range([0, innerWidth]);

    const keys = ["Spam", "Ham"];
    const colors = { Spam: "#e63946", Ham: "#57b849" };

    // Draw bars
    keys.forEach((key) => {
      g.selectAll(`.bar-${key}`)
        .data(data)
        .enter()
        .append("rect")
        .attr("class", `bar-${key}`)
        .attr("x", 0)
        .attr("y", (d) => yScale(d.keyword))
        .attr("width", (d) => xScale(d[key]))
        .attr("height", yScale.bandwidth())
        .attr("fill", colors[key])
        .attr("opacity", 0.8)
        .on("mouseover", function () {
          d3.select(this)
            .transition()
            .duration(100)
            .attr("opacity", 1);
        })
        .on("mouseout", function () {
          d3.select(this)
            .transition()
            .duration(100)
            .attr("opacity", 0.8);
        });
    });

    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .attr("color", isDark ? "#a8aab0" : "#5a5a5a")
      .selectAll("text")
      .attr("font-size", "12px");

    // Y-axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .attr("color", isDark ? "#a8aab0" : "#5a5a5a")
      .selectAll("text")
      .attr("font-size", "12px");

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("opacity", 0.1)
      .call(
        d3.axisBottom(xScale).tickSize(-innerHeight).tickFormat("")
      );

    // Legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 10)`);

    keys.forEach((key, i) => {
      const lg = legend.append("g").attr("transform", `translate(${i * 140}, 0)`);

      lg.append("rect")
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", colors[key]);

      lg.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .attr("fill", isDark ? "#a8aab0" : "#5a5a5a")
        .attr("font-size", "12px")
        .text(key);
    });
  }, [data, isDark]);

  return (
    <svg
      ref={svgRef}
      style={{
        width: "100%",
        height: "auto",
        minHeight: "380px",
      }}
    />
  );
};

export default function Dashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const textColor = isDark ? "#a8aab0" : "#5a5a5a";
  const cardBg = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.7)";
  const cardBorder = isDark ? "1px solid rgba(255, 107, 122, 0.15)" : "1px solid rgba(227, 57, 70, 0.1)";

  useEffect(() => {
    getStats()
      .then((res) => setStats(res.data))
      .catch(() => setError("Failed to load stats. Make sure the backend is running."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <CircularProgress color="primary" />
    </Box>
  );

  if (error) return (
    <Container sx={{ py: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Container>
  );

  const classData = [
    { name: "Ham (Legitimate)", value: stats.class_distribution.ham, fill: "#57b849" },
    { name: "Spam",             value: stats.class_distribution.spam, fill: "#e63946" },
  ];

  const modelData = Object.entries(stats.model_performance).map(([name, metrics]) => ({
    name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    Accuracy: metrics.accuracy,
    F1: metrics.f1,
    "ROC-AUC": metrics.roc_auc,
  }));

  const keywordData = stats.top_spam_keywords.map((k) => ({
    keyword: k.keyword,
    Spam: k.spam,
    Ham: k.ham,
  }));

  return (
    <Box sx={{
      minHeight: "100vh",
      background: isDark
        ? "linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #0f0f1e 100%)"
        : "linear-gradient(135deg, #f1f4f8 0%, #e8f1fa 50%, #f1f4f8 100%)",
      transition: "background 0.3s ease",
      py: 4,
    }}>
      <Container maxWidth="lg">

        {/* Header */}
        <Typography variant="h4" fontWeight={800} textAlign="center" sx={{
          mb: 1,
          fontSize: { xs: "1.75rem", md: "2.125rem" },
          background: "linear-gradient(135deg, #e63946 0%, #457b9d 100%)",
          backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Analytics Dashboard
        </Typography>
        <Typography variant="body1" color={isDark ? "grey.400" : "grey.600"} textAlign="center" sx={{ mb: 1, fontSize: { xs: "0.9rem", md: "1rem" } }}>
          Dataset statistics and model performance visualizations.
        </Typography>
        <Typography variant="body2" color={isDark ? "grey.500" : "grey.500"} textAlign="center" sx={{ mb: 4, fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
          Trained on 94,298 combined email and SMS records from Kaggle and UCI datasets. 45,917 spam and 48,381 ham messages were used for model training, achieving a best accuracy of 97.46% with Random Forest.
        </Typography>

        {/* Summary Cards - flex row */}
        <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 }, mb: 4, flexWrap: "wrap" }}>
          {[
            { label: "Total Records",  value: stats.class_distribution.total.toLocaleString(), color: "#42a5f5" },
            { label: "Spam Messages",  value: stats.class_distribution.spam.toLocaleString(),  color: "#ef5350" },
            { label: "Ham Messages",   value: stats.class_distribution.ham.toLocaleString(),   color: "#66bb6a" },
            { label: "Best Accuracy",  value: "97.46%",                                        color: "#ffa726" },
          ].map((s) => (
            <Card key={s.label} sx={{
              flex: "1 1 calc(50% - 8px)", textAlign: "center", py: { xs: 1.5, md: 2 }, px: { xs: 1, md: 2 },
              bgcolor: cardBg, border: cardBorder,
              "&:hover": { transform: "translateY(-4px)", boxShadow: isDark ? "0 8px 20px rgba(0,0,0,0.3)" : "0 8px 20px rgba(0,0,0,0.1)" },
              transition: "all 0.3s ease",
              "@media (min-width: 1200px)": {
                flex: "1 1 calc(25% - 8px)",
              },
            }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: s.color, fontSize: { xs: "1.25rem", md: "1.5rem" } }}>{s.value}</Typography>
              <Typography variant="caption" color={isDark ? "grey.400" : "grey.600"} sx={{ fontSize: { xs: "0.7rem", md: "0.75rem" } }}>{s.label}</Typography>
            </Card>
          ))}
        </Box>

        {/* Chart 1: Class Distribution (Pie) - D3.js */}
        <Card sx={{ bgcolor: cardBg, border: cardBorder, mb: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, fontSize: { xs: "1rem", md: "1.25rem" } }}>Class Distribution</Typography>
            <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"} sx={{ mb: 2, fontSize: { xs: "0.85rem", md: "0.875rem" } }}>
              Shows the proportion of Spam vs Ham (legitimate) messages in the training dataset of 94,298 records. The dataset is nearly balanced at 48.7% spam and 51.3% ham, ensuring unbiased model training.
            </Typography>
            <D3PieChart data={classData} isDark={isDark} />
          </CardContent>
        </Card>

        {/* Chart 2: Model Performance (Bar) - D3.js */}
        <Card sx={{ bgcolor: cardBg, border: cardBorder, mb: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, fontSize: { xs: "1rem", md: "1.25rem" } }}>Model Performance Comparison</Typography>
            <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"} sx={{ mb: 2, fontSize: { xs: "0.85rem", md: "0.875rem" } }}>
              Compares Accuracy, F1 Score, and ROC-AUC across all four trained models. Random Forest achieved the best performance with 97.46% accuracy. Higher bars indicate better model performance.
            </Typography>
            <D3BarChart data={modelData} isDark={isDark} />
          </CardContent>
        </Card>

        {/* Chart 3: Top Spam Keywords (Horizontal Bar) - D3.js */}
        <Card sx={{ bgcolor: cardBg, border: cardBorder, mb: 4 }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, fontSize: { xs: "1rem", md: "1.25rem" } }}>Top Spam Keywords</Typography>
            <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"} sx={{ mb: 2, fontSize: { xs: "0.85rem", md: "0.875rem" } }}>
              Displays the frequency of spam-related keywords found in spam vs ham messages from the training data. Keywords like "win", "offer", and "free" appear significantly more in spam messages, making them strong spam indicators.
            </Typography>
            <D3KeywordChart data={keywordData} isDark={isDark} />
          </CardContent>
        </Card>

      </Container>
    </Box>
  );
}