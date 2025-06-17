<template>
  <div class="questionnaire">
    <h1>用户满意度调查</h1>
    <p class="description">感谢您使用金属微细线材综合检测平台，您的反馈将帮助我们改进产品和服务。</p>

    <form @submit.prevent="submitQuestionnaire">
      <div class="form-section" v-for="(section, index) in questionnaire" :key="index">
        <h3>{{ section.title }}</h3>

        <div class="question" v-for="question in section.questions" :key="question.id">
          <p class="question-text">{{ question.text }}</p>

          <div v-if="question.type === 'rating'" class="rating-options">
            <label v-for="i in 5" :key="i">
              <input
                  type="radio"
                  :name="question.id"
                  :value="i"
                  v-model="answers[question.id]"
                  required
              />
              {{ i }}
            </label>
            <div class="rating-labels">
              <span>非常不满意</span>
              <span>非常满意</span>
            </div>
          </div>

          <div v-else-if="question.type === 'multiple-choice'" class="multiple-choice">
            <label v-for="option in question.options" :key="option">
              <input
                  type="checkbox"
                  :name="question.id"
                  :value="option"
                  v-model="answers[question.id]"
              />
              {{ option }}
            </label>
          </div>

          <div v-else-if="question.type === 'text'" class="text-answer">
            <textarea
                v-model="answers[question.id]"
                :placeholder="question.placeholder || '请输入您的回答...'"
                :required="question.required"
            ></textarea>
          </div>
        </div>
      </div>

      <div class="submit-section">
        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? '提交中...' : '提交问卷' }}
        </button>
      </div>
    </form>

    <div v-if="submitSuccess" class="success-message">
      <h3>感谢您的参与！</h3>
      <p>您的反馈对我们非常重要，我们将根据您的建议不断改进我们的产品和服务。</p>
      <button @click="resetQuestionnaire">填写另一份问卷</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

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
          '线径测量',
          '拉伸强度检测',
          '电导率测量',
          '单位重量测量',
          '数据查询'
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
          '单位重量测量'
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

const answers = ref({})
const isSubmitting = ref(false)
const submitSuccess = ref(false)

// 初始化答案对象
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

initAnswers()

const submitQuestionnaire = async () => {
  isSubmitting.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('提交的问卷数据:', answers.value)
    submitSuccess.value = true
  } catch (error) {
    console.error('提交问卷失败:', error)
    alert('提交失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

const resetQuestionnaire = () => {
  submitSuccess.value = false
  initAnswers()
}
</script>

<style scoped>
.questionnaire {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.description {
  color: #666;
  margin-bottom: 30px;
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.question {
  margin-bottom: 25px;
}

.question-text {
  font-weight: 500;
  margin-bottom: 10px;
}

.rating-options {
  display: flex;
  align-items: center;
  gap: 15px;
}

.rating-options label {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.rating-options input[type="radio"] {
  margin-bottom: 5px;
}

.rating-labels {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 0.8em;
  color: #666;
}

.multiple-choice {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.multiple-choice label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.text-answer textarea {
  width: 100%;
  min-height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.submit-section {
  text-align: center;
  margin-top: 30px;
}

.submit-section button {
  padding: 12px 25px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-section button:hover {
  background-color: #3aa876;
}

.submit-section button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.success-message {
  text-align: center;
  padding: 30px;
  background: #f0f9f0;
  border-radius: 8px;
  margin-top: 20px;
}

.success-message h3 {
  color: #42b983;
  margin-bottom: 15px;
}

.success-message button {
  margin-top: 20px;
  padding: 10px 20px;
  background: #ddd;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
