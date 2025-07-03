import axios from 'axios';
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = '/api/wire-material';

const mwAPI = axios.create({
    baseURL: API_BASE_URL,
});

mwAPI.interceptors.request.use(config => {
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
    // 分页查询线材列表
    async getWireMaterialList(params) {
        try {
            const response = await mwAPI.get('/list', {
                params: {
                    page: params.page,
                    size: params.size,
                    batchNumberKeyword: params.batchNumberKeyword,
                    deviceIdKeyword: params.deviceIdKeyword,
                    manufacturerKeyword: params.manufacturerKeyword,
                    responsiblePersonKeyword: params.responsiblePersonKeyword,
                    processTypeKeyword: params.processTypeKeyword,
                    productionMachineKeyword: params.productionMachineKeyword,
                    scenarioCode: params.scenarioCode,
                    deviceCode: params.deviceCode,
                    sortBy: params.sortBy,
                    sortDirection: params.sortDirection
                }
            });
            return response.data;
        } catch (error) {
            console.error('获取线材列表失败', error.response?.data);
            throw error;
        }
    },

    // 根据批次号查询线材信息
    async getWireMaterialByBatchNumber(batchNumber) {
        try {
            const response = await mwAPI.get(`/${batchNumber}`);
            return response.data;
        } catch (error) {
            console.error('查询线材信息失败', error.response?.data);
            throw error;
        }
    },

    // 更新线材信息
    async updateWireMaterial(batchNumber, requestData) {
        try {
            const response = await mwAPI.put(`/${batchNumber}`, requestData);
            return response.data;
        } catch (error) {
            console.error('更新线材信息失败', error.response?.data);
            throw error;
        }
    },

    // 删除线材记录
    async deleteWireMaterial(batchNumber) {
        try {
            const response = await mwAPI.delete(`/${batchNumber}`);
            return response.data;
        } catch (error) {
            console.error('删除线材记录失败', error.response?.data);
            throw error;
        }
    }
};
