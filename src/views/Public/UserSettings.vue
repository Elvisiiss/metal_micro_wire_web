<template>
  <div class="user-settings-container">
    <div class="settings-header">
      <h2>账号信息</h2>
      <p>管理您的账号信息和安全设置</p>
    </div>

    <div class="settings-content">
      <!-- 基本信息卡片 -->
      <div class="settings-card">
        <div class="card-header">
          <h3>基本信息</h3>
        </div>
        <div class="card-body">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <img :src="user.avatar" alt="用户头像" class="user-avatar">
              <button class="avatar-upload-btn" @click="triggerAvatarUpload">
                <i class="icon-camera"></i>
              </button>
              <input
                  type="file"
                  ref="avatarInput"
                  accept="image/*"
                  @change="handleAvatarUpload"
                  style="display: none"
              >
            </div>
            <div class="avatar-info">
              <p class="username">{{ user.username }}</p>
              <p class="user-role">{{ user.role }}</p>
            </div>
          </div>

          <div class="info-form">
            <div class="form-group">
              <label>用户名</label>
              <input type="text" v-model="user.username" disabled>
            </div>
            <div class="form-group">
              <label>邮箱</label>
              <input type="email" v-model="user.email">
            </div>
            <div class="form-group">
              <label>手机号码</label>
              <input type="tel" v-model="user.phone">
            </div>
          </div>
        </div>
        <div class="card-footer">
          <button class="save-btn" @click="saveBasicInfo">保存更改</button>
        </div>
      </div>

      <!-- 安全设置卡片 -->
      <div class="settings-card">
        <div class="card-header">
          <h3>安全设置</h3>
        </div>
        <div class="card-body">
          <div class="security-item">
            <div class="security-info">
              <h4>密码</h4>
              <p>定期更改密码以确保账号安全</p>
            </div>
            <button class="security-btn" @click="showPasswordModal = true">更改密码</button>
          </div>
          <div class="security-item">
            <div class="security-info">
              <h4>双重认证</h4>
              <p>为您的账号增加额外的安全保护</p>
            </div>
            <el-switch v-model="user.twoFactorAuth" active-color="#13ce66"></el-switch>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码模态框 -->
    <el-dialog v-model="showPasswordModal" title="修改密码" width="30%">
      <div class="password-form">
        <div class="form-group">
          <label>当前密码</label>
          <el-input type="password" v-model="password.current" show-password></el-input>
        </div>
        <div class="form-group">
          <label>新密码</label>
          <el-input type="password" v-model="password.new" show-password></el-input>
        </div>
        <div class="form-group">
          <label>确认新密码</label>
          <el-input type="password" v-model="password.confirm" show-password></el-input>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPasswordModal = false">取消</el-button>
          <el-button type="primary" @click="changePassword">确认修改</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()

// 用户数据
const user = ref({
  username: '张工',
  email: 'zhang.gong@example.com',
  phone: '13800138000',
  role: '管理员',
  avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/hQoOP719jarWIicoBGJoqLkju7oicBOtuZempcjbzQXibqnIWWF1BnTHfiaQujUHTSR4ocWz66c9CqcRl7ic8BbAg9Vt6j0TBIfyQib39ibCnKtxvQ/132',
  twoFactorAuth: false
})

// 密码修改相关
const showPasswordModal = ref(false)
const password = ref({
  current: '',
  new: '',
  confirm: ''
})

const avatarInput = ref(null)

// 初始化用户数据
onMounted(() => {
  if (authStore.user) {
    user.value.username = authStore.user.user_name || '张工'
    user.value.email = authStore.user.email || 'zhang.gong@example.com'
  }
})

// 触发头像上传
const triggerAvatarUpload = () => {
  avatarInput.value.click()
}

// 处理头像上传
const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (!file.type.match('image.*')) {
      ElMessage.error('请选择图片文件')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      user.value.avatar = e.target.result
      ElMessage.success('头像更新成功')
    }
    reader.readAsDataURL(file)
  }
}

// 保存基本信息
const saveBasicInfo = () => {
  // 这里应该添加表单验证逻辑
  ElMessage.success('基本信息已保存')
}

// 修改密码
const changePassword = () => {
  if (!password.value.current || !password.value.new) {
    ElMessage.error('请填写完整密码信息')
    return
  }

  if (password.value.new !== password.value.confirm) {
    ElMessage.error('两次输入的新密码不一致')
    return
  }

  if (password.value.new.length < 6) {
    ElMessage.error('密码长度不能少于6位')
    return
  }

  // 这里应该调用API修改密码
  ElMessage.success('密码修改成功')
  showPasswordModal.value = false
  password.value = { current: '', new: '', confirm: '' }
}
</script>

<style scoped>
.user-settings-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.settings-header {
  margin-bottom: 30px;
}

.settings-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.settings-header p {
  font-size: 14px;
  color: #999;
}

.settings-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h3 {
  font-size: 18px;
  color: #333;
}

.card-body {
  padding: 20px;
}

.avatar-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  margin-right: 20px;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-upload-btn {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 28px;
  height: 28px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.avatar-upload-btn:hover {
  background-color: #66b1ff;
}

.avatar-info .username {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 4px;
}

.avatar-info .user-role {
  font-size: 14px;
  color: #999;
}

.info-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.form-group input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #409eff;
}

.form-group input:disabled {
  background-color: #f5f7fa;
  color: #999;
}

.card-footer {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  text-align: right;
}

.save-btn {
  padding: 8px 20px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.save-btn:hover {
  background-color: #66b1ff;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.security-item:last-child {
  border-bottom: none;
}

.security-info h4 {
  font-size: 16px;
  margin-bottom: 4px;
  color: #333;
}

.security-info p {
  font-size: 14px;
  color: #999;
}

.security-btn {
  padding: 8px 15px;
  background-color: #f5f7fa;
  color: #409eff;
  border: 1px solid #d9e1f0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.security-btn:hover {
  background-color: #ecf5ff;
  border-color: #c6e2ff;
}

.password-form .form-group {
  margin-bottom: 20px;
}

.password-form label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.icon-camera::before {
  content: "📷";
}
</style>
