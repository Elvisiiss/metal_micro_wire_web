<template>
  <div class="overview-page">
    <!-- 页面标题区域 -->
    <div class="page-header-custom">
      <div class="header-content">
        <span class="page-title">系统仪表盘</span>
        <span class="page-subtitle">微细线材质量检测系统数据概览</span>
      </div>
      <div class="header-stats">
        <el-tag>最后更新: {{ lastUpdated }}</el-tag>
        <el-button
            type="primary"
            size="small"
            :icon="Refresh"
            @click="refreshAllData"
            :loading="refreshing"
        >
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 系统总体统计卡片 -->
    <div class="overview-cards">
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card shadow="hover" class="stat-card">
            <div class="card-content">
              <div class="card-icon total-icon">
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">总检测数量</div>
                <div class="card-value">{{ formatNumber(overallData.totalDetectionCount) }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card shadow="hover" class="stat-card">
            <div class="card-content">
              <div class="card-icon pass-icon">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">合格率</div>
                <div class="card-value">{{ overallData.totalPassRate }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card shadow="hover" class="stat-card">
            <div class="card-content">
              <div class="card-icon scenario-icon">
                <el-icon><Opportunity /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">应用场景</div>
                <div class="card-value">{{ formatNumber(overallData.totalScenarioCount) }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card shadow="hover" class="stat-card">
            <div class="card-content">
              <div class="card-icon device-icon">
                <el-icon><Cpu /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">检测设备</div>
                <div class="card-value">{{ formatNumber(overallData.totalDeviceCount) }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 月度统计和场景统计 -->
    <div class="chart-container">
      <el-row :gutter="16">
        <el-col :xs="24" :lg="16">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>年度检测数据统计</span>
                <div class="chart-controls">
                  <el-tag type="success">合格率</el-tag>
                  <el-tag type="info">合格数</el-tag>
                  <el-tag type="danger">不合格数</el-tag>
                </div>
              </div>
            </template>
            <div class="chart-wrapper">
              <div v-if="loading.yearly" class="loading-chart">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>加载年度数据中...</span>
              </div>
              <div v-else class="chart" ref="yearlyChartRef" style="height: 400px;"></div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="8">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>应用场景分布</span>
                <div class="chart-controls">
                  <el-select
                      v-model="scenarioTimeRange"
                      size="small"
                      @change="fetchScenarioData"
                      style="width: 200px"
                  >
                    <el-option label="本月" value="this_month" />
                    <el-option label="上月" value="last_month" />
                    <el-option label="今年" value="this_year" />
                    <el-option label="去年" value="last_year" />
                    <el-option label="全部" value="all" />
                  </el-select>
                </div>
              </div>
            </template>
            <div class="chart-wrapper">
              <div v-if="loading.scenario" class="loading-chart">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>加载场景数据中...</span>
              </div>
              <div v-else class="chart" ref="scenarioChartRef" style="height: 400px;"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 月度详情表格 -->
    <div class="monthly-table">
      <el-card shadow="hover">
        <template #header>
          <div class="table-header">
            <span>月度检测详情</span>
          </div>
        </template>
        <el-table
            :data="yearlyData.monthlyData.slice().reverse()"
            stripe
            style="width: 100%"
            v-loading="loading.yearly"
        >
          <el-table-column prop="month" label="月份" width="100">
            <template #default="{ row }">
              {{ row.year }}-{{ row.month.toString().padStart(2, '0') }}
            </template>
          </el-table-column>
          <el-table-column prop="totalCount" label="检测总数" align="center" />
          <el-table-column prop="passCount" label="合格数" align="center">
            <template #default="{ row }">
              <el-tag type="success">{{ row.passCount }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="failCount" label="不合格数" align="center">
            <template #default="{ row }">
              <el-tag type="danger">{{ row.failCount }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="passRate" label="合格率" align="center">
            <template #default="{ row }">
              <el-progress
                  :percentage="row.passRate"
                  :stroke-width="16"
                  :color="getProgressColor(row.passRate)"
                  :show-text="false"
              />
              <span>{{ row.passRate }}%</span>
            </template>
          </el-table-column>
          <el-table-column label="趋势" width="100" align="center">
            <template #default="{ row, $index }">
              <el-icon v-if="getTrendIcon(row, $index)" :color="getTrendColor(row, $index)" size="20">
                <component :is="getTrendIcon(row, $index)" />
              </el-icon>
              <span v-else>—</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import {
  Refresh,
  DataAnalysis,
  CircleCheck,
  Opportunity,
  Cpu,
  Loading,
  Top,
  Bottom,
  Right
} from '@element-plus/icons-vue'
import overviewAPI from '@/api/OverView.js'

// 响应式数据
const yearlyData = ref({ monthlyData: [] })
const scenarioData = ref([])
const overallData = ref({
  totalDetectionCount: 0,
  currentMonthCount: 0,
  lastMonthCount: 0,
  totalScenarioCount: 0,
  totalDeviceCount: 0,
  totalPassCount: 0,
  totalFailCount: 0,
  totalPassRate: 0,
  currentMonthPassCount: 0,
  currentMonthFailCount: 0,
  currentMonthPassRate: 0
})
const scenarioTimeRange = ref('this_month')
const lastUpdated = ref('刚刚')
const refreshing = ref(false)
const loading = ref({
  yearly: false,
  scenario: false,
  overall: false
})

// 图表引用
const yearlyChartRef = ref(null)
const scenarioChartRef = ref(null)
let yearlyChart = null
let scenarioChart = null

// 初始化数据
const fetchAllData = async () => {
  try {
    refreshing.value = true
    await Promise.all([
      fetchYearlyData(),
      fetchScenarioData(),
      fetchOverallData()
    ])
    lastUpdated.value = new Date().toLocaleTimeString()
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败: ' + error.message)
  } finally {
    refreshing.value = false
  }
}

// 刷新数据
const refreshAllData = () => {
  fetchAllData()
}

// 获取年度数据
const fetchYearlyData = async () => {
  loading.value.yearly = true
  try {
    const response = await overviewAPI.getYearlyStatistics()
    if (response.code === 'success') {
      yearlyData.value = response.data
      // 渲染图表
      nextTick(() => {
        renderYearlyChart()
      })
    }
  } catch (error) {
    ElMessage.error('获取年度统计数据失败: ' + error.message)
  } finally {
    loading.value.yearly = false
  }
}

// 获取场景数据
const fetchScenarioData = async () => {
  loading.value.scenario = true
  try {
    const response = await overviewAPI.getScenarioStatistics(scenarioTimeRange.value)
    if (response.code === 'success') {
      scenarioData.value = response.data.scenarioData
    }
  } catch (error) {
    ElMessage.error('获取应用场景数据失败: ' + error.message)
  } finally {
    loading.value.scenario = false
    setTimeout(() => {
      if (!loading.value.scenario && scenarioChartRef.value) {
        renderScenarioChart();
      }
    }, 100);
  }
}

// 获取总体数据
const fetchOverallData = async () => {
  loading.value.overall = true
  try {
    const response = await overviewAPI.getOverallStatistics()
    if (response.code === 'success') {
      overallData.value = response.data
    }
  } catch (error) {
    ElMessage.error('获取系统总体数据失败: ' + error.message)
  } finally {
    loading.value.overall = false
  }
}

// 渲染年度图表
const renderYearlyChart = () => {
  if (!yearlyChartRef.value) return
  if (yearlyChart) yearlyChart.dispose()

  yearlyChart = echarts.init(yearlyChartRef.value)

  const months = yearlyData.value.monthlyData.map(item =>
      `${item.year}-${item.month.toString().padStart(2, '0')}`
  )

  const passCounts = yearlyData.value.monthlyData.map(item => item.passCount)
  const failCounts = yearlyData.value.monthlyData.map(item => item.failCount)
  const passRates = yearlyData.value.monthlyData.map(item => item.passRate)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['合格数', '不合格数', '合格率'],
      bottom: 10
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: true,
        data: months
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '数量',
        position: 'left',
        alignTicks: true,
        axisLine: {
          show: true,
          lineStyle: {
            color: '#5470C6'
          }
        }
      },
      {
        type: 'value',
        name: '合格率 (%)',
        min: 0,
        max: 100,
        position: 'right',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#91CC75'
          }
        },
        axisLabel: {
          formatter: '{value}%'
        }
      }
    ],
    series: [
      {
        name: '合格数',
        type: 'bar',
        stack: 'total',
        barWidth: '40%',
        emphasis: {
          focus: 'series'
        },
        data: passCounts,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      },
      {
        name: '不合格数',
        type: 'bar',
        stack: 'total',
        barWidth: '40%',
        emphasis: {
          focus: 'series'
        },
        data: failCounts,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#f56c6c' },
            { offset: 0.5, color: '#f56c6c' },
            { offset: 1, color: '#c45656' }
          ])
        }
      },
      {
        name: '合格率',
        type: 'line',
        yAxisIndex: 1,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3
        },
        itemStyle: {
          color: '#91CC75'
        },
        data: passRates
      }
    ]
  }

  yearlyChart.setOption(option)

  // 响应窗口变化
  window.addEventListener('resize', handleYearlyChartResize)
}

// 渲染场景图表
const renderScenarioChart = () => {
  console.log(scenarioChartRef.value)
  if (!scenarioChartRef.value) return

  if (scenarioChart) scenarioChart.dispose()
  scenarioChart = echarts.init(scenarioChartRef.value)

  const data = scenarioData.value.map(item => ({
    value: item.scenarioCount,
    name: item.scenarioName,
    itemStyle: {
      color: getRandomColor()
    }
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 20,
      bottom: 20,
    },
    series: [
      {
        name: '应用场景',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
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
            formatter: '{b}\n{c}次 ({d}%)'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  }

  scenarioChart.setOption(option)

  // 响应窗口变化
  window.addEventListener('resize', handleScenarioChartResize)
}

// 工具函数
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

const getRandomColor = () => {
  const colors = [
    '#5470C6', '#91CC75', '#FAC858', '#EE6666',
    '#73C0DE', '#3BA272', '#FC8452', '#9A60B4',
    '#EA7CCC', '#D7504B', '#C6E579', '#F4E001',
    '#F0805A', '#26C0C0'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

const getProgressColor = (rate) => {
  if (rate >= 95) return '#67c23a'
  if (rate >= 85) return '#e6a23c'
  return '#f56c6c'
}

const getTrendIcon = (row, index) => {
  if (index === 0) return null // 没有上个月数据

  const prevRow = yearlyData.value.monthlyData[index + 1]
  if (!prevRow) return null

  if (row.passRate > prevRow.passRate) return Top
  if (row.passRate < prevRow.passRate) return Bottom
  return Right
}

const getTrendColor = (row, index) => {
  if (index === 0) return '' // 没有上个月数据

  const prevRow = yearlyData.value.monthlyData[index + 1]
  if (!prevRow) return ''

  if (row.passRate > prevRow.passRate) return '#67c23a'
  if (row.passRate < prevRow.passRate) return '#f56c6c'
  return '#409eff'
}

// 图表响应式调整
const handleYearlyChartResize = () => {
  if (yearlyChart) {
    yearlyChart.resize()
  }
}

const handleScenarioChartResize = () => {
  if (scenarioChart) {
    scenarioChart.resize()
  }
}

// 生命周期钩子
onMounted(() => {
  fetchAllData()
})

onBeforeUnmount(() => {
  // 移除事件监听
  window.removeEventListener('resize', handleYearlyChartResize)
  window.removeEventListener('resize', handleScenarioChartResize)

  // 销毁图表实例
  if (yearlyChart) {
    yearlyChart.dispose()
    yearlyChart = null
  }
  if (scenarioChart) {
    scenarioChart.dispose()
    scenarioChart = null
  }
})
</script>

<style scoped>
.overview-page {
  padding: 20px;
  background: #f8faff;
  min-height: 100vh;
}

.page-header-custom {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 2px solid #e6f0ff;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a3a6e;
}

.page-subtitle {
  font-size: 14px;
  color: #5b7ba8;
}

.header-stats {
  display: flex;
  gap: 8px;
  align-items: center;
}

.overview-cards {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid #e6f0ff;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.15);
}

.card-content {
  display: flex;
  align-items: center;
  padding: 16px 0;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 28px;
  color: white;
}

.total-icon {
  background: linear-gradient(135deg, #409eff, #367bd6);
}

.pass-icon {
  background: linear-gradient(135deg, #67c23a, #529b2f);
}

.scenario-icon {
  background: linear-gradient(135deg, #e6a23c, #cf9234);
}

.device-icon {
  background: linear-gradient(135deg, #f56c6c, #d65a5a);
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #5b7ba8;
  margin-bottom: 6px;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a3a6e;
}

.chart-container {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid #e6f0ff;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #1a3a6e;
}

.chart-controls {
  display: flex;
  gap: 8px;
}

.chart-wrapper {
  position: relative;
}

.loading-chart {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.loading-chart .el-icon {
  font-size: 32px;
  margin-bottom: 10px;
  color: #409eff;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.monthly-table {
  margin-top: 20px;
}

.table-header {
  font-weight: 600;
  color: #1a3a6e;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header-custom {
    flex-direction: column;
    gap: 10px;
  }

  .header-stats {
    width: 100%;
    justify-content: space-between;
  }

  .stat-card {
    margin-bottom: 10px;
  }

  .card-content {
    padding: 12px 0;
  }

  .card-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }

  .card-value {
    font-size: 20px;
  }
}
</style>
