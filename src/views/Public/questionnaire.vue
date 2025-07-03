<template>
  <div class="questionnaire-container">
    <div class="page-header-custom">
      <div class="header-content">
        <span class="page-title">用户满意度调查</span>
        <span class="page-subtitle">您的反馈将帮助我们改进产品和服务</span>
      </div>
      <div class="header-stats">
        <el-tag>问题: {{ totalQuestions }} 个</el-tag>
        <el-tag v-if="answeredQuestions > 0" type="success">已完成: {{ answeredQuestions }}</el-tag>
      </div>
    </div>

    <div class="survey-content">
      <div v-if="!submitSuccess">
        <div class="form-section" v-for="(section, index) in questionnaire" :key="index">
          <div class="section-header">
            <el-icon><Folder /></el-icon>
            <h3>{{ section.title }}</h3>
          </div>

          <div class="question" v-for="question in section.questions" :key="question.id">
            <div class="question-header">
              <p class="question-text">{{ question.text }}</p>
              <el-tag v-if="question.required" type="danger" size="small">必填</el-tag>
            </div>

            <div v-if="question.type === 'rating'" class="rating-options">
              <div class="rating-scale">
                <div class="rating-item" v-for="i in 5" :key="i">
                  <el-radio
                      :name="question.id"
                      :value="i"
                      v-model="answers[question.id]"
                      :label="i"
                  />
                  <span class="rating-label">{{ i }}</span>
                </div>
              </div>
              <div class="rating-labels">
                <span>非常不满意</span>
                <span>非常满意</span>
              </div>
            </div>

            <div v-else-if="question.type === 'multiple-choice'" class="multiple-choice">
              <el-checkbox-group v-model="answers[question.id]">
                <el-checkbox
                    v-for="option in question.options"
                    :key="option"
                    :label="option"
                    class="choice-item"
                >
                  {{ option }}
                </el-checkbox>
              </el-checkbox-group>
            </div>

            <div v-else-if="question.type === 'text'" class="text-answer">
              <el-input
                  v-model="answers[question.id]"
                  type="textarea"
                  :placeholder="question.placeholder || '请输入您的回答...'"
                  :rows="4"
              />
            </div>
          </div>
        </div>

        <div class="submit-section">
          <el-button
              type="primary"
              size="large"
              @click="submitQuestionnaire"
              :loading="isSubmitting"
              :disabled="isSubmitting"
          >
            {{ isSubmitting ? '提交中...' : '提交问卷' }}
          </el-button>
        </div>
      </div>

      <div v-else class="success-message">
        <el-result
            icon="success"
            title="感谢您的参与！"
            sub-title="您的反馈对我们非常重要，我们将根据您的建议不断改进"
        >
          <template #extra>
            <el-button type="primary" @click="resetQuestionnaire">返回首页</el-button>
            <el-button @click="resetQuestionnaire">填写另一份问卷</el-button>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Folder } from '@element-plus/icons-vue'

// 问卷调查数据
const questionnaire = ref([
  {
    title: '平台使用体验',
    questions: [
      {
        id: 'q1',
        text: '您对平台的整体使用体验满意度如何？',
        type: 'rating',
        required: true
      },
      {
        id: 'q2',
        text: '您最常使用的功能有哪些？',
        type: 'multiple-choice',
        options: [
          '线材检测数据管理',
          '设备状态监控',
          '数据统计分析',
          '应用场景配置',
          '用户权限管理'
        ]
      },
      {
        id: 'q3',
        text: '您在使用过程中遇到过哪些问题？',
        type: 'text',
        placeholder: '请描述您遇到的问题...'
      }
    ]
  },
  {
    title: '数据准确性',
    questions: [
      {
        id: 'q4',
        text: '您对测量数据的准确性满意吗？',
        type: 'rating',
        required: true
      },
      {
        id: 'q5',
        text: '您认为哪些测量指标需要改进？',
        type: 'multiple-choice',
        options: [
          '线径测量精度',
          '拉伸强度检测',
          '电导率测量',
          '单位重量测量',
          '设备状态报告'
        ]
      }
    ]
  },
  {
    title: '改进建议',
    questions: [
      {
        id: 'q6',
        text: '您希望平台增加哪些新功能？',
        type: 'text',
        placeholder: '请提出您的宝贵建议...'
      },
      {
        id: 'q7',
        text: '其他意见或建议',
        type: 'text'
      }
    ]
  }
])

// 响应式状态
const answers = ref({})
const isSubmitting = ref(false)
const submitSuccess = ref(false)

// 计算属性
const totalQuestions = computed(() => {
  return questionnaire.value.reduce((total, section) => total + section.questions.length, 0)
})

const answeredQuestions = computed(() => {
  return Object.values(answers.value).filter(val => {
    if (Array.isArray(val)) return val.length > 0
    return val !== '' && val !== null
  }).length
})

// 初始化方法
const initAnswers = () => {
  answers.value = {}
  questionnaire.value.forEach(section => {
    section.questions.forEach(question => {
      if (question.type === 'multiple-choice') {
        answers.value[question.id] = []
      } else {
        answers.value[question.id] = ''
      }
    })
  })
}

// 问卷调查方法
const submitQuestionnaire = async () => {
  // 检查必填项
  const requiredQuestions = questionnaire.value.flatMap(section =>
      section.questions.filter(q => q.required))

  const missingRequired = requiredQuestions.some(q => {
    const answer = answers.value[q.id]
    return Array.isArray(answer) ? answer.length === 0 : !answer
  })

  if (missingRequired) {
    ElMessage.error('请填写所有必填问题')
    return
  }

  isSubmitting.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('提交的问卷数据:', answers.value)
    submitSuccess.value = true
  } catch (error) {
    console.error('提交问卷失败:', error)
    ElMessage.error('提交失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

const resetQuestionnaire = () => {
  submitSuccess.value = false
  initAnswers()
}

// 初始化
initAnswers()
</script>

<style scoped>
.questionnaire-container {
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

.survey-content {
  padding: 24px;
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8faff;
  border-radius: 10px;
  border: 1px solid #e6f0ff;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e6f0ff;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1a3a6e;
}

.section-header .el-icon {
  color: #409eff;
}

.question {
  margin-bottom: 25px;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e6f0ff;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.question-text {
  font-weight: 500;
  margin: 0;
  color: #1a3a6e;
}

.rating-options {
  padding: 10px 0;
}

.rating-scale {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.rating-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.rating-label {
  font-size: 14px;
  color: #5b7ba8;
}

.rating-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
  padding: 0 10px;
}

.multiple-choice {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  padding: 10px 0;
}

.choice-item {
  margin-right: 0;
  padding: 8px 12px;
  background: #f8faff;
  border-radius: 6px;
  border: 1px solid #e6f0ff;
}

.text-answer {
  padding: 10px 0;
}

.submit-section {
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

  .multiple-choice {
    grid-template-columns: 1fr;
  }
}
</style>
