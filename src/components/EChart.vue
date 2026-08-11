<script setup lang="ts">
import { BarChart, CandlestickChart, HeatmapChart, LineChart } from 'echarts/charts'
import {
  AxisPointerComponent,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import type { ECharts, EChartsCoreOption } from 'echarts/core'
import { init } from 'echarts/core'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

use([
  BarChart,
  CandlestickChart,
  HeatmapChart,
  LineChart,
  AxisPointerComponent,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
])

const props = withDefaults(defineProps<{ option: EChartsCoreOption; label?: string }>(), {
  label: 'Data chart',
})
const chartElement = ref<HTMLElement | null>(null)
let chart: ECharts | null = null
let observer: ResizeObserver | null = null

onMounted(() => {
  if (!chartElement.value) return
  chart = init(chartElement.value)
  chart.setOption(props.option)
  observer = new ResizeObserver(() => chart?.resize())
  observer.observe(chartElement.value)
})

watch(
  () => props.option,
  (option) => chart?.setOption(option, { notMerge: true }),
  { deep: true },
)

onBeforeUnmount(() => {
  observer?.disconnect()
  chart?.dispose()
})

defineExpose({
  getDataUrl: () =>
    chart?.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: chartElement.value
        ? getComputedStyle(chartElement.value).getPropertyValue('--paper').trim()
        : undefined,
    }) ?? null,
})
</script>

<template><div ref="chartElement" class="chart" role="img" :aria-label="label"></div></template>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
