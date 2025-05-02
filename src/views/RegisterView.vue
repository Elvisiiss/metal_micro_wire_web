<template>
  <div class="auth-container">
    <h2>注册</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="username">用户名</label>
        <input
            type="text"
            id="username"
            v-model="form.username"
            required
            placeholder="请输入用户名"
        />
      </div>
      <div class="form-group">
        <label for="email">邮箱</label>
        <input
            type="email"
            id="email"
            v-model="form.email"
            required
            placeholder="请输入邮箱"
        />
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input
            type="password"
            id="password"
            v-model="form.password"
            required
            placeholder="请输入密码"
        />
      </div>
      <div class="form-group verification-code">
        <label for="code">验证码</label>
        <input
            type="text"
            id="code"
            v-model="form.verificationCode"
            placeholder="请输入验证码"
        />
        <button
            type="button"
            @click="sendVerificationCode"
            :disabled="codeButtonDisabled"
        >
          {{ codeButtonText }}
        </button>
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '注册中...' : '注册' }}
      </button>
      <p class="toggle-auth">
        已有账号？<router-link to="/login">立即登录</router-link>
      </p>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

export default {
  setup() {
    const router = useRouter();
    const form = ref({
      username: '',
      email: '',
      password: '',
      verificationCode: ''
    });
    const loading = ref(false);
    const error = ref('');
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

    const sendVerificationCode = async () => {
      try {
        if (!form.value.email) {
          error.value = '请先输入邮箱';
          return;
        }
        await api.sendVerificationCode(form.value.email, 'register');
        startCountdown();
      } catch (err) {
        error.value = err.response?.data?.message || '发送验证码失败';
      }
    };

    const handleRegister = async () => {
      try {
        loading.value = true;
        error.value = '';
        await api.register(form.value);
        router.push('/'); // 注册成功后跳转到首页
      } catch (err) {
        error.value = err.response?.data?.message || '注册失败，请检查输入信息';
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      loading,
      error,
      codeButtonDisabled,
      codeButtonText,
      sendVerificationCode,
      handleRegister
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

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
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

.toggle-auth {
  text-align: center;
  margin-top: 1rem;
}

.error {
  color: red;
  margin-top: 1rem;
  text-align: center;
}
</style>