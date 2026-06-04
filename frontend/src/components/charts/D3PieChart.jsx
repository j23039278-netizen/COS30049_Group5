import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { getGlobalTooltip, showTooltip, moveTooltip, hideTooltip, drawCenteredLegend } from "./chartUtils";

export default function D3PieChart({ data, isDark }) {
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
}
