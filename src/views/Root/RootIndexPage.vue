<template>
  <div class="user-management">
    <!-- 页面标题区域 -->
    <div class="page-header-custom">
      <div class="header-content">
        <span class="page-title">用户管理</span>
        <span class="page-subtitle">管理系统中的所有用户信息</span>
      </div>
      <div class="header-stats">
        <el-tag>当前页: {{ users.length }} 用户</el-tag>
        <el-tag v-if="isBatchMode && selectedUserIds.length > 0" type="success">
          已选择: {{ selectedUserIds.length }}
        </el-tag>
      </div>
    </div>

    <!-- 操作栏 -->
    <el-row :gutter="16" class="action-bar">
      <el-col :span="10">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索用户名或邮箱..."
            @keyup.enter="fetchUsers"
            clearable
            class="search-input"
        >
          <template #append>
            <el-button @click="fetchUsers" :icon="Search">搜索</el-button>
          </template>
        </el-input>
      </el-col>

      <el-col :span="2">
        <div class="sort-controls">
          <el-select
              v-model="sortOption"
              placeholder="排序方式"
              @change="handleSortChange"
              class="sort-select"
          >
            <el-option label="用户ID升序" value="id-asc" />
            <el-option label="用户ID降序" value="id-desc" />
            <el-option label="创建时间升序" value="createTime-asc" />
            <el-option label="创建时间降序" value="createTime-desc" />
          </el-select>
        </div>
      </el-col>

      <el-col :span="12" style="text-align: right;">
        <transition name="batch-actions" mode="out-in">
          <el-button-group v-if="isBatchMode" key="batch" class="batch-actions">
            <el-button @click="selectCurrentPage" size="small">
              {{ areAllCurrentPageSelected ? '取消全选' : '全选本页' }}
            </el-button>
            <el-button
                @click="batchEnable"
                type="success"
                size="small"
                :disabled="selectedDisabledCount === 0"
            >
              启用 ({{ selectedDisabledCount }})
            </el-button>
            <el-button
                @click="batchDisable"
                type="warning"
                size="small"
                :disabled="selectedEnabledCount === 0"
            >
              禁用 ({{ selectedEnabledCount }})
            </el-button>
            <el-button
                @click="batchPromote"
                type="primary"
                size="small"
                :disabled="selectedNormalUserCount === 0"
            >
              提权 ({{ selectedNormalUserCount }})
            </el-button>
            <el-button
                @click="batchDemote"
                type="danger"
                size="small"
                :disabled="selectedAdminCount === 0"
            >
              降权 ({{ selectedAdminCount }})
            </el-button>
          </el-button-group>
        </transition>

        <el-button
            @click="toggleBatchMode"
            :type="isBatchMode ? 'danger' : 'primary'"
            plain
        >
          {{ isBatchMode ? '取消批量操作' : '批量操作' }}
        </el-button>
      </el-col>
    </el-row>

    <!-- 用户表格 -->
    <el-table
        ref="tableRef"
        :data="users"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        stripe
        style="width: 100%"
    >
      <el-table-column
          v-if="isBatchMode"
          type="selection"
          width="55"
          :selectable="() => true"
      />

      <el-table-column prop="id" label="ID" width="80" align="center">
        <template #default="{ row }">
          <el-tag size="small" type="info">#{{ row.id }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="userName" label="用户名" min-width="120">
        <template #default="{ row }">
          <div class="user-info">
            <el-avatar :size="32" class="user-avatar">
              {{ row.userName.charAt(0).toUpperCase() }}
            </el-avatar>
            <span class="user-name">{{ row.userName }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />

      <el-table-column prop="roleId" label="角色" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.roleId === 1 ? 'warning' : 'info'" size="small">
            {{ getRoleName(row.roleId) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 0 ? 'success' : 'danger'" size="small">
            {{ row.status === 0 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="createTime" label="创建时间" width="180" align="center">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>

      <el-table-column v-if="!isBatchMode" label="操作" width="160" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
              @click.stop="toggleUserStatus(row)"
              :type="row.status === 0 ? 'warning' : 'success'"
              size="small"
              plain
          >
            {{ row.status === 0 ? '禁用' : '启用' }}
          </el-button>
          <el-button
              @click.stop="changeUserRole(row)"
              :type="row.roleId === 1 ? 'danger' : 'primary'"
              size="small"
              plain
          >
            {{ row.roleId === 1 ? '降权' : '提权' }}
          </el-button>
        </template>
      </el-table-column>

      <!-- 空状态 -->
      <template #empty>
        <el-empty
            :image-size="120"
            :description="searchKeyword ? '没有找到匹配的用户' : '暂无用户数据'"
        />
      </template>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-wrapper" v-if="totalPages > 1">
      <el-config-provider :locale="zhCn">
        <el-pagination
            v-model:current-page="currentPageForEl"
            :page-size="pageSize"
            :total="totalPages * pageSize"
            layout="prev, pager, next, jumper"
            @current-change="handlePageChange"
            :small="false"
            :prev-text="'上一页'"
            :next-text="'下一页'"
            class="custom-pagination"
        />
      </el-config-provider>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import rootAPI from '@/api/root.js'

// 响应式数据
const users = ref([])
const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(1)
const searchKeyword = ref('')
const isBatchMode = ref(false)
const selectedUserIds = ref([])
const loading = ref(false)
const sortBy = ref('id')
const sortDir = ref('asc')
const sortOption = ref('id-asc')
const tableRef = ref()

// Element Plus 分页需要的数据
const currentPageForEl = computed({
  get() {
    return currentPage.value + 1
  },
  set(val) {
    currentPage.value = val - 1
  }
})

// 计算属性
const areAllSelected = computed(() => {
  return users.value.length > 0 &&
      users.value.every(user => selectedUserIds.value.includes(user.id))
})

// 计算当前页是否全选
const areAllCurrentPageSelected = computed(() => {
  const currentPageIds = users.value.map(user => user.id)
  return currentPageIds.length > 0 &&
         currentPageIds.every(id => selectedUserIds.value.includes(id))
})

// 计算选中用户中各状态的数量
const selectedUsers = computed(() => {
  return users.value.filter(user => selectedUserIds.value.includes(user.id))
})

const selectedEnabledCount = computed(() => {
  return selectedUsers.value.filter(user => user.status === 0).length
})

const selectedDisabledCount = computed(() => {
  return selectedUsers.value.filter(user => user.status === 1).length
})

const selectedAdminCount = computed(() => {
  return selectedUsers.value.filter(user => user.roleId === 1).length
})

const selectedNormalUserCount = computed(() => {
  return selectedUsers.value.filter(user => user.roleId === 0).length
})

// 生命周期钩子
onMounted(() => {
  fetchUsers()
})

// 方法
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await rootAPI.getUserList(
        currentPage.value,
        pageSize.value,
        searchKeyword.value,
        sortBy.value,
        sortDir.value
    );
    users.value = response.data.content;
    totalPages.value = response.data.totalPages || 1;
  } catch (error) {
    console.error("Error fetching users:", error);
    users.value = [];
    totalPages.value = 1;
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
};

// Element Plus 分页处理
const handlePageChange = (page) => {
  currentPage.value = page - 1
  fetchUsers()
}

// Element Plus 表格选择处理
const handleSelectionChange = (selection) => {
  selectedUserIds.value = selection.map(user => user.id)
}

// Element Plus 行点击处理
const handleRowClick = (row) => {
  if (isBatchMode.value) {
    const isSelected = selectedUserIds.value.includes(row.id)
    if (isSelected) {
      // 取消选择
      tableRef.value.toggleRowSelection(row, false)
      selectedUserIds.value = selectedUserIds.value.filter(id => id !== row.id)
    } else {
      // 选择
      tableRef.value.toggleRowSelection(row, true)
      selectedUserIds.value.push(row.id)
    }
  }
}

const toggleUserStatus = async (user) => {
  try {
    await rootAPI.updateUserStatus(user.id, user.status === 0 ? 1 : 0)
    const index = users.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users.value[index].status = user.status === 0 ? 1 : 0
    }
    ElMessage.success(`用户状态已${user.status === 0 ? '禁用' : '启用'}`)
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const changeUserRole = async (user) => {
  try {
    await rootAPI.updateUserRole(user.id, user.roleId === 0 ? 1 : 0)
    const index = users.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users.value[index].roleId = user.roleId === 1 ? 0 : 1
    }
    ElMessage.success(`用户权限已${user.roleId === 1 ? '降级' : '提升'}`)
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const toggleBatchMode = () => {
  isBatchMode.value = !isBatchMode.value
  if (!isBatchMode.value) {
    // 取消批量操作时，清除所有选择状态
    selectedUserIds.value = []
    // 清除表格的选择状态
    if (tableRef.value) {
      tableRef.value.clearSelection()
    }
  }
}

const selectCurrentPage = () => {
  const currentPageIds = users.value.map(user => user.id)
  const currentPageUsers = users.value

  if (areAllCurrentPageSelected.value) {
    // 如果当前页已全选，则取消当前页的选中
    currentPageUsers.forEach(user => {
      tableRef.value.toggleRowSelection(user, false)
    })
    selectedUserIds.value = selectedUserIds.value.filter(
        id => !currentPageIds.includes(id)
    )
  } else {
    // 否则选中当前页所有用户
    currentPageUsers.forEach(user => {
      tableRef.value.toggleRowSelection(user, true)
    })
    const combinedIds = new Set([...selectedUserIds.value, ...currentPageIds])
    selectedUserIds.value = Array.from(combinedIds)
  }
}

const batchDisable = async () => {
  if (selectedUserIds.value.length === 0) return
  try {
    await rootAPI.batchUpdateUsers('disable', selectedUserIds.value.join(','))
    fetchUsers()
    ElMessage.success(`已禁用 ${selectedUserIds.value.length} 个用户`)
    selectedUserIds.value = []
  } catch (error) {
    console.error('批量禁用失败', error)
    ElMessage.error('批量禁用失败')
  }
}

const batchEnable = async () => {
  if (selectedUserIds.value.length === 0) return
  try {
    await rootAPI.batchUpdateUsers('enable', selectedUserIds.value.join(','))
    fetchUsers()
    ElMessage.success(`已启用 ${selectedUserIds.value.length} 个用户`)
    selectedUserIds.value = []
  } catch (error) {
    console.error('批量启用失败', error)
    ElMessage.error('批量启用失败')
  }
}

const batchPromote = async () => {
  if (selectedUserIds.value.length === 0) return
  try {
    await rootAPI.batchUpdateUsers('promote', selectedUserIds.value.join(','))
    fetchUsers()
    ElMessage.success(`已提权 ${selectedUserIds.value.length} 个用户`)
    selectedUserIds.value = []
  } catch (error) {
    console.error('批量提权失败', error)
    ElMessage.error('批量提权失败')
  }
}

const batchDemote = async () => {
  if (selectedUserIds.value.length === 0) return
  try {
    await rootAPI.batchUpdateUsers('demote', selectedUserIds.value.join(','))
    fetchUsers()
    ElMessage.success(`已降权 ${selectedUserIds.value.length} 个用户`)
    selectedUserIds.value = []
  } catch (error) {
    console.error('批量降权失败', error)
    ElMessage.error('批量降权失败')
  }
}

const getRoleName = (roleId) => {
  return roleId === 1 ? '管理员' : '普通用户'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 处理排序选择变化
const handleSortChange = (value) => {
  const [field, direction] = value.split('-')
  sortBy.value = field
  sortDir.value = direction
  fetchUsers()
}
</script>

<style scoped>
.user-management {
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

.action-bar {
  margin-bottom: 20px;
}

/* 排序控件样式 */
.sort-controls {
  width: 100%;
}

.sort-select {
  width: 100%;
  min-width: 120px;
}

.sort-controls :deep(.el-select) {
  width: 100%;
}

.sort-controls :deep(.el-select .el-input__inner) {
  font-size: 14px;
  text-align: center;
}

.sort-controls :deep(.el-input__wrapper) {
  background-color: #ffffff;
  border: 2px solid #d4e8ff;
  transition: all 0.3s ease;
  border-radius: 6px;
}

.sort-controls :deep(.el-input__wrapper:hover) {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.sort-controls :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
}

/* 搜索框样式优化 */
.search-input :deep(.el-input__wrapper) {
  background-color: #ffffff;
  border: 2px solid #d4e8ff;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.search-input :deep(.el-input__wrapper:hover) {
  background-color: #fff;
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.search-input :deep(.el-input__wrapper.is-focus) {
  background-color: #fff;
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
}

/* 搜索按钮突出样式 */
.search-input :deep(.el-input-group__append) {
  background: linear-gradient(135deg, #409eff, #367bd6);
  border: none;
  border-radius: 0 8px 8px 0;
  border-left: none;
  box-shadow: none;
}

.search-input :deep(.el-input-group__append .el-button) {
  background: transparent;
  border: none;
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border-left: none;
}

.search-input :deep(.el-input-group__append .el-button:hover) {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

/* 移除搜索框和按钮之间的分割线 */
.search-input :deep(.el-input__wrapper) {
  border-right: none;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  border-right: none;
}

.search-input :deep(.el-input-group__append) {
  border-left: none;
}

.batch-actions {
  margin-right: 10px;
}

.batch-actions-enter-active,
.batch-actions-leave-active {
  transition: all 0.3s ease;
}

.batch-actions-enter-from,
.batch-actions-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  flex-shrink: 0;
  background: linear-gradient(135deg, #409eff, #367bd6);
  color: white;
  font-weight: bold;
}

.user-name {
  font-weight: 500;
  color: #1a3a6e;
}

/* 表格样式优化 - 减少灰色使用 */
:deep(.el-table) {
  background-color: #ffffff;
  border: 1px solid #e6f0ff;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__header) {
  background: linear-gradient(135deg, #f8faff, #e6f0ff);
}

:deep(.el-table__header th) {
  background: transparent;
  color: #1a3a6e;
  font-weight: 600;
  border-bottom: 2px solid #d4e8ff;
}

:deep(.el-table__body tr) {
  background-color: #ffffff;
  transition: all 0.3s ease;
}

:deep(.el-table__body tr:hover) {
  background-color: #f8faff;
}

:deep(.el-table__body tr.el-table__row--striped) {
  background-color: #f8faff;
}

:deep(.el-table__body tr.el-table__row--striped:hover) {
  background-color: #e6f0ff;
}

:deep(.el-table__body td) {
  border-bottom: 1px solid #f0f4ff;
  color: #333;
}

/* 分页样式优化 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.custom-pagination :deep(.el-pagination__jump) {
  color: #1a3a6e;
}

.custom-pagination :deep(.el-pagination__classifier) {
  color: #1a3a6e;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-management {
    padding: 12px;
  }

  .header-stats {
    flex-wrap: wrap;
  }

  .batch-actions {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>
