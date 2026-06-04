import * as d3 from "d3";

export function initializeGlobalTooltip() {
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

export function getGlobalTooltip() {
  let tooltip = d3.select("#d3-tooltip");
  if (tooltip.empty()) tooltip = initializeGlobalTooltip();
  return tooltip;
}

export function showTooltip(tooltip, event, html) {
  tooltip
    .html(html)
    .style("opacity", 1)
    .style("left", (event.pageX + 16) + "px")
    .style("top",  (event.pageY - 36) + "px");
}

export function moveTooltip(tooltip, event) {
  tooltip
    .style("left", (event.pageX + 16) + "px")
    .style("top",  (event.pageY - 36) + "px");
}

export function hideTooltip(tooltip) {
  tooltip.style("opacity", 0);
}

export function drawCenteredLegend(svg, items, { svgWidth, y, isDark, spacing }) {
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
