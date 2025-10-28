<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  type HistoryData = Record<string, any> & { t: number };

  export let history: HistoryData[] = [];
  export let series: Array<{ key: string; label: string; color: string }>; 
  export let title: string;

  let svgElement: SVGSVGElement;
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  let width = 500;
  let height = 300;

  function drawChart() {
    if (!svgElement || history.length < 2 || !series || series.length === 0) return;

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    d3.select(svgElement).selectAll('*').remove();

    const svg = d3.select(svgElement)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain(d3.extent(history, d => d.t) as [number, number])
      .range([0, innerWidth]);

    const valuesAcrossSeries: number[] = [];
    for (const s of series) {
      for (const h of history) {
        const v = h[s.key];
        if (typeof v === 'number' && Number.isFinite(v)) valuesAcrossSeries.push(v);
      }
    }
    const yDomain = d3.extent(valuesAcrossSeries) as [number, number];
    // Fallback domain if all values are same or empty
    const yMin = yDomain[0] ?? 0;
    const yMax = yDomain[1] ?? 1;
    const pad = (yMax - yMin) || 1;
    const y = d3.scaleLinear()
        .domain([yMin - pad * 0.1, yMax + pad * 0.1])
        .range([innerHeight, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .call(d3.axisLeft(y));

    for (const s of series) {
      const line = d3.line<HistoryData>()
        .x(d => x(d.t))
        .y(d => y((typeof d[s.key] === 'number' ? (d[s.key] as number) : NaN)));

      svg.append('path')
        .datum(history)
        .attr('fill', 'none')
        .attr('stroke', s.color)
        .attr('stroke-width', 1.5)
        .attr('d', line as any);
    }

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(0, -10)`);
    series.forEach((s, i) => {
      const g = legend.append('g')
        .attr('transform', `translate(${i * 130}, 0)`);
      g.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', s.color);
      g.append('text')
        .attr('x', 16)
        .attr('y', 10)
        .attr('dominant-baseline', 'middle')
        .style('font-size', '12px')
        .text(s.label);
    });

    svg.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text(title);
  }

  onMount(() => {
    drawChart();
  });

  $: if (history && svgElement && series) {
    drawChart();
  }
</script>

<div class="chart-container">
  <svg bind:this={svgElement}></svg>
  
</div>

<style>
  .chart-container {
    width: 100%;
    max-width: 500px;
  }
</style>


