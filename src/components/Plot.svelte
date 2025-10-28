<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import type { HistoryEntry } from '../core/types';

  export let data: HistoryEntry[] = [];
  export let title: string;
  export let yKey: keyof HistoryEntry;

  let svgElement: SVGSVGElement;
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  let width = 500;
  let height = 300;

  function drawChart() {
    if (!svgElement || data.length < 2) return;

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    d3.select(svgElement).selectAll('*').remove();

    const svg = d3.select(svgElement)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.t) as [number, number])
      .range([0, innerWidth]);

    const yValue = (d: HistoryEntry) => {
      const val = d[yKey];
      return typeof val === 'number' ? val : 0;
    };

    const yDomain = d3.extent(data, yValue) as [number, number];
    const yRange = yDomain[1] - yDomain[0];
    const y = d3.scaleLinear()
        .domain([yDomain[0] - yRange * 0.1, yDomain[1] + yRange * 0.1])
        .range([innerHeight, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .call(d3.axisLeft(y));

    const line = d3.line<HistoryEntry>()
      .x(d => x(d.t))
      .y(d => y(yValue(d)));

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', line);
      
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

  $: if (data && svgElement) {
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
