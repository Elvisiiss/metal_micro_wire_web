import {createRouter, createWebHistory} from 'vue-router'

import LoginView from '../views/Auth/Login.vue';
import RegisterView from '../views/Auth/Register.vue';
import ForgotPasswordView from '../views/Auth/ResetPassword.vue';
import Landing from '../views/Landing.vue';
import {useAuthStore} from "@/stores/auth.js";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: (to) => {
                const authStore = useAuthStore()
                if (authStore.isAuthenticated) {
                    return '/data-screen'
                }else{
                    return '/Landing'
                }
            }
        },
        {
            path: '/wire',
            name: 'WireView',
            component: () => import('@/views/public/WireView.vue'),
            props: (route) => ({ info: route.query.info })
        },
        {
            path: '/notFound',
            component: import('../views/404.vue')
        },
        {
            path: '/data-screen',
            name: 'DataScreen',
            component: () => import('@/views/IndexPage/DataScreen.vue') // 新建独立组件
        },
        {
            path: '/:pathMatch(.*)',
            redirect: '/notFound'
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView
        },
        {
            path: '/register',
            name: 'register',
            component: RegisterView
        },
        {
            path: '/forgot-password',
            name: 'forgot-password',
            component: ForgotPasswordView
        },
        {
            path: '/Landing',
            name: 'Landing',
            component: Landing
        },
        {
            path: '/index',
            name: 'indexPage',
            component: import('../views/IndexPage/Dashboard.vue')
        },
        {
            path: '/user-settings',
            name: 'UserSettings',
            component: () => import('@/views/Public/UserSettings.vue')
        },
        {
            path: '/help-center',
            name: 'HelpCenter',
            component: () => import('@/views/Public/Helps.vue')
        },
        {
            path: '/root',
            name: 'rootIndexPage',
            component: () => import('@/views/Root/RootDashboard.vue')
        },
    ],
})


export default router
