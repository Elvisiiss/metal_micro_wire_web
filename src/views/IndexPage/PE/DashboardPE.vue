<template>
  <div class="dashboard-pe-container">
    <!-- 移动端顶部导航栏 -->
    <header class="pe-top-navbar">
      <div class="navbar-header">
        <button class="menu-toggle" @click="toggleSidebar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
        </button>
        <div class="logo">
          <span class="logo-icon">⦿</span>
          <span class="logo-text">云智检平台</span>
        </div>
        <div class="user-avatar-mini" @click="toggleUserMenu">
          <img v-if="userAvatar" :src="userAvatar" alt="用户头像">
          <div v-else class="avatar-placeholder">{{ userNameInitial }}</div>
        </div>
      </div>

      <!-- 移动端导航菜单 -->
      <div v-show="showSidebar" class="pe-sidebar-overlay" @click="toggleSidebar"></div>
      <div v-show="showSidebar" class="pe-sidebar">
        <div class="sidebar-header">
          <div class="user-info-sidebar">
            <div class="user-avatar-sidebar">
              <img v-if="userAvatar" :src="userAvatar" alt="用户头像">
              <div v-else class="avatar-placeholder">{{ userNameInitial }}</div>
            </div>
            <div class="user-details">
              <span class="user-name">{{ user_name }}</span>
              <span class="user-role">{{ authStore.user?.role_id === 1 ? '管理员' : '普通用户' }}</span>
            </div>
          </div>
          <button class="close-sidebar" @click="toggleSidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <nav class="sidebar-nav">
          <div
              v-for="tab in mobileTabs"
              :key="tab.key"
              :class="['nav-item', { active: activeTab === tab.key }]"
              @click="setActiveTab(tab.key)"
          >
            <div class="nav-icon">
              <component :is="tab.icon" />
            </div>
            <span class="nav-text">{{ tab.name }}</span>
          </div>
        </nav>

        <div class="sidebar-footer">
          <button class="data-screen-btn" @click="goToDataScreenPE">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
            <span>数据大屏</span>
          </button>

          <div class="sidebar-actions">
            <button class="action-btn" @click="openUserSettings">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>账号信息</span>
            </button>
            <button class="action-btn" @click="logout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 用户菜单 -->
      <div v-show="showUserMenu" class="pe-user-menu">
        <div class="menu-item" @click="openUserSettings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>账号信息</span>
        </div>
        <div class="menu-item" @click="logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>退出登录</span>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="pe-main-content">
      <!-- 顶部标签切换 -->
      <div class="pe-tab-bar">
        <div class="tab-scroll-container">
          <div
              v-for="tab in visibleTabs"
              :key="tab.key"
              :class="['pe-tab', { active: activeTab === tab.key }]"
              @click="setActiveTab(tab.key)"
          >
            {{ tab.name }}
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="pe-content-area">
        <!-- 仪表盘视图 -->
        <Overview v-if="activeTab === 'dashboard'" class="pe-component"/>

        <!-- 智能聊天视图 -->
        <ChatView v-if="activeTab === 'chat'" class="pe-component"/>

        <!-- 设备管理 -->
        <EquipmentManageDashboard v-if="activeTab === 'equipmentManage'" class="pe-component"/>

        <!-- 应用场景管理 -->
        <ApplicationScenario v-if="activeTab === 'ApplicationScenario'" class="pe-component"/>

        <!-- 线材管理 -->
        <mwManagement v-if="activeTab === 'mwManagement'" class="pe-component"/>

        <!-- 质量评估 -->
        <QualityEvaluation v-if="activeTab === 'QualityEvaluation'" class="pe-component"/>

        <!-- 问题回溯 -->
        <ProblemTracing v-if="activeTab === 'ProblemTracing'" class="pe-component"/>
      </div>
    </main>

    <!-- 账号信息悬浮窗 -->
    <transition name="slide-fade">
      <div v-if="showUserSettings" class="user-settings-modal">
        <div class="modal-overlay" @click="closeUserSettings"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3>账号信息</h3>
            <button class="close-btn" @click="closeUserSettings">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import AuthAPI from '@/api/auth.js';
import { ElMessage } from "element-plus";

// 组件导入
import Overview from './Overview.vue';
import ChatView from './ChatView.vue';
import UserSettings from '../../Public/UserSettings.vue';
import EquipmentManageDashboard from "@/views/IndexPage/PC/EquipmentManageDashboard.vue";
import ApplicationScenario from './ApplicationScenario.vue';
import QualityEvaluation from './QualityEvaluation.vue';
import mwManagement from './mwManagement.vue';
import ProblemTracing from "@/views/IndexPage/PC/ProblemTracing.vue";

const router = useRouter();
const authStore = useAuthStore();

// 响应式数据
const showSidebar = ref(false);
const showUserMenu = ref(false);
const showUserSettings = ref(false);
const activeTab = ref('dashboard');
const user_name = authStore.user?.user_name;

// 移动端标签配置
const mobileTabs = [
  { key: 'dashboard', name: '仪表盘', icon: 'DashboardIcon' },
  { key: 'equipmentManage', name: '设备管理', icon: 'EquipmentIcon' },
  { key: 'ApplicationScenario', name: '应用场景', icon: 'ScenarioIcon' },
  { key: 'mwManagement', name: '检测管理', icon: 'ManagementIcon' },
  { key: 'QualityEvaluation', name: '质量评估', icon: 'QualityIcon' },
  { key: 'ProblemTracing', name: '问题回溯', icon: 'TracingIcon' },
  { key: 'chat', name: '智能决策', icon: 'ChatIcon' }
];

// 可见标签（水平滚动）
const visibleTabs = computed(() => {
  return mobileTabs.filter(tab => tab.key !== 'SystemConfig');
});

// 计算属性
const userNameInitial = computed(() => {
  return authStore.user?.user_name?.charAt(0)?.toUpperCase() || '';
});

const userAvatar = computed(() => authStore.user?.avatar_url || '');

// 方法
const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value;
  showUserMenu.value = false;
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const setActiveTab = (tab) => {
  activeTab.value = tab;
  showSidebar.value = false;
  showUserMenu.value = false;
};

const goToDataScreenPE = () => {
  router.push('/data-screen-pe');
  showSidebar.value = false;
};

const openUserSettings = () => {
  showUserSettings.value = true;
  showSidebar.value = false;
  showUserMenu.value = false;
};

const closeUserSettings = () => {
  showUserSettings.value = false;
};

const logout = () => {
  AuthAPI.UserLogout(authStore.user?.token);
  authStore.clearUser();
  router.push('/login');
};

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  if (!showSidebar.value && !showUserMenu.value) return;

  const isClickInsideSidebar = event.target.closest('.pe-sidebar');
  const isClickInsideUserMenu = event.target.closest('.pe-user-menu');
  const isClickInsideUserAvatar = event.target.closest('.user-avatar-mini');

  if (!isClickInsideSidebar && showSidebar.value) {
    showSidebar.value = false;
  }

  if (!isClickInsideUserMenu && !isClickInsideUserAvatar && showUserMenu.value) {
    showUserMenu.value = false;
  }
};

// 生命周期
onMounted(async () => {
  const r = ref();
  try {
    r.value = (await AuthAPI.DetermineToken(authStore.user?.token)).data;
  } catch (error) {}

  if (r.value !== 0 && r.value !== 1) {
    if (r.value === 999) {
      await router.push('/root');
      ElMessage.error("请使用普通登录");
    } else {
      logout();
    }
  }

  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 图标组件（简化版）
const DashboardIcon = { template: '<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' };
const EquipmentIcon = { template: '<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6" y2="6"/><line x1="6" y1="18" x2="6" y2="18"/></svg>' };
const ScenarioIcon = { template: '<svg viewBox="0 0 24 24"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/><polyline points="2 15.5 12 8.5 22 15.5"/><line x1="12" y1="2" x2="12" y2="8.5"/></svg>' };
const ManagementIcon = { template: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' };
const QualityIcon = { template: '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>' };
const TracingIcon = { template: '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' };
const ChatIcon = { template: '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' };
</script>

<style scoped>
.dashboard-pe-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f7fa;
  min-height: 100vh;
  color: #333;
  display: flex;
  flex-direction: column;
}

/* 移动端顶部导航栏 */
.pe-top-navbar {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  height: 60px;
}

.menu-toggle {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #1a73e8;
}

.menu-toggle svg {
  width: 24px;
  height: 24px;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-icon {
  font-size: 20px;
  color: #1a73e8;
  margin-right: 8px;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #1a3a6e;
}

.user-avatar-mini {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.user-avatar-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff, #367bd6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: bold;
}

/* 侧边栏 */
.pe-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1999;
}

.pe-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100%;
  background: #fff;
  z-index: 2000;
  transform: translateX(0);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eaeaea;
}

.user-info-sidebar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-sidebar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  font-size: 16px;
}

.user-role {
  font-size: 12px;
  color: #666;
}

.close-sidebar {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.nav-item.active {
  background-color: #f0f7ff;
  border-right: 3px solid #1a73e8;
}

.nav-item:hover {
  background-color: #f5f5f5;
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
  color: #666;
}

.nav-item.active .nav-icon {
  color: #1a73e8;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #eaeaea;
}

.data-screen-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 16px;
}

.data-screen-btn svg {
  width: 18px;
  height: 18px;
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: none;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

/* 用户菜单 */
.pe-user-menu {
  position: absolute;
  top: 100%;
  right: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 2001;
  min-width: 150px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item svg {
  width: 16px;
  height: 16px;
}

/* 主内容区 */
.pe-main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pe-tab-bar {
  background: #fff;
  border-bottom: 1px solid #eaeaea;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.tab-scroll-container {
  display: flex;
  min-width: max-content;
  padding: 0 16px;
}

.pe-tab {
  padding: 12px 16px;
  white-space: nowrap;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.pe-tab.active {
  color: #1a73e8;
  border-bottom-color: #1a73e8;
}

.pe-content-area {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.pe-component {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 16px;
}

/* 模态框样式 */
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
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  padding: 16px 20px;
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
  padding: 4px;
  cursor: pointer;
  color: #6c757d;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  overflow-y: auto;
  padding: 20px;
  max-height: 60vh;
}

/* 动画 */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* 响应式调整 */
@media (min-width: 768px) {
  .dashboard-pe-container {
    max-width: 768px;
    margin: 0 auto;
  }
}

/* 隐藏滚动条但保持滚动功能 */
.tab-scroll-container::-webkit-scrollbar {
  display: none;
}

.tab-scroll-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
