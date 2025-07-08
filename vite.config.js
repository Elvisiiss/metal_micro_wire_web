import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0', // 监听所有 IPv4 地址
    port: 5173,      // 指定端口（默认 5173）
    strictPort: true, // 如果端口被占用，直接退出
    proxy: {
      '/api': {
        target: 'http://10.168.82.63:8081',
        // target: 'http://10.168.80.56:8080',
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})


// netstat -ano | findstr "5173"
// TCP    0.0.0.0:5173           0.0.0.0:0              LISTENING       12345
// taskkill /PID 12345 /F
