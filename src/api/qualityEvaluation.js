import axios from 'axios';
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = '/api/quality';

const qualityAPI = axios.create({
    baseURL: API_BASE_URL,
});

qualityAPI.interceptors.request.use(config => {
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
    // 单个预测
    predictSingle(data) {
        return qualityAPI.post('/predict', data)
    },

    // 批量预测
    predictBatch(data) {
        return qualityAPI.post('/predict/batch', data)
    },

    // 健康检查
    checkHealth() {
        return qualityAPI.get('/health')
    },

    // 重新评估场景
    reEvaluateScenario(scenarioCode) {
        return qualityAPI.post(`/scenario/${scenarioCode}/re-evaluate`)
    },

    // 获取待审核列表
    getPendingReview(params) {
        return qualityAPI.get('/pending-review', { params })
    },

    // 获取已完成列表
    getCompleted(params) {
        return qualityAPI.get('/completed', { params })
    },

    // 人工审核确认
    confirmResult(data) {
        return qualityAPI.post('/confirm-result', null, {
            params: data,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
    },

    // 手动评估线材
    evaluateWire(batchNumber) {
        return qualityAPI.post(`/wire-material/${batchNumber}/evaluate`)
    }
}
