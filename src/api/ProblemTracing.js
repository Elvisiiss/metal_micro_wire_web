import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

// 创建axios实例
const api = axios.create({
    baseURL: '/api/quality-traceability',
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(config => {
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
    // 通用溯源分析
    async analyze(params) {
        return api.post('/analyze', params);
    },

    // 生产商层面分析
    async analyzeByManufacturer(params) {
        return api.post('/analyze/manufacturer', params);
    },

    // 工艺层面分析
    async analyzeByProcess(params) {
        return api.post('/analyze/process', params);
    },

    // 责任人层面分析
    async analyzeByResponsiblePerson(params) {
        return api.post('/analyze/responsible-person', params);
    },

    // 生产机器层面分析
    async analyzeByProductionMachine(params) {
        return api.post('/analyze/production-machine', params);
    },

    // 全层级分析
    async analyzeAllLevels(params) {
        return api.post('/analyze/all-levels', params);
    },

    // 获取快速概览
    async getQuickOverview(params) {
        return api.get('/quick-overview', { params });
    },

    // 获取高风险项目
    async getHighRiskItems(params) {
        return api.get('/high-risk-items', { params });
    },

    // 评估链分析
    async getEvaluationChainAnalysis(params) {
        return api.post('/evaluation-chain-analysis', params);
    },

    // 获取评估不一致性
    async getEvaluationInconsistency(params) {
        return api.get('/evaluation-inconsistency', { params });
    },

    // 获取筛选选项
    async getFilterOptions() {
        return Promise.resolve({
            manufacturers: ['生产商A', '生产商B', '生产商C'],
            processTypes: ['拉丝工艺', '退火工艺', '镀锡工艺'],
            responsiblePersons: ['张三', '李四', '王五'],
            productionMachines: ['设备001', '设备002', '设备003'],
            scenarioCodes: ['01', '02', '03'],
            finalEvaluationResults: ['PASS', 'FAIL', 'PENDING_REVIEW']
        });
    }
};
