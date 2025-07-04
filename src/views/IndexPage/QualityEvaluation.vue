<template>
  <div class="quality-evaluation">
    <!-- 质量评估管理 -->

      <div class="management-header">
        <h3>质量评估管理</h3>
        <div class="actions">
          <el-input v-model="scenarioCode" placeholder="输入场景代码" style="width: 200px" />
          <el-button
              type="primary"
              @click="reEvaluateScenario"
              :loading="reEvaluating"
          >
            重新评估场景
          </el-button>
        </div>
      </div>

      <el-tabs v-model="managementTab" @tab-change="handleTabChange">
        <!-- 待审核列表 -->
        <el-tab-pane label="待审核线材" name="pending">
          <el-table :data="pendingMaterials" v-loading="pendingLoading">
            <el-table-column prop="batchNumber" label="批次号" width="200" />
            <el-table-column prop="scenarioCode" label="场景编号" width="100" />

            <el-table-column label="技术参数" width="250">
              <template #default="{ row }">
                <div class="tech-params">
                  <div><span class="param-label">直径:</span> {{ row.diameter }} mm</div>
                  <div><span class="param-label">电导率:</span> {{ row.resistance }}</div>
                  <div><span class="param-label">延展率:</span> {{ row.extensibility }}%</div>
                  <div><span class="param-label">重量:</span> {{ row.weight }} g</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="事件时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.eventTime) }}
              </template>
            </el-table-column>

            <el-table-column label="模型审核结果" width="120">
              <template #default="{ row }">
                <el-tag :type="row.modelEvaluationResult === 'PASS' ? 'success' : 'danger'">
                  {{ row.modelEvaluationResult === 'PASS' ? '通过' : '不通过' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="规则引擎" width="120">
              <template #default="{ row }">
                <el-tag :type="evaluationTagType(row.evaluationResult)">
                  {{ row.evaluationResult === 'PASS' ? '通过' : '不通过' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="最终结果" width="120">
              <template #default="{ row }">
                <el-tag :type="finalEvaluationTagType(row.finalEvaluationResult)">
                  {{ formatFinalResult(row.finalEvaluationResult) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="评估信息" min-width="200">
              <template #default="{ row }">
                <div class="evaluation-message" @click="showAuditHistory(row)">
                  <div v-if="splitMessage(row.evaluationMessage).modelMsg">
                    <span class="info-label">评估信息:</span> {{ splitMessage(row.evaluationMessage).modelMsg }}
                  </div>
                  <div v-if="splitMessage(row.evaluationMessage).lastAuditMsg">
                    <span class="info-label">人工审核:</span> {{ splitMessage(row.evaluationMessage).lastAuditMsg }}
                  </div>
                  <div v-if="splitMessage(row.evaluationMessage).hasMore" class="more-tip">
                    <el-icon><ArrowDown /></el-icon>
                    <span>点击查看完整记录</span>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="置信度" width="120">
              <template #default="{ row }">
                <el-progress
                    v-if="row.modelConfidence"
                    :percentage="row.modelConfidence * 100"
                    :color="confidenceColor(row.modelConfidence)"
                    :show-text="false"
                />
                <span v-if="row.modelConfidence">{{ (row.modelConfidence * 100).toFixed(1) }}%</span>
                <span v-else>N/A</span>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="160">
              <template #default="{ row }">
                <el-button size="small" @click="showConfirmDialog(row)">审核</el-button>
                <el-button size="small" @click="showAuditHistory(row)">显示审核记录</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
              v-model:current-page="pendingPage"
              :page-size="pendingPageSize"
              :total="pendingTotal"
              @current-change="fetchPendingMaterials"
          />
        </el-tab-pane>

        <!-- 已完成列表 -->
        <el-tab-pane label="已完成评估" name="completed">
          <div class="filter-bar">
            <el-input v-model="completedScenario" placeholder="场景代码" style="width: 200px" />
            <el-select v-model="sortBy" placeholder="排序方式">
              <el-option label="创建时间" value="createTime" />
              <el-option label="置信度" value="modelConfidence" />
            </el-select>
            <el-select v-model="sortDirection" placeholder="排序方向">
              <el-option label="降序" value="desc" />
              <el-option label="升序" value="asc" />
            </el-select>
            <el-button type="primary" @click="fetchCompletedMaterials">筛选</el-button>
          </div>

          <el-table :data="completedMaterials" v-loading="completedLoading">
            <el-table-column prop="batchNumber" label="批次号" width="200" />
            <el-table-column prop="scenarioCode" label="场景编号" width="100" />

            <el-table-column label="技术参数" width="200">
              <template #default="{ row }">
                <div class="tech-params">
                  <div><span class="param-label">直径:</span> {{ row.diameter }} mm</div>
                  <div><span class="param-label">电导率:</span> {{ row.resistance }}</div>
                  <div><span class="param-label">延展率:</span> {{ row.extensibility }}%</div>
                  <div><span class="param-label">重量:</span> {{ row.weight }} g</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="事件时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.eventTime) }}
              </template>
            </el-table-column>

            <el-table-column label="模型审核结果" width="120">
              <template #default="{ row }">
                <el-tag :type="row.modelEvaluationResult === 'PASS' ? 'success' : 'danger'">
                  {{ row.modelEvaluationResult === 'PASS' ? '通过' : '不通过' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="规则引擎" width="120">
              <template #default="{ row }">
                <el-tag :type="evaluationTagType(row.evaluationResult)">
                  {{ row.evaluationResult === 'PASS' ? '通过' : '不通过' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="最终结果" width="120">
              <template #default="{ row }">
                <el-tag :type="finalEvaluationTagType(row.finalEvaluationResult)">
                  {{ formatFinalResult(row.finalEvaluationResult) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="评估信息" min-width="200">
              <template #default="{ row }">
                <div class="evaluation-message" @click="showAuditHistory(row)">
                  <div v-if="splitMessage(row.evaluationMessage).modelMsg">
                    <span class="info-label">评估信息:</span> {{ splitMessage(row.evaluationMessage).modelMsg }}
                  </div>
                  <div v-if="splitMessage(row.evaluationMessage).lastAuditMsg">
                    <span class="info-label">人工审核:</span> {{ splitMessage(row.evaluationMessage).lastAuditMsg }}
                  </div>
                  <div v-if="splitMessage(row.evaluationMessage).hasMore" class="more-tip">
                    <el-icon><ArrowDown /></el-icon>
                    <span>点击查看完整记录</span>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="置信度" width="120">
              <template #default="{ row }">
                <el-progress
                    :percentage="row.modelConfidence * 100"
                    :color="confidenceColor(row.modelConfidence)"
                    :show-text="false"
                />
                <span>{{ (row.modelConfidence * 100).toFixed(1) }}%</span>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="160">
              <template #default="{ row }">
                <el-button size="small" @click="showConfirmDialog(row)">重新审核</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
              v-model:current-page="completedPage"
              :page-size="completedPageSize"
              :total="completedTotal"
              @current-change="fetchCompletedMaterials"
          />
        </el-tab-pane>
      </el-tabs>

    <!-- 人工审核对话框 -->
    <el-dialog v-model="confirmDialogVisible" title="人工审核确认">
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
          <el-select v-model="confirmData.finalResult">
            <el-option label="合格" value="PASS" />
            <el-option label="不合格" value="FAIL" />
            <el-option label="待审核" value="PENDING_REVIEW" />
            <el-option label="未评估" value="UNKNOWN" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input v-model="confirmData.reviewRemark" type="textarea" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmResult">确认</el-button>
      </template>
    </el-dialog>

    <!-- 审核记录对话框 -->
    <el-dialog v-model="auditHistoryVisible" :title="`审核记录 - ${currentBatchNumber}`" width="50%">
      <el-timeline>
        <el-timeline-item
            v-for="(record, index) in auditHistory"
            :key="index"
            :timestamp="formatRecordTime(record.time)"
            placement="top"
        >
          <el-card>
            <h4>{{ record.type }}记录</h4>
            <p>{{ record.message }}</p>
            <div v-if="record.remark" class="audit-remark">
              <strong>备注：</strong> {{ record.remark }}
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import {
  ElMessage,
  ElMessageBox
} from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import qualityAPI from '@/api/qualityEvaluation'

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

// 初始化
onMounted(() => {
  fetchPendingMaterials()
})

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

  // 添加规则引擎评估记录
  records.push({
    type: '规则引擎评估',
    message: extractModelMessage(row.evaluationMessage),
    time: row.createTime
  })

  // 添加人工审核记录
  const auditRecords = extractAuditRecords(row.evaluationMessage)
  auditRecords.forEach((record, index) => {
    records.push({
      type: `人工审核 #${index + 1}`,
      message: record.message,
      remark: record.remark,
      time: row.createTime // 实际项目中应该使用审核时间字段
    })
  })

  // 添加最终审核结果
  records.push({
    type: '最终结果',
    message: `最终评估结果: ${formatFinalResult(row.finalEvaluationResult)}`,
    time: row.createTime
  })

  return records
}

// 提取模型评估信息
const extractModelMessage = (message) => {
  if (!message) return '无评估信息'

  // 使用正则匹配模型评估部分（第一条记录）
  const modelPart = message.split('|')[0].trim()
  // 移除可能的人工审核标记
  return modelPart.replace(/人工重新审核：.*$/, '').trim()
}

// 提取人工审核记录
const extractAuditRecords = (message) => {
  if (!message) return []

  // 使用正则匹配所有人工审核记录
  const auditPattern = /人工(重新)?审核：([^|]+)/g
  const records = []
  let match

  while ((match = auditPattern.exec(message)) !== null) {
    const recordText = match[2].trim()
    // 分割审核内容和备注
    const parts = recordText.split('备注：')
    records.push({
      message: parts[0].trim(),
      remark: parts[1] ? parts[1].trim() : ''
    })
  }

  return records
}

// 分割评估信息（用于表格显示）
const splitMessage = (message) => {
  if (!message) return {
    modelMsg: '',
    lastAuditMsg: '',
    hasMore: false
  }

  // 提取模型信息
  const modelMsg = extractModelMessage(message)

  // 提取人工审核记录
  const auditRecords = extractAuditRecords(message)
  const lastAuditMsg = auditRecords.length > 0 ? auditRecords[auditRecords.length - 1].message : ''

  // 检查是否有更多记录
  const hasMore = auditRecords.length > 1 ||
      (modelMsg && auditRecords.length > 0) ||
      message.includes('|')

  return {
    modelMsg,
    lastAuditMsg,
    hasMore
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

const formatRecordTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}
</script>

<style scoped>
.quality-evaluation {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.management-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  width: 60px;
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

.audit-remark {
  margin-top: 8px;
  padding: 8px;
  background-color: #f8f8f8;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.el-timeline {
  max-height: 60vh;
  overflow-y: auto;
}

.el-table {
  flex: 1;
  overflow: auto;
}

.el-pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
