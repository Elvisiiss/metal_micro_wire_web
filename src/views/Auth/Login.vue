<template>
  <div class="login-container">
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
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
              <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
              <path d="M12 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3"/>
            </svg>
          </div>
          <h1 class="brand-title">Metal Wire</h1>
          <p class="brand-subtitle">安全 · 高效 · 可靠</p>
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

    <!-- 右侧登录表单 -->
    <div class="form-panel">
      <div class="form-container">
        <div class="form-header">
          <h2>{{ isRootLogin ? 'ROOT用户登录' : '登录账户' }}</h2>
          <p>{{ isRootLogin ? '请输入ROOT用户凭据' : '欢迎回来，请输入您的凭据' }}</p>
        </div>

        <!-- 登录方式切换 -->
        <div class="auth-tabs" v-if="!isRootLogin">
          <div class="tab-slider" :style="{ transform: `translateX(${activeTab === 'account' ? '0%' : '100%'})` }"></div>
          <button
              type="button"
              @click="activeTab = 'account'"
              :class="['tab-button', { active: activeTab === 'account' }]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            密码登录
          </button>
          <button
              type="button"
              @click="activeTab = 'code'"
              :class="['tab-button', { active: activeTab === 'code' }]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            验证码登录
          </button>
        </div>
        <div v-else class="auth-tabs">
          <div class="tab-slider" style="display: none;"></div>
          <button type="button" class="tab-button active">
            ROOT用户登录
          </button>
        </div>

        <!-- 账号密码登录 -->
        <form v-if="!isRootLogin && activeTab === 'account'" @submit.prevent="handleAccountLogin" class="login-form">
          <div class="form-field">
            <label class="field-label">
              用户名/邮箱
            </label>
            <div class="input-group">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                  v-model="accountForm.account"
                  :type="'text'"
                  class="form-input"
                  :placeholder="'请输入用户名/邮箱'"
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
                  v-model="accountForm.password"
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

          <button type="submit" class="submit-button" :disabled="loading">
            <svg v-if="loading" class="loading-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <span>{{ loading ? '登录中...' : '立即登录' }}</span>
          </button>
        </form>

        <!-- 验证码登录 -->
        <form v-else-if="!isRootLogin && activeTab === 'code'" @submit.prevent="handleCodeLogin" class="login-form">
          <div class="form-field">
            <label class="field-label">邮箱地址</label>
            <div class="input-group">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <input
                  v-model="codeForm.email"
                  type="email"
                  class="form-input"
                  placeholder="请输入邮箱地址"
                  required
              >
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
                  v-model="codeForm.code"
                  type="text"
                  class="form-input"
                  placeholder="请输入验证码"
                  required
              >
              <button
                  type="button"
                  @click="sendLoginCode"
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
            <span>{{ loading ? '登录中...' : '立即登录' }}</span>
          </button>
        </form>

        <!-- ROOT用户登录表单 -->
        <form v-if="isRootLogin" @submit.prevent="handleRootLogin" class="login-form">
          <div class="form-field">
            <label class="field-label">
              用户名
            </label>
            <div class="input-group">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                  v-model="rootForm.username"
                  type="text"
                  class="form-input"
                  placeholder="请输入ROOT用户名"
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
                  v-model="rootForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="请输入ROOT密码"
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

          <button type="submit" class="submit-button" :disabled="loading">
            <svg v-if="loading" class="loading-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <span>{{ loading ? '登录中...' : '立即登录' }}</span>
          </button>
        </form>

        <!-- 底部链接 -->
        <div class="form-footer" v-if="!isRootLogin">
          <router-link to="/register" class="footer-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            注册新账户
          </router-link>
          <router-link to="/forgot-password" class="footer-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            找回密码
          </router-link>
        </div>

        <!-- 底部链接 -->
        <div class="form-footer" v-if="isRootLogin && !error">
          <el-text class="footer-link">
            ㅤ
          </el-text>
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

      <!-- ROOT用户切换按钮 -->
      <button @click="toggleRootLogin" class="root-toggle-button">
        {{ isRootLogin ? '返回标准登录' : 'ROOT用户登录' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api/auth.js';
import { useAuthStore } from '@/stores/auth'

const router = useRouter();
const activeTab = ref('account');
const authStore = useAuthStore()
const isRootLogin = ref(false);

const accountForm = ref({
  account: '',
  password: ''
});

const codeForm = ref({
  email: '',
  code: ''
});

const rootForm = ref({
  username: '',
  password: ''
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
    icon: 'SecurityIcon',
    text: '企业级安全保障'
  },
  {
    icon: 'SpeedIcon',
    text: '毫秒级响应速度'
  },
  {
    icon: 'CloudIcon',
    text: '7x24小时服务'
  }
]);

const toggleRootLogin = () => {
  isRootLogin.value = !isRootLogin.value;
  error.value = '';
  if (!isRootLogin.value) {
    // 重置表单
    rootForm.value = {
      username: '',
      password: ''
    };
  }
};

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

const sendLoginCode = async () => {
  try {
    if (!codeForm.value.email) {
      error.value = '请先输入邮箱';
      return;
    }

    const response = await api.sendLoginCode(codeForm.value.email);
    if (response.code === 'success') {
      startCountdown();
    } else {
      error.value = response.msg || '发送验证码失败';
    }
  } catch (err) {
    error.value = err.response?.data?.msg || '发送验证码失败';
  }
};

const handleAccountLogin = async () => {
  try {
    loading.value = true;
    error.value = '';

    let response;
    response = await api.loginWithUsername(
        accountForm.value.account,
        accountForm.value.password
    )

    if (response.code === 'success') {
      authStore.setUser(response)
      router.push('/index');
    } else {
      error.value = response.msg || '登录失败';
    }
  } catch (err) {
    error.value = err.response?.data?.msg || '登录失败';
  } finally {
    loading.value = false;
  }
};

const handleCodeLogin = async () => {
  try {
    loading.value = true;
    error.value = '';

    const response = await api.loginWithCode(
        codeForm.value.email,
        codeForm.value.code
    );

    if (response.code === 'success') {
      authStore.setUser(response)
      alert(response)
      router.push('/index');
    } else {
      error.value = response.msg || '登录失败';
    }
  } catch (err) {
    error.value = err.response?.data?.msg || '登录失败';
  } finally {
    loading.value = false;
  }
};

const handleRootLogin = async () => {
  try {
    loading.value = true;
    error.value = '';

    const response = await api.loginWithRoot(
        rootForm.value.username,
        rootForm.value.password
    );

    if (response.code === 'success') {
      authStore.setUser(response)
      router.push('/root');
    } else {
      error.value = response.msg || 'ROOT登录失败';
    }
  } catch (err) {
    error.value = err.response?.data?.msg || 'ROOT登录失败';
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

input[type="password"] {
  -webkit-text-security: disc !important;
}

input[type="password"] {
  -webkit-text-security: disc !important;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
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

/* 选项卡切换 */
.auth-tabs {
  position: relative;
  display: flex;
  background: #f7fafc;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 32px;
}

.tab-slider {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #718096;
  cursor: pointer;
  transition: color 0.3s ease;
  position: relative;
  z-index: 1;
}

.tab-button svg {
  width: 16px;
  height: 16px;
}

.tab-button.active {
  color: #667eea;
}

/* 表单样式 */
.login-form {
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

.select-group {
  position: relative;
}

.form-select {
  width: 100%;
  padding: 16px 48px 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  color: #2d3748;
  background: white;
  cursor: pointer;
  appearance: none;
  transition: all 0.3s ease;
}

.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.select-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #a0aec0;
  pointer-events: none;
  transition: transform 0.3s ease;
}

.form-select:focus + .select-arrow {
  transform: translateY(-50%) rotate(180deg);
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
  justify-content: space-between;
  gap: 16px;
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

  .tab-button {
    font-size: 0.85rem;
    padding: 12px 16px;
  }

  .tab-button svg {
    width: 14px;
    height: 14px;
  }

  .form-footer {
    flex-direction: column;
    gap: 12px;
  }

  .footer-link {
    justify-content: center;
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


.root-toggle-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.root-toggle-button:hover {
  background: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

@media (max-width: 1024px) {
  .root-toggle-button {
    bottom: 15px;
    right: 15px;
  }
}

@media (max-width: 640px) {
  .root-toggle-button {
    padding: 8px 12px;
    font-size: 0.8rem;
  }
}
</style>
