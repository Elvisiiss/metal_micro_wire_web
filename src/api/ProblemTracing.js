import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_BASE_URL = '/api/traceability';

const traceability = axios.create({
    baseURL: API_BASE_URL,
});

traceability.interceptors.request.use(config => {
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
    // 执行溯源分析
    async performAnalysis(params) {
        try {
            const response = await traceability.post('/analysis', params);
            return response.data;
        } catch (error) {
            console.error('执行溯源分析失败', error.response?.data);
            throw error;
        }
    },

    // 获取质量统计数据
    async getStatistics(params) {
        try {
            const response = await traceability.post('/statistics', params);
            return response.data;
        } catch (error) {
            console.error('获取质量统计数据失败', error.response?.data);
            throw error;
        }
    },

    // 识别质量问题
    async identifyIssues(params) {
        try {
            const response = await traceability.post('/issues', params);
            return response.data;
        } catch (error) {
            console.error('识别质量问题失败', error.response?.data);
            throw error;
        }
    },

    // 获取问题批次详情
    async getProblematicBatches(dimension, dimensionValue, startTime, endTime) {
        try {
            const response = await traceability.get('/batches/problematic', {
                params: { dimension, dimensionValue, startTime, endTime }
            });
            return response.data;
        } catch (error) {
            console.error('获取问题批次详情失败', error.response?.data);
            throw error;
        }
    },

    // 发送质量问题通知
    async sendNotifications(issues) {
        try {
            const response = await traceability.post('/notifications/send', issues);
            return response.data;
        } catch (error) {
            console.error('发送质量问题通知失败', error.response?.data);
            throw error;
        }
    },

    // 获取生产商质量排名
    async getManufacturerRanking(startTime, endTime, scenarioCode) {
        try {
            const response = await traceability.get('/ranking/manufacturers', {
                params: { startTime, endTime, scenarioCode }
            });
            return response.data;
        } catch (error) {
            console.error('获取生产商质量排名失败', error.response?.data);
            throw error;
        }
    },

    // 获取负责人绩效排名
    async getResponsiblePersonRanking(startTime, endTime, scenarioCode) {
        try {
            const response = await traceability.get('/ranking/responsible-persons', {
                params: { startTime, endTime, scenarioCode }
            });
            return response.data;
        } catch (error) {
            console.error('获取负责人绩效排名失败', error.response?.data);
            throw error;
        }
    },

    // 获取工艺类型质量分析
    async getProcessTypeAnalysis(startTime, endTime, scenarioCode) {
        try {
            const response = await traceability.get('/analysis/process-types', {
                params: { startTime, endTime, scenarioCode }
            });
            return response.data;
        } catch (error) {
            console.error('获取工艺类型质量分析失败', error.response?.data);
            throw error;
        }
    },

    // 获取生产机器质量分析
    async getProductionMachineAnalysis(startTime, endTime, scenarioCode) {
        try {
            const response = await traceability.get('/analysis/production-machines', {
                params: { startTime, endTime, scenarioCode }
            });
            return response.data;
        } catch (error) {
            console.error('获取生产机器质量分析失败', error.response?.data);
            throw error;
        }
    },

    // 全量历史数据质量统计分析
    async analyzeAllQualityIssues() {
        try {
            const response = await traceability.post('/analyze/all');
            return response.data;
        } catch (error) {
            console.error('全量历史数据质量统计分析失败', error.response?.data);
            throw error;
        }
    },

    // 基于时间窗口的质量统计分析
    async analyzeQualityIssuesByTimeWindow(startTime, endTime) {
        try {
            const response = await traceability.post('/analyze/time-window', {
                startTime, endTime
            });
            return response.data;
        } catch (error) {
            console.error('时间窗口质量统计分析失败', error.response?.data);
            throw error;
        }
    },

    // 自动检测并通知质量问题（默认时间窗口）
    async autoDetectAndNotifyQualityIssues() {
        try {
            const response = await traceability.post('/auto-detect');
            return response.data;
        } catch (error) {
            console.error('自动检测质量问题失败', error.response?.data);
            throw error;
        }
    },

    // 自动检测并通知质量问题（指定时间窗口）
    async autoDetectAndNotifyQualityIssuesWithTimeWindow(startTime, endTime) {
        try {
            const response = await traceability.post('/auto-detect/time-window', {
                startTime, endTime
            });
            return response.data;
        } catch (error) {
            console.error('指定时间窗口自动检测失败', error.response?.data);
            throw error;
        }
    },

    // 发送自定义邮件通知
    async sendCustomNotification(recipients, subject, content) {
        try {
            const response = await traceability.post('/notifications/send-custom', {
                recipients,
                subject,
                content,
                isHtml: false
            });
            return response.data;
        } catch (error) {
            console.error('发送自定义邮件通知失败', error.response?.data);
            throw error;
        }
    }
};
