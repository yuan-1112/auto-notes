<template>
  <!-- 历史记录卡片容器 -->
   <!-- 用户点击卡片
      触发 cardClick 事件
      跳转到对应的笔记概览页面 -->
  <div
      class="w-full bg-gray-100 dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-102 hover:shadow-xl cursor-pointer relative"
      @click="$emit('cardClick')"
  >
    <!-- 删除按钮 -->
    <div class="absolute top-6 right-6">
      <Button 
        outlined 
        icon="pi pi-trash" 
        @click.stop="deleteCache(props.id); router.push('/quickjump')" 
        severity="danger"
        :pt="{
          root: {
            class: '!border-red-500/30'
          }
        }"
      />
      <!-- click.stop 阻止事件冒泡，防止触发卡片的点击事件 -->
    </div>

    <!-- 卡片内容区域 -->
    <div class="p-6">
      <!-- 标题区域 -->
      <div class="flex gap-6 text-black dark:text-white items-center">
        <h2 class="text-2xl font-bold mb-2">{{ props.topic }}</h2>
        <!-- ID显示（已注释） -->
        <!-- <div>{{ props.id }}</div> -->
      </div>
      
      <!-- 摘要内容 -->
      <p class="text-gray-600 dark:text-gray-300 mb-4">{{ props.abstract }}</p>

      <!-- 底部信息栏 -->
      <div class="flex items-center justify-between">
        <!-- 时长显示 -->
        <div class="flex items-center">
          <ClockIcon class="h-5 w-5 text-gray-400 mr-2" />
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ i18n('Duration: ', '时长：') + formatTime(props.duration) }}</span>
        </div>

        <!-- 标签区域（已注释） -->
        <div class="flex flex-wrap gap-2">
          <!-- <span
              v-for="tag in props.tags"
              :key="tag"
              class="px-2 py-1 text-xs font-semibold text-indigo-300 bg-indigo-900 rounded-full"
          >
            {{ tag }}
          </span> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ClockIcon} from 'lucide-vue-next'  // 时钟图标组件
import Button from 'primevue/button'        // PrimeVue按钮组件
import {formatTime} from "../utils/utils.ts" // 时间格式化工具
import {useRouter} from "vue-router"        // Vue路由
import {deleteCache} from "../utils/cache.ts" // 缓存删除功能
import { useEnglish } from "../utils/useEnglish.ts" // 导入国际化hook

const router = useRouter()
const { i18n } = useEnglish()

// 组件属性定义
const props = defineProps({
  id: {
    type: Number,
    required: true      // 课程ID
  },
  topic: {
    type: String,
    required: true      // 课程主题
  },
  abstract: {
    type: String,
    required: true      // 课程摘要
  },
  duration: {
    type: Number,
    required: true      // 课程时长（秒）
  },
  tags: {
    type: Array,
    required: false     // 课程标签（可选）
  },
})

// 定义组件事件
defineEmits(['cardClick'])  // 卡片点击事件

</script>
