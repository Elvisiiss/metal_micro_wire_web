<template>
  <div class="dashboard-container">
    <!-- 顶部导航栏 -->
    <header class="top-navbar">
      <div class="navbar-left">
        <div class="logo">
          <span class="logo-icon">⦿</span>
          <span class="logo-text">金属微细线材检测平台</span>
        </div>
        <ul class="nav-menu">
          <li :class="{active: activeTab === 'dashboard'}"><a @click="setActiveTab('dashboard')">仪表盘</a></li>
          <li :class="{active: activeTab === 'dataScreen'}"><a @click="setActiveTab('dataScreen')">数据大屏</a></li>
          <li :class="{active: activeTab === 'chat'}"><a @click="setActiveTab('chat')">智能聊天</a></li>
          <li><a>检测管理</a></li>
          <li><a>数据分析</a></li>
          <li><a>系统设置</a></li>
        </ul>
      </div>
      <div class="navbar-right">
        <div class="nav-tool">
          <a class="tool-item">
            <i class="icon-notification"></i>
            <span class="badge">3</span>
          </a>
          <a class="tool-item">
            <i class="icon-help"></i>
          </a>
        </div>
        <div class="user-profile">
          <div class="user-avatar">
            <img :src="userAvatar" alt="用户头像">
          </div>
          <div class="user-info">
            <span class="user-name">张工 (管理员)</span>
            <div class="user-status">
              <span class="status-dot"></span>
              <span class="status-text">在线</span>
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
    </main>
  </div>
</template>

<script>
import { ref } from 'vue';
import Overview from './Overview.vue';
import DataScreen from './DataScreen.vue';
import ChatView from './ChatView.vue';

export default {
  components: {
    Overview,
    DataScreen,
    ChatView
  },
  setup() {
    // 用户头像
    const userAvatar = ref('https://thirdwx.qlogo.cn/mmopen/vi_32/hQoOP719jarWIicoBGJoqLkju7oicBOtuZempcjbzQXibqnIWWF1BnTHfiaQujUHTSR4ocWz66c9CqcRl7ic8BbAg9Vt6j0TBIfyQib39ibCnKtxvQ/132');

    // 活动标签
    const activeTab = ref('dashboard');

    // 设置活动标签
    const setActiveTab = (tab) => {
      activeTab.value = tab;
    };

    return {
      userAvatar,
      activeTab,
      setActiveTab
    };
  }
};
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
</style>
