<script setup lang="ts">
// 导入 ECharts 核心模块
import {use} from 'echarts/core';
// 导入图表类型 - 关系图
import {GraphChart} from 'echarts/charts';
// 导入组件 - 提示框和图例
import {TooltipComponent, LegendComponent} from 'echarts/components';
// 导入布局特性
import {LabelLayout} from 'echarts/features';
// 导入渲染器
import {CanvasRenderer} from 'echarts/renderers';
// 导入类型定义
import type {ComposeOption,} from 'echarts/core';
import type {GraphSeriesOption,} from 'echarts/charts';
import type {
  TooltipComponentOption,
  LegendComponentOption
} from 'echarts/components';
// 导入缓存相关工具函数
import {
  getShouldUpdateChart,  // 获取是否需要更新图表的标志
  getUserLinkCache,      // 获取用户自定义连接的缓存
  loadChartCache,        // 加载图表缓存
  readAllCache,          // 读取所有缓存
  setShouldUpdateChart,  // 设置是否需要更新图表的标志
  updateChartCache      // 更新图表缓存
} from "../utils/cache.ts";
// 导入 Vue 相关功能
import {onMounted, provide, ref} from "vue";
// 导入 Vue-ECharts 组件
import VChart, {THEME_KEY} from 'vue-echarts';
// 导入网络请求相关
import {getNetwork, NetworkRequest, NetworkResponse} from "../apis.ts";
// 导入类型定义
import {Lecture, NodeLink} from "../types.ts";
// 导入路由
import {useRouter} from "vue-router";
// 导入加载组件
import Loading from "../components/Loading.vue";
// 导入跳转工具
import { useJump } from '../utils/useJump.ts';
import { useEnglish } from '../utils/useEnglish.ts';

// 注册必要的 ECharts 组件
use([
  TooltipComponent,
  LegendComponent,
  GraphChart,
  CanvasRenderer,
  LabelLayout
]);

// 根据当前主题提供 ECharts 主题
provide(THEME_KEY, document.documentElement.className.includes('app-dark') ? 'dark' : 'light');

// 定义 ECharts 配置项类型
type EChartsOption = ComposeOption<
  | TooltipComponentOption
  | LegendComponentOption
  | GraphSeriesOption
>;

// 定义响应式数据
const data = ref<NetworkResponse>();        // 存储网络图数据
const chartOptions = ref<any>(null);        // 存储图表配置
const chart = ref<any>();                   // 图表实例引用
const loading = ref(false);                 // 加载状态

// 获取路由实例
const router = useRouter();

// 获取跳转工具实例
const jump = useJump();

// 获取国际化函数
const { i18n } = useEnglish();

// 获取网络数据的函数
const getResponse = async () => {
  // 读取所有缓存的课程数据
  const caches = await readAllCache()
  // 过滤并转换数据格式
  const requests = caches.filter(cache => cache.points && cache.points.length > 0)
    .map(cache => {
      return {
        id: cache.id,
        topic: cache.topic,
        points: cache.points!!.map(point => {
          return {name: point.name, importance: point.importance}
        })
      } as Lecture;
    });
  // 调用API获取网络数据
  return await getNetwork({lectures: requests} as NetworkRequest);
}

// 处理节点点击事件
const handleClick = async (params: any) => {
  if (params?.data?.route) {
    // 如果有具体知识点，跳转到特定知识点
    if (params?.data?.route.point) {
      await jump.jumpToNote(params.data.route.id, params.data.route.point);
    } else {
      // 否则跳转到课程页面
      await jump.jumpToNote(params.data.route.id);
    }
  }
}

// 组件挂载时的初始化
onMounted(async () => {
  // 获取用户自定义的连接
  const userLinks = await getUserLinkCache();
  
  // 检查是否需要更新图表
  if (!await getShouldUpdateChart()) {
    // 不需要更新时，从缓存加载
    chartOptions.value = await loadChartCache();
    // 添加用户自定义连接
    (chartOptions.value.series?.[0]?.links as NodeLink[]).push(...userLinks)
    // 设置图表配置
    chart.value.setOption(chartOptions.value);
    return;
  }

  // 需要更新时，显示加载状态
  loading.value = true;
  // 获取新的网络数据
  data.value = await getResponse();
  
  // 配置图表选项
  chartOptions.value = {
    tooltip: {},  // 提示框配置
    legend: [     // 图例配置
      {
        data: data.value.categories?.map(category => category.name)
      }
    ],
    series: [{    // 系列配置
      name: '节点',
      type: 'graph',    // 图表类型为关系图
      layout: 'force',  // 使用力导向布局
      roam: true,       // 允许缩放和平移
      draggable: true,  // 节点可拖动
      label: {          // 标签配置
        show: true,
        position: 'right'
      },
      // 节点数据配置
      data: data.value.nodes?.map(node => {
        return {
          // id: node.idx,  // 注释掉的ID字段
          name: node.name,
          symbolSize: node.size * 10,  // 节点大小
          category: node.category,      // 节点类别
          value: node.size,            // 节点值
          route: node.route,           // 节点路由信息
        }
      }),
      // 连接线配置
      links: data.value.links?.map(link => {
        return {
          source: link.source,         // 连接起点
          target: link.target,         // 连接终点
          weight: link.weight,         // 连接权重
          value: 5 - link.weight,      // 连接值
          isUserGenerated: false,      // 是否用户生成
          lineStyle: {
            width: link.weight * 2,    // 线条宽度
          }
        }
      }),
      // 类别配置
      categories: data.value.categories?.map(category => {
        return {
          name: category.name,
        }
      }),
      // 力导向布局配置
      force: {
        initLayout: 'circular',  // 初始布局为环形
        repulsion: 500,          // 节点间斥力
        edgeLength: 100,         // 边长度
      }
    }]
  } as EChartsOption;

  // 更新图表缓存
  await updateChartCache(chartOptions.value);
  // 添加用户自定义连接
  (chartOptions.value.series?.[0]?.links as NodeLink[]).push(...userLinks);

  // 设置图表配置
  chart.value.setOption(chartOptions.value);
  // 关闭加载状态
  loading.value = false;
  // 设置图表不需要更新
  await setShouldUpdateChart(false);
});

</script>

<template>
  <div>
    <!-- 加载提示组件 -->
    <Loading v-model="loading" 
      :title="i18n('Generating knowledge network...', '正为您生成知识网络……')" 
      :subtitle="i18n('Processing time depends on the number of your previous lectures.', '耗时将取决于您的历史课程数量，请耐心等待。')"
    ></Loading>
    
    <!-- 图表容器 -->
    <div class="w-full h-screen">
      <v-chart 
        id="chart" 
        ref="chart" 
        @click="handleClick" 
        :options="chartOptions" 
        auto-resize
      />
    </div>
    
    <!-- 返回首页按钮 -->
    <Button 
      class="!fixed !top-4 !left-4" 
      severity="secondary" 
      icon="pi pi-home" 
      rounded 
      @click="router.push('/')"
    ></Button>
  </div>
</template>

<style scoped>
/* 图表样式 */
#chart {
  height: 100vh;
  width: 100%;
  position: relative;
}
</style>