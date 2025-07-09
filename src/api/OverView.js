import axios from 'axios';
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = '/api/OverView';

const overviewApi = axios.create({
    baseURL: API_BASE_URL,
});

// 请求拦截器 - 添加认证token
overviewApi.interceptors.request.use(config => {
    const authStore = useAuthStore();
    const token = authStore.user?.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default {
    // 获取年度统计数据
    async getYearlyStatistics() {
        try {
            const response = await overviewApi.get('/year');
            return response.data;
        } catch (error) {
            console.error('获取年度统计数据失败', error.response?.data);
            throw new Error('获取年度统计数据失败');
        }
    },

    // 获取应用场景统计数据
    async getScenarioStatistics(timeRange) {
        try {
            const response = await overviewApi.get('/scenario', {
                params: { how: timeRange }
            });
            return response.data;
        } catch (error) {
            console.error('获取应用场景统计数据失败', error.response?.data);
            throw new Error('获取应用场景统计数据失败');
        }
    },

    // 获取系统总体统计数据
    async getOverallStatistics() {
        try {
            const response = await overviewApi.get('/count');
            return response.data;
        } catch (error) {
            console.error('获取系统总体统计数据失败', error.response?.data);
            throw new Error('获取系统总体统计数据失败');
        }
    },

    // 获取今日线材检测数据统计
    async getTodayCount() {
        try {
            const response = await overviewApi.get('/today_count');
            return response.data;
        } catch (error) {
            console.error('获取今日线材检测数据统计失败', error.response?.data);
            throw new Error('获取今日线材检测数据统计失败');
        }
    },
};
