<script setup lang="ts">
/**
 * 笔记编辑组件
 * 
 * 该组件提供笔记编辑功能，包括：
 * - 选择和编辑不同小节的内容
 * - 实时保存编辑内容
 * - 支持Markdown格式编辑
 */

import {computed, ref, watch} from "vue";

// 组件属性定义
const props = defineProps<{
  pointName: string;  // 知识点名称
  subtitles: Subtitle[];  // 小节列表
}>()

// 从路由参数获取笔记ID
const id = Number((useRoute().params as { id: string }).id);

// 定义对话框显示状态的双向绑定
const show = defineModel('show', { type: Boolean, default: false })

import {Dialog, Textarea, SelectButton} from "primevue";
import {Subtitle} from "../types.ts";
import {updatePointCache} from "../utils/cache.ts";
import {useRoute} from "vue-router";

// 计算小节选项列表
const options = computed(() => props.subtitles?.map((subtitle) => subtitle.subtitle) ?? []);
// 当前选中的小节
const currentSelect = ref((options.value[0]) ?? '');
// 当前编辑的Markdown内容
const currentMarkdown = ref(props.subtitles?.find((subtitle) => subtitle.subtitle === currentSelect.value)?.md ?? '');

// 监听选项列表变化，确保选中项始终有效
watch(options, (newVal) => {
  if (!newVal.includes(currentSelect.value)) {
    currentSelect.value = newVal[0] ?? '';
  }
})

// 监听选中项变化，保存旧内容并加载新内容
watch(currentSelect, async (newVal, oldVal) => {
    await saveAndUpdate(oldVal, newVal)
  },
)

/**
 * 保存当前编辑内容并更新显示
 * @param oldVal - 之前选中的小节标题
 * @param newVal - 新选中的小节标题（可选）
 */
const saveAndUpdate = async (oldVal: string, newVal?: string) => {
  // 保存此前更改内容
  const subtitleIndex = props.subtitles?.findIndex((subtitle) => subtitle.subtitle === oldVal);
  if (subtitleIndex === -1) return;
  const subtitles = [...props.subtitles];
  subtitles[subtitleIndex].md = currentMarkdown.value; 
  // 单个subtitle的引用和笔记页的subtitle引用相同，所以可以同步更新

  // 更新缓存
  await updatePointCache(id, props.pointName, { subtitles: subtitles })

  // 更新文本框内容
  if (newVal) {
    currentMarkdown.value = props.subtitles?.find((subtitle) => subtitle.subtitle === newVal)?.md || '';
  }
}

/**
 * 关闭对话框时的处理函数
 * 保存当前编辑内容并关闭对话框
 */
const onClose = async () => {
  await saveAndUpdate(currentSelect.value);
  show.value = false;
}

</script>

<template>
  <!-- 编辑笔记对话框 -->
  <Dialog v-model:visible="show" modal :style="{ width: '75%' }" header="编辑笔记" @hide="onClose"
          :pt="{header: '!pb-0'}"
  >
    <!-- 小节选择按钮组 -->
    <div class="flex justify-center items-center mb-6">
      <SelectButton :allow-empty="false" v-model="currentSelect" :options="options" />
    </div>

    <!-- Markdown编辑区域 -->
    <div class="flex justify-center items-center">
      <Textarea v-model="currentMarkdown" :rows="15" :cols="50" />
    </div>

  </Dialog>
</template>

<style scoped>

</style>