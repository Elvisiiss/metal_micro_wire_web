<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <h1>生产监控仪表盘</h1>
      <p>铜丝等金属微细线材实时生产数据监控</p>
    </div>

    <!-- 指标卡片 -->
    <div class="dashboard-metrics">
      <div class="metric-card">
        <div class="metric-icon bg-blue">
          <i class="icon-diameter"></i>
        </div>
        <div class="metric-info">
          <div class="metric-value">{{ currentData.diameter.toFixed(4) }} mm</div>
          <div class="metric-label">平均线径</div>
        </div>
        <div class="metric-trend" :class="{'up': diameterTrend === 'up', 'down': diameterTrend === 'down'}">
          <span v-if="diameterTrend === 'up'">↑</span>
          <span v-else-if="diameterTrend === 'down'">↓</span>
          {{ diameterChange }}%
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon bg-green">
          <i class="icon-strength"></i>
        </div>
        <div class="metric-info">
          <div class="metric-value">{{ currentData.tensileStrength.toFixed(1) }} MPa</div>
          <div class="metric-label">拉伸强度</div>
        </div>
        <div class="metric-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{width: (currentData.tensileStrength/500*100) + '%'}"></div>
          </div>
          <div class="progress-text">达标率: {{ Math.min(100, Math.round(currentData.tensileStrength/500*100)) }}%</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon bg-purple">
          <i class="icon-conductivity"></i>
        </div>
        <div class="metric-info">
          <div class="metric-value">{{ currentData.conductivity.toFixed(1) }} %IACS</div>
          <div class="metric-label">电导率</div>
        </div>
        <div class="metric-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{width: (currentData.conductivity/110*100) + '%'}"></div>
          </div>
          <div class="progress-text">标准值: 100%IACS</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon bg-orange">
          <i class="icon-weight"></i>
        </div>
        <div class="metric-info">
          <div class="metric-value">{{ currentData.weightPerMeter.toFixed(3) }} g/m</div>
          <div class="metric-label">单位重量</div>
        </div>
        <div class="metric-trend" :class="{'up': weightTrend === 'up', 'down': weightTrend === 'down'}">
          <span v-if="weightTrend === 'up'">↑</span>
          <span v-else-if="weightTrend === 'down'">↓</span>
          {{ weightChange }}%
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="dashboard-charts">
      <div class="chart-container main-chart">
        <div class="chart-header">
          <h3>线径变化实时监测</h3>
          <div class="chart-controls">
            <button class="time-btn active">实时</button>
            <button class="time-btn">1小时</button>
            <button class="time-btn">8小时</button>
            <button class="time-btn">24小时</button>
          </div>
        </div>
        <LineChart :data="diameterHistory" :options="chartOptions" />
      </div>

      <div class="chart-container side-chart">
        <div class="chart-header">
          <h3>质量分布统计</h3>
        </div>
        <BarChart :data="tensileData" :options="chartOptions" />
      </div>

      <div class="chart-container side-chart">
        <div class="chart-header">
          <h3>检测合格率</h3>
        </div>
        <div class="gauge-chart">
          <div class="gauge-value">98.7%</div>
          <div class="gauge-label">当前批次合格率</div>
          <div class="gauge-container">
            <div class="gauge-fill" :style="{transform: `rotate(${98.7 * 1.8 - 90}deg)`}"></div>
          </div>
          <div class="gauge-marks">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import LineChart from './LineChart.vue';
import BarChart from './BarChart.vue';

export default {
  components: {
    LineChart,
    BarChart
  },
  setup() {
    // 当前检测数据
    const currentData = ref({
      diameter: 0.1024,
      tensileStrength: 325.6,
      conductivity: 98.7,
      weightPerMeter: 0.072
    });

    // 趋势数据
    const diameterTrend = ref('up');
    const diameterChange = ref(0.12);
    const weightTrend = ref('down');
    const weightChange = ref(0.05);

    // 历史数据
    const diameterHistory = ref({
      labels: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'],
      datasets: [{
        label: '线径 (mm)',
        data: [0.1022, 0.1023, 0.1021, 0.1025, 0.1024, 0.1024, 0.1024],
        borderColor: '#4e73df',
        backgroundColor: 'rgba(78, 115, 223, 0.05)',
        tension: 0.3
      }]
    });

    const tensileData = ref({
      labels: ['300-320', '320-340', '340-360', '360-380', '380-400'],
      datasets: [{
        label: '数量',
        data: [12, 28, 35, 24, 8],
        backgroundColor: '#1cc88a'
      }]
    });

    // 图表选项
    const chartOptions = ref({
      responsive: true,
      maintainAspectRatio: false
    });

    // 模拟实时数据更新
    let dataInterval;
    onMounted(() => {
      dataInterval = setInterval(() => {
        // 模拟数据微小变化
        currentData.value.diameter = 0.1024 + (Math.random() - 0.5) * 0.0002;
        currentData.value.tensileStrength = 325 + (Math.random() - 0.5) * 10;
        currentData.value.conductivity = 98 + (Math.random() - 0.5) * 2;
        currentData.value.weightPerMeter = 0.072 + (Math.random() - 0.5) * 0.002;

        // 更新趋势
        diameterTrend.value = Math.random() > 0.5 ? 'up' : 'down';
        diameterChange.value = (Math.random() * 0.2).toFixed(2);
        weightTrend.value = Math.random() > 0.5 ? 'up' : 'down';
        weightChange.value = (Math.random() * 0.1).toFixed(2);
      }, 3000);
    });

    onUnmounted(() => {
      if (dataInterval) {
        clearInterval(dataInterval);
      }
    });

    return {
      currentData,
      diameterTrend,
      diameterChange,
      weightTrend,
      weightChange,
      diameterHistory,
      tensileData,
      chartOptions
    };
  }
};
</script>

<style scoped>
.dashboard-view {
  max-width: 1800px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1a3a6e;
  margin: 0 0 8px 0;
}

.dashboard-header p {
  font-size: 14px;
  color: #5f6368;
  margin: 0;
}

/* 指标卡片样式 */
.dashboard-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  transition: transform 0.3s, box-shadow 0.3s;
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.bg-blue {
  background: linear-gradient(135deg, #4e73df 0%, #2a4bc0 100%);
}

.bg-green {
  background: linear-gradient(135deg, #1cc88a 0%, #13855c 100%);
}

.bg-purple {
  background: linear-gradient(135deg, #6f42c1 0%, #4d2d93 100%);
}

.bg-orange {
  background: linear-gradient(135deg, #f6c23e 0%, #dda20a 100%);
}

.metric-info {
  flex: 1;
}

.metric-value {
  font-size: 22px;
  font-weight: 600;
  color: #202124;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 14px;
  color: #5f6368;
}

.metric-trend {
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.metric-trend.up {
  color: #1cc88a;
}

.metric-trend.down {
  color: #e74a3b;
}

.metric-progress {
  width: 100%;
  margin-top: 8px;
}

.progress-bar {
  height: 6px;
  background-color: #eaecf4;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
}

.bg-blue ~ .metric-progress .progress-fill {
  background-color: #4e73df;
}

.bg-green ~ .metric-progress .progress-fill {
  background-color: #1cc88a;
}

.bg-purple ~ .metric-progress .progress-fill {
  background-color: #6f42c1;
}

.bg-orange ~ .metric-progress .progress-fill {
  background-color: #f6c23e;
}

.progress-text {
  font-size: 12px;
  color: #5f6368;
  margin-top: 4px;
}

/* 图表区域样式 */
.dashboard-charts {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto;
  gap: 16px;
  margin-bottom: 24px;
}

.chart-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.main-chart {
  grid-column: 1 / 2;
  grid-row: 1 / 3;
  height: 500px;
}

.side-chart {
  height: 300px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #202124;
  margin: 0;
}

.chart-controls {
  display: flex;
}

.time-btn {
  background: #f1f3f4;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  color: #5f6368;
  margin-left: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.time-btn.active {
  background: #1a73e8;
  color: white;
}

/* 仪表盘样式 */
.gauge-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
}

.gauge-value {
  font-size: 36px;
  font-weight: 700;
  color: #1cc88a;
  margin-bottom: 8px;
}

.gauge-label {
  font-size: 14px;
  color: #5f6368;
  margin-bottom: 24px;
}

.gauge-container {
  width: 180px;
  height: 90px;
  position: relative;
  overflow: hidden;
}

.gauge-fill {
  position: absolute;
  left: 0;
  top: 0;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 20px solid #1cc88a;
  border-bottom-color: transparent;
  border-left-color: transparent;
  transform-origin: center bottom;
}

.gauge-marks {
  display: flex;
  justify-content: space-between;
  width: 180px;
  margin-top: 10px;
  font-size: 12px;
  color: #5f6368;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .dashboard-metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-charts {
    grid-template-columns: 1fr;
  }

  .main-chart {
    grid-column: span 1;
    grid-row: span 1;
  }
}

@media (max-width: 768px) {
  .dashboard-metrics {
    grid-template-columns: 1fr;
  }

  .main-chart {
    height: 300px;
  }
}
</style>
