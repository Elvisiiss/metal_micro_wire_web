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
import { ElMessage } from 'element-plus'

// 响应式数据
const searchQuery = ref('')
const categories = ref([])
const activeCategory = ref(null)
const selectedQuestion = ref(null)
const searchResults = ref([])
const isLoading = ref(false)

// 获取帮助分类数据
const fetchHelpCategories = async () => {
  isLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    categories.value = [
      {
        id: 1,
        title: '平台基础操作',
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
          },
          {
            id: 103,
            categoryId: 1,
            title: '如何查看个人资料？',
            answer: '点击右上角头像进入"个人中心"，您可以查看和编辑个人资料、修改密码以及管理头像等信息。'
          }
        ]
      },
      {
        id: 2,
        title: '设备管理',
        questions: [
          {
            id: 201,
            categoryId: 2,
            title: '如何添加新设备？',
            answer: '管理员在设备管理页面点击"添加设备"，填写设备ID和设备代码后保存。设备初始状态为关闭，添加后需要手动开启。'
          },
          {
            id: 202,
            categoryId: 2,
            title: '设备状态显示离线怎么办？',
            answer: '1. 检查设备电源和网络连接；2. 在设备管理页面尝试重新连接；3. 确保设备已在华为云IoT平台注册；4. 联系技术支持获取帮助。'
          },
          {
            id: 203,
            categoryId: 2,
            title: '如何控制设备开关？',
            answer: '在设备列表页面，找到对应设备，点击状态切换按钮。开启/关闭操作需要管理员权限，操作后请等待几秒查看状态更新。'
          }
        ]
      },
      {
        id: 3,
        title: '数据查询与分析',
        questions: [
          {
            id: 301,
            categoryId: 3,
            title: '如何查询线材检测数据？',
            answer: '在"线材管理"页面，您可以通过批次号、设备ID、生产商等多种条件筛选数据，支持分页查看和导出功能。'
          },
          {
            id: 302,
            categoryId: 3,
            title: '如何理解检测数据中的各项指标？',
            answer: '系统提供四项关键指标：直径(单位mm)、电导率、延展率(单位%)和重量(单位g)。每项指标都有标准范围值，可在应用场景管理中查看详情。'
          },
          {
            id: 303,
            categoryId: 3,
            title: '仪表板上的数据代表什么？',
            answer: '仪表板提供系统的整体运营数据，包括：总检测数量、合格率、各场景使用情况等。年度统计展示最近12个月的质量趋势，应用场景统计显示各场景的使用频率。'
          }
        ]
      },
      {
        id: 4,
        title: '应用场景管理',
        questions: [
          {
            id: 401,
            categoryId: 4,
            title: '什么是应用场景？',
            answer: '应用场景定义了不同用途下线材的标准规范，包括电导率、延展率、重量、直径等参数的上下限值。每个场景有唯一的两位数字编号。'
          },
          {
            id: 402,
            categoryId: 4,
            title: '如何创建新的应用场景？',
            answer: '管理员在应用场景管理页面点击"创建"，填写场景编号、名称、线材类型和各指标范围后保存。系统会自动验证数据合理性。'
          },
          {
            id: 403,
            categoryId: 4,
            title: '如何根据线材类型筛选场景？',
            answer: '在应用场景列表页面，使用线材类型筛选下拉框选择Cu(铜)、Al(铝)、Ni(镍)、Ti(钛)或Zn(锌)，系统会显示该类型的所有场景。'
          }
        ]
      },
      {
        id: 5,
        title: 'AI助手与质量分析',
        questions: [
          {
            id: 501,
            categoryId: 5,
            title: '如何与AI助手对话？',
            answer: '在聊天页面，输入您的问题后发送。AI助手可以回答关于系统使用、数据解读的问题，也可以帮助查询设备和线材数据。'
          },
          {
            id: 502,
            categoryId: 5,
            title: 'AI助手能做什么？',
            answer: 'AI助手可以：1. 查询设备状态；2. 获取线材检测数据；3. 进行质量问题分析；4. 提供生产商质量排名；5. 解释检测指标含义。'
          },
          {
            id: 503,
            categoryId: 5,
            title: '如何查看聊天记录？',
            answer: '在聊天页面左侧可以看到所有会话列表，点击会话标题可以查看完整对话历史。您也可以删除不需要的会话记录。'
          }
        ]
      },
      {
        id: 6,
        title: '质量溯源与报告',
        questions: [
          {
            id: 601,
            categoryId: 6,
            title: '如何查看生产商质量排名？',
            answer: '在质量溯源页面，选择"生产商排名"功能，系统会按不合格率对各生产商进行排序，帮助您评估供应商质量表现。'
          },
          {
            id: 602,
            categoryId: 6,
            title: '如何分析特定时间段的质量问题？',
            answer: '使用质量溯源的时间筛选功能，输入开始和结束时间，系统会分析该时间段内的质量数据，识别问题最多的维度和对象。'
          },
          {
            id: 603,
            categoryId: 6,
            title: '如何获取质量报告？',
            answer: '系统每天自动生成质量报告，您也可以在质量溯源页面手动触发报告生成。报告会发送到您的注册邮箱，包含关键指标和问题分析。'
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
