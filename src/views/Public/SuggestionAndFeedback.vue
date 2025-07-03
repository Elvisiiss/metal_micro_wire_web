<template>
  <div class="feedback-container">
    <div class="page-header-custom">
      <div class="header-content">
        <span class="page-title">建议与反馈</span>
        <span class="page-subtitle">我们重视您的每一条建议</span>
      </div>
      <div class="header-stats">
        <el-tag>类型: {{ feedbackTypeLabel }}</el-tag>
      </div>
    </div>

    <div class="feedback-content">
      <div v-if="submitStatus !== 'success'">
        <div class="form-group">
          <label for="feedback-type">反馈类型</label>
          <el-select
              v-model="feedback.type"
              placeholder="请选择反馈类型"
              class="full-width"
              required
          >
            <el-option label="功能建议" value="suggestion"></el-option>
            <el-option label="问题报告" value="problem"></el-option>
            <el-option label="改进意见" value="improvement"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </div>

        <div class="form-group">
          <label for="feedback-title">标题</label>
          <el-input
              id="feedback-title"
              v-model="feedback.title"
              placeholder="简要描述您的反馈"
              required
          />
        </div>

        <div class="form-group">
          <label for="feedback-content">详细内容</label>
          <el-input
              id="feedback-content"
              v-model="feedback.content"
              type="textarea"
              :rows="5"
              placeholder="请详细描述您的建议或遇到的问题..."
              required
          />
        </div>

        <div class="form-group">
          <label for="feedback-contact">联系方式（可选）</label>
          <el-input
              id="feedback-contact"
              v-model="feedback.contact"
              placeholder="邮箱/电话，方便我们回复您"
          />
        </div>

        <div class="form-group">
          <label>附件上传</label>
          <div
              class="upload-area"
              @click="triggerFileInput"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              :class="{'dragover': isDragging}"
          >
            <input
                type="file"
                ref="fileInput"
                @change="handleFileChange"
                style="display: none"
                multiple
            />
            <div v-if="!feedback.files.length" class="upload-placeholder">
              <el-icon class="upload-icon"><Upload /></el-icon>
              <p>点击或拖拽文件到此处上传</p>
              <p class="hint">支持图片、文档等文件，最大10MB</p>
            </div>
            <div v-else class="file-list">
              <div v-for="(file, index) in feedback.files" :key="index" class="file-item">
                <div class="file-info">
                  <el-icon><Document /></el-icon>
                  <span>{{ file.name }}</span>
                </div>
                <el-button
                    type="danger"
                    circle
                    size="small"
                    @click.stop="removeFile(index)"
                >
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="submit-area">
          <el-button
              type="primary"
              size="large"
              @click="submitFeedback"
              :loading="isSubmitting"
              :disabled="isSubmitting"
          >
            {{ isSubmitting ? '提交中...' : '提交反馈' }}
          </el-button>
        </div>
      </div>

      <div v-else class="success-message">
        <el-result
            icon="success"
            title="感谢您的反馈！"
            :sub-title="successMessage"
        >
          <template #extra>
            <el-button type="primary" @click="resetFeedback">提交新的反馈</el-button>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Upload, Document, Close } from '@element-plus/icons-vue'

// 反馈数据
const feedback = ref({
  type: '',
  title: '',
  content: '',
  contact: '',
  files: []
})

// 响应式状态
const isSubmitting = ref(false)
const submitStatus = ref('')
const isDragging = ref(false)
const fileInput = ref(null)

// 计算属性
const feedbackTypeLabel = computed(() => {
  const types = {
    'suggestion': '功能建议',
    'problem': '问题报告',
    'improvement': '改进意见',
    'other': '其他',
    '': '未选择'
  }
  return types[feedback.value.type]
})

const successMessage = computed(() => {
  if (feedback.value.contact) {
    return `我们会通过 ${feedback.value.contact} 与您联系，感谢您的反馈！`
  }
  return '我们已经收到您的建议/问题，我们的团队会尽快处理。'
})

// 设备反馈方法
const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileChange = (e) => {
  const files = Array.from(e.target.files)
  feedback.value.files = [...feedback.value.files, ...files]
}

const handleDrop = (e) => {
  isDragging.value = false
  const files = Array.from(e.dataTransfer.files)
  feedback.value.files = [...feedback.value.files, ...files]
}

const removeFile = (index) => {
  feedback.value.files.splice(index, 1)
}

const submitFeedback = async () => {
  if (!feedback.value.type || !feedback.value.title || !feedback.value.content) {
    ElMessage.error('请填写必填字段')
    return
  }

  isSubmitting.value = true
  submitStatus.value = ''

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('提交的反馈数据:', feedback.value)
    submitStatus.value = 'success'
  } catch (error) {
    console.error('提交反馈失败:', error)
    ElMessage.error('提交失败，请稍后重试')
    submitStatus.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

const resetFeedback = () => {
  feedback.value = {
    type: '',
    title: '',
    content: '',
    contact: '',
    files: []
  }
  submitStatus.value = ''
}
</script>

<style scoped>
.feedback-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header-custom {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8faff, #e6f0ff);
  border-bottom: 1px solid #e6f0ff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 18px;
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

.feedback-content {
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #1a3a6e;
}

.full-width {
  width: 100%;
}

.upload-area {
  border: 2px dashed #d4e8ff;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8faff;
}

.upload-area:hover, .upload-area.dragover {
  border-color: #409eff;
  background: #e6f0ff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.upload-icon {
  font-size: 40px;
  color: #409eff;
}

.hint {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fff;
  border: 1px solid #e6f0ff;
  border-radius: 8px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-info .el-icon {
  color: #409eff;
}

.submit-area {
  text-align: center;
  margin-top: 30px;
}

.success-message {
  text-align: center;
  padding: 40px 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .page-header-custom {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-stats {
    align-self: flex-end;
  }
}
</style>
