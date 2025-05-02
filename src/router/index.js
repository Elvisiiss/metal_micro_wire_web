import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import ForgotPasswordView from '../views/ForgotPasswordView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/', component: import('../views/Home.vue')},
    {path: '/notFound', component: import('../views/404.vue')},
    {path: '/:pathMatch(.*)', redirect:'/notFound'},
    {path: '/login', name: 'login', component: LoginView},
    {path: '/register', name: 'register', component: RegisterView},
    {path: '/index', name: 'indexPage', component: import('../views/404.vue')},
    {path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView}
  ],
})



export default router
