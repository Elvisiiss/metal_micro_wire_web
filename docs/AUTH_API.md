# AUTH API文档

## 基础信息
- 开发环境基础URL: `/api/auth` (通过Vite代理转发到 `http://10.168.82.63:8080`)
- 所有请求使用POST方法
- 请求和响应格式均为JSON

## 代理配置

### Vite开发环境代理配置
在 `vite.config.js` 中配置：
```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://10.168.82.63:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
```


## API列表

### 1. 用户注册

#### 1.1 发送注册验证码
- **接口**: `/register/send-code`
- **请求**:
```json
{
  "msg": "创建用户发送验证码",
  "e_mail": "3115089759@qq.com"
}
```
- **成功响应**:
```json
{
  "msg": "成功发送验证码",
  "e_mail": "3115089759@qq.com",
  "code": "success"
}
```
- **失败响应**:
```json
{
  "msg": "邮箱已存在",
  "e_mail": "3115089759@qq.com",
  "code": "Error"
}
```

#### 1.2 确认验证码并创建用户
- **接口**: `/register/verify-code`
- **请求**:
```json
{
  "msg": "创建用户确认验证码",
  "e_mail": "3115089759@qq.com",
  "user_name": "闻人慕远z",
  "passwd": "Huawei@123",
  "mail_code": "791607"
}
```
- **成功响应**:
```json
{
  "msg": "成功创建用户",
  "code": "success"
}
```
- **失败响应**:
```json
{
  "msg": "验证码错误",
  "code": "Error"
}
```
```json
{
  "msg": "用户名已存在",
  "code": "Error"
}
```
```json
{
  "msg": "邮箱已存在",
  "code": "Error"
}
```

### 2. 忘记密码

#### 2.1 发送重置密码验证码
- **接口**: `/reset-password/send-code`
- **请求**:
```json
{
  "msg": "忘记密码发送验证码",
  "e_mail": "3115089759@qq.com"
}
```
- **成功响应**:
```json
{
  "msg": "成功发送验证码",
  "e_mail": "3115089759@qq.com",
  "code": "success"
}
```
- **失败响应**:
```json
{
  "msg": "邮箱不存在",
  "e_mail": "3115089759@qq.com",
  "code": "Error"
}
```

#### 2.2 确认验证码并重置密码
- **接口**: `/reset-password/verify-code`
- **请求**:
```json
{
  "msg": "提交新密码",
  "e_mail": "3115089759@qq.com",
  "new_passwd": "Huawei@123",
  "mail_code": "352021"
}
```
- **成功响应**:
```json
{
  "msg": "成功重置密码",
  "code": "success"
}
```
- **失败响应**:
```json
{
  "msg": "验证码错误",
  "code": "Error"
}
```

### 3. 用户登录

#### 3.1 账号密码登录
- **接口**: `/login/password`
- **请求** (用户名或邮箱登录):
```json
{
  "msg": "密码登录",
  "status": 0,
  "account": "闻人慕远z",
  "passwd": "Huawei@123"
}
```
- **说明**: `account`字段可以是用户名或邮箱地址，系统会自动识别
- **成功响应**:
```json
{
  "msg": "成功登录",
  "e_mail": "3115089759@qq.com",
  "user_name": "闻人慕远z",
  "role_id": 0,
  "code": "success"
}
```
- **失败响应**:
```json
{
  "msg": "账户或密码错误",
  "code": "Error"
}
```

#### 3.2 验证码登录
##### 3.2.1 发送登录验证码
- **接口**: `/login/send-code`
- **请求**:
```json
{
  "msg": "登录发送验证码",
  "e_mail": "3115089759@qq.com"
}
```
- **成功响应**:
```json
{
  "msg": "成功发送验证码",
  "e_mail": "3115089759@qq.com",
  "code": "success"
}
```
- **失败响应**:
```json
{
  "msg": "邮箱不存在",
  "e_mail": "3115089759@qq.com",
  "code": "Error"
}
```

##### 3.2.2 验证登录验证码
- **接口**: `/login/verify-code`
- **请求**:
```json
{
  "msg": "登录邮箱验证码",
  "e_mail": "3115089759@qq.com",
  "mail_code": "9965"
}
```
- **成功响应**:
```json
{
  "msg": "成功登录",
  "e_mail": "3115089759@qq.com",
  "user_name": "闻人慕远z",
  "role_id": 0,
  "code": "success"
}
```
- **失败响应**:
```json
{
  "msg": "登录验证码错误",
  "code": "Error"
}
```

### 4. 实现注意事项

#### 4.1 登录后用户信息存储
在成功登录后，系统会自动将用户信息存储到localStorage中：
```javascript
if (response.data.code === "success") {
  localStorage.setItem('userInfo', JSON.stringify({
    email: response.data.e_mail,
    username: response.data.user_name,
    role: response.data.role_id
  }));
}
```

#### 4.2 错误处理
所有API调用都包含完整的错误处理机制，会在控制台输出详细的错误信息并抛出异常供上层处理。

#### 4.3 验证码倒计时
发送验证码后会启动60秒倒计时，防止频繁请求：
- 点击发送验证码按钮后，按钮会显示倒计时状态
- 倒计时结束前按钮保持禁用状态
- 适用于注册、登录和重置密码的验证码发送

#### 4.4 路由配置
前端使用Vue Router进行页面导航，主要路由包括：
- `/login` - 登录页面
- `/register` - 注册页面
- `/forgot-password` - 重置密码页面
- `/index` - 登录成功后的主页面

#### 4.5 已知问题修复
- 修复了Login.vue中未定义的`authStore`引用问题
- 登录成功后的用户信息存储已通过localStorage实现

### 5. 获取用户数据
- **接口**: `/get-data`
- **请求**:
```json
{
  "msg": "获取数据",
  "e_mail": "3115089759@qq.com",
  "user_name": "闻人慕远z"
}
```
- **成功响应**:
```json
{
  "msg": "获取数据成功",
  "code": "success"
}
```

## Vue示例代码

以下是使用Axios在Vue中调用这些API的示例代码：

```javascript
import axios from 'axios';

// 使用代理路径，开发环境会自动代理到后端服务器
// 生产环境可以通过环境变量配置实际的API地址
const API_BASE_URL = '/api/auth';

const auth = axios.create({
    baseURL: API_BASE_URL,
});

// 请求拦截器
auth.interceptors.request.use(config => {
    return config;
}, error => {
    return Promise.reject(error);
});

export default {
  // 注册相关
  async sendRegisterCode(email) {
    try {
      const response = await auth.post('/register/send-code', {
        msg: "创建用户发送验证码",
        e_mail: email
      });
      return response.data;
    } catch (error) {
      console.error('发送注册验证码失败', error.response?.data);
      throw error;
    }
  },
  
  async registerUser(email, username, password, code) {
    try {
      const response = await auth.post('/register/verify-code', {
        msg: "创建用户确认验证码",
        e_mail: email,
        user_name: username,
        passwd: password,
        mail_code: code
      });
      return response.data;
    } catch (error) {
      console.error('注册失败', error.response?.data);
      throw error;
    }
  },
  
  // 重置密码相关
  async sendResetPasswordCode(email) {
    try {
      const response = await auth.post('/reset-password/send-code', {
        msg: "忘记密码发送验证码",
        e_mail: email
      });
      return response.data;
    } catch (error) {
      console.error('发送重置密码验证码失败', error.response?.data);
      throw error;
    }
  },
  
  async resetPassword(email, newPassword, code) {
    try {
      const response = await auth.post('/reset-password/verify-code', {
        msg: "提交新密码",
        e_mail: email,
        new_passwd: newPassword,
        mail_code: code
      });
      return response.data;
    } catch (error) {
      console.error('重置密码失败', error.response?.data);
      throw error;
    }
  },
  
  // 登录相关
  async loginWithUsername(account, password) {
    try {
      const response = await auth.post('/login/password', {
        msg: "密码登录",
        status: 0,
        account: account,
        passwd: password
      });
      // 登录成功可以在这里保存用户信息
      if (response.data.code === "success") {
        localStorage.setItem('userInfo', JSON.stringify({
          email: response.data.e_mail,
          username: response.data.user_name,
          role: response.data.role_id
        }));
      }
      return response.data;
    } catch (error) {
      console.error('登录失败', error.response?.data);
      throw error;
    }
  },
  
  async sendLoginCode(email) {
    try {
      const response = await auth.post('/login/send-code', {
        msg: "登录发送验证码",
        e_mail: email
      });
      return response.data;
    } catch (error) {
      console.error('发送登录验证码失败', error.response?.data);
      throw error;
    }
  },
  
  async loginWithCode(email, code) {
    try {
      const response = await auth.post('/login/verify-code', {
        msg: "登录邮箱验证码",
        e_mail: email,
        mail_code: code
      });
      // 登录成功可以在这里保存用户信息
      if (response.data.code === "success") {
        localStorage.setItem('userInfo', JSON.stringify({
          email: response.data.e_mail,
          username: response.data.user_name,
          role: response.data.role_id
        }));
      }
      return response.data;
    } catch (error) {
      console.error('验证码登录失败', error.response?.data);
      throw error;
    }
  },
  
  // 获取用户数据
  async getUserData(email, username) {
    try {
      const response = await auth.post('/get-data', {
        msg: "获取数据",
        e_mail: email,
        user_name: username
      });
      return response.data;
    } catch (error) {
      console.error('获取用户数据失败', error.response?.data);
      throw error;
    }
  }
}
```
