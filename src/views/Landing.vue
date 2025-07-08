<template>
  <div class="font-sans antialiased text-gray-800">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <i class="fas fa-ruler-combined text-2xl text-blue-500 mr-2"></i>
              <span class="text-xl font-semibold text-gray-800">微丝检测</span>
            </div>
          </div>
          <div class="hidden md:ml-6 md:flex md:items-center md:space-x-8">
            <a href="#features" class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">功能特点</a>
            <a href="#applications" class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">应用场景</a>
            <a href="#templates" class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">检测模板</a>
            <a href="#testimonials" class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">用户评价</a>
            <a href="#pricing" class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">价格方案</a>
          </div>
          <div class="flex items-center">
            <a class="btn-gradient text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition no-underline">
              <router-link :to="whereTo" class="...">立即使用</router-link>
            </a>
          </div>
        </div>
      </div>
    </nav>

    <!-- 英雄区域 -->
    <section class="gradient-bg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div class="md:flex items-center">
          <div class="md:w-1/2 mb-10 md:mb-0">
            <h1 class="text-4xl md:text-5xl font-bold text-gray-800 leading-tight mb-6">
              精准测量每一根<br>金属微细线材的品质
            </h1>
            <p class="text-lg text-gray-600 mb-8">
              金属微细线材综合检测平台，提供线径、拉伸强度、电导率等全方位检测，云端数据管理，让您对产品质量了如指掌。
            </p>
            <div class="flex space-x-4">
              <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <a class="btn-gradient text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition no-underline">
                  <router-link :to="whereTo" class="...">马上开始</router-link>
                </a>
              </div>
            </div>
          </div>
          <div class="md:w-1/2 flex justify-center">
            <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
                 alt="金属线材检测"
                 class="rounded-xl shadow-xl w-full max-w-md border-4 border-white">
          </div>
        </div>
      </div>
    </section>

    <!-- 合作伙伴 -->
    <section class="bg-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-center text-gray-500 mb-8">信任我们的行业领先企业</p>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-center">
          <div class="flex justify-center">
            <i class="fas fa-industry text-4xl text-gray-400"></i>
          </div>
          <div class="flex justify-center">
            <i class="fas fa-bolt text-4xl text-gray-400"></i>
          </div>
          <div class="flex justify-center">
            <i class="fas fa-microchip text-4xl text-gray-400"></i>
          </div>
          <div class="flex justify-center">
            <i class="fas fa-car text-4xl text-gray-400"></i>
          </div>
          <div class="flex justify-center">
            <i class="fas fa-robot text-4xl text-gray-400"></i>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能特点 -->
    <section id="features" class="bg-gray-50 py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-800 mb-4">全面检测功能</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            我们的平台提供金属微细线材全方位的性能检测，确保每一根线材都符合您的生产需求
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="feature in features" :key="feature.title" class="bg-white p-8 rounded-xl shadow-sm card-hover">
            <div class="feature-icon mb-6">
              <i :class="feature.icon" class="text-2xl text-blue-500"></i>
            </div>
            <h3 class="text-xl font-semibold mb-3">{{ feature.title }}</h3>
            <p class="text-gray-600">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 应用场景 -->
    <section id="applications" class="bg-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-800 mb-4">广泛应用场景</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            金属微细线材在各行业中的关键应用，我们的检测平台为您提供品质保障
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <img src="http://www.youtow.cn/uploads/allimg/20190429/news-image0093.jpg"
                 alt="应用场景"
                 class="rounded-xl shadow-lg w-full">
          </div>
          <div>
            <div v-for="(app, index) in applications" :key="index" class="mb-6 last:mb-0">
              <div class="flex items-start">
                <div class="flex-shrink-0 bg-blue-100 rounded-lg p-2 mr-4">
                  <i :class="app.icon" class="text-blue-500 text-lg"></i>
                </div>
                <div>
                  <h3 class="text-lg font-semibold mb-1">{{ app.title }}</h3>
                  <p class="text-gray-600">{{ app.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 检测模板 -->
    <section id="templates" class="bg-gray-50 py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-800 mb-4">专业检测模板</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            针对不同金属材料和用途，我们提供专业化的检测模板，一键生成完整报告
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="template in templates" :key="template.name" class="bg-white rounded-xl overflow-hidden shadow-sm card-hover">
            <img :src="template.image" :alt="template.name" class="w-full h-48 object-cover">
            <div class="p-6">
              <h3 class="text-xl font-semibold mb-2">{{ template.name }}</h3>
              <p class="text-gray-600 mb-4">{{ template.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 用户评价 -->
    <section id="testimonials" class="bg-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-800 mb-4">用户评价</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            来自各行业客户的真实反馈，见证我们的专业与可靠
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="testimonial in testimonials" :key="testimonial.name" class="bg-gray-50 p-8 rounded-xl">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <i class="fas fa-user text-blue-500"></i>
              </div>
              <div>
                <h4 class="font-semibold">{{ testimonial.name }}</h4>
                <p class="text-gray-500 text-sm">{{ testimonial.position }}</p>
              </div>
            </div>
            <p class="text-gray-700 italic">"{{ testimonial.quote }}"</p>
            <div class="flex mt-4 text-yellow-400">
              <i v-for="i in 5" :key="i" class="fas fa-star"></i>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA区域 -->
    <section class="gradient-bg py-20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-gray-800 mb-6">准备好提升您的线材检测效率了吗？</h2>
        <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <a class="btn-gradient text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition no-underline">
            <router-link :to="whereTo" class="...">立即使用</router-link>
          </a>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="bg-gray-800 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center mb-4">
              <i class="fas fa-ruler-combined text-2xl text-blue-400 mr-2"></i>
              <span class="text-xl font-semibold">微丝检测</span>
            </div>
            <p class="text-gray-400">
              专业的金属微细线材综合检测平台，为您的产品质量保驾护航。
            </p>
          </div>

          <div>
            <h3 class="text-lg font-semibold mb-4">产品</h3>
            <ul class="space-y-2">
              <li><a href="#" class="text-gray-400 hover:text-white transition">功能特点</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition">应用场景</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition">检测模板</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition">价格方案</a></li>
            </ul>
          </div>

          <div>
            <h3 class="text-lg font-semibold mb-4">资源</h3>
            <ul class="space-y-2">
              <li><a href="#" class="text-gray-400 hover:text-white transition">文档中心</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition">API接口</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition">常见问题</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition">博客</a></li>
            </ul>
          </div>

          <div>
            <h3 class="text-lg font-semibold mb-4">联系我们</h3>
            <ul class="space-y-2">
              <li class="flex items-center text-gray-400"><i class="fas fa-envelope mr-2"></i> 3115089759@qq.com</li>
              <li class="flex items-center text-gray-400"><i class="fas fa-phone mr-2"></i> 182-7036-5579</li>
              <li class="flex items-center text-gray-400"><i class="fas fa-map-marker-alt mr-2"></i> 江西省赣州市 赣南科技学院</li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p class="text-gray-400 mb-4 md:mb-0">© 2025 微丝检测平台. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AuthAPI from "@/api/auth.js";
import {useAuthStore} from "@/stores/auth.js";
const whereTo = ref("/login")
const authStore = useAuthStore();
onMounted(async () => {
  const r = ref()
  try{
    r.value = (await AuthAPI.DetermineToken(authStore.user?.token)).data
  }catch(error){}
  if (r.value === 0){ whereTo.value = "/index"}
  if (r.value === 1){ whereTo.value = "/index"}
  if (r.value === 999){ whereTo.value = "/root"}
})

const features = ref([
  {
    icon: 'fas fa-ruler',
    title: '线径测量',
    description: '高精度激光测量技术，可检测0.01cm级别的线径变化，确保尺寸精确度'
  },
  {
    icon: 'fas fa-weight-hanging',
    title: '拉伸强度',
    description: '自主研发的拉伸强度检测模块，精准测量金属线的抗拉性能'
  },
  {
    icon: 'fas fa-bolt',
    title: '电导率检测',
    description: '非接触式电导率测量，快速评估金属线的导电性能'
  },
  {
    icon: 'fas fa-weight',
    title: '单位重量',
    description: '精确测量单位长度的重量，为生产工艺提供关键数据'
  },
  {
    icon: 'fas fa-cloud-upload-alt',
    title: '云端数据',
    description: '所有检测数据自动上传云端，构建产品质量数据库'
  },
  {
    icon: 'fas fa-chart-line',
    title: '数据分析',
    description: '可视化数据分析工具，帮助您发现生产过程中的潜在问题'
  }
]);

const applications = ref([
  {
    icon: 'fas fa-microchip',
    title: '电子元器件',
    description: '精密电子元器件对金属线的直径和电导率有严格要求'
  },
  {
    icon: 'fas fa-car',
    title: '汽车线束',
    description: '汽车线束需要确保每根导线的拉伸强度和耐久性'
  },
  {
    icon: 'fas fa-robot',
    title: '工业机器人',
    description: '机器人内部布线需要高精度检测确保长期稳定运行'
  },
  {
    icon: 'fas fa-medal',
    title: '军工航天',
    description: '军工航天领域对金属线材的性能要求极为严格'
  }
]);

const templates = ref([
  {
    name: '铜线标准检测',
    description: '适用于普通铜线的全面性能检测模板',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: '合金线专项检测',
    description: '针对特殊合金线材的专业检测方案',
    image: 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: '微细线材检测',
    description: '专为直径小于0.1mm的微细线材设计的检测流程',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80'
  }
]);

const testimonials = ref([
  {
    name: '张工',
    position: '某电子元器件厂 质量总监',
    quote: '使用微丝检测平台后，我们的产品不良率下降了35%，客户投诉减少了60%。'
  },
  {
    name: '李经理',
    position: '某汽车线束公司 生产经理',
    quote: '检测效率提升了3倍，数据自动上传云端，大大减少了人工记录的错误。'
  },
  {
    name: '王博士',
    position: '某研究院 材料实验室主任',
    quote: '拉伸强度检测模块的精度达到了我们的研究要求，数据可靠性很高。'
  }
]);

const pricingPlans = ref([
  {
    name: '基础版',
    description: '适合小型实验室和初创企业',
    price: '2999',
    period: '月',
    featured: false,
    features: [
      '每日100次检测',
      '5种标准检测模板',
      '基础数据分析',
      '7天数据存储',
      '邮件支持'
    ]
  },
  {
    name: '专业版',
    description: '适合中型生产企业',
    price: '8999',
    period: '月',
    featured: true,
    features: [
      '每日500次检测',
      '15种专业检测模板',
      '高级数据分析',
      '30天数据存储',
      '专属客户经理',
      '优先技术支持'
    ]
  },
  {
    name: '企业版',
    description: '适合大型制造企业',
    price: '24999',
    period: '月',
    featured: false,
    features: [
      '无限次检测',
      '所有检测模板',
      '定制化分析报告',
      '90天数据存储',
      '专属技术支持团队',
      'API集成',
      '定制开发服务'
    ]
  }
]);
</script>

<style>
.gradient-bg {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%);
}
.btn-gradient {
  background: linear-gradient(90deg, #3b82f6 0%, #6366f1 100%);
}
.card-hover {
  transition: all 0.3s ease;
}
.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}
.feature-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
}
</style>
