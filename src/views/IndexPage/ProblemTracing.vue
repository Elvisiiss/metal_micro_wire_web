<template>
  <div class="problem-tracing">
    <!-- 页面标题区域 -->
    <div class="page-header-custom">
      <div class="header-content">
        <span class="page-title">质量问题溯源</span>
        <span class="page-subtitle">多维度的质量问题分析和追踪功能</span>
      </div>
      <div class="header-stats" v-if="activeTab === 'analysis' && analysisResult">
        <el-tag type="info">
          问题维度: {{ analysisResult.overallStatistics.problematicDimensions }}
        </el-tag>
        <el-tag type="success">
          合格率: {{ analysisResult.overallStatistics.overallPassRate.toFixed(1) }}%
        </el-tag>
      </div>
    </div>

    <!-- 标签页导航 -->
    <el-tabs v-model="activeTab" class="tabs-container">
      <!-- 质量溯源分析标签页 -->
      <el-tab-pane label="质量溯源分析" name="analysis">
        <el-card class="search-card">
          <el-form :model="queryForm" :inline="true" class="search-form">
            <el-form-item label="分析维度">
              <el-select v-model="queryForm.dimension" placeholder="请选择分析维度">
                <el-option label="生产商" value="MANUFACTURER" />
                <el-option label="负责人" value="RESPONSIBLE_PERSON" />
                <el-option label="工艺类型" value="PROCESS_TYPE" />
                <el-option label="生产机器" value="PRODUCTION_MACHINE" />
              </el-select>
            </el-form-item>

            <el-form-item label="时间范围">
              <el-date-picker
                  v-model="dateRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DDTHH:mm:ss"
              />
            </el-form-item>

            <el-form-item label="应用场景">
              <el-input v-model="queryForm.scenarioCode" placeholder="应用场景编号" />
            </el-form-item>

            <el-form-item label="不合格率阈值">
              <el-input-number
                  v-model="queryForm.failRateThreshold"
                  :min="0"
                  :max="100"
                  :precision="1"
                  controls-position="right"
              />
              <span style="margin-left: 8px;">%</span>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="performAnalysis" :loading="loading">
                开始分析
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 分析结果 -->
        <div v-if="analysisResult" class="result-section">
          <!-- 总体统计 -->
          <el-card class="statistics-card">
            <h4>总体统计</h4>
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-value">{{ analysisResult.overallStatistics.totalDimensions }}</div>
                  <div class="stat-label">总维度数</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-value problem">{{ analysisResult.overallStatistics.problematicDimensions }}</div>
                  <div class="stat-label">问题维度数</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-value">{{ analysisResult.overallStatistics.totalBatches }}</div>
                  <div class="stat-label">总批次数</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-value success">{{ analysisResult.overallStatistics.overallPassRate.toFixed(1) }}%</div>
                  <div class="stat-label">总体合格率</div>
                </div>
              </el-col>
            </el-row>
          </el-card>

          <!-- 质量问题列表 -->
          <el-card v-if="analysisResult.qualityIssues.length > 0" class="issues-card">
            <div class="card-header">
              <h4>质量问题 ({{ analysisResult.qualityIssues.length }})</h4>
              <el-button
                  type="warning"
                  @click="sendNotification(analysisResult.qualityIssues)"
                  :loading="batchNotifying"
              >
                批量发送通知
              </el-button>
            </div>
            <el-table :data="analysisResult.qualityIssues" style="width: 100%">
              <el-table-column prop="dimensionValue" label="对象" />
              <el-table-column prop="severity" label="严重程度">
                <template #default="{ row }">
                  <el-tag :type="getSeverityType(row.severity)">
                    {{ getSeverityLabel(row.severity) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="failRate" label="不合格率">
                <template #default="{ row }">
                  {{ row.failRate.toFixed(1) }}%
                </template>
              </el-table-column>
              <el-table-column prop="failCount" label="不合格/总数">
                <template #default="{ row }">
                  {{ row.failCount }}/{{ row.totalCount }}
                </template>
              </el-table-column>
              <el-table-column prop="description" label="问题描述" />
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-button size="small" @click="viewBatchDetails(row)">
                    查看批次
                  </el-button>
                  <el-button
                      size="small"
                      :type="row.notified ? 'info' : 'warning'"
                      @click="sendNotification([row], row)"
                      :loading="notifyingIssues[row.dimensionValue]"
                  >
                    {{ row.notified ? '再次发送' : '发送通知' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>

          <!-- 详细统计图表 -->
          <el-card class="chart-card">
            <h4>质量统计图表</h4>
            <div ref="chartContainer" style="height: 400px;"></div>
          </el-card>
        </div>

        <!-- 批次详情对话框 -->
        <el-dialog v-model="batchDialogVisible" title="问题批次详情" width="80%">
          <el-table :data="currentBatchDetails" style="width: 100%">
            <el-table-column prop="batchNumber" label="批次号" />
            <el-table-column label="生产信息" min-width="200">
              <template #default="{ row }">
                <div class="production-info">
                  <div><span class="info-label">生产商:</span> {{ row.manufacturer }}</div>
                  <div><span class="info-label">负责人:</span> {{ row.responsiblePerson }}</div>
                  <div><span class="info-label">联系邮箱:</span> {{ row.contactEmail }}</div>
                  <div><span class="info-label">工艺类型:</span> {{ row.processType }}</div>
                  <div><span class="info-label">生产机器:</span> {{ row.productionMachine }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="质量指标">
              <template #default="{ row }">
                <div v-if="row.qualityMetrics">
                  <div>直径: {{ formatNumber(row.qualityMetrics.diameter, 'diameter') }} mm</div>
                  <div>电阻: {{ formatNumber(row.qualityMetrics.resistance, 'conductivity') }} MS/m</div>
                  <div>延展率: {{ formatNumber(row.qualityMetrics.extensibility, 'extensibility') }} δ</div>
                  <div>重量: {{ formatNumber(row.qualityMetrics.weight, 'weight') }} g</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="生产时间" width="180">
              <template #default="{ row }">
                <div class="time-cell">
                  <div>{{ formatDate(row.eventTime).date }}</div>
                  <div>{{ formatDate(row.eventTime).time }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="evaluationMessage" label="评估信息" width="200" />
            <el-table-column prop="finalEvaluationResult" label="最终评估">
              <template #default="{ row }">
                <el-tag :type="row.finalEvaluationResult === '合格' ? 'success' : 'danger'">
                  {{ row.finalEvaluationResult }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-dialog>
      </el-tab-pane>

      <!-- 质量排名与分析标签页 -->
      <el-tab-pane label="质量排名与分析" name="ranking">
        <el-row :gutter="20" class="ranking-controls">
          <el-col :span="6">
            <el-select v-model="rankingType" placeholder="请选择排名类型">
              <el-option label="生产商质量排名" value="manufacturers" />
              <el-option label="负责人绩效排名" value="responsible-persons" />
              <el-option label="工艺类型质量排名" value="process-types" />
              <el-option label="生产机器质量排名" value="production-machines" />
            </el-select>
          </el-col>
          <el-col :span="12">
            <el-date-picker
                v-model="rankingDateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DDTHH:mm:ss"
            />
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="fetchRankingData">查询</el-button>
          </el-col>
        </el-row>

        <el-card class="ranking-card">
          <h4>{{ getRankingTitle() }}</h4>
          <el-table
              :data="rankingData"
              v-loading="rankingLoading"
              style="width: 100%"
              @sort-change="handleRankingSortChange"
          >
            <el-table-column prop="dimensionValue" label="名称"  />
            <el-table-column prop="contactEmail" label="联系人邮箱" />
            <el-table-column prop="totalCount" label="总批次" sortable="custom" />
            <el-table-column prop="passCount" label="合格批次" sortable="custom" />
            <el-table-column prop="failCount" label="不合格批次" sortable="custom" />
            <el-table-column prop="passRate" label="合格率" sortable="custom">
              <template #default="{ row }">
                {{ row.passRate.toFixed(1) }}%
              </template>
            </el-table-column>
            <el-table-column prop="failRate" label="不合格率" sortable="custom">
              <template #default="{ row }">
                {{ row.failRate.toFixed(1) }}%
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 质量问题检测标签页 -->
      <el-tab-pane label="质量问题检测" name="detection">
        <el-row :gutter="20" class="detection-controls">
          <el-col :span="8">
            <el-card>
              <h4>全量历史数据分析</h4>
              <p class="description-text">分析所有历史数据</p>
              <el-button type="primary" @click="analyzeAllIssues" :loading="fullAnalysisLoading">
                {{ fullAnalysisLoading ? '分析中...' : '执行全量分析' }}
              </el-button>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card>
              <h4>时间窗口分析</h4>
              <el-date-picker
                  v-model="detectionDateRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DDTHH:mm:ss"
              />
              <div style="margin-top: 10px;">
                <el-button
                    type="primary"
                    @click="analyzeTimeWindowIssues"
                    :loading="timeWindowAnalysisLoading"
                >
                  {{ timeWindowAnalysisLoading ? '分析中...' : '执行时间窗口分析' }}
                </el-button>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card>
              <h4>自动检测与通知</h4>
              <p class="description-text">默认时间窗口检测最近7天数据</p>

              <div style="margin-top: 10px; margin-bottom: 10px;">
                <el-date-picker
                    v-model="autoDetectDateRange"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DDTHH:mm:ss"
                />
              </div>

              <el-button
                  type="success"
                  @click="autoDetectDefault"
                  :loading="autoDetectLoading"
                  style="margin-right: 10px;"
              >
                {{ autoDetectLoading ? '检测中...' : '执行默认时间窗口检测' }}
              </el-button>

              <el-button
                  type="warning"
                  @click="analyzeTimeWindowAndNotify"
                  :loading="timeWindowNotifyLoading"
              >
                {{ timeWindowNotifyLoading ? '检测并发送中...' : '分析并发送通知' }}
              </el-button>

              <div v-if="autoDetectResult" class="auto-detect-result">
                <p>{{ autoDetectResult }}</p>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 检测结果 -->
        <div v-if="detectionResult" class="detection-results-container">
          <!-- 问题详情展示 -->
          <div class="detection-details">
            <el-card class="detection-summary">
              <h4>问题概览</h4>
              <div class="summary-stats">
                <el-row :gutter="20">
                  <el-col :span="6">
                    <div class="stat-item">
                      <div class="stat-value">{{ detectionResult.data.length }}</div>
                      <div class="stat-label">问题总数</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-item">
                      <div class="stat-value">
                        {{ criticalIssuesCount }}
                      </div>
                      <div class="stat-label">严重问题</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-item">
                      <div class="stat-value">
                        {{ highIssuesCount }}
                      </div>
                      <div class="stat-label">高风险问题</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-item">
                      <div class="stat-value">
                        {{ notifiedIssuesCount }}
                      </div>
                      <div class="stat-label">已通知问题</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </el-card>

            <el-card class="detection-issues">
              <div class="card-header">
                <h4>质量问题详情 ({{ detectionResult.data.length }})</h4>
                <el-button
                    type="warning"
                    @click="sendNotificationForDetection(detectionResult.data)"
                    :loading="batchNotifyingDetection"
                >
                  批量发送通知
                </el-button>
              </div>

              <el-table :data="detectionResult.data" style="width: 100%">
                <el-table-column prop="dimensionValue" label="对象" />
                <el-table-column prop="dimension" label="维度" />
                <el-table-column prop="severity" label="严重程度">
                  <template #default="{ row }">
                    <el-tag :type="getSeverityType(row.severity)">
                      {{ getSeverityLabel(row.severity) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="failRate" label="不合格率">
                  <template #default="{ row }">
                    {{ row.failRate.toFixed(1) }}%
                  </template>
                </el-table-column>
                <el-table-column prop="failCount" label="不合格/总数">
                  <template #default="{ row }">
                    {{ row.failCount }}/{{ row.totalCount }}
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="问题描述" />
                <el-table-column label="操作" width="200">
                  <template #default="{ row }">
                    <el-button
                        size="small"
                        :type="row.notified ? 'info' : 'warning'"
                        @click="sendNotificationForDetection([row], row)"
                        :loading="notifyingDetectionIssues[row.issueId]"
                    >
                      {{ row.notified ? '再次发送' : '发送通知' }}
                    </el-button>
                    <el-button size="small" @click="viewIssueDetails(row)">
                      查看详情
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
        </div>
      </el-tab-pane>

      <!-- 自定义通知标签页 -->
      <el-tab-pane label="自定义通知" name="notification">
        <el-card class="notification-card">
          <h4>发送自定义邮件通知</h4>
          <el-form :model="notificationForm" label-width="100px">
            <el-form-item label="收件人" required>
              <el-input
                  v-model="notificationForm.recipients"
                  placeholder="请输入邮箱地址（多个邮箱用逗号分隔）"
                  style="width: 100%;"
              />
            </el-form-item>
            <el-form-item label="邮件主题" required>
              <el-input v-model="notificationForm.subject" placeholder="请输入邮件主题" />
            </el-form-item>
            <el-form-item label="邮件内容" required>
              <el-input
                  v-model="notificationForm.content"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入邮件内容"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="sendCustomNotification" :loading="notificationLoading">
                发送邮件
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 问题详情对话框 -->
    <el-dialog v-model="issueDialogVisible" title="问题详情" width="600px">
      <el-descriptions :column="1" border v-if="currentIssue">
        <el-descriptions-item label="问题ID">{{ currentIssue.issueId }}</el-descriptions-item>
        <el-descriptions-item label="维度">{{ currentIssue.dimension }}</el-descriptions-item>
        <el-descriptions-item label="对象">{{ currentIssue.dimensionValue }}</el-descriptions-item>
        <el-descriptions-item label="严重程度">
          <el-tag :type="getSeverityType(currentIssue.severity)">
            {{ getSeverityLabel(currentIssue.severity) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="不合格率">{{ currentIssue.failRate.toFixed(1) }}%</el-descriptions-item>
        <el-descriptions-item label="不合格/总数">{{ currentIssue.failCount }}/{{ currentIssue.totalCount }}</el-descriptions-item>
        <el-descriptions-item label="问题描述">{{ currentIssue.description }}</el-descriptions-item>
        <el-descriptions-item label="建议措施">{{ currentIssue.recommendation }}</el-descriptions-item>
        <el-descriptions-item label="联系人邮箱">{{ currentIssue.contactEmail }}</el-descriptions-item>
        <el-descriptions-item label="发现时间">{{ formatDateTime(currentIssue.discoveredTime) }}</el-descriptions-item>
        <el-descriptions-item label="通知状态">
          <el-tag :type="currentIssue.notified ? 'success' : 'info'">
            {{ currentIssue.notified ? '已通知' : '未通知' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import traceabilityAPI from '@/api/ProblemTracing.js'

// 响应式数据
const activeTab = ref('analysis')
const loading = ref(false)
const analysisResult = ref(null)
const dateRange = ref([])
const chart = ref(null)
const rankingType = ref('manufacturers')
const rankingDateRange = ref([])
const rankingData = ref([])
const rankingLoading = ref(false)
const fullAnalysisLoading = ref(false)
const timeWindowAnalysisLoading = ref(false)
const timeWindowNotifyLoading = ref(false)
const autoDetectLoading = ref(false)
const detectionDateRange = ref([])
const autoDetectDateRange = ref([])
const detectionResult = ref(null)
const autoDetectResult = ref(null)
const notificationLoading = ref(false)
const batchDialogVisible = ref(false)
const issueDialogVisible = ref(false)
const currentBatchDetails = ref([])
const currentIssue = ref(null)
const notifyingIssues = ref({})
const notifyingDetectionIssues = ref({})
const batchNotifying = ref(false)
const batchNotifyingDetection = ref(false)

// 查询表单
const queryForm = reactive({
  dimension: 'MANUFACTURER',
  scenarioCode: '',
  failRateThreshold: 5.0,
  onlyProblematic: false,
  page: 1,
  size: 20
})

// 通知表单
const notificationForm = reactive({
  recipients: '',
  subject: '',
  content: ''
})

// 计算属性：严重问题数量
const criticalIssuesCount = computed(() => {
  if (!detectionResult.value || !Array.isArray(detectionResult.value.data)) return 0
  return detectionResult.value.data.filter(issue =>
      issue.severity === 'CRITICAL' || issue.severity === 'HIGH'
  ).length
})

// 计算属性：高风险问题数量
const highIssuesCount = computed(() => {
  if (!detectionResult.value || !Array.isArray(detectionResult.value.data)) return 0
  return detectionResult.value.data.filter(issue =>
      issue.severity === 'HIGH'
  ).length
})

// 计算属性：已通知问题数量
const notifiedIssuesCount = computed(() => {
  if (!detectionResult.value || !Array.isArray(detectionResult.value.data)) return 0
  return detectionResult.value.data.filter(issue => issue.notified).length
})

// 执行溯源分析
const performAnalysis = async () => {
  try {
    loading.value = true

    const params = {
      ...queryForm,
      startTime: dateRange.value?.[0],
      endTime: dateRange.value?.[1]
    }

    const response = await traceabilityAPI.performAnalysis(params)

    if (response.code === 'success') {
      analysisResult.value = response.data
      // 渲染图表
      await nextTick()
      renderChart()
      ElMessage.success('溯源分析完成')
    } else {
      ElMessage.error(response.msg || '溯源分析失败')
    }
  } catch (error) {
    ElMessage.error('溯源分析失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 渲染图表
const renderChart = () => {
  if (!analysisResult.value || !analysisResult.value.detailStatistics) return

  const chartContainer = document.querySelector('.chart-card .el-card__body > div')
  if (!chartContainer) return

  // 销毁旧图表
  if (chart.value) {
    chart.value.dispose()
  }

  // 创建新图表
  chart.value = echarts.init(chartContainer)

  const statistics = analysisResult.value.detailStatistics
  const xData = statistics.map(item => item.dimensionValue)
  const passRateData = statistics.map(item => item.passRate)
  const failRateData = statistics.map(item => item.failRate)

  const option = {
    title: {
      text: `${getDimensionLabel()}质量统计`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['合格率', '不合格率'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '百分比 (%)',
      min: 0,
      max: 100
    },
    series: [
      {
        name: '合格率',
        type: 'bar',
        data: passRateData,
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '不合格率',
        type: 'bar',
        data: failRateData,
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ]
  }

  chart.value.setOption(option)
}

// 获取维度标签
const getDimensionLabel = () => {
  const labels = {
    MANUFACTURER: '生产商',
    RESPONSIBLE_PERSON: '负责人',
    PROCESS_TYPE: '工艺类型',
    PRODUCTION_MACHINE: '生产机器'
  }
  return labels[queryForm.dimension] || '对象'
}

// 获取严重程度类型
const getSeverityType = (severity) => {
  const types = {
    CRITICAL: 'danger',
    HIGH: 'warning',
    MEDIUM: 'info',
    LOW: 'success'
  }
  return types[severity] || 'info'
}

// 获取严重程度标签
const getSeverityLabel = (severity) => {
  const labels = {
    CRITICAL: '严重',
    HIGH: '高风险',
    MEDIUM: '中等',
    LOW: '低风险'
  }
  return labels[severity] || '未知'
}

// 查看批次详情
const viewBatchDetails = async (issue) => {
  try {
    const params = {
      dimension: queryForm.dimension,
      dimensionValue: issue.dimensionValue,
      startTime: dateRange.value?.[0],
      endTime: dateRange.value?.[1]
    }

    const response = await traceabilityAPI.getProblematicBatches(
        params.dimension,
        params.dimensionValue,
        params.startTime,
        params.endTime
    )

    if (response.code === 'success' && response.data) {
      currentBatchDetails.value = response.data
      batchDialogVisible.value = true
    } else {
      ElMessage.error(response.msg || '获取批次详情失败')
    }
  } catch (error) {
    ElMessage.error('获取批次详情失败: ' + error.message)
  }
}

// 发送通知
const sendNotification = async (issues, issue) => {
  try {
    // 设置发送状态
    if (issue) {
      notifyingIssues.value[issue.dimensionValue] = true
    } else {
      batchNotifying.value = true
    }

    const response = await traceabilityAPI.sendNotifications(issues)

    if (response.code === 'success') {
      // 更新通知状态
      issues.forEach(issue => {
        issue.notified = true
      })
      ElMessage.success('通知发送成功')
    } else {
      ElMessage.error(response.msg || '通知发送失败')
    }
  } catch (error) {
    ElMessage.error('通知发送失败: ' + error.message)
  } finally {
    if (issue) {
      notifyingIssues.value[issue.dimensionValue] = false
    } else {
      batchNotifying.value = false
    }
  }
}

// 重置表单
const resetForm = () => {
  queryForm.dimension = 'MANUFACTURER'
  queryForm.scenarioCode = ''
  queryForm.failRateThreshold = 5.0
  queryForm.onlyProblematic = false
  dateRange.value = []
  analysisResult.value = null

  if (chart.value) {
    chart.value.dispose()
    chart.value = null
  }
}

// 获取排名数据
const fetchRankingData = async () => {
  try {
    rankingLoading.value = true
    const [startTime, endTime] = rankingDateRange.value || [null, null]

    let response;
    switch (rankingType.value) {
      case 'manufacturers':
        response = await traceabilityAPI.getManufacturerRanking(startTime, endTime)
        break
      case 'responsible-persons':
        response = await traceabilityAPI.getResponsiblePersonRanking(startTime, endTime)
        break
      case 'process-types':
        response = await traceabilityAPI.getProcessTypeAnalysis(startTime, endTime)
        break
      case 'production-machines':
        response = await traceabilityAPI.getProductionMachineAnalysis(startTime, endTime)
        break
      default:
        return
    }

    if (response.code === 'success') {
      rankingData.value = response.data || []
      ElMessage.success('获取排名数据成功')
    } else {
      ElMessage.error(response.msg || '获取排名数据失败')
    }
  } catch (error) {
    ElMessage.error('获取排名数据失败: ' + error.message)
  } finally {
    rankingLoading.value = false
  }
}

// 处理排名排序
const handleRankingSortChange = ({ prop, order }) => {
  if (!prop || !order) return

  rankingData.value.sort((a, b) => {
    let valueA = a[prop]
    let valueB = b[prop]

    // 处理合格率/不合格率的特殊排序
    if (prop === 'passRate' || prop === 'failRate') {
      valueA = parseFloat(valueA)
      valueB = parseFloat(valueB)
    }

    if (order === 'ascending') {
      return valueA - valueB
    } else {
      return valueB - valueA
    }
  })
}

// 获取排名标题
const getRankingTitle = () => {
  const titles = {
    'manufacturers': '生产商质量排名',
    'responsible-persons': '负责人绩效排名',
    'process-types': '工艺类型质量分析',
    'production-machines': '生产机器质量分析'
  }
  return titles[rankingType.value] || '质量排名'
}

// 全量分析问题
const analyzeAllIssues = async () => {
  try {
    fullAnalysisLoading.value = true
    detectionResult.value = null

    const response = await traceabilityAPI.analyzeAllQualityIssues()

    if (response.code === 'success') {
      detectionResult.value = response
      ElMessage.success('全量分析完成')
    } else {
      ElMessage.error(response.msg || '全量分析失败')
    }
  } catch (error) {
    ElMessage.error('全量分析失败: ' + error.message)
  } finally {
    fullAnalysisLoading.value = false
  }
}

// 时间窗口分析
const analyzeTimeWindowIssues = async () => {
  try {
    if (!detectionDateRange.value || detectionDateRange.value.length !== 2) {
      ElMessage.error('请选择完整的时间范围')
      return
    }

    timeWindowAnalysisLoading.value = true
    detectionResult.value = null

    const [startTime, endTime] = detectionDateRange.value
    const response = await traceabilityAPI.analyzeQualityIssuesByTimeWindow(startTime, endTime)

    if (response.code === 'success') {
      detectionResult.value = response
      ElMessage.success('时间窗口分析完成')
    } else {
      ElMessage.error(response.msg || '时间窗口分析失败')
    }
  } catch (error) {
    ElMessage.error('时间窗口分析失败: ' + error.message)
  } finally {
    timeWindowAnalysisLoading.value = false
  }
}

// 时间窗口分析并发送通知
const analyzeTimeWindowAndNotify = async () => {
  try {
    if (!autoDetectDateRange.value || autoDetectDateRange.value.length !== 2) {
      ElMessage.error('请选择完整的时间范围')
      return
    }

    timeWindowNotifyLoading.value = true
    autoDetectResult.value = '检测并发送通知中...'

    const [startTime, endTime] = autoDetectDateRange.value
    const response = await traceabilityAPI.autoDetectAndNotifyQualityIssuesWithTimeWindow(startTime, endTime)

    if (response.code === 'success') {
      autoDetectResult.value = response.msg || '时间窗口分析完成，通知已发送'
      ElMessage.success('时间窗口分析完成，通知已发送')
    } else {
      autoDetectResult.value = response.msg || '时间窗口分析失败'
      ElMessage.error(response.msg || '时间窗口分析失败')
    }
  } catch (error) {
    autoDetectResult.value = '时间窗口分析失败: ' + error.message
    ElMessage.error('时间窗口分析失败: ' + error.message)
  } finally {
    timeWindowNotifyLoading.value = false
  }
}

// 自动检测（默认时间窗口）
const autoDetectDefault = async () => {
  try {
    autoDetectLoading.value = true
    autoDetectResult.value = '检测中...'

    const response = await traceabilityAPI.autoDetectAndNotifyQualityIssues()

    if (response.code === 'success') {
      autoDetectResult.value = response.msg || '自动检测完成'
      ElMessage.success('自动检测完成')
    } else {
      autoDetectResult.value = response.msg || '自动检测失败'
      ElMessage.error(response.msg || '自动检测失败')
    }
  } catch (error) {
    autoDetectResult.value = '自动检测失败: ' + error.message
    ElMessage.error('自动检测失败: ' + error.message)
  } finally {
    autoDetectLoading.value = false
  }
}

// 发送自定义通知
const sendCustomNotification = async () => {
  try {
    if (!notificationForm.recipients) {
      ElMessage.error('请至少输入一个收件人')
      return
    }

    if (!notificationForm.subject || !notificationForm.content) {
      ElMessage.error('请填写邮件主题和内容')
      return
    }

    notificationLoading.value = true

    // 将收件人字符串分割为数组
    const recipientsArray = notificationForm.recipients
        .split(',')
        .map(email => email.trim())
        .filter(email => email !== '')

    if (recipientsArray.length === 0) {
      ElMessage.error('请至少输入一个有效的邮箱地址')
      return
    }

    const response = await traceabilityAPI.sendCustomNotification(
        recipientsArray,
        notificationForm.subject,
        notificationForm.content
    )

    if (response.code === 'success') {
      ElMessage.success('自定义邮件发送成功')
      // 清空表单
      notificationForm.recipients = ''
      notificationForm.subject = ''
      notificationForm.content = ''
    } else {
      ElMessage.error(response.msg || '自定义邮件发送失败')
    }
  } catch (error) {
    ElMessage.error('自定义邮件发送失败: ' + error.message)
  } finally {
    notificationLoading.value = false
  }
}

// 发送检测结果通知
const sendNotificationForDetection = async (issues, issue) => {
  try {
    // 设置发送状态
    if (issue) {
      notifyingDetectionIssues.value[issue.issueId] = true
    } else {
      batchNotifyingDetection.value = true
    }

    const response = await traceabilityAPI.sendNotifications(issues)

    if (response.code === 'success') {
      // 更新通知状态
      issues.forEach(issue => {
        issue.notified = true
      })
      ElMessage.success('通知发送成功')
    } else {
      ElMessage.error(response.msg || '通知发送失败')
    }
  } catch (error) {
    ElMessage.error('通知发送失败: ' + error.message)
  } finally {
    if (issue) {
      notifyingDetectionIssues.value[issue.issueId] = false
    } else {
      batchNotifyingDetection.value = false
    }
  }
}

// 查看问题详情
const viewIssueDetails = (issue) => {
  currentIssue.value = issue
  issueDialogVisible.value = true
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// 数值格式化函数
const formatNumber = (value, type = 'default') => {
  if (value === null || value === undefined || value === '') return '';

  const num = parseFloat(value);
  if (isNaN(num)) return '';

  switch (type) {
    case 'diameter':
    case 'weight':
    case 'conductivity':
      return num.toFixed(2);
    case 'extensibility':
      return num.toFixed(1);
    default:
      return num.toString();
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return { date: '', time: '' };

  try {
    const dateObj = new Date(dateString);
    const date = dateObj.toISOString().split('T')[0];
    const time = dateObj.toTimeString().split(' ')[0];
    return { date, time };
  } catch (e) {
    console.error('日期格式化错误:', e);
    const [date, timePart] = dateString.split('T');
    const time = timePart ? timePart.substring(0, 8) : '';
    return { date, time };
  }
};
</script>

<style scoped>
.problem-tracing {
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

.tabs-container {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-top: 20px;
}

.result-section {
  margin-top: 20px;
}

.statistics-card, .issues-card, .chart-card {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-value.success {
  color: #67C23A;
}

.stat-value.problem {
  color: #F56C6C;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.ranking-controls, .detection-controls {
  margin-bottom: 20px;
}

.ranking-card, .detection-result, .notification-card {
  margin-top: 20px;
}

.detection-result .result-content {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
}

/* 新增的检测结果样式 */
.detection-results-container {
  margin-top: 20px;
}

.detection-summary {
  margin-bottom: 20px;
}

.detection-summary .summary-stats {
  margin-top: 15px;
}

.detection-issues {
  margin-bottom: 20px;
}

.detection-issues .card-header {
  margin-bottom: 15px;
}

.search-form .el-select {
  width: 250px;
}

.description-text {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
}

/* 生产信息样式 */
.production-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.info-label {
  display: inline-block;
  width: 80px;
  color: #666;
  font-weight: bold;
}

.time-cell {
  line-height: 1.6;
}

.time-cell div:first-child {
  margin-bottom: 4px;
  font-weight: 500;
}

.auto-detect-result {
  margin-top: 15px;
  padding: 10px;
  background-color: #f0f9eb;
  border-radius: 4px;
  color: #67c23a;
  font-size: 14px;
}
</style>
