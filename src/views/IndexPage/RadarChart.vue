<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { Chart, registerables } from 'chart.js';

export default {
  props: {
    data: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const chartCanvas = ref(null);
    let chartInstance = null;

    Chart.register(...registerables);

    const renderChart = () => {
      if (chartInstance) {
        chartInstance.destroy();
      }

      if (chartCanvas.value) {
        chartInstance = new Chart(chartCanvas.value, {
          type: 'radar',
          data: props.data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
              line: {
                borderWidth: 2
              }
            },
            scales: {
              r: {
                angleLines: {
                  display: true,
                  color: 'rgba(0, 0, 0, 0.1)'
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                },
                pointLabels: {
                  font: {
                    size: 11
                  }
                },
                ticks: {
                  display: false,
                  stepSize: 20
                },
                suggestedMin: 0
              }
            },
            plugins: {
              legend: {
                display: false
              }
            },
            ...props.options
          }
        });
      }
    };

    onMounted(renderChart);

    watch(
        () => props.data,
        () => {
          renderChart();
        },
        { deep: true }
    );

    onBeforeUnmount(() => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    });

    return {
      chartCanvas
    };
  }
};
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 100%;
  width: 100%;
}
</style>
