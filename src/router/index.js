import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../views/Auth/Login.vue';
import RegisterView from '../views/Auth/Register.vue';
import ForgotPasswordView from '../views/Auth/ResetPassword.vue';
import Landing from '../views/Landing.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/', component: import('../views/Landing.vue')},
    {path: '/notFound', component: import('../views/404.vue')},
    {path: '/:pathMatch(.*)', redirect:'/notFound'},
    {path: '/login', name: 'login', component: LoginView},
    {path: '/register', name: 'register', component: RegisterView},
    {path: '/index', name: 'indexPage', component: import('../views/IndexPage/Dashboard.vue')},
    {path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView},
    {path: '/Landing', name: 'Landing', component: Landing}
  ],
})



export default router
