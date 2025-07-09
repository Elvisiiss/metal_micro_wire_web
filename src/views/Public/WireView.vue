<template>
  <div class="wire-container">
    <!-- 顶部标题和批次号 -->
    <div class="header" @click="goHome">
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
        <el-col :xs="24" :sm="24" :md="8" class="info-column">
          <el-card class="info-card equal-height-card">
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
        <el-col :xs="24" :sm="24" :md="8" class="info-column">
          <el-card class="info-card equal-height-card">
            <template #header>
              <div class="card-header">
                <el-icon><DataAnalysis /></el-icon>
                <span>技术参数</span>
              </div>
            </template>
            <div class="tech-item">
              <div class="tech-label">直径</div>
              <div class="tech-value-group">
                <span class="tech-value">{{ wireMaterial.diameter }} mm</span>
                <el-tag size="small" :type="isDiameterPass ? 'success' : 'danger'">
                  {{ isDiameterPass ? '合格' : '不合格' }}
                </el-tag>
              </div>
            </div>
            <div class="tech-item">
              <div class="tech-label">电导率</div>
              <div class="tech-value-group">
                <span class="tech-value">{{ wireMaterial.resistance }} MS/m</span>
                <el-tag size="small" :type="isResistancePass ? 'success' : 'danger'">
                  {{ isResistancePass ? '合格' : '不合格' }}
                </el-tag>
              </div>
            </div>
            <div class="tech-item">
              <div class="tech-label">延展率</div>
              <div class="tech-value-group">
                <span class="tech-value">{{ wireMaterial.extensibility }} δ</span>
                <el-tag size="small" :type="isExtensibilityPass ? 'success' : 'danger'">
                  {{ isExtensibilityPass ? '合格' : '不合格' }}
                </el-tag>
              </div>
            </div>
            <div class="tech-item">
              <div class="tech-label">重量</div>
              <div class="tech-value-group">
                <span class="tech-value">{{ wireMaterial.weight.toFixed(2) }} g</span>
                <el-tag size="small" type="success">合格</el-tag>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 生产信息 -->
        <el-col :xs="24" :sm="24" :md="8" class="info-column">
          <el-card class="info-card equal-height-card">
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
            <span>原始生产数据</span>
          </div>
        </template>
        <div class="raw-data">
          <code>{{ decodedRawData }}</code>
        </div>
      </el-card>

      <!-- 评估信息 -->
      <el-card class="evaluation-card">
        <template #header>
          <div class="card-header">
            <el-icon><Edit /></el-icon>
            <span>质量评估信息</span>
          </div>
        </template>

        <div class="evaluation-info">
          <div class="evaluation-summary">
            <div class="evaluation-result">
              <label>最终结果:</label>
              <el-tag :type="finalEvaluationTagType(wireMaterial.finalEvaluationResult)" size="large" effect="dark">
                {{ formatFinalResult(wireMaterial.finalEvaluationResult) }}
              </el-tag>
            </div>

            <div class="evaluation-result">
              <label>模型审核:</label>
              <el-tag :type="wireMaterial.modelEvaluationResult === 'PASS' ? 'success' : 'danger'" size="large">
                {{ wireMaterial.modelEvaluationResult === 'PASS' ? '通过' : '不通过' }}
                <span v-if="wireMaterial.modelConfidence"> (置信度: {{ (wireMaterial.modelConfidence * 100).toFixed(1) }}%)</span>
              </el-tag>
            </div>

            <div class="evaluation-result">
              <label>规则引擎:</label>
              <el-tag :type="evaluationTagType(wireMaterial.evaluationResult)" size="large">
                {{ wireMaterial.evaluationResult === 'PASS' ? '通过' : '不通过' }}
              </el-tag>
            </div>
          </div>

          <div class="timeline-container">
            <el-timeline>
              <el-timeline-item
                  v-for="(part, index) in splitEvaluationMessage"
                  :key="index"
                  :timestamp="getTimestamp(part)"
                  placement="top"
                  :color="getTimelineColor(part)"
              >
                <el-card shadow="hover" class="timeline-card">
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <el-icon v-if="isManualReview(part)" class="user-icon"><User /></el-icon>
                      <el-icon v-else class="system-icon"><Cpu /></el-icon>
                      <strong>{{ getReviewType(part) }}</strong>
                    </div>
                    <div class="timeline-body">
                      <div class="review-content">{{ getReviewContent(part) }}</div>
                      <div v-if="getReviewer(part)" class="reviewer">
                        <el-icon><User /></el-icon>
                        {{ getReviewer(part) }}
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
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
import { ref, computed, onMounted, watch } from 'vue';
import {
  InfoFilled, DataAnalysis, OfficeBuilding, Document, Edit, User, Cpu
} from '@element-plus/icons-vue';
import mwAPI from '@/api/mwManagement.js';
// 添加 useRouter 导入
import { useRouter } from 'vue-router'

// 在已有代码中添加以下内容
const router = useRouter()

// 添加跳转首页方法
const goHome = () => {
  router.push('/')
}

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
const decodedRawData = ref('');

// 计算属性：技术参数合格状态
const isDiameterPass = computed(() => {
  return !splitEvaluationMessage.value[0]?.includes('直径超出');
});

const isResistancePass = computed(() => {
  return !splitEvaluationMessage.value[0]?.includes('电导率超出');
});

const isExtensibilityPass = computed(() => {
  return !splitEvaluationMessage.value[0]?.includes('延展率超出');
});

// 计算属性：分割评估信息
const splitEvaluationMessage = computed(() => {
  if (!wireMaterial.value?.evaluationMessage) return [];

  // 按竖线分割各部分
  const parts = wireMaterial.value.evaluationMessage.split('|').map(part => part.trim());

  // 移除空字符串
  return parts.filter(part => part.length > 0);
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
      decodeRawData();
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

// 解码原始数据
const decodeRawData = () => {
  if (!wireMaterial.value?.sourceOriginRaw) return;

  try {
    // 尝试解码原始数据
    decodedRawData.value = decodeURIComponent(wireMaterial.value.sourceOriginRaw);
  } catch (e) {
    decodedRawData.value = '无法解码原始数据';
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

// 评估信息处理函数
const isManualReview = (part) => {
  return part.includes('人工重新审核');
};

const getReviewType = (part) => {
  if (part.includes('人工重新审核')) return '人工审核';
  return '系统评估';
};

const getReviewContent = (part) => {
  // 提取审核内容
  if (part.includes('：')) {
    return part.split('：')[1].split('[')[0].trim();
  }
  return part;
};

const getReviewer = (part) => {
  // 提取审核人信息
  const match = part.match(/\[审核人：(.*?)\]/);
  return match ? match[1] : null;
};

const getTimestamp = (part) => {
  // 提取时间戳
  const match = part.match(/\[时间：(.*?)\]/);
  return match ? match[1] : '';
};

const getTimelineColor = (part) => {
  if (isManualReview(part)) {
    return part.includes('通过') ? '#67c23a' : '#e6a23c';
  }
  return '#909399';
};

// 辅助函数
const evaluationTagType = (result) => {
  if (result === 'PASS') return 'success';
  if (result === 'FAIL') return 'danger';
  return 'info';
};

const finalEvaluationTagType = (result) => {
  if (result === 'PASS') return 'success';
  if (result === 'FAIL') return 'danger';
  if (result === 'PENDING_REVIEW') return 'warning';
  return 'info';
};

const formatFinalResult = (result) => {
  const map = {
    'PASS': '合格',
    'FAIL': '不合格',
    'PENDING_REVIEW': '待审核',
    'UNKNOWN': '未评估'
  };
  return map[result] || result;
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
  background: linear-gradient(to right, #1a3a6e, #2c5282);
  padding: 25px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(26, 58, 110, 0.2);
}

.header h1 {
  color: white;
  font-size: 2.2rem;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.batch-number {
  display: flex;
  justify-content: center;
}

.batch-number .el-tag {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  font-weight: 500;
  border: none;
}

.info-container {
  margin-top: 20px;
}

.info-card {
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #ebeef5;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(26, 58, 110, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 1.1rem;
  color: #1a3a6e;
  padding: 15px 20px;
  background-color: #f5f7fa;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid #ebeef5;
}

.card-header .el-icon {
  margin-right: 8px;
  font-size: 1.2rem;
  color: #1a3a6e;
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
  padding: 12px 15px;
  border-radius: 8px;
  background-color: #f9fafc;
}

.tech-item:hover {
  background-color: #f0f7ff;
}

.tech-label {
  font-weight: 500;
  color: #5b7ba8;
  margin-bottom: 5px;
  font-size: 0.95rem;
}

.tech-value-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tech-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a3a6e;
}

.raw-data-card,
.evaluation-card {
  margin-top: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #ebeef5;
}

.raw-data-card .card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.decode-btn {
  background-color: #1a3a6e;
  color: white;
  border: none;
}

.decode-btn:hover {
  background-color: #2c5282;
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
  white-space: pre-wrap;
}

.evaluation-info {
  padding: 15px;
}

.evaluation-summary {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 25px;
  padding: 20px;
  background-color: #f9fafc;
  border-radius: 10px;
  border: 1px solid #ebeef5;
}

.evaluation-result {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.evaluation-result label {
  width: 100px;
  font-weight: 500;
  color: #5b7ba8;
  flex-shrink: 0;
}

.evaluation-result .el-tag {
  font-size: 1rem;
  padding: 0 15px;
  height: 32px;
  line-height: 32px;
}

.timeline-container {
  margin-top: 20px;
  padding: 0 20px;
}

.timeline-card {
  border-radius: 10px;
  border: 1px solid #ebeef5;
}

.timeline-content {
  padding: 15px;
}

.timeline-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 1.05rem;
  color: #1a3a6e;
}

.user-icon {
  color: #409eff;
  margin-right: 8px;
  font-size: 1.2rem;
}

.system-icon {
  color: #67c23a;
  margin-right: 8px;
  font-size: 1.2rem;
}

.timeline-body {
  padding-left: 28px;
}

.review-content {
  margin-bottom: 10px;
  line-height: 1.6;
  color: #333;
}

.reviewer {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 0.9rem;
}

.reviewer .el-icon {
  margin-right: 5px;
}

.loading-container, .error-container, .no-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  background-color: #f9fafc;
  border-radius: 12px;
  padding: 30px;
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

  .evaluation-summary {
    flex-direction: column;
  }

  .evaluation-result {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 15px;
  }

  .evaluation-result label {
    margin-bottom: 5px;
  }
}

.info-column {
  display: flex;
}

/* 使卡片高度100%填充列容器 */
.equal-height-card {
  display: flex;
  flex-direction: column;
  flex: 1; /* 关键属性，使卡片等分高度 */
  height: 100%;
}

/* 卡片内容区域自动填充剩余空间 */
.equal-height-card :deep(.el-card__body) {
  flex: 1;
}


</style>
