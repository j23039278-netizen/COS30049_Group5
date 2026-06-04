import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { getGlobalTooltip, showTooltip, moveTooltip, hideTooltip, drawCenteredLegend } from "./chartUtils";

export default function D3RadarChart({ data, isDark }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current || !data?.length) return;

    const draw = () => {
      const width   = svgRef.current.clientWidth || 600;
      const height  = 420;
      const legendH = 36;
      const cx      = width / 2;
      const cy      = (height - legendH) / 2;
      const radius  = Math.min(width, height - legendH) / 2 - 55;
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
      const allPoints = metrics.map((metric) =>
        data.map((d, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const val   = rScale(d[metric]);
          return [val * Math.cos(angle), val * Math.sin(angle)];
        })
      );

      // Pass 1: all polygon fills — never overlap the dots
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

      // Pass 2: all dots on top — always above every polygon
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
}
