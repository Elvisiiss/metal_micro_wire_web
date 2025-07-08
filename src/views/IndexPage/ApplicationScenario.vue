<template>
  <div class="scenario-management">
    <!-- 页面标题 -->
    <div class="page-header-custom">
      <div class="header-content">
        <span class="page-title">系统仪表盘</span>
        <span class="page-subtitle">金属微丝质量检测系统数据概览</span>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-row :gutter="20">
        <el-col :span="5">
          <el-input
              v-model="searchParams.scenarioNameKeyword"
              placeholder="搜索场景名称"
              clearable
              @clear="fetchScenarios"
              @keyup.enter="fetchScenarios"
          >
            <template #append>
              <el-button icon="search" @click="fetchScenarios" />
            </template>
          </el-input>
        </el-col>

        <el-col :span="5">
          <el-select
              v-model="searchParams.wireType"
              placeholder="选择线材类型"
              clearable
              @change="fetchScenarios"
          >
            <el-option
                v-for="type in wireTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
            />
          </el-select>
        </el-col>

        <el-col :span="4">
          <el-select
              v-model="searchParams.sortBy"
              placeholder="排序字段"
              @change="fetchScenarios"
          >
            <el-option label="创建时间" value="createTime" />
            <el-option label="更新时间" value="updateTime" />
            <el-option label="场景名称" value="scenarioName" />
          </el-select>
        </el-col>

        <el-col :span="4">
          <el-select
              v-model="searchParams.sortDirection"
              placeholder="排序方向"
              @change="fetchScenarios"
          >
            <el-option label="升序 (ASC)" value="asc" />
            <el-option label="降序 (DESC)" value="desc" />
          </el-select>
        </el-col>

        <el-col :span="6" class="text-right">
          <el-button type="info" @click="resetSearch">重置</el-button>
          <el-button type="primary" @click="openCreateForm" v-if="isAdmin">
            新增场景
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 场景列表 -->
    <el-table
        :data="scenarios"
        v-loading="loading"
        stripe
        border
        style="width: 100%; margin-top: 20px"
    >
      <el-table-column prop="scenarioCode" label="场景编号" width="100" align="center" />
      <el-table-column prop="scenarioName" label="场景名称" min-width="180" />

      <el-table-column prop="wireType" label="线材类型" width="120" align="center">
        <template #default="{ row }">
          <el-tag :color="getWireTagColor(row.wireType)" effect="dark">
            {{ row.wireType }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="电导率(MS/m)" width="180" align="center">
        <template #default="{ row }">
          <div class="param-cell">
            <div>△上限：{{ formatNumber(row.conductivityMax) }}<template v-if="row.conductivityMax !== null"> MS/m</template></div>
            <div>▽下限：{{ formatNumber(row.conductivityMin) }}<template v-if="row.conductivityMin !== null"> MS/m</template></div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="延展率(δ)" width="120" align="center">
        <template #default="{ row }">
          <div class="param-cell">
            <div>△上限：{{ formatNumber(row.extensibilityMax, 'extensibility') }}<template v-if="row.extensibilityMax !== null"> δ</template></div>
            <div>▽下限：{{ formatNumber(row.extensibilityMin, 'extensibility') }}<template v-if="row.extensibilityMin !== null"> δ</template></div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="重量(g)" width="140" align="center">
        <template #default="{ row }">
          <div class="param-cell">
            <div>△上限：{{ formatNumber(row.weightMax) }}<template v-if="row.weightMax !== null"> g</template></div>
            <div>▽下限：{{ formatNumber(row.weightMin) }}<template v-if="row.weightMin !== null"> g</template></div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="直径(mm)" width="140" align="center">
        <template #default="{ row }">
          <div class="param-cell">
            <div>△上限：{{ formatNumber(row.diameterMax) }}<template v-if="row.diameterMax !== null"> mm</template></div>
            <div>▽下限：{{ formatNumber(row.diameterMin) }}<template v-if="row.diameterMin !== null"> mm</template></div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="创建时间" width="180" align="center">
        <template #default="{ row }">
          <div class="time-cell">
            <div>{{ formatDate(row.createTime).date }}</div>
            <div>{{ formatDate(row.createTime).time }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="更新时间" width="180" align="center">
        <template #default="{ row }">
          <div class="time-cell">
            <div>{{ formatDate(row.updateTime).date }}</div>
            <div>{{ formatDate(row.updateTime).time }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="240" fixed="right" align="center" v-if="isAdmin">
        <template #default="{ row }">
          <el-button size="small" @click="openEditForm(row)">编辑</el-button>
          <el-button size="small" type="warning" @click="reEvaluateScenario(row.scenarioCode)">
            重新检测
          </el-button>
          <el-button size="small" type="danger" @click="deleteScenario(row.scenarioCode)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalElements"
          @size-change="handleSizeChange"
          @current-change="fetchScenarios"
          :pager-count="5"
      />
    </div>

    <!-- 表单弹窗 -->
    <el-dialog
        v-model="formVisible"
        :title="formType === 'create' ? '创建应用场景' : '更新应用场景'"
        width="600px"
    >
      <el-form :model="formData" label-width="120px" label-position="left">
        <el-form-item label="场景编号" v-if="formType === 'create'">
          <el-input
              v-model="formData.scenarioCode"
              placeholder="两位数字，如01, 02"
              maxlength="2"
          />
        </el-form-item>

        <el-form-item label="场景名称">
          <el-input v-model="formData.scenarioName" placeholder="请输入场景名称" />
        </el-form-item>

        <el-form-item label="线材类型">
          <el-select v-model="formData.wireType" placeholder="请选择线材类型">
            <el-option
                v-for="type in wireTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
            />
          </el-select>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="电导率下限">
              <el-input-number
                  v-model="formData.conductivityMin"
                  :min="0"
                  :step="0.1"
                  controls-position="right"
              />
              <span class="unit-text">MS/m</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电导率上限">
              <el-input-number
                  v-model="formData.conductivityMax"
                  :min="0"
                  :step="0.1"
                  controls-position="right"
              />
              <span class="unit-text">MS/m</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="延展率下限">
              <el-input-number
                  v-model="formData.extensibilityMin"
                  :min="0"
                  :step="1"
                  controls-position="right"
              />
              <span class="unit-text">δ</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="延展率上限">
              <el-input-number
                  v-model="formData.extensibilityMax"
                  :min="0"
                  :step="1"
                  controls-position="right"
              />
              <span class="unit-text">δ</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="重量下限">
              <el-input-number
                  v-model="formData.weightMin"
                  :min="0"
                  :step="0.1"
                  controls-position="right"
              />
              <span class="unit-text">g</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重量上限">
              <el-input-number
                  v-model="formData.weightMax"
                  :min="0"
                  :step="0.1"
                  controls-position="right"
              />
              <span class="unit-text">g</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="直径下限">
              <el-input-number
                  v-model="formData.diameterMin"
                  :min="0"
                  :step="0.01"
                  :precision="2"
                  controls-position="right"
              />
              <span class="unit-text">mm</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="直径上限">
              <el-input-number
                  v-model="formData.diameterMax"
                  :min="0"
                  :step="0.01"
                  :precision="2"
                  controls-position="right"
              />
              <span class="unit-text">mm</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">
          {{ formType === 'create' ? '创建' : '更新' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import scenarioAPI from '@/api/scenario.js'
import { useAuthStore } from '@/stores/auth'

// 认证信息
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.role_id === 1)

// 响应式数据
const scenarios = ref([])
const loading = ref(false)
const currentPage = ref(1) // 从1开始的分页
const pageSize = ref(20)
const totalPages = ref(0)
const totalElements = ref(0)

// 搜索参数
const searchParams = ref({
  wireType: '',
  scenarioNameKeyword: '',
  sortBy: 'createTime',
  sortDirection: 'asc' // 默认升序
})

// 表单数据
const formVisible = ref(false)
const formType = ref('create') // 'create' 或 'update'
const formData = ref({
  scenarioCode: '',
  scenarioName: '',
  wireType: 'Cu',
  conductivityMin: 0,
  conductivityMax: 0,
  extensibilityMin: 0,
  extensibilityMax: 0,
  weightMin: 0,
  weightMax: 0,
  diameterMin: 0,
  diameterMax: 0
})

// 线材类型选项
const wireTypes = [
  { value: 'Cu', label: '铜 (Cu)' },
  { value: 'Al', label: '铝 (Al)' },
  { value: 'Ni', label: '镍 (Ni)' },
  { value: 'Ti', label: '钛 (Ti)' },
  { value: 'Zn', label: '锌 (Zn)' }
]

// 格式化日期时间
const formatDate = (dateString) => {
  if (!dateString) return { date: '', time: '' }

  try {
    const dateObj = new Date(dateString)
    const date = dateObj.toISOString().split('T')[0]
    const time = dateObj.toTimeString().split(' ')[0]
    return { date, time }
  } catch (e) {
    console.error('日期格式化错误:', e)
    const [date, timePart] = dateString.split('T')
    const time = timePart ? timePart.substring(0, 8) : ''
    return { date, time }
  }
}

// 数值格式化函数
const formatNumber = (value, type = 'default') => {
  if (value === null || value === undefined || value === '') return ''

  const num = parseFloat(value)
  if (isNaN(num)) return ''

  switch (type) {
    case 'extensibility':
      return num.toFixed(1)
    case 'conductivity':
    case 'weight':
    case 'diameter':
    default:
      return num.toFixed(2)
  }
}

// 获取线材类型对应的标签颜色
const getWireTagColor = (type) => {
  const colorMap = {
    'Cu': '#b87333', // 铜色 - 古铜色
    'Al': '#A8A8A8', // 铝色 - 银灰色
    'Ni': '#C0C0C0', // 镍色 - 银色
    'Ti': '#808080', // 钛色 - 深灰色
    'Zn': '#7CB9E8'  // 锌色 - 天蓝色
  }
  return colorMap[type] || '#909399' // 默认灰色
}

// 加载应用场景列表
const fetchScenarios = async () => {
  loading.value = true
  try {
    // 将前端页码(1-based)转换为后端API的页码(0-based)
    const apiPage = currentPage.value - 1

    const response = await scenarioAPI.getScenarioList(
        apiPage,
        pageSize.value,
        searchParams.value.wireType,
        searchParams.value.scenarioNameKeyword,
        searchParams.value.sortBy,
        searchParams.value.sortDirection
    )

    scenarios.value = response.data.scenarios
    // 将后端返回的0-based页码转换为1-based
    currentPage.value = response.data.currentPage + 1
    pageSize.value = response.data.pageSize
    totalPages.value = response.data.totalPages
    totalElements.value = response.data.totalElements
  } catch (error) {
    console.error('加载应用场景失败:', error)
    ElMessage.error('加载应用场景失败: ' + (error.response?.data?.msg || error.message))
  } finally {
    loading.value = false
  }
}

// 处理每页条数变化
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1 // 重置到第一页
  fetchScenarios()
}

// 重置搜索
const resetSearch = () => {
  searchParams.value = {
    wireType: '',
    scenarioNameKeyword: '',
    sortBy: 'createTime',
    sortDirection: 'asc' // 重置为升序
  }
  currentPage.value = 1 // 重置到第一页
  fetchScenarios()
}

// 打开创建表单
const openCreateForm = () => {
  formType.value = 'create'
  formData.value = {
    scenarioCode: '',
    scenarioName: '',
    wireType: 'Cu',
    conductivityMin: 0,
    conductivityMax: 0,
    extensibilityMin: 0,
    extensibilityMax: 0,
    weightMin: 0,
    weightMax: 0,
    diameterMin: 0,
    diameterMax: 0
  }
  formVisible.value = true
}

// 打开编辑表单
const openEditForm = (scenario) => {
  formType.value = 'update'
  formData.value = { ...scenario }
  formVisible.value = true
}

// 提交表单
const submitForm = async () => {
  let response;
  try {
    if (formType.value === 'create') {
      response = await scenarioAPI.createScenario(formData.value)
    } else {
      // 更新时移除场景编号字段
      const { scenarioCode, ...updateData } = formData.value
      response = await scenarioAPI.updateScenario(scenarioCode, updateData)
    }

    // 重点修改：检查后端返回的业务错误
    if (response.code === 'Error') {
      // 业务逻辑错误（如上下限校验失败）
      ElMessage.error(`操作失败：${response.msg || '未知错误'}`)
      // 保持表单打开状态
      formVisible.value = true
      return
    }

    // 成功处理
    ElMessage.success(formType.value === 'create' ? '应用场景创建成功' : '应用场景更新成功')
    formVisible.value = false
    fetchScenarios()
  } catch (error) {
    // 网络错误或其他异常处理
    console.error('操作失败:', error)
    const errorData = error.response?.data
    let errorMsg = '操作失败'

    if (errorData) {
      // 处理参数校验错误（多个字段错误）
      if (errorData.data && typeof errorData.data === 'object') {
        const errorMessages = Object.values(errorData.data)
        errorMsg = `参数错误：${errorMessages.join('；')}`
      }
      // 处理单个错误消息
      else if (errorData.msg) {
        errorMsg = errorData.msg
      }
    }

    ElMessage.error(errorMsg)
    formVisible.value = true // 保持表单打开
  }
}

// 删除场景
const deleteScenario = async (scenarioCode) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除应用场景 ${scenarioCode} 吗？此操作不可恢复。`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    await scenarioAPI.deleteScenario(scenarioCode)
    ElMessage.success('应用场景已删除')
    fetchScenarios()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败: ' + (error.response?.data?.msg || error.message))
    }
  }
}

// 新增：重新评估场景下的所有线材数据
const reEvaluateScenario = async (scenarioCode) => {
  try {
    await ElMessageBox.confirm(
        `确定要重新评估应用场景 ${scenarioCode} 下的所有线材数据吗？此操作可能需要较长时间。`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    loading.value = true
    const response = await scenarioAPI.reEvaluateScenario(scenarioCode)
    ElMessage.success(response.msg || '重新评估操作已提交')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重新评估失败:', error)
      ElMessage.error('重新评估失败: ' + (error.response?.data?.msg || error.message))
    }
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchScenarios()
})
</script>

<style scoped>
.scenario-management {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.page-header p {
  margin: 5px 0 0;
  font-size: 14px;
  color: #909399;
}

.action-bar {
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.text-right {
  text-align: right;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 参数单元格样式 */
.param-cell {
  line-height: 1.6;
  font-size: 13px;
}

.param-cell div:first-child {
  margin-bottom: 4px;
}

/* 时间单元格样式 */
.time-cell {
  line-height: 1.6;
}

.time-cell div:first-child {
  margin-bottom: 4px;
  font-weight: 500;
}

.unit-text {
  margin-left: 5px;
  color: #606266;
  font-size: 14px;
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

.page-header-custom {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 2px solid #e6f0ff;
}
</style>
