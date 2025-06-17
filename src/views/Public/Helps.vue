<template>
  <div class="help-center">
    <h1>帮助中心</h1>
    <div class="search-box">
      <input
          v-model="searchQuery"
          placeholder="输入您的问题..."
          @keyup.enter="searchHelp"
      />
      <button @click="searchHelp">搜索</button>
    </div>

    <div class="help-categories">
      <div
          v-for="category in categories"
          :key="category.id"
          class="category-card"
          @click="toggleCategory(category.id)"
      >
        <h3>{{ category.title }}</h3>
        <div v-if="activeCategory === category.id" class="questions-list">
          <div
              v-for="question in category.questions"
              :key="question.id"
              class="question-item"
              @click.stop="selectQuestion(question)"
          >
            {{ question.title }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedQuestion" class="question-detail">
      <h3>{{ selectedQuestion.title }}</h3>
      <p>{{ selectedQuestion.answer }}</p>
      <div class="feedback">
        <p>这个回答有帮助吗？</p>
        <button @click="rateHelpful(true)">有帮助</button>
        <button @click="rateHelpful(false)">没帮助</button>
      </div>
    </div>

    <div v-if="searchResults.length > 0" class="search-results">
      <h3>搜索结果</h3>
      <div
          v-for="result in searchResults"
          :key="result.id"
          class="result-item"
          @click="selectQuestion(result)"
      >
        {{ result.title }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

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
          { id: 101, title: '如何注册账号？', answer: '访问注册页面，填写必要信息并提交即可完成注册。' },
          { id: 102, title: '如何上传检测数据？', answer: '在数据管理页面点击"上传"按钮，选择文件后提交。' }
        ]
      },
      {
        id: 2,
        title: '设备操作问题',
        questions: [
          { id: 201, title: '如何校准测量设备？', answer: '进入设备设置，选择校准选项，按照屏幕提示操作。' },
          { id: 202, title: '设备连接失败怎么办？', answer: '检查网络连接和设备电源，重启设备后重试。' }
        ]
      },
      {
        id: 3,
        title: '数据分析',
        questions: [
          { id: 301, title: '如何解读拉伸强度数据？', answer: '拉伸强度反映了材料的抗拉能力，数值越高表示材料越坚固。' },
          { id: 302, title: '电导率的标准范围是多少？', answer: '铜线的电导率通常在58-60 MS/m之间为正常值。' }
        ]
      }
    ]
  } finally {
    isLoading.value = false
  }
}

const toggleCategory = (categoryId) => {
  activeCategory.value = activeCategory.value === categoryId ? null : categoryId
}

const selectQuestion = (question) => {
  selectedQuestion.value = question
  searchResults.value = []
}

const searchHelp = async () => {
  if (!searchQuery.value.trim()) return

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
          results.push(question)
        }
      })
    })

    searchResults.value = results
  } finally {
    isLoading.value = false
  }
}

const rateHelpful = async (isHelpful) => {
  // 模拟反馈API
  await new Promise(resolve => setTimeout(resolve, 200))
  console.log(`反馈记录: 问题ID ${selectedQuestion.value.id} - ${isHelpful ? '有帮助' : '没帮助'}`)
  alert(`感谢您的反馈！我们将持续改进帮助内容。`)
}

onMounted(() => {
  fetchHelpCategories()
})
</script>

<style scoped>
.help-center {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.search-box {
  display: flex;
  margin: 20px 0;
}

.search-box input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
}

.search-box button {
  padding: 10px 15px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.help-categories {
  margin-top: 30px;
}

.category-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.category-card:hover {
  background: #f0f0f0;
}

.questions-list {
  margin-top: 10px;
  padding-left: 15px;
}

.question-item {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.question-item:hover {
  color: #42b983;
}

.question-detail {
  margin-top: 30px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.feedback {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #ddd;
}

.feedback button {
  margin-right: 10px;
  padding: 5px 10px;
  background: #eee;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.feedback button:hover {
  background: #ddd;
}

.search-results {
  margin-top: 20px;
}

.result-item {
  padding: 10px;
  background: #f0f0f0;
  margin-bottom: 5px;
  border-radius: 4px;
  cursor: pointer;
}

.result-item:hover {
  background: #e0e0e0;
}
</style>
