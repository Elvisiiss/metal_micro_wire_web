<template>
  <div class="wire-container">
    <!-- 顶部标题和批次号 -->
    <div class="header">
      <h1>金属微丝检测报告</h1>
      <div class="batch-number">
        <el-tag type="info" size="large">批次号: {{ batchNumber }}</el-tag>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-progress type="circle" :percentage="70" status="success" :indeterminate="true" />
      <p>正在加载线材信息...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-result icon="error" title="加载失败" :sub-title="error">
        <template #extra>
          <el-button type="primary" @click="fetchWireMaterial">重新加载</el-button>
        </template>
      </el-result>
    </div>

    <!-- 信息展示 -->
    <div v-else-if="wireMaterial" class="info-container">
      <el-row :gutter="20">
        <!-- 基本属性 -->
        <el-col :xs="24" :sm="24" :md="8">
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <el-icon><InfoFilled /></el-icon>
                <span>基本属性</span>
              </div>
            </template>
            <div class="info-item">
              <label>设备ID:</label>
              <span>{{ wireMaterial.deviceId }}</span>
            </div>
            <div class="info-item">
              <label>检测时间:</label>
              <span>{{ formatDateTime(wireMaterial.eventTime) }}</span>
            </div>
            <div class="info-item">
              <label>应用场景:</label>
              <span>{{ wireMaterial.scenarioCode }}</span>
            </div>
            <div class="info-item">
              <label>设备代码:</label>
              <span>{{ wireMaterial.deviceCode }}</span>
            </div>
          </el-card>
        </el-col>

        <!-- 技术参数 -->
        <el-col :xs="24" :sm="24" :md="8">
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <el-icon><DataAnalysis /></el-icon>
                <span>技术参数</span>
              </div>
            </template>
            <div class="tech-item">
              <div class="tech-label">直径</div>
              <div class="tech-value">{{ wireMaterial.diameter }} mm</div>
              <el-progress
                  :percentage="diameterPercentage"
                  :color="diameterColor"
                  :show-text="false"
              />
            </div>
            <div class="tech-item">
              <div class="tech-label">电导率</div>
              <div class="tech-value">{{ wireMaterial.resistance }}</div>
              <el-progress
                  :percentage="resistancePercentage"
                  :color="resistanceColor"
                  :show-text="false"
              />
            </div>
            <div class="tech-item">
              <div class="tech-label">延展率</div>
              <div class="tech-value">{{ wireMaterial.extensibility }}%</div>
              <el-progress
                  :percentage="extensibilityPercentage"
                  :color="extensibilityColor"
                  :show-text="false"
              />
            </div>
            <div class="tech-item">
              <div class="tech-label">重量</div>
              <div class="tech-value">{{ wireMaterial.weight }} g</div>
              <el-progress
                  :percentage="weightPercentage"
                  :color="weightColor"
                  :show-text="false"
              />
            </div>
          </el-card>
        </el-col>

        <!-- 生产信息 -->
        <el-col :xs="24" :sm="24" :md="8">
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <el-icon><OfficeBuilding /></el-icon>
                <span>生产信息</span>
              </div>
            </template>
            <div class="info-item">
              <label>生产商:</label>
              <span>{{ wireMaterial.manufacturer }}</span>
            </div>
            <div class="info-item">
              <label>负责人:</label>
              <span>{{ wireMaterial.responsiblePerson }}</span>
            </div>
            <div class="info-item">
              <label>工艺类型:</label>
              <span>{{ wireMaterial.processType }}</span>
            </div>
            <div class="info-item">
              <label>生产机器:</label>
              <span>{{ wireMaterial.productionMachine }}</span>
            </div>
            <div class="info-item">
              <label>联系方式:</label>
              <span>{{ wireMaterial.contactEmail }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 原始数据 -->
      <el-card class="raw-data-card">
        <template #header>
          <div class="card-header">
            <el-icon><Document /></el-icon>
            <span>原始生产数据</span>
          </div>
        </template>
        <div class="raw-data">
          <code>{{ wireMaterial.sourceOriginRaw }}</code>
        </div>
      </el-card>
    </div>

    <!-- 无批次号提示 -->
    <div v-else class="no-info">
      <el-result icon="info" title="请输入批次号" sub-title="请在URL中添加info参数获取线材信息">
        <template #extra>
          <p class="example-url">示例： http://10.168.82.63:5173/wire?info=Cu0120250629010010001</p>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, watch} from 'vue';
import {
  InfoFilled, DataAnalysis, OfficeBuilding, Document
} from '@element-plus/icons-vue';
import mwAPI from '@/api/mwManagement.js';

// 通过props接收路由传递的info参数
const props = defineProps({
  info: {
    type: String,
    default: ''
  }
});

const batchNumber = ref(props.info);
const wireMaterial = ref(null);
const loading = ref(false);
const error = ref(null);

// 进度条计算
const diameterPercentage = computed(() => {
  if (!wireMaterial.value) return 0;
  return Math.min(100, wireMaterial.value.diameter * 100);
});

const resistancePercentage = computed(() => {
  if (!wireMaterial.value) return 0;
  return Math.min(100, wireMaterial.value.resistance);
});

const extensibilityPercentage = computed(() => {
  if (!wireMaterial.value) return 0;
  return Math.min(100, wireMaterial.value.extensibility);
});

const weightPercentage = computed(() => {
  if (!wireMaterial.value) return 0;
  return Math.min(100, wireMaterial.value.weight * 50);
});

// 进度条颜色
const diameterColor = computed(() => {
  return diameterPercentage.value > 90 ? '#f56c6c' : '#67c23a';
});

const resistanceColor = computed(() => {
  return resistancePercentage.value > 90 ? '#f56c6c' : '#67c23a';
});

const extensibilityColor = computed(() => {
  return extensibilityPercentage.value > 90 ? '#f56c6c' : '#67c23a';
});

const weightColor = computed(() => {
  return weightPercentage.value > 90 ? '#f56c6c' : '#67c23a';
});

// 获取线材信息
const fetchWireMaterial = async () => {
  if (!batchNumber.value) return;

  loading.value = true;
  error.value = null;

  try {
    const response = await mwAPI.getWireMaterialByBatchNumber(batchNumber.value);
    if (response.code === 'success') {
      wireMaterial.value = response.data;
    } else {
      error.value = response.msg || '获取线材信息失败';
    }
  } catch (err) {
    console.error('获取线材信息失败', err);
    error.value = '无法连接到服务器，请稍后再试';
  } finally {
    loading.value = false;
  }
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

// 监听info变化
watch(() => props.info, (newVal) => {
  batchNumber.value = newVal;
  if (newVal) {
    fetchWireMaterial();
  } else {
    wireMaterial.value = null;
  }
});

// 组件挂载时获取数据
onMounted(() => {
  if (batchNumber.value) {
    fetchWireMaterial();
  }
});
</script>

<style scoped>
.wire-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e6f0ff;
}

.header h1 {
  color: #1a3a6e;
  font-size: 2.2rem;
  margin-bottom: 15px;
}

.batch-number {
  display: flex;
  justify-content: center;
}

.info-container {
  margin-top: 20px;
}

.info-card {
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 1.1rem;
  color: #1a3a6e;
}

.card-header .el-icon {
  margin-right: 8px;
  font-size: 1.2rem;
}

.info-item {
  display: flex;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #e8eaed;
}

.info-item label {
  width: 80px;
  font-weight: 500;
  color: #5b7ba8;
  flex-shrink: 0;
}

.info-item span {
  flex-grow: 1;
  color: #333;
  word-break: break-word;
}

.tech-item {
  margin-bottom: 20px;
}

.tech-label {
  font-weight: 500;
  color: #5b7ba8;
  margin-bottom: 5px;
  font-size: 0.95rem;
}

.tech-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a3a6e;
  margin-bottom: 8px;
}

.raw-data-card {
  margin-top: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.raw-data {
  background-color: #f8faff;
  padding: 15px;
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}

.loading-container, .error-container, .no-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.loading-container p {
  margin-top: 20px;
  font-size: 1.1rem;
  color: #1a3a6e;
}

.example-url {
  background-color: #f0f7ff;
  padding: 10px 15px;
  border-radius: 6px;
  font-family: monospace;
  color: #1a3a6e;
  margin-top: 15px;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 1.8rem;
  }

  .info-item {
    flex-direction: column;
  }

  .info-item label {
    margin-bottom: 5px;
  }
}
</style>
