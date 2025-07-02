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
                    const role_id = authStore.user?.role_id

                    // 按照优先级重定向
                    if (role_id === 999) return '/root'
                    if (role_id === 0 || role_id === 1) return '/index'
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
            path: '/questionnaire',
            name: 'Questionnaire',
            component: () => import('@/views/Public/questionnaire.vue')
        },
        {
            path: '/suggestion-and-feedback',
            name: 'SuggestionAndFeedback',
            component: () => import('@/views/Public/SuggestionAndFeedback.vue')
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
