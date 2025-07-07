<template>
  <div class="dashboard-container">
    <!-- 顶部标题区域 -->
    <div class="dashboard-header">
      <h1 class="title">金属微细线材检测平台</h1>
      <div class="header-info">
        <div class="status-indicator online"></div>
        <span>运行中</span>
        <div class="time-display">{{ currentTime }}</div>
      </div>
    </div>

    <!-- 数据概览区域 -->
    <div class="data-overview">
      <div class="data-card" v-for="(item, index) in overviewData" :key="index">
        <div class="data-icon" :style="{ backgroundColor: item.color }">
          <i :class="item.icon"></i>
        </div>
        <div class="data-content">
          <div class="data-value">{{ item.value }}{{ item.unit }}</div>
          <div class="data-label">{{ item.label }}</div>
        </div>
        <div class="data-trend" :class="item.trend >= 0 ? 'up' : 'down'">
          <i :class="item.trend >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
          {{ Math.abs(item.trend) }}%
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-container">
      <div class="chart-wrapper">
        <div class="chart-title">线材直径实时监测</div>
        <div class="chart" ref="diameterChart"></div>
      </div>
      <div class="chart-wrapper">
        <div class="chart-title">缺陷类型分布</div>
        <div class="chart" ref="defectChart"></div>
      </div>
      <div class="chart-wrapper">
        <div class="chart-title">生产合格率趋势</div>
        <div class="chart" ref="qualityChart"></div>
      </div>
    </div>

    <!-- 报警信息 -->
    <div class="alarm-container">
      <div class="section-title">实时报警信息</div>
      <div class="alarm-list">
        <div v-for="(alarm, index) in alarms" :key="index" class="alarm-item">
          <div class="alarm-level" :class="'level-' + alarm.level">{{ alarm.levelText }}</div>
          <div class="alarm-content">
            <div class="alarm-title">{{ alarm.title }}</div>
            <div class="alarm-time">{{ alarm.time }}</div>
          </div>
          <div class="alarm-location">{{ alarm.location }}</div>
          <button class="alarm-action">处理</button>
        </div>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="dashboard-footer">
      <div class="system-status">
        <div class="status-item">
          <span>检测设备:</span>
          <span class="status-value">在线 (12台)</span>
        </div>
        <div class="status-item">
          <span>数据采集:</span>
          <span class="status-value active">正常</span>
        </div>
        <div class="status-item">
          <span>存储状态:</span>
          <span class="status-value">89%</span>
        </div>
      </div>
      <div class="production-stats">
        <div class="stat-item">
          <span>今日产量:</span>
          <span class="stat-value">{{ productionStats.today }} 米</span>
        </div>
        <div class="stat-item">
          <span>本月累计:</span>
          <span class="stat-value">{{ productionStats.month }} 米</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

// 当前时间
const currentTime = ref('');
// 数据概览
const overviewData = ref([
  { icon: 'fas fa-ruler', label: '平均直径', value: 0.52, unit: 'mm', trend: 1.2, color: '#36a2eb' },
  { icon: 'fas fa-tachometer-alt', label: '生产速度', value: 45, unit: 'm/min', trend: 2.8, color: '#4cc0c0' },
  { icon: 'fas fa-check-circle', label: '合格率', value: 98.3, unit: '%', trend: 0.4, color: '#ffce56' },
  { icon: 'fas fa-exclamation-triangle', label: '缺陷率', value: 1.2, unit: '%', trend: -0.3, color: '#ff6384' },
  { icon: 'fas fa-thermometer-half', label: '温度', value: 68, unit: '°C', trend: 0.7, color: '#9966ff' },
  { icon: 'fas fa-bolt', label: '电压', value: 380, unit: 'V', trend: -0.1, color: '#ff9f40' }
]);

// 报警信息
const alarms = ref([
  { level: 1, levelText: '紧急', title: '3#生产线直径超标', time: '10:25:36', location: '3号线-张力区' },
  { level: 2, levelText: '警告', title: '5#生产线温度异常', time: '10:18:12', location: '5号线-加热区' },
  { level: 3, levelText: '注意', title: '2#生产线速度波动', time: '09:56:44', location: '2号线-驱动区' }
]);

// 生产统计
const productionStats = ref({
  today: '125,680',
  month: '3,568,420'
});

// 图表引用
const diameterChart = ref(null);
const defectChart = ref(null);
const qualityChart = ref(null);

// 图表实例
let diameterChartInstance = null;
let defectChartInstance = null;
let qualityChartInstance = null;

// 更新时间
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-');
};

// 初始化直径图表
const initDiameterChart = () => {
  if (diameterChart.value) {
    diameterChartInstance = echarts.init(diameterChart.value);

    const categories = [];
    const data = [];

    // 生成24个时间点（每小时）
    for (let i = 0; i < 24; i++) {
      categories.push(`${i}:00`);
      // 生成0.50-0.55之间的随机值
      data.push((Math.random() * 0.05 + 0.50).toFixed(3));
    }

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        formatter: '{b} : {c} mm'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: {
          lineStyle: {
            color: '#4a5e7a'
          }
        },
        axisLabel: {
          color: '#a0b1c5'
        }
      },
      yAxis: {
        type: 'value',
        min: 0.49,
        max: 0.56,
        axisLine: {
          show: true,
          lineStyle: {
            color: '#4a5e7a'
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(74, 94, 122, 0.3)'
          }
        },
        axisLabel: {
          formatter: '{value} mm',
          color: '#a0b1c5'
        }
      },
      series: [
        {
          name: '线材直径',
          type: 'line',
          data: data,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 3,
            color: '#36a2eb'
          },
          itemStyle: {
            color: '#36a2eb'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(54, 162, 235, 0.5)' },
              { offset: 1, color: 'rgba(54, 162, 235, 0.1)' }
            ])
          }
        },
        {
          name: '上限',
          type: 'line',
          data: Array(24).fill(0.55),
          lineStyle: {
            width: 1,
            type: 'dashed',
            color: '#ff6384'
          },
          silent: true
        },
        {
          name: '下限',
          type: 'line',
          data: Array(24).fill(0.50),
          lineStyle: {
            width: 1,
            type: 'dashed',
            color: '#ff6384'
          },
          silent: true
        }
      ]
    };

    diameterChartInstance.setOption(option);
  }
};

// 初始化缺陷分布图表
const initDefectChart = () => {
  if (defectChart.value) {
    defectChartInstance = echarts.init(defectChart.value);

    const data = [
      { value: 42, name: '表面划伤', color: '#ff6384' },
      { value: 28, name: '直径偏差', color: '#36a2eb' },
      { value: 15, name: '氧化斑点', color: '#ffce56' },
      { value: 9, name: '材质不均', color: '#4cc0c0' },
      { value: 6, name: '其他缺陷', color: '#9966ff' }
    ];

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: {
          color: '#a0b1c5'
        }
      },
      series: [
        {
          name: '缺陷类型',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#0f1c2e',
            borderWidth: 2
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '14',
              fontWeight: 'bold',
              color: '#fff'
            }
          },
          labelLine: {
            show: false
          },
          data: data
        }
      ]
    };

    defectChartInstance.setOption(option);
  }
};

// 初始化合格率图表
const initQualityChart = () => {
  if (qualityChart.value) {
    qualityChartInstance = echarts.init(qualityChart.value);

    const categories = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const data = [];

    // 生成每月合格率数据 (95% - 99%之间)
    for (let i = 0; i < 12; i++) {
      data.push((Math.random() * 4 + 95).toFixed(1));
    }

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        formatter: '{b} : {c}%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: {
          lineStyle: {
            color: '#4a5e7a'
          }
        },
        axisLabel: {
          color: '#a0b1c5'
        }
      },
      yAxis: {
        type: 'value',
        min: 94,
        max: 100,
        axisLine: {
          show: true,
          lineStyle: {
            color: '#4a5e7a'
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(74, 94, 122, 0.3)'
          }
        },
        axisLabel: {
          formatter: '{value}%',
          color: '#a0b1c5'
        }
      },
      series: [
        {
          name: '合格率',
          type: 'bar',
          data: data,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#4cc0c0' },
              { offset: 1, color: '#36a2eb' }
            ])
          },
          barWidth: '60%'
        }
      ]
    };

    qualityChartInstance.setOption(option);
  }
};

// 更新实时数据
const updateRealtimeData = () => {
  // 更新概览数据
  overviewData.value.forEach(item => {
    // 根据数据类型生成不同的随机波动
    let fluctuation = 0;
    switch(item.label) {
      case '平均直径':
        fluctuation = (Math.random() - 0.5) * 0.005;
        item.value = Math.max(0.49, Math.min(0.55, parseFloat(item.value) + fluctuation));
        break;
      case '生产速度':
        fluctuation = (Math.random() - 0.5) * 2;
        item.value = Math.max(30, Math.min(60, parseInt(item.value) + fluctuation));
        break;
      case '合格率':
        fluctuation = (Math.random() - 0.5) * 0.2;
        item.value = Math.max(97.5, Math.min(99.5, parseFloat(item.value) + fluctuation)).toFixed(1);
        break;
      case '缺陷率':
        fluctuation = (Math.random() - 0.5) * 0.1;
        item.value = Math.max(0.5, Math.min(2.0, parseFloat(item.value) + fluctuation)).toFixed(1);
        break;
      case '温度':
        fluctuation = (Math.random() - 0.5) * 2;
        item.value = Math.max(65, Math.min(75, parseInt(item.value) + fluctuation));
        break;
      case '电压':
        fluctuation = (Math.random() - 0.5) * 5;
        item.value = Math.max(375, Math.min(385, parseInt(item.value) + fluctuation));
        break;
    }

    // 更新趋势 (随机生成-0.5%到0.5%之间的变化)
    item.trend = (Math.random() - 0.5).toFixed(1);
  });

  // 更新生产统计
  productionStats.value.today = (parseInt(productionStats.value.today.replace(/,/g, '')) + Math.floor(Math.random() * 50)).toLocaleString();

  // 更新图表数据
  if (diameterChartInstance) {
    const option = diameterChartInstance.getOption();
    const newData = option.series[0].data.map(value => {
      const fluctuation = (Math.random() - 0.5) * 0.003;
      return Math.max(0.49, Math.min(0.55, parseFloat(value) + fluctuation)).toFixed(3);
    });
    option.series[0].data = newData;
    diameterChartInstance.setOption(option);
  }
};

// 初始化
onMounted(() => {
  // 初始化时间
  updateTime();
  setInterval(updateTime, 1000);

  // 初始化图表
  initDiameterChart();
  initDefectChart();
  initQualityChart();

  // 初始化数据更新定时器
  setInterval(updateRealtimeData, 3000);

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    diameterChartInstance && diameterChartInstance.resize();
    defectChartInstance && defectChartInstance.resize();
    qualityChartInstance && qualityChartInstance.resize();
  });
});

// 清理
onBeforeUnmount(() => {
  diameterChartInstance && diameterChartInstance.dispose();
  defectChartInstance && defectChartInstance.dispose();
  qualityChartInstance && qualityChartInstance.dispose();
});
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Arial', 'Microsoft YaHei', sans-serif;
}

.dashboard-container {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0f1c2e 0%, #1d3a5f 100%);
  color: #e0f0ff;
  overflow: hidden;
  padding: 20px;
  position: relative;
}

/* 科技感背景效果 */
.dashboard-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
      radial-gradient(circle at 20% 30%, rgba(54, 162, 235, 0.1) 0%, transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(255, 99, 132, 0.1) 0%, transparent 40%);
  pointer-events: none;
  z-index: 0;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(16, 33, 54, 0.7);
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 1;
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.title {
  font-size: 28px;
  font-weight: bold;
  background: linear-gradient(90deg, #36a2eb, #4cc0c0);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 10px rgba(54, 162, 235, 0.3);
  letter-spacing: 1px;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-indicator.online {
  background-color: #4cc0c0;
  box-shadow: 0 0 10px #4cc0c0;
}

.time-display {
  font-size: 18px;
  background: rgba(0, 0, 0, 0.3);
  padding: 5px 15px;
  border-radius: 20px;
  border: 1px solid rgba(64, 158, 255, 0.3);
}

.data-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
  z-index: 1;
}

.data-card {
  display: flex;
  background: rgba(16, 33, 54, 0.7);
  border-radius: 10px;
  padding: 15px;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(64, 158, 255, 0.1);
  transition: all 0.3s ease;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(54, 162, 235, 0.4);
  border-color: rgba(54, 162, 235, 0.4);
}

.data-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 20px;
  color: white;
}

.data-content {
  flex: 1;
}

.data-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.data-label {
  font-size: 14px;
  color: #a0b1c5;
}

.data-trend {
  font-size: 14px;
  padding: 3px 8px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
}

.data-trend.up {
  color: #4cc0c0;
}

.data-trend.down {
  color: #ff6384;
}

.chart-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  flex: 1;
  margin-bottom: 20px;
  z-index: 1;
}

.chart-wrapper {
  background: rgba(16, 33, 54, 0.7);
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(64, 158, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.chart-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #a0b1c5;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(74, 94, 122, 0.5);
}

.chart {
  height: 100%;
  min-height: 250px;
}

.alarm-container {
  background: rgba(16, 33, 54, 0.7);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(64, 158, 255, 0.1);
  z-index: 1;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #a0b1c5;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(74, 94, 122, 0.5);
}

.alarm-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alarm-item {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 12px 15px;
  transition: all 0.3s ease;
}

.alarm-item:hover {
  background: rgba(16, 33, 54, 0.9);
  transform: translateX(5px);
}

.alarm-level {
  width: 70px;
  text-align: center;
  padding: 5px;
  border-radius: 5px;
  font-weight: bold;
  font-size: 14px;
  margin-right: 15px;
}

.level-1 {
  background: rgba(255, 99, 132, 0.3);
  color: #ff6384;
  border: 1px solid #ff6384;
}

.level-2 {
  background: rgba(255, 206, 86, 0.3);
  color: #ffce56;
  border: 1px solid #ffce56;
}

.level-3 {
  background: rgba(54, 162, 235, 0.3);
  color: #36a2eb;
  border: 1px solid #36a2eb;
}

.alarm-content {
  flex: 1;
}

.alarm-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.alarm-time {
  font-size: 12px;
  color: #a0b1c5;
}

.alarm-location {
  width: 150px;
  color: #a0b1c5;
  font-size: 14px;
}

.alarm-action {
  background: rgba(54, 162, 235, 0.3);
  color: #36a2eb;
  border: 1px solid #36a2eb;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.alarm-action:hover {
  background: rgba(54, 162, 235, 0.5);
}

.dashboard-footer {
  display: flex;
  justify-content: space-between;
  background: rgba(16, 33, 54, 0.7);
  border-radius: 10px;
  padding: 15px 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(64, 158, 255, 0.1);
  z-index: 1;
}

.system-status, .production-stats {
  display: flex;
  gap: 30px;
}

.status-item, .stat-item {
  display: flex;
  gap: 10px;
  font-size: 14px;
  color: #a0b1c5;
}

.status-value, .stat-value {
  color: #e0f0ff;
  font-weight: bold;
}

.status-value.active {
  color: #4cc0c0;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .data-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-container > div:last-child {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .data-overview {
    grid-template-columns: 1fr;
  }

  .chart-container {
    grid-template-columns: 1fr;
  }

  .chart-container > div:last-child {
    grid-column: span 1;
  }

  .dashboard-footer {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
