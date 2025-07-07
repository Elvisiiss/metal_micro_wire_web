import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_BASE_URL = '/api/user';

const userAPI = axios.create({
    baseURL: API_BASE_URL,
});

// 请求拦截器：添加token
userAPI.interceptors.request.use(config => {
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
    // 获取用户资料
    getUserProfile() {
        return userAPI.get('/profile');
    },

    // 上传头像
    uploadAvatar(file) {
        const formData = new FormData();
        formData.append('file', file);
        return userAPI.post('/avatar/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // 删除头像
    deleteAvatar() {
        return userAPI.delete('/avatar');
    },

    // 修改用户名
    updateUsername(newUsername) {
        return userAPI.put('/username', {
            newUsername
        });
    }
};
