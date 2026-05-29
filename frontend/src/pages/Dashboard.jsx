// Dashboard.jsx - ThreatInk Data Visualization Dashboard with D3.js
import { useState, useEffect, useRef } from "react";
import {
  Box, Container, Typography, Card, CardContent,
  CircularProgress, Alert, useTheme,
} from "@mui/material";
import * as d3 from "d3";
import { getStats } from "../services/api";

// ─── Shared Tooltip Helper ────────────────────────────────────────────────────
function initializeGlobalTooltip() {
  // 删除任何现存的tooltip
  d3.select("#d3-tooltip").remove();
  return d3
    .select("body")
    .append("div")
    .attr("id", "d3-tooltip")
    .style("position", "absolute")
    .style("background", "rgba(26,26,46,0.95)")
    .style("border", "1px solid rgba(255,107,122,0.3)")
    .style("border-radius", "8px")
    .style("padding", "8px 12px")
    .style("font-size", "13px")
    .style("color", "#fff")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("z-index", 9999)
    .style("box-shadow", "0 4px 12px rgba(0,0,0,0.4)")
    .style("transition", "opacity 0.15s ease");
}

function getGlobalTooltip() {
  let tooltip = d3.select("#d3-tooltip");
  if (tooltip.empty()) {
    tooltip = initializeGlobalTooltip();
  }
  return tooltip;
}

function showTooltip(tooltip, event, html) {
  tooltip
    .html(html)
    .style("opacity", 1)
    .style("left", (event.pageX + 14) + "px")
    .style("top",  (event.pageY - 28) + "px");
}

function moveTooltip(tooltip, event) {
  tooltip
    .style("left", (event.pageX + 14) + "px")
    .style("top",  (event.pageY - 28) + "px");
}

function hideTooltip(tooltip) {
  tooltip.style("opacity", 0);
}

// ─── D3 Pie Chart ─────────────────────────────────────────────────────────────
const D3PieChart = ({ data, isDark }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current || !data?.length) return;

    const width = 800;
    const height = 380;
    const radius = Math.min(width, height) / 2.5;
    const tooltip = getGlobalTooltip();
    const total   = d3.sum(data, (d) => d.value);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2 - 10})`);

    const pie      = d3.pie().value((d) => d.value).sort(null);
    const arc      = d3.arc().innerRadius(radius * 0.5).outerRadius(radius);
    const arcHover = d3.arc().innerRadius(radius * 0.5).outerRadius(radius * 1.06);

    const arcs = g.selectAll("arc").data(pie(data)).enter().append("g");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.fill)
      .attr("stroke", isDark ? "#1a1a2e" : "#f1f4f8")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(120).attr("d", arcHover);
        showTooltip(tooltip, event,
          `<b style="color:${d.data.fill}">${d.data.name}</b><br/>
           Count: <b>${d.data.value.toLocaleString()}</b><br/>
           Share: <b>${((d.data.value / total) * 100).toFixed(1)}%</b>`
        );
      })
      .on("mousemove", (event) => moveTooltip(tooltip, event))
      .on("mouseout", function () {
        d3.select(this).transition().duration(120).attr("d", arc);
        hideTooltip(tooltip);
      });

    // Percentage labels
    arcs.append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "14px")
      .attr("font-weight", "700")
      .attr("pointer-events", "none")
      .text((d) => `${((d.data.value / total) * 100).toFixed(1)}%`);

    // Legend
    const legend = svg.append("g").attr("transform", `translate(20,${height - 35})`);
    data.forEach((d, i) => {
      const lg = legend.append("g").attr("transform", `translate(${(width / data.length) * i}, 0)`);
      lg.append("rect").attr("width", 16).attr("height", 16).attr("fill", d.fill).attr("rx", 3);
      lg.append("text").attr("x", 22).attr("y", 13)
        .attr("fill", isDark ? "#a8aab0" : "#5a5a5a")
        .attr("font-size", "12px")
        .text(d.name);
    });
  }, [data, isDark]);

  return <svg ref={svgRef} style={{ width: "100%", minHeight: "380px" }} />;
};

// ─── D3 Grouped Bar Chart ─────────────────────────────────────────────────────
const D3BarChart = ({ data, isDark }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current || !data?.length) return;

    const width  = svgRef.current.clientWidth || 600;
    const height = 380;
    const margin = { top: 30, right: 20, bottom: 70, left: 55 };
    const iW = width  - margin.left - margin.right;
    const iH = height - margin.top  - margin.bottom;
    const tooltip = getGlobalTooltip();

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const keys   = ["Accuracy", "F1", "ROC-AUC"];
    const colors = { Accuracy: "#5dade2", F1: "#57b849", "ROC-AUC": "#f59e0b" };

    const x0 = d3.scaleBand().domain(data.map((d) => d.name)).range([0, iW]).padding(0.25);
    const x1 = d3.scaleBand().domain(keys).range([0, x0.bandwidth()]).padding(0.05);
    const y  = d3.scaleLinear().domain([0.9, 1]).range([iH, 0]);

    // Grid
    g.append("g").attr("opacity", 0.08)
      .call(d3.axisLeft(y).tickSize(-iW).tickFormat(""));

    // Bars
    data.forEach((d) => {
      keys.forEach((key) => {
        g.append("rect")
          .attr("x", x0(d.name) + x1(key))
          .attr("y", y(d[key]))
          .attr("width", x1.bandwidth())
          .attr("height", iH - y(d[key]))
          .attr("fill", colors[key])
          .attr("rx", 4)
          .style("cursor", "pointer")
          .on("mouseover", function (event) {
            d3.select(this).transition().duration(100).attr("opacity", 0.75);
            showTooltip(tooltip, event,
              `<b>${d.name}</b><br/>
               <span style="color:${colors[key]}">${key}</span>: <b>${(d[key] * 100).toFixed(2)}%</b>`
            );
          })
          .on("mousemove", (event) => moveTooltip(tooltip, event))
          .on("mouseout", function () {
            d3.select(this).transition().duration(100).attr("opacity", 1);
            hideTooltip(tooltip);
          });
      });
    });

    // X-axis
    g.append("g").attr("transform", `translate(0,${iH})`)
      .call(d3.axisBottom(x0))
      .attr("color", isDark ? "#a8aab0" : "#5a5a5a")
      .selectAll("text")
      .attr("font-size", "11px")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-15)");

    // Y-axis
    g.append("g")
      .call(d3.axisLeft(y).tickFormat((d) => `${(d * 100).toFixed(0)}%`))
      .attr("color", isDark ? "#a8aab0" : "#5a5a5a")
      .selectAll("text").attr("font-size", "11px");

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${margin.left},8)`);
    keys.forEach((key, i) => {
      const lg = legend.append("g").attr("transform", `translate(${i * 130}, 0)`);
      lg.append("rect").attr("width", 14).attr("height", 14).attr("fill", colors[key]).attr("rx", 3);
      lg.append("text").attr("x", 20).attr("y", 12)
        .attr("fill", isDark ? "#a8aab0" : "#5a5a5a")
        .attr("font-size", "12px").text(key);
    });
  }, [data, isDark]);

  return <svg ref={svgRef} style={{ width: "100%", minHeight: "380px" }} />;
};

// ─── D3 Horizontal Bar Chart (Keywords) ──────────────────────────────────────
const D3KeywordChart = ({ data, isDark }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current || !data?.length) return;

    const width  = svgRef.current.clientWidth || 600;
    const height = 380;
    const margin = { top: 30, right: 30, bottom: 30, left: 90 };
    const iW = width  - margin.left - margin.right;
    const iH = height - margin.top  - margin.bottom;
    const tooltip = getGlobalTooltip();

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const keys   = ["Spam", "Ham"];
    const colors = { Spam: "#e63946", Ham: "#57b849" };

    const y0 = d3.scaleBand().domain(data.map((d) => d.keyword)).range([0, iH]).padding(0.25);
    const y1 = d3.scaleBand().domain(keys).range([0, y0.bandwidth()]).padding(0.05);
    const x  = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => Math.max(d.Spam, d.Ham))])
      .range([0, iW]);

    // Grid
    g.append("g").attr("opacity", 0.08)
      .call(d3.axisBottom(x).tickSize(iH).tickFormat(""));

    // Bars
    data.forEach((d) => {
      keys.forEach((key) => {
        g.append("rect")
          .attr("y", y0(d.keyword) + y1(key))
          .attr("x", 0)
          .attr("height", y1.bandwidth())
          .attr("width", x(d[key]))
          .attr("fill", colors[key])
          .attr("rx", 3)
          .attr("opacity", 0.85)
          .style("cursor", "pointer")
          .on("mouseover", function (event) {
            d3.select(this).transition().duration(100).attr("opacity", 1);
            showTooltip(tooltip, event,
              `<b>${d.keyword}</b><br/>
               <span style="color:${colors[key]}">${key}</span>: <b>${d[key].toLocaleString()}</b>`
            );
          })
          .on("mousemove", (event) => moveTooltip(tooltip, event))
          .on("mouseout", function () {
            d3.select(this).transition().duration(100).attr("opacity", 0.85);
            hideTooltip(tooltip);
          });
      });
    });

    // X-axis
    g.append("g").attr("transform", `translate(0,${iH})`)
      .call(d3.axisBottom(x).ticks(5))
      .attr("color", isDark ? "#a8aab0" : "#5a5a5a")
      .selectAll("text").attr("font-size", "11px");

    // Y-axis
    g.append("g")
      .call(d3.axisLeft(y0))
      .attr("color", isDark ? "#a8aab0" : "#5a5a5a")
      .selectAll("text").attr("font-size", "12px");

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${margin.left},8)`);
    keys.forEach((key, i) => {
      const lg = legend.append("g").attr("transform", `translate(${i * 100}, 0)`);
      lg.append("rect").attr("width", 14).attr("height", 14).attr("fill", colors[key]).attr("rx", 3);
      lg.append("text").attr("x", 20).attr("y", 12)
        .attr("fill", isDark ? "#a8aab0" : "#5a5a5a")
        .attr("font-size", "12px").text(key);
    });
  }, [data, isDark]);

  return <svg ref={svgRef} style={{ width: "100%", minHeight: "380px" }} />;
};

// ─── D3 Radar Chart ───────────────────────────────────────────────────────────
const D3RadarChart = ({ data, isDark }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current || !data?.length) return;

    const width  = svgRef.current.clientWidth || 600;
    const height = 420;
    const cx     = width / 2;
    const cy     = height / 2 - 10;
    const radius = Math.min(width, height) / 2 - 60;
    const tooltip = getGlobalTooltip();

    const metrics     = ["Accuracy", "F1", "ROCAUC"];
    const labels      = ["Accuracy", "F1 Score", "ROC-AUC"];
    const colors      = ["#5dade2", "#57b849", "#f59e0b", "#e63946"];
    const levels      = 5;
    const minVal      = 90;
    const maxVal      = 100;
    const angleSlice  = (Math.PI * 2) / data.length;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const g = svg.append("g").attr("transform", `translate(${cx},${cy})`);
    const rScale = d3.scaleLinear().domain([minVal, maxVal]).range([0, radius]);

    // Grid circles
    for (let lvl = 1; lvl <= levels; lvl++) {
      const r = (radius / levels) * lvl;
      g.append("circle").attr("r", r)
        .attr("fill", "none")
        .attr("stroke", isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)")
        .attr("stroke-width", 1);
      g.append("text")
        .attr("x", 4).attr("y", -r + 3)
        .attr("fill", isDark ? "#666" : "#aaa")
        .attr("font-size", "9px")
        .text(`${(minVal + ((maxVal - minVal) / levels) * lvl).toFixed(0)}%`);
    }

    // Axis lines + labels
    data.forEach((d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      g.append("line")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", radius * Math.cos(angle))
        .attr("y2", radius * Math.sin(angle))
        .attr("stroke", isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")
        .attr("stroke-width", 1);

      g.append("text")
        .attr("x", (radius + 18) * Math.cos(angle))
        .attr("y", (radius + 18) * Math.sin(angle))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", isDark ? "#a8aab0" : "#5a5a5a")
        .attr("font-size", "12px")
        .attr("font-weight", "600")
        .text(d.model);
    });

    // Draw one polygon per metric
    metrics.forEach((metric, mi) => {
      const points = data.map((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const val   = rScale(d[metric]);
        return [val * Math.cos(angle), val * Math.sin(angle)];
      });

      g.append("path")
        .attr("d", d3.line()(points) + "Z")
        .attr("fill", colors[mi])
        .attr("fill-opacity", 0.15)
        .attr("stroke", colors[mi])
        .attr("stroke-width", 2);

      // Dots with tooltip
      points.forEach(([x, y], i) => {
        g.append("circle")
          .attr("cx", x).attr("cy", y).attr("r", 5)
          .attr("fill", colors[mi])
          .attr("stroke", isDark ? "#1a1a2e" : "#fff")
          .attr("stroke-width", 2)
          .style("cursor", "pointer")
          .on("mouseover", function (event) {
            d3.select(this).transition().duration(100).attr("r", 8);
            showTooltip(tooltip, event,
              `<b>${data[i].model}</b><br/>
               <span style="color:${colors[mi]}">${labels[mi]}</span>: <b>${data[i][metric].toFixed(1)}%</b>`
            );
          })
          .on("mousemove", (event) => moveTooltip(tooltip, event))
          .on("mouseout", function () {
            d3.select(this).transition().duration(100).attr("r", 5);
            hideTooltip(tooltip);
          });
      });
    });

    // Legend
    const legend = svg.append("g").attr("transform", `translate(20,${height - 30})`);
    metrics.forEach((_, i) => {
      const lg = legend.append("g").attr("transform", `translate(${i * 130}, 0)`);
      lg.append("rect").attr("width", 14).attr("height", 14).attr("fill", colors[i]).attr("rx", 3);
      lg.append("text").attr("x", 20).attr("y", 12)
        .attr("fill", isDark ? "#a8aab0" : "#5a5a5a")
        .attr("font-size", "12px").text(labels[i]);
    });
  }, [data, isDark]);

  return <svg ref={svgRef} style={{ width: "100%", minHeight: "420px" }} />;
};

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const cardBg     = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)";
  const cardBorder = isDark ? "1px solid rgba(255,107,122,0.15)" : "1px solid rgba(227,57,70,0.1)";

  // Initialize global tooltip on mount and clean up on unmount
  useEffect(() => {
    initializeGlobalTooltip();
    return () => {
      d3.select("#d3-tooltip").remove();
    };
  }, []);

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
    <Container sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>
  );

  const classData = [
    { name: "Ham (Legitimate)", value: stats.class_distribution.ham,  fill: "#57b849" },
    { name: "Spam",             value: stats.class_distribution.spam, fill: "#e63946" },
  ];

  const modelData = Object.entries(stats.model_performance).map(([name, m]) => ({
    name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    Accuracy: m.accuracy, F1: m.f1, "ROC-AUC": m.roc_auc,
  }));

  const keywordData = stats.top_spam_keywords.map((k) => ({
    keyword: k.keyword, Spam: k.spam, Ham: k.ham,
  }));

  const radarData = Object.entries(stats.model_performance).map(([name, m]) => ({
    model:    name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).split(" ")[0],
    Accuracy: +(m.accuracy * 100).toFixed(1),
    F1:       +(m.f1 * 100).toFixed(1),
    ROCAUC:   +(m.roc_auc * 100).toFixed(1),
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
          background: "linear-gradient(135deg, #e63946 0%, #457b9d 100%)",
          backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Analytics Dashboard
        </Typography>
        <Typography variant="body1" color={isDark ? "grey.400" : "grey.600"} textAlign="center" sx={{ mb: 1 }}>
          Dataset statistics and model performance visualizations.
        </Typography>
        <Typography variant="body2" color={isDark ? "grey.500" : "grey.500"} textAlign="center" sx={{ mb: 4 }}>
          Trained on 94,298 combined email and SMS records from Kaggle and UCI datasets.
          45,917 spam and 48,381 ham messages, achieving best accuracy of 97.46% with Random Forest.
        </Typography>

        {/* Summary Cards */}
        <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
          {[
            { label: "Total Records", value: stats.class_distribution.total.toLocaleString(), color: "#42a5f5" },
            { label: "Spam Messages", value: stats.class_distribution.spam.toLocaleString(),  color: "#ef5350" },
            { label: "Ham Messages",  value: stats.class_distribution.ham.toLocaleString(),   color: "#66bb6a" },
            { label: "Best Accuracy", value: "97.46%",                                        color: "#ffa726" },
          ].map((s) => (
            <Card key={s.label} sx={{
              flex: "1 1 calc(50% - 8px)", textAlign: "center", py: 2,
              bgcolor: cardBg, border: cardBorder,
              "@media (min-width:1200px)": { flex: "1 1 calc(25% - 8px)" },
              "&:hover": { transform: "translateY(-4px)", boxShadow: isDark ? "0 8px 20px rgba(0,0,0,0.3)" : "0 8px 20px rgba(0,0,0,0.1)" },
              transition: "all 0.3s ease",
            }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="caption" color={isDark ? "grey.400" : "grey.600"}>{s.label}</Typography>
            </Card>
          ))}
        </Box>

        {/* Chart 1: Pie */}
        <Card sx={{ bgcolor: cardBg, border: cardBorder, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Class Distribution</Typography>
            <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"} sx={{ mb: 2 }}>
              Shows the proportion of Spam vs Ham messages in the 94,298-record training dataset.
              Nearly balanced at 48.7% spam and 51.3% ham, ensuring unbiased model training.
              Hover over each slice for exact counts.
            </Typography>
            <D3PieChart data={classData} isDark={isDark} />
          </CardContent>
        </Card>

        {/* Chart 2: Bar */}
        <Card sx={{ bgcolor: cardBg, border: cardBorder, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Model Performance Comparison</Typography>
            <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"} sx={{ mb: 2 }}>
              Compares Accuracy, F1 Score, and ROC-AUC across all four trained models.
              Random Forest achieved the best performance with 97.46% accuracy.
              Hover over each bar for precise values.
            </Typography>
            <D3BarChart data={modelData} isDark={isDark} />
          </CardContent>
        </Card>

        {/* Chart 3: Keyword */}
        <Card sx={{ bgcolor: cardBg, border: cardBorder, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Top Spam Keywords</Typography>
            <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"} sx={{ mb: 2 }}>
              Displays how often spam-related keywords appear in spam vs ham messages.
              Keywords like "win", "offer", and "free" appear far more in spam — strong detection signals.
              Hover for exact counts.
            </Typography>
            <D3KeywordChart data={keywordData} isDark={isDark} />
          </CardContent>
        </Card>

        {/* Chart 4: Radar */}
        <Card sx={{ bgcolor: cardBg, border: cardBorder, mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Model Performance Radar</Typography>
            <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"} sx={{ mb: 2 }}>
              Visualizes multi-metric performance of all four models on a single radar chart.
              Larger area coverage indicates stronger overall performance.
              Hover over each point for precise metric values.
            </Typography>
            <D3RadarChart data={radarData} isDark={isDark} />
          </CardContent>
        </Card>

      </Container>
    </Box>
  );
}