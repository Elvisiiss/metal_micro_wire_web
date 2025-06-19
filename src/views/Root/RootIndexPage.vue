<template>
  <div class="user-management">
    <h2>用户管理</h2>

    <div class="action-bar">
      <div class="search-box">
        <input
            type="text"
            v-model="searchKeyword"
            placeholder="搜索用户名或邮箱"
            @keyup.enter="fetchUsers"
        >
        <button @click="fetchUsers" class="search-btn">搜索</button>
      </div>

      <div v-if="isBatchMode" class="batch-action-buttons">
        <button @click="batchDisable" class="batch-action-btn disable">禁用</button>
        <button @click="batchEnable" class="batch-action-btn enable">启用</button>
        <button @click="batchPromote" class="batch-action-btn promote">提权</button>
        <button @click="batchDemote" class="batch-action-btn demote">降权</button>
        <button @click="selectCurrentPage" class="batch-action-btn select-page">全选本页</button>
      </div>

      <button @click="toggleBatchMode" class="batch-btn">
        {{ isBatchMode ? '取消批量修改' : '批量修改' }}
      </button>
    </div>

    <div class="user-table-container">
      <table class="user-table">
        <thead>
        <tr>
          <th v-if="isBatchMode" style="width: 40px;">
            <input
                type="checkbox"
                :checked="areAllSelected"
                @change="selectCurrentPage"
            >
          </th>
          <th>ID</th>
          <th>用户名</th>
          <th>邮箱</th>
          <th>角色</th>
          <th>状态</th>
          <th>创建时间</th>
          <th v-if="!isBatchMode">操作</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="user in users"
            :key="user.id"
            @click="isBatchMode ? toggleSelectUser(user.id) : null"
            :class="{ 'selected-row': isBatchMode && selectedUserIds.includes(user.id) }"
        >
          <td v-if="isBatchMode">
            <input
                type="checkbox"
                :checked="selectedUserIds.includes(user.id)"
                @click.stop="toggleSelectUser(user.id)"
            >
          </td>
          <td>{{ user.id }}</td>
          <td>{{ user.userName }}</td>
          <td>{{ user.email }}</td>
          <td>{{ getRoleName(user.roleId) }}</td>
          <td>
              <span :class="['status-badge', user.status === 0 ? 'active' : 'inactive']">
                {{ user.status === 0 ? '启用' : '禁用' }}
              </span>
          </td>
          <td>{{ formatDate(user.createTime) }}</td>
          <td v-if="!isBatchMode" class="actions">
            <button @click="toggleUserStatus(user)" class="status-btn">
              {{ user.status === 0 ? '禁用' : '启用' }}
            </button>
            <button
                @click="changeUserRole(user)"
                class="role-btn"
                :class="{ 'admin': user.roleId === 1 }"
            >
              {{ user.roleId === 1 ? '降权' : '提权' }}
            </button>
          </td>
        </tr>
        </tbody>
      </table>

      <div class="pagination" v-if="totalPages > 1">
        <button @click="prevPage" :disabled="currentPage === 0">
          上一页
        </button>
        <span>第 {{ currentPage + 1 }} 页 / 共 {{ totalPages }} 页</span>
        <button @click="nextPage" :disabled="currentPage === totalPages - 1">
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import rootAPI from '@/api/root.js'

// 响应式数据
const users = ref([])
const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(1)
const searchKeyword = ref('')
const isBatchMode = ref(false)
const selectedUserIds = ref([])

// 计算属性
const areAllSelected = computed(() => {
  return users.value.length > 0 &&
      users.value.every(user => selectedUserIds.value.includes(user.id))
})

// 生命周期钩子
onMounted(() => {
  fetchUsers()
})

// 方法
const fetchUsers = async () => {
  try {
    const response = await rootAPI.getUserList(currentPage.value, pageSize.value, searchKeyword.value);
    users.value = response.data.content;
    totalPages.value = response.data.totalPages || 1;
  } catch (error) {
    console.error("Error fetching users:", error);
    users.value = [];
    totalPages.value = 1;
  }
};

const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
    fetchUsers()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
    fetchUsers()
  }
}

const toggleUserStatus = async (user) => {
  await rootAPI.updateUserStatus(user.id, user.status === 0 ? 1 : 0)
  const index = users.value.findIndex(u => u.id === user.id)
  if (index !== -1) {
    users.value[index].status = user.status === 0 ? 1 : 0
  }
}

const changeUserRole = async (user) => {
  await rootAPI.updateUserRole(user.id, user.roleId === 0 ? 1 : 0)
  const index = users.value.findIndex(u => u.id === user.id)
  if (index !== -1) {
    users.value[index].roleId = user.roleId === 1 ? 0 : 1
  }
}

const toggleBatchMode = () => {
  isBatchMode.value = !isBatchMode.value
  if (!isBatchMode.value) {
    selectedUserIds.value = []
  }
}

const toggleSelectUser = (userId) => {
  const index = selectedUserIds.value.indexOf(userId)
  if (index === -1) {
    selectedUserIds.value.push(userId)
  } else {
    selectedUserIds.value.splice(index, 1)
  }
}

const selectCurrentPage = () => {
  const currentPageIds = users.value.map(user => user.id);

  // 判断当前页是否已全部选中
  const isCurrentPageAllSelected = currentPageIds.every(id =>
      selectedUserIds.value.includes(id)
  );

  if (isCurrentPageAllSelected) {
    // 如果当前页已全选，则只移除当前页的选中
    selectedUserIds.value = selectedUserIds.value.filter(
        id => !currentPageIds.includes(id)
    );
  } else {
    // 否则添加当前页所有用户到选中列表
    const combinedIds = new Set([...selectedUserIds.value, ...currentPageIds]);
    selectedUserIds.value = Array.from(combinedIds);
  }
}

const batchDisable = async () => {
  if (selectedUserIds.value.length === 0) return
  try {
    await rootAPI.batchUpdateUsers('disable', selectedUserIds.value.join(','))
    fetchUsers()
  } catch (error) {
    console.error('批量禁用失败', error)
  }
}

const batchEnable = async () => {
  if (selectedUserIds.value.length === 0) return
  try {
    await rootAPI.batchUpdateUsers('enable', selectedUserIds.value.join(','))
    fetchUsers()
  } catch (error) {
    console.error('批量启用失败', error)
  }
}

const batchPromote = async () => {
  if (selectedUserIds.value.length === 0) return
  try {
    await rootAPI.batchUpdateUsers('promote', selectedUserIds.value.join(','))
    fetchUsers()
  } catch (error) {
    console.error('批量提权失败', error)
  }
}

const batchDemote = async () => {
  if (selectedUserIds.value.length === 0) return
  try {
    await rootAPI.batchUpdateUsers('demote', selectedUserIds.value.join(','))
    fetchUsers()
  } catch (error) {
    console.error('批量降权失败', error)
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
</script>

<style scoped>
.user-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  align-items: center;
  gap: 10px;
}

.search-box {
  display: flex;
  gap: 10px;
  flex-grow: 1;
}

.search-box input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 250px;
}

.batch-action-buttons {
  display: flex;
  gap: 8px;
}

.add-btn, .search-btn, .batch-btn, .batch-action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
}

.add-btn {
  background-color: #409eff;
  color: white;
}

.search-btn {
  background-color: #67c23a;
  color: white;
}

.batch-btn {
  background-color: #909399;
  color: white;
}

.batch-action-btn.disable {
  background-color: #e6a23c;
  color: white;
}

.batch-action-btn.enable {
  background-color: #67c23a;
  color: white;
}

.batch-action-btn.promote {
  background-color: #409eff;
  color: white;
}

.batch-action-btn.demote {
  background-color: #f56c6c;
  color: white;
}

.batch-action-btn.select-all,
.batch-action-btn.select-page {
  background-color: #909399;
  color: white;
}

.user-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.user-table th, .user-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

.user-table th {
  background-color: #f5f7fa;
  color: #909399;
  font-weight: 500;
}

.user-table tbody tr:hover {
  background-color: #f5f7fa;
  cursor: pointer;
}

.selected-row {
  background-color: #ecf5ff !important;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: #e1f3d8;
  color: #67c23a;
}

.status-badge.inactive {
  background-color: #fde2e2;
  color: #f56c6c;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.edit-btn {
  background-color: #409eff;
  color: white;
}

.status-btn {
  background-color: #e6a23c;
  color: white;
}

.role-btn {
  background-color: #909399;
  color: white;
}

.role-btn.admin {
  background-color: #f56c6c;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.pagination button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

input[type="checkbox"] {
  cursor: pointer;
}
</style>
