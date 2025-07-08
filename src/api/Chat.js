import axios from 'axios';
import { useAuthStore } from '@/stores/auth'

// 创建 axios 实例
const chatAPI = axios.create({
    baseURL: '/api/chat',
});

// 请求拦截器 - 添加认证头
chatAPI.interceptors.request.use(config => {
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
    // 发送消息
    async sendMessage(sessionId, message) {
        try {
            const response = await chatAPI.post('/message', {
                sessionId,
                message
            });
            return response.data;
        } catch (error) {
            console.error('发送消息失败', error.response?.data);
            throw error;
        }
    },

    // 创建新会话
    async createSession(title = '新对话') {
        try {
            const response = await chatAPI.post('/session', {
                title
            });
            return response.data;
        } catch (error) {
            console.error('创建会话失败', error.response?.data);
            throw error;
        }
    },

    // 获取用户会话列表
    async getUserSessions() {
        try {
            const response = await chatAPI.get('/sessions');
            return response.data;
        } catch (error) {
            console.error('获取会话列表失败', error.response?.data);
            throw error;
        }
    },

    // 获取聊天历史
    async getChatHistory(sessionId) {
        try {
            const response = await chatAPI.get(`/history/${sessionId}`);
            return response.data;
        } catch (error) {
            console.error('获取聊天历史失败', error.response?.data);
            throw error;
        }
    },

    // 删除会话
    async deleteSession(sessionId) {
        try {
            const response = await chatAPI.delete(`/session/${sessionId}`);
            return response.data;
        } catch (error) {
            console.error('删除会话失败', error.response?.data);
            throw error;
        }
    },

    // 更新会话标题
    async updateSessionTitle(sessionId, title) {
        try {
            const response = await chatAPI.put(`/session/${sessionId}/title`, null, {
                params: { title }
            });
            return response.data;
        } catch (error) {
            console.error('更新标题失败', error.response?.data);
            throw error;
        }
    },

    // 清理过期会话
    async cleanupExpiredSessions() {
        try {
            const response = await chatAPI.delete('/sessions/cleanup');
            return response.data;
        } catch (error) {
            console.error('清理会话失败', error.response?.data);
            throw error;
        }
    }
};
