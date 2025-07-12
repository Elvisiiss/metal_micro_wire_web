<template>
  <div class="dashboard-container" @click="handleContainerClick">
    <!-- 顶部导航栏 -->
    <header class="top-navbar">
      <div class="navbar-left">
        <div class="logo">
          <span class="logo-icon">⦿</span>
          <span class="logo-text">微细线材云智检平台</span>
        </div>
        <ul class="nav-menu">
          <li :class="{active: activeTab === 'dashboard'}"><a @click="setActiveTab('dashboard')">仪表盘</a></li>
          <li :class="{active: activeTab === 'equipmentManage'}"><a @click="setActiveTab('equipmentManage')">设备管理</a></li>
          <li :class="{active: activeTab === 'ApplicationScenario'}"><a @click="setActiveTab('ApplicationScenario')">应用场景管理</a></li>
          <li :class="{active: activeTab === 'mwManagement'}"><a @click="setActiveTab('mwManagement')">检测管理</a></li>
          <li :class="{active: activeTab === 'QualityEvaluation'}"><a @click="setActiveTab('QualityEvaluation')">质量评估</a></li>
          <li :class="{active: activeTab === 'ProblemTracing'}"><a @click="setActiveTab('ProblemTracing')">问题回溯</a></li>
          <li :class="{active: activeTab === 'chat'}"><a @click="setActiveTab('chat')">智能决策</a></li>
        </ul>
      </div>
      <div class="navbar-right">
        <button class="data-screen-btn" @click="goToDataScreen">
          <el-icon><DataBoard /></el-icon>
          <span>数据大屏</span>
        </button>
        <div class="user-profile" @click.stop="toggleDropdown" ref="userProfileRef">
          <div class="user-avatar">
            <img v-if="userAvatar" :src="userAvatar" alt="用户头像">
            <div v-else class="avatar-placeholder">{{ userNameInitial }}</div>
          </div>
          <div class="user-info">
            <span class="user-name">{{ user_name }} ({{ authStore.user?.role_id === 1 ? '管理员' : '普通用户' }})</span>
            <div class="user-status">
              <span class="status-dot"></span>
              <span class="status-text">在线</span>
            </div>
          </div>

          <!-- 下拉菜单 -->
          <div v-show="showDropdown" class="dropdown-menu" ref="dropdownMenuRef">
            <div class="dropdown-item" @click="openUserSettings">
              <i class="icon-user"></i>
              <span>账号信息</span>
            </div>
            <div class="dropdown-item" @click="setActiveTab('SystemConfig')">
              <i class="icon-settings"></i>
              <span>系统设置</span>
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
      <!-- 仪表盘视图 -->
      <Overview v-if="activeTab === 'dashboard'"/>

      <!-- 数据大屏视图 -->
      <DataScreen v-if="activeTab === 'dataScreen'" />

      <!-- 智能聊天视图 -->
      <ChatView v-if="activeTab === 'chat'"/>

      <!-- 设备管理-->
      <EquipmentManageDashboard v-if="activeTab === 'equipmentManage'"/>

      <!-- 应用场景管理-->
      <ApplicationScenario v-if="activeTab === 'ApplicationScenario'"/>

      <!-- 线材管理-->
      <mwManagement v-if="activeTab === 'mwManagement'"/>

      <!-- 系统设置-->
      <SystemConfig v-if="activeTab === 'SystemConfig'"/>

      <!-- 数据分析-->
      <ProblemTracing v-if="activeTab === 'ProblemTracing'"/>

      <!-- 质量评估-->
      <QualityEvaluation v-if="activeTab === 'QualityEvaluation'"/>
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
import {
  DataBoard,
  User,
  QuestionFilled,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'

import {onMounted, ref, onBeforeUnmount, computed} from 'vue';
import Overview from './Overview.vue';
import DataScreen from './DataScreen.vue';
import ChatView from './ChatView.vue';
import UserSettings from '../Public/UserSettings.vue'; // 导入UserSettings组件
import EquipmentManageDashboard from "@/views/IndexPage/EquipmentManageDashboard.vue";
import ApplicationScenario from './ApplicationScenario.vue'
import QualityEvaluation from './QualityEvaluation.vue'
import mwManagement from './mwManagement.vue'
import SystemConfig from "@/views/IndexPage/SystemConfig.vue";
import AuthAPI from '@/api/auth.js'

import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {ElMessage} from "element-plus";
import ProblemTracing from "@/views/IndexPage/ProblemTracing.vue";

const router = useRouter();
const authStore = useAuthStore();
const showDropdown = ref(false);
const showUserSettings = ref(false); // 控制悬浮窗显示
const user_name = authStore.user?.user_name;

// 获取DOM元素的引用
const userProfileRef = ref(null);
const dropdownMenuRef = ref(null);

const goToDataScreen = () => {
  router.push('/data-screen')
}

const userNameInitial = computed(() => {
  return authStore.user?.user_name?.charAt(0)?.toUpperCase() || '';
});

// 用户头像
const userAvatar = computed(() => authStore.user?.avatar_url || '');

// 活动标签
const activeTab = ref('dashboard');

// 设置活动标签
const setActiveTab = (tab) => {
  activeTab.value = tab;
  showDropdown.value = false;
};

// 切换下拉菜单显示状态
const toggleDropdown = () => {
  showDropdown.value = true;
};

// 打开账号信息悬浮窗
const openUserSettings = () => {
  showDropdown.value = false;
  showUserSettings.value = true;
};

// 关闭账号信息悬浮窗
const closeUserSettings = () => {
  showUserSettings.value = false;
};

// 退出登录
const logout = () => {
  showDropdown.value = false;
  AuthAPI.UserLogout(authStore.user?.token)
  authStore.clearUser();
  router.push('/login');
}

// 点击容器收起下拉菜单
const handleContainerClick = (event) => {
  if (!showDropdown.value) return;

  const isClickInsideUserProfile = userProfileRef.value?.contains(event.target);

  if (!isClickInsideUserProfile) {
    showDropdown.value = false;
  }
};

// 生命周期钩子
onMounted(async () => {
  const r = ref()
  try{
    r.value = (await AuthAPI.DetermineToken(authStore.user?.token)).data
  }catch(error){}
  if (r.value !== 0 && r.value !== 1) {
    if(r.value === 999){
      await router.push('/root')
      ElMessage.error("请使用普通登录")
    }else{
      logout()
    }
  }

  // 添加全局点击事件监听器
  document.addEventListener('click', handleContainerClick);
});

// 组件卸载前移除事件监听器
onBeforeUnmount(() => {
  document.removeEventListener('click', handleContainerClick);
});
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

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 24px;
  transition: background-color 0.3s;
  position: relative;
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

/* 下拉菜单样式美化 */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 220px;
  z-index: 2000;
  overflow: hidden;
  border: 1px solid #ebeef5;
  padding: 8px 0;
  transition: all 0.3s ease;
  transform-origin: top right;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1.5;
}

.dropdown-item:hover {
  background-color: #f5f7fa;
  color: #1a73e8;
}

.dropdown-item i {
  margin-right: 12px;
  font-size: 16px;
  width: 20px;
  text-align: center;
  color: #909399;
  transition: color 0.2s;
}

.dropdown-item:hover i {
  color: #1a73e8;
}

.dropdown-divider {
  height: 1px;
  background-color: #ebeef5;
  margin: 6px 0;
}

/* 新增图标样式 */
.icon-user::before { content: "👤"; }
.icon-help::before { content: "❓"; }
.icon-logout::before { content: "🚪"; }
.icon-settings::before { content: "⚙️"; }

/* 下拉菜单动画 */
.dropdown-menu {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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

  .dropdown-menu {
    width: 180px;
  }
}

.data-screen-btn {
  display: flex;
  align-items: center;
  margin-right: 20px;
  padding: 8px 16px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.data-screen-btn:hover {
  background: #1669d8;
}

.data-screen-btn .el-icon {
  margin-right: 6px;
  font-size: 16px;
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
  font-size: 18px; /* 根据头像大小调整 */
  font-weight: bold;
}
</style>
