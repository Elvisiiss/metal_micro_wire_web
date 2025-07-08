<template>
  <div class="register-container">
    <!-- 左侧装饰区域 -->
    <div class="decoration-panel">
      <div class="decoration-content">
        <div class="floating-shapes">
          <div class="shape-1"></div>
          <div class="shape-2"></div>
          <div class="shape-3"></div>
          <div class="shape-4"></div>
        </div>
        <div class="brand-section">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <h1 class="brand-title">加入我们</h1>
          <p class="brand-subtitle">开启您的数字化之旅</p>
        </div>
        <div class="feature-points">
          <div class="feature-item" v-for="(feature, index) in features" :key="index">
            <div class="feature-icon">
              <component :is="feature.icon"></component>
            </div>
            <span>{{ feature.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧注册表单 -->
    <div class="form-panel">
      <div class="form-container">
        <div class="form-header">
          <h2>创建账户</h2>
          <p>几分钟内完成注册，享受全部功能</p>
        </div>

        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-field">
            <label class="field-label">用户名</label>
            <div class="input-group">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                v-model="form.username"
                type="text"
                class="form-input"
                placeholder="请输入用户名"
                required
              >
            </div>
          </div>

          <div class="form-field">
            <label class="field-label">邮箱地址</label>
            <div class="input-group">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <input
                v-model="form.email"
                type="email"
                class="form-input"
                placeholder="请输入邮箱地址"
                required
              >
            </div>
          </div>

          <div class="form-field">
            <label class="field-label">密码</label>
            <div class="input-group">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="请输入密码"
                required
              >
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="password-toggle"
              >
                <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="form-field">
            <label class="field-label">验证码</label>
            <div class="input-group verification-group">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
              <input
                v-model="form.code"
                type="text"
                class="form-input"
                placeholder="请输入验证码"
                required
              >
              <button
                type="button"
                @click="sendRegisterCode"
                :disabled="codeButtonDisabled"
                class="code-button"
              >
                {{ codeButtonText }}
              </button>
            </div>
          </div>

          <button type="submit" class="submit-button" :disabled="loading">
            <svg v-if="loading" class="loading-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <span>{{ loading ? '注册中...' : '立即注册' }}</span>
          </button>
        </form>

        <!-- 底部链接 -->
        <div class="form-footer">
          <router-link to="/login" class="footer-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            已有账户？立即登录
          </router-link>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="error-alert">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <span>{{ error }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api/auth.js';

const router = useRouter();
const form = ref({
  username: '',
  email: '',
  password: '',
  code: ''
});

const loading = ref(false);
const error = ref('');
const showPassword = ref(false);

// 验证码相关状态
const codeButtonDisabled = ref(false);
const codeButtonText = ref('获取验证码');
let countdown = 60;

// 特性列表
const features = computed(() => [
  {
    icon: 'GiftIcon',
    text: '免费注册永久使用'
  },
  {
    icon: 'ShieldIcon',
    text: '数据安全保护'
  },
  {
    icon: 'RocketIcon',
    text: '快速开始体验'
  }
]);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const startCountdown = () => {
  codeButtonDisabled.value = true;
  const timer = setInterval(() => {
    countdown--;
    codeButtonText.value = `${countdown}秒后重试`;
    if (countdown <= 0) {
      clearInterval(timer);
      codeButtonText.value = '获取验证码';
      codeButtonDisabled.value = false;
      countdown = 60;
    }
  }, 1000);
};

const sendRegisterCode = async () => {
  try {
    if (!form.value.email) {
      error.value = '请先输入邮箱';
      return;
    }

    const response = await api.sendRegisterCode(form.value.email);

    // 处理成功响应
    if (response.code === 'success') {
      startCountdown();
    }
    // 处理邮箱已存在的情况
    else if (response.msg === "邮箱已存在") {
      error.value = "该邮箱已被注册，请直接登录或使用其他邮箱";
    }
    // 处理参数验证失败
    else if (response.msg === "请求参数验证失败" && response.data) {
      // 提取具体的错误字段信息
      const errorField = Object.keys(response.data)[0];
      error.value = response.data[errorField];
    }
    // 其他错误
    else {
      error.value = response.msg || '发送验证码失败';
    }
  } catch (err) {
    if (error.value.includes("邮箱格式")) {
      codeButtonDisabled.value = false;
      codeButtonText.value = '获取验证码';
      countdown = 60;
    }
    error.value = err.response?.data?.msg || '发送验证码失败';
  }
};

const handleRegister = async () => {
  try {
    loading.value = true;
    error.value = '';

    const response = await api.registerUser(
        form.value.email,
        form.value.username,
        form.value.password,
        form.value.code
    );

    // 成功处理
    if (response.code === 'success') {
      router.push('/login');
    }
    // 处理用户名已存在
    else if (response.msg === "用户名已存在") {
      error.value = "该用户名已被使用，请更换其他用户名";
    }
    // 处理邮箱已存在
    else if (response.msg === "邮箱已存在") {
      error.value = "该邮箱已被注册，请直接登录或使用其他邮箱";
    }
    // 处理参数验证失败
    else if (response.msg === "请求参数验证失败" && response.data) {
      // 提取具体的错误字段信息
      const errorField = Object.keys(response.data)[0];
      error.value = response.data[errorField];
    }
    // 其他错误
    else {
      error.value = response.msg || '注册失败';
    }
  } catch (err) {
    // 捕获HTTP错误（如400等）
    const errData = err.response?.data || {};

    if (errData.msg === "请求参数验证失败" && errData.data) {
      const errorField = Object.keys(errData.data)[0];
      error.value = errData.data[errorField];
    } else {
      error.value = errData.msg || '注册失败';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* 隐藏浏览器自带的密码可见性按钮 */
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
  display: none;
}

input[type="password"]::-webkit-credentials-auto-fill-button {
  display: none !important;
}

input[type="password"]::-webkit-input-decoration-container {
  display: none !important;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.register-container {
  min-height: 100vh;
  display: flex;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 左侧装饰面板 */
.decoration-panel {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.decoration-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  max-width: 400px;
  padding: 40px;
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-shapes > div {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 8s infinite ease-in-out;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 20%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 60%;
  animation-delay: 4s;
}

.shape-4 {
  width: 80px;
  height: 80px;
  top: 30%;
  right: 10%;
  animation-delay: 6s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
    opacity: 0.8;
  }
}

.brand-section {
  margin-bottom: 60px;
}

.brand-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.brand-icon svg {
  width: 40px;
  height: 40px;
  color: white;
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.brand-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  font-weight: 400;
}

.feature-points {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.feature-icon {
  width: 24px;
  height: 24px;
  color: white;
  opacity: 0.9;
}

/* 右侧表单面板 */
.form-panel {
  flex: 1;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
}

.form-container {
  width: 100%;
  max-width: 420px;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.form-header p {
  color: #718096;
  font-size: 1rem;
  font-weight: 400;
}

/* 表单样式 */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  width: 20px;
  height: 20px;
  color: #a0aec0;
  z-index: 1;
}

.form-input {
  width: 100%;
  padding: 16px 48px 16px 48px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  color: #2d3748;
  background: white;
  transition: all 0.3s ease;
}

/* 密码输入框特殊样式 */
.form-input[type="password"],
.form-input.password-input {
  padding-right: 48px;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: #a0aec0;
  font-weight: 400;
}

.password-toggle {
  position: absolute;
  right: 16px;
  width: 20px;
  height: 20px;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #667eea;
}

.password-toggle svg {
  width: 100%;
  height: 100%;
}

.verification-group .form-input {
  padding-right: 120px;
}

.code-button {
  position: absolute;
  right: 8px;
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.code-button:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
}

.code-button:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
}

.submit-button {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 底部链接 */
.form-footer {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718096;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.footer-link:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.footer-link svg {
  width: 16px;
  height: 16px;
}

/* 错误提示 */
.error-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #fed7d7;
  border: 1px solid #feb2b2;
  border-radius: 12px;
  color: #c53030;
  font-size: 0.9rem;
  font-weight: 500;
  animation: slideIn 0.3s ease-out;
}

.error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .decoration-panel {
    display: none;
  }

  .form-panel {
    flex: 1;
  }
}

@media (max-width: 640px) {
  .form-panel {
    padding: 20px;
  }

  .form-header h2 {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .form-container {
    max-width: 100%;
  }

  .verification-group .form-input {
    padding-right: 100px;
  }

  .code-button {
    font-size: 0.8rem;
    padding: 6px 12px;
  }
}
</style>
