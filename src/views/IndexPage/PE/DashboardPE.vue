<template>
  <div class="mobile-dashboard-container">
    <!-- 顶部导航栏（简化版） -->
    <header class="mobile-top-bar">
      <div class="logo-section">
        <span class="logo-icon">⦿</span>
        <span class="logo-text">微细线材云智检</span>
      </div>
      <div class="user-avatar" @click="toggleUserMenu">
        <img v-if="userAvatar" :src="userAvatar" alt="用户头像">
        <div v-else class="avatar-placeholder">{{ userNameInitial }}</div>
      </div>
    </header>

    <!-- 用户菜单 -->
    <div v-if="showUserMenu" class="user-menu-overlay" @click="showUserMenu = false">
      <div class="user-menu" @click.stop>
        <div class="user-info">
          <div class="user-avatar-large">
            <img v-if="userAvatar" :src="userAvatar" alt="用户头像">
            <div v-else class="avatar-placeholder">{{ userNameInitial }}</div>
          </div>
          <div class="user-details">
            <span class="user-name">{{ user_name }}</span>
            <span class="user-role">{{ authStore.user?.role_id === 1 ? '管理员' : '普通用户' }}</span>
          </div>
        </div>
        <div class="menu-items">
          <div class="menu-item" @click="openUserSettings">
            <i class="icon-user"></i>
            <span>账号信息</span>
          </div>
          <div class="menu-item" @click="setActiveTab('SystemConfig')">
            <i class="icon-settings"></i>
            <span>系统设置</span>
          </div>
          <div class="menu-item" @click="goToDataScreen">
            <i class="icon-data"></i>
            <span>数据大屏</span>
          </div>
          <div class="menu-divider"></div>
          <div class="menu-item logout" @click="logout">
            <i class="icon-logout"></i>
            <span>退出登录</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <main class="mobile-content">
      <!-- 仪表盘视图 -->
      <Overview v-if="activeTab === 'dashboard'"/>

      <!-- 设备管理 -->
      <EquipmentManageDashboard v-if="activeTab === 'equipmentManage'"/>

      <!-- 检测管理 -->
      <mwManagement v-if="activeTab === 'mwManagement'"/>

      <!-- 更多功能视图 -->
      <div v-if="activeTab === 'more'" class="more-view">
        <div class="more-grid">
          <div class="more-item" @click="setActiveTab('ApplicationScenario')">
            <i class="icon-scene"></i>
            <span>应用场景</span>
          </div>
          <div class="more-item" @click="setActiveTab('QualityEvaluation')">
            <i class="icon-quality"></i>
            <span>质量评估</span>
          </div>
          <div class="more-item" @click="setActiveTab('ProblemTracing')">
            <i class="icon-trace"></i>
            <span>问题回溯</span>
          </div>
          <div class="more-item" @click="setActiveTab('chat')">
            <i class="icon-chat"></i>
            <span>智能决策</span>
          </div>
        </div>
      </div>

      <!-- 其他视图 -->
      <ApplicationScenario v-if="activeTab === 'ApplicationScenario'"/>
      <QualityEvaluation v-if="activeTab === 'QualityEvaluation'"/>
      <ProblemTracing v-if="activeTab === 'ProblemTracing'"/>
      <ChatView v-if="activeTab === 'chat'"/>
      <SystemConfig v-if="activeTab === 'SystemConfig'"/>
    </main>

    <!-- 底部标签栏 -->
    <nav class="bottom-tab-bar">
      <div
          class="tab-item"
          :class="{ active: activeTab === 'dashboard' }"
          @click="setActiveTab('dashboard')"
      >
        <i class="tab-icon">📊</i>
        <span class="tab-label">仪表盘</span>
      </div>
      <div
          class="tab-item"
          :class="{ active: activeTab === 'equipmentManage' }"
          @click="setActiveTab('equipmentManage')"
      >
        <i class="tab-icon">⚙️</i>
        <span class="tab-label">设备</span>
      </div>
      <div
          class="tab-item"
          :class="{ active: activeTab === 'mwManagement' }"
          @click="setActiveTab('mwManagement')"
      >
        <i class="tab-icon">🔍</i>
        <span class="tab-label">检测</span>
      </div>
      <div
          class="tab-item"
          :class="{ active: activeTab === 'more' }"
          @click="setActiveTab('more')"
      >
        <i class="tab-icon">⋮</i>
        <span class="tab-label">更多</span>
      </div>
    </nav>

    <!-- 账号信息悬浮窗 -->
    <transition name="slide-up">
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
import { onMounted, ref, onBeforeUnmount, computed } from 'vue';
import Overview from './OverviewPE.vue';
import ChatView from './ChatViewPE.vue';
import UserSettings from '../../Public/UserSettingsPE.vue';
import EquipmentManageDashboard from "./EquipmentManageDashboardPE.vue";
import ApplicationScenario from './ApplicationScenarioPE.vue';
import QualityEvaluation from './QualityEvaluationPE.vue';
import mwManagement from './mwManagementPE.vue';
import SystemConfig from "./SystemConfigPE.vue";
import ProblemTracing from "./ProblemTracingPE.vue";
import AuthAPI from '@/api/auth.js';

import {useRouter} from 'vue-router';
import {useAuthStore} from '@/stores/auth.js';
import {ElMessage} from "element-plus";

const router = useRouter();
const authStore = useAuthStore();
const showUserMenu = ref(false);
const showUserSettings = ref(false);
const user_name = authStore.user?.user_name;

const userNameInitial = computed(() => {
  return authStore.user?.user_name?.charAt(0)?.toUpperCase() || '';
});

const userAvatar = computed(() => authStore.user?.avatar_url || '');

const activeTab = ref('dashboard');

const setActiveTab = (tab) => {
  activeTab.value = tab;
  showUserMenu.value = false;
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const openUserSettings = () => {
  showUserMenu.value = false;
  showUserSettings.value = true;
};

const closeUserSettings = () => {
  showUserSettings.value = false;
};

const goToDataScreen = () => {
  router.push('/data-screen-pe');
  showUserMenu.value = false;
};

const logout = () => {
  showUserMenu.value = false;
  AuthAPI.UserLogout(authStore.user?.token);
  authStore.clearUser();
  router.push('/login');
};

onMounted(async () => {
  const r = ref();
  try {
    r.value = (await AuthAPI.DetermineToken(authStore.user?.token)).data;
  } catch (error) {
  }
  if (r.value !== 0 && r.value !== 1) {
    if (r.value === 999) {
      await router.push('/root');
      ElMessage.error("请使用普通登录");
    } else {
      logout();
    }
  }
});
</script>

<style scoped>
.mobile-dashboard-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f7fa;
  min-height: 100vh;
  color: #333;
  display: flex;
  flex-direction: column;
  padding-bottom: 60px; /* 为底部标签栏留出空间 */
}

/* 顶部导航栏 */
.mobile-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 12px 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo-section {
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

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

/* 用户菜单 */
.user-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.user-menu {
  width: 100%;
  background-color: #fff;
  border-radius: 16px 16px 0 0;
  padding: 20px;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.user-avatar-large {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
}

.user-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-large .avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff, #367bd6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.user-role {
  font-size: 14px;
  color: #666;
}

.menu-items {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s;
}

.menu-item:hover {
  color: #1a73e8;
}

.menu-item i {
  margin-right: 15px;
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.menu-divider {
  height: 1px;
  background-color: #eee;
  margin: 10px 0;
}

.menu-item.logout {
  color: #f56c6c;
}

.menu-item.logout:hover {
  color: #f78989;
}

/* 主内容区 */
.mobile-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

/* 更多功能视图 */
.more-view {
  padding: 20px 0;
}

.more-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.more-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  padding: 20px 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.more-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.more-item i {
  font-size: 28px;
  margin-bottom: 8px;
}

.more-item span {
  font-size: 14px;
  color: #333;
}

/* 底部标签栏 */
.bottom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 8px 0;
  cursor: pointer;
  transition: color 0.2s;
}

.tab-item.active {
  color: #1a73e8;
}

.tab-icon {
  font-size: 22px;
  margin-bottom: 4px;
}

.tab-label {
  font-size: 12px;
}

/* 账号信息悬浮窗 */
.user-settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
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
  animation: bounceIn 0.5s;
  display: flex;
  flex-direction: column;
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

/* 图标样式 */
.icon-user::before {
  content: "👤";
}

.icon-settings::before {
  content: "⚙️";
}

.icon-data::before {
  content: "📈";
}

.icon-logout::before {
  content: "🚪";
}

.icon-scene::before {
  content: "🌐";
}

.icon-quality::before {
  content: "⭐";
}

.icon-trace::before {
  content: "🔍";
}

.icon-chat::before {
  content: "💬";
}

/* 响应式调整 */
/* 小屏幕手机 (小于480px) */
@media (max-width: 479px) {
  .mobile-content {
    padding: 12px;
  }

  .more-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .more-item {
    padding: 16px 8px;
  }

  .tab-icon {
    font-size: 20px;
  }

  .tab-label {
    font-size: 11px;
  }
}

/* 中等屏幕手机 (480px - 767px) */
@media (min-width: 480px) and (max-width: 767px) {
  .mobile-content {
    padding: 14px;
  }

  .more-grid {
    gap: 14px;
  }

  .more-item {
    padding: 18px 10px;
  }
}

/* 平板和中等屏幕 (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .mobile-dashboard-container {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    padding-bottom: 70px;
  }

  .mobile-top-bar {
    padding: 16px 24px;
  }

  .logo-icon {
    font-size: 24px;
  }

  .logo-text {
    font-size: 18px;
  }

  .user-avatar {
    width: 42px;
    height: 42px;
  }

  .mobile-content {
    padding: 20px;
  }

  .more-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .more-item {
    padding: 24px 12px;
  }

  .more-item i {
    font-size: 32px;
  }

  .more-item span {
    font-size: 16px;
  }

  .bottom-tab-bar {
    padding: 10px 0;
  }

  .tab-icon {
    font-size: 24px;
    margin-bottom: 6px;
  }

  .tab-label {
    font-size: 13px;
  }
}

/* 大屏幕平板和小型桌面 (1024px - 1279px) */
@media (min-width: 1024px) and (max-width: 1279px) {
  .mobile-dashboard-container {
    max-width: 1024px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    padding-bottom: 80px;
  }

  .mobile-top-bar {
    padding: 18px 28px;
  }

  .logo-icon {
    font-size: 26px;
  }

  .logo-text {
    font-size: 20px;
  }

  .user-avatar {
    width: 46px;
    height: 46px;
  }

  .mobile-content {
    padding: 24px;
  }

  .more-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }

  .more-item {
    padding: 28px 14px;
  }

  .more-item i {
    font-size: 36px;
  }

  .more-item span {
    font-size: 17px;
  }

  .bottom-tab-bar {
    padding: 12px 0;
  }

  .tab-icon {
    font-size: 26px;
    margin-bottom: 6px;
  }

  .tab-label {
    font-size: 14px;
  }
}

/* 桌面屏幕 (1280px及以上) */
@media (min-width: 1280px) {
  .mobile-dashboard-container {
    max-width: 1280px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    padding-bottom: 80px;
  }

  .mobile-top-bar {
    padding: 20px 32px;
  }

  .logo-icon {
    font-size: 28px;
  }

  .logo-text {
    font-size: 22px;
  }

  .user-avatar {
    width: 50px;
    height: 50px;
  }

  .mobile-content {
    padding: 28px;
  }

  .more-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 28px;
  }

  .more-item {
    padding: 32px 16px;
  }

  .more-item i {
    font-size: 40px;
  }

  .more-item span {
    font-size: 18px;
  }

  .bottom-tab-bar {
    padding: 14px 0;
  }

  .tab-icon {
    font-size: 28px;
    margin-bottom: 8px;
  }

  .tab-label {
    font-size: 15px;
  }

  /* 在大屏幕上调整用户菜单为侧边弹出 */
  .user-menu-overlay {
    align-items: flex-start;
    justify-content: flex-end;
  }

  .user-menu {
    width: 320px;
    height: 100%;
    border-radius: 0;
    animation: slide-left 0.3s ease-out;
  }

  @keyframes slide-left {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
}

/* 横屏模式优化 */
@media (max-height: 500px) and (orientation: landscape) {
  .mobile-dashboard-container {
    padding-bottom: 50px;
  }

  .mobile-top-bar {
    padding: 8px 16px;
  }

  .mobile-content {
    padding: 12px;
  }

  .more-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .more-item {
    padding: 12px 8px;
  }

  .bottom-tab-bar {
    padding: 6px 0;
  }
}

/* 高DPI屏幕优化 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .mobile-top-bar {
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
  }

  .bottom-tab-bar {
    box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
  }
}

/* 打印样式 */
@media print {
  .mobile-top-bar,
  .bottom-tab-bar,
  .user-menu-overlay,
  .user-settings-modal {
    display: none !important;
  }

  .mobile-dashboard-container {
    background-color: white;
    padding-bottom: 0;
  }

  .mobile-content {
    padding: 0;
  }
}
</style>
