<template>
  <div class="wire-container">
    <h1>示例代码</h1>
    <div v-if="info" class="info-display">
      <p>接收到的info: <strong>{{ info }}</strong></p>
      <p>Info长度: {{ infoLength }}</p>
    </div>
    <div v-else class="no-info">
      <p>没有info</p>
      <p>示例： http://10.168.82.63:5173/wire?info=Cu0120250629010010001</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// 通过props接收路由传递的info参数
const props = defineProps({
  info: {
    type: String,
    default: ''
  }
});

// 计算属性
const infoLength = computed(() => `${props.info.length} characters`);
</script>

<style scoped>
.wire-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.info-display {
  background: white;
  padding: 1.5rem;
  border-radius: 6px;
  margin-top: 1rem;
}

.no-info {
  background: #fff8e1;
  padding: 1.5rem;
  border-radius: 6px;
  margin-top: 1rem;
  color: #ff6f00;
}

h1 {
  color: #2c3e50;
  border-bottom: 2px solid #42b983;
  padding-bottom: 0.5rem;
}

p {
  margin: 0.8rem 0;
  font-size: 1.1rem;
}

strong {
  color: #42b983;
  word-break: break-all;
}
</style>
