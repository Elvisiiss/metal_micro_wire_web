import axios from 'axios';

const API_BASE_URL = 'http://10.168.82.63:8080/api/user';
// const API_BASE_URL = 'http://10.168.80.56:8080/api/user';

const auth = axios.create({
    baseURL: API_BASE_URL,
});

// 请求拦截器，可以在这里添加token等全局headers
auth.interceptors.request.use(config => {
    // 如果需要token验证，可以在这里添加
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
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
    async loginWithUsername(username, password) {
        try {
            const response = await auth.post('/login/password', {
                msg: "登录用户名密码",
                status: 0,
                user_name: username,
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
            console.error('用户名登录失败', error.response?.data);
            throw error;
        }
    },

    async loginWithEmail(email, password) {
        try {
            const response = await auth.post('/login/password', {
                msg: "登录邮箱密码",
                status: 1,
                e_mail: email,
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
            console.error('邮箱登录失败', error.response?.data);
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
};
