<template>
  <div class="flex min-h-screen dark:bg-black/30 bg-gray-50">
    
    <!-- 左侧目录 -->
    <aside class="w-1/5 dark:bg-gray-800 bg-gray-100 text-black dark:text-white m-4 rounded-2xl flex flex-col overflow-hidden">
      <div class="p-6">
        <!-- 大标题 -->
        <h1 class="text-2xl font-bold">{{ org.label }}</h1>
      </div>
      
      <nav class="mt-2 flex-1 px-4">
        <Accordion :multiple="true">
          <AccordionPanel v-for="child in org.children" :key="child.key" :value="child.key">
            <AccordionHeader>
              <div class="font-semibold" @click.stop="handleNodeClick(child.point)">
                <!-- 子标题1 -->
                {{ child.label }}
              </div>
            </AccordionHeader>
            <AccordionContent>
              <div v-for="subChild in child.children" 
                   :key="subChild.key"
                   @click="handleNodeClick(child.point, subChild.subtitle)"
                   class="py-2 px-2 text-sm hover:bg-gray-200 dark:hover:bg-white/10 cursor-pointer rounded transition-colors">
                <!-- 子标题2 -->
                   {{ subChild.label }}
              </div>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </nav>
      <!-- 返回主页按钮 -->
      <div class="p-4">
        <Button severity="secondary" icon="pi pi-home" :label="i18n('Home', '返回主页')" class="w-full"
          :pt="{ root: 'dark:!bg-black/20 dark:hover:!bg-black/50 !bg-white hover:!bg-gray-100 !transition' }"
          @click="router.push('/')"
        ></Button>
      </div>
    </aside>

    <main :class="[
      'flex-1 px-6 pt-6 pb-2 overflow-auto dark:bg-white/2 bg-gray-100/30 m-4 rounded-2xl relative transition-all duration-300',
      { 'mr-[29vw]': showAIChat }
    ]">

    <!-- 路由匹配 -->
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component"/>
        </transition>
      </RouterView>
      
      <!-- AI聊天按钮 -->
      <Button class="!fixed !bottom-6 !right-6" 
              :severity="showAIChat ? 'secondary' : 'primary'"
              :icon="showAIChat ? 'pi pi-times' : 'pi pi-comments'"
              rounded
              size="large"
              :pt="{
                root: 'dark:!bg-indigo-500 dark:hover:!bg-indigo-600 !shadow-lg hover:!shadow-xl !transition-all'
              }"
              @click="handleAIClick"
      />

      <!-- AI 聊天面板 -->
      <div :class="[
        'fixed top-4 bottom-4 w-[calc(30vw-1rem)] bg-white dark:bg-black/20 rounded-2xl shadow-xl transition-all duration-300 backdrop-blur-xl',
        showAIChat ? 'right-4' : '-right-[30vw]'
      ]">
        <div class="flex flex-col h-full p-4">
          <!-- 头部 -->
          <div class="flex justify-between items-center mb-4 dark:text-white">
            <div class="text-lg font-bold">{{ i18n('AI Assistant','AI 助手') }}</div>
            <!-- 关闭按钮 -->
            <Button icon="pi pi-times" 
                    text 
                    severity="secondary" 
                    @click="showAIChat = false"
                    :pt="{
                      root: 'hover:!bg-black/10 dark:hover:!bg-white/10'
                    }"/>
          </div>
          
          <!-- 聊天内容区域-->
          <div class="flex-1 overflow-auto mb-4 dark:text-white">
            <!-- 用户消息 -->
            <div class="flex justify-start mb-4">
              <div class="bg-gray-100 dark:bg-black/40 rounded-lg p-3 max-w-[80%]">
                排列和组合的区别是什么？
              </div>
            </div>
            
            <!-- AI 回复 -->
            <div class="flex justify-end mb-4">
              <div class="bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg p-3 max-w-[80%]">
                <p class="mb-2">  来自知识库 — 排列与组合</p>
                <p class="mb-2">排列和组合是组合数学中的两个基本概念，它们的主要区别在于是否考虑元素的顺序：</p>
                <p class="mb-2">1. 排列(Permutation)：</p>
                <ul class="list-disc list-inside mb-2 ml-4">
                  <li>排列关注的是元素的顺序。</li>
                  <li>从n个不同元素中取出k个元素，按照一定的顺序排列，称为从n个元素中取出k个元素的排列。</li>
                </ul>
                <p class="mb-2">2. 组合(Combination)：</p>
                <ul class="list-disc list-inside ml-4">
                  <li>组合不关注元素的顺序。</li>
                  <li>从n个不同元素中取出k个元素，不考虑顺序，称为从n个元素中取出k个元素的组合。</li>
                </ul>
              </div>
            </div>
          </div>
          
          <!--输入框-->
          <div class="flex gap-2">
            <!-- focus:outline-none 当鼠标点击时取消默认轮廓 -->
            <input type="text" 
                   class="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-black/20 dark:text-white focus:outline-none"
                   :placeholder="i18n('Type your message...','发送消息...')">
            <Button icon="pi pi-send" rounded severity="primary" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { readCache } from '../utils/cache'
import type { Cache, Point } from '../types'
import { Accordion, AccordionPanel, AccordionHeader, AccordionContent } from 'primevue'
import { useJump } from '../utils/useJump'
import { useEnglish } from '../utils/useEnglish'
import Button from 'primevue/button'

const route = useRoute()
const router = useRouter()
const jump = useJump()
const { i18n } = useEnglish()

const id = Number((route.params as { id: string }).id)
const cache = ref<Cache | null>(null)
const points = ref<Point[]>([])
const showAIChat = ref(false)

//overview.vue比葫芦画瓢
const org = computed(() => {
  return {
    key: "root",
    label: cache.value?.topic,
    level: 0,
    children: points.value.map(point => {
      return {
        key: point.name,
        point: point.name,
        label: point.name,
        level: 1,
        children: point?.subtitles?.map(subtitle => {
          return {
            key: subtitle.subtitle,
            point: point.name,
            subtitle: subtitle.subtitle,
            label: subtitle.subtitle,
            level: 2,
          }
        })
      }
    })
  }
})

// 加载数据
onMounted(async () => {
  cache.value = await readCache(id)
  points.value = cache.value?.points || []
})

// 处理点击
const handleNodeClick = (point: string, subtitle?: string) => {
  jump.jumpToNote(id, point, subtitle)
}

const handleAIClick = () => {
  showAIChat.value = !showAIChat.value
}
</script>



<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>