import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_BASE_URL = '/api/dashboard';

const auth = axios.create({
    baseURL: API_BASE_URL,
});

auth.interceptors.request.use(config => {
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
    // 获取大屏关键指标数据
    async getDashboardSummary() {
        try {
            const response = await auth.get('/summary');
            return response.data;
        } catch (error) {
            console.error('获取大屏数据失败', error.response?.data);
            throw error;
        }
    },

    // 获取合格率趋势数据
    async getPassRateTrend() {
        try {
            const response = await auth.get('/pass-rate-trend');
            return response.data;
        } catch (error) {
            console.error('获取合格率趋势失败', error.response?.data);
            throw error;
        }
    },

    // 获取场景分布数据
    async getScenarioDistribution() {
        try {
            const response = await auth.get('/scenario-distribution');
            return response.data;
        } catch (error) {
            console.error('获取场景分布失败', error.response?.data);
            throw error;
        }
    },

    // 获取设备状态数据
    async getDeviceStatus() {
        try {
            const response = await auth.get('/device-status');
            return response.data;
        } catch (error) {
            console.error('获取设备状态失败', error.response?.data);
            throw error;
        }
    }
};
