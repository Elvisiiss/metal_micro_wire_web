import axios from 'axios';

const api = axios.create({
    baseURL: 'http://10.168.80.56:8081',
});

// 请求拦截器，添加token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default {
    // 用户注册
    async register(userData) {
        try {
            const response = await api.post('/api/users/register', userData);
            localStorage.setItem('token', response.data.token);
            return response.data;
        } catch (error) {
            console.error('注册失败', error.response?.data);
            throw error;
        }
    },

    // 用户登录
    async login(credentials) {
        try {
            const response = await api.post('/api/users/login', credentials);
            localStorage.setItem('token', response.data.token);
            return response.data;
        } catch (error) {
            console.error('登录失败', error.response?.data);
            throw error;
        }
    },

    // 发送验证码
    async sendVerificationCode(email, operationType) {
        try {
            const response = await api.post('/api/users/send-verification-code', {
                email,
                msg: operationType
            });
            return response.data;
        } catch (error) {
            console.error('发送验证码失败', error.response?.data);
            throw error;
        }
    }
};