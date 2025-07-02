<template>
  <div class="device-management">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">设备管理系统</h1>
        <p class="page-subtitle">物联网设备监控与管理平台</p>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <el-icon><cpu /></el-icon>
          <span>总设备: {{ totalElements }}</span>
        </div>
        <div class="stat-item">
          <el-icon><circle-check-filled /></el-icon>
          <span>在线: {{ onlineCount }}</span>
        </div>
        <div class="stat-item">
          <el-icon><circle-close-filled /></el-icon>
          <span>离线: {{ offlineCount }}</span>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="left-actions">
        <el-select
            v-model="statusFilter"
            placeholder="状态筛选"
            class="status-filter"
            @change="fetchDevices"
        >
          <el-option label="全部设备" value="ALL" />
          <el-option label="在线设备" value="ON" />
          <el-option label="离线设备" value="OFF" />
        </el-select>
      </div>

      <div class="right-actions">
        <el-button
            type="primary"
            icon="plus"
            @click="openCreateDialog"
            v-if="isAdmin"
        >
          创建设备
        </el-button>
        <el-button
            icon="refresh"
            @click="fetchDevices"
        >
          刷新
        </el-button>
      </div>
    </div>

    <!-- 设备表格 -->
    <el-table
        :data="devices"
        v-loading="loading"
        stripe
        style="width: 100%"
        class="device-table"
    >
      <el-table-column label="设备ID" min-width="200">
        <template #default="{ row }">
          <div class="device-id" @click="showDeviceDetail(row)">
            <el-icon><cpu /></el-icon>
            <span>{{ row.deviceId }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-progress
              type="circle"
              :percentage="row.status === 'ON' ? 100 : 0"
              :width="50"
              :color="row.status === 'ON' ? '#67c23a' : '#f56c6c'"
          >
            <template #default>
              <el-icon v-if="row.status === 'ON'" color="#67c23a" :size="20"><success-filled /></el-icon>
              <el-icon v-else color="#f56c6c" :size="20"><circle-close-filled /></el-icon>
            </template>
          </el-progress>
        </template>
      </el-table-column>

      <el-table-column label="创建时间" width="180" align="center">
        <template #default="{ row }">
          <div class="time-info">
            <el-icon><calendar /></el-icon>
            <span>{{ formatDate(row.createTime) }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="状态更新时间" width="180" align="center">
        <template #default="{ row }">
          <div class="time-info">
            <el-icon><clock /></el-icon>
            <span>{{ formatDate(row.updateTime) }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="240" align="center" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button
                v-if="isAdmin"
                @click="controlDevice(row)"
                :type="row.status === 'ON' ? 'warning' : 'success'"
                size="small"
                :loading="row.controlling"
            >
              {{ row.status === 'ON' ? '关闭' : '开启' }}
            </el-button>
            <el-button
                @click="showDeviceDetail(row)"
                type="primary"
                size="small"
            >
              查看详情
            </el-button>
            <el-button
                v-if="isAdmin"
                @click="deleteDevice(row.deviceId)"
                type="danger"
                size="small"
                icon="delete"
            />
          </el-button-group>
        </template>
      </el-table-column>

      <!-- 空状态 -->
      <template #empty>
        <el-empty
            :image-size="120"
            description="暂无设备数据"
        />
      </template>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-wrapper">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="totalElements"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="fetchDevices"
          @size-change="handleSizeChange"
      />
    </div>

    <!-- 创建设备对话框 -->
    <el-dialog
        v-model="createDialogVisible"
        title="创建设备"
        width="400px"
    >
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="设备ID" required>
          <div class="device-id-input">
            <el-input
                v-model="createForm.deviceId"
                placeholder="输入设备ID"
                clearable
            />
            <el-button
                type="primary"
                @click="testDeviceIdConnection"
                :loading="testingDeviceId"
            >
              测试连接
            </el-button>
          </div>
          <p class="form-tip">只能包含字母、数字、下划线和连字符</p>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button
            type="primary"
            @click="createDevice"
            :loading="creating"
        >
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 设备详情对话框 -->
    <el-dialog
        v-model="detailDialogVisible"
        :title="`设备详情 - ${currentDevice?.deviceId || ''}`"
        width="600px"
    >
      <div v-if="currentDevice" class="device-detail">
        <div class="detail-row">
          <div class="detail-label">设备ID:</div>
          <div class="detail-value">{{ currentDevice.deviceId }}</div>
        </div>

        <div class="detail-row">
          <div class="detail-label">设备状态:</div>
          <div class="detail-value">
            <el-tag :type="currentDevice.status === 'ON' ? 'success' : 'danger'" size="large">
              {{ currentDevice.status === 'ON' ? '在线' : '离线' }}
            </el-tag>
          </div>
        </div>

        <div class="detail-row">
          <div class="detail-label">创建时间:</div>
          <div class="detail-value">{{ formatDate(currentDevice.createTime) }}</div>
        </div>

        <div class="detail-row">
          <div class="detail-label">更新时间:</div>
          <div class="detail-value">{{ formatDate(currentDevice.updateTime) }}</div>
        </div>

        <div class="detail-row">
          <div class="detail-label">设备注册状态:</div>
          <div class="detail-value">
            <el-button
                v-if="isAdmin"
                @click="testDeviceConnection(currentDevice)"
                type="primary"
                size="small"
                :loading="currentDevice.testing"
            >
              测试连接
            </el-button>
          </div>
        </div>

        <div v-if="connectionTestMessage" class="test-result">
          <el-alert
              :title="connectionTestMessage"
              :type="connectionTestResult ? 'success' : 'error'"
              show-icon
          />
        </div>
      </div>

      <template #footer>
        <el-button type="primary" @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  ElMessage, ElMessageBox,
  ElIcon, ElProgress
} from 'element-plus'
import {
  Cpu, Calendar, Clock, CircleCheckFilled,
  CircleCloseFilled, SuccessFilled
} from '@element-plus/icons-vue'
import adminAPI from '@/api/admin.js'
import { useAuthStore } from '@/stores/auth'

// 响应式数据
const devices = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalElements = ref(0)
const statusFilter = ref('ALL')
const loading = ref(false)
const createDialogVisible = ref(false)
const createForm = ref({ deviceId: '' })
const creating = ref(false)
const detailDialogVisible = ref(false)
const currentDevice = ref(null)
const connectionTestResult = ref(false)
const connectionTestMessage = ref('')
const testingDeviceId = ref(false)

// 权限检查
const authStore = useAuthStore()
const isAdmin = computed(() => {
  return authStore.user?.role_id === 1
})

// 计算在线/离线设备数量
const onlineCount = computed(() => {
  return devices.value.filter(d => d.status === 'ON').length
})

const offlineCount = computed(() => {
  return devices.value.filter(d => d.status === 'OFF').length
})

// 生命周期钩子
onMounted(() => {
  fetchDevices()
})

// 获取设备列表
const fetchDevices = async () => {
  loading.value = true
  try {
    const response = await adminAPI.getDeviceList(
        currentPage.value - 1,
        pageSize.value,
        statusFilter.value === 'ALL' ? null : statusFilter.value,
        'createTime',
        'desc'
    )

    if (response.code === 'success') {
      devices.value = response.data.devices.map(device => ({
        ...device,
        controlling: false,
        testing: false
      }))
      totalElements.value = response.data.totalElements
    } else {
      ElMessage.error(response.msg || '获取设备列表失败')
    }
  } catch (error) {
    console.error("Error fetching devices:", error)
    ElMessage.error('获取设备列表失败')
  } finally {
    loading.value = false
  }
}

// 处理分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchDevices()
}

// 打开创建设备对话框
const openCreateDialog = () => {
  createForm.value.deviceId = ''
  createDialogVisible.value = true
}

// 创建设备
const createDevice = async () => {
  if (!createForm.value.deviceId) {
    ElMessage.warning('请输入设备ID')
    return
  }

  creating.value = true
  try {
    const response = await adminAPI.createDevice(createForm.value.deviceId)
    if (response.code === 'success') {
      ElMessage.success(`设备 ${createForm.value.deviceId} 创建成功`)
      createDialogVisible.value = false
      fetchDevices()
    } else {
      ElMessage.error(response.msg || '创建设备失败')
    }
  } catch (error) {
    console.error("Error creating device:", error)
    ElMessage.error('创建设备失败')
  } finally {
    creating.value = false
  }
}

// 删除设备
const deleteDevice = (deviceId) => {
  ElMessageBox.confirm(
      `确定要删除设备 ${deviceId} 吗？此操作不可恢复。`,
      '删除设备',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }
  ).then(async () => {
    try {
      const response = await adminAPI.deleteDevice(deviceId)
      if (response.code === 'success') {
        ElMessage.success(`设备 ${deviceId} 已删除`)
        fetchDevices()
      } else {
        ElMessage.error(response.msg || '删除设备失败')
      }
    } catch (error) {
      console.error("Error deleting device:", error)
      ElMessage.error('删除设备失败')
    }
  }).catch(() => {})
}

// 控制设备启停
const controlDevice = async (device) => {
  const targetStatus = device.status === 'ON' ? 'OFF' : 'ON'
  const action = targetStatus === 'ON' ? '开启' : '关闭'

  device.controlling = true

  try {
    const response = await adminAPI.controlDevice(device.deviceId, targetStatus)
    if (response.code === 'success') {
      ElMessage.success({
        message: `已发送${action}命令，设备状态将在几秒后更新`,
        duration: 3000
      })

      // 延迟刷新设备列表
      setTimeout(() => {
        fetchDevices()
      }, 3000)
    } else {
      ElMessage.error(response.msg || `${action}设备失败`)
    }
  } catch (error) {
    console.error("Error controlling device:", error)
    ElMessage.error(`${action}设备失败`)
  } finally {
    device.controlling = false
  }
}

// 测试设备连接
const testDeviceConnection = async (device) => {
  device.testing = true
  connectionTestMessage.value = ''

  try {
    const response = await adminAPI.testDeviceConnection(device.deviceId)
    if (response.code === 'success') {
      connectionTestResult.value = true
      connectionTestMessage.value = response.msg
      ElMessage.success(response.msg)
    } else {
      connectionTestResult.value = false
      connectionTestMessage.value = response.msg
      ElMessage.error(response.msg)
    }
  } catch (error) {
    console.error("Error testing device connection:", error)
    connectionTestResult.value = false
    connectionTestMessage.value = '测试连接失败'
    ElMessage.error('测试连接失败')
  } finally {
    device.testing = false
  }
}

// 测试设备ID连接（在创建设备对话框中）
const testDeviceIdConnection = async () => {
  if (!createForm.value.deviceId) {
    ElMessage.warning('请输入设备ID')
    return
  }

  testingDeviceId.value = true
  connectionTestMessage.value = ''

  try {
    const response = await adminAPI.testDeviceConnection(createForm.value.deviceId)
    if (response.code === 'success') {
      ElMessage.success(response.msg)
    } else {
      ElMessage.error(response.msg)
    }
  } catch (error) {
    console.error("Error testing device connection:", error)
    ElMessage.error('测试连接失败')
  } finally {
    testingDeviceId.value = false
  }
}

// 显示设备详情
const showDeviceDetail = async (device) => {
  loading.value = true
  try {
    const response = await adminAPI.getDeviceDetail(device.deviceId)
    if (response.code === 'success') {
      currentDevice.value = {
        ...response.data,
        testing: false
      }
      detailDialogVisible.value = true
      connectionTestMessage.value = ''
    } else {
      ElMessage.error(response.msg || '获取设备详情失败')
    }
  } catch (error) {
    console.error("Error fetching device detail:", error)
    ElMessage.error('获取设备详情失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}
</script>

<style scoped>
.device-management {
  padding: 24px;
  background: linear-gradient(135deg, #f8faff, #e6f0ff);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a3a6e;
  margin: 0;
  background: linear-gradient(90deg, #1a3a6e, #409eff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  font-size: 16px;
  color: #5b7ba8;
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #1a3a6e;
}

.stat-item .el-icon {
  font-size: 20px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.left-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.right-actions {
  display: flex;
  gap: 10px;
}

.status-filter {
  width: 140px;
}

.device-id {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  color: #1a3a6e;
  cursor: pointer;
  transition: all 0.3s;
  padding: 8px;
  border-radius: 6px;
}

.device-id:hover {
  background-color: #f0f7ff;
  transform: translateX(5px);
}

.device-id .el-icon {
  font-size: 20px;
  color: #409eff;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.time-info .el-icon {
  color: #909399;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin: 4px 0 0;
}

.device-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.device-detail {
  padding: 10px;
}

.detail-row {
  display: flex;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f4ff;
}

.detail-label {
  width: 120px;
  font-weight: 600;
  color: #1a3a6e;
}

.detail-value {
  flex: 1;
  color: #606266;
}

.test-result {
  margin-top: 20px;
  padding: 10px;
  background: #f8faff;
  border-radius: 8px;
}

.device-id-input {
  display: flex;
  gap: 10px;
}

.device-id-input .el-button {
  min-width: 100px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
  }

  .left-actions, .right-actions {
    width: 100%;
  }

  .device-management {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .header-stats {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
