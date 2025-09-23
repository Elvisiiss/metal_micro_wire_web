<template>
  <div class="system-config">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <span class="page-title">系统设置</span>
        <span class="page-subtitle">管理系统配置和监控服务状态</span>
      </div>
    </div>

    <!-- 健康检查区域 -->
    <el-card class="health-card">
      <template #header>
        <div class="card-header">
          <span>系统健康状态</span>
          <el-button
              @click="performHealthCheck"
              :loading="loading.health"
              type="primary"
              size="small"
          >
            重新检查
          </el-button>
        </div>
      </template>

      <div class="health-grid">
        <div class="health-item">
          <div class="health-label">数据库状态</div>
          <el-tag
              :type="healthStatus.database.includes('connected') ? 'success' : 'danger'"
              effect="dark"
          >
            {{ healthStatus.database }}
          </el-tag>
        </div>

        <div class="health-item">
          <div class="health-label">Redis状态</div>
          <el-tag
              :type="healthStatus.redis.includes('connected') ? 'success' : 'danger'"
              effect="dark"
          >
            {{ healthStatus.redis }}
          </el-tag>
        </div>

        <div class="health-item">
          <div class="health-label">模型状态</div>
          <el-tag
              :type="healthStatus.ml_model.includes('connected') ? 'success' : 'danger'"
              effect="dark"
          >
            {{ healthStatus.ml_model }}
          </el-tag>
        </div>

        <div class="health-item">
          <div class="health-label">服务状态</div>
          <el-tag
              type="info"
              effect="dark"
          >
            {{ healthStatus.service }}
          </el-tag>
        </div>
      </div>
    </el-card>

    <!-- IoT监听器管理区域 -->
    <el-card class="listener-card">
      <template #header>
        <div class="card-header">
          <span>IoT监听器管理</span>
          <el-button
              @click="fetchListenerStatus"
              :loading="loading.status"
              size="small"
          >
            刷新状态
          </el-button>
        </div>
      </template>

      <!-- 状态信息 -->
      <div class="status-grid">
        <div class="status-item">
          <div class="status-label">监听状态</div>
          <el-tag
              :type="listenerStatus.listening ? 'success' : 'danger'"
              size="large"
          >
            {{ listenerStatus.listening ? '运行中' : '已停止' }}
          </el-tag>
        </div>

        <div class="status-item">
          <div class="status-label">监听器ID</div>
          <div class="status-value">
            {{ listenerStatus.listenerId || '-' }}
          </div>
        </div>

        <div class="status-item">
          <div class="status-label">启动时间</div>
          <div class="status-value">
            {{ formatTime(listenerStatus.startTime) }}
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-grid">
        <div class="stats-item">
          <div class="stats-label">总消息数</div>
          <div class="stats-value">
            {{ listenerStatus.messageStats.totalCount }}
          </div>
        </div>

        <div class="stats-item">
          <div class="stats-label">成功数</div>
          <div class="stats-value success">
            {{ listenerStatus.messageStats.successCount }}
          </div>
        </div>

        <div class="stats-item">
          <div class="stats-label">失败数</div>
          <div class="stats-value danger">
            {{ listenerStatus.messageStats.failedCount }}
          </div>
        </div>

        <div class="stats-item">
          <div class="stats-label">成功率</div>
          <div class="stats-value">
            <el-progress
                :percentage="listenerStatus.messageStats.successRate"
                :status="listenerStatus.messageStats.successRate >= 95 ? 'success' : 'warning'"
                :text-inside="true"
                :stroke-width="24"
                style="width: 100%"
            />
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
            @click="startListener"
            type="success"
            size="large"
            :disabled="listenerStatus.listening"
        >
          启动监听
        </el-button>

        <el-button
            @click="stopListener"
            type="danger"
            size="large"
            :disabled="!listenerStatus.listening"
        >
          停止监听
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElLoading } from 'element-plus';
import SystemConfigAPI from '@/api/SystemConfig.js';

// 监听器状态
const listenerStatus = ref({
  listening: false,
  listenerId: null,
  startTime: null,
  messageStats: {
    totalCount: 0,
    successCount: 0,
    failedCount: 0,
    successRate: 0
  }
});

// 健康状态
const healthStatus = ref({
  database: 'unknown',
  redis: 'unknown',
  service: 'unknown',
  ml_model: 'unknown'
});

// 加载状态
const loading = ref({
  status: false,
  health: false
});

// 获取监听器状态
const fetchListenerStatus = async () => {
  loading.value.status = true;
  try {
    const response = await SystemConfigAPI.getListenerStatus();
    if (response.code === 'success') {
      listenerStatus.value = response.data;
      ElMessage.success('状态获取成功');
    } else {
      ElMessage.error(response.message || '状态获取失败');
    }
  } catch (error) {
    ElMessage.error('获取状态失败: ' + error.message);
  } finally {
    loading.value.status = false;
  }
};

// 启动监听器
const startListener = async () => {
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在启动监听器...',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  try {
    const response = await SystemConfigAPI.startListener();
    if (response.code === 'success') {
      ElMessage.success(response.msg);
      // 更新状态
      setTimeout(fetchListenerStatus, 1000);
    } else {
      ElMessage.error(response.message || '启动失败');
    }
  } catch (error) {
    ElMessage.error('启动失败: ' + error.message);
  } finally {
    loadingInstance.close();
  }
};

// 停止监听器
const stopListener = async () => {
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在停止监听器...',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  try {
    const response = await SystemConfigAPI.stopListener();
    if (response.code === 'success') {
      ElMessage.success(response.msg);
      // 更新状态
      setTimeout(fetchListenerStatus, 500);
    } else {
      ElMessage.error(response.message || '停止失败');
    }
  } catch (error) {
    ElMessage.error('停止失败: ' + error.message);
  } finally {
    loadingInstance.close();
  }
};

// 执行健康检查
const performHealthCheck = async () => {
  loading.value.health = true;
  try {
    const response = await SystemConfigAPI.healthCheck();
    if (response.code === 'success') {
      healthStatus.value = response.data;
      ElMessage.success('健康检查完成');
    } else {
      ElMessage.error('健康检查失败');
    }
  } catch (error) {
    ElMessage.error('健康检查失败: ' + error.message);
  } finally {
    loading.value.health = false;
  }
};

// 格式化时间戳
const formatTime = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return date.toLocaleString();
};

// 组件挂载时获取初始状态
onMounted(() => {
  fetchListenerStatus();
  performHealthCheck();
});
</script>

<style scoped>
.system-config {
  padding: 1rem;
  background: #f8faff;
  min-height: 100vh;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 0;
  border-bottom: 2px solid #e6f0ff;
}

.page-title {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 600;
  color: #1a3a6e;
}

.page-subtitle {
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #5b7ba8;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.health-card, .listener-card, .info-card {
  margin-bottom: 1.25rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e6f0ff;
  overflow: hidden;
}

/* 健康状态网格布局 */
.health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.25rem;
  padding: 1rem;
}

.health-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: #f8faff;
  border-radius: 8px;
  border: 1px solid #e6f0ff;
  transition: transform 0.2s;
}

.health-item:hover {
  transform: translateY(-2px);
}

.health-label {
  font-weight: 500;
  margin-bottom: 0.625rem;
  color: #5b7ba8;
  font-size: clamp(0.875rem, 2vw, 1rem);
}

/* 状态和统计信息网格 */
.status-grid, .stats-grid {
  display: grid;
  gap: 1.25rem;
  padding: 0 1rem;
}

.status-grid {
  margin-top: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.stats-grid {
  margin: 1.5rem 1rem;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.status-item, .stats-item {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: #f8faff;
  border-radius: 8px;
  border: 1px solid #e6f0ff;
}

.status-label, .stats-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #5b7ba8;
  font-size: clamp(0.875rem, 2vw, 1rem);
}

.status-value {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  font-weight: 600;
  color: #1a3a6e;
}

.stats-value {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 700;
  text-align: center;
}

.stats-value.success {
  color: #67c23a;
}

.stats-value.danger {
  color: #f56c6c;
}

/* 操作按钮区域 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1.875rem;
  margin: 1.25rem;
  flex-wrap: wrap;
  padding-bottom: 1rem;
}

.action-buttons .el-button {
  min-width: 11.25rem;
  font-weight: bold;
  letter-spacing: 1px;
  padding: 0.625rem 1.25rem;
}

.info-content p {
  margin: 0.625rem 0;
  color: #606266;
  line-height: 1.6;
}

/* 响应式断点设计 */
/* 超小屏幕 - 手机 */
@media (max-width: 575px) {
  .system-config {
    padding: 0.75rem;
  }

  .health-grid, .status-grid, .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.9375rem;
  }

  .action-buttons .el-button {
    width: 100%;
    min-width: auto;
  }

  .status-item, .stats-item, .health-item {
    padding: 0.75rem;
  }
}

/* 小屏幕 - 平板竖屏 */
@media (min-width: 576px) and (max-width: 767px) {
  .health-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .status-grid, .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 中等屏幕 - 平板横屏 */
@media (min-width: 768px) and (max-width: 991px) {
  .health-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .status-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 大屏幕 - 桌面 */
@media (min-width: 992px) and (max-width: 1199px) {
  .health-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .status-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 超大屏幕 - 大桌面 */
@media (min-width: 1200px) {
  .system-config {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .health-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .status-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
