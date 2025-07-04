import axios from 'axios';
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = '/api/scenario';

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

    async getScenarioList(page, size, wireType, scenarioNameKeyword, sortBy, sortDirection) {
        try {
            const response = await auth.get('/list', {
                params: {
                    page,
                    size,
                    wireType,
                    scenarioNameKeyword,
                    sortBy,
                    sortDirection
                }
            });
            return response.data;
        } catch (error) {
            console.error('获取应用场景列表失败', error.response?.data);
            throw error;
        }
    },

    // 根据应用场景编号查询
    async getScenarioByCode(scenarioCode) {
        try {
            const response = await auth.get(`/${scenarioCode}`);
            return response.data;
        } catch (error) {
            console.error('获取应用场景详情失败', error.response?.data);
            throw error;
        }
    },

    // 根据线材类型获取应用场景
    async getScenariosByWireType(wireType) {
        try {
            const response = await auth.get(`/wire-type/${wireType}`);
            return response.data;
        } catch (error) {
            console.error('根据线材类型查询失败', error.response?.data);
            throw error;
        }
    },

    // 创建应用场景
    async createScenario(scenarioData) {
        try {
            const response = await auth.post('', scenarioData);
            return response.data;
        } catch (error) {
            console.error('创建应用场景失败', error.response?.data);
            throw error;
        }
    },

    // 更新应用场景
    async updateScenario(scenarioCode, updateData) {
        try {
            const response = await auth.put(`/${scenarioCode}`, updateData);
            return response.data;
        } catch (error) {
            console.error('更新应用场景失败', error.response?.data);
            throw error;
        }
    },

    // 删除应用场景
    async deleteScenario(scenarioCode) {
        try {
            const response = await auth.delete(`/${scenarioCode}`);
            return response.data;
        } catch (error) {
            console.error('删除应用场景失败', error.response?.data);
            throw error;
        }
    },

    // 新增：重新评估应用场景下的所有线材数据
    async reEvaluateScenario(scenarioCode) {
        try {
            const response = await auth.post(`/${scenarioCode}/re-evaluate`);
            return response.data;
        } catch (error) {
            console.error('重新评估失败', error.response?.data);
            throw error;
        }
    }
};
