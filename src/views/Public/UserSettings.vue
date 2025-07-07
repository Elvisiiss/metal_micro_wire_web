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
              <template v-if="user.avatarUrl">
                <img :src="user.avatarUrl" alt="用户头像" class="user-avatar">
                <button class="avatar-delete-btn" @click.stop="deleteAvatar">
                  <i class="icon-delete">🗑️</i>
                </button>
              </template>
              <div v-else class="avatar-placeholder">
                {{ userNameInitial }}
              </div>
              <button class="avatar-upload-btn" @click="triggerAvatarUpload">
                <i class="icon-camera">📷</i>
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
              <p class="user-role">{{ user.roleId === 1 ? '管理员' : '普通用户' }}</p>
            </div>
          </div>

          <div class="info-form">
            <div class="form-group">
              <label>用户名</label>
              <el-input
                  type="text"
                  v-model="user.username"
                  placeholder="请输入新用户名"
              />
            </div>
            <div class="form-group">
              <label>邮箱</label>
              <el-input
                  type="email"
                  v-model="user.email"
                  disabled
              />
            </div>
          </div>
        </div>
        <div class="card-footer">
          <el-button
              type="primary"
              @click="saveBasicInfo"
              :loading="saving"
          >
            保存更改
          </el-button>
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
            <button class="security-btn" @click="openPasswordModal">更改密码</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码模态框 -->
    <el-dialog v-model="showPasswordModal" title="修改密码" width="30%">
      <div class="password-form">
        <div class="form-group">
          <label>邮箱</label>
          <el-input v-model="password.email" disabled></el-input>
        </div>
        <div class="form-group">
          <label>验证码</label>
          <div class="code-input-group">
            <el-input v-model="password.code" placeholder="请输入验证码"></el-input>
            <el-button
                :disabled="codeButtonDisabled"
                @click="sendResetCode"
                class="code-button"
            >
              {{ codeButtonText }}
            </el-button>
          </div>
        </div>
        <div class="form-group">
          <label>新密码</label>
          <el-input
              type="password"
              v-model="password.new"
              show-password
              placeholder="请输入新密码"
          ></el-input>
        </div>
        <div class="form-group">
          <label>确认新密码</label>
          <el-input
              type="password"
              v-model="password.confirm"
              show-password
              placeholder="请再次输入新密码"
          ></el-input>
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
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import userAPI from '@/api/user.js'
import api from '@/api/auth.js'

const authStore = useAuthStore()

// 用户数据
const user = ref({
  userId: null,
  username: '',
  email: '',
  avatarUrl: '',
  roleId: 0
})

// 密码修改相关
const showPasswordModal = ref(false)
const password = ref({
  email: '',
  code: '',
  new: '',
  confirm: ''
})

// 验证码相关
const codeButtonDisabled = ref(false)
const codeButtonText = ref('获取验证码')
let countdown = 60
let countdownTimer = null

const avatarInput = ref(null)
const saving = ref(false)

// 计算用户名首字母
const userNameInitial = computed(() => {
  return user.value.username?.charAt(0)?.toUpperCase() || ''
})

// 初始化用户数据
onMounted(() => {
  fetchUserProfile()
})

// 获取用户资料
const fetchUserProfile = async () => {
  try {
    const response = await userAPI.getUserProfile()
    if (response.data.code === 'success') {
      const profile = response.data.data
      user.value = {
        userId: profile.userId,
        username: profile.userName,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
        roleId: profile.roleId
      }
    } else {
      ElMessage.error('获取用户资料失败: ' + response.data.msg)
    }
  } catch (error) {
    console.error('获取用户资料失败:', error)
    ElMessage.error('获取用户资料失败')
  }
}

// 打开密码修改模态框
const openPasswordModal = () => {
  password.value = {
    email: user.value.email,
    code: '',
    new: '',
    confirm: ''
  }
  showPasswordModal.value = true
}

// 触发头像上传
const triggerAvatarUpload = () => {
  avatarInput.value.click()
}

// 处理头像上传
const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件类型
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    ElMessage.error('只支持 JPG, PNG, GIF, WEBP 格式的图片')
    return
  }

  // 验证文件大小
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过2MB')
    return
  }

  try {
    const response = await userAPI.uploadAvatar(file)
    if (response.data.code === 'success') {
      user.value.avatarUrl = response.data.data.avatarUrl
      // 更新全局用户状态
      authStore.updateUserAvatar(response.data.data.avatarUrl)
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error('头像上传失败: ' + response.data.msg)
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败')
  } finally {
    // 重置input以便再次选择同一文件
    event.target.value = ''
  }
}

// 删除头像
const deleteAvatar = async () => {
  try {
    const response = await userAPI.deleteAvatar()
    if (response.data.code === 'success') {
      user.value.avatarUrl = ''
      // 更新全局用户状态
      authStore.updateUserAvatar('')
      ElMessage.success('头像删除成功')
    } else {
      ElMessage.error('头像删除失败: ' + response.data.msg)
    }
  } catch (error) {
    console.error('头像删除失败:', error)
    ElMessage.error('头像删除失败')
  }
}

// 保存基本信息
const saveBasicInfo = async () => {
  if (!user.value.username) {
    ElMessage.error('用户名不能为空')
    return
  }

  if (user.value.username.length > 20) {
    ElMessage.error('用户名长度不能超过20个字符')
    return
  }

  if (/@/.test(user.value.username)) {
    ElMessage.error('用户名不能包含@符号')
    return
  }

  saving.value = true
  try {
    const response = await userAPI.updateUsername(user.value.username)
    if (response.data.code === 'success') {
      // 更新全局用户状态
      authStore.updateUsername(user.value.username)
      ElMessage.success('用户名修改成功')
    } else {
      ElMessage.error('用户名修改失败: ' + response.data.msg)
    }
  } catch (error) {
    console.error('用户名修改失败:', error)
    ElMessage.error('用户名修改失败')
  } finally {
    saving.value = false
  }
}

// 发送验证码
const sendResetCode = async () => {
  try {
    const response = await api.sendResetPasswordCode(password.value.email)
    if (response.code === 'success') {
      startCountdown()
      ElMessage.success('验证码已发送，请查收邮箱')
    } else {
      ElMessage.error(response.msg || '发送验证码失败')
    }
  } catch (err) {
    ElMessage.error('发送验证码失败，请稍后再试')
  }
}

// 开始倒计时
const startCountdown = () => {
  codeButtonDisabled.value = true
  codeButtonText.value = `${countdown}秒后重试`

  countdownTimer = setInterval(() => {
    countdown--
    codeButtonText.value = `${countdown}秒后重试`

    if (countdown <= 0) {
      clearInterval(countdownTimer)
      codeButtonText.value = '获取验证码'
      codeButtonDisabled.value = false
      countdown = 60
    }
  }, 1000)
}

// 修改密码
const changePassword = async () => {
  // 表单验证
  if (!password.value.code) {
    ElMessage.error('请输入验证码')
    return
  }

  if (!password.value.new || !password.value.confirm) {
    ElMessage.error('请输入新密码')
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

  try {
    // 调用API修改密码
    const response = await api.resetPassword(
        password.value.email,
        password.value.new,
        password.value.code
    )

    if (response.code === 'success') {
      ElMessage.success('密码修改成功')
      showPasswordModal.value = false
    } else {
      ElMessage.error(response.msg || '密码修改失败')
    }
  } catch (error) {
    ElMessage.error('密码修改失败，请稍后再试')
  }
}

// 组件卸载时清除定时器
onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
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

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff, #367bd6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
  font-weight: bold;
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
  z-index: 10;
}

.avatar-upload-btn:hover {
  background-color: #66b1ff;
}

.avatar-delete-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

.avatar-delete-btn:hover {
  background-color: #ff7875;
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

.card-footer {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  text-align: right;
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

.code-input-group {
  display: flex;
  gap: 10px;
}

.code-button {
  white-space: nowrap;
}
</style>
