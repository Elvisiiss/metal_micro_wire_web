<template>
  <div class="auth-container">
    <h2>登录</h2>
    <form @submit.prevent="handleLogin">
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
      <button type="submit" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
      <p class="toggle-auth">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </p>
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
      email: '',
      password: ''
    });
    const loading = ref(false);
    const error = ref('');

    const handleLogin = async () => {
      try {
        loading.value = true;
        error.value = '';
        await api.login(form.value);
        router.push('/'); // 登录成功后跳转到首页
      } catch (err) {
        error.value = err.response?.data?.message || '登录失败，请检查邮箱和密码';
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      loading,
      error,
      handleLogin
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

button {
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

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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