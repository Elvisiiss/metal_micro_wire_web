<template>
  <div class="feedback-container">
    <h1>建议与反馈</h1>
    <p class="subtitle">我们重视您的每一条建议，这将帮助我们改进金属微细线材检测平台</p>

    <div class="feedback-form">
      <div class="form-group">
        <label for="feedback-type">反馈类型</label>
        <select id="feedback-type" v-model="feedback.type" required>
          <option value="" disabled>请选择反馈类型</option>
          <option value="suggestion">功能建议</option>
          <option value="problem">问题报告</option>
          <option value="improvement">改进意见</option>
          <option value="other">其他</option>
        </select>
      </div>

      <div class="form-group">
        <label for="feedback-title">标题</label>
        <input
            id="feedback-title"
            type="text"
            v-model="feedback.title"
            placeholder="简要描述您的反馈"
            required
        />
      </div>

      <div class="form-group">
        <label for="feedback-content">详细内容</label>
        <textarea
            id="feedback-content"
            v-model="feedback.content"
            placeholder="请详细描述您的建议或遇到的问题..."
            required
        ></textarea>
      </div>

      <div class="form-group">
        <label for="feedback-contact">联系方式（可选）</label>
        <input
            id="feedback-contact"
            type="text"
            v-model="feedback.contact"
            placeholder="邮箱/电话，方便我们回复您"
        />
      </div>

      <div class="form-group">
        <label>附件上传</label>
        <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop="handleDrop">
          <input
              type="file"
              ref="fileInput"
              @change="handleFileChange"
              style="display: none"
              multiple
          />
          <p v-if="!feedback.files.length">点击或拖拽文件到此处上传</p>
          <div v-else class="file-list">
            <div v-for="(file, index) in feedback.files" :key="index" class="file-item">
              <span>{{ file.name }}</span>
              <button @click.stop="removeFile(index)">×</button>
            </div>
          </div>
        </div>
      </div>

      <div class="submit-area">
        <button @click="submitFeedback" :disabled="isSubmitting">
          {{ isSubmitting ? '提交中...' : '提交反馈' }}
        </button>
      </div>
    </div>

    <div v-if="submitStatus === 'success'" class="success-message">
      <h3>感谢您的反馈！</h3>
      <p>我们已经收到您的建议/问题，我们的团队会尽快处理。</p>
      <p v-if="feedback.contact">如有需要，我们会通过您提供的联系方式与您沟通。</p>
      <button @click="resetForm">提交新的反馈</button>
    </div>

    <div v-if="submitStatus === 'error'" class="error-message">
      <h3>提交失败</h3>
      <p>抱歉，提交过程中出现问题，请稍后再试。</p>
      <button @click="retrySubmit">重试</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const feedback = ref({
  type: '',
  title: '',
  content: '',
  contact: '',
  files: []
})

const fileInput = ref(null)
const isSubmitting = ref(false)
const submitStatus = ref('') // '', 'success', 'error'

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileChange = (e) => {
  const files = Array.from(e.target.files)
  feedback.value.files = [...feedback.value.files, ...files]
}

const handleDrop = (e) => {
  e.preventDefault()
  const files = Array.from(e.dataTransfer.files)
  feedback.value.files = [...feedback.value.files, ...files]
}

const removeFile = (index) => {
  feedback.value.files.splice(index, 1)
}

const submitFeedback = async () => {
  if (!feedback.value.type || !feedback.value.title || !feedback.value.content) {
    alert('请填写必填字段')
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
    submitStatus.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  feedback.value = {
    type: '',
    title: '',
    content: '',
    contact: '',
    files: []
  }
  submitStatus.value = ''
}

const retrySubmit = () => {
  submitStatus.value = ''
  submitFeedback()
}
</script>

<style scoped>
.feedback-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.subtitle {
  color: #666;
  margin-bottom: 30px;
}

.feedback-form {
  background: #f9f9f9;
  padding: 25px;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input[type="text"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
}

.form-group textarea {
  min-height: 150px;
  resize: vertical;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #42b983;
  background: #f0f0f0;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
}

.file-item button {
  background: none;
  border: none;
  color: #ff4d4f;
  cursor: pointer;
  font-size: 1.2em;
}

.submit-area {
  text-align: center;
  margin-top: 30px;
}

.submit-area button {
  padding: 12px 30px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-area button:hover {
  background-color: #3aa876;
}

.submit-area button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.success-message,
.error-message {
  text-align: center;
  padding: 30px;
  border-radius: 8px;
  margin-top: 20px;
}

.success-message {
  background: #f0f9f0;
  border: 1px solid #a7e8a7;
}

.error-message {
  background: #fff0f0;
  border: 1px solid #ffb6b6;
}

.success-message h3 {
  color: #42b983;
}

.error-message h3 {
  color: #ff4d4f;
}

.success-message button,
.error-message button {
  margin-top: 15px;
  padding: 8px 20px;
  background: #ddd;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
