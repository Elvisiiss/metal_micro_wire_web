<template>
  <div class="dashboard-container">
    <!-- 顶部导航栏 -->
    <header class="top-navbar">
      <div class="navbar-left">
        <div class="logo">
          <span class="logo-icon">⦿</span>
          <span class="logo-text">微细线材云智检平台 - ROOT界面</span>
        </div>
        <ul class="nav-menu">
          <li :class="{active: activeTab === 'RootIndexPage'}"><a @click="setActiveTab('RootIndexPage')">用户管理</a></li>
        </ul>
      </div>
      <div class="navbar-right">
        <div class="user-profile" @click="toggleDropdown">
          <div class="user-avatar">
            <img v-if="userAvatar" :src="userAvatar" alt="用户头像">
            <div v-else class="avatar-placeholder">{{ userNameInitial }}</div>
          </div>
          <div class="user-info">
            <span class="user-name">{{ user_name }}</span>
            <div class="user-status">
              <span class="status-dot"></span>
              <span class="status-text">在线</span>
            </div>
          </div>

          <!-- 下拉菜单 -->
          <div v-show="showDropdown" class="dropdown-menu">
            <div class="dropdown-item" @click="openUserSettings">
              <i class="icon-user"></i>
              <span>账号信息</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click="logout">
              <i class="icon-logout"></i>
              <span>退出登录</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="dashboard-content">
      <!-- RootIndexPage 页面 -->
      <RootIndexPage v-if="activeTab === 'RootIndexPage'"/>

    </main>
    <!-- 账号信息悬浮窗 -->
    <transition name="slide-fade">
      <div v-if="showUserSettings" class="user-settings-modal">
        <div class="modal-overlay" @click="closeUserSettings"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3>账号信息</h3>
            <button class="close-btn" @click="closeUserSettings">
              <i class="icon-close">×</i>
            </button>
          </div>
          <div class="modal-body">
            <UserSettings ref="userSettings" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue';
import RootIndexPage from '../Root/RootIndexPage.vue';
import UserSettings from '@/views/Public/UserSettings.vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AuthAPI from '@/api/auth.js'
import {ElMessage} from "element-plus";


const router = useRouter();
const authStore = useAuthStore();
const showDropdown = ref(false);
const showUserSettings = ref(false); // 控制悬浮窗显示
const user_name = authStore.user?.user_name || '用户';


// 生命周期钩子
onMounted(async () => {
  const r = ref()
  try{
    r.value = (await AuthAPI.DetermineToken(authStore.user?.token)).data
  }catch(error){}
  if (r.value !== 999) {
    if(r.value !== 0 || r.value !== 1){
      ElMessage.error("权限不足")
      await router.push('/index')
    }else{
      logout()
    }
  }
})


// 用户头像
const userAvatar = computed(() => authStore.user?.avatarUrl || '');

// 活动标签
const activeTab = ref('RootIndexPage');

// 设置活动标签
const setActiveTab = (tab) => {
  activeTab.value = tab;
};

// 切换下拉菜单显示状态
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

// 打开账号信息悬浮窗
const openUserSettings = () => {
  showDropdown.value = false;
  showUserSettings.value = true;
};

const userNameInitial = computed(() => {
  return authStore.user?.user_name?.charAt(0)?.toUpperCase() || '';
});

// 关闭账号信息悬浮窗
const closeUserSettings = () => {
  showUserSettings.value = false;
};

// 导航到不同页面
const navigateTo = (type) => {
  showDropdown.value = false;
  switch (type) {
    case 'settings':
      router.push('/user-settings');
      break;
  }
};

// 退出登录
const logout = () => {
  showDropdown.value = false;
  authStore.clearUser();
  router.push('/login');
}
</script>

<style scoped>
.dashboard-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f7fa;
  min-height: 100vh;
  color: #333;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏样式 */
.top-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 0 24px;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  margin-right: 40px;
}

.logo-icon {
  font-size: 24px;
  color: #1a73e8;
  margin-right: 10px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #1a3a6e;
}

.nav-menu {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-menu li {
  padding: 0 15px;
  position: relative;
  cursor: pointer;
}

.nav-menu li a {
  text-decoration: none;
  color: #5f6368;
  font-size: 14px;
  font-weight: 500;
  padding: 22px 0;
  display: block;
  transition: color 0.3s;
}

.nav-menu li.active a {
  color: #1a73e8;
  font-weight: 600;
}

.nav-menu li.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 15px;
  right: 15px;
  height: 3px;
  background-color: #1a73e8;
}

.nav-menu li a:hover {
  color: #1a73e8;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.nav-tool {
  display: flex;
  margin-right: 20px;
}

.tool-item {
  position: relative;
  margin-left: 20px;
  color: #5f6368;
  font-size: 18px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s;
  cursor: pointer;
}

.tool-item:hover {
  background-color: #f1f3f4;
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #f44336;
  color: white;
  border-radius: 10px;
  font-size: 10px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  padding: 0 4px;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 24px;
  transition: background-color 0.3s;
}

.user-profile:hover {
  background-color: #f1f3f4;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #202124;
}

.user-status {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #5f6368;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #34a853;
  margin-right: 4px;
}

/* 主内容区样式 */
.dashboard-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
}

.user-profile {
  position: relative;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  width: 180px;
  z-index: 2000;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f5f7fa;
}

.dropdown-item i {
  margin-right: 10px;
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.dropdown-divider {
  height: 1px;
  background-color: #eee;
  margin: 4px 0;
}

/* 新增图标样式 */
.icon-form::before { content: "📋"; }
.icon-feedback::before { content: "💬"; }
.icon-user::before { content: "👤"; }
.icon-help::before { content: "❓"; }
.icon-logout::before { content: "🚪"; }

.user-settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
}

.modal-content {
  position: relative;
  width: 80%;
  max-width: 900px;
  max-height: 90vh;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: bounceIn 0.5s;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 16px 24px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  transition: transform 0.2s, color 0.2s;
}

.close-btn:hover {
  color: #333;
  transform: rotate(90deg);
}

.modal-body {
  overflow-y: auto;
  padding: 20px;
}

/* 动画效果 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes bounceIn {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 85vh;
  }
}


.user-avatar .avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff, #367bd6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
}
</style>
