<script setup lang="ts">
// 从 Vue 中导入必要的组合式 API
import {onMounted, ref} from "vue";
// 导入加载组件
import Loading from "./components/Loading.vue";
// 导入服务相关的工具函数
import {bootService, checkUvInstalled, installUv} from "./utils/serviceDeps.ts";
import { useEnglish } from "./utils/useEnglish.ts";

// 创建加载状态的响应式引用
const loading = ref(false)
// 用于防止重复启动服务
let tried = false;
const { i18n } = useEnglish();

// 组件挂载时执行
onMounted(async () => {
  // 检查 uv 是否已安装
  if (!await checkUvInstalled()) {
    console.log("Installing uv...")
    // 如果未安装，则安装 uv
    await installUv(loading);
  }
  // 防止重复启动服务
  if (tried) {
    return
  }
  // 启动服务
  await bootService(loading);
  tried = true;
})
</script>

<template>
  <!-- Toast 组件，用于显示通知，位于右下角 -->
  <Toast position="bottom-right"></Toast>
  
  <!-- 加载提示组件 -->
  <Loading 
    v-model="loading" 
    :title="i18n('Starting AI model service...', '正在启动大模型服务...')"
    :subtitle="i18n('First launch may require installing dependencies, please wait...', '首次启动时可能需要安装依赖，请耐心等待...')"
  ></Loading>

  <!-- 主要内容区域，支持暗色模式 -->
  <div class="dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 bg-white min-h-screen">
    <!-- 路由视图，带有过渡效果 -->
    <RouterView v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component"/>
      </transition>
    </RouterView>
  </div>
</template>

<style>
/* 淡入淡出过渡效果的样式 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
