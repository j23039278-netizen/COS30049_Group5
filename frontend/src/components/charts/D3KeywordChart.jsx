import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { getGlobalTooltip, showTooltip, moveTooltip, hideTooltip, drawCenteredLegend } from "./chartUtils";

export default function D3KeywordChart({ data, isDark }) {
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
}
