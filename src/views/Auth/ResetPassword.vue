<template>
  <div class="auth-container">
    <h2>忘记密码</h2>
    <form @submit.prevent="handleResetPassword">
      <div class="form-group">
        <label for="reset-email">邮箱</label>
        <input
            type="email"
            id="reset-email"
            v-model="form.email"
            required
            placeholder="请输入注册邮箱"
        />
      </div>

      <div class="form-group">
        <label for="new-password">新密码</label>
        <input
            type="password"
            id="new-password"
            v-model="form.newPassword"
            required
            placeholder="请输入新密码"
        />
      </div>

      <div class="form-group verification-code">
        <label for="reset-code">验证码</label>
        <input
            type="text"
            id="reset-code"
            v-model="form.code"
            required
            placeholder="请输入验证码"
        />
        <button
            type="button"
            @click="sendResetCode"
            :disabled="codeButtonDisabled"
        >
          {{ codeButtonText }}
        </button>
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? '处理中...' : '重置密码' }}
      </button>
    </form>

    <div class="auth-footer">
      <router-link to="/login">返回登录</router-link>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">{{ success }}</p>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api/auth.js';

export default {
  setup() {
    const router = useRouter();
    const form = ref({
      email: '',
      newPassword: '',
      code: ''
    });

    const loading = ref(false);
    const error = ref('');
    const success = ref('');

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

    const sendResetCode = async () => {
      try {
        if (!form.value.email) {
          error.value = '请先输入邮箱';
          return;
        }

        const response = await api.sendResetPasswordCode(form.value.email);
        if (response.code === 'success') {
          startCountdown();
          success.value = '验证码已发送，请查收邮箱';
        } else {
          error.value = response.msg || '发送验证码失败';
        }
      } catch (err) {
        error.value = err.response?.data?.msg || '发送验证码失败';
      }
    };

    const handleResetPassword = async () => {
      try {
        loading.value = true;
        error.value = '';
        success.value = '';

        const response = await api.resetPassword(
            form.value.email,
            form.value.newPassword,
            form.value.code
        );

        if (response.code === 'success') {
          success.value = '密码重置成功，请使用新密码登录';
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          error.value = response.msg || '重置密码失败';
        }
      } catch (err) {
        error.value = err.response?.data?.msg || '重置密码失败';
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      loading,
      error,
      success,
      codeButtonDisabled,
      codeButtonText,
      sendResetCode,
      handleResetPassword
    };
  }
};
</script>

<style scoped>
/* 样式与前面组件类似 */
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

.auth-footer {
  margin-top: 1rem;
  text-align: center;
}

.error {
  color: red;
  margin-top: 1rem;
  text-align: center;
}

.success {
  color: green;
  margin-top: 1rem;
  text-align: center;
}
</style>
