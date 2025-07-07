<template>
  <div class="data-screen">
    <!-- 顶部标题栏 -->
    <div class="header">
      <div class="title-container" @click="goToIndex">
        <h1 class="title">金属微丝线材质量监控大屏</h1>
        <div class="datetime">
          <div class="date">{{ currentDate }}</div>
          <div class="time">{{ currentTime }}</div>
        </div>
      </div>
      <!-- 刷新控制区域 - 样式重构 -->
      <div class="refresh-control-box">
        <div class="refresh-control-content">
          <el-button class="refresh-btn" @click="fetchData">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
          <div class="auto-refresh-control">
            <span class="control-label">自动刷新</span>
            <el-switch
                v-model="autoRefresh"
                active-color="#36a3f7"
                inactive-color="#5b7ba8"
            />
            <span class="refresh-timer" v-if="autoRefresh">
              下次刷新: {{ countdown }}秒
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="kpi-cards">
      <el-card shadow="hover" class="kpi-card">
        <div class="card-title">总检测数量</div>
        <div class="card-value">{{ overviewData.totalDetectionCount || 0 }}</div>
        <div class="card-trend">
          <span class="trend-up">↑ {{ overviewData.currentMonthCount || 0 }}</span>
          <span>本月检测</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="kpi-card">
        <div class="card-title">合格率</div>
        <div class="card-value">{{ overviewData.totalPassRate?.toFixed(2) || 0 }}%</div>
        <div class="card-trend">
          <span :class="trendClass(overviewData.totalPassRate, overviewData.currentMonthPassRate)">
            {{ trendIcon(overviewData.totalPassRate, overviewData.currentMonthPassRate) }}
            {{ overviewData.currentMonthPassRate?.toFixed(2) || 0 }}%
          </span>
          <span>本月合格率</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="kpi-card">
        <div class="card-title">设备总数</div>
        <div class="card-value">{{ overviewData.totalDeviceCount || 0 }}</div>
        <div class="card-trend">
          <span class="trend-neutral">在线: {{ onlineDevicesCount || 0 }}</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="kpi-card">
        <div class="card-title">应用场景</div>
        <div class="card-value">{{ overviewData.totalScenarioCount || 0 }}</div>
        <div class="card-trend">
          <span class="trend-up">本月使用: {{ scenarioTotalCount || 0 }}</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="kpi-card">
        <div class="card-title">不合格数量</div>
        <div class="card-value">{{ overviewData.totalFailCount || 0 }}</div>
        <div class="card-trend">
          <span :class="failRateTrendClass">
            {{ failRateTrendIcon }}
            {{ currentMonthFailRate?.toFixed(2) || 0 }}%
          </span>
          <span>本月不合格率</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="kpi-card">
        <div class="card-title">实时检测</div>
        <div class="card-value">{{ realtimeDetectionCount }}</div>
        <div class="card-trend">
          <span class="trend-up">↑ {{ realtimeDetectionIncrement }}</span>
          <span>近5分钟</span>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 月度合格率趋势 -->
      <el-card shadow="hover" class="chart-card">
        <div class="chart-title">月度合格率趋势</div>
        <div v-if="chartLoading.monthly" class="chart-loading">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span>图表加载中...</span>
        </div>
        <div v-else ref="monthlyChartRef" class="chart" style="height: 300px;"></div>
      </el-card>

      <!-- 应用场景分布 -->
      <el-card shadow="hover" class="chart-card">
        <div class="chart-title">应用场景分布 (本月)</div>
        <div v-if="chartLoading.scenario" class="chart-loading">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span>图表加载中...</span>
        </div>
        <div v-else ref="scenarioChartRef" class="chart" style="height: 300px;"></div>
      </el-card>

      <!-- 质量评估结果 -->
      <el-card shadow="hover" class="chart-card">
        <div class="chart-title">质量评估结果</div>
        <div v-if="chartLoading.quality" class="chart-loading">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span>图表加载中...</span>
        </div>
        <div v-else ref="qualityChartRef" class="chart" style="height: 300px;"></div>
      </el-card>
    </div>

    <!-- 底部表格 -->
    <div class="bottom-section">
      <el-card shadow="hover" class="table-card">
        <div class="chart-title">最新检测记录</div>
        <div class="auto-scroll-table">
          <el-table
              :data="latestDetections"
              height="250"
              style="width: 100%"
              class="dark-table"
              ref="detectionTable"
          >
            <!-- 表格列定义 -->
            <el-table-column prop="batchNumber" label="批次号" width="300" />
            <el-table-column prop="scenarioCode" label="应用场景" width="100" />
            <el-table-column prop="wireType" label="线材类型" width="150" align="center">
              <template #default="{ row }">
                <el-tag :type="wireTypeTag(getWireTypeName(row.batchNumber))">
                  {{ getWireTypeName(row.batchNumber) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="evaluationResult" label="评估结果" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="resultTag(row.evaluationResult)">
                  {{ formatResult(row.evaluationResult) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="diameter" label="直径(mm)" width="100" align="center" />
            <el-table-column prop="weight" label="重量(g)" width="100" align="center" />
            <el-table-column prop="extensibility" label="延展率(%)" width="100" align="center" />
            <el-table-column prop="resistance" label="电阻率" width="100" align="center" />
            <el-table-column prop="eventTime" label="检测时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.eventTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="deviceCode" label="设备" width="80" align="center" />
          </el-table>
        </div>
      </el-card>
    </div>

    <!-- 装饰元素 -->
    <div class="scan-line"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { Refresh, Loading } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const overviewData = ref({})
const monthlyData = ref([])
const scenarioData = ref([])
const latestDetections = ref([])
const onlineDevicesCount = ref(0)
const realtimeDetectionCount = ref(0)
const realtimeDetectionIncrement = ref(0)

// 图表加载状态
const chartLoading = ref({
  monthly: true,
  scenario: true,
  quality: true
})

// 时间相关
const currentDate = ref('')
const currentTime = ref('')
const autoRefresh = ref(true)
const countdown = ref(30)
let refreshTimer = null
let timeUpdateTimer = null
let scrollInterval = null

// 图表引用
const monthlyChartRef = ref(null)
const scenarioChartRef = ref(null)
const qualityChartRef = ref(null)
const detectionTable = ref(null)
let monthlyChart = null
let scenarioChart = null
let qualityChart = null

// 计算属性
const scenarioTotalCount = computed(() => {
  return scenarioData.value.reduce((sum, item) => sum + item.scenarioCount, 0)
})

const currentMonthFailRate = computed(() => {
  if (!overviewData.value.currentMonthCount) return 0
  return (overviewData.value.currentMonthFailCount / overviewData.value.currentMonthCount) * 100
})

const failRateTrendClass = computed(() => {
  if (currentMonthFailRate.value > (overviewData.value.totalFailRate || 0)) {
    return 'trend-up'
  } else if (currentMonthFailRate.value < (overviewData.value.totalFailRate || 0)) {
    return 'trend-down'
  }
  return 'trend-neutral'
})

const failRateTrendIcon = computed(() => {
  if (currentMonthFailRate.value > (overviewData.value.totalFailRate || 0)) {
    return '↑'
  } else if (currentMonthFailRate.value < (overviewData.value.totalFailRate || 0)) {
    return '↓'
  }
  return '→'
})

// 方法
const goToIndex = () => {
  router.push('/index')
}

const updateDateTime = () => {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 从批次号获取线材类型中文名
const getWireTypeName = (batchNumber) => {
  if (!batchNumber) return '未知'
  const prefix = batchNumber.substring(0, 2).toUpperCase()
  const typeMap = {
    'CU': '铜',
    'AL': '铝',
    'NI': '镍',
    'TI': '钛',
    'ZN': '锌'
  }
  return typeMap[prefix] || prefix
}

// 格式化日期时间（替换T为空格）
const formatDateTime = (datetime) => {
  if (!datetime) return ''
  return datetime.replace('T', ' ')
}

const fetchData = async () => {
  try {
    // 重置图表加载状态
    chartLoading.value = {
      monthly: true,
      scenario: true,
      quality: true
    }
    // 获取系统总体统计数据
    const overviewRes = await axios.get('/api/OverView/count', {
      headers: { Authorization: `Bearer ${authStore.user.token}` }
    })
    if (overviewRes.data.code === 'success') {
      overviewData.value = overviewRes.data.data
    }

    // 获取年度统计数据
    const yearlyRes = await axios.get('/api/OverView/year', {
      headers: { Authorization: `Bearer ${authStore.user.token}` }
    })
    if (yearlyRes.data.code === 'success') {
      monthlyData.value = yearlyRes.data.data.monthlyData || []
    }

    // 获取应用场景统计数据
    const scenarioRes = await axios.get('/api/OverView/scenario?how=this_month', {
      headers: { Authorization: `Bearer ${authStore.user.token}` }
    })
    if (scenarioRes.data.code === 'success') {
      scenarioData.value = scenarioRes.data.data.scenarioData || []
    }

    // 获取最新检测记录
    const detectionsRes = await axios.get('/api/wire-material/list?size=10&sortDirection=desc', {
      headers: { Authorization: `Bearer ${authStore.user.token}` }
    })
    if (detectionsRes.data.code === 'success') {
      latestDetections.value = detectionsRes.data.data.wireMaterials || []
    }

    // 获取设备状态
    const devicesRes = await axios.get('/api/device/list?status=ON', {
      headers: { Authorization: `Bearer ${authStore.user.token}` }
    })
    if (devicesRes.data.code === 'success') {
      onlineDevicesCount.value = devicesRes.data.data.totalElements || 0
    }

    // 模拟实时检测数据
    realtimeDetectionIncrement.value = Math.floor(Math.random() * 12) + 3
    realtimeDetectionCount.value += realtimeDetectionIncrement.value

    // 数据获取完成后初始化图表
    await nextTick(() => {
      renderMonthlyChart()
      renderScenarioChart()
      renderQualityChart()
    })

    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据获取失败: ' + error.message)
  }
}

const trendClass = (baseValue, currentValue) => {
  if (currentValue > baseValue) return 'trend-up'
  if (currentValue < baseValue) return 'trend-down'
  return 'trend-neutral'
}

const trendIcon = (baseValue, currentValue) => {
  if (currentValue > baseValue) return '↑'
  if (currentValue < baseValue) return '↓'
  return '→'
}

const wireTypeTag = (type) => {
  const types = {
    '铜': 'success',
    '铝': 'warning',
    '镍': 'danger',
    '钛': 'info',
    '锌': 'info'
  }
  return types[type] || ''
}

const resultTag = (result) => {
  const tags = {
    PASS: 'success',
    FAIL: 'danger',
    UNKNOWN: 'warning',
    PENDING_REVIEW: 'info'
  }
  return tags[result] || 'info'
}

const formatResult = (result) => {
  const names = {
    PASS: '合格',
    FAIL: '不合格',
    UNKNOWN: '未评估',
    PENDING_REVIEW: '待审核'
  }
  return names[result] || result
}

// 图表初始化方法 - 月度合格率趋势
const renderMonthlyChart = () => {
  if (!monthlyChartRef.value) return
  if (monthlyChart) monthlyChart.dispose()

  monthlyChart = echarts.init(monthlyChartRef.value)

  // 准备x轴数据 (月份)
  const months = monthlyData.value.map(item =>
      `${item.year}-${item.month.toString().padStart(2, '0')}`
  )

  // 准备y轴数据 (合格率)
  const passRates = monthlyData.value.map(item => item.passRate)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>合格率: {c}%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: {
        lineStyle: {
          color: '#5b7ba8'
        }
      },
      axisLabel: {
        color: '#a1b9e5',
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%',
        color: '#a1b9e5'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(91, 123, 168, 0.3)'
        }
      }
    },
    series: [{
      name: '合格率',
      type: 'line',
      data: passRates,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: '#36a3f7'
      },
      itemStyle: {
        color: '#36a3f7'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {offset: 0, color: 'rgba(54, 163, 247, 0.5)'},
          {offset: 1, color: 'rgba(54, 163, 247, 0.1)'}
        ])
      }
    }]
  }

  monthlyChart.setOption(option)
  window.addEventListener('resize', handleMonthlyResize)
  chartLoading.value.monthly = false
}

// 图表初始化方法 - 应用场景分布
const renderScenarioChart = () => {
  if (!scenarioChartRef.value) return
  if (scenarioChart) scenarioChart.dispose()

  scenarioChart = echarts.init(scenarioChartRef.value)

  // 准备饼图数据
  const data = scenarioData.value.map(item => ({
    value: item.scenarioCount,
    name: item.scenarioName,
    itemStyle: {
      color: getScenarioColor(item.scenarioCode)
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
      textStyle: {
        color: '#a1b9e5'
      }
    },
    series: [{
      name: '应用场景',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#0c1b35',
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
    }]
  }

  scenarioChart.setOption(option)
  window.addEventListener('resize', handleScenarioResize)
  chartLoading.value.scenario = false
}

// 图表初始化方法 - 质量评估结果
const renderQualityChart = () => {
  if (!qualityChartRef.value) return
  if (qualityChart) qualityChart.dispose()

  qualityChart = echarts.init(qualityChartRef.value)

  // 准备数据
  const passCount = overviewData.value.totalPassCount || 0
  const failCount = overviewData.value.totalFailCount || 0
  const unknownCount = (overviewData.value.totalDetectionCount || 0) - passCount - failCount

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: 10,
      textStyle: {
        color: '#a1b9e5'
      }
    },
    series: [{
      name: '质量评估',
      type: 'pie',
      radius: '50%',
      data: [
        { value: passCount, name: '合格', itemStyle: { color: '#67c23a' } },
        { value: failCount, name: '不合格', itemStyle: { color: '#f56c6c' } },
        { value: unknownCount, name: '未评估', itemStyle: { color: '#e6a23c' } }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }

  qualityChart.setOption(option)
  window.addEventListener('resize', handleQualityResize)
  chartLoading.value.quality = false
}

const getScenarioColor = (code) => {
  const colors = [
    '#36a3f7', '#f2637b', '#34c7a2', '#f7a35c', '#8d6e95',
    '#4bc0c0', '#ffcd56', '#c9cbcf', '#67e0e3', '#ff9f7f'
  ]
  const index = parseInt(code) % colors.length
  return colors[index]
}

// 图表resize处理
const handleMonthlyResize = () => {
  if (monthlyChart) monthlyChart.resize()
}

const handleScenarioResize = () => {
  if (scenarioChart) scenarioChart.resize()
}

const handleQualityResize = () => {
  if (qualityChart) qualityChart.resize()
}

// 生命周期钩子
onMounted(() => {
  updateDateTime()
  timeUpdateTimer = setInterval(updateDateTime, 1000)

  fetchData()

  // 设置自动刷新
  refreshTimer = setInterval(() => {
    if (autoRefresh.value) {
      if (countdown.value <= 1) {
        fetchData()
        countdown.value = 30
      } else {
        countdown.value--
      }
    }
  }, 1000)
})

onBeforeUnmount(() => {
  clearInterval(timeUpdateTimer)
  clearInterval(refreshTimer)
  clearInterval(scrollInterval)

  // 移除事件监听
  window.removeEventListener('resize', handleMonthlyResize)
  window.removeEventListener('resize', handleScenarioResize)
  window.removeEventListener('resize', handleQualityResize)

  // 销毁图表实例
  if (monthlyChart) monthlyChart.dispose()
  if (scenarioChart) scenarioChart.dispose()
  if (qualityChart) qualityChart.dispose()
})

// 表格自动滚动功能
const startTableScroll = () => {
  if (scrollInterval) clearInterval(scrollInterval)

  const tableWrapper = detectionTable.value?.$el?.querySelector('.el-table__body-wrapper')
  if (!tableWrapper) return

  // 重置滚动位置
  tableWrapper.scrollTop = 0

  // 禁用用户滚动
  tableWrapper.addEventListener('wheel', preventScroll, {passive: false})

  scrollInterval = setInterval(() => {
    const scrollHeight = tableWrapper.scrollHeight
    const clientHeight = tableWrapper.clientHeight
    const maxScroll = scrollHeight - clientHeight

    if (tableWrapper.scrollTop >= maxScroll - 2) {
      tableWrapper.scrollTop = 0
    } else {
      tableWrapper.scrollTop += 1
    }
  }, 50)
}

// 阻止用户手动滚动
const preventScroll = (e) => {
  e.preventDefault()
}
</script>

<style scoped>
.data-screen {
  position: relative;
  height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #0c1b35 0%, #0a1429 100%);
  color: #e1e9f7;
  font-family: 'Microsoft YaHei', sans-serif;
  overflow: auto;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(54, 163, 247, 0.3);
}

.title-container {
  cursor: pointer;
  transition: all 0.3s ease;
}

.title-container:hover {
  transform: translateY(-2px);
}

.title {
  font-size: 28px;
  margin: 0;
  background: linear-gradient(90deg, #36a3f7, #34c7a2);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(54, 163, 247, 0.3);
}

.datetime {
  display: flex;
  gap: 15px;
  margin-top: 8px;
  font-size: 16px;
  color: #a1b9e5;
}

.date, .time {
  display: flex;
  align-items: center;
}

.date::before, .time::before {
  content: '';
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 8px;
  border-radius: 50%;
  background: #36a3f7;
  box-shadow: 0 0 8px #36a3f7;
}

.refresh-control {
  display: flex;
  align-items: center;
  gap: 15px;
}

.refresh-timer {
  color: #a1b9e5;
  font-size: 14px;
}

.kpi-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.kpi-card {
  background: rgba(16, 36, 70, 0.6);
  border: 1px solid rgba(54, 163, 247, 0.2);
  border-radius: 8px;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.kpi-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  border-color: rgba(54, 163, 247, 0.5);
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #36a3f7, #34c7a2);
}

.card-title {
  font-size: 16px;
  color: #a1b9e5;
  margin-bottom: 15px;
}

.card-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
  background: linear-gradient(90deg, #e1e9f7, #a1b9e5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.card-trend {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #a1b9e5;
}

.card-trend span:first-child {
  margin-right: 10px;
  padding: 3px 8px;
  border-radius: 4px;
}

.trend-up {
  color: #34c7a2;
  background: rgba(52, 199, 162, 0.1);
}

.trend-down {
  color: #f2637b;
  background: rgba(242, 99, 123, 0.1);
}

.trend-neutral {
  color: #a1b9e5;
  background: rgba(161, 185, 229, 0.1);
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  background: rgba(16, 36, 70, 0.6);
  border: 1px solid rgba(54, 163, 247, 0.2);
  border-radius: 8px;
  height: 380px;
  overflow: hidden;
}

.chart-title {
  padding: 15px;
  font-size: 16px;
  font-weight: bold;
  color: #36a3f7;
  border-bottom: 1px solid rgba(54, 163, 247, 0.2);
}

.chart {
  height: calc(100% - 50px);
  width: 100%;
}

.bottom-section {
  margin-bottom: 20px;
}

.table-card {
  background: rgba(16, 36, 70, 0.6);
  border: 1px solid rgba(54, 163, 247, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

/* 装饰元素 */
.decoration-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border-width: 3px;
  border-style: solid;
  border-color: #36a3f7;
  z-index: 10;
}

.top-left {
  top: 15px;
  left: 15px;
  border-right: none;
  border-bottom: none;
}

.top-right {
  top: 15px;
  right: 15px;
  border-left: none;
  border-bottom: none;
}

.bottom-left {
  bottom: 15px;
  left: 15px;
  border-right: none;
  border-top: none;
}

.bottom-right {
  bottom: 15px;
  right: 15px;
  border-left: none;
  border-top: none;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #36a3f7, transparent);
  box-shadow: 0 0 15px 2px rgba(54, 163, 247, 0.8);
  animation: scan 8s linear infinite;
  z-index: 5;
}

@keyframes scan {
  0% {
    top: 0;
  }
  50% {
    top: 100%;
  }
  100% {
    top: 0;
  }
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .kpi-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .kpi-cards {
    grid-template-columns: 1fr;
  }

  .charts-container {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .refresh-control {
    width: 100%;
    justify-content: space-between;
  }
}


.refresh-control-box {
  background: rgba(16, 36, 70, 0.8);
  border: 1px solid rgba(54, 163, 247, 0.3);
  border-radius: 8px;
  padding: 10px 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.refresh-control-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.refresh-btn {
  background: linear-gradient(135deg, #36a3f7, #1a5ca3);
  border: none;
  border-radius: 4px;
  color: #e1e9f7;
  padding: 8px 15px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(54, 163, 247, 0.3);
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(54, 163, 247, 0.5);
  background: linear-gradient(135deg, #4ab0ff, #2170c4);
}

.refresh-btn:active {
  transform: translateY(1px);
}

.auto-refresh-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-label {
  color: #a1b9e5;
  font-size: 14px;
}

.refresh-timer {
  color: #36a3f7;
  font-size: 14px;
  font-weight: 500;
}

/* 图表加载状态 */
.chart-loading {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #a1b9e5;
}

.loading-icon {
  font-size: 32px;
  margin-bottom: 10px;
  color: #36a3f7;
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

/* 表格区域样式优化 */
.auto-scroll-table {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

/* 深色主题表格 */
:deep(.dark-table) {
  --el-table-header-bg-color: rgba(16, 36, 70, 0.8);
  --el-table-tr-bg-color: rgba(16, 36, 70, 0.6);
  --el-table-border-color: rgba(54, 163, 247, 0.2);
  --el-table-text-color: #e1e9f7;
  --el-table-header-text-color: #a1b9e5;
  --el-table-row-hover-bg-color: rgba(54, 163, 247, 0.1);
}

/* 隐藏原生滚动条 */
:deep(.dark-table .el-table__body-wrapper)::-webkit-scrollbar {
  display: none;
}

:deep(.dark-table .el-table__body-wrapper) {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

/* 表头样式 */
:deep(.dark-table .el-table__header th) {
  background: linear-gradient(rgba(54, 163, 247, 0.3), rgba(16, 36, 70, 0.8));
  font-weight: 600;
}

/* 单元格样式 */
:deep(.dark-table .el-table__cell) {
  padding: 8px 0;
  border-bottom: 1px solid rgba(54, 163, 247, 0.1);
}

/* 行悬停效果 */
:deep(.dark-table .el-table__body tr:hover > td) {
  background-color: rgba(54, 163, 247, 0.15) !important;
}

/* 斑马纹效果 */
:deep(.dark-table .el-table__row--striped) {
  background: rgba(25, 55, 100, 0.4);
}

/* 标签样式 */
:deep(.dark-table .el-tag) {
  border: none;
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .kpi-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .kpi-cards {
    grid-template-columns: 1fr;
  }

  .charts-container {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .refresh-control-content {
    width: 100%;
    flex-direction: column;
    gap: 10px;
  }

  .auto-refresh-control {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
