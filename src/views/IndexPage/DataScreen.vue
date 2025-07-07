<template>
  <div class="dashboard">
    <!-- 标题区域 - 可点击跳转 -->
    <div class="dashboard-header" @click="goToIndex">
      <h1>金属微细线材综合检测平台</h1>
      <p>铜丝等金属微细线材性能检测与分析系统</p>
    </div>

    <!-- 关键指标区域 -->
    <div class="summary-cards">
      <div class="card" v-for="(item, index) in summaryData" :key="index">
        <div class="card-icon" :style="{ backgroundColor: item.color }">
          <i :class="item.icon"></i>
        </div>
        <div class="card-content">
          <div class="card-title">{{ item.title }}</div>
          <div class="card-value">{{ item.value }}</div>
          <div class="card-trend" :class="item.trendClass">
            <i :class="item.trendIcon"></i> {{ item.trendValue }}
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-container">
      <!-- 合格率趋势图 -->
      <div class="chart-section">
        <div class="chart-title">
          <h3>合格率趋势分析</h3>
          <div class="chart-subtitle">近30天合格率变化趋势</div>
        </div>
        <div ref="passRateChart" class="chart" style="height: 300px;"></div>
      </div>

      <!-- 场景分布图 -->
      <div class="chart-section">
        <div class="chart-title">
          <h3>应用场景分布</h3>
          <div class="chart-subtitle">不同场景的检测批次占比</div>
        </div>
        <div ref="scenarioChart" class="chart" style="height: 300px;"></div>
      </div>
    </div>

    <!-- 设备状态区域 -->
    <div class="device-section">
      <div class="section-header">
        <h3>设备运行状态</h3>
        <div class="status-indicator">
          <span class="online">在线: {{ deviceStatus.online }}</span>
          <span class="offline">离线: {{ deviceStatus.offline }}</span>
        </div>
      </div>
      <div class="device-cards">
        <div class="device-card" v-for="(device, index) in devices" :key="index">
          <div class="device-icon" :class="device.status">
            <i class="iconfont icon-machine"></i>
          </div>
          <div class="device-info">
            <div class="device-name">{{ device.name }}</div>
            <div class="device-id">ID: {{ device.id }}</div>
            <div class="device-status">
              <span :class="device.status">{{ device.status === 'online' ? '在线' : '离线' }}</span>
              <span class="update-time">更新: {{ device.updateTime }}</span>
            </div>
          </div>
          <div class="device-stats">
            <div class="stat">
              <div class="stat-value">{{ device.batchCount }}</div>
              <div class="stat-label">检测批次</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ device.passRate }}%</div>
              <div class="stat-label">合格率</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="dashboard-footer">
      <div class="footer-info">
        <span>数据更新时间: {{ lastUpdateTime }}</span>
        <span>系统版本: V2.3.1</span>
      </div>
      <div class="real-time-indicator">
        <span class="indicator"></span>
        <span>实时数据更新中</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import DataScreenAPI from '@/api/DataScreen.js';

export default {
  setup() {
    const router = useRouter();
    const summaryData = ref([]);
    const passRateChart = ref(null);
    const scenarioChart = ref(null);
    const passRateChartInstance = ref(null);
    const scenarioChartInstance = ref(null);
    const deviceStatus = ref({ online: 0, offline: 0 });
    const devices = ref([]);
    const lastUpdateTime = ref('');

    // 跳转到首页
    const goToIndex = () => {
      router.push('/index');
    };

    // 初始化图表
    const initCharts = () => {
      // 销毁之前的图表实例
      if (passRateChartInstance.value) {
        passRateChartInstance.value.dispose();
      }
      if (scenarioChartInstance.value) {
        scenarioChartInstance.value.dispose();
      }

      // 创建新的图表实例
      passRateChartInstance.value = echarts.init(passRateChart.value);
      scenarioChartInstance.value = echarts.init(scenarioChart.value);

      // 设置合格率趋势图选项
      const passRateOption = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c}%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['6/1', '6/5', '6/10', '6/15', '6/20', '6/25', '6/30'],
          axisLine: {
            lineStyle: {
              color: '#5B8FF9'
            }
          },
          axisLabel: {
            color: '#A3B1BF'
          }
        },
        yAxis: {
          type: 'value',
          min: 80,
          max: 100,
          axisLine: {
            show: true,
            lineStyle: {
              color: '#5B8FF9'
            }
          },
          axisLabel: {
            formatter: '{value}%',
            color: '#A3B1BF'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(91, 143, 249, 0.1)'
            }
          }
        },
        series: [
          {
            name: '合格率',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            data: [92.5, 94.3, 93.2, 95.6, 96.1, 97.3, 96.8],
            lineStyle: {
              width: 3,
              color: '#5B8FF9'
            },
            itemStyle: {
              color: '#5B8FF9',
              borderColor: '#fff',
              borderWidth: 2
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(91, 143, 249, 0.4)' },
                { offset: 1, color: 'rgba(91, 143, 249, 0.1)' }
              ])
            }
          }
        ]
      };

      // 设置场景分布图选项
      const scenarioOption = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: {
            color: '#A3B1BF'
          }
        },
        series: [
          {
            name: '场景分布',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#0A1A30',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16',
                fontWeight: 'bold',
                color: '#E6F7FF'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: 35, name: '无氧铜-电力线缆', itemStyle: { color: '#5B8FF9' } },
              { value: 25, name: '镀锡铜线-电子导线', itemStyle: { color: '#5AD8A6' } },
              { value: 20, name: 'H62黄铜-黄铜件', itemStyle: { color: '#F6BD16' } },
              { value: 15, name: '纯锌-防腐镀层', itemStyle: { color: '#E8684A' } },
              { value: 5, name: '其他', itemStyle: { color: '#6DC8EC' } }
            ]
          }
        ]
      };

      // 应用图表选项
      passRateChartInstance.value.setOption(passRateOption);
      scenarioChartInstance.value.setOption(scenarioOption);

      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        passRateChartInstance.value.resize();
        scenarioChartInstance.value.resize();
      });
    };

    // 模拟数据
    const mockData = () => {
      summaryData.value = [
        {
          title: '今日检测批次',
          value: '24',
          icon: 'iconfont icon-batch',
          color: '#5B8FF9',
          trendIcon: 'iconfont icon-up',
          trendValue: '+2',
          trendClass: 'up'
        },
        {
          title: '总检测批次',
          value: '1,256',
          icon: 'iconfont icon-total',
          color: '#5AD8A6',
          trendIcon: 'iconfont icon-up',
          trendValue: '+45',
          trendClass: 'up'
        },
        {
          title: '实时合格率',
          value: '96.8%',
          icon: 'iconfont icon-pass',
          color: '#F6BD16',
          trendIcon: 'iconfont icon-up',
          trendValue: '+1.2%',
          trendClass: 'up'
        },
        {
          title: '设备在线数',
          value: '8/10',
          icon: 'iconfont icon-device',
          color: '#6DC8EC',
          trendIcon: 'iconfont icon-down',
          trendValue: '-1',
          trendClass: 'down'
        }
      ];

      deviceStatus.value = {
        online: 8,
        offline: 2
      };

      devices.value = [
        {
          id: 'D001',
          name: '铜丝检测机-1',
          status: 'online',
          updateTime: '2分钟前',
          batchCount: 156,
          passRate: 97.2
        },
        {
          id: 'D002',
          name: '铜丝检测机-2',
          status: 'online',
          updateTime: '5分钟前',
          batchCount: 142,
          passRate: 95.8
        },
        {
          id: 'D003',
          name: '铝丝检测机',
          status: 'online',
          updateTime: '8分钟前',
          batchCount: 98,
          passRate: 96.3
        },
        {
          id: 'D004',
          name: '镍丝检测机',
          status: 'offline',
          updateTime: '3小时前',
          batchCount: 87,
          passRate: 94.7
        }
      ];

      lastUpdateTime.value = new Date().toLocaleString();
    };

    // 从API获取数据
    const fetchData = async () => {
      try {
        // 实际项目中调用API
        const summaryRes = await DataScreenAPI.getDashboardSummary();
        const trendRes = await DataScreenAPI.getPassRateTrend();
        const scenarioRes = await DataScreenAPI.getScenarioDistribution();
        const deviceRes = await DataScreenAPI.getDeviceStatus();

        // 模拟数据
        mockData();

        // 初始化图表
        initCharts();
      } catch (error) {
        console.error('加载数据失败:', error);
        // 使用模拟数据作为后备
        mockData();
        initCharts();
      }
    };

    // 组件挂载时加载数据
    onMounted(() => {
      fetchData();
    });

    // 组件卸载前销毁图表
    onBeforeUnmount(() => {
      if (passRateChartInstance.value) {
        passRateChartInstance.value.dispose();
      }
      if (scenarioChartInstance.value) {
        scenarioChartInstance.value.dispose();
      }
      window.removeEventListener('resize', () => {});
    });

    return {
      summaryData,
      passRateChart,
      scenarioChart,
      deviceStatus,
      devices,
      lastUpdateTime,
      goToIndex
    };
  }
};
</script>

<style scoped>
.dashboard {
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  background: linear-gradient(135deg, #0A1A30 0%, #152642 100%);
  min-height: 100vh;
  color: #E6F7FF;
  padding: 20px;
  position: relative;
  overflow-x: hidden;
}

/* 标题区域 - 可点击 */
.dashboard-header {
  background: rgba(11, 33, 58, 0.8);
  border: 1px solid rgba(91, 143, 249, 0.3);
  border-radius: 8px;
  padding: 15px 25px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.dashboard-header:hover {
  background: rgba(11, 33, 58, 0.9);
  border-color: rgba(91, 143, 249, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(91, 143, 249, 0.2);
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(91, 143, 249, 0.1), transparent);
  transition: all 0.6s ease;
}

.dashboard-header:hover::before {
  left: 100%;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 26px;
  font-weight: bold;
  background: linear-gradient(90deg, #5B8FF9, #6DC8EC);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
}

.dashboard-header p {
  margin: 8px 0 0;
  font-size: 14px;
  opacity: 0.8;
}

/* 关键指标卡片 */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.card {
  background: rgba(11, 33, 58, 0.7);
  border: 1px solid rgba(91, 143, 249, 0.2);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(91, 143, 249, 0.25);
  border-color: rgba(91, 143, 249, 0.4);
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 28px;
  color: white;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 5px;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
  background: linear-gradient(90deg, #E6F7FF, #A3B1BF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.card-trend {
  font-size: 13px;
  display: flex;
  align-items: center;
}

.card-trend.up {
  color: #5AD8A6;
}

.card-trend.down {
  color: #E8684A;
}

/* 图表区域 */
.chart-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.chart-section {
  background: rgba(11, 33, 58, 0.7);
  border: 1px solid rgba(91, 143, 249, 0.2);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chart-title {
  margin-bottom: 15px;
}

.chart-title h3 {
  margin: 0;
  font-size: 18px;
  color: #5B8FF9;
  display: flex;
  align-items: center;
}

.chart-title h3::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 18px;
  background: #5B8FF9;
  margin-right: 10px;
  border-radius: 2px;
}

.chart-subtitle {
  font-size: 13px;
  opacity: 0.7;
  margin-top: 5px;
}

.chart {
  width: 100%;
}

/* 设备区域 */
.device-section {
  background: rgba(11, 33, 58, 0.7);
  border: 1px solid rgba(91, 143, 249, 0.2);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  color: #5B8FF9;
  display: flex;
  align-items: center;
}

.section-header h3::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 18px;
  background: #5B8FF9;
  margin-right: 10px;
  border-radius: 2px;
}

.status-indicator {
  display: flex;
  gap: 15px;
}

.status-indicator .online {
  color: #5AD8A6;
}

.status-indicator .offline {
  color: #E8684A;
}

.device-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.device-card {
  background: rgba(16, 46, 82, 0.6);
  border: 1px solid rgba(91, 143, 249, 0.15);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  transition: all 0.3s ease;
}

.device-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(91, 143, 249, 0.2);
  border-color: rgba(91, 143, 249, 0.3);
}

.device-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
}

.device-icon.online {
  background: rgba(90, 216, 166, 0.15);
  color: #5AD8A6;
}

.device-icon.offline {
  background: rgba(232, 104, 74, 0.15);
  color: #E8684A;
}

.device-info {
  flex: 1;
}

.device-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.device-id {
  font-size: 12px;
  opacity: 0.7;
  margin-bottom: 8px;
}

.device-status {
  display: flex;
  gap: 10px;
  font-size: 13px;
}

.device-status span.online {
  color: #5AD8A6;
  background: rgba(90, 216, 166, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
}

.device-status span.offline {
  color: #E8684A;
  background: rgba(232, 104, 74, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
}

.update-time {
  opacity: 0.7;
}

.device-stats {
  display: flex;
  gap: 15px;
}

.stat {
  text-align: center;
  min-width: 60px;
}

.stat-value {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 3px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.7;
}

/* 底部信息 */
.dashboard-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(11, 33, 58, 0.8);
  border-radius: 8px;
  font-size: 13px;
  opacity: 0.8;
}

.footer-info {
  display: flex;
  gap: 20px;
}

.real-time-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #5AD8A6;
  box-shadow: 0 0 10px #5AD8A6;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(90, 216, 166, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(90, 216, 166, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(90, 216, 166, 0);
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .device-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }

  .chart-container {
    grid-template-columns: 1fr;
  }

  .dashboard-footer {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .footer-info {
    flex-direction: column;
    gap: 5px;
  }
}

/* 图标字体 */
@font-face {
  font-family: 'iconfont';
  src: url('//at.alicdn.com/t/font_1234567_abcdefghijklmnopqrstuvwxyz.eot');
  src: url('//at.alicdn.com/t/font_1234567_abcdefghijklmnopqrstuvwxyz.eot?#iefix') format('embedded-opentype'),
  url('//at.alicdn.com/t/font_1234567_abcdefghijklmnopqrstuvwxyz.woff2') format('woff2'),
  url('//at.alicdn.com/t/font_1234567_abcdefghijklmnopqrstuvwxyz.woff') format('woff'),
  url('//at.alicdn.com/t/font_1234567_abcdefghijklmnopqrstuvwxyz.ttf') format('truetype'),
  url('//at.alicdn.com/t/font_1234567_abcdefghijklmnopqrstuvwxyz.svg#iconfont') format('svg');
}

.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-batch::before {
  content: "\e61a";
}

.icon-total::before {
  content: "\e61b";
}

.icon-pass::before {
  content: "\e61c";
}

.icon-device::before {
  content: "\e61d";
}

.icon-up::before {
  content: "\e61e";
}

.icon-down::before {
  content: "\e61f";
}

.icon-machine::before {
  content: "\e620";
}
</style>
