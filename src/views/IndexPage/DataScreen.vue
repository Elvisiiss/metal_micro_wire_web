<template>
  <div class="data-screen">
    <div class="dashboard-header">
      <h1>金属微细线材综合检测平台</h1>
      <p>铜丝等金属微细线材性能检测与分析系统</p>
    </div>

    <div class="dashboard-content">
      <!-- 实时监测数据 -->
      <div class="realtime-section">
        <h2>实时检测数据</h2>
        <div class="realtime-cards">
          <div class="card">
            <div class="card-title">当前线径 (mm)</div>
            <div class="card-value">{{ currentData.diameter.toFixed(4) }}</div>
            <div class="card-trend" :class="{'up': diameterTrend === 'up', 'down': diameterTrend === 'down'}">
              <span v-if="diameterTrend === 'up'">↑</span>
              <span v-else-if="diameterTrend === 'down'">↓</span>
              {{ diameterChange }}%
            </div>
          </div>

          <div class="card">
            <div class="card-title">拉伸强度 (MPa)</div>
            <div class="card-value">{{ currentData.tensileStrength.toFixed(1) }}</div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{width: (currentData.tensileStrength/500*100) + '%'}"></div>
            </div>
          </div>

          <div class="card">
            <div class="card-title">电导率 (%IACS)</div>
            <div class="card-value">{{ currentData.conductivity.toFixed(1) }}</div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{width: (currentData.conductivity/110*100) + '%'}"></div>
            </div>
          </div>

          <div class="card">
            <div class="card-title">单位重量 (g/m)</div>
            <div class="card-value">{{ currentData.weightPerMeter.toFixed(3) }}</div>
            <div class="card-trend" :class="{'up': weightTrend === 'up', 'down': weightTrend === 'down'}">
              <span v-if="weightTrend === 'up'">↑</span>
              <span v-else-if="weightTrend === 'down'">↓</span>
              {{ weightChange }}%
            </div>
          </div>
        </div>
      </div>

      <!-- 检测图表 -->
      <div class="chart-section">
        <div class="chart-container">
          <h3>线径变化趋势</h3>
          <LineChart :data="diameterHistory" :options="chartOptions" />
        </div>
        <div class="chart-container">
          <h3>拉伸强度分布</h3>
          <BarChart :data="tensileData" :options="chartOptions" />
        </div>
      </div>
      <h1>·</h1>
      <h4>·</h4>

      <!-- 批次数据 -->
      <div class="batch-section">
        <h2>批次检测数据</h2>
        <div class="batch-controls">
          <div class="search-box">
            <input type="text" v-model="batchSearch" placeholder="搜索批次号..." />
            <button @click="searchBatch">搜索</button>
          </div>
          <div class="filter-box">
            <label>日期范围:</label>
            <input type="date" v-model="startDate" />
            <span>至</span>
            <input type="date" v-model="endDate" />
          </div>
        </div>
        <div class="batch-table">
          <table>
            <thead>
            <tr>
              <th>批次号</th>
              <th>检测日期</th>
              <th>平均线径(mm)</th>
              <th>平均强度(MPa)</th>
              <th>平均电导率(%IACS)</th>
              <th>合格率</th>
              <th>操作</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="batch in filteredBatches" :key="batch.id">
              <td>{{ batch.batchNumber }}</td>
              <td>{{ formatDate(batch.testDate) }}</td>
              <td>{{ batch.avgDiameter.toFixed(4) }}</td>
              <td>{{ batch.avgTensileStrength.toFixed(1) }}</td>
              <td>{{ batch.avgConductivity.toFixed(1) }}</td>
              <td>
                <div class="pass-rate">
                  <div class="rate-bar" :style="{width: batch.passRate + '%'}"></div>
                  <span>{{ batch.passRate }}%</span>
                </div>
              </td>
              <td>
                <button class="detail-btn" @click="showBatchDetail(batch)">详情</button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 详情模态框 -->
    <div class="modal" v-if="showModal">
      <div class="modal-content">
        <span class="close" @click="showModal = false">&times;</span>
        <h2>批次详情 - {{ selectedBatch.batchNumber }}</h2>
        <div class="modal-body">
          <div class="detail-row">
            <div class="detail-item">
              <label>检测日期:</label>
              <span>{{ formatDate(selectedBatch.testDate) }}</span>
            </div>
            <div class="detail-item">
              <label>检测人员:</label>
              <span>{{ selectedBatch.operator }}</span>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-item">
              <label>线径范围:</label>
              <span>{{ selectedBatch.minDiameter.toFixed(4) }} - {{ selectedBatch.maxDiameter.toFixed(4) }} mm</span>
            </div>
            <div class="detail-item">
              <label>平均线径:</label>
              <span>{{ selectedBatch.avgDiameter.toFixed(4) }} mm</span>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-item">
              <label>拉伸强度范围:</label>
              <span>{{ selectedBatch.minTensileStrength.toFixed(1) }} - {{ selectedBatch.maxTensileStrength.toFixed(1) }} MPa</span>
            </div>
            <div class="detail-item">
              <label>平均强度:</label>
              <span>{{ selectedBatch.avgTensileStrength.toFixed(1) }} MPa</span>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-item">
              <label>电导率范围:</label>
              <span>{{ selectedBatch.minConductivity.toFixed(1) }} - {{ selectedBatch.maxConductivity.toFixed(1) }} %IACS</span>
            </div>
            <div class="detail-item">
              <label>平均电导率:</label>
              <span>{{ selectedBatch.avgConductivity.toFixed(1) }} %IACS</span>
            </div>
          </div>

          <div class="detail-chart">
            <h3>性能参数分布</h3>
            <div class="chart-wrapper">
              <RadarChart :data="batchRadarData" :options="radarOptions" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import LineChart from './LineChart.vue';
import BarChart from './BarChart.vue';
import RadarChart from './RadarChart.vue';

export default {
  components: {
    LineChart,
    BarChart,
    RadarChart
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

    // 批次数据
    const batches = ref([
      {
        id: 1,
        batchNumber: 'CU20230501',
        testDate: '2023-05-01',
        avgDiameter: 0.1023,
        minDiameter: 0.1018,
        maxDiameter: 0.1028,
        avgTensileStrength: 328.5,
        minTensileStrength: 315.2,
        maxTensileStrength: 342.7,
        avgConductivity: 98.5,
        minConductivity: 97.8,
        maxConductivity: 99.2,
        passRate: 98.5,
        operator: '张工'
      },
      {
        id: 2,
        batchNumber: 'CU20230502',
        testDate: '2023-05-02',
        avgDiameter: 0.1025,
        minDiameter: 0.1020,
        maxDiameter: 0.1030,
        avgTensileStrength: 332.1,
        minTensileStrength: 320.5,
        maxTensileStrength: 345.3,
        avgConductivity: 98.8,
        minConductivity: 98.1,
        maxConductivity: 99.5,
        passRate: 99.2,
        operator: '李工'
      },
      {
        id: 3,
        batchNumber: 'CU20230503',
        testDate: '2023-05-03',
        avgDiameter: 0.1022,
        minDiameter: 0.1015,
        maxDiameter: 0.1027,
        avgTensileStrength: 325.8,
        minTensileStrength: 310.4,
        maxTensileStrength: 338.9,
        avgConductivity: 97.9,
        minConductivity: 97.0,
        maxConductivity: 98.7,
        passRate: 97.3,
        operator: '王工'
      }
    ]);

    // 搜索和过滤
    const batchSearch = ref('');
    const startDate = ref('');
    const endDate = ref('');

    const filteredBatches = computed(() => {
      return batches.value.filter(batch => {
        const matchesSearch = batch.batchNumber.toLowerCase().includes(batchSearch.value.toLowerCase());
        const matchesDate = (!startDate.value || batch.testDate >= startDate.value) &&
            (!endDate.value || batch.testDate <= endDate.value);
        return matchesSearch && matchesDate;
      });
    });

    // 模态框
    const showModal = ref(false);
    const selectedBatch = ref({});

    // 图表选项
    const chartOptions = ref({
      responsive: true,
      maintainAspectRatio: false
    });

    const radarOptions = ref({
      responsive: true,
      scales: {
        r: {
          angleLines: {
            display: true
          },
          suggestedMin: 0
        }
      }
    });

    // 雷达图数据
    const batchRadarData = computed(() => {
      if (!selectedBatch.value) return {};

      return {
        labels: ['线径', '拉伸强度', '电导率', '单位重量', '合格率'],
        datasets: [{
          label: '性能参数',
          data: [
            selectedBatch.value.avgDiameter * 1000,
            selectedBatch.value.avgTensileStrength,
            selectedBatch.value.avgConductivity,
            70, // 假设的单位重量
            selectedBatch.value.passRate
          ],
          backgroundColor: 'rgba(78, 115, 223, 0.2)',
          borderColor: 'rgba(78, 115, 223, 1)',
          pointBackgroundColor: 'rgba(78, 115, 223, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(78, 115, 223, 1)'
        }]
      };
    });

    // 方法
    const searchBatch = () => {
      console.log('搜索批次:', batchSearch.value);
    };

    const showBatchDetail = (batch) => {
      selectedBatch.value = batch;
      showModal.value = true;
    };

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    };

    // 模拟实时数据更新
    onMounted(() => {
      setInterval(() => {
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

    return {
      currentData,
      diameterTrend,
      diameterChange,
      weightTrend,
      weightChange,
      diameterHistory,
      tensileData,
      batches,
      batchSearch,
      startDate,
      endDate,
      filteredBatches,
      showModal,
      selectedBatch,
      chartOptions,
      radarOptions,
      batchRadarData,
      searchBatch,
      showBatchDetail,
      formatDate
    };
  }
};
</script>

<style scoped>
.data-screen {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fc;
  min-height: 100vh;
  color: #333;
  padding: 20px;
  max-width: 1800px;
  margin: 0 auto;
}

.dashboard-header {
  background: linear-gradient(135deg, #1a3a6e 0%, #4e73df 100%);
  color: white;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 1.8rem;
}

.dashboard-header p {
  margin: 0.5rem 0 0;
  opacity: 0.9;
  font-size: 1rem;
}

.dashboard-content {
  padding: 0 1.5rem;
}

h2 {
  color: #4e73df;
  border-bottom: 2px solid #e3e6f0;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
}

h3 {
  color: #5a5c69;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

/* 实时数据卡片 */
.realtime-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background: white;
  border-radius: 0.35rem;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
  padding: 1.25rem;
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-5px);
}

.card-title {
  color: #858796;
  font-size: 0.9rem;
  text-transform: uppercase;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.card-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #5a5c69;
  margin-bottom: 0.5rem;
}

.card-trend {
  font-size: 0.9rem;
}

.card-trend.up {
  color: #1cc88a;
}

.card-trend.down {
  color: #e74a3b;
}

.progress-bar {
  height: 0.5rem;
  background-color: #eaecf4;
  border-radius: 0.25rem;
  margin-top: 0.5rem;
}

.progress-fill {
  height: 100%;
  border-radius: 0.25rem;
  background-color: #4e73df;
}

/* 图表区域 */
.chart-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-container {
  background: white;
  border-radius: 0.35rem;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
  padding: 1.25rem;
  height: 300px;
}

/* 批次数据 */
.batch-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.search-box input {
  padding: 0.5rem;
  border: 1px solid #d1d3e2;
  border-radius: 0.35rem;
  margin-right: 0.5rem;
}

.search-box button {
  padding: 0.5rem 1rem;
  background-color: #4e73df;
  color: white;
  border: none;
  border-radius: 0.35rem;
  cursor: pointer;
}

.filter-box {
  display: flex;
  align-items: center;
}

.filter-box label {
  margin-right: 0.5rem;
  font-size: 0.9rem;
}

.filter-box input {
  padding: 0.5rem;
  border: 1px solid #d1d3e2;
  border-radius: 0.35rem;
  margin: 0 0.5rem;
}

.batch-table {
  background: white;
  border-radius: 0.35rem;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e3e6f0;
}

th {
  background-color: #f8f9fc;
  color: #4e73df;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.75rem;
}

tr:hover {
  background-color: #f8f9fc;
}

.pass-rate {
  position: relative;
  height: 1.5rem;
  background-color: #eaecf4;
  border-radius: 0.25rem;
}

.rate-bar {
  position: absolute;
  height: 100%;
  background-color: #1cc88a;
  border-radius: 0.25rem;
}

.pass-rate span {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  color: white;
  z-index: 1;
}

.detail-btn {
  padding: 0.25rem 0.5rem;
  background-color: #4e73df;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.8rem;
}

.detail-btn:hover {
  background-color: #2e59d9;
}

/* 模态框 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  width: 80%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
  position: relative;
}

.close {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  font-size: 1.5rem;
  cursor: pointer;
  color: #aaa;
}

.close:hover {
  color: #333;
}

.modal-body {
  margin-top: 1rem;
}

.detail-row {
  display: flex;
  margin-bottom: 1rem;
}

.detail-item {
  flex: 1;
  margin-right: 1rem;
}

.detail-item label {
  display: block;
  font-weight: bold;
  color: #5a5c69;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.detail-item span {
  display: block;
  padding: 0.5rem;
  background-color: #f8f9fc;
  border-radius: 0.25rem;
}

.detail-chart {
  margin-top: 2rem;
}

.chart-wrapper {
  height: 300px;
  margin-top: 1rem;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .realtime-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .realtime-cards {
    grid-template-columns: 1fr;
  }

  .batch-controls {
    flex-direction: column;
  }

  .search-box, .filter-box {
    margin-bottom: 1rem;
    width: 100%;
  }

  .modal-content {
    width: 95%;
  }

  .detail-row {
    flex-direction: column;
  }

  .detail-item {
    margin-right: 0;
    margin-bottom: 1rem;
  }
}
</style>
