<template>
  <div class="help-center">
    <!-- 页面标题区域 -->
    <div class="page-header-custom">
      <div class="header-content">
        <span class="page-title">帮助中心</span>
        <span class="page-subtitle">快速找到您需要的答案</span>
      </div>
      <div class="header-stats">
        <el-tag>分类: {{ categories.length }} 个</el-tag>
        <el-tag v-if="searchResults.length > 0" type="success">搜索结果: {{ searchResults.length }} 条</el-tag>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-box-wrapper">
      <el-row :gutter="16">
        <el-col :span="20">
          <el-input
              v-model="searchQuery"
              placeholder="输入您的问题关键词..."
              @keyup.enter="searchHelp"
              clearable
              class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button
              @click="searchHelp"
              type="primary"
              class="search-button"
          >
            搜索
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 内容区域 -->
    <div class="content-container">
      <!-- 左侧分类区域 -->
      <div class="category-section">
        <div class="section-title">
          <el-icon><Folder /></el-icon>
          <span>问题分类</span>
        </div>

        <div class="category-list">
          <div
              v-for="category in categories"
              :key="category.id"
              class="category-card"
              @click="toggleCategory(category.id)"
          >
            <div class="category-header">
              <div class="category-title">
                <el-icon :class="{'rotate-icon': activeCategory === category.id}">
                  <ArrowRight />
                </el-icon>
                <h3>{{ category.title }}</h3>
              </div>
              <el-tag size="small" type="info">
                {{ category.questions.length }} 个问题
              </el-tag>
            </div>

            <el-collapse-transition>
              <div v-show="activeCategory === category.id" class="questions-list">
                <div
                    v-for="question in category.questions"
                    :key="question.id"
                    class="question-item"
                    @click.stop="selectQuestion(question)"
                    :class="{'active': selectedQuestion && selectedQuestion.id === question.id}"
                >
                  <el-icon><Document /></el-icon>
                  <span>{{ question.title }}</span>
                </div>
              </div>
            </el-collapse-transition>
          </div>
        </div>
      </div>

      <!-- 右侧详情区域 -->
      <div class="detail-section">
        <div v-if="selectedQuestion" class="question-detail">
          <div class="section-title">
            <el-icon><ChatDotRound /></el-icon>
            <span>问题详情</span>
          </div>

          <div class="detail-content">
            <h3>{{ selectedQuestion.title }}</h3>
            <div class="answer-content">
              <p>{{ selectedQuestion.answer }}</p>
            </div>

            <div class="feedback">
              <p class="feedback-title">这个回答有帮助吗？</p>
              <div class="feedback-buttons">
                <el-button
                    @click="rateHelpful(true)"
                    type="success"
                    plain
                >
                  <el-icon><SuccessFilled /></el-icon> 有帮助
                </el-button>
                <el-button
                    @click="rateHelpful(false)"
                    type="danger"
                    plain
                >
                  <el-icon><CircleCloseFilled /></el-icon> 没帮助
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-detail">
          <el-empty
              :image-size="150"
              description="请从左侧选择一个问题查看详情"
          />
        </div>
      </div>
    </div>

    <!-- 搜索结果区域 -->
    <div v-if="searchResults.length > 0" class="search-results">
      <div class="section-title">
        <el-icon><Search /></el-icon>
        <span>搜索结果</span>
      </div>

      <div class="result-list">
        <div
            v-for="result in searchResults"
            :key="result.id"
            class="result-item"
            @click="selectQuestion(result)"
        >
          <el-icon><Document /></el-icon>
          <span class="result-title">{{ result.title }}</span>
          <span class="result-category">{{ getCategoryName(result.categoryId) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Search, Folder, ArrowRight, Document,
  ChatDotRound, SuccessFilled, CircleCloseFilled
} from '@element-plus/icons-vue'

// 响应式数据
const searchQuery = ref('')
const categories = ref([])
const activeCategory = ref(null)
const selectedQuestion = ref(null)
const searchResults = ref([])
const isLoading = ref(false)

// 模拟获取帮助分类数据
const fetchHelpCategories = async () => {
  isLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    categories.value = [
      {
        id: 1,
        title: '平台使用指南',
        questions: [
          {
            id: 101,
            categoryId: 1,
            title: '如何注册账号？',
            answer: '访问注册页面，填写必要信息并提交即可完成注册。注册后您将收到验证邮件，请及时验证邮箱以激活账号。'
          },
          {
            id: 102,
            categoryId: 1,
            title: '如何上传检测数据？',
            answer: '在数据管理页面点击"上传"按钮，选择文件后提交。支持CSV和Excel格式文件，最大文件大小为50MB。上传后系统会自动解析数据并保存。'
          }
        ]
      },
      {
        id: 2,
        title: '设备操作问题',
        questions: [
          {
            id: 201,
            categoryId: 2,
            title: '如何校准测量设备？',
            answer: '进入设备设置，选择校准选项，按照屏幕提示操作。确保设备处于稳定状态，避免外界干扰。校准过程大约需要5分钟。'
          },
          {
            id: 202,
            categoryId: 2,
            title: '设备连接失败怎么办？',
            answer: '1. 检查网络连接和设备电源；2. 重启设备后重试；3. 检查设备IP地址是否正确；4. 联系技术支持获取帮助。'
          },
          {
            id: 203,
            categoryId: 2,
            title: '系统设置操作说明',
            answer: '1. 启动监听器后，系统将开始接收来自华为云IoT平台的消息\n' +
                '\n' +
                '2. 监听器状态将显示消息处理的实时统计信息\n' +
                '\n' +
                '3. 当成功率低于95%时，请检查日志排查问题\n' +
                '\n' +
                '4. 健康检查功能验证数据库和Redis的连接状态'
          },
        ]
      },
      {
        id: 3,
        title: '数据分析',
        questions: [
          {
            id: 301,
            categoryId: 3,
            title: '如何解读拉伸强度数据？',
            answer: '拉伸强度反映了材料的抗拉能力，数值越高表示材料越坚固。标准范围根据材料类型和应用场景有所不同，请参考应用场景管理中的标准规范。'
          },
          {
            id: 302,
            categoryId: 3,
            title: '电导率的标准范围是多少？',
            answer: '铜线的电导率通常在58-60 MS/m之间为正常值。铝线为35-38 MS/m。具体标准请参考应用场景管理中的配置。'
          }
        ]
      },
      {
        id: 4,
        title: '账户与安全',
        questions: [
          {
            id: 401,
            categoryId: 4,
            title: '如何重置密码？',
            answer: '在登录页面点击"忘记密码"，输入注册邮箱，系统将发送重置链接到您的邮箱。点击链接后设置新密码即可完成重置。'
          },
          {
            id: 402,
            categoryId: 4,
            title: '如何修改账户信息？',
            answer: '登录后进入"个人中心"页面，点击"编辑资料"按钮即可修改用户名、邮箱等账户信息。修改邮箱需要重新验证。'
          }
        ]
      }
    ]
  } finally {
    isLoading.value = false
  }
}

// 切换分类展开状态
const toggleCategory = (categoryId) => {
  activeCategory.value = activeCategory.value === categoryId ? null : categoryId
}

// 选择问题
const selectQuestion = (question) => {
  selectedQuestion.value = question
  searchResults.value = []
}

// 搜索帮助内容
const searchHelp = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  isLoading.value = true
  try {
    // 模拟搜索API
    await new Promise(resolve => setTimeout(resolve, 300))
    const query = searchQuery.value.toLowerCase()
    const results = []

    categories.value.forEach(category => {
      category.questions.forEach(question => {
        if (question.title.toLowerCase().includes(query) ||
            question.answer.toLowerCase().includes(query)) {
          // 添加分类ID以便显示分类名称
          results.push({...question, categoryId: category.id})
        }
      })
    })

    searchResults.value = results
  } finally {
    isLoading.value = false
  }
}

// 反馈帮助内容
const rateHelpful = async (isHelpful) => {
  // 模拟反馈API
  await new Promise(resolve => setTimeout(resolve, 200))
  const message = isHelpful ? '感谢您的反馈！我们会继续提供优质内容。' : '抱歉没能帮到您，我们会改进这个回答。'
  ElMessage({
    message,
    type: isHelpful ? 'success' : 'warning',
    duration: 3000
  })
}

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categories.value.find(cat => cat.id === categoryId)
  return category ? category.title : '未知分类'
}

onMounted(() => {
  fetchHelpCategories()
})
</script>

<style scoped>
.help-center {
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

.search-box-wrapper {
  margin-bottom: 30px;
  padding: 15px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.search-input :deep(.el-input__wrapper) {
  background-color: #ffffff;
  border: 2px solid #d4e8ff;
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 10px 16px;
  height: 48px;
  box-shadow: none;
}

.search-input :deep(.el-input__wrapper:hover) {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.search-input :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
}

.search-button {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #409eff, #367bd6);
  border: none;
  color: white;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.search-button:hover {
  background: linear-gradient(135deg, #367bd6, #2c66b8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(54, 123, 214, 0.3);
}

.content-container {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

@media (max-width: 992px) {
  .content-container {
    flex-direction: column;
  }
}

.category-section, .detail-section {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.category-section {
  flex: 1;
}

.detail-section {
  flex: 1;
}

.section-title {
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8faff, #e6f0ff);
  border-bottom: 1px solid #e6f0ff;
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #1a3a6e;
}

.section-title .el-icon {
  margin-right: 8px;
  color: #409eff;
}

.category-list {
  padding: 10px;
}

.category-card {
  margin-bottom: 15px;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #e6f0ff;
}

.category-card:hover {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  border-color: #d4e8ff;
  transform: translateY(-3px);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  background: #f8faff;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a3a6e;
}

.rotate-icon {
  transform: rotate(90deg);
  transition: transform 0.3s ease;
}

.questions-list {
  padding: 0 15px 15px;
}

.question-item {
  padding: 12px 15px;
  margin: 8px 0;
  border-radius: 6px;
  background: #f8faff;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid #d4e8ff;
}

.question-item:hover {
  background: #e6f0ff;
  border-left-color: #409eff;
  transform: translateX(5px);
}

.question-item.active {
  background: #e6f0ff;
  border-left-color: #409eff;
  font-weight: 500;
}

.question-item .el-icon {
  color: #409eff;
}

.detail-content {
  padding: 20px;
}

.detail-content h3 {
  margin-top: 0;
  padding-bottom: 15px;
  border-bottom: 1px solid #e6f0ff;
  color: #1a3a6e;
}

.answer-content {
  padding: 20px 0;
  line-height: 1.8;
  color: #333;
}

.answer-content p {
  margin: 15px 0;
}

.feedback {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e6f0ff;
}

.feedback-title {
  font-weight: 500;
  margin-bottom: 15px;
  color: #5b7ba8;
}

.feedback-buttons {
  display: flex;
  gap: 15px;
}

.empty-detail {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.search-results {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  padding: 0 0 20px;
  margin-top: 20px;
}

.result-list {
  padding: 0 20px;
}

.result-item {
  padding: 15px;
  margin: 10px 0;
  border-radius: 8px;
  background: #f8faff;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid #d4e8ff;
}

.result-item:hover {
  background: #e6f0ff;
  border-left-color: #409eff;
  transform: translateX(5px);
}

.result-title {
  flex: 1;
  font-weight: 500;
}

.result-category {
  background: #e6f0ff;
  color: #409eff;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
}
</style>
