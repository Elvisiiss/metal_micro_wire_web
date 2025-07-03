// SystemConfig.js
import axios from 'axios';
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// 请求拦截器添加token
api.interceptors.request.use(config => {
    const authStore = useAuthStore();
    const token = authStore.user?.token;
    if (token) {
        config.headers.token = token;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default {
    // 获取监听器状态
    async getListenerStatus() {
        try {
            const response = await api.get('/iot/status');
            return response.data;
        } catch (error) {
            console.error('获取监听器状态失败', error.response?.data);
            throw error;
        }
    },

    // 启动监听器
    async startListener() {
        try {
            const response = await api.post('/iot/start');
            return response.data;
        } catch (error) {
            console.error('启动监听器失败', error.response?.data);
            throw error;
        }
    },

    // 停止监听器
    async stopListener() {
        try {
            const response = await api.post('/iot/stop');
            return response.data;
        } catch (error) {
            console.error('停止监听器失败', error.response?.data);
            throw error;
        }
    },

    // 健康检查
    async healthCheck() {
        try {
            const response = await api.get('/health');
            return response.data;
        } catch (error) {
            console.error('健康检查失败', error.response?.data);
            throw error;
        }
    }
};
