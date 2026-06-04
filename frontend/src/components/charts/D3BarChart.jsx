import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { getGlobalTooltip, showTooltip, moveTooltip, hideTooltip, drawCenteredLegend } from "./chartUtils";

export default function D3BarChart({ data, isDark }) {
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
}
