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
  d3.select("#d3-tooltip").remove();
  return d3
    .select("body")
    .append("div")
    .attr("id", "d3-tooltip")
    .style("position", "absolute")
    .style("background", "rgba(12,12,26,0.97)")
    .style("border", "1px solid rgba(255,107,122,0.45)")
    .style("border-radius", "10px")
    .style("padding", "10px 14px")
    .style("font-size", "13px")
    .style("color", "#fff")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("z-index", 9999)
    .style("box-shadow", "0 6px 24px rgba(0,0,0,0.55)")
    .style("transition", "opacity 0.15s ease")
    .style("min-width", "150px")
    .style("line-height", "1.6");
}

function getGlobalTooltip() {
  let tooltip = d3.select("#d3-tooltip");
  if (tooltip.empty()) tooltip = initializeGlobalTooltip();
  return tooltip;
}

function showTooltip(tooltip, event, html) {
  tooltip
    .html(html)
    .style("opacity", 1)
    .style("left", (event.pageX + 16) + "px")
    .style("top",  (event.pageY - 36) + "px");
}

function moveTooltip(tooltip, event) {
  tooltip
    .style("left", (event.pageX + 16) + "px")
    .style("top",  (event.pageY - 36) + "px");
}

function hideTooltip(tooltip) {
  tooltip.style("opacity", 0);
}

// Draws a centered legend row. items = [{ label, color }, ...]
function drawCenteredLegend(svg, items, { svgWidth, y, isDark, spacing }) {
  const totalW = items.length * spacing;
  const startX = (svgWidth - totalW) / 2;
  const legend = svg.append("g").attr("transform", `translate(${startX},${y})`);
  items.forEach(({ label, color }, i) => {
    const lg = legend.append("g").attr("transform", `translate(${spacing * i}, 0)`);
    lg.append("circle").attr("cx", 6).attr("cy", 6).attr("r", 6).attr("fill", color);
    lg.append("text")
      .attr("x", 16).attr("y", 10)
      .attr("fill", isDark ? "#a8aab0" : "#5a5a5a")
      .attr("font-size", "12px")
      .text(label);
  });
}

// ─── D3 Pie Chart ─────────────────────────────────────────────────────────────
const D3PieChart = ({ data, isDark }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current || !data?.length) return;

    const draw = () => {
      const width   = svgRef.current.clientWidth || 800;
      const height  = 380;
      const legendH = 40;
      const radius  = Math.min(width, height - legendH) / 2.5;
      const tooltip = getGlobalTooltip();
      const total   = d3.sum(data, (d) => d.value);

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
      svg.attr("width", width).attr("height", height);

      // Center pie in the space above the legend
      const pieY = (height - legendH) / 2;
      const g = svg.append("g").attr("transform", `translate(${width / 2},${pieY})`);

      const pie      = d3.pie().value((d) => d.value).sort(null);
      const arc      = d3.arc().innerRadius(radius * 0.5).outerRadius(radius);
      const arcHover = d3.arc().innerRadius(radius * 0.5).outerRadius(radius * 1.06);

      const arcs = g.selectAll("arc").data(pie(data)).enter().append("g");

      const paths = arcs.append("path")
        .attr("fill", (d) => d.data.fill)
        .attr("stroke", isDark ? "#1a1a2e" : "#f5f0e8")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
          d3.select(this).transition().duration(150).attr("d", arcHover);
          showTooltip(tooltip, event,
            `<div style="border-left:3px solid ${d.data.fill};padding-left:8px">
               <b style="color:${d.data.fill};font-size:14px">${d.data.name}</b><br/>
               <span style="color:#aaa">Count:</span> <b>${d.data.value.toLocaleString()}</b><br/>
               <span style="color:#aaa">Share:</span> <b>${((d.data.value / total) * 100).toFixed(1)}%</b>
             </div>`
          );
        })
        .on("mousemove", (event) => moveTooltip(tooltip, event))
        .on("mouseout", function () {
          d3.select(this).transition().duration(150).attr("d", arc);
          hideTooltip(tooltip);
        });

      paths.transition().duration(900).ease(d3.easeCubicOut)
        .attrTween("d", function (d) {
          const i = d3.interpolate({ startAngle: d.startAngle, endAngle: d.startAngle }, d);
          return (t) => arc(i(t));
        });

      arcs.append("text")
        .attr("transform", (d) => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .attr("font-size", "14px")
        .attr("font-weight", "700")
        .attr("pointer-events", "none")
        .attr("opacity", 0)
        .text((d) => `${((d.data.value / total) * 100).toFixed(1)}%`)
        .transition().delay(750).duration(400)
        .attr("opacity", 1);

      drawCenteredLegend(svg,
        data.map((d) => ({ label: d.name, color: d.fill })),
        { svgWidth: width, y: height - legendH + 8, isDark, spacing: 180 }
      );
    };

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [data, isDark]);

  return <svg ref={svgRef} style={{ width: "100%", minHeight: "380px" }} />;
};

// ─── D3 Grouped Bar Chart ─────────────────────────────────────────────────────
const D3BarChart = ({ data, isDark }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current || !data?.length) return;

    const draw = () => {
      const width  = svgRef.current.clientWidth || 600;
      const height = 380;
      const margin = { top: 36, right: 20, bottom: 70, left: 55 };
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

      g.append("g").attr("opacity", 0.08)
        .call(d3.axisLeft(y).tickSize(-iW).tickFormat(""));

      data.forEach((d, di) => {
        keys.forEach((key, ki) => {
          const bx = x0(d.name) + x1(key);
          const bw = x1.bandwidth();
          const by = y(d[key]);
          const bh = iH - by;

          const rect = g.append("rect")
            .attr("x", bx).attr("y", iH)
            .attr("width", bw).attr("height", 0)
            .attr("fill", colors[key]).attr("rx", 4)
            .style("cursor", "pointer")
            .on("mouseover", function (event) {
              d3.select(this).transition().duration(100).attr("opacity", 0.72);
              const rank = [...data].sort((a, b) => b[key] - a[key]).findIndex((r) => r.name === d.name) + 1;
              showTooltip(tooltip, event,
                `<div style="border-left:3px solid ${colors[key]};padding-left:8px">
                   <b style="font-size:14px">${d.name}</b><br/>
                   <span style="color:#aaa">Metric:</span> <span style="color:${colors[key]}">${key}</span><br/>
                   <span style="color:#aaa">Value:</span> <b>${(d[key] * 100).toFixed(2)}%</b><br/>
                   <span style="color:#aaa">Rank:</span> <b>#${rank}</b> of ${data.length}
                 </div>`
              );
            })
            .on("mousemove", (event) => moveTooltip(tooltip, event))
            .on("mouseout", function () {
              d3.select(this).transition().duration(100).attr("opacity", 1);
              hideTooltip(tooltip);
            });

          rect.transition()
            .duration(700).delay(di * 80 + ki * 30).ease(d3.easeCubicOut)
            .attr("y", by).attr("height", bh);

          g.append("text")
            .attr("x", bx + bw / 2).attr("y", by - 3)
            .attr("text-anchor", "middle").attr("font-size", "9px")
            .attr("fill", isDark ? "#c0c2c8" : "#555")
            .attr("pointer-events", "none").attr("opacity", 0)
            .text(`${(d[key] * 100).toFixed(1)}%`)
            .transition().delay(di * 80 + ki * 30 + 700).duration(300)
            .attr("opacity", 1);
        });
      });

      g.append("g").attr("transform", `translate(0,${iH})`)
        .call(d3.axisBottom(x0))
        .attr("color", isDark ? "#a8aab0" : "#5a5a5a")
        .selectAll("text")
        .attr("font-size", "11px").attr("text-anchor", "end").attr("transform", "rotate(-15)");

      g.append("g")
        .call(d3.axisLeft(y).tickFormat((d) => `${(d * 100).toFixed(0)}%`))
        .attr("color", isDark ? "#a8aab0" : "#5a5a5a")
        .selectAll("text").attr("font-size", "11px");

      // Centered legend at top
      drawCenteredLegend(svg,
        keys.map((k) => ({ label: k, color: colors[k] })),
        { svgWidth: width, y: 8, isDark, spacing: 120 }
      );
    };

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [data, isDark]);

  return <svg ref={svgRef} style={{ width: "100%", minHeight: "380px" }} />;
};

// ─── D3 Horizontal Bar Chart (Keywords) ──────────────────────────────────────
const D3KeywordChart = ({ data, isDark }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current || !data?.length) return;

    const draw = () => {
      const width  = svgRef.current.clientWidth || 600;
      const height = 380;
      const margin = { top: 36, right: 72, bottom: 30, left: 90 };
      const iW = width  - margin.left - margin.right;
      const iH = height - margin.top  - margin.bottom;
      const tooltip = getGlobalTooltip();

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
      svg.attr("width", width).attr("height", height);

      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      const keys   = ["Spam", "Ham"];
      const colors = { Spam: "#e63946", Ham: "#57b849" };
      const maxVal = d3.max(data, (d) => Math.max(d.Spam, d.Ham));

      const y0 = d3.scaleBand().domain(data.map((d) => d.keyword)).range([0, iH]).padding(0.25);
      const y1 = d3.scaleBand().domain(keys).range([0, y0.bandwidth()]).padding(0.05);
      const x  = d3.scaleLinear().domain([0, maxVal]).range([0, iW]);

      g.append("g").attr("opacity", 0.08)
        .call(d3.axisBottom(x).tickSize(iH).tickFormat(""));

      data.forEach((d, di) => {
        keys.forEach((key, ki) => {
          const bar = g.append("rect")
            .attr("y", y0(d.keyword) + y1(key))
            .attr("x", 0).attr("height", y1.bandwidth()).attr("width", 0)
            .attr("fill", colors[key]).attr("rx", 3).attr("opacity", 0.85)
            .style("cursor", "pointer")
            .on("mouseover", function (event) {
              d3.select(this).transition().duration(100).attr("opacity", 1);
              const pct = ((d[key] / (d.Spam + d.Ham)) * 100).toFixed(1);
              showTooltip(tooltip, event,
                `<div style="border-left:3px solid ${colors[key]};padding-left:8px">
                   <b style="font-size:14px">${d.keyword}</b><br/>
                   <span style="color:${colors[key]}">${key}</span>: <b>${d[key].toLocaleString()}</b><br/>
                   <span style="color:#aaa">% of keyword total:</span> <b>${pct}%</b>
                 </div>`
              );
            })
            .on("mousemove", (event) => moveTooltip(tooltip, event))
            .on("mouseout", function () {
              d3.select(this).transition().duration(100).attr("opacity", 0.85);
              hideTooltip(tooltip);
            });

          bar.transition()
            .duration(700).delay(di * 60 + ki * 20).ease(d3.easeCubicOut)
            .attr("width", x(d[key]));

          g.append("text")
            .attr("y", y0(d.keyword) + y1(key) + y1.bandwidth() / 2 + 4)
            .attr("x", x(d[key]) + 5).attr("font-size", "10px")
            .attr("fill", isDark ? "#a8aab0" : "#5a5a5a")
            .attr("pointer-events", "none").attr("opacity", 0)
            .text(d[key].toLocaleString())
            .transition().delay(di * 60 + ki * 20 + 700).duration(300)
            .attr("opacity", 1);
        });
      });

      g.append("g").attr("transform", `translate(0,${iH})`)
        .call(d3.axisBottom(x).ticks(5))
        .attr("color", isDark ? "#a8aab0" : "#5a5a5a")
        .selectAll("text").attr("font-size", "11px");

      g.append("g")
        .call(d3.axisLeft(y0))
        .attr("color", isDark ? "#a8aab0" : "#5a5a5a")
        .selectAll("text").attr("font-size", "12px");

      // Centered legend at top
      drawCenteredLegend(svg,
        keys.map((k) => ({ label: k, color: colors[k] })),
        { svgWidth: width, y: 8, isDark, spacing: 100 }
      );
    };

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [data, isDark]);

  return <svg ref={svgRef} style={{ width: "100%", minHeight: "380px" }} />;
};

// ─── D3 Radar Chart ───────────────────────────────────────────────────────────
const D3RadarChart = ({ data, isDark }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current || !data?.length) return;

    const draw = () => {
      const width  = svgRef.current.clientWidth || 600;
      const height = 420;
      const legendH = 36;
      const cx     = width / 2;
      const cy     = (height - legendH) / 2;
      const radius = Math.min(width, height - legendH) / 2 - 55;
      const tooltip = getGlobalTooltip();

      const metrics    = ["Accuracy", "F1", "ROCAUC"];
      const labels     = ["Accuracy", "F1 Score", "ROC-AUC"];
      const colors     = ["#5dade2", "#57b849", "#f59e0b", "#e63946"];
      const levels     = 5;
      const minVal     = 90;
      const maxVal     = 100;
      const angleSlice = (Math.PI * 2) / data.length;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
      svg.attr("width", width).attr("height", height);

      const g = svg.append("g").attr("transform", `translate(${cx},${cy})`);
      const rScale = d3.scaleLinear().domain([minVal, maxVal]).range([0, radius]);

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

      data.forEach((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        g.append("line")
          .attr("x1", 0).attr("y1", 0)
          .attr("x2", radius * Math.cos(angle)).attr("y2", radius * Math.sin(angle))
          .attr("stroke", isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")
          .attr("stroke-width", 1);
        g.append("text")
          .attr("x", (radius + 18) * Math.cos(angle))
          .attr("y", (radius + 18) * Math.sin(angle))
          .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
          .attr("fill", isDark ? "#a8aab0" : "#5a5a5a")
          .attr("font-size", "12px").attr("font-weight", "600")
          .text(d.model);
      });

      // Compute all polygon point sets first
      const allPoints = metrics.map((metric, mi) =>
        data.map((d, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const val   = rScale(d[metric]);
          return [val * Math.cos(angle), val * Math.sin(angle)];
        })
      );

      // Pass 1: draw all polygon fills — so they never overlap the dots
      metrics.forEach((metric, mi) => {
        const path = g.append("path")
          .attr("fill", colors[mi]).attr("fill-opacity", 0.15)
          .attr("stroke", colors[mi]).attr("stroke-width", 2);

        path.transition()
          .delay(mi * 160).duration(800).ease(d3.easeCubicOut)
          .attrTween("d", () => (t) => {
            const animPts = data.map((d, i) => {
              const angle = angleSlice * i - Math.PI / 2;
              const val   = rScale(d[metric]) * t;
              return [val * Math.cos(angle), val * Math.sin(angle)];
            });
            return d3.line()(animPts) + "Z";
          });
      });

      // Pass 2: draw all dots on top — always above every polygon
      metrics.forEach((metric, mi) => {
        data.forEach((dataItem, dataIndex) => {
          const [px, py] = allPoints[mi][dataIndex];
          g.append("circle")
            .attr("cx", px).attr("cy", py).attr("r", 0)
            .attr("fill", colors[mi])
            .attr("stroke", isDark ? "#1a1a2e" : "#fff").attr("stroke-width", 2)
            .style("cursor", "pointer")
            .on("mouseover", function (event) {
              d3.select(this).transition().duration(100).attr("r", 8);
              showTooltip(tooltip, event,
                `<div style="border-left:3px solid ${colors[mi]};padding-left:8px">
                   <b style="font-size:14px">${dataItem.model}</b><br/>
                   <span style="color:${colors[mi]}">${labels[mi]}</span>: <b>${dataItem[metric].toFixed(1)}%</b>
                 </div>`
              );
            })
            .on("mousemove", (event) => moveTooltip(tooltip, event))
            .on("mouseout", function () {
              d3.select(this).transition().duration(100).attr("r", 5);
              hideTooltip(tooltip);
            })
            .transition()
            .delay(mi * 160 + 650).duration(300).ease(d3.easeBackOut)
            .attr("r", 5);
        });
      });

      // Centered legend at bottom
      drawCenteredLegend(svg,
        metrics.map((_, i) => ({ label: labels[i], color: colors[i] })),
        { svgWidth: width, y: height - legendH + 6, isDark, spacing: 120 }
      );
    };

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
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

  useEffect(() => {
    initializeGlobalTooltip();
    return () => { d3.select("#d3-tooltip").remove(); };
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
        : "linear-gradient(135deg, #f5f0e8 0%, #faf7f2 50%, #ffffff 100%)",
      transition: "background 0.3s ease",
      py: 4,
    }}>
      <Container maxWidth="lg">

        <Typography variant="h4" fontWeight={800} textAlign="center" sx={{
          mb: 1,
          fontSize: { xs: "1.5rem", md: "2.125rem" },
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

        <Card sx={{ bgcolor: cardBg, border: cardBorder, mb: 3, maxWidth: 900, mx: "auto" }}>
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

        <Card sx={{ bgcolor: cardBg, border: cardBorder, mb: 3, maxWidth: 900, mx: "auto" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Model Performance Comparison</Typography>
            <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"} sx={{ mb: 2 }}>
              Compares Accuracy, F1 Score, and ROC-AUC across all four trained models.
              Random Forest achieved the best performance with 97.46% accuracy.
              Hover over each bar for precise values and ranking.
            </Typography>
            <D3BarChart data={modelData} isDark={isDark} />
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: cardBg, border: cardBorder, mb: 3, maxWidth: 900, mx: "auto" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Top Spam Keywords</Typography>
            <Typography variant="body2" color={isDark ? "grey.400" : "grey.600"} sx={{ mb: 2 }}>
              Displays how often spam-related keywords appear in spam vs ham messages.
              Keywords like "win", "offer", and "free" appear far more in spam — strong detection signals.
              Hover for exact counts and percentage breakdown.
            </Typography>
            <D3KeywordChart data={keywordData} isDark={isDark} />
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: cardBg, border: cardBorder, mb: 4, maxWidth: 900, mx: "auto" }}>
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
