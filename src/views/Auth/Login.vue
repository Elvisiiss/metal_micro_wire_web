<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>欢迎登录</h1>
        <p>请输入您的账号信息</p>
      </div>

      <div class="login-tabs">
        <button
            @click="activeTab = 'account'"
            :class="{ active: activeTab === 'account' }"
        >
          <i class="icon-user"></i>
          账号密码登录
        </button>
        <button
            @click="activeTab = 'code'"
            :class="{ active: activeTab === 'code' }"
        >
          <i class="icon-email"></i>
          验证码登录
        </button>
      </div>

      <!-- 账号密码登录表单 -->
      <form v-if="activeTab === 'account'" @submit.prevent="handleAccountLogin" class="login-form">
        <div class="form-group">
          <label>登录方式</label>
          <div class="select-wrapper">
            <select v-model="accountLoginType">
              <option value="username">用户名登录</option>
              <option value="email">邮箱登录</option>
            </select>
            <i class="icon-arrow"></i>
          </div>
        </div>

        <div class="form-group" v-if="accountLoginType === 'username'">
          <label for="username">用户名</label>
          <div class="input-wrapper">
            <i class="icon-user"></i>
            <input
                type="text"
                id="username"
                v-model="accountForm.username"
                required
                placeholder="请输入用户名"
            />
          </div>
        </div>

        <div class="form-group" v-else>
          <label for="email">邮箱</label>
          <div class="input-wrapper">
            <i class="icon-email"></i>
            <input
                type="email"
                id="email"
                v-model="accountForm.email"
                required
                placeholder="请输入邮箱"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <div class="input-wrapper">
            <i class="icon-lock"></i>
            <input
                type="password"
                id="password"
                v-model="accountForm.password"
                required
                placeholder="请输入密码"
            />
            <i class="icon-eye" @click="togglePasswordVisibility"></i>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading">
            <i class="icon-spinner"></i> 登录中...
          </span>
          <span v-else>登录</span>
        </button>
      </form>

      <!-- 验证码登录表单 -->
      <form v-else @submit.prevent="handleCodeLogin" class="login-form">
        <div class="form-group">
          <label for="login-email">邮箱</label>
          <div class="input-wrapper">
            <i class="icon-email"></i>
            <input
                type="email"
                id="login-email"
                v-model="codeForm.email"
                required
                placeholder="请输入邮箱"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="login-code">验证码</label>
          <div class="input-wrapper verification-code">
            <i class="icon-code"></i>
            <input
                type="text"
                id="login-code"
                v-model="codeForm.code"
                required
                placeholder="请输入验证码"
            />
            <button
                type="button"
                class="code-btn"
                @click="sendLoginCode"
                :disabled="codeButtonDisabled"
            >
              {{ codeButtonText }}
            </button>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading">
            <i class="icon-spinner"></i> 登录中...
          </span>
          <span v-else>登录</span>
        </button>
      </form>

      <div class="auth-footer">
        <router-link to="/register">注册账号</router-link>
        <router-link to="/forgot-password">忘记密码</router-link>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api/auth.js';
// import {useAuthStore} from "@/stores/auth.js";


const router = useRouter();
const activeTab = ref('account');
const accountLoginType = ref('username');
// const authStore = useAuthStore()

const accountForm = ref({
  username: '',
  email: '',
  password: ''
});

const codeForm = ref({
  email: '',
  code: ''
});

const loading = ref(false);
const error = ref('');
const showPassword = ref(false);

// 验证码相关状态
const codeButtonDisabled = ref(false);
const codeButtonText = ref('获取验证码');
let countdown = 60;

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.type = showPassword.value ? 'text' : 'password';
  }
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
    if (accountLoginType.value === 'username') {
      response = await api.loginWithUsername(
          accountForm.value.username,
          accountForm.value.password
      );
    } else {
      response = await api.loginWithEmail(
          accountForm.value.email,
          accountForm.value.password
      );
    }

    if (response.code === 'success') {
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
      authStore.setUser(response.data)
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
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --primary: #4f46e5;
  --primary-light: #6366f1;
  --primary-dark: #4338ca;
  --text: #1f2937;
  --text-light: #6b7280;
  --border: #e5e7eb;
  --bg: #f9fafb;
  --card-bg: #ffffff;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --error-bg: #fee2e2;
  --error-text: #dc2626;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: var(--bg);
  background-image:
      radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 0.1) 0px, transparent 50%),
      radial-gradient(at 0% 50%, hsla(355, 100%, 93%, 0.1) 0px, transparent 50%);
}

.auth-card {
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: var(--shadow);
  padding: 40px;
  width: 100%;
  max-width: 440px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.auth-card:hover {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
  background: linear-gradient(90deg, var(--primary), var(--primary-dark));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.auth-header p {
  color: var(--text-light);
  font-size: 16px;
}

.login-tabs {
  display: flex;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 6px;
  margin-bottom: 24px;
}

.login-tabs button {
  flex: 1;
  padding: 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-light);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.login-tabs button:hover {
  background: rgba(255, 255, 255, 0.7);
}

.login-tabs button.active {
  background: white;
  color: var(--primary);
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.1);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.select-wrapper {
  position: relative;
}

select {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 15px;
  background: white;
  appearance: none;
  outline: none;
  transition: border-color 0.3s;
  cursor: pointer;
  color: var(--text);
}

select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.icon-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  pointer-events: none;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper i {
  position: absolute;
  left: 16px;
  color: #9ca3af;
  font-size: 18px;
}

input {
  width: 100%;
  padding: 14px 16px 14px 46px;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 15px;
  outline: none;
  transition: all 0.3s;
  color: var(--text);
}

input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.input-wrapper .icon-eye {
  position: absolute;
  right: 16px;
  cursor: pointer;
  color: #9ca3af;
  font-size: 18px;
  transition: color 0.2s;
}

.input-wrapper .icon-eye:hover {
  color: var(--primary);
}

.verification-code input {
  padding-right: 120px;
}

.code-btn {
  position: absolute;
  right: 6px;
  padding: 8px 14px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.code-btn:hover {
  background: var(--primary-dark);
}

.code-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(90deg, var(--primary), var(--primary-dark));
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
}

.submit-btn:disabled {
  background: #d1d5db;
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
}

.icon-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.auth-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  font-size: 14px;
}

.auth-footer a {
  color: var(--primary);
  text-decoration: none;
  transition: color 0.3s;
  font-weight: 500;
  position: relative;
}

.auth-footer a:hover {
  color: var(--primary-dark);
}

.auth-footer a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--primary);
  transition: width 0.3s;
}

.auth-footer a:hover::after {
  width: 100%;
}

.error {
  background: var(--error-bg);
  color: var(--error-text);
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 20px;
  font-size: 14px;
  text-align: center;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 图标字体样式 */
[class^="icon-"] {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.icon-user {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E");
}

.icon-email {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='4' width='20' height='16' rx='2'%3E%3C/rect%3E%3Cpath d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'%3E%3C/path%3E%3C/svg%3E");
}

.icon-lock {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='11' width='18' height='11' rx='2' ry='2'%3E%3C/rect%3E%3Cpath d='M7 11V7a5 5 0 0 1 10 0v4'%3E%3C/path%3E%3C/svg%3E");
}

.icon-eye {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'%3E%3C/path%3E%3Ccircle cx='12' cy='12' r='3'%3E%3C/circle%3E%3C/svg%3E");
}

.icon-code {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='16 18 22 12 16 6'%3E%3C/polyline%3E%3Cpolyline points='8 6 2 12 8 18'%3E%3C/polyline%3E%3C/svg%3E");
}

.icon-spinner {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 12a9 9 0 1 1-6.219-8.56'%3E%3C/path%3E%3C/svg%3E");
}

/* 响应式调整 */
@media (max-width: 576px) {
  .auth-card {
    padding: 30px 20px;
    border-radius: 12px;
  }

  .login-tabs button {
    font-size: 14px;
    padding: 12px;
  }
}
</style>
