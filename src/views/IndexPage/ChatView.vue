<template>
  <div class="chat-container">
    <!-- 页面标题区域 -->
    <div class="page-header-custom">
      <div class="header-content">
        <span class="page-title">智能决策</span>
        <span class="page-subtitle">智能对话系统</span>
      </div>
      <div class="header-stats">
        <el-tag>会话数: {{ sessions.length }}</el-tag>
        <el-tag v-if="currentSession" type="success">
          当前会话: {{ currentSession.title }}
        </el-tag>
      </div>
    </div>

    <!-- 主聊天区域 -->
    <div class="chat-main">
      <!-- 会话列表 -->
      <div class="session-list">
        <div class="session-actions">
          <el-button
              type="primary"
              @click="createNewSession"
              icon="Plus"
          >
            新建会话
          </el-button>
          <el-button
              type="danger"
              @click="cleanupExpiredSessions"
              icon="Delete"
              plain
          >
            清理过期会话
          </el-button>
        </div>

        <el-scrollbar class="session-scroll">
          <div
              v-for="session in sessions"
              :key="session.sessionId"
              class="session-item"
              :class="{ active: currentSession?.sessionId === session.sessionId }"
              @click="selectSession(session)"
          >
            <div class="session-title">
              <el-icon><ChatDotRound /></el-icon>
              <span>{{ session.title }}</span>
            </div>
            <div class="session-info">
              <span class="last-message">{{ truncate(session.lastMessage, 20) }}</span>
              <span class="update-time">{{ formatTime(session.updateTime) }}</span>
            </div>
            <div class="session-actions">
              <el-button
                  size="small"
                  type="danger"
                  @click.stop="deleteSession(session.sessionId)"
                  icon="Delete"
                  circle
                  plain
              />
              <el-button
                  size="small"
                  type="primary"
                  @click.stop="editSessionTitle(session)"
                  icon="Edit"
                  circle
                  plain
              />
            </div>
          </div>
        </el-scrollbar>
      </div>

      <!-- 聊天区域 -->
      <div class="chat-area">
        <div v-if="currentSession" class="chat-messages">
          <el-scrollbar ref="messageScroll" class="message-scroll">
            <div
                v-for="message in messages"
                :key="message.messageId"
                class="message-item"
                :class="message.role"
            >
              <div class="message-avatar">
                <el-avatar v-if="message.role === 'user'">
                  <img v-if="userAvatar" :src="userAvatar" alt="用户头像" />
                  <span v-else>{{ userNameInitial }}</span>
                </el-avatar>
                <el-avatar v-else style="background-color: #409EFF">
                  <el-icon><ChatDotRound /></el-icon>
                </el-avatar>
              </div>
              <div class="message-content">
                <div class="message-meta">
                  <span class="message-role">{{ message.role === 'user' ? user_name + '(我)' : 'AI助手' }}</span>
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                </div>
                <div
                    class="message-text"
                    v-if="message.role === 'assistant'"
                >
                  <!-- 显示AI回复内容 -->
                  <div v-if="message.isRendered" v-html="renderMarkdown(message.content)"></div>
                  <div v-else>
                    <span v-html="renderMarkdown(message.displayContent)"></span>
                    <span v-if="message.isTyping" class="typing-cursor">|</span>
                  </div>

                  <!-- 思考中动画 -->
                  <div v-if="message.isLoading" class="typing-indicator">
                    正在思考<span></span><span></span><span></span>
                  </div>
                </div>
                <div
                    class="message-text"
                    v-else
                >{{ message.content }}</div>
              </div>
            </div>
          </el-scrollbar>
        </div>

        <div v-else class="empty-chat">
          <el-empty description="请选择一个会话或创建新会话" />
        </div>

        <!-- 消息输入区域 -->
        <div class="message-input">
          <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="3"
              placeholder="输入消息内容..."
              :disabled="!currentSession"
              @keyup.enter.exact="sendMessage"
          />
          <div class="input-actions">
            <el-button
                type="primary"
                @click="sendMessage"
                :disabled="!inputMessage || !currentSession || sending"
                :loading="sending"
            >
              发送
            </el-button>
            <el-button
                @click="clearInput"
                :disabled="!inputMessage"
            >
              清空
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑会话标题对话框 -->
    <el-dialog
        v-model="showEditDialog"
        title="编辑会话标题"
        width="400px"
    >
      <el-input v-model="editingTitle" placeholder="请输入新标题" maxlength="50" show-word-limit />
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmEditTitle">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, onMounted, nextTick, computed} from 'vue'
import {
  Plus, Delete, Edit, User, ChatDotRound
} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import chatAPI from '@/api/chat'
import {useAuthStore} from '@/stores/auth'
import MarkdownIt from 'markdown-it'

// 初始化 Markdown 解析器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

// 引入用户认证信息
const authStore = useAuthStore()

// 响应式数据
const sessions = ref([])
const currentSession = ref(null)
const messages = ref([])
const inputMessage = ref('')
const sending = ref(false)
const showEditDialog = ref(false)
const editingSession = ref(null)
const editingTitle = ref('')
const messageScroll = ref(null)

// 用户头像逻辑（从Dashboard复制）
const userAvatar = computed(() => authStore.user?.avatar_url || '')
const userNameInitial = computed(() => {
  return authStore.user?.user_name?.charAt(0)?.toUpperCase() || ''
})
const user_name = computed(() => authStore.user?.user_name || '')

// 初始化加载会话列表
onMounted(() => {
  fetchSessions()
})

// 获取会话列表
const fetchSessions = async () => {
  try {
    const response = await chatAPI.getUserSessions()
    sessions.value = response.data.sessions || []
    if (sessions.value.length > 0 && !currentSession.value) {
      selectSession(sessions.value[0])
    }
  } catch (error) {
    ElMessage.error('获取会话列表失败: ' + (error.response?.data?.message || error.message))
  }
}

// 选择会话
const selectSession = async (session) => {
  currentSession.value = session
  try {
    const response = await chatAPI.getChatHistory(session.sessionId)
    // 确保所有消息都有必要的字段
    messages.value = (response.data.messages || []).map(msg => {
      return {
        ...msg,
        displayContent: msg.content,
        isRendered: true,
        isTyping: false,
        isLoading: false
      }
    })
    scrollToBottom()
  } catch (error) {
    ElMessage.error('获取聊天历史失败: ' + (error.response?.data?.message || error.message))
  }
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || !currentSession.value || sending.value) return

  sending.value = true

  // 1. 立即添加用户消息到聊天框
  const userMessage = {
    messageId: `user_${Date.now()}`,
    role: 'user',
    content: inputMessage.value,
    timestamp: new Date().toISOString()
  }
  messages.value.push(userMessage)

  // 2. 添加AI思考中消息
  const aiMessageId = `ai_${Date.now()}`
  const aiMessage = {
    messageId: aiMessageId,
    role: 'assistant',
    content: '',
    displayContent: '',
    isRendered: false,
    isTyping: true,
    isLoading: true,
    timestamp: new Date().toISOString()
  }
  messages.value.push(aiMessage)

  // 3. 清空输入框
  const currentInput = inputMessage.value
  inputMessage.value = ''

  // 4. 滚动到底部
  scrollToBottom()

  try {
    const response = await chatAPI.sendMessage(
        currentSession.value.sessionId,
        currentInput
    )

    if (response.code === 'success') {
      // 找到AI消息并更新
      const aiMsgIndex = messages.value.findIndex(m => m.messageId === aiMessageId)
      if (aiMsgIndex !== -1) {
        // 更新消息内容
        messages.value[aiMsgIndex].content = response.data.assistantMessage
        messages.value[aiMsgIndex].isLoading = false

        // 启动打字机效果
        startTypewriterEffect(messages.value[aiMsgIndex], response.data.assistantMessage)
      }

      // 更新会话列表
      await fetchSessions()
    } else {
      ElMessage.error(response.msg || '发送消息失败')
      // 如果失败，显示错误信息
      const aiMsgIndex = messages.value.findIndex(m => m.messageId === aiMessageId)
      if (aiMsgIndex !== -1) {
        messages.value[aiMsgIndex].content = '抱歉，生成回答时出错'
        messages.value[aiMsgIndex].displayContent = '抱歉，生成回答时出错'
        messages.value[aiMsgIndex].isLoading = false
        messages.value[aiMsgIndex].isTyping = false
        messages.value[aiMsgIndex].isRendered = true
      }
    }
  } catch (error) {
    ElMessage.error('发送消息失败: ' + (error.response?.data?.message || error.message))
    // 如果出错，显示错误信息
    const aiMsgIndex = messages.value.findIndex(m => m.messageId === aiMessageId)
    if (aiMsgIndex !== -1) {
      messages.value[aiMsgIndex].content = '请求出错: ' + error.message
      messages.value[aiMsgIndex].displayContent = '请求出错: ' + error.message
      messages.value[aiMsgIndex].isLoading = false
      messages.value[aiMsgIndex].isTyping = false
      messages.value[aiMsgIndex].isRendered = true
    }
  } finally {
    sending.value = false
  }
}

// 打字机效果
const startTypewriterEffect = (message, fullContent) => {
  let index = 0
  message.displayContent = ''

  const typeNextChar = () => {
    if (index < fullContent.length) {
      message.displayContent += fullContent.charAt(index)
      index++
      scrollToBottom()
      setTimeout(typeNextChar, 2) // 控制打字速度
    } else {
      // 打字完成
      message.isTyping = false
      message.isRendered = true
    }
  }

  // 开始打字效果
  typeNextChar()
}

// 创建新会话
const createNewSession = async () => {
  try {
    const response = await chatAPI.createSession()
    if (response.success) {
      ElMessage.success('新会话创建成功')
      if (sessions.value.length > 0) {
        const newSession = sessions.value.find(s => s.sessionId === response.data.sessionId)
        if (newSession) selectSession(newSession)
      }
    }
    await fetchSessions()
  } catch (error) {
    ElMessage.error('创建会话失败: ' + (error.response?.data?.message || error.message))
  }
}

// 删除会话
const deleteSession = (sessionId) => {
  ElMessageBox.confirm('确定要删除此会话吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await chatAPI.deleteSession(sessionId)
      ElMessage.success('会话删除成功')
      if (currentSession.value?.sessionId === sessionId) {
        currentSession.value = null
        messages.value = []
      }
      await fetchSessions()
    } catch (error) {
      ElMessage.error('删除会话失败: ' + (error.response?.data?.message || error.message))
    }
  }).catch(() => {
  })
}

// 编辑会话标题
const editSessionTitle = (session) => {
  editingSession.value = session
  editingTitle.value = session.title
  showEditDialog.value = true
}

// 确认编辑标题
const confirmEditTitle = async () => {
  if (!editingSession.value || !editingTitle.value.trim()) return

  try {
    await chatAPI.updateSessionTitle(
        editingSession.value.sessionId,
        editingTitle.value
    )
    ElMessage.success('会话标题更新成功')
    showEditDialog.value = false
    await fetchSessions()
    if (currentSession.value?.sessionId === editingSession.value.sessionId) {
      currentSession.value.title = editingTitle.value
    }
  } catch (error) {
    ElMessage.error('更新标题失败: ' + (error.response?.data?.message || error.message))
  }
}

// 清理过期会话
const cleanupExpiredSessions = async () => {
  try {
    await chatAPI.cleanupExpiredSessions()
    ElMessage.success('过期会话清理成功')
    if (currentSession.value && !sessions.value.some(s => s.sessionId === currentSession.value.sessionId)) {
      currentSession.value = null
      messages.value = []
    }
    await fetchSessions()
  } catch (error) {
    ElMessage.error('清理会话失败: ' + (error.response?.data?.message || error.message))
  }
}

// 清空输入
const clearInput = () => {
  inputMessage.value = ''
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageScroll.value) {
      messageScroll.value.setScrollTop(messageScroll.value.wrapRef.scrollHeight)
    }
  })
}

// 格式化时间
const formatTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)
  return date.toLocaleString()
}

// 截断文本
const truncate = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

// 渲染 Markdown 内容
const renderMarkdown = (content) => {
  return md.render(content || '')
}
</script>

<style scoped>
.chat-container {
  padding: 20px;
  background: #f8faff;
  height: 100vh;
  display: flex;
  flex-direction: column;
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

.chat-main {
  display: flex;
  flex: 1;
  height: 0; /* 修复Flex布局高度问题 */
  gap: 20px;
}

.session-list {
  width: 280px;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e6f0ff;
  overflow: hidden;
}

.session-actions {
  padding: 12px;
  border-bottom: 1px solid #e6f0ff;
  display: flex;
  gap: 8px;
}

.session-scroll {
  flex: 1;
  padding: 8px;
  overflow: auto;
}

.session-item {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e6f0ff;
  background: #ffffff;
}

.session-item:hover {
  background: #f8faff;
  border-color: #d4e8ff;
}

.session-item.active {
  background: #e6f0ff;
  border-color: #c0d8ff;
}

.session-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #1a3a6e;
  margin-bottom: 6px;
}

.session-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #5b7ba8;
  margin-bottom: 6px;
}

.last-message {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.update-time {
  margin-left: 8px;
}

.session-actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e6f0ff;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow: hidden;
}

.empty-chat {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-scroll {
  height: 100%;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  gap: 12px;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  max-width: 70%;
}

.user .message-content {
  margin-left: auto;
}

.assistant .message-content {
  margin-right: auto;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 12px;
  color: #5b7ba8;
}

.user .message-meta {
  justify-content: flex-end;
}

.message-role {
  font-weight: 500;
}

.message-text {
  padding: 12px;
  border-radius: 8px;
  background: #f8faff;
  line-height: 1.5;
  word-break: break-word;
}

.user .message-text {
  background: #e6f0ff;
  border-top-right-radius: 0;
}

.assistant .message-text {
  background: #ffffff;
  border: 1px solid #e6f0ff;
  border-top-left-radius: 0;
}

.message-input {
  padding: 16px;
  border-top: 1px solid #e6f0ff;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  gap: 8px;
}

/* Markdown 渲染样式 */
.message-text :deep(h1),
.message-text :deep(h2),
.message-text :deep(h3) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  font-weight: bold;
}

.message-text :deep(h1) {
  font-size: 1.5em;
}

.message-text :deep(h2) {
  font-size: 1.3em;
}

.message-text :deep(h3) {
  font-size: 1.1em;
}

.message-text :deep(ul),
.message-text :deep(ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.message-text :deep(li) {
  margin: 0.3em 0;
}

.message-text :deep(pre) {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0.5em 0;
}

.message-text :deep(code) {
  background-color: #f5f7fa;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}

.message-text :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
  border: 1px solid #dcdfe6;
}

.message-text :deep(th),
.message-text :deep(td) {
  border: 1px solid #dcdfe6;
  padding: 8px;
  text-align: left;
}

.message-text :deep(blockquote) {
  border-left: 4px solid #409EFF;
  padding-left: 10px;
  margin: 10px 0;
  color: #5b7ba8;
}

/* 打字机光标效果 */
.typing-cursor {
  display: inline-block;
  margin-left: 2px;
  animation: blink 1s infinite;
  color: #333;
  font-weight: bold;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* 思考中动画 */
.typing-indicator {
  display: flex;
  padding: 10px 0;
  align-items: center;
  color: #666;
  font-size: 14px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background-color: #9e9e9e;
  border-radius: 50%;
  display: inline-block;
  margin: 0 3px;
  animation: bounce 1.3s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.5);
  }
  40% {
    transform: scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-main {
    flex-direction: column;
    height: auto;
  }

  .session-list {
    width: 100%;
    margin-bottom: 20px;
  }

  .chat-area {
    min-height: 500px;
  }
}
</style>
