<template>
  <div class="chat-view">
    <div class="chat-header">
      <h1>智能决策助手</h1>
      <p>专业解答线材检测相关问题</p>
    </div>

    <div class="chat-container">
      <!-- 聊天消息区域 -->
      <div class="chat-messages" ref="messagesContainer">
        <div v-for="(message, index) in chatMessages" :key="index"
             :class="['message', message.role]">
          <div class="avatar">
            <template v-if="message.role === 'user'">
              <img v-if="userAvatar" :src="userAvatar" alt="用户头像">
              <div v-else class="avatar-placeholder">{{ userNameInitial }}</div>
            </template>
            <div v-else class="ai-avatar">AI</div>
          </div>
          <div class="content">
            <div class="name">{{ message.role === 'user' ? userInfo.name : '决策助手' }}</div>
            <div class="text">
              <!-- 使用 v-html 渲染 Markdown 转换后的内容 -->
              <div v-if="message.isFormatted" v-html="message.formattedContent"></div>
              <div v-else>
                <span v-html="formatMessageSimple(message.displayContent)"></span>
                <span v-if="message.isTyping" class="typing-cursor">|</span>
              </div>
            </div>
            <div v-if="message.role === 'assistant' && message.isLoading" class="typing-indicator">
              正在思考<span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input">
        <textarea
            v-model="userInput"
            placeholder="输入关于线材检测的问题..."
            @keyup.enter.exact.prevent="sendMessage"
            :disabled="isLoading"
        ></textarea>
        <button
            @click="sendMessage"
            :disabled="isLoading || !userInput.trim()"
            class="send-btn"
        >
          <i class="icon-send"></i>
        </button>
      </div>

      <!-- 系统提示 -->
      <div class="chat-tips">
        <p>提示：您可以咨询关于线径测量、拉伸强度测试、电导率分析等专业问题</p>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, onMounted, nextTick, computed} from 'vue';
import { useAuthStore } from "@/stores/auth.js";

const authStore = useAuthStore()

// 简单的 Markdown 转 HTML 转换器
function markdownToHtml(text) {
  if (!text) return '';

  // 处理换行
  let html = text.replace(/\n/g, '<br>');

  // 处理粗体：**text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 处理斜体：*text*
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 处理内联代码：`code`
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');

  // 处理代码块：```language\ncode\n```
  html = html.replace(/```(\w*)\n([^`]+)```/g, '<div class="code-block"><span class="code-lang">$1</span><pre><code>$2</code></pre></div>');

  // 处理无序列表
  html = html.replace(/^- (.*?)(<br>|$)/g, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>');

  // 处理有序列表
  html = html.replace(/^\d+\. (.*?)(<br>|$)/g, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)+/g, '<ol>$&</ol>');

  // 处理引用
  html = html.replace(/^&gt; (.*?)(<br>|$)/g, '<blockquote>$1</blockquote>');

  return html;
}

export default {
  setup() {
    // 用户头像
    const userAvatar = computed(() => authStore.user?.avatar_url || '');

    // 智能聊天相关数据
    const chatMessages = ref([]);
    const userInput = ref('');
    const isLoading = ref(false);
    const messagesContainer = ref(null);
    const userInfo = ref({
      name: authStore.user?.user_name || '用户',
      role: authStore.user?.role_id === 1 ? '管理员' : '普通用户'
    });

    // 系统提示词 - 限制AI回答范围
    const systemPrompt = `
      你是一个聪明的人
    `;

    // 打字机效果的定时器
    let typewriterTimer = null;

    const userNameInitial = computed(() => {
      return authStore.user?.user_name?.charAt(0)?.toUpperCase() || '';
    });

    // 滚动到最新消息
    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    };

    // 简单的消息格式化 - 仅处理换行
    const formatMessageSimple = (text) => {
      if (!text) return '';
      return text.replace(/\n/g, '<br>');
    };

    // 打字机效果 - 逐字显示消息
    const typewriterEffect = (messageIndex, content) => {
      let charIndex = 0;
      const message = chatMessages.value[messageIndex];

      // 清空现有内容
      message.displayContent = '';
      message.isTyping = true;

      const typeNextChar = () => {
        if (charIndex < content.length) {
          // 添加下一个字符
          message.displayContent += content.charAt(charIndex);
          charIndex++;
          scrollToBottom();
          typewriterTimer = setTimeout(typeNextChar, 30); // 控制打字速度
        } else {
          // 打字完成
          message.isTyping = false;
          message.content = content; // 保存完整内容

          // 将内容转换为 Markdown 格式
          message.formattedContent = markdownToHtml(content);
          message.isFormatted = true;

          typewriterTimer = null;
        }
      };

      // 开始打字效果
      typeNextChar();
    };

    // 发送消息到DeepSeek API
    const sendMessage = async () => {
      if (isLoading.value || !userInput.value || !userInput.value.trim()) return;

      // 清除之前的打字机效果
      if (typewriterTimer) {
        clearTimeout(typewriterTimer);
        typewriterTimer = null;
      }

      const userMessage = userInput.value.trim();
      userInput.value = '';

      // 添加用户消息
      chatMessages.value.push({
        role: 'user',
        content: userMessage,
        displayContent: userMessage,
        isFormatted: false,
        timestamp: new Date()
      });

      // 添加AI的加载状态消息
      chatMessages.value.push({
        role: 'assistant',
        content: '',
        displayContent: '',
        formattedContent: '',
        isLoading: true,
        isTyping: false,
        isFormatted: false,
        timestamp: new Date()
      });

      scrollToBottom();

      isLoading.value = true;
      const aiMessageIndex = chatMessages.value.length - 1;

      try {
        // 注意：实际项目中API密钥应从安全的后端获取，这里仅为演示
        const apiKey = 'sk-c732bbeb9cb1435f9c4400d0217c8d17'; // 替换为实际API密钥
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              ...chatMessages.value
                  .filter(m => m.role !== 'assistant' || !m.isLoading)
                  .map(m => ({
                    role: m.role,
                    content: m.content
                  }))
            ],
            temperature: 0.7,
            max_tokens: 2000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            stop: null
          })
        });

        if (!response.ok) {
          throw new Error(`API请求失败: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // 更新AI消息状态
        chatMessages.value[aiMessageIndex].isLoading = false;

        // 启动打字机效果
        typewriterEffect(aiMessageIndex, aiResponse);
      } catch (error) {
        console.error('API请求错误:', error);
        chatMessages.value[aiMessageIndex].isLoading = false;
        chatMessages.value[aiMessageIndex].displayContent = `抱歉，处理您的请求时出错: ${error.message}`;
        chatMessages.value[aiMessageIndex].content = chatMessages.value[aiMessageIndex].displayContent;
        chatMessages.value[aiMessageIndex].formattedContent = markdownToHtml(chatMessages.value[aiMessageIndex].displayContent);
        chatMessages.value[aiMessageIndex].isFormatted = true;
      } finally {
        isLoading.value = false;
      }
    };

    // 初始化示例对话
    onMounted(() => {
      const welcomeMessage = '您好！我是金属微细线材检测助手。我可以帮助您解答关于线径测量、拉伸强度测试、电导率分析等专业问题。请问有什么可以帮您的？';
      chatMessages.value.push({
        role: 'assistant',
        content: welcomeMessage,
        displayContent: welcomeMessage,
        formattedContent: markdownToHtml(welcomeMessage),
        isLoading: false,
        isTyping: false,
        isFormatted: true,
        timestamp: new Date()
      });
    });

    return {
      userAvatar,
      chatMessages,
      userInput,
      isLoading,
      messagesContainer,
      userInfo,
      sendMessage,
      formatMessageSimple
    };
  }
};
</script>

<style scoped>
.chat-view {
  max-width: 1200px;
  margin: 0 auto;
  height: calc(100vh - 150px);
  display: flex;
  flex-direction: column;
}

.chat-header {
  margin-bottom: 20px;
}

.chat-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1a3a6e;
  margin: 0 0 8px 0;
}

.chat-header p {
  font-size: 14px;
  color: #5f6368;
  margin: 0;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
}

.message {
  display: flex;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.user {
  flex-direction: row-reverse;
}

.message .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.message .avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message .ai-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4e73df 0%, #2a4bc0 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
}

.message .content {
  max-width: 80%;
  margin: 0 15px;
}

.message.user .content {
  align-items: flex-end;
}

.message .name {
  font-size: 13px;
  font-weight: 600;
  color: #5f6368;
  margin-bottom: 5px;
}

.message .text {
  padding: 12px 16px;
  border-radius: 18px;
  line-height: 1.5;
  font-size: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  position: relative;
}

.message.user .text {
  background: #1a73e8;
  color: white;
  border-top-right-radius: 4px;
}

.message.assistant .text {
  background: white;
  color: #333;
  border: 1px solid #eaeaea;
  border-top-left-radius: 4px;
}

/* Markdown 样式 */
.message.assistant .text strong {
  font-weight: bold;
  color: #1a3a6e;
}

.message.assistant .text em {
  font-style: italic;
}

.message.assistant .text code {
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
  color: #e74c3c;
}

.message.assistant .text .code-block {
  background: #f8f9fa;
  border-left: 3px solid #4e73df;
  padding: 10px;
  margin: 10px 0;
  font-family: monospace;
  white-space: pre-wrap;
  border-radius: 4px;
  font-size: 14px;
  position: relative;
  overflow-x: auto;
}

.message.assistant .text .code-block .code-lang {
  position: absolute;
  top: 5px;
  right: 10px;
  font-size: 12px;
  color: #6c757d;
  font-family: sans-serif;
}

.message.assistant .text pre {
  margin: 0;
  padding: 0;
  background: transparent;
}

.message.assistant .text ul,
.message.assistant .text ol {
  padding-left: 20px;
  margin: 10px 0;
}

.message.assistant .text li {
  margin-bottom: 5px;
}

.message.assistant .text blockquote {
  border-left: 3px solid #4e73df;
  padding-left: 10px;
  margin: 10px 0;
  color: #555;
}

.chat-input {
  display: flex;
  padding: 15px;
  border-top: 1px solid #eaeaea;
  background: white;
}

.chat-input textarea {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  padding: 12px 20px;
  resize: none;
  height: 50px;
  font-size: 15px;
  transition: border-color 0.3s;
}

.chat-input textarea:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}

.send-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #1a73e8;
  color: white;
  border: none;
  margin-left: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.send-btn:hover {
  background: #1669d6;
}

.send-btn:disabled {
  background: #a0c3ff;
  cursor: not-allowed;
}

.chat-tips {
  padding: 10px 20px;
  background: #f8f9fa;
  border-top: 1px solid #eaeaea;
  text-align: center;
  font-size: 13px;
  color: #70757a;
}

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

/* 响应式调整 */
@media (max-width: 768px) {
  .chat-messages {
    padding: 10px;
  }

  .message .content {
    max-width: 75%;
  }

  .chat-input {
    padding: 10px;
  }

  .chat-input textarea {
    height: 40px;
    padding: 8px 15px;
  }

  .send-btn {
    width: 40px;
    height: 40px;
  }

  .avatar .avatar-placeholder {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #409eff, #367bd6);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
    font-weight: bold;
  }

}
</style>
