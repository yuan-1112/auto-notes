<script setup lang="ts">
/**
 * 加载提示组件
 * 
 * 该组件用于显示加载状态的弹窗提示，包括：
 * - 加载动画
 * - 主标题和副标题
 * - 支持深色/浅色模式
 */

import {Dialog, ProgressSpinner} from "primevue";  // 导入PrimeVue的对话框和加载动画组件
import { useEnglish } from "../utils/useEnglish.ts" // 导入国际化hook

// 定义加载状态的双向绑定
// 父组件可以通过v-model控制加载框的显示和隐藏
const loading = defineModel<boolean>();

// 定义组件属性
const props = defineProps({
  title: String,    // 加载提示的主标题
  subtitle: String, // 加载提示的副标题
})

const { i18n } = useEnglish()
</script>

<template>
  <!-- 加载对话框 -->
   <!--  v-model:visible="loading" // 控制对话框显示/隐藏
    modal                     // 启用模态框效果（背景遮罩）
    class="w-1/2 pt-8 pb-4"  // 设置对话框宽度和内边距 -->
  <Dialog 
    v-model:visible="loading" 
    modal                    
    class="w-1/2 pt-8 pb-4" 
    :pt="{
      header: {
        class: '!hidden'      // 隐藏对话框默认的标题栏
      },
    }"
  >
    <!-- 加载内容容器 -->
    <div class="flex items-center justify-center h-full">
      <div class="flex flex-col items-center">
        <!-- 加载动画图标 -->
        <ProgressSpinner class="!h-12 !w-12 !m-4" />
        
        <!-- 主标题文本 -->
        <div class="text-center mb-2 dark:text-white text-black font-bold">
          {{ props.title }}
        </div>
        
        <!-- 副标题文本 -->
        <div class="text-center text-sm dark:text-white/40 text-black/50">
          {{ props.subtitle }}
        </div>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
</style>