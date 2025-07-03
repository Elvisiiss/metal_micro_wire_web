<template>
  <div class="wire-management">
    <!-- 页面标题区域 -->
    <div class="page-header-custom">
      <div class="header-content">
        <span class="page-title">线材管理</span>
        <span class="page-subtitle">管理金属微丝检测数据</span>
      </div>
      <div class="header-stats">
        <el-tag>当前页: {{ wireMaterials.length }} 条记录</el-tag>
        <el-tag v-if="selectedBatchNumbers.length > 0" type="success">
          已选择: {{ selectedBatchNumbers.length }}
        </el-tag>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <el-row :gutter="16" class="action-bar">
      <el-col :span="8">
        <el-input
            v-model="searchParams.batchNumberKeyword"
            placeholder="批次号搜索"
            clearable
            @clear="fetchWireMaterials"
            @keyup.enter="fetchWireMaterials"
        >
          <template #prefix>
            <el-icon><search /></el-icon>
          </template>
        </el-input>
      </el-col>

      <el-col :span="8">
        <el-input
            v-model="searchParams.manufacturerKeyword"
            placeholder="生产商搜索"
            clearable
            @clear="fetchWireMaterials"
            @keyup.enter="fetchWireMaterials"
        />
      </el-col>

      <el-col :span="8" style="text-align: right;">
        <el-button type="primary" @click="fetchWireMaterials">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-col>
    </el-row>

    <!-- 高级筛选 -->
    <el-collapse v-model="advancedSearchActive">
      <el-collapse-item title="高级筛选" name="1">
        <el-row :gutter="16">
          <el-col :span="6">
            <el-input
                v-model="searchParams.deviceIdKeyword"
                placeholder="设备ID"
                clearable
            />
          </el-col>
          <el-col :span="6">
            <el-input
                v-model="searchParams.responsiblePersonKeyword"
                placeholder="负责人"
                clearable
            />
          </el-col>
          <el-col :span="6">
            <el-input
                v-model="searchParams.processTypeKeyword"
                placeholder="工艺类型"
                clearable
            />
          </el-col>
          <el-col :span="6">
            <el-input
                v-model="searchParams.productionMachineKeyword"
                placeholder="生产机器"
                clearable
            />
          </el-col>
        </el-row>
        <el-row :gutter="16" style="margin-top: 16px">
          <el-col :span="6">
            <el-input
                v-model="searchParams.scenarioCode"
                placeholder="应用场景编号"
                clearable
            />
          </el-col>
          <el-col :span="6">
            <el-input
                v-model="searchParams.deviceCode"
                placeholder="设备代码"
                clearable
            />
          </el-col>
          <el-col :span="6">
            <el-select
                v-model="searchParams.sortBy"
                placeholder="排序字段"
                style="width: 100%"
            >
              <el-option label="创建时间" value="createTime" />
              <el-option label="检测时间" value="eventTime" />
              <el-option label="批次号" value="batchNumber" />
              <el-option label="直径" value="diameter" />
              <el-option label="电导率" value="resistance" />
              <el-option label="延展率" value="extensibility" />
              <el-option label="重量" value="weight" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
                v-model="searchParams.sortDirection"
                placeholder="排序方向"
                style="width: 100%"
            >
              <el-option label="升序" value="asc" />
              <el-option label="降序" value="desc" />
            </el-select>
          </el-col>
        </el-row>
      </el-collapse-item>
    </el-collapse>

    <!-- 线材表格 -->
    <el-table
        :data="wireMaterials"
        v-loading="loading"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />

      <el-table-column prop="batchNumber" label="批次号" width="220">
        <template #default="{ row }">
          <el-tag size="small" type="info">{{ row.batchNumber }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="deviceId" label="设备ID" width="140" />

      <el-table-column label="技术参数" width="300">
        <template #default="{ row }">
          <div class="tech-params">
            <div><span class="param-label">直径:</span> {{ row.diameter }} mm</div>
            <div><span class="param-label">电导率:</span> {{ row.resistance }}</div>
            <div><span class="param-label">延展率:</span> {{ row.extensibility }}%</div>
            <div><span class="param-label">重量:</span> {{ row.weight }} g</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="生产信息" min-width="250">
        <template #default="{ row }">
          <div class="production-info">
            <div><span class="info-label">生产商:</span> {{ row.manufacturer }}</div>
            <div><span class="info-label">负责人:</span> {{ row.responsiblePerson }}</div>
            <div><span class="info-label">工艺:</span> {{ row.processType }}</div>
            <div><span class="info-label">机器:</span> {{ row.productionMachine }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="eventTime" label="检测时间" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.eventTime) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
              type="primary"
              size="small"
              @click="openEditDialog(row)"
              v-if="isManager"
          >
            编辑
          </el-button>
          <el-button
              type="danger"
              size="small"
              @click="handleDelete(row.batchNumber)"
              v-if="isManager"
          >
            删除
          </el-button>
        </template>
      </el-table-column>

      <!-- 空状态 -->
      <template #empty>
        <el-empty
            :image-size="120"
            :description="searchParams.batchNumberKeyword ? '没有找到匹配的线材记录' : '暂无线材数据'"
        />
      </template>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-wrapper" v-if="totalPages > 1">
      <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="totalElements"
          layout="prev, pager, next, jumper, total"
          @current-change="handlePageChange"
          background
      />
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
        v-model="editDialogVisible"
        :title="`编辑线材 - ${editingWire?.batchNumber}`"
        width="600px"
    >
      <el-form
          :model="editingWire"
          label-width="120px"
          label-position="left"
          v-if="editingWire"
      >
        <el-form-item label="批次号">
          <el-input v-model="editingWire.batchNumber" disabled />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="直径 (mm)" prop="diameter">
              <el-input-number
                  v-model="editingWire.diameter"
                  :min="0"
                  :step="0.01"
                  controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电导率" prop="resistance">
              <el-input-number
                  v-model="editingWire.resistance"
                  :min="0"
                  :step="0.1"
                  controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="延展率 (%)" prop="extensibility">
              <el-input-number
                  v-model="editingWire.extensibility"
                  :min="0"
                  :step="0.1"
                  controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重量 (g)" prop="weight">
              <el-input-number
                  v-model="editingWire.weight"
                  :min="0"
                  :step="0.01"
                  controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="生产商" prop="manufacturer">
          <el-input v-model="editingWire.manufacturer" maxlength="100" />
        </el-form-item>

        <el-form-item label="负责人" prop="responsiblePerson">
          <el-input v-model="editingWire.responsiblePerson" maxlength="50" />
        </el-form-item>

        <el-form-item label="工艺类型" prop="processType">
          <el-input v-model="editingWire.processType" maxlength="50" />
        </el-form-item>

        <el-form-item label="生产机器" prop="productionMachine">
          <el-input v-model="editingWire.productionMachine" maxlength="100" />
        </el-form-item>

        <el-form-item label="联系邮箱" prop="contactEmail">
          <el-input v-model="editingWire.contactEmail" maxlength="100" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveWireMaterial">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import mwAPI from '@/api/mwManagement.js';
import { useAuthStore } from '@/stores/auth';

// 响应式数据
const wireMaterials = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = ref(0);
const totalElements = ref(0);
const loading = ref(false);
const advancedSearchActive = ref(false);
const selectedBatchNumbers = ref([]);
const editDialogVisible = ref(false);
const editingWire = ref(null);

// 搜索参数
const searchParams = ref({
  batchNumberKeyword: '',
  deviceIdKeyword: '',
  manufacturerKeyword: '',
  responsiblePersonKeyword: '',
  processTypeKeyword: '',
  productionMachineKeyword: '',
  scenarioCode: '',
  deviceCode: '',
  sortBy: 'createTime',
  sortDirection: 'desc'
});

// 权限检查
const authStore = useAuthStore();
const isManager = computed(() => {
  return authStore.user?.role_id === 1;
});

// 生命周期钩子
onMounted(() => {
  fetchWireMaterials();
});

// 获取线材列表
const fetchWireMaterials = async () => {
  loading.value = true;
  try {
    const response = await mwAPI.getWireMaterialList({
      page: currentPage.value - 1,
      size: pageSize.value,
      ...searchParams.value
    });

    wireMaterials.value = response.data.wireMaterials;
    totalPages.value = response.data.totalPages;
    totalElements.value = response.data.totalElements;
  } catch (error) {
    ElMessage.error('获取线材列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 重置搜索
const resetSearch = () => {
  searchParams.value = {
    batchNumberKeyword: '',
    deviceIdKeyword: '',
    manufacturerKeyword: '',
    responsiblePersonKeyword: '',
    processTypeKeyword: '',
    productionMachineKeyword: '',
    scenarioCode: '',
    deviceCode: '',
    sortBy: 'createTime',
    sortDirection: 'desc'
  };
  currentPage.value = 1;
  fetchWireMaterials();
};

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchWireMaterials();
};

// 表格选择处理
const handleSelectionChange = (selection) => {
  selectedBatchNumbers.value = selection.map(item => item.batchNumber);
};

// 打开编辑对话框
const openEditDialog = (wire) => {
  editingWire.value = { ...wire };
  editDialogVisible.value = true;
};

// 保存线材信息
const saveWireMaterial = async () => {
  try {
    const { batchNumber, ...updateData } = editingWire.value;
    await mwAPI.updateWireMaterial(batchNumber, updateData);
    ElMessage.success('线材信息更新成功');
    editDialogVisible.value = false;
    fetchWireMaterials();
  } catch (error) {
    ElMessage.error('更新线材信息失败');
    console.error(error);
  }
};

// 删除线材
const handleDelete = (batchNumber) => {
  ElMessageBox.confirm(
      `确定要删除批次号为 ${batchNumber} 的线材记录吗？此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    try {
      await mwAPI.deleteWireMaterial(batchNumber);
      ElMessage.success('线材记录已删除');
      fetchWireMaterials();
    } catch (error) {
      ElMessage.error('删除线材记录失败');
      console.error(error);
    }
  }).catch(() => {});
};

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
};
</script>

<style scoped>
.wire-management {
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

.tech-params,
.production-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.param-label,
.info-label {
  display: inline-block;
  width: 60px;
  color: #666;
  font-weight: bold;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

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

.el-collapse {
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}
</style>
