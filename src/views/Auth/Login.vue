<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>欢迎回来</h1>
        <p>请登录您的账户</p>
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

      <div class="divider">
        <span>或</span>
      </div>

      <div class="social-login">
        <button class="social-btn google">
          <i class="icon-google"></i>
        </button>
        <button class="social-btn wechat">
          <i class="icon-wechat"></i>
        </button>
        <button class="social-btn github">
          <i class="icon-github"></i>
        </button>
      </div>

      <div class="auth-footer">
        <router-link to="/register">注册账号</router-link>
        <router-link to="/forgot-password">忘记密码</router-link>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api/auth.js';

export default {
  setup() {
    const router = useRouter();
    const activeTab = ref('account');
    const accountLoginType = ref('username');

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

    return {
      activeTab,
      accountLoginType,
      accountForm,
      codeForm,
      loading,
      error,
      codeButtonDisabled,
      codeButtonText,
      togglePasswordVisibility,
      sendLoginCode,
      handleAccountLogin,
      handleCodeLogin
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --primary: #6366f1;
  --primary-light: #818cf8;
  --secondary: #8b5cf6;
  --success: #10b981;
  --error: #ef4444;
  --text: #334155;
  --text-light: #64748b;
  --border: #e2e8f0;
  --bg: #f8fafc;
  --card-bg: #ffffff;
  --shadow: rgba(99, 102, 241, 0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--bg);
  font-family: 'Inter', sans-serif;
}

.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.auth-card {
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.15);
  padding: 40px;
  width: 100%;
  max-width: 480px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
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
}

.auth-header p {
  color: var(--text-light);
  font-size: 16px;
}

.login-tabs {
  display: flex;
  background: #f1f5f9;
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
  background: rgba(255, 255, 255, 0.5);
}

.login-tabs button.active {
  background: white;
  color: var(--primary);
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.1);
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
}

select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.icon-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23646c7a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
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
  color: #94a3b8;
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
}

input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.input-wrapper .icon-eye {
  position: absolute;
  right: 16px;
  cursor: pointer;
  color: #94a3b8;
  font-size: 18px;
}

.verification-code input {
  padding-right: 120px;
}

.code-btn {
  position: absolute;
  right: 6px;
  padding: 8px 14px;
  background: var(--primary-light);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.code-btn:hover {
  background: var(--primary);
}

.code-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.submit-btn:disabled {
  background: #cbd5e1;
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

.divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
  color: var(--text-light);
  font-size: 14px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.divider span {
  padding: 0 16px;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.social-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 20px;
}

.social-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.social-btn.google {
  color: #DB4437;
}

.social-btn.wechat {
  color: #07C160;
}

.social-btn.github {
  color: #181717;
}

.auth-footer {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.auth-footer a {
  color: var(--primary);
  text-decoration: none;
  transition: color 0.3s;
  font-weight: 500;
}

.auth-footer a:hover {
  color: var(--secondary);
  text-decoration: underline;
}

.error {
  background: #fee2e2;
  color: var(--error);
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 20px;
  font-size: 14px;
  text-align: center;
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
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
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E");
}

.icon-email {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='4' width='20' height='16' rx='2'%3E%3C/rect%3E%3Cpath d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'%3E%3C/path%3E%3C/svg%3E");
}

.icon-lock {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='11' width='18' height='11' rx='2' ry='2'%3E%3C/rect%3E%3Cpath d='M7 11V7a5 5 0 0 1 10 0v4'%3E%3C/path%3E%3C/svg%3E");
}

.icon-eye {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'%3E%3C/path%3E%3Ccircle cx='12' cy='12' r='3'%3E%3C/circle%3E%3C/svg%3E");
}

.icon-code {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='16 18 22 12 16 6'%3E%3C/polyline%3E%3Cpolyline points='8 6 2 12 8 18'%3E%3C/polyline%3E%3C/svg%3E");
}

.icon-spinner {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 12a9 9 0 1 1-6.219-8.56'%3E%3C/path%3E%3C/svg%3E");
}

.icon-google {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23DB4437' d='M12 5c1.617 0 3.101.554 4.286 1.474l3.637-3.47A11.95 11.95 0 0 0 12 0C7.392 0 3.396 2.6 1.386 6.41L5.43 9.602A7.069 7.069 0 0 1 12 5z'/%3E%3Cpath fill='%234285F4' d='M23.896 13.502C23.96 13.01 24 12.509 24 12c0-.858-.094-1.693-.265-2.5H12v5h6.486a5.997 5.997 0 0 1-2.032 2.945l3.27 2.58c1.873-1.806 2.968-4.363 3.172-7.523z'/%3E%3Cpath fill='%23F4B400' d='M5.43 9.602l-4.044-3.192A11.979 11.979 0 0 0 0 12c0 2.172.567 4.203 1.558 5.958l4.05-3.197A7.047 7.047 0 0 1 5 12c0-.82.151-1.608.43-2.398z'/%3E%3Cpath fill='%230F9D58' d='M12 19c-1.617 0-3.101-.554-4.286-1.474l-3.637 3.47A11.95 11.95 0 0 0 12 24c4.608 0 8.604-2.6 10.614-6.41l-4.044-3.192A7.07 7.07 0 0 1 12 19z'/%3E%3C/svg%3E");
}

.icon-wechat {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2307C160' d='M8.2 13.6c-.3 0-.5-.2-.5-.5s.2-.5.5-.5.5.2.5.5-.2.5-.5.5zm4.5 0c-.3 0-.5-.2-.5-.5s.2-.5.5-.5.5.2.5.5-.2.5-.5.5z'/%3E%3Cpath fill='%2307C160' d='M18.9 14.8c.4-.3.6-.7.6-1.2 0-1-1-1.7-2.2-1.7s-2.2.8-2.2 1.7 1 1.7 2.2 1.7c.4 0 .8-.1 1.1-.2l.5.3-.4-.5zm-6.5-2.9c-1.2 0-2.2.8-2.2 1.7s1 1.7 2.2 1.7c.4 0 .8-.1 1.1-.2l.5.3-.4-.5c.4-.3.6-.7.6-1.2.1-1-1-1.8-2.2-1.8z'/%3E%3Cpath fill='%2307C160' d='M19.8 8.1C18.7 4.8 15.3 2.5 11.4 2.5 6.5 2.5 2.5 6.1 2.5 10.6c0 1.8.7 3.5 1.9 4.9l-1 3.1 3.4-1.4c1.2.7 2.6 1.1 4.1 1.1.1 0 .2 0 .3-.1.3-.5.7-1.1 1.1-1.6-.6-.2-1.1-.5-1.6-.9-.1-.1-.2-.1-.3-.1-.1 0-.2 0-.3.1-.4.2-.8.4-1.2.5-1.1.3-2.2.1-3.2-.3l.4-.2c.2-.1.4-.3.6-.5.1-.1.1-.2.2-.3l.3-.4c.1-.1.1-.2.1-.3 0-.1 0-.2-.1-.3-1.2-1.3-1.8-2.9-1.8-4.6 0-3.7 3.4-6.7 7.6-6.7 3.3 0 6.1 2 7.1 4.8.1.3.2.6.3.9 0 .1 0 .3-.1.4-.1.1-.2.2-.4.2z'/%3E%3Cpath fill='%2307C160' d='M21.5 14.6c0 1.3-.5 2.5-1.4 3.4 0 0-.1.1-.1.1l.3 1-1.1-.3c-.2.1-.4.1-.6.2-.7.2-1.5.3-2.2.2-2.8-.3-5.1-2.2-5.6-4.8 0-.1 0-.2.1-.3.1-.1.2-.1.3-.1h.1c.7.1 1.4.1 2.1 0 .1 0 .3-.1.4-.2.1-.1.2-.2.2-.3 0-.1 0-.3-.1-.4-.4-.4-.8-.8-1.1-1.3-.1-.1-.1-.2-.1-.3s0-.2.1-.3c.1-.1.2-.2.3-.2.1 0 .2 0 .3.1.6.5 1.3.8 2 .9.2.1.4.1.6.1.5 0 1-.1 1.4-.2.1 0 .3-.1.4-.2.1-.1.2-.2.2-.3 0-.1 0-.3-.1-.4-.2-.3-.5-.7-.8-1-.3-.3-.6-.6-1-.9-.1-.1-.1-.2-.1-.3s0-.2.1-.3c.1-.1.2-.2.3-.2.1 0 .2 0 .3.1.6.5 1.1 1 1.5 1.6.5.6.8 1.3 1 2 .2.6.2 1.2.2 1.8z'/%3E%3C/svg%3E");
}

.icon-github {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23181717' d='M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.2 1 .1-.8.4-1.2.7-1.5-2.5-.3-5.1-1.2-5.1-5.4 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.6.1-3.3 0 0 .9-.3 3 1.1a10.5 10.5 0 0 1 5.5 0c2.1-1.4 3-1.1 3-1.1.6 1.7.2 3 .1 3.3.7.8 1.1 1.8 1.1 3 0 4.2-2.6 5.1-5.1 5.4.4.3.8 1 .8 2v3c0 .3.1.7.8.6A12 12 0 0 0 12 .3'/%3E%3C/svg%3E");
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

  .auth-footer {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
}
</style>
