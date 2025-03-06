<script setup lang="ts">
import { useEnglish } from '../utils/useEnglish.ts';

const { i18n } = useEnglish();
</script>

<template>
  <div>
    <h1>{{ i18n('404 Page Not Found', '404 页面未找到') }}</h1>
    <p>{{ i18n('The lecture you are looking for does not exist.', '走丢啦，该课程不存在。') }}</p>
  </div>
</template>

<style scoped>

</style>