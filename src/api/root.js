import axios from 'axios';
import { useAuthStore } from '@/stores/auth'

// 使用代理路径，实际请求会被代理到后端服务器
const API_BASE_URL = '/api/root';

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
    // 获取用户列表（分页）
    async getUserList(page, size, keyword, sortBy, sortDir) {
        try {
            const response = await auth.get('/users', {
                params: {
                    page,
                    size,
                    keyword,
                    sortBy,
                    sortDir
                }
            });
            return response.data;
        } catch (error) {
            console.error('获取用户列表失败', error.response?.data);
            throw error;
        }
    },

    // 用户提权（设置角色）
    async updateUserRole(userId, roleId) {
        try {
            const response = await auth.put('/users/role', {
                userId,
                roleId
            });
            return response.data;
        } catch (error) {
            console.error('用户提权失败', error.response?.data);
            throw error;
        }
    },

    // 禁用/启用用户
    async updateUserStatus(userId, status) {
        try {
            const response = await auth.put('/users/status', {
                userId,
                status
            });
            return response.data;
        } catch (error) {
            console.error('用户状态更新失败', error.response?.data);
            throw error;
        }
    },

    // 批量用户操作
    async batchUpdateUsers(action, userIds) {
        try {
            const response = await auth.put('/users/batch', null, {
                params: {
                    action,
                    userIds
                }
            });
            return response.data;
        } catch (error) {
            console.error('批量用户操作失败', error.response?.data);
            throw error;
        }
    }
};
