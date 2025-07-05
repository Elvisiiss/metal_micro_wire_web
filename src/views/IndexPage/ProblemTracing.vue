<template>
  <div class="problem-tracing">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <div class="header-content">
        <span class="page-title">质量问题溯源分析</span>
        <span class="page-subtitle">多层级质量问题追踪与根因分析平台</span>
      </div>
      <div class="header-stats">
        <el-tag type="info">分析项: {{ pagination.totalElements || 0 }}</el-tag>
        <el-tag v-if="criticalRiskCount > 0" type="danger">严重风险: {{ criticalRiskCount }}</el-tag>
        <el-tag v-if="highRiskCount > 0" type="warning">高风险: {{ highRiskCount }}</el-tag>
      </div>
    </div>

    <!-- 查询条件面板 -->
    <el-card class="filter-card">
      <el-collapse v-model="activeFilters">
        <el-collapse-item title="筛选条件" name="filters">
          <el-form :model="queryParams" label-width="120px" class="filter-form">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="溯源层级">
                  <el-select v-model="queryParams.traceabilityLevel" clearable>
                    <el-option label="生产商层面" value="MANUFACTURER" />
                    <el-option label="工艺层面" value="PROCESS" />
                    <el-option label="责任人层面" value="RESPONSIBLE_PERSON" />
                    <el-option label="生产机器层面" value="PRODUCTION_MACHINE" />
                    <el-option label="全层级分析" value="ALL" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="质量筛选">
                  <el-select v-model="queryParams.qualityIssueFilter" clearable>
                    <el-option label="所有数据" value="ALL" />
                    <el-option label="仅质量问题" value="QUALITY_ISSUES_ONLY" />
                    <el-option label="规则引擎失败" value="RULE_ENGINE_FAILURES" />
                    <el-option label="模型评估失败" value="MODEL_FAILURES" />
                    <el-option label="最终评估失败" value="FINAL_FAILURES" />
                    <el-option label="评估不一致" value="INCONSISTENT_EVALUATIONS" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="时间范围">
                  <el-date-picker
                      v-model="dateRange"
                      type="datetimerange"
                      range-separator="至"
                      start-placeholder="开始时间"
                      end-placeholder="结束时间"
                      value-format="YYYY-MM-DDTHH:mm:ss"
                      @change="handleDateChange"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="生产商">
                  <el-select v-model="queryParams.manufacturers" multiple clearable filterable>
                    <el-option
                        v-for="item in filterOptions.manufacturers"
                        :key="item"
                        :label="item"
                        :value="item"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="工艺类型">
                  <el-select v-model="queryParams.processTypes" multiple clearable filterable>
                    <el-option
                        v-for="item in filterOptions.processTypes"
                        :key="item"
                        :label="item"
                        :value="item"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="责任人">
                  <el-select v-model="queryParams.responsiblePersons" multiple clearable filterable>
                    <el-option
                        v-for="item in filterOptions.responsiblePersons"
                        :key="item"
                        :label="item"
                        :value="item"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="生产机器">
                  <el-select v-model="queryParams.productionMachines" multiple clearable filterable>
                    <el-option
                        v-for="item in filterOptions.productionMachines"
                        :key="item"
                        :label="item"
                        :value="item"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="场景编号">
                  <el-select v-model="queryParams.scenarioCodes" multiple clearable filterable>
                    <el-option
                        v-for="item in filterOptions.scenarioCodes"
                        :key="item"
                        :label="item"
                        :value="item"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="评估结果">
                  <el-select v-model="queryParams.finalEvaluationResults" multiple clearable>
                    <el-option
                        v-for="item in filterOptions.finalEvaluationResults"
                        :key="item"
                        :label="item"
                        :value="item"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20" justify="end">
              <el-button type="primary" @click="fetchAnalysisData" :loading="loading">
                分析数据
              </el-button>
              <el-button @click="resetFilters">
                重置条件
              </el-button>
            </el-row>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- 统计概览卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ overallStats.totalRecords || 0 }}</div>
            <div class="stat-label">总样本数</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value failure">{{ overallStats.totalQualityIssues || 0 }}</div>
            <div class="stat-label">失败数量</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ overallFailureRate }}%</div>
            <div class="stat-label">总失败率</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value critical">{{ criticalRiskCount }}</div>
            <div class="stat-label">严重风险项</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表分析区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>风险等级分布</span>
          </template>
          <div class="chart-container" ref="riskChart"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>评估一致性分析</span>
          </template>
          <div class="chart-container" ref="consistencyChart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分析结果表格 -->
    <el-card class="result-card">
      <template #header>
        <div class="card-header">
          <span>质量问题分析结果</span>
          <div class="card-actions">
            <el-button type="primary" size="small" @click="exportData">
              导出数据
            </el-button>
          </div>
        </div>
      </template>

      <el-table
          :data="analysisData"
          v-loading="loading"
          stripe
          style="width: 100%"
          height="500"
      >
        <el-table-column prop="dimensionName" label="分析项" min-width="180" />
        <el-table-column prop="totalCount" label="样本数" width="100" align="center" />
        <el-table-column prop="qualityIssueCount" label="失败数" width="100" align="center" />
        <el-table-column label="失败率" width="120" align="center">
          <template #default="{ row }">
            {{ (row.failureRate * 100).toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column label="风险等级" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getRiskTagType(row.riskLevel)" size="small">
              {{ getRiskLabel(row.riskLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最新问题时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.lastIssueTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDetails(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-wrapper">
        <el-pagination
            v-model:current-page="queryParams.page"
            v-model:page-size="queryParams.size"
            :total="pagination.totalElements"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 高风险项目弹窗 -->
    <el-dialog v-model="riskDialogVisible" title="高风险项目详情" width="80%">
      <el-table :data="highRiskItems" height="400">
        <el-table-column prop="dimensionName" label="项目名称" min-width="180" />
        <el-table-column label="失败率" width="120" align="center">
          <template #default="{ row }">
            {{ (row.failureRate * 100).toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column label="风险等级" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getRiskTagType(row.riskLevel)" size="small">
              {{ getRiskLabel(row.riskLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalCount" label="样本数" width="100" align="center" />
        <el-table-column label="最新问题时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.lastIssueTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDetails(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue';
import * as echarts from 'echarts';
import problemTracingAPI from '@/api/problemTracing';

// 图表实例
let riskChart = null;
let consistencyChart = null;

// 响应式数据
const loading = ref(false);
const activeFilters = ref(['filters']);
const dateRange = ref([]);
const riskDialogVisible = ref(false);
const analysisData = ref([]);
const highRiskItems = ref([]);
const filterOptions = reactive({
  manufacturers: [],
  processTypes: [],
  responsiblePersons: [],
  productionMachines: [],
  scenarioCodes: [],
  finalEvaluationResults: ['PASS', 'FAIL', 'PENDING_REVIEW']
});

// 查询参数
const queryParams = reactive({
  traceabilityLevel: 'MANUFACTURER',
  qualityIssueFilter: 'QUALITY_ISSUES_ONLY',
  manufacturers: [],
  processTypes: [],
  responsiblePersons: [],
  productionMachines: [],
  scenarioCodes: [],
  deviceIds: [],
  finalEvaluationResults: [],
  eventTimeStart: null,
  eventTimeEnd: null,
  page: 0,
  size: 20,
  sortField: 'FAILURE_RATE',
  sortDirection: 'DESC',
  includeDetailedStats: true,
  includeEvaluationChainAnalysis: true
});

// 分页和统计信息
const pagination = reactive({
  currentPage: 0,
  pageSize: 20,
  totalPages: 0,
  totalElements: 0
});

const overallStats = reactive({
  totalRecords: 0,
  totalQualityIssues: 0,
  overallFailureRate: 0,
  criticalRiskItemCount: 0,
  highRiskItemCount: 0
});

// 计算属性
const overallFailureRate = computed(() => {
  return overallStats.overallFailureRate
      ? (overallStats.overallFailureRate * 100).toFixed(2)
      : '0.00';
});

const highRiskCount = computed(() => {
  return overallStats.highRiskItemCount || 0;
});

const criticalRiskCount = computed(() => {
  return overallStats.criticalRiskItemCount || 0;
});

// 日期格式化
const formatDateTime = (dateString) => {
  if (!dateString) return '无';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 生命周期钩子
onMounted(async () => {
  await fetchFilterOptions();
  await fetchAnalysisData();
});

// 获取筛选选项
const fetchFilterOptions = async () => {
  try {
    const options = await problemTracingAPI.getFilterOptions();
    Object.assign(filterOptions, options);
  } catch (error) {
    console.error('获取筛选选项失败:', error);
  }
};

// 获取分析数据
const fetchAnalysisData = async () => {
  loading.value = true;
  try {
    const response = await problemTracingAPI.analyze(queryParams);
    // 处理分析结果
    analysisData.value = response.data.analysisItems || [];
    // 更新分页信息
    if (response.pageInfo) {
      Object.assign(pagination, {
        currentPage: response.pageInfo.currentPage,
        pageSize: response.pageInfo.pageSize,
        totalPages: response.pageInfo.totalPages,
        totalElements: response.pageInfo.totalElements
      });
    }

    // 更新总体统计
    if (response.overallStatistics) {
      Object.assign(overallStats, response.overallStatistics);
    }

    // 如果有高风险项，自动弹出提示
    if (overallStats.criticalRiskItemCount > 0) {
      fetchHighRiskItems();
    }

    // 初始化图表
    nextTick(() => {
      initRiskChart(response.overallStatistics?.countByRiskLevel);
      initConsistencyChart(response.evaluationChainAnalysis);
    });

  } catch (error) {
    console.error('获取分析数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// 获取高风险项目
const fetchHighRiskItems = async () => {
  try {
    const response = await problemTracingAPI.getHighRiskItems({
      level: queryParams.traceabilityLevel
    });
    highRiskItems.value = response.analysisItems || [];
    riskDialogVisible.value = true;
  } catch (error) {
    console.error('获取高风险项目失败:', error);
  }
};

// 处理日期变化
const handleDateChange = (dates) => {
  if (dates && dates.length === 2) {
    [queryParams.eventTimeStart, queryParams.eventTimeEnd] = dates;
  } else {
    queryParams.eventTimeStart = null;
    queryParams.eventTimeEnd = null;
  }
};

// 重置筛选条件
const resetFilters = () => {
  queryParams.traceabilityLevel = 'MANUFACTURER';
  queryParams.qualityIssueFilter = 'QUALITY_ISSUES_ONLY';
  queryParams.manufacturers = [];
  queryParams.processTypes = [];
  queryParams.responsiblePersons = [];
  queryParams.productionMachines = [];
  queryParams.scenarioCodes = [];
  queryParams.finalEvaluationResults = [];
  queryParams.eventTimeStart = null;
  queryParams.eventTimeEnd = null;
  dateRange.value = [];
  queryParams.page = 0;
};

// 分页处理
const handleSizeChange = (size) => {
  queryParams.size = size;
  queryParams.page = 0;
  fetchAnalysisData();
};

const handlePageChange = (page) => {
  queryParams.page = page - 1;
  fetchAnalysisData();
};

// 查看详情
const viewDetails = (item) => {
  console.log('查看详情:', item);
  // 这里可以跳转到详细页面或打开详情弹窗
};

// 导出数据
const exportData = () => {
  console.log('导出数据');
  // 实现数据导出逻辑
};

// 风险标签处理
const getRiskLabel = (level) => {
  switch (level) {
    case 'LOW': return '低风险';
    case 'MEDIUM': return '中风险';
    case 'HIGH': return '高风险';
    case 'CRITICAL': return '严重风险';
    default: return level;
  }
};

const getRiskTagType = (level) => {
  switch (level) {
    case 'LOW': return 'success';
    case 'MEDIUM': return 'warning';
    case 'HIGH': return 'danger';
    case 'CRITICAL': return 'danger';
    default: return 'info';
  }
};

// 初始化风险图表
const initRiskChart = (riskDistribution) => {
  const chartEl = document.querySelector('.chart-container');
  if (!chartEl) return;

  // 清理旧图表实例
  if (riskChart) {
    riskChart.dispose();
  }

  riskChart = echarts.init(chartEl);

  // 默认风险分布数据
  const defaultDistribution = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0
  };

  // 合并API返回的风险分布数据
  const distributionData = riskDistribution
      ? { ...defaultDistribution, ...riskDistribution }
      : defaultDistribution;

  const data = [
    { value: distributionData.LOW || 0, name: '低风险', itemStyle: { color: '#52c41a' } },
    { value: distributionData.MEDIUM || 0, name: '中风险', itemStyle: { color: '#faad14' } },
    { value: distributionData.HIGH || 0, name: '高风险', itemStyle: { color: '#fa8c16' } },
    { value: distributionData.CRITICAL || 0, name: '严重风险', itemStyle: { color: '#f5222d' } }
  ];

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '风险分布',
        type: 'pie',
        radius: '70%',
        center: ['50%', '50%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  riskChart.setOption(option);
};

// 初始化一致性图表
const initConsistencyChart = (consistencyData) => {
  const chartEl = document.querySelectorAll('.chart-container')[1];
  if (!chartEl) return;

  // 清理旧图表实例
  if (consistencyChart) {
    consistencyChart.dispose();
  }

  consistencyChart = echarts.init(chartEl);

  // 默认图表数据
  let option = {
    title: {
      text: '暂无数据',
      left: 'center',
      top: 'center',
      textStyle: {
        color: '#999',
        fontWeight: 'normal',
        fontSize: 16
      }
    }
  };

  // 如果有评估链分析数据
  if (consistencyData) {
    const autoEvaluationAccuracy = consistencyData.autoEvaluationAccuracy || 0;
    const humanReviewCoverage = consistencyData.humanReviewCoverage || 0;

    option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['自动评估准确率', '人工审核覆盖率']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['评估一致性指标']
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          name: '自动评估准确率',
          type: 'bar',
          data: [(autoEvaluationAccuracy * 100).toFixed(1)],
          itemStyle: { color: '#5470c6' }
        },
        {
          name: '人工审核覆盖率',
          type: 'bar',
          data: [(humanReviewCoverage * 100).toFixed(1)],
          itemStyle: { color: '#91cc75' }
        }
      ]
    };
  }

  consistencyChart.setOption(option);
};

// 窗口大小变化时调整图表
window.addEventListener('resize', () => {
  if (riskChart) riskChart.resize();
  if (consistencyChart) consistencyChart.resize();
});
</script>

<style scoped>
.problem-tracing {
  padding: 20px;
  background-color: #f5f7fa;
}

.page-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #e6e9f0;
}

.header-content {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #1a3a6e;
}

.page-subtitle {
  font-size: 14px;
  color: #5b7ba8;
}

.header-stats {
  display: flex;
  gap: 10px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-item {
  padding: 20px;
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-value.failure {
  color: #f56c6c;
}

.stat-value.critical {
  color: #e6a23c;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: 350px;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.result-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-table__header) {
  background-color: #f8fafc;
}

:deep(.el-table th) {
  background-color: #f8fafc;
  font-weight: 600;
  color: #1a3a6e;
}
</style>
