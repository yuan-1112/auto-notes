// 导入必要的 Vue 核心功能和组件
import { createApp } from "vue";
import App from "./App.vue";
// 导入 PrimeIcons 图标样式
import 'primeicons/primeicons.css'
// 导入自定义样式
import './index.css'
// 导入 Vue Router 相关功能
import { createRouter, createWebHistory } from 'vue-router'
// 导入自动生成的路由配置
import { routes } from 'vue-router/auto-routes'
// 导入 PrimeVue UI 框架
import PrimeVue from 'primevue/config';
// 导入需要的 PrimeVue 组件
import {FileUpload, Button, Menu, Toast, ToastEventBus, Accordion, AccordionTab} from "primevue";
// 导入 PrimeVue Aura 主题
import Aura from '@primevue/themes/aura';
import {definePreset} from "@primevue/themes";
// 导入 Toast 服务
import ToastService from 'primevue/toastservice';
// 导入 Markdown 渲染组件
import MarkDown from 'vue3-markdown-it'
// 导入 Tauri 日志插件的 error 函数
import {error} from '@tauri-apps/plugin-log'

// 创建路由实例
const router = createRouter({
    // 使用 HTML5 历史模式
    history: createWebHistory(),
    // 配置滚动行为：当 URL 包含锚点时，滚动到对应元素
    scrollBehavior(to) {
        if (to.hash) {
            return {
                el: to.hash,
            }
        }
    },
    routes, // 使用自动生成的路由配置
})

// 自定义 PrimeVue 主题预设，基于 Aura 主题
//definePreset 实用程序用于在 PrimeVue 设置期间自定义现有预设。第一个参数是要自定义的预设，第二个参数是要覆盖的设计令牌。
const MyPreset = definePreset(Aura, {
    semantic: {
        // 定义主要颜色系列，使用靛蓝色调
        primary: {
            50: '{indigo.50}',
            100: '{indigo.100}',
            200: '{indigo.200}',
            300: '{indigo.300}',
            400: '{indigo.400}',
            500: '{indigo.500}',
            600: '{indigo.600}',
            700: '{indigo.700}',
            800: '{indigo.800}',
            900: '{indigo.900}',
            950: '{indigo.950}'
        }
    }
});

// 创建 Vue 应用实例
const app = createApp(App);

// 配置应用：添加插件和全局组件
app.use(router)
    .use(PrimeVue, {
        theme: {
            preset: MyPreset,
            options: {
                // 配置暗色模式选择器
                darkModeSelector: '.app-dark',
            }
        }
    })
    .use(ToastService)
    .use(MarkDown)
    // 注册全局组件
    .component("FileUpload", FileUpload)
    .component("Toast", Toast)
    .component("Button", Button)
    .component("Menu", Menu)
    .component("Accordion", Accordion)
    .component("AccordionTab", AccordionTab)

// 全局错误处理
app.config.errorHandler = async (err, _, info) => {
    // 在控制台打印错误
    console.error(err, info);
    // 将错误记录到 Tauri 日志
    error(JSON.stringify({err, info}));
    // 显示错误提示 Toast
    await ToastEventBus.emit('add', { 
        severity: "error", 
        summary: "发生错误", 
        detail: (err as { message?: string })?.message || "未知错误，请联系管理员" 
    });
}

// 挂载应用到 DOM
app.mount("#app");