<script setup lang="ts">
// 导入工具函数和组件
import {success} from "../utils/utils.ts";
import {onMounted, ref, watch} from "vue";
import Loading from "../components/Loading.vue";
// 导入服务相关的工具函数
import {bootService, installUv} from "../utils/serviceDeps.ts";
// 导入缓存相关的工具函数
import {
  clearCache,
  getFakeService,
  getIsBeta,
  getIsEnglish,
  setFakeService,
  setIsBeta,
  setIsEnglish
} from "../utils/cache.ts";
import {useRouter} from "vue-router";
import ToggleSwitch from 'primevue/toggleswitch';
import { info } from "../utils/utils.ts"
import { useEnglish } from "../utils/useEnglish.ts"

// 定义响应式状态
const loading = ref(false)          // 加载状态
const router = useRouter()          // 路由实例
const { i18n } = useEnglish()      // 国际化函数

// 各种设置的响应式状态
const isFakeService = ref(false);   // 是否使用伪造服务端
const isEnglish = ref(false);       // 是否使用英文界面
const isBeta = ref(false);          // 是否启用测试功能
const isDark = ref(document.documentElement.classList.contains("app-dark")); // 是否使用深色模式

// 监听伪造服务端设置的变化
watch(isFakeService, async (newValue, _) => {
    await setFakeService(newValue);
})

// 监听语言设置的变化
watch(isEnglish, async (newValue, _) => {
    await setIsEnglish(newValue);
})

// 监听测试功能设置的变化
watch(isBeta, async (newValue, _) => {
   await setIsBeta(newValue);
})

// 监听深色模式设置的变化
watch(isDark, async (newValue, _) => {
  if (newValue) {
    document.documentElement.classList.add("app-dark");
  } else {
    document.documentElement.classList.remove("app-dark");
  }
});

// 重新安装 uv 依赖
const reinstallUv = async () => {
  await installUv(loading);
}

// 重新启动服务端
const rebootService = async () => {
  await bootService(loading);
}

// 清除所有缓存
const clearAllCache = async () => {
  await clearCache();
  await success("缓存清除成功!")
}

// 组件挂载时初始化设置状态
onMounted(async () => {
  isFakeService.value = await getFakeService();
  isEnglish.value = await getIsEnglish();
  isBeta.value = await getIsBeta();
})
</script>

<template>
  <div>
    <!-- 加载提示组件 -->
    <Loading v-model="loading" :title="i18n('Processing...', '操作中，请稍后...')"></Loading>
    
    <!-- 设置页面主容器 -->
    <div class="rounded flex items-center justify-center min-h-screen">
      <!-- 设置卡片 -->
      <div class="p-8 dark:bg-black/20 bg-black/5 rounded-lg flex flex-col dark:text-white text-black">
        <!-- 标题 -->
        <div class="text-center mb-4 font-bold text-2xl">
          {{ i18n('Settings', '设置') }}
        </div>
        
        <!-- UV 依赖安装选项 -->
        <div class="flex items-center mb-4">
          <div class="mr-2">{{ i18n('If dependencies fail to install on first launch, try:', '首次进入软件时，如果依赖安装失败，可尝试：') }}</div>
          <Button severity="success" icon="pi pi-wrench" :label="i18n('Reinstall UV', '重新安装uv')" size="small" @click="reinstallUv" />
        </div>
        
        <!-- 服务端重启选项 -->
        <div class="flex items-center mb-4">
          <div class="mr-2">{{ i18n('If server fails to start, try:', '进入软件时，如果服务端启动失败，可尝试：') }}</div>
          <Button severity="success" icon="pi pi-undo" :label="i18n('Restart Server', '重新启动服务端')" size="small" @click="rebootService" />
        </div>
        
        <!-- 缓存清理选项 -->
        <div class="flex items-center mb-6">
          <div class="mr-2">{{ i18n('If you made some incorrect operations, try:', '若进行了某些错误操作，可尝试：') }}</div>
          <Button severity="warn" icon="pi pi-trash" :label="i18n('Clear Cache', '清空缓存')" size="small" @click="clearAllCache" />
        </div>
        
        <!-- 伪造服务端模式开关 -->
        <div class="flex items-center mb-6">
          <div class=" mr-4">{{ i18n('Mock Server Mode (For Frontend Testing Only)', '伪造服务端模式（仅前端测试时使用）') }}</div>
          <ToggleSwitch v-model="isFakeService"></ToggleSwitch>
        </div>
        
        <!-- 深色模式开关 -->
        <div class="flex items-center mb-6">
          <div class=" mr-4">{{ i18n('Dark Mode', '深色模式') }}</div>
          <ToggleSwitch v-model="isDark"></ToggleSwitch>
        </div>
        
        <!-- 英文界面开关 -->
        <div class="flex items-center mb-6">
          <div class=" mr-4">{{ i18n('Turn off English mode (Only major user interfaces)', ' 打开英文模式（仅主要用户界面）')}}</div>
          <ToggleSwitch v-model="isEnglish"></ToggleSwitch>
        </div>
        
        <!-- Beta 功能开关 -->
        <div class="flex items-center mb-4">
          <div class=" mr-4">Beta</div>
          <ToggleSwitch v-model="isBeta"></ToggleSwitch>
        </div>
        
        <!-- 返回主页按钮 -->
        <div class="flex justify-center items-center mt-2">
          <Button severity="secondary" icon="pi pi-home" :label="i18n('Home', '返回主页')" size="small" @click="router.push('/')" />
        </div>

      </div>
    </div>
  </div>

</template>

<style scoped>

</style>