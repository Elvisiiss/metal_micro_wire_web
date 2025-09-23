<template>
  <div class="quality-evaluation">
    <!-- 质量评估管理 -->

    <div class="management-header">
      <div class="header-content">
        <span class="page-title">质量评估管理</span>
        <span class="page-subtitle">管理线材的评估结果</span>
      </div>
      <div class="actions">
        <el-input v-model="scenarioCode" placeholder="输入场景代码" :style="{ width: '100%', maxWidth: '200px' }" />
        <el-button
            type="primary"
            @click="reEvaluateScenario"
            :loading="reEvaluating"
            class="re-evaluate-btn"
        >
          重新评估场景
        </el-button>
      </div>
    </div>

    <el-tabs v-model="managementTab" @tab-change="handleTabChange">
      <!-- 待审核列表 -->
      <el-tab-pane label="待审核线材" name="pending">
        <div class="table-container">
          <el-table :data="pendingMaterials" v-loading="pendingLoading">
            <el-table-column prop="batchNumber" label="批次号" :width="isSmallScreen ? '120' : '200'" />
            <el-table-column prop="scenarioCode" label="场景编号" :width="isSmallScreen ? '80' : '100'" />

            <el-table-column label="技术参数" :width="isSmallScreen ? '200' : '250'">
              <template #default="{ row }">
                <div class="tech-params">
                  <div><span class="param-label">直径:</span> {{ formatNumber(row.diameter, 'diameter') }} mm</div>
                  <div><span class="param-label">电导率:</span> {{ formatNumber(row.resistance, 'conductivity') }} MS/m</div>
                  <div><span class="param-label">延展率:</span> {{ formatNumber(row.extensibility, 'extensibility') }} δ</div>
                  <div><span class="param-label">重量:</span> {{ formatNumber(row.weight, 'weight') }} g</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="事件时间" :width="isSmallScreen ? '90' : '100'">
              <template #default="{ row }">
                <div style="line-height: 1.4; text-align: center;">
                  <div>{{ formatDatePart(row.eventTime) }}</div>
                  <div>{{ formatTimePart(row.eventTime) }}</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="模型审核结果" :width="isSmallScreen ? '140' : '180'">
              <template #default="{ row }">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <!-- 审核结果标签（保持居中） -->
                  <el-tag :type="row.modelEvaluationResult === 'PASS' ? 'success' : 'danger'">
                    {{ row.modelEvaluationResult === 'PASS' ? '通过' : '不通过' }}
                  </el-tag>

                  <!-- 置信度行（水平排列） -->
                  <div v-if="row.modelConfidence" style="margin-top: 5px; display: flex; align-items: center;">
                    <span style="margin-right: 5px; font-size: 11px;">置信度:</span>
                    <el-progress
                        :percentage="row.modelConfidence * 100"
                        :color="confidenceColor(row.modelConfidence)"
                        :show-text="false"
                        :style="{ width: isSmallScreen ? '50px' : '70px', marginRight: '5px' }"
                    />
                    <span style="font-size: 12px;">{{ (row.modelConfidence * 100).toFixed(1) }}%</span>
                  </div>
                  <span v-else>N/A</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="规则引擎" :width="isSmallScreen ? '100' : '120'">
              <template #default="{ row }">
                <el-tag :type="evaluationTagType(row.evaluationResult)">
                  {{ row.evaluationResult === 'PASS' ? '通过' : '不通过' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="最终结果" :width="isSmallScreen ? '100' : '120'">
              <template #default="{ row }">
                <el-tag :type="finalEvaluationTagType(row.finalEvaluationResult)">
                  {{ formatFinalResult(row.finalEvaluationResult) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="评估信息" :min-width="isSmallScreen ? '150' : '200'">
              <template #default="{ row }">
                <div class="evaluation-message" @click="showAuditHistory(row)">
                  <div v-if="splitMessage(row.evaluationMessage).modelMsg">
                    <span class="info-label">评估:</span> {{ splitMessage(row.evaluationMessage).modelMsg }}
                  </div>
                  <div v-for="(audit, index) in splitMessage(row.evaluationMessage).lastAuditMsgs" :key="index">
                    <span class="info-label">{{ audit.type }}:</span> {{ audit.content }}
                  </div>
                  <div v-if="splitMessage(row.evaluationMessage).hasMore" class="more-tip">
                    <el-icon><ArrowDown /></el-icon>
                    <span>点击查看</span>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="操作" :width="isSmallScreen ? '80' : '160'">
              <template #default="{ row }">
                <el-button size="small" @click="showConfirmDialog(row)" v-if="isAdmin">
                  {{ isSmallScreen ? '审' : '审核' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-pagination
            v-model:current-page="pendingPage"
            :page-size="pendingPageSize"
            :total="pendingTotal"
            @current-change="fetchPendingMaterials"
            class="pagination"
        />
      </el-tab-pane>

      <!-- 已完成列表 -->
      <el-tab-pane label="已完成评估" name="completed">
        <div class="filter-bar">
          <el-input v-model="completedScenario" placeholder="场景代码" :style="{ width: '100%', maxWidth: '200px' }" />
          <el-select v-model="sortBy" placeholder="排序方式" :style="{ width: '100%', maxWidth: '140px' }">
            <el-option label="创建时间" value="createTime" />
            <el-option label="置信度" value="modelConfidence" />
          </el-select>
          <el-select v-model="sortDirection" placeholder="排序方向" :style="{ width: '100%', maxWidth: '100px' }">
            <el-option label="降序" value="desc" />
            <el-option label="升序" value="asc" />
          </el-select>
          <el-button type="primary" @click="fetchCompletedMaterials">筛选</el-button>
        </div>

        <div class="table-container">
          <el-table :data="completedMaterials" v-loading="completedLoading">
            <el-table-column prop="batchNumber" label="批次号" :width="isSmallScreen ? '120' : '200'" />
            <el-table-column prop="scenarioCode" label="场景编号" :width="isSmallScreen ? '80' : '100'" />

            <el-table-column label="技术参数" :width="isSmallScreen ? '200' : '250'">
              <template #default="{ row }">
                <div class="tech-params">
                  <div><span class="param-label">直径:</span> {{ formatNumber(row.diameter, 'diameter') }} mm</div>
                  <div><span class="param-label">电导率:</span> {{ formatNumber(row.resistance, 'conductivity') }} MS/m</div>
                  <div><span class="param-label">延展率:</span> {{ formatNumber(row.extensibility, 'extensibility') }} δ</div>
                  <div><span class="param-label">重量:</span> {{ formatNumber(row.weight, 'weight') }} g</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="事件时间" :width="isSmallScreen ? '90' : '100'">
              <template #default="{ row }">
                <div style="line-height: 1.4; text-align: center;">
                  <div>{{ formatDatePart(row.eventTime) }}</div>
                  <div>{{ formatTimePart(row.eventTime) }}</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="模型审核结果" :width="isSmallScreen ? '140' : '180'">
              <template #default="{ row }">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <!-- 审核结果标签（保持居中） -->
                  <el-tag :type="row.modelEvaluationResult === 'PASS' ? 'success' : 'danger'">
                    {{ row.modelEvaluationResult === 'PASS' ? '通过' : '不通过' }}
                  </el-tag>

                  <!-- 置信度行（水平排列） -->
                  <div v-if="row.modelConfidence" style="margin-top: 5px; display: flex; align-items: center;">
                    <span style="margin-right: 5px; font-size: 11px;">置信度:</span>
                    <el-progress
                        :percentage="row.modelConfidence * 100"
                        :color="confidenceColor(row.modelConfidence)"
                        :show-text="false"
                        :style="{ width: isSmallScreen ? '50px' : '70px', marginRight: '5px' }"
                    />
                    <span style="font-size: 12px;">{{ (row.modelConfidence * 100).toFixed(1) }}%</span>
                  </div>
                  <span v-else>N/A</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="规则引擎" :width="isSmallScreen ? '100' : '120'">
              <template #default="{ row }">
                <el-tag :type="evaluationTagType(row.evaluationResult)">
                  {{ row.evaluationResult === 'PASS' ? '通过' : '不通过' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="最终结果" :width="isSmallScreen ? '100' : '120'">
              <template #default="{ row }">
                <el-tag :type="finalEvaluationTagType(row.finalEvaluationResult)">
                  {{ formatFinalResult(row.finalEvaluationResult) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="评估信息" :min-width="isSmallScreen ? '150' : '200'">
              <template #default="{ row }">
                <div class="evaluation-message" @click="showAuditHistory(row)">
                  <div v-if="splitMessage(row.evaluationMessage).modelMsg">
                    <span class="info-label">评估:</span> {{ splitMessage(row.evaluationMessage).modelMsg }}
                  </div>
                  <div v-for="(audit, index) in splitMessage(row.evaluationMessage).lastAuditMsgs" :key="index">
                    <span class="info-label">{{ audit.type }}:</span> {{ audit.content }}
                  </div>
                  <div v-if="splitMessage(row.evaluationMessage).hasMore" class="more-tip">
                    <el-icon><ArrowDown /></el-icon>
                    <span>点击查看</span>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="操作" :width="isSmallScreen ? '80' : '160'">
              <template #default="{ row }">
                <el-button size="small" @click="showConfirmDialog(row)" v-if="isAdmin">
                  {{ isSmallScreen ? '重审' : '重新审核' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-pagination
            v-model:current-page="completedPage"
            :page-size="completedPageSize"
            :total="completedTotal"
            @current-change="fetchCompletedMaterials"
            class="pagination"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 人工审核对话框 -->
    <el-dialog
        v-model="confirmDialogVisible"
        title="人工审核确认"
        :width="isSmallScreen ? '90%' : '500px'"
    >
      <el-form label-width="120px">
        <el-form-item label="批次号">
          <el-input v-model="confirmData.batchNumber" disabled />
        </el-form-item>
        <el-form-item label="当前结果">
          <el-tag :type="finalEvaluationTagType(confirmData.finalEvaluationResult)">
            {{ formatFinalResult(confirmData.finalEvaluationResult) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="最终结果" required>
          <el-select v-model="confirmData.finalResult" style="width: 100%;">
            <el-option label="合格" value="PASS" />
            <el-option label="不合格" value="FAIL" />
            <el-option label="待审核" value="PENDING_REVIEW" />
            <el-option label="未评估" value="UNKNOWN" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input v-model="confirmData.reviewRemark" type="textarea" style="width: 100%;" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmResult">确认</el-button>
      </template>
    </el-dialog>

    <!-- 审核记录对话框 -->
    <el-dialog
        v-model="auditHistoryVisible"
        :title="`审核记录 - ${currentBatchNumber}`"
        :width="isSmallScreen ? '90%' : '50%'"
    >
      <div class="audit-history-container">
        <div v-for="(record, index) in auditHistory" :key="index" class="audit-record">
          <div class="record-header">
            <div class="record-type">{{ record.type }}</div>
          </div>
          <div class="record-content">
            {{ record.content }}
          </div>
          <div v-if="record.reviewer" class="reviewer-info">
            <span class="reviewer-label">审核人：</span>
            <span class="reviewer-name">
              {{ record.reviewer.name }}
            </span>
            <span>({{ record.reviewer.email }})</span>
          </div>
          <div v-if="record.type === '最终结果'" class="result-icon">
            <el-icon v-if="record.result === 'PASS'" color="#67C23A" :size="24">
              <CircleCheckFilled />
            </el-icon>
            <el-icon v-else-if="record.result === 'FAIL'" color="#F56C6C" :size="24">
              <CircleCloseFilled />
            </el-icon>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, onMounted, watch, computed} from 'vue'
import {
  ElMessage,
  ElMessageBox
} from 'element-plus'
import {ArrowDown, CircleCheckFilled, CircleCloseFilled} from '@element-plus/icons-vue'
import qualityAPI from '@/api/qualityEvaluation.js'
import {useAuthStore} from '@/stores/auth.js';

// 引入权限存储
const authStore = useAuthStore();
const user_name = authStore.user?.user_name;

// 响应式判断：是否为小屏幕
const isSmallScreen = computed(() => {
  return window.innerWidth < 768;
});

// 监听窗口大小变化
const handleResize = () => {
  // 触发计算属性更新
  isSmallScreen.value;
};

// 注册窗口大小变化事件
onMounted(() => {
  window.addEventListener('resize', handleResize);
  fetchPendingMaterials();

  // 组件卸载时移除事件监听
  return () => {
    window.removeEventListener('resize', handleResize);
  };
});

// 评估管理
const managementTab = ref('pending')
const scenarioCode = ref('')
const reEvaluating = ref(false)

// 待审核列表
const pendingMaterials = ref([])
const pendingPage = ref(1)
const pendingPageSize = ref(10)
const pendingTotal = ref(0)
const pendingLoading = ref(false)

// 已完成列表
const completedMaterials = ref([])
const completedPage = ref(1)
const completedPageSize = ref(10)
const completedTotal = ref(0)
const completedLoading = ref(false)
const completedScenario = ref('')
const sortBy = ref('createTime')
const sortDirection = ref('desc')
const isAdmin = computed(() => authStore.user?.role_id === 1)

// 人工审核对话框
const confirmDialogVisible = ref(false)
const confirmData = ref({
  batchNumber: '',
  finalEvaluationResult: '',
  finalResult: '',
  reviewRemark: ''
})

// 审核记录对话框
const auditHistoryVisible = ref(false)
const auditHistory = ref([])
const currentBatchNumber = ref('')

// 提取日期部分
const formatDatePart = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];  // 返回 "YYYY-MM-DD"
}

// 提取时间部分
const formatTimePart = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toTimeString().split(' ')[0];  // 返回 "HH:mm:ss"
}

// 标签页切换处理
const handleTabChange = (tabName) => {
  if (tabName === 'pending') {
    fetchPendingMaterials()
  } else if (tabName === 'completed') {
    fetchCompletedMaterials()
  }
}

// 重新评估场景
const reEvaluateScenario = async () => {
  if (!scenarioCode.value) {
    ElMessage.warning('请输入场景代码')
    return
  }

  reEvaluating.value = true
  try {
    const response = await qualityAPI.reEvaluateScenario(scenarioCode.value)
    ElMessage.success(response.data.msg)
  } catch (error) {
    ElMessage.error('重新评估失败: ' + error.response?.data?.msg || '未知错误')
  } finally {
    reEvaluating.value = false
  }
}

// 获取待审核列表
const fetchPendingMaterials = async () => {
  pendingLoading.value = true
  try {
    const params = {
      page: pendingPage.value - 1,
      size: pendingPageSize.value,
      sortBy: 'createTime',
      sortDirection: 'desc'
    }

    const response = await qualityAPI.getPendingReview(params)
    pendingMaterials.value = response.data.data.wireMaterials
    pendingTotal.value = response.data.data.totalElements
  } catch (error) {
    ElMessage.error('获取待审核列表失败')
  } finally {
    pendingLoading.value = false
  }
}

// 获取已完成列表
const fetchCompletedMaterials = async () => {
  completedLoading.value = true
  try {
    const params = {
      page: completedPage.value - 1,
      size: completedPageSize.value,
      scenarioCode: completedScenario.value,
      sortBy: sortBy.value,
      sortDirection: sortDirection.value
    }

    const response = await qualityAPI.getCompleted(params)
    completedMaterials.value = response.data.data.wireMaterials
    completedTotal.value = response.data.data.totalElements
  } catch (error) {
    ElMessage.error('获取已完成列表失败')
  } finally {
    completedLoading.value = false
  }
}

// 显示审核对话框
const showConfirmDialog = (row) => {
  confirmData.value = {
    batchNumber: row.batchNumber,
    finalEvaluationResult: row.finalEvaluationResult,
    finalResult: row.finalEvaluationResult,
    reviewRemark: ''
  }
  confirmDialogVisible.value = true
}

// 提交审核结果
const confirmResult = async () => {
  try {
    await qualityAPI.confirmResult(confirmData.value)
    ElMessage.success('审核结果已确认')
    confirmDialogVisible.value = false

    // 刷新数据
    if (managementTab.value === 'pending') {
      fetchPendingMaterials()
    } else {
      fetchCompletedMaterials()
    }
  } catch (error) {
    ElMessage.error('审核确认失败')
  }
}

// 显示审核记录
const showAuditHistory = (row) => {
  currentBatchNumber.value = row.batchNumber
  auditHistory.value = parseAuditHistory(row)
  auditHistoryVisible.value = true
}

// 解析审核记录
const parseAuditHistory = (row) => {
  const records = []

  // 规则引擎评估记录
  const {modelMsg} = splitMessage(row.evaluationMessage)
  if (modelMsg) {
    records.push({
      type: '规则引擎评估',
      content: modelMsg
    })
  }

  // 人工审核记录
  const auditRecords = extractAuditRecords(row.evaluationMessage)
  auditRecords.forEach((record, index) => {
    records.push({
      type: record.type,
      content: record.content,
      reviewer: {
        name: record.reviewerName,
        email: record.reviewerEmail
      }
    })
  })

  // 最终审核结果
  records.push({
    type: '最终结果',
    content: formatFinalResult(row.finalEvaluationResult),
    result: row.finalEvaluationResult
  })

  return records
}

// 提取人工审核记录
const extractAuditRecords = (message) => {
  if (!message) return []

  // 匹配所有人工审核记录
  const auditPattern = /(人工(重新)?审核：)([^\[]+)\s*\[审核人：([^(]+)\(([^)]+)\)\]/g
  const records = []
  let match

  while ((match = auditPattern.exec(message)) !== null) {
    records.push({
      type: match[1].replace('：', ''), // 移除冒号
      content: match[3].trim(),
      reviewerName: match[4].trim(),
      reviewerEmail: match[5].trim()
    })
  }

  return records
}

// 分割评估信息（用于表格显示）
const splitMessage = (message) => {
  if (!message) return {
    modelMsg: '',
    auditMsgs: [],
    lastAuditMsgs: [],
    hasMore: false
  }

  // 分割各个部分
  const parts = message.split('|').map(part => part.trim())

  // 第一个部分是模型评估信息
  const modelMsg = parts[0]

  // 提取人工审核记录
  const auditRecords = extractAuditRecords(message)

  // 只取最后一条审核记录用于表格显示
  const lastAuditMsgs = auditRecords.slice(-1)

  // 检查是否有更多记录（超过1条记录）
  const hasMore = auditRecords.length > 1 || parts.length > 1

  return {
    modelMsg,
    auditMsgs: auditRecords,
    lastAuditMsgs,
    hasMore
  }
}

// 数值格式化函数
const formatNumber = (value, type = 'default') => {
  if (value === null || value === undefined || value === '') return ''

  const num = parseFloat(value)
  if (isNaN(num)) return ''

  switch (type) {
    case 'diameter':
    case 'weight':
      return num.toFixed(2)
    case 'conductivity':
      return num.toFixed(2)
    case 'extensibility':
      return num.toFixed(1)
    default:
      return num.toString()
  }
}

// 辅助函数
const confidenceColor = (confidence) => {
  if (confidence >= 0.8) return '#67C23A'
  if (confidence >= 0.6) return '#E6A23C'
  return '#F56C6C'
}

const evaluationTagType = (result) => {
  if (result === 'PASS') return 'success'
  if (result === 'FAIL') return 'danger'
  return 'info'
}

const finalEvaluationTagType = (result) => {
  if (result === 'PASS') return 'success'
  if (result === 'FAIL') return 'danger'
  if (result === 'PENDING_REVIEW') return 'warning'
  return 'info'
}

const formatFinalResult = (result) => {
  const map = {
    'PASS': '合格',
    'FAIL': '不合格',
    'PENDING_REVIEW': '待审核',
    'UNKNOWN': '未评估'
  }
  return map[result] || result
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const datePart = date.toISOString().split('T')[0]
  const timePart = date.toTimeString().split(' ')[0]
  return `${datePart} ${timePart}`
}
</script>

<style scoped>
.quality-evaluation {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  box-sizing: border-box;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.actions {
  display: flex;
  gap: 12px;
  width: 100%;
  max-width: 400px;
}

.re-evaluate-btn {
  flex-shrink: 0;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 16px;
}

.tech-params {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.param-label {
  display: inline-block;
  width: 50px;
  color: #666;
  font-weight: bold;
}

.info-label {
  font-weight: bold;
  color: #409eff;
  margin-right: 5px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.evaluation-message {
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.evaluation-message:hover {
  background-color: #f5f7fa;
}

.more-tip {
  margin-top: 5px;
  color: #909399;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.audit-history-container {
  max-height: 60vh;
  overflow-y: auto;
  padding: 10px;
}

.audit-record {
  border-left: 3px solid #409eff;
  padding: 12px 16px;
  margin-bottom: 16px;
  background-color: #f8fafc;
  border-radius: 0 8px 8px 0;
  position: relative;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.record-type {
  font-weight: bold;
  color: #1a3a6e;
}

.record-content {
  margin-bottom: 8px;
  color: #333;
}

.reviewer-info {
  font-size: 13px;
  color: #666;
}

.reviewer-label {
  font-weight: bold;
}

.reviewer-name.current-user {
  color: #409eff;
  font-weight: bold;
}

.result-icon {
  position: absolute;
  top: 12px;
  right: 16px;
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

.pagination {
  margin-top: 16px;
  text-align: right;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .management-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .actions {
    width: 100%;
    max-width: none;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-bar > * {
    width: 100% !important;
    max-width: none !important;
  }

  .page-title {
    font-size: 18px;
  }

  .param-label {
    width: 40px;
    font-size: 12px;
  }

  .tech-params {
    font-size: 12px;
  }

  .audit-record {
    padding: 8px 12px;
  }

  .record-content {
    font-size: 13px;
  }
}
</style>
