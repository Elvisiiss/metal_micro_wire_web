<template>
  <div class="system-config">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>系统设置</h1>
      <p class="subtitle">管理系统配置和监控服务状态</p>
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
      console.log(9999,response.data)
      console.log(listenerStatus.value)
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
  padding: 20px;
  background: #f8faff;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e6f0ff;
}

.page-header h1 {
  font-size: 24px;
  color: #1a3a6e;
  margin: 0;
}

.page-header .subtitle {
  color: #5b7ba8;
  margin-top: 8px;
  font-size: 14px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.health-card, .listener-card, .info-card {
  margin-bottom: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e6f0ff;
}

.health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.health-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: #f8faff;
  border-radius: 8px;
  border: 1px solid #e6f0ff;
}

.health-label {
  font-weight: 500;
  margin-bottom: 10px;
  color: #5b7ba8;
}

.status-grid, .stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.status-item, .stats-item {
  display: flex;
  flex-direction: column;
  padding: 15px;
  background: #f8faff;
  border-radius: 8px;
  border: 1px solid #e6f0ff;
}

.status-label, .stats-label {
  font-weight: 500;
  margin-bottom: 8px;
  color: #5b7ba8;
}

.status-value {
  font-size: 16px;
  font-weight: 600;
  color: #1a3a6e;
}

.stats-value {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
}

.stats-value.success {
  color: #67c23a;
}

.stats-value.danger {
  color: #f56c6c;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 20px;
}

.action-buttons .el-button {
  min-width: 180px;
  font-weight: bold;
  letter-spacing: 1px;
}

.info-content p {
  margin: 10px 0;
  color: #606266;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .health-grid, .status-grid, .stats-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
    gap: 15px;
  }

  .action-buttons .el-button {
    width: 100%;
  }
}
</style>
