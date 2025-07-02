import axios from 'axios';
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = '/api/device';

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
    // 获取设备列表（分页）
    async getDeviceList(page, size, status, sortBy, sortDirection) {
        try {
            const response = await auth.get('/list', {
                params: {
                    page,
                    size,
                    status,
                    sortBy,
                    sortDirection
                }
            });
            return response.data;
        } catch (error) {
            console.error('获取设备列表失败', error.response?.data);
            throw error;
        }
    },

    // 获取设备详情
    async getDeviceDetail(deviceId) {
        try {
            const response = await auth.get(`/${deviceId}`);
            return response.data;
        } catch (error) {
            console.error('获取设备详情失败', error.response?.data);
            throw error;
        }
    },

    // 创建设备
    async createDevice(deviceId) {
        try {
            const response = await auth.post('', {
                deviceId
            });
            return response.data;
        } catch (error) {
            console.error('创建设备失败', error.response?.data);
            throw error;
        }
    },

    // 删除设备
    async deleteDevice(deviceId) {
        try {
            const response = await auth.delete(`/${deviceId}`);
            return response.data;
        } catch (error) {
            console.error('删除设备失败', error.response?.data);
            throw error;
        }
    },

    // 控制设备启停
    async controlDevice(deviceId, targetStatus) {
        try {
            const response = await auth.post('/control', {
                deviceId,
                targetStatus
            });
            return response.data;
        } catch (error) {
            console.error('控制设备失败', error.response?.data);
            throw error;
        }
    },

    // 测试设备连接
    async testDeviceConnection(deviceId) {
        try {
            const response = await auth.post('/test-connection', {
                deviceId
            });
            return response.data;
        } catch (error) {
            console.error('测试设备连接失败', error.response?.data);
            throw error;
        }
    }
};
