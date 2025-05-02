<template>
  <RouterView />
</template>

<script>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();

    onMounted(() => {
      // 检查用户是否已登录
      const token = localStorage.getItem('token');
      if (!token && (router.currentRoute.value.path !== '/login' && router.currentRoute.value.path !== '/register')) {
        router.push('/login');
      }
    });
  }
};
</script>

<style>
/* 全局样式 */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>