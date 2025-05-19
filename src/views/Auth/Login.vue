<template>
  <div class="auth-container">
    <h2>登录</h2>
    <div class="login-tabs">
      <button
          @click="activeTab = 'account'"
          :class="{ active: activeTab === 'account' }"
      >
        账号密码登录
      </button>
      <button
          @click="activeTab = 'code'"
          :class="{ active: activeTab === 'code' }"
      >
        验证码登录
      </button>
    </div>

    <!-- 账号密码登录表单 -->
    <form v-if="activeTab === 'account'" @submit.prevent="handleAccountLogin">
      <div class="form-group">
        <label>登录方式</label>
        <select v-model="accountLoginType">
          <option value="username">用户名登录</option>
          <option value="email">邮箱登录</option>
        </select>
      </div>

      <div class="form-group" v-if="accountLoginType === 'username'">
        <label for="username">用户名</label>
        <input
            type="text"
            id="username"
            v-model="accountForm.username"
            required
            placeholder="请输入用户名"
        />
      </div>

      <div class="form-group" v-else>
        <label for="email">邮箱</label>
        <input
            type="email"
            id="email"
            v-model="accountForm.email"
            required
            placeholder="请输入邮箱"
        />
      </div>

      <div class="form-group">
        <label for="password">密码</label>
        <input
            type="password"
            id="password"
            v-model="accountForm.password"
            required
            placeholder="请输入密码"
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </form>

    <!-- 验证码登录表单 -->
    <form v-else @submit.prevent="handleCodeLogin">
      <div class="form-group">
        <label for="login-email">邮箱</label>
        <input
            type="email"
            id="login-email"
            v-model="codeForm.email"
            required
            placeholder="请输入邮箱"
        />
      </div>

      <div class="form-group verification-code">
        <label for="login-code">验证码</label>
        <input
            type="text"
            id="login-code"
            v-model="codeForm.code"
            required
            placeholder="请输入验证码"
        />
        <button
            type="button"
            @click="sendLoginCode"
            :disabled="codeButtonDisabled"
        >
          {{ codeButtonText }}
        </button>
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </form>

    <div class="auth-footer">
      <router-link to="/register">注册账号</router-link>
      <router-link to="/forgot-password">忘记密码</router-link>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
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

    // 验证码相关状态
    const codeButtonDisabled = ref(false);
    const codeButtonText = ref('获取验证码');
    let countdown = 60;

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
      sendLoginCode,
      handleAccountLogin,
      handleCodeLogin
    };
  }
};
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.login-tabs {
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.login-tabs button {
  flex: 1;
  padding: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  border-bottom: 2px solid transparent;
}

.login-tabs button.active {
  border-bottom-color: #42b983;
  font-weight: bold;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button[type="submit"] {
  width: 100%;
  padding: 0.75rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}

button[type="submit"]:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.verification-code {
  display: flex;
  align-items: center;
}

.verification-code input {
  flex: 1;
  margin-right: 0.5rem;
}

.verification-code button {
  width: auto;
  padding: 0.5rem;
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.verification-code button:disabled {
  background-color: #f0f0f0;
  color: #999;
}

.auth-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.error {
  color: red;
  margin-top: 1rem;
  text-align: center;
}
</style>
