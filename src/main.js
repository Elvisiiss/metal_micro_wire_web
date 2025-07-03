import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs' // 导入中文语言包
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import {useAuthStore} from "@/stores/auth.js";

const app = createApp(App)
const pinia = createPinia()

// 注册 Element Plus 并设置中文
app.use(ElementPlus, {
  locale: zhCn, // 设置全局中文语言包
  size: 'default' // 可选：设置组件默认尺寸
})

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)

// 在挂载前加载用户数据
const authStore = useAuthStore()
authStore.loadUserFromStorage()

app.mount('#app')
